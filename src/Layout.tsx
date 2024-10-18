import * as React from 'react';
import { Layout, AppBar, TitlePortal, useDataProvider, usePermissions } from 'react-admin';
import { CssBaseline } from '@mui/material';
import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import Brightness1TwoToneIcon from '@mui/icons-material/Brightness1TwoTone';


const StatusIcon = ({ gpu, storage }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Brightness1TwoToneIcon sx={{
                width: 16,
                marginRight: 1,
            }} color={gpu ? 'success' : 'error'} />
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
            <Brightness1TwoToneIcon sx={{
                width: 16,
                marginRight: 1,
            }} color={storage ? 'success' : 'error'} />
            <Typography variant="body1" color={storage ? 'textPrimary' : 'textSecondary'}>
                Storage
            </Typography>
        </Box>
    );
};


const MyAppBar = (props) => {
    const [systemStatus, setSystemStatus] = useState(
        {
            "kubernetes": [],
            "s3_local": {
                "total_object_count": 0,
                "input_object_count": 0,
                "output_object_count": 0,
                "total_size": 0,
                "input_size": 0,
                "output_size": 0
            },
            "s3_global": null,
            "s3_status": true,
            "kubernetes_status": true
        });
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