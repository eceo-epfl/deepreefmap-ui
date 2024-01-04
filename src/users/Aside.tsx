import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

const PREFIX = 'Aside';

const classes = {
    root: `${PREFIX}-root`,
};

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.root}`]: {
        [theme.breakpoints.up('sm')]: {
            width: 200,
            margin: '1em',
        },
        [theme.breakpoints.down('md')]: {
            width: 0,
            overflowX: 'hidden',
            margin: 0,
        },
    },
}));

const Aside = () => {
    return (
        /*<Box
              sx={{
                  width: {
                      sm: 200,
                      md: 0,
                  },
                  margin: {
                      sm: '1em',
                      md: 0,
                  },
                  overflowX: {
                      md: 'hidden',
                  },
              }}
        >*/
        <Root className={classes.root}>
            <Typography variant="h6">Admin Users</Typography>
            <Typography variant="body2">
                These users have admin access to the portal, allowing them to
                manage data and users. To remove admin access, delete the user
                and to add other users as admins, add them by their EPFL
                username.
            </Typography>
        </Root>
    );
};

export default Aside;
