import {
    useRecordContext,
    Loading,
    useAuthProvider,
    useRefresh,
} from 'react-admin';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

registerPlugin(FilePondPluginFileValidateType);

export const FilePondUploaderList = () => {
    const auth = useAuthProvider();
    const token = auth.getToken();
    const refresh = useRefresh();

    return (
        <FilePond
            acceptedFileTypes={['video/*']}
            chunkUploads={true}
            onprocessfiles={refresh}
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
                    'Transect-Id': "",
                }
            }}
        />)
}

export const FilePondUploaderTransect = () => {
    const auth = useAuthProvider();
    const token = auth.getToken();
    const refresh = useRefresh();
    const record = useRecordContext();

    if (!record) return <Loading />;

    return (
        <FilePond
            acceptedFileTypes={['video/*']}
            chunkUploads={true}
            onprocessfiles={refresh}
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
                    'Transect-Id': record.id,
                }
            }}
        />)
}
