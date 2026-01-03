import CrudList from '../../components/CrudList/CrudList';
import { blocks } from '../../services/block.js';

function BlocksPage() {

    return (
        <div>
            <h1>Manage Blocks</h1>
            <CrudList 
                entityKey="blocks"
                fetchData={blocks.getMany}
                entitySingleName="Block"
                entityPluralName="Blocks"
                columns={[
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Block name' }
                ]}
            />
        </div>
    )
}

export default BlocksPage;
