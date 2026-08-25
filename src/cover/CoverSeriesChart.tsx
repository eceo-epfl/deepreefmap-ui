import { Box, Stack, Typography, useTheme } from '@mui/material';

import type { CoverSeriesEntry } from '../contract';
import { formatPercent } from './usePooledCover';

const FALLBACK = '#9e9e9e';

const AXIS_WIDTH = 48;
const TOP_PAD = 10;
const PLOT_HEIGHT = 200;
const LABEL_BAND = 26;
const BAR_WIDTH = 14;
const BAR_GAP = 2;
const GROUP_GAP = 28;
const WHISKER_CAP = 6;

/** What one series entry is called, wherever it appears: the campaign, or none. */
export const entryLabel = (entry: CoverSeriesEntry) => entry.campaign_name ?? 'No campaign';

export const entryKey = (entry: CoverSeriesEntry) => entry.campaign_id ?? 'no-campaign';

// Every entry orders its own classes by size, so a shared order is needed for the
// bars to line up across groups.
const classOrder = (entries: CoverSeriesEntry[]) => {
    const totals = new Map<string, number>();
    for (const entry of entries) {
        for (const group of entry.groups) {
            totals.set(
                group.class_group,
                (totals.get(group.class_group) ?? 0) + group.fraction,
            );
        }
    }
    return [...totals.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([name]) => name);
};

// The axis top is the next gridline above the tallest whisker, so the lines land on
// round percentages.
const niceScale = (maxValue: number) => {
    const steps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5];
    const step = steps.find(s => maxValue / s <= 5) ?? 0.5;
    const top = Math.max(step, step * Math.ceil(maxValue / step));
    const ticks: number[] = [];
    for (let i = 0; i * step <= top + step / 2; i += 1) ticks.push(i * step);
    return { top, ticks };
};

const tickLabel = (tick: number) => `${Math.round(tick * 1000) / 10}%`;

// Rounded at the data end only: a rect's rx would round the baseline too.
const barPath = (x: number, y: number, width: number, height: number) => {
    const r = Math.min(3, width / 2, height);
    const bottom = y + height;
    return [
        `M${x},${bottom}`,
        `V${y + r}`,
        `Q${x},${y} ${x + r},${y}`,
        `H${x + width - r}`,
        `Q${x + width},${y} ${x + width},${y + r}`,
        `V${bottom}`,
        'Z',
    ].join(' ');
};

const truncate = (label: string, maxChars: number) =>
    label.length <= maxChars ? label : `${label.slice(0, Math.max(1, maxChars - 1))}…`;

