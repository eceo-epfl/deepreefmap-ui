import { DateInput, required, TextInput } from 'react-admin';
import { Grid, Typography } from '@mui/material';

type CampaignFormValues = {
    begin_date?: string | null;
    end_date?: string | null;
};

export const validateCampaign = ({ begin_date, end_date }: CampaignFormValues) => {
    if (!begin_date || !end_date || end_date >= begin_date) return {};
    return { end_date: 'End date cannot precede the begin date' };
};

const CampaignInputs = () => (
    <>
        <Typography variant="h6" gutterBottom>
            Expedition
        </Typography>
        <Grid container spacing={2}>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}
            >
                <TextInput
                    source="name"
                    validate={required()}
                    helperText="Archive folder name, eg. 2025_10_eritrea. Unique, ignoring case."
                    fullWidth
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 3,
                }}
            >
                <DateInput source="begin_date" fullWidth />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 3,
                }}
            >
                <DateInput source="end_date" fullWidth />
            </Grid>
            <Grid size={12}>
                <TextInput source="description" multiline rows={3} fullWidth />
            </Grid>
        </Grid>
    </>
);

export default CampaignInputs;
