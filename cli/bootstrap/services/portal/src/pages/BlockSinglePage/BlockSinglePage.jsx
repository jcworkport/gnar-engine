import React, { useState } from 'react';
import Card from '../../layouts/Card/Card';
import Repeater from '../../elements/Repeater/Repeater';
import SaveButton from '../../elements/SaveButton/SaveButton';
import TextInput from '../../components/TextInput/TextInput';
import { blocks } from '../../services/block.js';
import CustomSelect from '../../elements/CustomSelect/CustomSelect';
import { fieldTypes } from '../../data/pages.data.js';

function BlockSinglePage() {

    const [blockId, setBlockId] = useState('');
    const [blockFields, setBlockFields] = useState([]);
    const [blockDetails, setBlockDetails] = useState({});
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const validateField = (e) => {
        const value = e.target.value;
        
        
    }

    const save = async () => {
        setLoading(true);
        console.log('Saving...', { blockId, blockFields, blockDetails });

        // create new block
        if (!blockId) {
            try {
                await blocks.create({
                    details: blockDetails,
                    fields: blockFields
                })
            } catch (error) {
                console.error('Error creating block:', error);
                setErrors([error]);
            }
        }

        // update existing block
        else {
            confirm('Are you sure you would like to update this block? This could result in page content being removed when they are next updated.')

            try {
                await blocks.update(blockId, {
                    details: blockDetails,
                    fields: blockFields
                });
            } catch (error) {
                console.error('Error creating block:', error);
                setErrors([error]);
            }
        }

        setLoading(false);
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
                        <p className="instruction">Add fields to your block, save it and then use the block in your pages</p>

                        <Repeater
                            items={blockFields}
                            setItems={setBlockFields}
                            defaultItem= {{}}
                            buttonText= "Add Field"
                            renderRow= {(item, index, updateItem) => (

                                <div className="flex-row">
                                    <TextInput 
                                        label="Field Name"
                                        placeholder="Enter field name"
                                        value={blockFields[index].name || ''}
                                        onChange={(e) => {
                                            validateField(e)
                                            const blockField = { ...blockFields[index], name: e.target.value };
                                            setBlockFields([
                                                ...blockFields.slice(0, index),
                                                blockField,
                                                ...blockFields.slice(index + 1)
                                            ]);
                                        }}
                                        errorMessage="Invalid field name"
                                        isValid={true}
                                    />

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

                                    <CustomSelect
                                        label="Field Type"
                                        placeholder="Select Field Type"
                                        name={`field-type-select-${index}`}
                                        options={fieldTypes}
                                        labelKey="name"
                                        setSelectedOption={(option) => {
                                            const blockField = { ...blockFields[index], type: option.value };
                                            setBlockFields([
                                                ...blockFields.slice(0, index),
                                                blockField,
                                                ...blockFields.slice(index + 1)
                                            ]);
                                        }}
                                        selectedOption={fieldTypes.find(ft => ft.value === (blockFields[index].type || ''))}
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
                        <div className="flex-col">
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
                    <SaveButton
                        onClick={save}
                        itemName="Block"
                        loading={loading}
                        error={errors.length > 0}
                        isNew={!blockId}
                    />
                </div>
            </div>

            <div>
                {errors.length > 0 && (
                    <div className="error-messages">
                        <ul>
                            {errors.map((error, index) => (
                                <li key={index}>{error.message}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BlockSinglePage;
