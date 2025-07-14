<script>
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  let username = "";
  let password = "";
  let confirmPassword = "";
  let firstName = "";
  let lastName = "";
  let dateOfBirth = "";
  let detail = "";
  let avatar = "";
  let customAvatar = "";
  let errorMessage = "";
  let isButtonDisabled = true;

  const presetAvatars = ["/image/avatar1.png", "/image/avatar2.png", "/image/avatar3.png"];
  let usernameAvailable = null;

  async function checkUsernameAvailability() {
    if (!username) {
      usernameAvailable = null;
      return;
    }

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/check-username/${username}`);
      if (response.ok) {
        const data = await response.json();
        usernameAvailable = data.available;
      } else {
        usernameAvailable = null;
      }
    } catch (error) {
      console.error("Error checking username availability:", error);
      usernameAvailable = null;
    }

    checkFormValidity();
  }

  // Check if required fields are filled and passwords match
  function checkFormValidity() {
    isButtonDisabled = !(
      username &&
      password &&
      confirmPassword &&
      firstName &&
      lastName &&
      password === confirmPassword &&
      avatar &&
      usernameAvailable
    );
  }

  // Handle form submission
  async function handleRegister(event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      errorMessage = "Passwords do not match!";
      return;
    }

    errorMessage = "";

    const registrationData = {
      username,
      password,
      fname: firstName,
      lname: lastName,
      bday: dateOfBirth,
      detail,
      avatar
    };

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registrationData)
      });

      // Log the full response to understand what is being returned
      console.log("Full response:", response);

      if (!response.ok) {
        const errorData = await response.text(); // Use text() to handle non-JSON responses
        console.error("Error response data:", errorData);
        errorMessage = "Registration failed: " + (errorData || response.statusText);
        return;
      }

      // If registration is successful, redirect to login page
      goto("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      errorMessage = "An error occurred during registration. Please try again.";
    }
  }
  // Navigate to login page
  function handleLogin() {
    goto("/login");
  }

  // Handle custom avatar upload
  async function handleCustomAvatar(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        customAvatar = reader.result; // 显示预览
        avatar = customAvatar; // 你可以在需要时使用这个值
        checkFormValidity();
      };
      reader.readAsDataURL(file);

      // 调用上传头像接口
      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const response = await fetch(`${PUBLIC_API_BASE_URL}/upload-avatar`, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Failed to upload avatar");
        }

        const data = await response.json();
        avatar = data.avatarUrl; // 更新头像 URL
      } catch (error) {
        console.error(error);
      }
    }
  }
</script>

<svelte:head>
  <title>Register - Noble Nightingales Blog</title>
</svelte:head>

<div class="register-container">
  <div class="register-card">
    <h2>Create an Account</h2>
    <form on:submit={handleRegister}>
      <!-- Username Field -->
      <div class="form-group">
        <label for="username">
          <span class="required">*</span> Username (REQUIRED)
        </label>
        <input
          id="username"
          type="text"
          placeholder="Choose a username"
          bind:value={username}
          required
          on:input={() => {
            checkUsernameAvailability();
            checkFormValidity();
          }}
        />
        {#if usernameAvailable === false}
          <p class="error-message">Username is already taken</p>
        {:else if usernameAvailable === true}
          <p class="success-message">Username is available</p>
        {/if}
      </div>

      <!-- Password Fields -->
      <div class="form-group">
        <label for="password">
          <span class="required">*</span> Password (REQUIRED)
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          bind:value={password}
          required
          on:input={checkFormValidity}
        />
      </div>
      <div class="form-group">
        <label for="confirmPassword">
          <span class="required">*</span> Confirm Password (REQUIRED)
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          bind:value={confirmPassword}
          required
          on:input={checkFormValidity}
        />
        {#if password !== confirmPassword && confirmPassword !== ""}
          <p class="error-message">Passwords do not match!</p>
        {/if}
      </div>

      <!-- First Name and Last Name Fields -->
      <div class="form-group">
        <label for="firstName">
          <span class="required">*</span> First Name (REQUIRED)
        </label>
        <input
          id="firstName"
          type="text"
          placeholder="Enter your first name"
          bind:value={firstName}
          required
          on:input={checkFormValidity}
        />
      </div>
      <div class="form-group">
        <label for="lastName">
          <span class="required">*</span> Last Name (REQUIRED)
        </label>
        <input
          id="lastName"
          type="text"
          placeholder="Enter your last name"
          bind:value={lastName}
          required
          on:input={checkFormValidity}
        />
      </div>

      <!-- Date of Birth Field (Optional) -->
      <div class="form-group">
        <label for="dateOfBirth">
          <span class="required">*</span> Date of Birth (REQUIRED)
        </label>
        <input
          id="dateOfBirth"
          type="date"
          bind:value={dateOfBirth}
          required
          on:input={checkFormValidity}
        />
      </div>

      <!-- About You Textarea -->
      <div class="form-group">
        <label for="detail">About You</label>
        <textarea
          id="detail"
          placeholder="Tell us a bit about yourself"
          bind:value={detail}
          rows="3"
          on:input={checkFormValidity}
        ></textarea>
      </div>

      <!-- Avatar Selection (Preset or Custom) -->
      <div class="form-group">
        <label>
          <span class="required">*</span> Select Your Avatar (REQUIRED)
        </label>
        <div class="avatar-selection">
          {#each presetAvatars as preset}
            <img
              src={preset}
              alt="Preset Avatar"
              class:avatar-selected={avatar === preset}
              on:click={() => {
                avatar = preset;
                customAvatar = "";
                checkFormValidity();
              }}
            />
          {/each}
        </div>
        <div class="custom-avatar">
          <label for="customAvatar">Or Upload Your Own</label>
          <input id="customAvatar" type="file" accept="image/*" on:change={handleCustomAvatar} />
        </div>
        {#if customAvatar}
          <div class="custom-avatar-preview">
            <img src={customAvatar} alt="Custom Avatar Preview" />
          </div>
        {/if}
      </div>

      <!-- Submit Button -->
      <button type="submit" class="register-button" disabled={isButtonDisabled}>Register</button>
    </form>

    <!-- Navigate to Login Button -->
    <button class="login-button" on:click={handleLogin}> Already have an account? Log in </button>
  </div>
</div>

<style>
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem 0;
  }

  .register-card {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
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

  input,
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  textarea {
    resize: vertical;
  }

  .register-button,
  .login-button {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .register-button {
    background-color: #99c3eb;
    color: white;
    margin-top: 1rem;
  }

  .register-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .register-button:hover:enabled {
    background-color: #3654a8;
  }

  .login-button {
    background-color: #f0f0f0;
    color: #333;
    margin-top: 1rem;
  }

  .login-button:hover {
    background-color: #e0e0e0;
  }

  .error-message {
    color: red;
    font-size: 0.875rem;
  }

  .avatar-selection {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
  }

  .avatar-selected {
    border-color: #3654a8;
  }

  .custom-avatar {
    margin-bottom: 1rem;
  }

  .custom-avatar-preview {
    text-align: center;
    margin-top: 1rem;
  }

  .custom-avatar-preview img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

  .required {
    color: red;
    margin-right: 0.25rem;
  }
  .error-message {
    color: red;
    font-size: 0.875rem;
  }

  .success-message {
    color: green;
    font-size: 0.875rem;
  }
</style>
