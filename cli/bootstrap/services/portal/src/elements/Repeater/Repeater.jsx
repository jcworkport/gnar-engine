import React from "react";

/**
 * Repeater component allows users to add, update, and remove items from a list
 *
 * Use setItems to manage state setting here, or use setItem override to manage state setting higher up
 */
const Repeater = ({ items = [], setItems, setItem, defaultItem, renderRow, buttonText }) => {

    const addItem = () => {
        if (setItem) {
            setItem(defaultItem);
        } else if (setItems) {
            setItems([...items, defaultItem]);
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
                <button className="add-repeater-row" onClick={addItem}>{buttonText}</button>
            </div>
        </div>
    );
};

export default Repeater;
