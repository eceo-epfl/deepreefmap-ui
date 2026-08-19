import { Menu, useSidebarState } from 'react-admin';
import { Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

/** The sidebar, grouped by what a row is: catalogue entries, synced assets, laptops. */
const DrmMenu = () => (
    <Menu>
        <Menu.DashboardItem />
        <Section label="Catalogue" />
        <Menu.ResourceItem name="sites" />
        <Menu.ResourceItem name="campaigns" />
        <Menu.ResourceItem name="transects" />
        <Menu.ResourceItem name="passes" />
        <Menu.ResourceItem name="pass_groups" />
        <Section label="Library" />
        <Menu.ResourceItem name="videos" />
        <Menu.ResourceItem name="runs" />
        <Section label="Operations" />
        <Menu.ResourceItem name="devices" />
        <Menu.ResourceItem name="presets" />
        <Menu.ResourceItem name="stored_objects" />
        <Menu.Item
            to="/stored_objects/upload"
            primaryText="Upload"
            leftIcon={<CloudUploadIcon />}
        />
    </Menu>
);

export default DrmMenu;
