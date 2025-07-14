import { PUBLIC_API_BASE_URL } from "$env/static/public";

export async function load({ fetch }) {
  const response = await fetch(`${PUBLIC_API_BASE_URL}/posts`, { 
    credentials: "include"
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const posts = await response.json();
  console.log('Fetched posts:', posts); // Added this line for debugging
  return { posts };
}