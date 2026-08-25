import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Slider,
    Stack,
    Switch,
    Tooltip,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import type { DrmwCloud } from './drmw';

// The cloud's RGB bytes are sRGB. Pass-through rendering keeps them exact.
THREE.ColorManagement.enabled = false;

const START_COLOUR = 0x4caf50;
const END_COLOUR = 0xff5252;
const PIVOT_COLOUR = 0xffc400;
const FRUSTUM_COLOUR = 0x64b5f6;
const MAX_FRUSTUMS = 60;

type ClassEntry = {
    points: THREE.Points;
    material: THREE.PointsMaterial;
    colour: THREE.Color;
    prefixEnd: number[];
    pointCount: number;
    name: string;
};

type Selection = { classId: number; name: string; colour: string };

type SceneHandle = {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    byClass: Map<number, ClassEntry>;
    pivot: THREE.Object3D;
    marker: THREE.Object3D;
    cameras: THREE.Object3D | null;
    baseSize: number;
    render: () => void;
};

const swatch = (colour: [number, number, number]) => `rgb(${colour.join(', ')})`;

/** Mean of the points a class gained on one frame, or null where it gained none. */
const centroidAt = (
    entry: ClassEntry,
    from: number,
    to: number,
    positions: THREE.BufferAttribute,
): THREE.Vector3 | null => {
    if (to <= from) return null;
    const sum = new THREE.Vector3();
    for (let index = from; index < to; index += 1) {
        sum.x += positions.getX(index);
        sum.y += positions.getY(index);
        sum.z += positions.getZ(index);
    }
    return sum.divideScalar(to - from);
};

/** Where the pass began and ended: the points the first and last frames added. */
const endpoints = (byClass: Map<number, ClassEntry>, frameCount: number) => {
    const average = (pick: (entry: ClassEntry) => THREE.Vector3 | null) => {
        const sum = new THREE.Vector3();
        let found = 0;
        for (const entry of byClass.values()) {
            const point = pick(entry);
            if (point) {
                sum.add(point);
                found += 1;
            }
        }
        return found > 0 ? sum.divideScalar(found) : null;
    };
    const positionsOf = (entry: ClassEntry) =>
        entry.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const start = average(entry =>
        centroidAt(entry, 0, entry.prefixEnd[0] ?? 0, positionsOf(entry)),
    );
    const last = frameCount - 1;
    const end = average(entry =>
        centroidAt(
            entry,
            entry.prefixEnd[last - 1] ?? 0,
            entry.prefixEnd[last] ?? entry.pointCount,
            positionsOf(entry),
        ),
    );
    return { start, end };
};

/**
 * The three axes the cloud actually lies along, longest first.
 *
 * A transect is a long thin sheet at whatever angle the dive happened to hold,
 * so the world axes rarely describe it. Power iteration on the covariance of a
 * sample is enough to recover them, and it costs one pass over that sample.
 */
const principalAxes = (xyz: Float32Array, centre: THREE.Vector3): THREE.Vector3[] => {
    const points = xyz.length / 3;
    const stride = Math.max(1, Math.floor(points / 20000));
    const covariance = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let taken = 0;
    for (let index = 0; index < points; index += stride) {
        const d = [
            xyz[index * 3] - centre.x,
            xyz[index * 3 + 1] - centre.y,
            xyz[index * 3 + 2] - centre.z,
        ];
        for (let row = 0; row < 3; row += 1) {
            for (let column = 0; column < 3; column += 1) {
                covariance[row * 3 + column] += d[row] * d[column];
            }
        }
        taken += 1;
    }
    if (taken < 3) return [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)];
    const apply = (vector: THREE.Vector3) =>
        new THREE.Vector3(
            covariance[0] * vector.x + covariance[1] * vector.y + covariance[2] * vector.z,
            covariance[3] * vector.x + covariance[4] * vector.y + covariance[5] * vector.z,
            covariance[6] * vector.x + covariance[7] * vector.y + covariance[8] * vector.z,
        );
    const dominant = (seed: THREE.Vector3, orthogonalTo?: THREE.Vector3) => {
        let vector = seed.clone().normalize();
        for (let step = 0; step < 24; step += 1) {
            let next = apply(vector);
            if (orthogonalTo) next.addScaledVector(orthogonalTo, -next.dot(orthogonalTo));
            if (next.lengthSq() < 1e-12) return vector;
            next = next.normalize();
            vector = next;
        }
        return vector;
    };
    const first = dominant(new THREE.Vector3(1, 0.3, 0.1));
    const second = dominant(new THREE.Vector3(0.1, 1, 0.3), first);
    return [first, second];
};

