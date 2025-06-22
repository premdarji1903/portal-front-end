import { VITE_GOOGLE_CALLBACK_URL, VITE_GOOGLE_CLIENT_ID } from "./ennvirnmentVariables";

function generateRandomState(): string {
    // Generates a secure, URL-safe random string
    return crypto.randomUUID(); // or use a custom base64 or hex string if needed
}

export function googleRedirectUrl(): string {
    const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    const clientId = VITE_GOOGLE_CLIENT_ID;
    const redirectUri = VITE_GOOGLE_CALLBACK_URL;
    const scopes = encodeURIComponent("openid email profile");
    const state = generateRandomState();

    const authUrl = `${GOOGLE_OAUTH_URL}?client_id=${clientId}&redirect_uri=${redirectUri}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;

    console.log(authUrl);
    return authUrl;
}
