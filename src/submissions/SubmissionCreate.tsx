import React, { useState, useEffect } from 'react';
import {
    Create,
    SimpleForm,
    NumberInput,
    TextInput,
    ReferenceInput,
    SelectInput,
    required,
    ArrayInput,
    SimpleFormIterator,
    minValue,
    useChoicesContext,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';


export const videoArraySizeValidation = (value) => {
    if (value.length < 1) {
        return 'At least one video must be processed';
    }
    if (value.length > 2) {
        return 'Only two videos can be processed at a time';
    }
    // In the two array items, there should be only unique processing_order values
    if (value.length === 2) {
        if (value[0].processing_order === value[1].processing_order) {
            return 'The processing order must be unique';
        }
    }
    if (value.length === 2 && value[0].input_object_id === value[1].input_object_id) {
        return 'The videos must be unique. The same video has been chosen twice';
    }
    return undefined;
}

export const endDurationValidation = (value, allValues) => {
    if (value <= allValues.time_seconds_start) {
        return 'The end time must be greater than the start time';
    }
    return undefined;
};

export const TotalDuration = ({ videoChoices }) => {
    // Overengineered component to calculate the total duration of the videos

    const { getValues, watch } = useFormContext();
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [videos, setVideos] = useState(null);
    const [totalDuration, setTotalDuration] = useState(0);
    const [firstVideoDuration, setFirstVideoDuration] = useState(null);
    const [secondVideoDuration, setSecondVideoDuration] = useState(null);
    const [outputText, setOutputText] = useState("Choose a video, a start and an end time");
    const [overTotalDuration, setOverTotalDuration] = useState(false);

    useEffect(() => {
        const startTime = getValues('time_seconds_start');
        const endTime = getValues('time_seconds_end');
        const videos = getValues('input_associations');
        setStartTime(startTime);
        setEndTime(endTime);
        setVideos(videos);
    }, [watch('time_seconds_start'), watch('time_seconds_end'), watch('input_associations'), videoChoices]);

    useEffect(() => {
        // Get just the first video's duration, as the second video's total
        // time is not needed as we can just use the end time to add to the
        // first video's duration
        if (videos && videoChoices && videoChoices.length > 0 && videos.length > 0 && videos[0].input_object_id) {
            const video_id = videos[0].input_object_id;
            const video = videoChoices.find(video => video.id === video_id);
            if (video) {
                setFirstVideoDuration(video.time_seconds);
            }
        }
        if (videos && videoChoices && videoChoices.length > 0 && videos.length > 1 && videos[1].input_object_id) {
            const video_id = videos[1].input_object_id;
            const video = videoChoices.find(video => video.id === video_id);
            if (video) {
                setSecondVideoDuration(video.time_seconds);
            }
        }

        if (videos && startTime && endTime) {
            if (videos.length === 1) {
                setTotalDuration(endTime - startTime);
            } else if (videos.length === 2 && firstVideoDuration) {
                setTotalDuration((firstVideoDuration - startTime) + endTime);
            }
        } else {
            setTotalDuration(0);
        }
    }, [videos, startTime, endTime, videoChoices]);

    useEffect(() => {
        if (videos) {
            if (firstVideoDuration && videos.length === 1 && (endTime > firstVideoDuration || startTime > firstVideoDuration)) {
                setOverTotalDuration(true);
                return
            }
            if (firstVideoDuration && secondVideoDuration && videos.length === 2 && (endTime > secondVideoDuration || startTime > firstVideoDuration)) {
                setOverTotalDuration(true);
                return
            }
            else {
                setOverTotalDuration(false);
                return
            }
        }
    }, [firstVideoDuration, secondVideoDuration, startTime, endTime, videos]);
    useEffect(() => {
        if (totalDuration > 0) {
            setOutputText(`Total duration: ${totalDuration} seconds`);
        } else {
            setOutputText("Choose a video, a start and an end time");
        }
    }, [totalDuration]);

    if (!videos || videos.length === 0 || videos.length > 2) {
        return null;
    }

    return (
        <>
            <Typography variant="body1">{outputText}</Typography>
            <Typography variant="caption">
                {videos.length > 1 ? "Note: Time is calculated on two videos" : null}
            </Typography>
            <br />
            {overTotalDuration ? <Typography variant="caption" color="error" >
                Warning: The given times exceed the video's duration
            </Typography> : null}

        </>
    );
};


export const VideoInput = ({ transectID, setChoices }) => {
    const { allChoices } = useChoicesContext();

    useEffect(() => {
        if (allChoices) {
            setChoices(allChoices);
        }
    }, [allChoices]);

    return (
        <>
            <SelectInput
                optionText={(record) => `${record.filename} (${record.time_seconds} seconds, ${(record.size_bytes / 1024 / 1024).toFixed(2)} MB)`}
                fullWidth
                disabled={!transectID}
            />
        </>
    );
};



export const VideoChoice = ({ setQtyVideos, setChoices }) => {
    const { setValue, getValues, watch } = useFormContext();
    const [transectID, setTransectID] = useState(null);

    useEffect(() => {
        const transectID = getValues('transect_id');
        setTransectID(transectID);
    }, [watch('transect_id')]);
    // Effect to set processing_order based on index
    useEffect(() => {
        const setProcessingOrder = () => {
            const values = getValues('input_associations');
            if (values) {
                values.forEach((item, index) => {
                    setValue(`input_associations[${index}].processing_order`, index + 1);
                });
                setQtyVideos(values.length);
            }
        };
        setProcessingOrder();
    }, [watch('input_associations')]);


    return (<>
        <Typography variant="h6" gutterBottom style={{ marginTop: '16px' }}>
            Videos
        </Typography>
        <Typography variant="caption" gutterBottom>
            Select a video in the order it is to be processed with the model. If you select two, the videos will be concatenated by the model.
        </Typography>
        <ArrayInput source="input_associations" label="Videos" validate={[videoArraySizeValidation]}>
            <SimpleFormIterator
                inline
                getItemLabel={index => `#${index + 1}`}
                disableAdd={getValues('input_associations')?.length === 2}
                disableClear
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <ReferenceInput source="input_object_id" reference="objects" label="Select Video" filter={{ transect_id: getValues('transect_id') }} >
                            {transectID ? null : <Typography variant="caption" color="error" gutterBottom>Choose a transect first</Typography>}
                            <VideoInput transectID={transectID} setChoices={setChoices} />
                        </ReferenceInput>
                    </Grid>
                </Grid>
            </SimpleFormIterator>
        </ArrayInput >
    </>
    );

}

const SubmissionCreate = () => {
    const [qtyVideos, setQtyVideos] = useState(undefined);
    const [videoChoices, setVideoChoices] = useState([]);

    return (
        <Create redirect="show">
            <SimpleForm>
                <Typography variant="h6" gutterBottom>
                    Basic Information
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextInput source="name" fullWidth validate={[required()]} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextInput source="description" multiline fullWidth />
                    </Grid>
                </Grid>

                {/* Transect Reference */}
                <Typography variant="h6" gutterBottom style={{ marginTop: '16px' }}>
                    Transect Information
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <ReferenceInput source="transect_id" reference="transects">
                            <SelectInput
                                optionText={(record) =>
                                    `${record.name} (${record.latitude_start}°, ${record.longitude_start}°) - (${record.latitude_end}°, ${record.longitude_end}°)`
                                }
                                fullWidth
                            />
                        </ReferenceInput>
                    </Grid>
                </Grid>

                <VideoChoice setQtyVideos={setQtyVideos} setChoices={setVideoChoices} />

                <Typography variant="h6" gutterBottom style={{ marginTop: '16px' }}>
                    Processing Settings
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <NumberInput
                            source="fps"
                            label="FPS"
                            step={1}
                            validate={[required(), minValue(1)]}
                            helperText="The FPS used to process the model" />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <NumberInput
                            source="time_seconds_start"
                            step={1}
                            validate={[required(), minValue(0)]}
                            fullWidth
                            helperText={qtyVideos && qtyVideos === 2 ? "The start position in seconds in the first video" : "The start position in seconds in the video"}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <NumberInput
                            source="time_seconds_end"
                            step={1}
                            validate={[required(), minValue(0), endDurationValidation]}
                            helperText={qtyVideos && qtyVideos === 2 ? "The end position in seconds relative to the beginning of the second video" : "The end position in seconds in the video"}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TotalDuration videoChoices={videoChoices} />
                    </Grid>
                </Grid>
            </SimpleForm>
        </Create>
    );
};

export default SubmissionCreate;
