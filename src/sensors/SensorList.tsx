// In your resource file (e.g., posts.js)
import React from 'react';
import { List, Datagrid, TextField, SimpleList } from 'react-admin';

const CustomEmptyList = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        Nothing here just yet.
    </div>
);

export const SensorList = (props) => (
    <List {...props} empty={<CustomEmptyList />}>
        {/* Your list fields go here */}
        <Datagrid>
            <TextField source="id" />
            <TextField source="title" />
            {/* Add other fields as needed */}
        </Datagrid>
    </List>
);