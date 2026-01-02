
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // returns "data:image/png;base64,..."
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
