import React from "react";
import CustomSelect from "../CustomSelect/CustomSelect";

/**
 * SelectRepeater component allows users to add, update, and remove items from a list using a select dropdown.
 *
 * Use setItems to manage state setting here, or use setItem override to manage state setting higher up
 */
const SelectRepeater = ({ items = [], setItems, setItem, renderRow, selectLabel, selectText, selectOptions, selectLabelKey }) => {

    const addItem = (item) => {
        if (setItem) {
            setItem(item);
        } else if (setItems) {
            setItems([...items, item]);
        }
    }

    const updateItem = (index, newItem) => {
        if (setItem) {
            setItem(newItem, index);
        } else if (setItems) {
            const newItems = [...items];
            newItems[index] = newItem;
            setItems(newItems);
        }
    }

    const removeItem = (item, index) => {
        if (setItem) {
            const remove = true;
            setItem(item, index, remove);
        } else {
            setItems(items.filter((_, i) => i !== index));
        }
    }

    return (
        <div className="repeater">
            {items.length > 0 && items.map((item, index) => 
                <div className="repeater-row" key={index}>
                    {renderRow(item, index, (newItem) => updateItem(index, newItem))}
                    <span onClick={() => removeItem(item, index)} className="icon-delete remove-repeater-row"></span>
                </div>
            )}
            <div className="button-cont">
                <CustomSelect
                    label={selectLabel}
                    placeholder={selectText}
                    name="repeater-select"
                    options={selectOptions}
                    labelKey={selectLabelKey}
                    setSelectedOption={(option) => {
                        addItem(option);
                    }}
                    selectedOption={null}
                />
            </div>
        </div>
    );
};

export default SelectRepeater;
