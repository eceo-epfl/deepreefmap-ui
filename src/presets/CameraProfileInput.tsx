import { AutocompleteInput, required, useGetList } from 'react-admin';

import type { CameraProfile } from '../contract';

/** The camera field of a preset: a name, not a calibration.
 *
 * A preset says which rig a run was shot on; the numbers live in the profile file
 * the laptop resolves that name against, either one calibrated there or one the
 * registry published. The choices are what the registry holds plus what the
 * pipeline ships, and a name outside both is still accepted: a laptop may hold a
 * profile nobody has published yet.
 */
const CameraProfileInput = ({
    source,
    label,
    bundled,
}: {
    source: string;
    label: string;
    bundled: string[];
}) => {
    const { data } = useGetList<CameraProfile>('camera_profiles', {
        pagination: { page: 1, perPage: 200 },
        sort: { field: 'name', order: 'ASC' },
    });
    const registered = (data ?? []).map(profile => profile.name);
    const names = [...new Set([...registered, ...bundled])].sort((a, b) => a.localeCompare(b));
    const choices = names.map(name => ({
        id: name,
        name: registered.includes(name) ? name : `${name} (bundled)`,
    }));
    return (
        <AutocompleteInput
            source={source}
            label={label}
            choices={choices}
            validate={required()}
            onCreate={value => (value ? { id: value, name: value } : undefined)}
            createLabel="Use this name"
            createItemLabel="Use %{item}"
            helperText="Cameras the registry holds, and the profiles the pipeline ships."
            fullWidth
        />
    );
};

export default CameraProfileInput;
