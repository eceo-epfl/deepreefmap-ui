import { useEffect, useMemo, useRef, useState } from 'react';
import { useDataProvider, useRecordContext } from 'react-admin';
import {
    Alert,
    LinearProgress,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';

import { useRunArtifactObject } from '../archive/useRunArtifactObject';
import { useClassRegistry } from '../cover/useClassGroups';
import type { RunRecord } from '../contract';
import type { DrmDataProvider } from '../dataProvider';
import { formatBytes } from '../videos/VideoFields';
import LensImage from './LensImage';
import { readNpzMember } from './npz';

const PHOTO_RELPATH = 'ortho.png';
const GRID_RELPATH = 'ortho.npz';
const FALLBACK = '#9e9e9e';

type Layer = 'classes' | 'photo';

type Load<T> =
    | { name: 'loading'; received: number }
    | { name: 'ready'; value: T }
    | { name: 'error'; message: string };

const Muted = ({ children }: { children: string }) => (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {children}
    </Typography>
);

const message = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

/** Fetch an archived object's bytes, reporting progress as they arrive. */
const useArtifactBytes = (objectId: string | undefined) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [load, setLoad] = useState<Load<ArrayBuffer>>({ name: 'loading', received: 0 });

    useEffect(() => {
        if (!objectId) return;
        let alive = true;
        const run = async () => {
            try {
                const { url } = await dataProvider.archiveDownload(objectId);
                const response = await fetch(url);
                if (!response.ok) throw new Error(`The fetch answered ${response.status}.`);
                const reader = response.body?.getReader();
                if (!reader) {
                    const value = await response.arrayBuffer();
                    if (alive) setLoad({ name: 'ready', value });
                    return;
                }
                const chunks: Uint8Array[] = [];
                let received = 0;
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (!alive) return reader.cancel();
                    chunks.push(value);
                    received += value.byteLength;
                    setLoad({ name: 'loading', received });
                }
                const merged = new Uint8Array(received);
                let at = 0;
                for (const chunk of chunks) {
                    merged.set(chunk, at);
                    at += chunk.byteLength;
                }
                if (alive) setLoad({ name: 'ready', value: merged.buffer });
            } catch (error) {
                if (alive) {
                    setLoad({ name: 'error', message: message(error, 'The fetch failed.') });
                }
            }
        };
        run();
        return () => {
            alive = false;
        };
    }, [dataProvider, objectId]);

    return load;
};

type Grid = { labels: ArrayLike<number>; width: number; height: number };

/** The run's label grid, as `ortho.npz` records it. */
const useLabelGrid = (objectId: string | undefined) => {
    const bytes = useArtifactBytes(objectId);
    const [load, setLoad] = useState<Load<Grid>>({ name: 'loading', received: 0 });

    useEffect(() => {
        if (bytes.name === 'loading') {
            setLoad({ name: 'loading', received: bytes.received });
            return;
        }
        if (bytes.name === 'error') {
            setLoad({ name: 'error', message: bytes.message });
            return;
        }
        let alive = true;
        readNpzMember(bytes.value, 'labels')
            .then(({ data, shape }) => {
                if (!alive) return;
                if (shape.length !== 2) throw new Error('The label grid is not a raster.');
                setLoad({
                    name: 'ready',
                    value: {
                        labels: data as unknown as ArrayLike<number>,
                        height: shape[0],
                        width: shape[1],
                    },
                });
            })
            .catch(error => {
                if (alive) {
                    setLoad({
                        name: 'error',
                        message: message(error, 'The label grid could not be read.'),
                    });
                }
            });
        return () => {
            alive = false;
        };
    }, [bytes]);

    return load;
};

const parseHex = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
];

/** Paint the label grid in the group colours of the level on show. */
const useClassCanvas = (grid: Grid | undefined, level: string) => {
    const registry = useClassRegistry(level);
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
    const { colours, groupOf } = registry;

    return useMemo(() => {
        if (!grid || !registry.ready) return null;
        const canvas = canvasRef.current;
        canvas.width = grid.width;
        canvas.height = grid.height;
        const context = canvas.getContext('2d');
        if (!context) return null;
        const image = context.createImageData(grid.width, grid.height);
        // One palette entry per label id, so the paint is a lookup per cell.
        const palette = new Map<number, [number, number, number, number]>();
        const colourFor = (id: number): [number, number, number, number] => {
            const known = palette.get(id);
            if (known) return known;
            const group = groupOf(id);
            const hex = group ? (colours.get(group) ?? FALLBACK) : FALLBACK;
            const entry: [number, number, number, number] = [...parseHex(hex), 255];
            palette.set(id, entry);
            return entry;
        };
        for (let index = 0; index < grid.labels.length; index += 1) {
            const id = grid.labels[index];
            // Zero is a cell no point landed in, left transparent.
            if (id === 0) continue;
            const [r, g, b, a] = colourFor(id);
            const at = index * 4;
            image.data[at] = r;
            image.data[at + 1] = g;
            image.data[at + 2] = b;
            image.data[at + 3] = a;
        }
        context.putImageData(image, 0, 0);
        return canvas;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grid, level, registry.ready]);
};

