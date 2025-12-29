import React from "react";

const Repeater = ({ items = [], setItems, defaultItem, renderRow, buttonText }) => {

    const addItem = () => {
        setItems([...items, defaultItem]);
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
                    <button onClick={() => removeItem(index)} className="remove-repeater-row">Remove</button>
                </div>
            )}
            <div className="button-cont">
                <button className="add-repeater-row" onClick={addItem}>{buttonText}</button>
            </div>
        </div>
    );
};

export default Repeater;
