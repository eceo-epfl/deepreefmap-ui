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
import { TotalDuration, endDurationValidation, videoArraySizeValidation, VideoInput, VideoChoice } from './SubmissionCreate';
import { useFormContext } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';


const SubmissionEdit = () => {
    const [qtyVideos, setQtyVideos] = useState(undefined);
    const [videoChoices, setVideoChoices] = useState([]);

    return (
        <Edit resource="submissions" redirect="show" mutationMode="pessimistic">
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
        </Edit>
    )
};

export default SubmissionEdit;
