import React, { useState, useEffect } from 'react';

function ImageMultiInput({ key, label, value: uploadedImages, onChange: setUploadedImages }) {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleFileSelection = (files) => {
        const validFiles = Array.from(files).filter(
            (file) =>
                [
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                    'image/gif',
                    'image/svg+xml'
                ].includes(file.type) &&
                file.size <= 5 * 1024 * 1024 
        );

        const filePreviews = validFiles.map((file) => URL.createObjectURL(file));

        setSelectedFiles((prev) => {
            const updatedFiles = [...prev, ...validFiles];
            setUploadedImages(updatedFiles); 
            return updatedFiles;
        });
        setImagePreviews((prev) => [...prev, ...filePreviews]);
    };

    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files) {
            handleFileSelection(files);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files) {
            handleFileSelection(files);
        }
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles((prev) => {
            const updatedFiles = prev.filter((_, i) => i !== index);
            setUploadedImages(updatedFiles);
            return updatedFiles;
        });
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
        };
    }, [imagePreviews]);

    return (
        <div className="image-input">
            {label && <label>{label}</label>}

                        <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{
                    border: '2px dashed #ccc',
                    padding: '20px',
                    textAlign: 'center',
                    marginBottom: '20px',
                }}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-input"
                />
                <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                    <p className="plus-symbol">+</p>
                    <p className="upload-text">Click or drag and drop here to upload</p>
                    <p className="upload-text">(JPEG, PNG, JPG, GIF, SVG)</p>
                    <p className="upload-text">Maximum file size: 5 MB.</p>
                </label>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {imagePreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                        <img
                            src={preview}
                            alt="preview"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                        <button
                            onClick={() => handleRemoveFile(index)}
                            style={{
                                position: 'absolute',
                                width: '20px',
                                height: '20px',
                                top: '0px',
                                right: '5px',
                                background: 'red',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                padding: '5px',
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ImageMultiInput;
