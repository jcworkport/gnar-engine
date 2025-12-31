import React, { useState, useEffect } from 'react';
import Card from '../../layouts/Card/Card';
import SelectRepeater from '../../elements/SelectRepeater/SelectRepeater';
import SaveButton from '../../elements/SaveButton/SaveButton';
import TextInput from '../../components/TextInput/TextInput';
import CustomSelect from '../../elements/CustomSelect/CustomSelect';
import { blocks } from '../../services/block.js';
import { fieldTypes } from '../../data/pages.data.js';
import { useParams } from "react-router-dom";

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
                setAllBlocks(blocksData.blocks || []);
            } catch (error) {
                console.error('Error fetching blocks data:', error);
                setErrors([error]);
            }
        })();
    }, []);

    // fetch data if editing existing
    useEffect(() => {
        if (id && id !== 'new') {
            (async () => {
                setLoading(true);
                try {
                    let pageData = await pages.getSingle(id);
                    pageData = pageData.block;
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
                await blocks.update(pageId, {
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
                            items={pageBlocks}
                            setItems={setPageBlocks}
                            selectLabel="Add Block"
                            selectText="Select a block to add"
                            selectOptions={allBlocks}
                            selectLabelKey="name"
                            renderRow= {(item, index, updateItem) => (
                                <Card
                                    title={`Block - ${item.name}`}
                                >
                                    {item.fields.map(field => {
                                        switch (field.type) {
                                            case 'text':
                                                return (
                                                    <TextInput
                                                        key={field.key}
                                                        label={field.name}
                                                        placeholder={`Enter ${field.name}`}
                                                        value={item.content?.[field.key] || ''}
                                                        onChange={(e) => {
                                                            const newItem = { ...item };
                                                            if (!newItem.content) newItem.content = {};
                                                            newItem.content[field.key] = e.target.value;
                                                            setPageBlocks([
                                                                ...pageBlocks.slice(0, index),
                                                                newItem,
                                                                ...pageBlocks.slice(index + 1)
                                                            ]);
                                                        }}
                                                        errorMessage={`Invalid ${field.name}`}
                                                        isValid={true}
                                                    />
                                                );
                                            break;
                                        }
                                    })}
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
