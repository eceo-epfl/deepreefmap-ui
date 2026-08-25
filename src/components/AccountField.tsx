import { useGetIdentity, useRecordContext } from 'react-admin';
import { Tooltip, Typography } from '@mui/material';

// The registry stores a Keycloak subject id and no name.
const AccountField = ({
    source,
    emptyText = '—',
    variant = 'body2',
}: {
    source: string;
    label?: string;
    emptyText?: string;
    sortable?: boolean;
    variant?: 'body2' | 'caption';
}) => {
    const record = useRecordContext();
    const { identity } = useGetIdentity();
    const value = record?.[source] as string | null | undefined;
    if (!value) {
        return (
            <Typography
                variant={variant}
                component="span"
                sx={{
                    color: 'text.disabled',
                }}
            >
                {emptyText}
            </Typography>
        );
    }
    const label = identity?.id === value ? 'you' : `account ${value.slice(0, 8)}`;
    return (
        <Tooltip title={`Account id ${value}`}>
            <Typography variant={variant} component="span">
                {label}
            </Typography>
        </Tooltip>
    );
};

export default AccountField;