/** Grouped bars per campaign, whiskered with each class's per-pass spread. */
const CoverSeriesChart = ({
    entries,
    colours,
}: {
    entries: CoverSeriesEntry[];
    colours: Map<string, string>;
}) => {
    const theme = useTheme();
    const classes = classOrder(entries);
    if (!classes.length) return null;

    const maxValue = Math.max(
        ...entries.flatMap(entry =>
            entry.groups.map(group => Math.max(group.fraction, group.max_fraction)),
        ),
    );
    const { top, ticks } = niceScale(maxValue);
    const y = (value: number) => TOP_PAD + (PLOT_HEIGHT - TOP_PAD) * (1 - value / top);
    const baseline = y(0);

    const groupWidth = classes.length * (BAR_WIDTH + BAR_GAP) - BAR_GAP;
    const slotWidth = groupWidth + GROUP_GAP;
    const groupX = (index: number) => AXIS_WIDTH + GROUP_GAP / 2 + index * slotWidth;
    const width = AXIS_WIDTH + entries.length * slotWidth;
    const height = PLOT_HEIGHT + LABEL_BAND;

    const gridStroke = theme.palette.divider;
    const inkFaint = theme.palette.text.secondary;
    const ink = theme.palette.text.primary;

    // The series payload carries colours too, which covers the moment before the
    // class-group table has loaded.
    const seedColours = new Map<string, string>();
    for (const entry of entries) {
        for (const group of entry.groups) {
            if (group.colour && !seedColours.has(group.class_group)) {
                seedColours.set(group.class_group, group.colour);
            }
        }
    }
    const colourOf = (className: string) =>
        colours.get(className) ?? seedColours.get(className) ?? FALLBACK;

    return (
        <Stack spacing={1}>
            <Box sx={{ overflowX: 'auto' }}>
                <svg
                    width={width}
                    height={height}
                    role="img"
                    aria-label="Cover per survey event, one bar per class with its min to max spread"
                >
                    {ticks.map(tick => (
                        <g key={tick}>
                            <line
                                x1={AXIS_WIDTH}
                                x2={width}
                                y1={y(tick)}
                                y2={y(tick)}
                                stroke={gridStroke}
                                strokeWidth={1}
                            />
                            <text
                                x={AXIS_WIDTH - 6}
                                y={y(tick) + 3.5}
                                textAnchor="end"
                                fontSize={11}
                                fill={inkFaint}
                            >
                                {tickLabel(tick)}
                            </text>
                        </g>
                    ))}

                    {entries.map((entry, entryIndex) => {
                        const x0 = groupX(entryIndex);
                        const label = entryLabel(entry);
                        const byClass = new Map(
                            entry.groups.map(group => [group.class_group, group]),
                        );
                        return (
                            <g key={entryKey(entry)}>
                                {classes.map((className, classIndex) => {
                                    const group = byClass.get(className);
                                    if (!group) return null;
                                    const x = x0 + classIndex * (BAR_WIDTH + BAR_GAP);
                                    const centre = x + BAR_WIDTH / 2;
                                    const spread = group.max_fraction > group.min_fraction;
                                    return (
                                        <g key={className}>
                                            <title>
                                                {`${label}\n${className}: ${formatPercent(
                                                    group.fraction,
                                                )} (min ${formatPercent(
                                                    group.min_fraction,
                                                )}, max ${formatPercent(group.max_fraction)})`}
                                            </title>
                                            {group.fraction > 0 && (
                                                <path
                                                    d={barPath(
                                                        x,
                                                        y(group.fraction),
                                                        BAR_WIDTH,
                                                        baseline - y(group.fraction),
                                                    )}
                                                    fill={colourOf(className)}
                                                />
                                            )}
                                            {spread && (
                                                <g stroke={ink} strokeWidth={1.5}>
                                                    <line
                                                        x1={centre}
                                                        x2={centre}
                                                        y1={y(group.max_fraction)}
                                                        y2={y(group.min_fraction)}
                                                    />
                                                    <line
                                                        x1={centre - WHISKER_CAP / 2}
                                                        x2={centre + WHISKER_CAP / 2}
                                                        y1={y(group.max_fraction)}
                                                        y2={y(group.max_fraction)}
                                                    />
                                                    <line
                                                        x1={centre - WHISKER_CAP / 2}
                                                        x2={centre + WHISKER_CAP / 2}
                                                        y1={y(group.min_fraction)}
                                                        y2={y(group.min_fraction)}
                                                    />
                                                </g>
                                            )}
                                        </g>
                                    );
                                })}
                                <text
                                    x={x0 + groupWidth / 2}
                                    y={PLOT_HEIGHT + 16}
                                    textAnchor="middle"
                                    fontSize={11}
                                    fill={inkFaint}
                                >
                                    <title>{label}</title>
                                    {truncate(label, Math.floor(slotWidth / 6.5))}
                                </text>
                            </g>
                        );
                    })}

                    <line
                        x1={AXIS_WIDTH}
                        x2={width}
                        y1={baseline}
                        y2={baseline}
                        stroke={inkFaint}
                        strokeWidth={1}
                    />
                </svg>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {classes.map(className => (
                    <Stack
                        key={className}
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: 'center' }}
                    >
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '2px',
                                backgroundColor: colourOf(className),
                            }}
                        />
                        <Typography variant="caption">{className}</Typography>
                    </Stack>
                ))}
            </Box>
        </Stack>
    );
};

export default CoverSeriesChart;
