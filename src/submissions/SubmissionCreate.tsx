/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    FileInput,
    FileField,
    ReferenceInput,
    SelectInput,
    SaveContextProvider,
} from 'react-admin';

const SubmissionCreate = () => {

    return (
        <Create redirect="list">
            <SimpleForm >
                Upload the collected video:
                <FileInput
                    label="Video data"
                    source="video"
                    multiple={true}>
                    <FileField source="src" title="title" />
                </FileInput>

            </SimpleForm>
        </Create>
    )
};

export default SubmissionCreate;
