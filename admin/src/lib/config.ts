// Use environment variable if available (Vite uses import.meta.env)
// Otherwise fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_BASE_URL = `${BASE_URL}/api`;
export const UPLOAD_BASE_URL = BASE_URL;
