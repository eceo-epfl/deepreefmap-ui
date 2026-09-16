import { SelectInput, SelectInputProps, useRecordContext } from 'react-admin';
import { Chip } from '@mui/material';

import {
    RIG_POSITION_VALUES,
    RigPosition,
    VIDEO_REVIEW_VALUES,
    VideoReview,
} from '../contract';

const REVIEW_LABELS: Record<VideoReview, string> = {
    unreviewed: 'Unreviewed',
    usable: 'Usable',
    excluded: 'Excluded',
};

const REVIEW_COLOURS: Record<VideoReview, 'default' | 'success' | 'error'> = {
    unreviewed: 'default',
    usable: 'success',
    excluded: 'error',
};

const RIG_LABELS: Record<RigPosition, string> = {
    left: 'Left',
    centre: 'Centre',
    right: 'Right',
};

export const reviewChoices = VIDEO_REVIEW_VALUES.map(id => ({ id, name: REVIEW_LABELS[id] }));
export const rigPositionChoices = RIG_POSITION_VALUES.map(id => ({
    id,
    name: RIG_LABELS[id],
}));

/** The review verdict on a clip: looked at and judged, or not yet. */
export const ReviewField = ({
    source = 'review',
}: {
    source?: string;
    label?: string;
    sortable?: boolean;
}) => {
    const record = useRecordContext();
    const value = (record?.[source] ?? 'unreviewed') as VideoReview;
    const key = value in REVIEW_LABELS ? value : 'unreviewed';
    return (
        <Chip
            size="small"
            label={REVIEW_LABELS[key]}
            color={REVIEW_COLOURS[key]}
            variant={key === 'unreviewed' ? 'outlined' : 'filled'}
        />
    );
};

export const ReviewInput = (props: Omit<SelectInputProps, 'choices'>) => (
    <SelectInput source="review" label="Review" choices={reviewChoices} {...props} />
);

/** Where the camera sat on the rig, relative to the diver. */
export const RigPositionField = ({
    emptyText = '—',
}: {
    label?: string;
    sortable?: boolean;
    emptyText?: string;
}) => {
    const record = useRecordContext();
    const value = record?.rig_position as RigPosition | null | undefined;
    if (!value || !(value in RIG_LABELS)) return <span>{emptyText}</span>;
    return <span>{RIG_LABELS[value]}</span>;
};
