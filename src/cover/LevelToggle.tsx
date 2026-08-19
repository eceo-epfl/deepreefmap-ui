import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { COVER_LEVEL_VALUES, CoverLevel } from '../contract';

/** The fine/intermediate/coarse selector every cover view shares. */
const LevelToggle = ({
    value,
    onChange,
}: {
    value: CoverLevel;
    onChange: (level: CoverLevel) => void;
}) => (
    <ToggleButtonGroup
        size="small"
        exclusive
        value={value}
        onChange={(_, next) => next && onChange(next as CoverLevel)}
        sx={{ alignSelf: 'flex-start' }}
    >
        {COVER_LEVEL_VALUES.map(level => (
            <ToggleButton key={level} value={level}>
                {level}
            </ToggleButton>
        ))}
    </ToggleButtonGroup>
);

export default LevelToggle;
