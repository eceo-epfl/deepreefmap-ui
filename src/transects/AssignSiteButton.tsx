import { useState } from 'react';
import {
    Button,
    Form,
    ReferenceInput,
    SaveButton,
    SelectInput,
    required,
    useListContext,
    useNotify,
    useRefresh,
    useUnselectAll,
    useUpdateMany,
} from 'react-admin';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';

// A transect made in the field may arrive without a site. Validation refuses one until
// it has a site, so this is the repair step.
const AssignSiteButton = () => {
    const [open, setOpen] = useState(false);
    const { selectedIds } = useListContext();
    const [updateMany, { isPending }] = useUpdateMany();
    const unselectAll = useUnselectAll('transects');
    const notify = useNotify();
    const refresh = useRefresh();

    const assign = async ({ site_id }: { site_id?: string }) => {
        await updateMany(
            'transects',
            { ids: selectedIds, data: { site_id } },
            {
                onSuccess: () => {
                    notify(`Assigned ${selectedIds.length} transects`, { type: 'info' });
                    unselectAll();
                    refresh();
                    setOpen(false);
                },
                onError: error =>
                    notify(error instanceof Error ? error.message : 'Assignment failed', {
                        type: 'error',
                    }),
            },
        );
    };

    return (
        <>
            <Button
                label="Assign to site"
                onClick={() => setOpen(true)}
                startIcon={<PlaceIcon />}
            />
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Assign to site</DialogTitle>
                <Form onSubmit={assign as never}>
                    <DialogContent>
                        <ReferenceInput source="site_id" reference="sites">
                            <SelectInput
                                optionText="name"
                                label="Site"
                                validate={required()}
                                fullWidth
                            />
                        </ReferenceInput>
                    </DialogContent>
                    <DialogActions>
                        <Button label="ra.action.cancel" onClick={() => setOpen(false)} />
                        <SaveButton label="Assign" disabled={isPending} icon={<PlaceIcon />} />
                    </DialogActions>
                </Form>
            </Dialog>
        </>
    );
};

export default AssignSiteButton;
