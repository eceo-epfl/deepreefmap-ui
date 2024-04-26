import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ArrayInput,
    SimpleFormIterator,
    SelectInput,
    required,
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
                        <SelectInput
                            source="processing_order"
                            helperText="Select the order that this file should be processed in"
                            validate={[required()]}
                            choices={[
                                { id: 1, name: 1 },
                                { id: 2, name: 2 },
                            ]}
                            defaultValue={
                                1
                            }
                        />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Edit>
    )
};

export default SubmissionEdit;
