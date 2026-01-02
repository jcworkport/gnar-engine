import TextInput from '../../elements/TextInput/TextInput';
import Repeater from '../../elements/Repeater/Repeater';
import RichTextInput from '../../elements/RichTextInput/RichTextInput';
import ImageInput from '../../elements/ImageInput/ImageInput';
import { v4 as uuidv4 } from 'uuid';

function PageBlockSwitch({ block, pageBlocks, updatePageBlocks, blockIndex, allBlocks, parentBlockInstanceId }) {

    return (
        <>
            {block.fields.map(field => {
                switch (field.type) {

                    // text input
                    case 'text':
                        return (
                            <TextInput
                                key={field.key}
                                label={field.name}
                                placeholder={`Enter ${field.name}`}
                                value={field.value || ''}
                                onChange={(e) => {
                                    const newBlock = {
                                        ...block,
                                        fields: block.fields.map(f => ({ ...f }))
                                    };
                                    const newField = newBlock.fields.find(f => f.key === field.key);
                                    newField.value = e.target.value;
                                    updatePageBlocks(newBlock);
                                }}
                                errorMessage={`Invalid ${field.name}`}
                                isValid={true}
                            />
                        );

                    // rich text
                    case 'richtext':
                        return (
                            <RichTextInput
                                key={field.key}
                                label={field.name}
                                value={field.value || ''}
                                onChange={(value) => {
                                    const newBlock = {
                                        ...block,
                                        fields: block.fields.map(f => ({ ...f }))
                                    };
                                    const newField = newBlock.fields.find(f => f.key === field.key);
                                    newField.value = value;
                                    updatePageBlocks(newBlock);
                                }}
                                errorMessage={`Invalid ${field.name}`}
                                isValid={true}
                            />
                        );

                    // image input
                    case 'image':
                        return (
                            <ImageInput
                                key={field.key}
                                label={field.name}
                                value={field.value || ''}
                                onChange={(base64File, mimeType, fileName) => {
                                    console.log('image field change value:', value);
                                    const newBlock = {
                                        ...block,
                                        fields: block.fields.map(f => ({ ...f }))
                                    };
                                    const newField = newBlock.fields.find(f => f.key === field.key);
                                    newField.value = newField.value || {};
                                    newField.value.file = base64File;
                                    newField.value.mimeType = mimeType;
                                    newField.value.fileName = fileName;
                                    updatePageBlocks(newBlock);
                                }}
                                errorMessage={`Invalid ${field.name}`}
                                isValid={true}
                            />
                        );

                    // repeater
                    case 'repeater':
                        const newRepeaterBlock = allBlocks.find(b => b.key === field.repeaterType);
                        const defaultItem = {
                            ...newRepeaterBlock,
                            instanceId: uuidv4(),
                            fields: newRepeaterBlock.fields.map(f => ({ ...f }))
                        };
                        delete defaultItem.id;
                        const existingRepeaterBlocks =  block.fields.find(f => f.key === field.key)?.value || [];

                        return (
                            <div className="nested-block">
                                <Repeater
                                    items={existingRepeaterBlocks}
                                    setItem={(item, index, remove = false) => {
                                        const parentInstanceId = block.instanceId;
                                        updatePageBlocks({
                                            ...item,
                                            fields: item.fields.map(f => ({ ...f })) 
                                        }, parentInstanceId, item.key, remove);
                                    }}
                                    defaultItem={defaultItem}
                                    buttonText={`Add ${field.name}`}
                                    renderRow={(item, index, updateItem) => {
                                        console.log('Rendering nested PageBlockSwitch for item:', item);

                                        return (
                                            <PageBlockSwitch
                                                block={item}
                                                pageBlocks={pageBlocks}
                                                updatePageBlocks={updatePageBlocks}
                                                blockIndex={index}
                                                allBlocks={allBlocks}
                                                parentBlockInstanceId={block.instanceId}
                                            />
                                        )
                                    }}
                                />
                            </div>
                        );

                }
            })}
        </>
    )
}

export default PageBlockSwitch;
