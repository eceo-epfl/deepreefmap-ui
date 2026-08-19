import { useState } from 'react';
import {
    AutocompleteInput,
    Button,
    Form,
    FormDataConsumer,
    RadioButtonGroupInput,
    ReferenceInput,
    SaveButton,
    TextInput,
    required,
    useCreate,
    useListContext,
    useNotify,
    useRefresh,
    useUnselectAll,
    useUpdateMany,
} from 'react-admin';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

import type { PassGroup } from '../contract';

type GroupFormValues = {
    mode: 'existing' | 'new' | 'ungroup';
    survey_group_id?: string;
    name?: string;
    period_label?: string;
};

const modeChoices = [
    { id: 'existing', name: 'Existing group' },
    { id: 'new', name: 'New group' },
    { id: 'ungroup', name: 'Ungroup' },
];

// pass_groups has no `q` search, so the autocomplete matches on `name` instead.
const groupFilter = (searchText: string) => ({ name: searchText });

// A pass arrives labelled only with its campaign, which is too coarse for a series: one
// expedition can survey the same transect twice. The grouping is the curator's judgement
// and sits outside the sync contract, so a device re-pushing the pass cannot clobber it.
const GroupPassesButton = () => {
    const [open, setOpen] = useState(false);
    const { selectedIds } = useListContext();
    const [create] = useCreate<PassGroup>();
    const [updateMany, { isPending }] = useUpdateMany();
    const unselectAll = useUnselectAll('passes');
    const notify = useNotify();
    const refresh = useRefresh();

    const apply = async ({ mode, survey_group_id, name, period_label }: GroupFormValues) => {
        let groupId: string | null = mode === 'existing' ? (survey_group_id ?? null) : null;
        if (mode === 'new') {
            try {
                const created = await create(
                    'pass_groups',
                    { data: { name, period_label: period_label || null, description: '' } },
                    { returnPromise: true },
                );
                if (!created) return;
                groupId = created.id;
            } catch (error) {
                notify(error instanceof Error ? error.message : 'Could not create the group', {
                    type: 'error',
                });
                return;
            }
        }
        await updateMany(
            'passes',
            { ids: selectedIds, data: { survey_group_id: groupId } },
            {
                onSuccess: () => {
                    notify(
                        groupId
                            ? `Grouped ${selectedIds.length} passes`
                            : `Ungrouped ${selectedIds.length} passes`,
                        { type: 'info' },
                    );
                    unselectAll();
                    refresh();
                    setOpen(false);
                },
                onError: error =>
                    notify(error instanceof Error ? error.message : 'Grouping failed', {
                        type: 'error',
                    }),
            },
        );
    };

    return (
        <>
            <Button
                label="Group passes"
                onClick={() => setOpen(true)}
                startIcon={<WorkspacesIcon />}
            />
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Group passes</DialogTitle>
                <Form onSubmit={apply as never} defaultValues={{ mode: 'existing' }}>
                    <DialogContent>
                        <RadioButtonGroupInput
                            source="mode"
                            label={false}
                            choices={modeChoices}
                            helperText={false}
                        />
                        <FormDataConsumer<GroupFormValues>>
                            {({ formData }) => {
                                if (formData.mode === 'new') {
                                    return (
                                        <>
                                            <TextInput
                                                source="name"
                                                validate={required()}
                                                fullWidth
                                            />
                                            <TextInput
                                                source="period_label"
                                                label="Period label"
                                                helperText="For example 2024 spring. Orders the statistics series."
                                                fullWidth
                                            />
                                        </>
                                    );
                                }
                                if (formData.mode === 'ungroup') {
                                    return (
                                        <Typography variant="body2">
                                            Clears the group on the selected passes.
                                        </Typography>
                                    );
                                }
                                return (
                                    <ReferenceInput
                                        source="survey_group_id"
                                        reference="pass_groups"
                                        sort={{ field: 'name', order: 'ASC' }}
                                    >
                                        <AutocompleteInput
                                            label="Group"
                                            optionText="name"
                                            filterToQuery={groupFilter}
                                            validate={required()}
                                            fullWidth
                                        />
                                    </ReferenceInput>
                                );
                            }}
                        </FormDataConsumer>
                    </DialogContent>
                    <DialogActions>
                        <Button label="ra.action.cancel" onClick={() => setOpen(false)} />
                        <SaveButton
                            label="Apply"
                            disabled={isPending}
                            icon={<WorkspacesIcon />}
                        />
                    </DialogActions>
                </Form>
            </Dialog>
        </>
    );
};

export default GroupPassesButton;
