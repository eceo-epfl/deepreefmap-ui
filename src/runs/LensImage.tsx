import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';

const LENS = 168;
const ZOOM = 6;
const GAP = 16;

type Probe = { x: number; y: number; readout: ReactNode };

/**
 * One raster drawn to fit its column, with a magnifier under the pointer.
 *
 * The lens reads from the source at native resolution, so an ortho far wider
 * than the column is still inspectable without a separate viewer.
 */
const LensImage = ({
    source,
    width,
    height,
    maxHeight = 420,
    readout,
    background = '#000',
}: {
    source: CanvasImageSource | null;
    width: number;
    height: number;
    maxHeight?: number;
    /** What the pixel under the pointer is, shown beside the lens. */
    readout?: (x: number, y: number) => ReactNode;
    background?: string;
}) => {
    const frameRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lensRef = useRef<HTMLCanvasElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [probe, setProbe] = useState<Probe | null>(null);

    const paint = useCallback(() => {
        const frame = frameRef.current;
        const canvas = canvasRef.current;
        if (!frame || !canvas || !source || width === 0 || height === 0) return;
        const drawWidth = Math.min(frame.clientWidth, (maxHeight * width) / height);
        const drawHeight = (drawWidth * height) / width;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(drawWidth * ratio);
        canvas.height = Math.round(drawHeight * ratio);
        canvas.style.width = `${drawWidth}px`;
        canvas.style.height = `${drawHeight}px`;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.imageSmoothingEnabled = false;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
    }, [source, width, height, maxHeight]);

    useEffect(() => {
        paint();
        const frame = frameRef.current;
        if (!frame) return;
        const observer = new ResizeObserver(paint);
        observer.observe(frame);
        return () => observer.disconnect();
    }, [paint]);

    const onMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const lens = lensRef.current;
        if (!canvas || !lens || !source) return;
        const box = canvas.getBoundingClientRect();
        const fx = (event.clientX - box.left) / box.width;
        const fy = (event.clientY - box.top) / box.height;
        const sx = Math.floor(fx * width);
        const sy = Math.floor(fy * height);
        const span = LENS / ZOOM;
        const context = lens.getContext('2d');
        if (context) {
            context.imageSmoothingEnabled = false;
            context.clearRect(0, 0, LENS, LENS);
            context.drawImage(
                source,
                sx - span / 2,
                sy - span / 2,
                span,
                span,
                0,
                0,
                LENS,
                LENS,
            );
        }
        // The lens sits inside a card that clips it, so it is kept whole: to the
        // left of the pointer near the right edge, below it near the top.
        const at = { x: event.clientX - box.left, y: event.clientY - box.top };
        const lensBox = boxRef.current?.getBoundingClientRect();
        const lensWidth = lensBox?.width ?? LENS;
        const lensHeight = lensBox?.height ?? LENS;
        const frame = frameRef.current;
        const room = frame ? frame.clientWidth : box.width;
        setProbe({
            x: Math.max(0, Math.min(at.x + GAP, room - lensWidth)),
            y: at.y - lensHeight - GAP < 0 ? at.y + GAP : at.y - lensHeight - GAP,
            readout: readout?.(sx, sy),
        });
    };

    return (
        <Box ref={frameRef} sx={{ position: 'relative', width: '100%', lineHeight: 0 }}>
            <canvas
                ref={canvasRef}
                onMouseMove={onMove}
                onMouseLeave={() => setProbe(null)}
                style={{
                    display: 'block',
                    borderRadius: 4,
                    background,
                    cursor: 'crosshair',
                    maxWidth: '100%',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    visibility: probe ? 'visible' : 'hidden',
                    transform: `translate(${probe?.x ?? 0}px, ${probe?.y ?? 0}px)`,
                    pointerEvents: 'none',
                }}
            >
                <Paper
                    ref={boxRef}
                    elevation={6}
                    sx={{ p: 0.5, display: 'inline-block', lineHeight: 0, borderRadius: 1 }}
                >
                    <canvas
                        ref={lensRef}
                        width={LENS}
                        height={LENS}
                        style={{ display: 'block', borderRadius: 2, background }}
                    />
                    {probe?.readout && (
                        <Typography
                            variant="caption"
                            component="div"
                            sx={{ lineHeight: 1.6, px: 0.5, whiteSpace: 'nowrap' }}
                        >
                            {probe.readout}
                        </Typography>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default LensImage;
