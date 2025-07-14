<script>
  import "$lib/css/app.css";
  import { page } from "$app/stores";
  import { auth } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  $: path = $page.url.pathname;

  function getAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    const cleanPath = avatarPath.replace(/^\//, "").replace(/^public\//, "");
    if (!cleanPath.startsWith("image")) {
      return `${PUBLIC_API_BASE_URL.replace(/\/api$/, "")}/${cleanPath}`;
    } else {
      return "/" + cleanPath;
    }
  }

  onMount(() => {
    auth.checkAuth();
  });
</script>

<nav>
  <div class="nav-container">
    <ul class="nav-links left">
      <li><a href="/" class:active={path === "/"}>Home</a></li>
      <li><a href="/blog" class:active={path === "/blog"}>Blog</a></li>
    </ul>
    
    <a href="/" class="logo">Noble Nightingales Blog</a>
    
    <ul class="nav-links right">
      <li>
        <a href={$auth.isAuthenticated ? "/newPost" : "/login"} class:active={path === "/newPost"}>
          Publish
        </a>
      </li>
      {#if $auth.isAuthenticated}
        <li>
          <a href="/user" class="avatar-link" class:active={path === "/user"}>
            {#if $auth.user?.avatarUrl}
              <img
                src={getAvatarUrl($auth.user.avatarUrl)}
                alt="User avatar"
                class="avatar"
                on:error={(e) => {
                  console.log("Avatar failed to load:", getAvatarUrl($auth.user.avatarUrl));
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
              />
              <div class="avatar-placeholder" style="display: none;">
                {$auth.user?.username?.[0]?.toUpperCase() ?? "U"}
              </div>
            {:else}
              <div class="avatar-placeholder">
                {$auth.user?.username?.[0]?.toUpperCase() ?? "U"}
              </div>
            {/if}
          </a>
        </li>
      {:else}
        <li><a href="/login" class:active={path === "/login"}>Login</a></li>
      {/if}
    </ul>
  </div>
</nav>

<main>
  <slot />
</main>

<footer>
  <p>&copy; 2024 Noble Nightingales Blog. All rights reserved.</p>
</footer>

<style>
  nav {
    background-color: #333;
    color: white;
    padding: 1rem 0;
    border-radius: 10px;
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
    text-align: center;
    padding: 0 2rem;
    white-space: nowrap;
  }

  .nav-links {
    list-style-type: none;
    display: flex;
    gap: 1rem;
    align-items: center;
    margin: 0;
    padding: 0;
    min-width: 200px;
  }

  .nav-links.left {
    justify-content: flex-start;
  }

  .nav-links.right {
    justify-content: flex-end;
  }

  .nav-links a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    white-space: nowrap;
  }

  .nav-links a:hover,
  .nav-links a.active {
    background-color: #555;
  }

  .avatar-link {
    padding: 0 !important;
    display: flex;
    align-items: center;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  footer {
    color: white;
    text-align: center;
    padding: 1rem 0;
    background-color: #333;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    .nav-container {
      flex-direction: column;
      padding: 1rem;
    }

    .nav-links {
      min-width: 0;
      width: 100%;
      justify-content: center;
      padding: 0.5rem 0;
    }

    .nav-links.left,
    .nav-links.right {
      justify-content: center;
    }

    .logo {
      font-size: 1.25rem;
      padding: 0.5rem 0;
    }
  }

  @media (max-width: 480px) {
    .nav-container {
      padding: 0.5rem;
    }

    .nav-links {
      gap: 0.5rem;
    }

    .nav-links a {
      padding: 0.25rem 0.5rem;
      font-size: 0.9rem;
    }
  }
</style>