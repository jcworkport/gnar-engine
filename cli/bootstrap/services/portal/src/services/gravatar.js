import CryptoJS from "crypto-js";

export function getGravatarUrl(email, options) {
    const {
        size = 200,
        defaultImage = "mp",
        rating = "g"
    } = options;

    const normalized = email.trim().toLowerCase();
    const hash = CryptoJS.MD5(normalized).toString(CryptoJS.enc.Hex);
    
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}&r=${rating}`;
}
