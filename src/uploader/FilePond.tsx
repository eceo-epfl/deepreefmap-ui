import {
    useRecordContext,
    Loading,
    useAuthProvider,
    useRefresh,
} from 'react-admin';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import * as tus from 'tus-js-client'
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
                process: (fieldName, file, metadata, load, error, progress, abort) => {
                    var upload = new tus.Upload(file, {
                        endpoint: "/files",
                        retryDelays: [0, 1000, 3000, 5000],
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Transect-Id': "",
                        },
                        metadata: {
                            filename: file.name,
                            filetype: file.type
                        },
                        onError: function (err) {
                            console.log("Failed because: " + err)
                            // error(err)
                        },
                        onProgress: function (bytesUploaded, bytesTotal) {
                            progress(true, bytesUploaded, bytesTotal)
                        },
                        onSuccess: function () {
                            load(upload.url.split('/').pop())
                        }
                    })
                    // Start the upload
                    upload.start()
                    return {
                        abort: () => {
                            upload.abort()
                            abort()
                        }
                    }
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
            timeout={200}
            maxParallelUploads={10}
            allowRevert={false}
            allowRemove={false}
            server={{
                url: '/api/objects',
                process: (fieldName, file, metadata, load, error, progress, abort) => {
                    var upload = new tus.Upload(file, {
                        endpoint: "/files",
                        retryDelays: [0, 1000, 3000, 5000],
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Transect-Id': record.id.toString(),
                        },
                        metadata: {
                            filename: file.name,
                            filetype: file.type
                        },
                        onError: function (err) {
                            console.log("Failed because: " + err)
                            // error(err)
                        },
                        onProgress: function (bytesUploaded, bytesTotal) {
                            progress(true, bytesUploaded, bytesTotal)
                        },
                        onSuccess: function () {
                            load(upload.url.split('/').pop())
                        }
                    })
                    // Start the upload
                    upload.start()
                    return {
                        abort: () => {
                            upload.abort()
                            abort()
                        }
                    }
                }
            }}
        />)
}
