/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    useAuthProvider,
    useCreate,
    useDataProvider,
    Toolbar,
    SaveButton,
    useRedirect,
} from 'react-admin';
import 'react-dropzone-uploader/dist/styles.css'
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import Dropzone from 'react-dropzone-uploader'
import { useState } from 'react';
import { useEffect } from 'react';

const MySaveToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable={true} />
    </Toolbar>
);


const SubmissionCreate = () => {
    const [create, { data, isLoading, error }] = useCreate();
    const redirect = useRedirect();
    const MyUploader = () => {
        const auth = useAuthProvider();
        const dataProvider = useDataProvider();
        const token = auth.getToken();

        // Track IDs of those that have uploaded
        const [uploadedFiles, setUploadedFiles] = useState([]);

        // specify upload params and url for your files
        const getUploadParams = ({ file, meta }) => {
            const body = new FormData()
            body.append('file', file)
            return {
                url: '/api/objects',
                headers: { Authorization: `Bearer ${token}` },
                body: body
            }
        }

        const handleChangeStatus = ({ meta, file, xhr }, status) => {
            // called every time a files status changes
            console.log("handleStatus", status, meta, file)
            if (status == "done") {
                const json = JSON.parse(xhr.response)
                console.log("json", json);

                // Append ID to store
                const oldArray = uploadedFiles;
                oldArray.push(json.id);
                setUploadedFiles(oldArray);

                console.log("UPLOADED FILES", uploadedFiles);
            }

            if (status == "removed") {
                // Remove ID from store
                const json = JSON.parse(xhr.response)

                dataProvider.delete('objects', { id: json.id });

                // Remove the ID from the array, filtering on its value
                const newUploadedFiles = uploadedFiles.filter(
                    (value) => value !== json.id
                );

                setUploadedFiles(newUploadedFiles);
                console.log("UPLOADED FILES", uploadedFiles);
            }
        }
        useEffect(() => {
            // Check if data object has ID after submission and then perform
            // a redirect to the show page
            if (data && data.id) {
                redirect('show', 'submissions', data.id);
            }
        }, [data]);

        // receives array of files that are done uploading when submit button is clicked
        const handleSubmit = (files, allFiles) => {
            create('submissions', { data: { inputs: uploadedFiles } });
        }

        return (
            <Dropzone
                getUploadParams={getUploadParams}
                onChangeStatus={handleChangeStatus}
                onSubmit={handleSubmit}
                accept="image/*,audio/*,video/*"
                timeout={7200000}  // Two hours
            />
        )
    }

    const FilePondUploader = () => {
        const auth = useAuthProvider();
        const dataProvider = useDataProvider();
        const token = auth.getToken();

        return (
            <FilePond
                chunkUploads={true}
                allowMultiple={true}
                maxFiles={3}
                credits={false}
                chunkSize={50000000}
                timeout={200}
                // server="/api/objects"
                server={{
                    url: '/api/objects/upload',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }

                }
                }
            />)
    }


    return (
        <Create redirect="list">
            {/* <SimpleForm toolbar={false} > */}
            Upload the collected video:
            <FilePondUploader />
            {/* </SimpleForm> */}
        </Create>
    )
};

export default SubmissionCreate;
