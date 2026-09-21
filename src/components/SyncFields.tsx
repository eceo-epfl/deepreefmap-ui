import { ReferenceField, TextField, useRecordContext } from 'react-admin';
import { Stack, Typography } from '@mui/material';

import RelativeDateField from '../devices/RelativeDateField';
import ValidatedField from './ValidatedField';

/**
 * One caption line of provenance at the foot of a Show page, and the validation state.
 *
 * A pushed row names its device; a console-authored row names nobody.
 */
const SyncFields = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
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
            {'validated_at' in record && <ValidatedField />}
        </Stack>
    );
};

export default SyncFields;
