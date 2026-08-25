import { Box, Stack, Typography, useTheme } from '@mui/material';

import { formatPercent } from './usePooledCover';

const FALLBACK = '#9e9e9e';
const SIZE = 200;
const RING = 28;
const GAP = 2;

export type DonutSlice = { name: string; fraction: number; colour?: string | null };

const radial = (angle: number, radius: number) => [
    SIZE / 2 + radius * Math.cos(angle - Math.PI / 2),
    SIZE / 2 + radius * Math.sin(angle - Math.PI / 2),
];

const arcPath = (start: number, end: number, radius: number) => {
    const [x1, y1] = radial(start, radius);
    const [x2, y2] = radial(end, radius);
    const large = end - start > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${radius},${radius} 0 ${large} 1 ${x2},${y2}`;
};

/** A ring of class-group fractions in the registry's colours, legend beside it. */
const CoverDonut = ({ slices }: { slices: DonutSlice[] }) => {
    const theme = useTheme();
    const radius = SIZE / 2 - RING / 2;
    const total = slices.reduce((sum, slice) => sum + slice.fraction, 0);
    let angle = 0;
    const arcs = slices
        .filter(slice => slice.fraction > 0)
        .map(slice => {
            const start = angle;
            // A single full-circle arc renders as nothing; stop a hair short.
            const sweep = Math.min((slice.fraction / total) * 2 * Math.PI, 2 * Math.PI - 1e-4);
            angle += sweep;
            return { ...slice, start, end: start + sweep };
        });
    return (
        <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
            <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                role="img"
                aria-label="Cover by class group"
            >
                {arcs.map(arc => (
                    <path
                        key={arc.name}
                        d={arcPath(arc.start, arc.end, radius)}
                        fill="none"
                        stroke={arc.colour ?? FALLBACK}
                        strokeWidth={RING}
                    >
                        <title>{`${arc.name} ${formatPercent(arc.fraction)}`}</title>
                    </path>
                ))}
                {arcs.length > 1 &&
                    arcs.map(arc => {
                        const [x1, y1] = radial(arc.start, radius - RING / 2 - 1);
                        const [x2, y2] = radial(arc.start, radius + RING / 2 + 1);
                        return (
                            <line
                                key={`${arc.name}-gap`}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={theme.palette.background.paper}
                                strokeWidth={GAP}
                                pointerEvents="none"
                            />
                        );
                    })}
                <text
                    x={SIZE / 2}
                    y={SIZE / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={theme.palette.text.secondary}
                    fontSize={12}
                    fontFamily={theme.typography.fontFamily}
                >
                    {arcs.length} {arcs.length === 1 ? 'class' : 'classes'}
                </text>
            </svg>
            <Stack spacing={0.5} sx={{ minWidth: 160 }}>
                {slices.map(slice => (
                    <Stack
                        key={slice.name}
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                    >
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '2px',
                                flexShrink: 0,
                                backgroundColor: slice.colour ?? FALLBACK,
                            }}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                            {slice.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatPercent(slice.fraction)}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );
};

export default CoverDonut;
