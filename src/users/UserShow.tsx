import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    DateField,
    BooleanField,
    ArrayField,
    Datagrid,
    ReferenceField,
    ChipField,
    SingleFieldList,
} from 'react-admin';

const UserShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="firstName" />
                <TextField source="lastName" />
                <TextField source="username" />
                <TextField source="email" />
                <TextField source="loginMethod" />
                <BooleanField source="approved_user" />
                <BooleanField source="admin" />
            </SimpleShowLayout>
        </Show >
    )
};

export default UserShow;