import CrudList from '../../components/CrudList/CrudList';
import { user } from '../../services/user.js';

function UsersPage() {

    return (
        <div>
            <h1>Manage Users</h1>
            <CrudList 
                entityKey="users"
                fetchData={user.getMany}
                entitySingleName="User"
                entityPluralName="Users"
                columns={[
                    { key: 'id', label: 'ID' },
                    { key: 'username', label: 'Username' },
                    { key: 'email', label: 'Email' },
                    { key: 'role', label: 'Role' }
                ]}
            />
        </div>
    )
}

export default UsersPage;
