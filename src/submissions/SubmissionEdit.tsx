import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ArrayInput,
    SimpleFormIterator,
    minValue,
    required,
} from 'react-admin';

const SubmissionEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <TextInput source="description" />
                <NumberInput source="fps" label="FPS to process with the model" step={1} validate={[required(), minValue(1)]} />
                <NumberInput source="time_seconds_start" step={1} validate={[required(), minValue(0)]} />
                <NumberInput source="time_seconds_end" step={1} validate={[required()]} />
                <ArrayInput source="input_associations" label="Videos (Use arrows to place in order)" >
                    <SimpleFormIterator inline disableAdd disableRemove getItemLabel={index => `#${index + 1}`}>
                        <TextInput source="input_object.id" label="Filename" disabled />
                        <TextInput source="input_object.filename" label="Filename" disabled />
                        <TextInput source="input_object.size_bytes" label="Size (bytes)" disabled />
                        <TextInput source="input_object.time_seconds" label="Duration (seconds)" disabled />
                        <TextInput source="input_object.fps" label="FPS" disabled />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Edit>
    )
};

export default SubmissionEdit;
