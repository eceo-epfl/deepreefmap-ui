import { ReferenceField, TextField, useRecordContext } from 'react-admin';
import { Typography } from '@mui/material';

import RelativeDateField from '../devices/RelativeDateField';

/**
 * One caption line of provenance at the foot of a Show page.
 *
 * A pushed row names its device. A row authored here names nobody: the schema
 * deliberately records no person against survey rows, only the laptop.
 */
const SyncFields = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <Typography
            variant="caption"
            component="div"
            sx={{
                color: 'text.secondary',
            }}
        >
            {record.device_id ? (
                <>
                    Uploaded by{' '}
                    <ReferenceField source="device_id" reference="devices" link="show">
                        <TextField source="name" variant="caption" />
                    </ReferenceField>
                    {', '}
                </>
            ) : (
                <>Created in this console, </>
            )}
            changed <RelativeDateField source="updated_at" variant="caption" />
        </Typography>
    );
};

export default SyncFields;
