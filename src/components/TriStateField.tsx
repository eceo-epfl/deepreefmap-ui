import { useRecordContext } from 'react-admin';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';

import { TRI_STATE_VALUES, TriState } from '../contract';

const TRI_STATE_LABELS: Record<TriState, string> = {
    yes: 'Yes',
    no: 'No',
    unknown: 'Unknown',
};

const TRI_STATE_ICONS: Record<TriState, typeof CheckIcon> = {
    yes: CheckIcon,
    no: CloseIcon,
    unknown: HelpOutlineIcon,
};

const TRI_STATE_COLOURS: Record<TriState, 'success' | 'error' | 'disabled'> = {
    yes: 'success',
    no: 'error',
    unknown: 'disabled',
};

export const triStateChoices = TRI_STATE_VALUES.map(id => ({
    id,
    name: TRI_STATE_LABELS[id],
}));

/** The video `gravity` / `gps` columns, which are yes|no|unknown rather than booleans. */
export const TriStateField = ({ source }: { source: string }) => {
    const record = useRecordContext();
    const value = (record?.[source] ?? 'unknown') as TriState;
    const key = value in TRI_STATE_LABELS ? value : 'unknown';
    const Icon = TRI_STATE_ICONS[key];
    return (
        <Icon
            fontSize="small"
            color={TRI_STATE_COLOURS[key]}
            titleAccess={TRI_STATE_LABELS[key]}
        />
    );
};
