import { PUBLIC_API_BASE_URL, PUBLIC_SERVER_URL } from "$env/static/public";

export function getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    // Remove public and clean slashes
    const cleanPath = imagePath
        .replace(/^\//, '')
        .replace(/^public\//, '')
        .replace('uploads/', 'upload/'); // Fix uploads vs upload

    console.log('Original path:', imagePath);
    console.log('Cleaned path:', cleanPath);
    return `${PUBLIC_SERVER_URL}/${cleanPath}`;
}

export function getAvatarUrl(avatarPath) {
    if (!avatarPath) return '/userDefaultIcon.png';
    const path = getImageUrl(avatarPath);
    console.log('Avatar URL:', path);
    return path;
}