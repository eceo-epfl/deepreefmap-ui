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
                <BooleanField source="admin" />
                <ArrayField source="roles">
                    <SingleFieldList linkType={false}>
                        <ChipField source="name" />
                    </SingleFieldList>
                </ArrayField>
            </SimpleShowLayout>
        </Show >
    )
};

export default UserShow;