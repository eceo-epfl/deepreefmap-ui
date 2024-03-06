/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    useAuthProvider,
    useCreate,
    useDataProvider,
} from 'react-admin';
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'
// import { useFormContext, useFormState, useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';


const SubmissionCreate = () => {
    // Track IDs of those that have uploaded
    let uploadedFiles = [];


    const MyUploader = () => {
        const [create, { isLoading, error }] = useCreate();
        const auth = useAuthProvider();
        const dataProvider = useDataProvider;
        const token = auth.getToken();
        // console.log("TOKEN", token);
        // specify upload params and url for your files
        const getUploadParams = ({ file, meta }) => {
            const body = new FormData()
            body.append('files', file)
            return {
                url: '/api/submissions',
                headers: { Authorization: `Bearer ${token}` },
                body: body
            }
        }
        // called every time a file's `status` changes
        // const handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file) }
        const handleChangeStatus = ({ meta, file, xhr }, status) => { // called every time a files status changes
            console.log("handleStatus", status, meta, file)
            if (status == "done") {
                const json = JSON.parse(xhr.response)
                console.log("json", json);

                // Append ID to store
                // setUploadedFiles([...uploadedFiles, json.id]);
                uploadedFiles.push(json.id);
                console.log("UPLOADED FILES", uploadedFiles);
                // register({ name: 'cheese', value: "test" });
            }

            if (status == "removed") {
                // Remove ID from store
                const json = JSON.parse(xhr.response)
                dataProvider.delete('submissions', { id: json.id });

                // Remove the ID from the array
                uploadedFiles = uploadedFiles.filter(v => v != json.id);
                console.log("UPLOADED FILES", uploadedFiles);
            }
        }

        // receives array of files that are done uploading when submit button is clicked
        const handleSubmit = (files, allFiles) => {
            useCreate('submissions', { data: { files: uploadedFiles } });
        }

        return (
            <Dropzone
                getUploadParams={getUploadParams}
                onChangeStatus={handleChangeStatus}
                onSubmit={handleSubmit}
                accept="image/*,audio/*,video/*"
            />
        )
    }

    return (
        <Create redirect="list">
            <SimpleForm >
                Upload the collected video:

                <MyUploader />
                {/* <FileInput
                    label="Video data"
                    source="files"
                    multiple={true}>
                    <FileField source="src" title="title" />
                </FileInput> */}
                {/* <TextInput source="cheese" helperText={false} />
                <ArrayInput source="files" label="File Inputs">
                    <SimpleFormIterator inline >
                        <TextInput source="name" helperText={false} />
                    </SimpleFormIterator>
                </ArrayInput> */}
            </SimpleForm>
        </Create>
    )
};

export default SubmissionCreate;
