


import React, { useState, useEffect } from 'react';


function SaveButton({onClick, itemName, loading, error, isNew}) {

    const [text, setText] = useState('Save');
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        if (loading) {
            setDisabled(true);

            if (isNew) {
                setText(`Creating new ${itemName}...`);
            } else {
                setText(`Updating ${itemName}...`);
            }
        } else if (error) {
            setText(`Error saving ${itemName}`);

            setTimeout(() => {
                setDisabled(false);
                setText(`Save`);
            }, 2000);
        }
    }, [loading, error]);

    return (
        <button 
            disabled={disabled}
            onClick={onClick}
            className={`save-button ${loading ? 'loading' : ''} ${error ? 'error' : ''}`}
        >
            {text}
        </button>
    )
}

export default SaveButton;
