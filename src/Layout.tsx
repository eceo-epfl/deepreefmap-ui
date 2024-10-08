import * as React from 'react';
import { Layout, AppBar, TitlePortal, useDataProvider, usePermissions } from 'react-admin';
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


const MyAppBar = (props) => {
    const [systemStatus, setSystemStatus] = useState({});
    const dataProvider = useDataProvider();
    const { isPending, permissions } = usePermissions();
    const appBarText = () => {
        if (props.deployment) {
            if (props.deployment == 'local') {
                return "⭐Local Development⭐"
            }
            if (props.deployment == 'dev') {
                return "⭐Development⭐"
            }
            if (props.deployment == 'stage') {
                return "⭐Staging⭐"
            }
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const statusData = await dataProvider.getStatus();
            setSystemStatus(statusData.data);
        };

        fetchData();

    }, []);
    if (isPending) return null;

    return (
        <AppBar color="primary" >
            <TitlePortal />
            <Typography
                variant="h6"
                color='#FF69B4'
                id="react-admin-title"
            >
                {props.deployment ? appBarText() : ""}&nbsp;&nbsp;

            </Typography>


            {(permissions === 'user' || permissions === 'admin') ? (
                <StatusIcon
                    gpu={systemStatus.kubernetes_status}
                    storage={systemStatus.s3_status}
                />
            ) : null}
        </AppBar>
    )
};

export const MyLayout = ({ children, deployment }) => (
    <>
        <CssBaseline />
        <Layout appBar={() => <MyAppBar deployment={deployment} />} >
            {children}
        </Layout>

    </>
);

export default MyLayout;