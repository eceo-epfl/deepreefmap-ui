import { useRecordContext } from 'react-admin';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Stack } from '@mui/material';

import { DIRECTION_VALUES, Direction } from '../contract';

const DIRECTION_LABELS: Record<Direction, string> = {
    forward: 'Forward',
    reverse: 'Reverse',
};

const DIRECTION_ICONS: Record<Direction, typeof ArrowForwardIcon> = {
    forward: ArrowForwardIcon,
    reverse: ArrowBackIcon,
};

export const directionChoices = DIRECTION_VALUES.map(id => ({
    id,
    name: DIRECTION_LABELS[id],
}));

/** For an edit form: null is a recorded fact, that nobody noted the direction. */
export const DIRECTION_EMPTY_TEXT = 'Not recorded';

/** Which way the diver swam the tape, which is a property of the swim, not the clip. */
export const DirectionField = ({
    emptyText = '—',
}: {
    label?: string;
    emptyText?: string;
}) => {
    const record = useRecordContext();
    const value = record?.direction as Direction | null | undefined;
    if (!value || !(value in DIRECTION_LABELS)) return <span>{emptyText}</span>;
    const Icon = DIRECTION_ICONS[value];
    return (
        <Stack
            direction="row"
            spacing={0.5}
            sx={{
                alignItems: 'center',
            }}
        >
            <Icon fontSize="small" color="action" />
            <span>{DIRECTION_LABELS[value]}</span>
        </Stack>
    );
};