const marker = (colour: number, radius: number) =>
    new THREE.Mesh(
        new THREE.OctahedronGeometry(radius),
        new THREE.MeshBasicMaterial({ color: colour, depthTest: false, transparent: true }),
    );

/** A crosshair at the point the orbit turns around. */
const crosshair = (radius: number) => {
    const points: number[] = [];
    for (const axis of [0, 1, 2]) {
        const a = [0, 0, 0];
        const b = [0, 0, 0];
        a[axis] = -radius;
        b[axis] = radius;
        points.push(...a, ...b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
            color: PIVOT_COLOUR,
            depthTest: false,
            transparent: true,
        }),
    );
};

/** One wireframe pyramid per camera pose, along the path the diver swam. */
const frustums = (cloud: DrmwCloud, scale: number): THREE.Object3D | null => {
    const poses = cloud.cameraPoses;
    const intrinsics = cloud.header.cameras;
    if (!poses || !intrinsics) return null;
    const count = poses.length / 16;
    if (count === 0) return null;
    const { fx, fy, cx, cy, width, height } = intrinsics;
    // The image corners at unit depth, so the pyramid matches the lens.
    const corner = (px: number, py: number) => [(px - cx) / fx, (py - cy) / fy, 1];
    const corners = [
        corner(0, 0),
        corner(width, 0),
        corner(width, height),
        corner(0, height),
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z).multiplyScalar(scale));
    const group = new THREE.Group();
    const step = Math.max(1, Math.ceil(count / MAX_FRUSTUMS));
    const material = new THREE.LineBasicMaterial({ color: FRUSTUM_COLOUR });
    const path: number[] = [];
    const matrix = new THREE.Matrix4();
    const origin = new THREE.Vector3();
    for (let index = 0; index < count; index += 1) {
        matrix.fromArray(poses, index * 16).transpose();
        origin.setFromMatrixPosition(matrix);
        path.push(origin.x, origin.y, origin.z);
        if (index % step !== 0) continue;
        const vertices: number[] = [];
        const world = corners.map(point => point.clone().applyMatrix4(matrix));
        for (const point of world) {
            vertices.push(origin.x, origin.y, origin.z, point.x, point.y, point.z);
        }
        for (let side = 0; side < 4; side += 1) {
            const from = world[side];
            const to = world[(side + 1) % 4];
            vertices.push(from.x, from.y, from.z, to.x, to.y, to.z);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        group.add(new THREE.LineSegments(geometry, material));
    }
    const trail = new THREE.BufferGeometry();
    trail.setAttribute('position', new THREE.Float32BufferAttribute(path, 3));
    group.add(new THREE.Line(trail, new THREE.LineBasicMaterial({ color: FRUSTUM_COLOUR })));
    return group;
};

