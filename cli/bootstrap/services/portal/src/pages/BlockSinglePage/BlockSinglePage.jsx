import React, { useState } from 'react';
import Card from '../../layouts/Card/Card';
import Repeater from '../../elements/Repeater/Repeater';
import TextInput from '../../components/TextInput/TextInput';

function BlockSinglePage() {

    const [blockId, setBlockId] = useState('');
    const [blockFields, setBlockFields] = useState([]);
    const [blockDetails, setBlockDetails] = useState({});

    const validateField = (e) => {
        const value = e.target.value;
        // Add validation logic here
    }

    const save = () => {
        console.log('Saving...', { blockId, blockFields, blockDetails });
    }

    return (
        <div className="single-crud-page">
            <h1>Block Single Page</h1>

            <div className="flex-row top-bar">
                <p className="single-crud-id">{blockId || 'Creating new block...'}</p>
                <div className="button-group">
                    <button onClick={save}>Save</button>
                </div>
            </div>

            <div className="card-columns">
                <div className="col-66">
                    <Card
                        title="Block Fields"
                    >
                        <p>Add fields to your block, save it and then use the block in your pages</p>

                        <Repeater
                            items={blockFields}
                            setItems={setBlockFields}
                            defaultItem= {{}}
                            buttonText= "Add Field"
                            renderRow= {(item, index, updateItem) => (

                                <div className="flex-row">
                                    <TextInput 
                                        label="Field Key"
                                        placeholder="Enter field key"
                                        value={blockFields[index].key || ''}
                                        onChange={(e) => {
                                            validateField(e)
                                            const blockField = { ...blockFields[index], key: e.target.value };
                                            setBlockFields([
                                                ...blockFields.slice(0, index),
                                                blockField,
                                                ...blockFields.slice(index + 1)
                                            ]);
                                        }}
                                        errorMessage="Invalid field key"
                                        isValid={true}
                                    />

                                    <TextInput 
                                        label="Select Field Type"
                                        placeholder="Select field type"
                                        value={blockFields[index].type || ''}
                                        onChange={(e) => {
                                            validateField(e)
                                            const blockField = { ...blockFields[index], type: e.target.value };
                                            setBlockFields([
                                                ...blockFields.slice(0, index),
                                                blockField,
                                                ...blockFields.slice(index + 1)
                                            ]);
                                        }}
                                        errorMessage="Invalid field type"
                                        isValid={true}
                                    />
                                </div>
                            )}
                        />


                    </Card>
                </div>

                <div className="col-33">
                    <Card
                        title="Block details"
                    >
                        <div className="flex-row">
                            <TextInput 
                                label="Block Name"
                                placeholder="Enter block Name"
                                value={blockDetails.blockName || ''}
                                onChange={(e) => {
                                    validateField(e)
                                    setBlockDetails({
                                        ...blockDetails,
                                        blockName: e.target.value
                                    })
                                }}
                                errorMessage="Invalid block name"
                                isValid={true}
                            />

                            <TextInput 
                                label="Block Key"
                                placeholder="Enter block key"
                                value={blockDetails.blockKey || ''}
                                onChange={(e) => {
                                    validateField(e)
                                    setBlockDetails({
                                        ...blockDetails,
                                        blockKey: e.target.value
                                    })
                                }}
                                errorMessage="Invalid block key"
                                isValid={true}
                            />
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex-row bottom-bar">
                <div className="button-group">
                    <button onClick={save}>Save</button>
                </div>
            </div>
        </div>

    )
}

export default BlockSinglePage;
