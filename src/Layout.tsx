import type { ReactNode } from 'react';
import { AppBar, Layout, TitlePortal } from 'react-admin';
import { Chip, CssBaseline } from '@mui/material';

import DrmMenu from './layout/Menu';

type Severity = 'warning' | 'info' | 'default';

// Anything other than production is worth calling out, so nobody edits staging by accident.
const DEPLOYMENT_LABELS: Record<string, { label: string; colour: Severity }> = {
    local: { label: 'Local development', colour: 'default' },
    dev: { label: 'Development', colour: 'info' },
    stage: { label: 'Staging', colour: 'warning' },
};

const DeploymentChip = ({ deployment }: { deployment?: string }) => {
    const banner = deployment ? DEPLOYMENT_LABELS[deployment] : undefined;
    if (!banner) return null;
    return (
        <Chip
            size="small"
            label={banner.label}
            color={banner.colour}
            sx={{ mr: 2, fontWeight: 600 }}
        />
    );
};

const DrmAppBar = ({ deployment }: { deployment?: string }) => (
    <AppBar color="primary">
        <TitlePortal />
        <DeploymentChip deployment={deployment} />
    </AppBar>
);

export const MyLayout = ({
    children,
    deployment,
}: {
    children?: ReactNode;
    deployment?: string;
}) => (
    <>
        <CssBaseline />
        <Layout appBar={() => <DrmAppBar deployment={deployment} />} menu={DrmMenu}>
            {children}
        </Layout>
    </>
);

export default MyLayout;
