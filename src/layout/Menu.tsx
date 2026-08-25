import { Menu, useSidebarState } from 'react-admin';
import { Tooltip, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SpeedIcon from '@mui/icons-material/Speed';

import { GLOSSARY } from '../contract/glossary';

// Hidden while the sidebar is collapsed, where only the icons remain legible.
const Section = ({ label }: { label: string }) => {
    const [open] = useSidebarState();
    if (!open) return null;
    return (
        <Typography
            variant="overline"
            sx={{
                color: 'text.secondary',
                display: 'block',
                px: 2,
                pt: 1.5,
                lineHeight: 1.5,
            }}
        >
            {label}
        </Typography>
    );
};

/** A resource entry with its glossary line on hover. */
const Entry = ({ name }: { name: string }) => (
    <Tooltip title={GLOSSARY[name] ?? ''} placement="right" enterDelay={400}>
        <div>
            <Menu.ResourceItem name={name} />
        </div>
    </Tooltip>
);

/** The sidebar, grouped by what a row is: catalogue entries, synced assets, laptops. */
const DrmMenu = () => (
    <Menu>
        <Menu.DashboardItem />
        <Section label="Catalogue" />
        <Entry name="sites" />
        <Entry name="campaigns" />
        <Entry name="transects" />
        <Entry name="passes" />
        <Section label="Library" />
        <Entry name="videos" />
        <Entry name="runs" />
        <Section label="Operations" />
        <Entry name="changes" />
        <Entry name="devices" />
        <Entry name="presets" />
        <Menu.Item to="/performance" primaryText="Performance" leftIcon={<SpeedIcon />} />
        <Entry name="stored_objects" />
        <Menu.Item
            to="/stored_objects/upload"
            primaryText="Upload"
            leftIcon={<CloudUploadIcon />}
        />
    </Menu>
);

export default DrmMenu;