const usePhoto = (objectId: string | undefined) => {
    const bytes = useArtifactBytes(objectId);
    const [image, setImage] = useState<HTMLImageElement>();

    useEffect(() => {
        if (bytes.name !== 'ready') return;
        const url = URL.createObjectURL(new Blob([bytes.value]));
        const element = new Image();
        element.onload = () => setImage(element);
        element.src = url;
        return () => URL.revokeObjectURL(url);
    }, [bytes]);

    return { image, bytes };
};

const LayerToggle = ({
    value,
    onChange,
    has,
}: {
    value: Layer;
    onChange: (layer: Layer) => void;
    has: (layer: Layer) => boolean;
}) => (
    <ToggleButtonGroup
        size="small"
        exclusive
        value={value}
        onChange={(_, next) => next && onChange(next as Layer)}
    >
        <ToggleButton value="classes" disabled={!has('classes')}>
            classes
        </ToggleButton>
        <ToggleButton value="photo" disabled={!has('photo')}>
            photo
        </ToggleButton>
    </ToggleButtonGroup>
);

/**
 * The run's ortho: classes first, the photo behind a switch.
 *
 * Both layers are the same raster at the same scale, so the toggle is a
 * comparison rather than two separate figures.
 */
const OrthoView = ({ level }: { level: string }) => {
    const record = useRecordContext<RunRecord>();
    const photoState = useRunArtifactObject(record?.id, PHOTO_RELPATH);
    const gridState = useRunArtifactObject(record?.id, GRID_RELPATH);
    const registry = useClassRegistry(level);
    const [layer, setLayer] = useState<Layer>('classes');
    // Each layer is a separate download, so only the ones asked for are fetched.
    const [opened, setOpened] = useState<Layer[]>(['classes']);

    const has = (candidate: Layer) =>
        (candidate === 'photo' ? photoState : gridState).name === 'ready';
    const showing: Layer = has(layer) ? layer : has('classes') ? 'classes' : 'photo';

    const { image, bytes: photoBytes } = usePhoto(
        opened.includes('photo') && photoState.name === 'ready'
            ? photoState.objectId
            : undefined,
    );
    const gridLoad = useLabelGrid(
        opened.includes('classes') && gridState.name === 'ready'
            ? gridState.objectId
            : undefined,
    );
    const grid = gridLoad.name === 'ready' ? gridLoad.value : undefined;
    const classCanvas = useClassCanvas(grid, level);

    const open = (next: Layer) => {
        setLayer(next);
        setOpened(current => (current.includes(next) ? current : [...current, next]));
    };

    const readout = (x: number, y: number) => {
        if (!grid || x < 0 || y < 0 || x >= grid.width || y >= grid.height) return null;
        const id = grid.labels[y * grid.width + x];
        if (!id) return 'no data';
        const entry = registry.classOf(id);
        const group = registry.groupOf(id);
        if (!entry) return `class ${id}`;
        return group && group !== entry.name ? `${entry.name}, ${group}` : entry.name;
    };

    if (photoState.name === 'error')
        return <Alert severity="error">{photoState.message}</Alert>;
    if (photoState.name !== 'ready' && gridState.name !== 'ready') {
        if (photoState.name === 'pending') return <LinearProgress />;
        return <Muted>The ortho appears once the desktop app archives the run.</Muted>;
    }

    const photo = showing === 'photo';
    const source = photo ? (image ?? null) : classCanvas;
    const width = photo ? (image?.naturalWidth ?? 0) : (grid?.width ?? 0);
    const height = photo ? (image?.naturalHeight ?? 0) : (grid?.height ?? 0);
    const load: Load<unknown> = photo
        ? image
            ? { name: 'ready', value: image }
            : photoBytes
        : gridLoad;

    return (
        <Stack spacing={1}>
            <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
                <LayerToggle value={showing} onChange={open} has={has} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {load.name === 'loading' ? formatBytes(load.received) : 'hover to magnify'}
                </Typography>
            </Stack>
            {load.name === 'loading' && <LinearProgress />}
            {load.name === 'error' ? (
                <Alert severity="error">{load.message}</Alert>
            ) : (
                <LensImage
                    source={source}
                    width={width}
                    height={height}
                    readout={photo ? undefined : readout}
                />
            )}
        </Stack>
    );
};

export default OrthoView;
