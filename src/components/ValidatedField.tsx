import { useRecordContext } from 'react-admin';
import { Chip, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';

import { GLOSSARY_TERMS } from '../contract/glossary';

/** Whether the console has validated the row, as a chip. */
const ValidatedField = ({
    emptyText = 'Unvalidated',
}: {
    label?: string;
    sortable?: boolean;
    emptyText?: string;
}) => {
    const record = useRecordContext();
    if (!record) return null;
    if (!record.validated_at) {
        return (
            <Tooltip title={GLOSSARY_TERMS.validated}>
                <Chip size="small" variant="outlined" label={emptyText} />
            </Tooltip>
        );
    }
    const when = new Date(record.validated_at as string).toLocaleString();
    const who = record.validated_by ? ` by ${record.validated_by}` : '';
    return (
        <Tooltip title={`Validated ${when}${who}`}>
            <Chip size="small" color="success" icon={<VerifiedIcon />} label="Validated" />
        </Tooltip>
    );
};

export default ValidatedField;