const CloudViewer = ({ cloud }: { cloud: DrmwCloud }) => {
    const theme = useTheme();
    const mountRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<SceneHandle | null>(null);
    const [contextLost, setContextLost] = useState(false);
    const [colourByClass, setColourByClass] = useState(true);
    const [hidden, setHidden] = useState<Set<number>>(() => new Set());
    const [frame, setFrame] = useState(cloud.header.frame_count - 1);
    const [sizeScale, setSizeScale] = useState(1);
    const [showCameras, setShowCameras] = useState(false);
    const [selected, setSelected] = useState<Selection | null>(null);

    const counts = [...cloud.header.per_class]
        .map(entry => ({
            id: entry.class_id,
            count: entry.point_count,
            name:
                cloud.header.classes.find(candidate => candidate.id === entry.class_id)
                    ?.name ?? `class ${entry.class_id}`,
            colour:
                cloud.header.classes.find(candidate => candidate.id === entry.class_id)
                    ?.colour ?? ([128, 128, 128] as [number, number, number]),
        }))
        .filter(entry => entry.count > 0)
        .sort((left, right) => right.count - left.count);

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
            points.userData.classId = perClass.class_id;
            scene.add(points);
            const declared = classTable.get(perClass.class_id);
            const colour = declared?.colour ?? [128, 128, 128];
            byClass.set(perClass.class_id, {
                points,
                material,
                colour: new THREE.Color(colour[0] / 255, colour[1] / 255, colour[2] / 255),
                prefixEnd: perClass.prefix_end,
                pointCount: perClass.point_count,
                name: declared?.name ?? `class ${perClass.class_id}`,
            });
        }

        const centre = bounds.getCenter(new THREE.Vector3());
        const sphere = bounds.getBoundingSphere(new THREE.Sphere());
        const radius = Math.max(sphere.radius, 0.1);
        camera.near = radius / 100;
        camera.far = radius * 100;

        // Looking down the cloud's thinnest axis, with its longest across the
        // screen, is the view that fills the frame.
        const [along, up] = principalAxes(cloud.xyz, centre);
        const facing = new THREE.Vector3().crossVectors(along, up).normalize();
        const extent = bounds.getSize(new THREE.Vector3());
        const half = (axis: THREE.Vector3) =>
            (Math.abs(extent.x * axis.x) +
                Math.abs(extent.y * axis.y) +
                Math.abs(extent.z * axis.z)) /
            2;
        const halfAcross = half(along);
        const halfUp = half(up);
        const frame = () => {
            const tangent = Math.tan((camera.fov * Math.PI) / 360);
            const distance =
                Math.max(
                    halfUp / tangent,
                    halfAcross / (tangent * Math.max(camera.aspect, 0.1)),
                    radius / 4,
                ) * 1.15;
            camera.position.copy(centre).addScaledVector(facing, distance);
            camera.up.copy(up);
            camera.lookAt(centre);
            camera.updateProjectionMatrix();
        };
        frame();

        const render = () => renderer.render(scene, camera);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.copy(centre);
        controls.update();

        const pivot = crosshair(radius / 12);
        pivot.visible = false;
        pivot.renderOrder = 2;
        scene.add(pivot);

        const { start, end } = endpoints(byClass, cloud.header.frame_count);
        const ends = new THREE.Group();
        if (start) {
            const mesh = marker(START_COLOUR, radius / 25);
            mesh.position.copy(start);
            ends.add(mesh);
        }
        if (end) {
            const mesh = marker(END_COLOUR, radius / 25);
            mesh.position.copy(end);
            ends.add(mesh);
        }
        ends.renderOrder = 2;
        scene.add(ends);

        const path = frustums(cloud, radius / 8);
        if (path) {
            path.visible = false;
            scene.add(path);
        }

        controls.addEventListener('change', () => {
            pivot.position.copy(controls.target);
            render();
        });
        controls.addEventListener('start', () => {
            pivot.visible = true;
            render();
        });
        controls.addEventListener('end', () => {
            pivot.visible = false;
            render();
        });

        let framed = false;
        const resize = () => {
            const width = mount.clientWidth;
            const height = mount.clientHeight;
            if (width === 0 || height === 0) return;
            // The canvas is sized by CSS, so the observed box drives the buffer
            // rather than the buffer holding the box open.
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            // The opening view depends on the aspect, so it waits for the first
            // real box. Later resizes leave the camera where the reader put it.
            if (!framed) {
                framed = true;
                frame();
                controls.update();
            }
            render();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(mount);
        const onLost = (event: Event) => {
            event.preventDefault();
            setContextLost(true);
        };
        renderer.domElement.addEventListener('webglcontextlost', onLost);
        Object.assign(renderer.domElement.style, {
            display: 'block',
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
        });
        mount.appendChild(renderer.domElement);
        resize();
        handleRef.current = {
            scene,
            camera,
            controls,
            byClass,
            pivot,
            marker: ends,
            cameras: path,
            baseSize: radius / 200,
            render,
        };

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
        if (handle.cameras) handle.cameras.visible = showCameras;
        handle.render();
    }, [cloud, theme, colourByClass, hidden, frame, sizeScale, showCameras]);

    /** Nearest drawn point under the pointer, and the class it belongs to. */
    const pick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        const handle = handleRef.current;
        const mount = mountRef.current;
        if (!handle || !mount) return null;
        const box = mount.getBoundingClientRect();
        const pointer = new THREE.Vector2(
            ((event.clientX - box.left) / box.width) * 2 - 1,
            -((event.clientY - box.top) / box.height) * 2 + 1,
        );
        const raycaster = new THREE.Raycaster();
        raycaster.params.Points.threshold = handle.baseSize * 4;
        raycaster.setFromCamera(pointer, handle.camera);
        const drawn = [...handle.byClass.values()]
            .filter(entry => entry.points.visible)
            .map(entry => entry.points);
        return raycaster.intersectObjects(drawn, false)[0] ?? null;
    }, []);

    // Orbiting ends in a click event; only a pointer that stayed put selects.
    const downRef = useRef<{ x: number; y: number } | null>(null);
    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        downRef.current = { x: event.clientX, y: event.clientY };
    };

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const down = downRef.current;
        if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 4) return;
        const hit = pick(event);
        const handle = handleRef.current;
        if (!hit || !handle) {
            setSelected(null);
            return;
        }
        const classId = hit.object.userData.classId as number;
        const entry = handle.byClass.get(classId);
        setSelected({
            classId,
            name: entry?.name ?? `class ${classId}`,
            colour: `#${(entry?.colour ?? new THREE.Color(0x808080)).getHexString()}`,
        });
    };

    const onDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const hit = pick(event);
        const handle = handleRef.current;
        if (!hit?.point || !handle) return;
        handle.controls.target.copy(hit.point);
        handle.controls.update();
        handle.pivot.position.copy(hit.point);
        handle.render();
    };

    const toggleClass = (classId: number) =>
        setHidden(current => {
            const next = new Set(current);
            if (next.has(classId)) next.delete(classId);
            else next.add(classId);
            return next;
        });

    const isolate = (classId: number) =>
        setHidden(new Set(counts.map(entry => entry.id).filter(id => id !== classId)));

    if (contextLost) {
        return (
            <Alert severity="error">
                WebGL context lost. Close other 3D tabs and reopen this section.
            </Alert>
        );
    }
    return (
        <Stack spacing={1.5} sx={{ width: '100%' }}>
            <Box
                ref={mountRef}
                onPointerDown={onPointerDown}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                sx={{ position: 'relative', width: '100%', height: 480, overflow: 'hidden' }}
            />
            <Stack
                direction="row"
                spacing={2}
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
                    label={<Typography variant="body2">Classes</Typography>}
                />
                {cloud.cameraPoses && (
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={showCameras}
                                onChange={(_, checked) => setShowCameras(checked)}
                            />
                        }
                        label={<Typography variant="body2">Cameras</Typography>}
                    />
                )}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: 200 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        Size
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
                <Legend colour={`#${START_COLOUR.toString(16).padStart(6, '0')}`}>
                    start
                </Legend>
                <Legend colour={`#${END_COLOUR.toString(16).padStart(6, '0')}`}>end</Legend>
                <Tooltip title="Drag to orbit the crosshair, double click a point to move it there.">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {cloud.header.point_count.toLocaleString()} points
                    </Typography>
                </Tooltip>
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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minHeight: 32 }}>
                {selected ? (
                    <>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '2px',
                                bgcolor: selected.colour,
                            }}
                        />
                        <Typography variant="body2">{selected.name}</Typography>
                        <Button size="small" onClick={() => isolate(selected.classId)}>
                            Isolate
                        </Button>
                        <Button size="small" onClick={() => setHidden(new Set())}>
                            Show all
                        </Button>
                    </>
                ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Click a point to name its class.
                    </Typography>
                )}
            </Stack>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    columnGap: 2,
                }}
            >
                {counts.map(entry => (
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
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'center', width: '100%' }}
                            >
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '2px',
                                        flexShrink: 0,
                                        bgcolor: swatch(entry.colour),
                                    }}
                                />
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    {entry.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {entry.count.toLocaleString()}
                                </Typography>
                            </Stack>
                        }
                        sx={{
                            mr: 0,
                            '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 },
                        }}
                    />
                ))}
            </Box>
        </Stack>
    );
};

const Legend = ({ colour, children }: { colour: string; children: string }) => (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colour }} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {children}
        </Typography>
    </Stack>
);

export default CloudViewer;
