import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';

const LENS = 168;
const ZOOM = 6;
const GAP = 16;

type Probe = { x: number; y: number; room: number; readout: ReactNode };

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
    const holderRef = useRef<HTMLDivElement>(null);
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
        const frame = frameRef.current;
        setProbe({
            x: event.clientX - box.left,
            y: event.clientY - box.top,
            room: frame ? frame.clientWidth : box.width,
            readout: readout?.(sx, sy),
        });
    };

    // The lens sits inside a card that clips it, so it is kept whole: to the left of
    // the pointer near the right edge, below it near the top. Placed after the paint,
    // since the readout beside it decides how wide it is.
    useLayoutEffect(() => {
        const holder = holderRef.current;
        const lens = boxRef.current;
        if (!holder || !lens || !probe) return;
        const { width, height } = lens.getBoundingClientRect();
        const x = Math.max(0, Math.min(probe.x + GAP, probe.room - width));
        const y = probe.y - height - GAP < 0 ? probe.y + GAP : probe.y - height - GAP;
        holder.style.transform = `translate(${x}px, ${y}px)`;
    }, [probe]);

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
                ref={holderRef}
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    visibility: probe ? 'visible' : 'hidden',
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
