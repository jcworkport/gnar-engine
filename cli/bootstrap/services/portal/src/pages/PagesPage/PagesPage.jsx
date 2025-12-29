import CrudList from '../../components/CrudList/CrudList';
import { pages } from '../../services/page.js';

function PagesPage() {

    return (
        <div>
            <h1>Manage Pages</h1>
            <CrudList 
                entityKey="pages"
                fetchData={pages.getMany}
                entitySingleName="Page"
                entityPluralName="Pages"
                columns={[
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Page name' }
                ]}
            />
        </div>
    )
}

export default PagesPage;
