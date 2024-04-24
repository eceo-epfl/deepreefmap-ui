import {
    Create,
    useAuthProvider,
    useRedirect,
} from 'react-admin';
import 'react-dropzone-uploader/dist/styles.css'
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import { Container } from '@mui/material';



const ObjectCreate = () => {
    const FilePondUploader = () => {
        const auth = useAuthProvider();
        const token = auth.getToken();

        const redirect = useRedirect();
        return (
            <FilePond
                chunkUploads={true}
                onprocessfiles={() => redirect('list', 'objects')}
                // onprocessfilestart={() => setFilesProcessed(false)}
                allowMultiple={true}
                credits={false}
                chunkSize={50000000}
                timeout={200}
                maxParallelUploads={10}
                allowRevert={false}
                allowRemove={false}
                server={{
                    url: '/api/objects',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }}
            />)
    }

    return (
        <Create redirect="list">
            <Container>
                <br />Upload the collected videos<br /><br />
                <FilePondUploader />
            </Container>
        </Create>
    )
};

export default ObjectCreate;
