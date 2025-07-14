import { PUBLIC_API_BASE_URL, PUBLIC_SERVER_URL } from "$env/static/public";
export const BASE_URL = PUBLIC_API_BASE_URL;
// Used for getting / updating info about the articles
export const ARTICLES_URL = `${BASE_URL}/articles`;
export const USER_URL = `${BASE_URL}/user`;
export const SERVER_URL = PUBLIC_SERVER_URL;