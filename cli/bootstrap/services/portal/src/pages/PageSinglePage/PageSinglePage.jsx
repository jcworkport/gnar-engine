import React, { useState, useEffect } from 'react';
import Card from '../../layouts/Card/Card';
import SelectRepeater from '../../elements/SelectRepeater/SelectRepeater';
import SaveButton from '../../elements/SaveButton/SaveButton';
import TextInput from '../../elements/TextInput/TextInput';
import CustomSelect from '../../elements/CustomSelect/CustomSelect';
import PageBlockSwitch from '../../components/PageBlockSwitch/PageBlockSwitch';
import { pages } from '../../services/page.js';
import { blocks } from '../../services/block.js';
import { fieldTypes } from '../../data/pages.data.js';
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

function PageSinglePage() {

    const { id } = useParams();
    const [pageId, setPageId] = useState('');
    const [pageDetails, setPageDetails] = useState({});
    const [pageBlocks, setPageBlocks] = useState([]);
    const [allBlocks, setAllBlocks] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // fetch all blocks
        (async () => {
            try {
                const blocksData = await blocks.getMany();
                blocksData.blocks = blocksData.blocks.map(b => {
                    delete b.id;
                    return b;
                })
                setAllBlocks(blocksData.blocks || []);
            } catch (error) {
                console.error('Error fetching blocks data:', error);
                setErrors([error]);
            }
        })();
    }, []);

    useEffect(() => {
        console.log('Current page blocks:', JSON.stringify(pageBlocks));
    }, [pageBlocks]);

    // fetch data if editing existing
    useEffect(() => {
        if (id && id !== 'new') {
            (async () => {
                setLoading(true);
                try {
                    let pageData = await pages.getSingle(id);
                    pageData = pageData.page;
                    setPageId(pageData.id);
                    setPageDetails({
                        pageName: pageData.name,
                        pageKey: pageData.key
                    });
                    setPageBlocks(pageData.blocks || []);
                    setErrors([]);
                } catch (error) {
                    console.error('Error fetching page data:', error);
                    setErrors([error]);
                }
                setLoading(false);
            })();
        }
    }, [id]);

    const updatePageBlocks = (newBlock, parentInstanceId = null, fieldKey = null, remove = false) => {

        if (!newBlock.instanceId) {
            newBlock.instanceId = uuidv4();
        }

        let newPageBlocks = [];
        let foundBlock = false;
        const blocks = [...pageBlocks];

        console.log('Remove', remove, newBlock);

        const updateBlocksRecursively = (blocks) => {
            blocks = blocks.map(block => {
                // found the block, update it
                if (newBlock.instanceId && block.instanceId === newBlock.instanceId) {
                    foundBlock = true;
                    if (remove) {
                        console.log('Removing block', newBlock);
                        return null;
                    }
                    return newBlock;
                }

                // check children recursively
                if (block.fields && block.fields.length > 0) {
                    return {
                        ...block,
                        fields: block.fields.map(field => {
                            if (field.type === 'repeater' && Array.isArray(field.value)) {
                                return {
                                    ...field,
                                    value: updateBlocksRecursively(field.value)
                                };
                            }
                            return field;
                        })
                    };
                }

                // otherwise return as is
                return block; 
            });

            // filter out any nulls (removed blocks)
            return blocks.filter(b => b !== null);
        };

        newPageBlocks = updateBlocksRecursively(blocks);

        // add new block
        if (!foundBlock) {
            // add to parent
            if (parentInstanceId && fieldKey) {
                const addBlockToParentRecursively = (blocks) => {
                    return blocks.map(block => {
                        // found the parent block, add to its fields
                        if (block.instanceId === parentInstanceId) {
                            console.log('adding to parent instance ', block.instanceId, 'with', newBlock);
                            return {
                                ...block,
                                fields: block.fields.map(field => {
                                    console.log('checking field', field, fieldKey, field.repeaterType)
                                    if (field.repeaterType && field.repeaterType === fieldKey) {
                                        if (!Array.isArray(field.value)) {
                                            field.value = [];
                                        }

                                        console.log('WOOP');

                                        return {
                                            ...field,
                                            value: [...field.value, newBlock]
                                        };
                                    }
                                    return field;
                                })
                            };
                        }

                        // check children recursively
                        if (block.fields && block.fields.length > 0) {
                            return {
                                ...block,
                                fields: block.fields.map(field => {
                                    if (field.type === 'repeater' && Array.isArray(field.value)) {
                                        return {
                                            ...field,
                                            value: addBlockToParentRecursively(field.value)
                                        };
                                    }
                                    return field;
                                })
                            };
                        }

                        // otherwise return as is
                        return block; 
                    });
                };

                newPageBlocks = addBlockToParentRecursively(newPageBlocks);
            }

            // otherwise top level
            else {
                newPageBlocks.push(newBlock);
            }
        }

        setPageBlocks(newPageBlocks);
    }

    const validateField = (e) => {
        const value = e.target.value;
        setErrors([]);

    }

    const save = async () => {
        setLoading(true);
        console.log('Saving...', { pageId });

        // create new
        if (!pageId) {
            try {
                await pages.create({
                    name: pageDetails.pageName,
                    key: pageDetails.pageKey,
                    blocks: pageBlocks
                })
                setErrors([]);
            } catch (error) {
                console.error('Error creating page:', error);
                setErrors([error]);
            }
        }

        // update existing
        else {
            try {
                await pages.update(pageId, {
                    name: pageDetails.pageName,
                    key: pageDetails.pageKey,
                    blocks: pageBlocks
                });
                setErrors([]);
            } catch (error) {
                console.error('Error creating page:', error);
                setErrors([error]);
            }
        }

        setLoading(false);
    }

    return (
        <div className="single-crud-page">
            <h1>Create / Update Page</h1>

            <div className="flex-row top-bar">
                <p className="single-crud-id">{pageId || 'Creating new page...'}</p>
                <div className="button-group">
                    <button onClick={() => window.history.back()} className="secondary-btn">Back</button>
                    <button onClick={save}>Save</button>
                </div>
            </div>

            <div className="card-columns">
                <div className="col-66">
                    <p className="instruction">Add blocks below, then add your content and save.</p>

                    {allBlocks &&
                        <SelectRepeater
                            items={pageBlocks}updatePageBlocks
                            setItem={(item, index, remove = false) => {
                                updatePageBlocks({
                                    ...item,
                                    fields: item.fields.map(f => ({ ...f }))
                                }, null, null, remove);
                            }}
                            selectLabel="Add Block"
                            selectText="Select a block to add"
                            selectOptions={allBlocks}
                            selectLabelKey="name"
                            renderRow= {(item, index, updateItem) => (
                                <Card
                                    title={`Block - ${item.name}`}
                                >
                                    <PageBlockSwitch
                                        block={item}
                                        pageBlocks={pageBlocks}
                                        updatePageBlocks={updatePageBlocks}
                                        blockIndex={index}
                                        allBlocks={allBlocks}
                                        parentBlockInstanceId={null}
                                    />
                                </Card>
                            )}
                        />
                    }
                </div>

                <div className="col-33">
                    <Card
                        title="Page details"
                    >
                        <div className="flex-col">
                            <TextInput 
                                label="Page Name"
                                placeholder="Enter page Name"
                                value={pageDetails.pageName || ''}
                                onChange={(e) => {
                                    validateField(e)
                                    setPageDetails({
                                        ...pageDetails,
                                        pageName: e.target.value
                                    })
                                }}
                                errorMessage="Invalid page name"
                                isValid={true}
                            />

                            <TextInput 
                                label="Page Key"
                                placeholder="Enter page key"
                                value={pageDetails.pageKey || ''}
                                onChange={(e) => {
                                    validateField(e)
                                    setPageDetails({
                                        ...pageDetails,
                                        pageKey: e.target.value
                                    })
                                }}
                                errorMessage="Invalid page key"
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
                        itemName="Page"
                        loading={loading}
                        error={errors.length > 0}
                        isNew={!pageId}
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

export default PageSinglePage;
