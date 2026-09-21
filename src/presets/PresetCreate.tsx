import { Create, SimpleForm } from 'react-admin';

import PresetInputs from './PresetInputs';
import { defaultSettings } from './schema';

const PresetCreate = () => (
    <Create redirect="show">
        <SimpleForm
            defaultValues={{ description: '', version: 1, settings: defaultSettings() }}
        >
            <PresetInputs />
        </SimpleForm>
    </Create>
);

export default PresetCreate;
