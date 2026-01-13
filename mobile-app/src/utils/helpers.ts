
import { Config } from '../constants/Config';

export const resolveImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('https')) {
        return path;
    }
    // Remove leading slash if present to avoid double slash if BASE_URL ends with /
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const cleanBase = Config.BASE_URL.endsWith('/') ? Config.BASE_URL : `${Config.BASE_URL}/`;
    return `${cleanBase}${cleanPath}`;
};
