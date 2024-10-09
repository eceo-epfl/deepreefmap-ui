import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ArrayInput,
    SimpleFormIterator,
    minValue,
    required,
    SelectInput,
} from 'react-admin';

const TransectEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" />
                <NumberInput source="length (m)" />
                <NumberInput source="depth (m)" />
                <NumberInput source="latitude_start" validate={[required()]} />
                <NumberInput source="longitude_start" validate={[required()]} />
                <NumberInput source="latitude_end" validate={[required()]} />
                <NumberInput source="longitude_end" validate={[required()]} />
            </SimpleForm>
        </Edit>
    )
};

export default TransectEdit;
