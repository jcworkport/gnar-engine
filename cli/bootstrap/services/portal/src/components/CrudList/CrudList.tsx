import React, { useState, useEffect } from 'react';

function CrudList({ entityKey, fetchData, entitySingleName, entityPluralName, columns }: { entityKey: string; fetchData: fn; entitySingleName: string; entityPluralName: string; columns: Array<{ key: string; label: string }> }) {

    const [page, setPage] = useState(1);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch data
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const newData = await fetchData({page});

                if (newData.length === 0) {
                    setLoading(false);
                    setError(`No ${entityPluralName} found.`);
                    return;
                }

                setItems(newData[entityKey]);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        })();
    }, [entityKey, page]);

    return (
        <div className="crud-list">
            <div className="top-action-bar">
                
            </div>
            <div className="list-table">
                <table>
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length}>Loading...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={columns.length}>{error}</td>
                            </tr>
                        ) : items && items.length > 0 ? (
                            items.map((item, index) => (
                                <tr key={index}>
                                    {columns.map(col => (
                                        <td key={col.key}>{item[col.key]}</td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length}>No {entityPluralName} available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CrudList;
