import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Checkbox,
    FormControlLabel,
    Slider,
    Stack,
    Switch,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import type { DrmwCloud } from './drmw';

// The cloud's RGB bytes are sRGB. Pass-through rendering keeps them exact rather
// than letting three's colour management brighten them on the way out.
THREE.ColorManagement.enabled = false;

type ClassEntry = {
    points: THREE.Points;
    material: THREE.PointsMaterial;
    colour: THREE.Color;
    prefixEnd: number[];
    pointCount: number;
};

type SceneHandle = {
    scene: THREE.Scene;
    byClass: Map<number, ClassEntry>;
    baseSize: number;
    render: () => void;
};

const swatch = (colour: [number, number, number]) => `rgb(${colour.join(', ')})`;

const CloudViewer = ({ cloud }: { cloud: DrmwCloud }) => {
    const theme = useTheme();
    const mountRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<SceneHandle | null>(null);
    const [contextLost, setContextLost] = useState(false);
    const [colourByClass, setColourByClass] = useState(false);
    const [hidden, setHidden] = useState<Set<number>>(() => new Set());
    const [frame, setFrame] = useState(cloud.header.frame_count - 1);
    const [sizeScale, setSizeScale] = useState(1);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        renderer.setPixelRatio(window.devicePixelRatio);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 1000);
        const byClass = new Map<number, ClassEntry>();
        const bounds = new THREE.Box3();
        const classTable = new Map(cloud.header.classes.map(entry => [entry.id, entry]));
        for (const perClass of cloud.header.per_class) {
            const begin = perClass.point_offset * 3;
            const end = begin + perClass.point_count * 3;
            // Subarray views over the fetched buffer, so nothing is copied.
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(cloud.xyz.subarray(begin, end), 3),
            );
            geometry.setAttribute(
                'color',
                new THREE.BufferAttribute(cloud.rgb.subarray(begin, end), 3, true),
            );
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
            if (perClass.point_count > 0 && geometry.boundingBox) {
                bounds.union(geometry.boundingBox);
            }
            const material = new THREE.PointsMaterial({
                vertexColors: true,
                sizeAttenuation: true,
            });
            const points = new THREE.Points(geometry, material);
            scene.add(points);
            const declared = classTable.get(perClass.class_id)?.colour ?? [128, 128, 128];
            byClass.set(perClass.class_id, {
                points,
                material,
                colour: new THREE.Color(
                    declared[0] / 255,
                    declared[1] / 255,
                    declared[2] / 255,
                ),
                prefixEnd: perClass.prefix_end,
                pointCount: perClass.point_count,
            });
        }

        const centre = bounds.getCenter(new THREE.Vector3());
        const sphere = bounds.getBoundingSphere(new THREE.Sphere());
        const radius = Math.max(sphere.radius, 0.1);
        camera.near = radius / 100;
        camera.far = radius * 100;
        const distance = (radius / Math.tan((camera.fov * Math.PI) / 360)) * 1.2;
        camera.position.set(centre.x, centre.y, centre.z + distance);
        camera.updateProjectionMatrix();

        const render = () => renderer.render(scene, camera);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.copy(centre);
        controls.update();
        controls.addEventListener('change', render);

        const resize = () => {
            renderer.setSize(mount.clientWidth, mount.clientHeight);
            camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
            camera.updateProjectionMatrix();
            render();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(mount);
        const onLost = (event: Event) => {
            event.preventDefault();
            setContextLost(true);
        };
        renderer.domElement.addEventListener('webglcontextlost', onLost);
        mount.appendChild(renderer.domElement);
        resize();
        handleRef.current = { scene, byClass, baseSize: radius / 200, render };

        return () => {
            handleRef.current = null;
            observer.disconnect();
            controls.dispose();
            renderer.domElement.removeEventListener('webglcontextlost', onLost);
            for (const entry of byClass.values()) {
                entry.points.geometry.dispose();
                entry.material.dispose();
            }
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, [cloud]);

    useEffect(() => {
        const handle = handleRef.current;
        if (!handle) return;
        handle.scene.background = new THREE.Color(theme.palette.background.default);
        for (const [classId, entry] of handle.byClass) {
            entry.points.visible = !hidden.has(classId);
            // Swapping vertexColors recompiles the shader, hence needsUpdate.
            entry.material.vertexColors = !colourByClass;
            entry.material.color.set(colourByClass ? entry.colour : 0xffffff);
            entry.material.size = handle.baseSize * sizeScale;
            entry.material.needsUpdate = true;
            entry.points.geometry.setDrawRange(0, entry.prefixEnd[frame] ?? entry.pointCount);
        }
        handle.render();
    }, [cloud, theme, colourByClass, hidden, frame, sizeScale]);

    const toggleClass = (classId: number) =>
        setHidden(current => {
            const next = new Set(current);
            if (next.has(classId)) next.delete(classId);
            else next.add(classId);
            return next;
        });

    if (contextLost) {
        return (
            <Alert severity="error">
                The browser dropped the WebGL context, usually under GPU memory pressure. Close
                other 3D tabs and reopen this section.
            </Alert>
        );
    }
    return (
        <Stack spacing={1.5}>
            <Box ref={mountRef} sx={{ height: 480, '& canvas': { display: 'block' } }} />
            <Stack
                direction="row"
                spacing={3}
                sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}
            >
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            checked={colourByClass}
                            onChange={(_, checked) => setColourByClass(checked)}
                        />
                    }
                    label={<Typography variant="body2">Colour by class</Typography>}
                />
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: 220 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        Point size
                    </Typography>
                    <Slider
                        size="small"
                        min={0.25}
                        max={4}
                        step={0.05}
                        value={sizeScale}
                        onChange={(_, value) => setSizeScale(value as number)}
                    />
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {cloud.header.point_count.toLocaleString()} points
                </Typography>
            </Stack>
            {cloud.header.frame_count > 1 && (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        Timeline
                    </Typography>
                    <Slider
                        size="small"
                        min={0}
                        max={cloud.header.frame_count - 1}
                        step={1}
                        value={frame}
                        onChange={(_, value) => setFrame(value as number)}
                        valueLabelDisplay="auto"
                    />
                </Stack>
            )}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    columnGap: 2,
                }}
            >
                {cloud.header.classes.map(entry => (
                    <FormControlLabel
                        key={entry.id}
                        control={
                            <Checkbox
                                size="small"
                                checked={!hidden.has(entry.id)}
                                onChange={() => toggleClass(entry.id)}
                            />
                        }
                        label={
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '2px',
                                        bgcolor: swatch(entry.colour),
                                    }}
                                />
                                <Typography variant="body2">{entry.name}</Typography>
                            </Stack>
                        }
                    />
                ))}
            </Box>
        </Stack>
    );
};

export default CloudViewer;
