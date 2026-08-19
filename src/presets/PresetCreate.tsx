import { Create, SimpleForm } from 'react-admin';

import PresetInputs, { parsePresetSettings, validatePreset } from './PresetInputs';

const PresetCreate = () => (
    <Create redirect="show" transform={parsePresetSettings}>
        <SimpleForm
            defaultValues={{ description: '', version: 1, settings: '{}' }}
            validate={validatePreset}
        >
            <PresetInputs />
        </SimpleForm>
    </Create>
);

export default PresetCreate;
