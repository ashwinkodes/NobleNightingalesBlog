<script>
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { auth } from "$lib/stores/auth";

  let username = "";
  let password = "";
  let error = "";
  let loading = false;

  async function handleLogin(event) {
    event.preventDefault();
    loading = true;
    error = "";

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      if (response.ok) {
        const { token } = await response.json();
        const success = await auth.login(token);
        if (success) {
          goto("/");
        } else {
          error = "Failed to load user data";
        }
      } else {
        const errorData = await response.json();
        error = errorData.message || "Login failed";
      }
    } catch (err) {
      error = "An error occurred during login";
      console.error("Login error:", err);
    } finally {
      loading = false;
    }
  }

  function handleCreateUser() {
    goto("/register");
  }
</script>

<svelte:head>
  <title>Login - Noble Nightingales</title>
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <h2>Login</h2>
    {#if error}
      <div class="error-message">{error}</div>
    {/if}
    <form on:submit={handleLogin}>
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          bind:value={username}
          disabled={loading}
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          bind:value={password}
          disabled={loading}
          required
        />
      </div>
      <button type="submit" class="login-button" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
    <button class="create-user-button" on:click={handleCreateUser} disabled={loading}>
      Create New User
    </button>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 200px);
  }

  .login-card {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  .error-message {
    background-color: #fee;
    color: #c00;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .login-button,
  .create-user-button {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .login-button:disabled,
  .create-user-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .login-button {
    background-color: #99c3eb;
    color: white;
    margin-top: 1rem;
  }

  .login-button:hover:not(:disabled) {
    background-color: #3654a8;
  }

  .create-user-button {
    background-color: #f0f0f0;
    color: #333;
    margin-top: 1rem;
  }

  .create-user-button:hover:not(:disabled) {
    background-color: #e0e0e0;
  }
</style>
