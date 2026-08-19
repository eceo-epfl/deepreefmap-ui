import { SelectInput, SelectInputProps, useRecordContext } from 'react-admin';
import { Chip } from '@mui/material';

import { QUALITY_VALUES, Quality } from '../contract';

const QUALITY_LABELS: Record<Quality, string> = {
    excellent: 'Excellent',
    very_good: 'Very good',
    good: 'Good',
    meh: 'Meh',
    bad: 'Bad',
    very_bad: 'Very bad',
};

const QUALITY_COLOURS: Record<Quality, 'success' | 'info' | 'warning' | 'error'> = {
    excellent: 'success',
    very_good: 'success',
    good: 'info',
    meh: 'warning',
    bad: 'error',
    very_bad: 'error',
};

export const qualityChoices = QUALITY_VALUES.map(id => ({ id, name: QUALITY_LABELS[id] }));

export const QualityField = ({
    source = 'quality',
    emptyText = '—',
}: {
    source?: string;
    emptyText?: string;
}) => {
    const record = useRecordContext();
    const value = record?.[source] as Quality | null | undefined;
    if (!value || !(value in QUALITY_LABELS)) return <span>{emptyText}</span>;
    return <Chip size="small" label={QUALITY_LABELS[value]} color={QUALITY_COLOURS[value]} />;
};

export const QualityInput = (props: Omit<SelectInputProps, 'choices'>) => (
    <SelectInput source="quality" label="Quality" choices={qualityChoices} {...props} />
);
