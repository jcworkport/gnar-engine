import React from "react";
import CustomSelect from "../CustomSelect/CustomSelect";

const SelectRepeater = ({ items = [], setItems, renderRow, selectLabel, selectText, selectOptions, selectLabelKey }) => {

    const addItem = (item) => {
        setItems([...items, item]);
    }

    const updateItem = (index, newItem) => {
        const newItems = [...items];
        newItems[index] = newItem;
        setItems(newItems);
    };
  
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    return (
        <div className="repeater">
            {items.length > 0 && items.map((item, index) => 
                <div className="repeater-row" key={index}>
                    {renderRow(item, index, (newItem) => updateItem(index, newItem))}
                    <span onClick={() => removeItem(index)} className="icon-delete remove-repeater-row"></span>
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
