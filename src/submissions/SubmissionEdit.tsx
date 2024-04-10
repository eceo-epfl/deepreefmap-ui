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
        <Edit>
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <TextInput source="description" />
                <NumberInput source="fps" label="FPS" />
                <NumberInput source="time_seconds_start" />
                <NumberInput source="time_seconds_end" />
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
