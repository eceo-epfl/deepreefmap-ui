import * as React from 'react';
import { Layout, AppBar, TitlePortal, useDataProvider } from 'react-admin';
import { CssBaseline } from '@mui/material';
import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { Box } from '@mui/material';


const GPUStatus = ({ isOnline }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: isOnline ? 'green' : 'red',
                    marginRight: 1,
                }}
            />
            <Typography variant="body1" color={isOnline ? 'textPrimary' : 'textSecondary'}>
                {isOnline ? 'GPU Online' : 'GPU Offline'}
            </Typography>
        </Box>
    );
};

const MyAppBar = () => {
    const [systemStatus, setSystemStatus] = useState(undefined);
    const dataProvider = useDataProvider();

    useEffect(() => {
        const fetchData = async () => {
            const statusData = await dataProvider.getStatus(undefined);
            setSystemStatus(statusData.data);
        };

        fetchData();

    }, []);

    return (
        <AppBar color="primary" >
            <TitlePortal />
            <GPUStatus isOnline={systemStatus} />
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