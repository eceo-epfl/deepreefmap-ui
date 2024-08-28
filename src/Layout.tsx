import * as React from 'react';
import { Layout, AppBar, TitlePortal, useDataProvider } from 'react-admin';
import { CssBaseline } from '@mui/material';
import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';


const StatusIcon = ({ gpu, storage }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: gpu ? 'green' : 'red',
                    marginRight: 1,
                }}
            />
            <Typography variant="body1" color={gpu ? 'textPrimary' : 'textSecondary'}>
                GPU
            </Typography>

            {/* Add a vertical separator line */}
            <Box
                sx={{
                    height: 24,
                    width: 2,
                    bgcolor: 'gray',
                    marginX: 2,
                }}
            />

            <Box
                sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: storage ? 'green' : 'red',
                    marginRight: 1,
                }}
            />
            <Typography variant="body1" color={storage ? 'textPrimary' : 'textSecondary'}>
                Storage
            </Typography>
        </Box>
    );
};


const MyAppBar = () => {
    const [systemStatus, setSystemStatus] = useState({});
    const dataProvider = useDataProvider();

    useEffect(() => {
        const fetchData = async () => {
            const statusData = await dataProvider.getStatus();
            setSystemStatus(statusData.data);
            console.log(systemStatus);
        };

        fetchData();

    }, []);

    return (
        <AppBar color="primary" >
            <TitlePortal />


            <StatusIcon
                gpu={systemStatus.kubernetes_status}
                storage={systemStatus.s3_status}
            />
        </AppBar>
    )
};

export const MyLayout = ({ children }) => (
    <>
        <CssBaseline />
        <Layout appBar={MyAppBar}>
            {children}
        </Layout>
    </>
);

export default MyLayout;