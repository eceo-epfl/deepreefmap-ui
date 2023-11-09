import * as React from 'react';
import { Fragment, useState } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import { List, Datagrid, TextField, Count, ReferenceOneField, ReferenceField, ArrayField } from "react-admin";

const SensorList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="name" />
            <TextField source="description" />
            <ReferenceField
                source='area_id'
                reference='areas'
                link="show"
            >
                <TextField source='name' />
            </ReferenceField>
        </Datagrid>
    </List>

);

export default SensorList;
