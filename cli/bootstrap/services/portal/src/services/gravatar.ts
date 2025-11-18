import CryptoJS from "crypto-js";

export interface GravatarOptions {
  size?: number;
  defaultImage?: string;
  rating?: string;
}

export function getGravatarUrl(email: string, options: GravatarOptions = {}): string {
    const {
        size = 200,
        defaultImage = "mp",
        rating = "g"
    } = options;

    const normalized = email.trim().toLowerCase();
    const hash = CryptoJS.MD5(normalized).toString(CryptoJS.enc.Hex);
    
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}&r=${rating}`;
}
