import { useRecordContext } from 'react-admin';
import { Tooltip, Typography } from '@mui/material';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
];

const FORMATTER = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export const STALE_AFTER_SECONDS = 7 * 86_400;

/** Seconds since `iso`, negative for a timestamp in the future. */
export const secondsSince = (iso: string): number =>
    (Date.now() - new Date(iso).getTime()) / 1000;

export const relativeTime = (iso: string): string => {
    const elapsed = secondsSince(iso);
    const magnitude = Math.abs(elapsed);
    for (const [unit, seconds] of UNITS) {
        if (magnitude >= seconds) {
            return FORMATTER.format(-Math.round(elapsed / seconds), unit);
        }
    }
    return FORMATTER.format(-Math.round(elapsed), 'second');
};

/**
 * A timestamp as `3 days ago`, with the absolute value on hover.
 *
 * `staleAfter` turns the text a warning colour, so a laptop that stopped syncing
 * stands out in a list of otherwise healthy ones.
 */
const RelativeDateField = ({
    source,
    emptyText = 'never',
    staleAfter,
    variant = 'body2',
}: {
    source: string;
    label?: string;
    emptyText?: string;
    staleAfter?: number;
    variant?: 'body2' | 'caption';
}) => {
    const record = useRecordContext();
    const value = record?.[source] as string | null | undefined;
    if (!value) {
        return (
            <Typography
                variant={variant}
                component="span"
                sx={{
                    color: 'text.disabled',
                }}
            >
                {emptyText}
            </Typography>
        );
    }
    const stale = staleAfter !== undefined && secondsSince(value) > staleAfter;
    return (
        <Tooltip title={new Date(value).toLocaleString()}>
            <Typography
                variant={variant}
                component="span"
                color={stale ? 'warning.main' : 'text.primary'}
            >
                {relativeTime(value)}
            </Typography>
        </Tooltip>
    );
};

export default RelativeDateField;
