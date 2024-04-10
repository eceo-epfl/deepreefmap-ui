import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ArrayInput,
    SimpleFormIterator,
} from 'react-admin';

const SubmissionEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <TextInput source="description" />
                <NumberInput source="fps" label="FPS" step={1} />
                <NumberInput source="time_seconds_start" step={1} />
                <NumberInput source="time_seconds_end" step={1} />
                <ArrayInput source="input_associations" label="File Inputs">
                    <SimpleFormIterator inline disableAdd disableRemove>
                        <TextInput source="input_object.filename" label="Filename" disabled />
                        <NumberInput source="processing_order" />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Edit>
    )
};

export default SubmissionEdit;
