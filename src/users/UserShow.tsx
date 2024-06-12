import {
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField,
    DeleteButton,
    TopToolbar,
} from 'react-admin';

const UserShowActions = () => {

    return (
        <TopToolbar>
            <>
                <DeleteButton /></>
        </TopToolbar>
    );
}

const UserShow = () => {
    return (
        <Show
            actions={<UserShowActions />}
            redirect="list"
            title="User Details"
        >
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