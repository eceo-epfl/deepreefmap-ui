import {
    EditButton,
    Labeled,
    NumberField,
    Show,
    TextField,
    TopToolbar,
    useRecordContext,
} from 'react-admin';
import { Box, Divider, Grid, Stack } from '@mui/material';

import { SyncFields, TombstoneButton } from '../components';
import { useCanAuthor } from '../permissions';
import type { Preset } from '../contract';

const PresetShowActions = () => {
    const canAuthor = useCanAuthor();
    return (
        <TopToolbar>
            {canAuthor && <EditButton />}
            <TombstoneButton noun="preset" />
        </TopToolbar>
    );
};

const SettingsBlock = () => {
    const record = useRecordContext<Preset>();
    if (!record) return null;
    return (
        <Box
            component="pre"
            sx={{
                m: 0,
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
                fontSize: 13,
                overflowX: 'auto',
            }}
        >
            {JSON.stringify(record.settings ?? {}, null, 2)}
        </Box>
    );
};

const PresetShow = () => (
    <Show actions={<PresetShowActions />}>
        <Stack
            spacing={2}
            sx={{
                p: 2,
            }}
        >
            <Grid container spacing={2}>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 4,
                    }}
                >
                    <Labeled label="Name">
                        <TextField source="name" />
                    </Labeled>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 2,
                    }}
                >
                    <Labeled label="Version">
                        <NumberField source="version" />
                    </Labeled>
                </Grid>
                <Grid size={12}>
                    <Labeled label="Description">
                        <TextField source="description" emptyText="—" />
                    </Labeled>
                </Grid>
                <Grid size={12}>
                    <Labeled label="Settings" sx={{ width: '100%' }}>
                        <SettingsBlock />
                    </Labeled>
                </Grid>
            </Grid>

            <Divider />
            <SyncFields />
        </Stack>
    </Show>
);

export default PresetShow;
