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
    ReferenceInput,
} from 'react-admin';

const SubmissionEdit = () => {
    return (
        <Edit resource="submissions" redirect="show" mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <TextInput source="description" />
                <NumberInput source="fps" label="FPS to process with the model" step={1} validate={[required(), minValue(1)]} />
                <NumberInput source="time_seconds_start" step={1} validate={[required(), minValue(0)]} />
                <NumberInput source="time_seconds_end" step={1} validate={[required()]} helperText="If two files, this is the end time in seconds during the second video" />
                <ReferenceInput
                    source="transect_id"
                    reference="transects"
                >
                    <SelectInput
                        optionText={
                            (record) => `${record.name} (${record.latitude_start}°, ${record.longitude_start}°) - (${record.latitude_end}°, ${record.longitude_end}°)`
                        }
                    />
                </ReferenceInput>
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

export default SubmissionEdit;
