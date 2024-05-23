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
                <TextInput source="name" />
                <TextInput source="description" />
                <NumberInput source="fps" label="FPS to process with the model" step={1} validate={[required(), minValue(1)]} />
                <NumberInput source="time_seconds_start" step={1} validate={[required(), minValue(0)]} />
                <NumberInput source="time_seconds_end" step={1} validate={[required()]} helperText="If two files, this is the end time in seconds during the second video" />
                <ArrayInput source="input_associations" label="Videos" >
                    <SimpleFormIterator inline disableReordering disableAdd disableRemove>
                        <SelectInput
                            source="processing_order"
                            helperText="Select the order to process this video in"
                            validate={[required()]}
                            choices={[
                                { id: 1, name: 1 },
                                { id: 2, name: 2 },
                            ]}
                            defaultValue={
                                1
                            }
                        />
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

export default TransectEdit;
