<script>
import { auth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  let firstName = $auth.user?.fname || "";
  let lastName = $auth.user?.lname || "";
  let username = $auth.user?.username || "";
  let dateOfBirth = $auth.user?.bday || "";
  let description = $auth.user?.detail || "";
  let newAvatar;
  let newPassword = "";
  let confirmPassword = "";
  let error = "";
  let success = "";
  let passwordMatchError = false;

  $: passwordMatchError = (newPassword || confirmPassword) && newPassword !== confirmPassword;

  function getAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    const cleanPath = avatarPath.replace(/^\//, "").replace(/^public\//, "");
    return `${PUBLIC_API_BASE_URL.replace(/\/api$/, "")}/${cleanPath}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    error = "";
    success = "";

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      error = "Passwords do not match";
      return;
    }

    try {
      const updateData = {
        fname: firstName,
        lname: lastName,
        username: username,
        bday: dateOfBirth,
        detail: description
      };

      if (newPassword) {
        updateData.password = newPassword;
      }

      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/${$auth.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      if (newAvatar && newAvatar.length > 0) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", newAvatar[0]);

        const avatarResponse = await fetch(`${PUBLIC_API_BASE_URL}/users/${$auth.user.id}/avatar`, {
          method: "POST",
          body: avatarFormData,
          credentials: "include"
        });

        if (!avatarResponse.ok) {
          throw new Error("Failed to update avatar");
        }
      }

      success = "Profile updated successfully!";
      await auth.checkAuth();
      setTimeout(() => {
        goto("/user");
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      error = err.message;
    }
  }

  function handleCancel() {
    goto("/user");
  }
</script>

<svelte:head>
  <title>Edit Profile - Noble Nightingales</title>
</svelte:head>

<div class="edit-profile-container">
  <div class="edit-profile-card">
    <h2>Edit Profile</h2>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}

    {#if success}
      <div class="success-message">{success}</div>
    {/if}

    <form on:submit={handleSubmit}>
      <div class="form-group">
        <label for="avatar">Profile Picture</label>
        <div class="avatar-preview">
          {#if $auth.user?.avatarUrl}
            <img
              src={getAvatarUrl($auth.user.avatarUrl)}
              alt="Current avatar"
              class="current-avatar"
            />
          {:else}
            <div class="avatar-placeholder">
              {$auth.user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
          {/if}
        </div>
        <input type="file" id="avatar" accept="image/*" bind:files={newAvatar} class="file-input" />
      </div>

      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" bind:value={username} required />
      </div>

      <div class="form-group">
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" bind:value={firstName} required />
      </div>

      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" bind:value={lastName} required />
      </div>

      <div class="form-group">
        <label for="dateOfBirth">Date of Birth</label>
        <input type="date" id="dateOfBirth" bind:value={dateOfBirth} required />
      </div>

      <div class="form-group">
        <label for="description">About You</label>
        <textarea id="description" bind:value={description} rows="4"></textarea>
      </div>

      <div class="password-section">
        <h3>Change Password(optional)</h3>
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            bind:value={newPassword}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            bind:value={confirmPassword}
            class:error={passwordMatchError}
            placeholder="Leave blank to keep current password"
          />
          {#if passwordMatchError}
            <span class="password-error">Passwords do not match</span>
          {/if}
        </div>
      </div>

      <div class="button-group">
        <button type="button" class="cancel-button" on:click={handleCancel}> Cancel </button>
        <button type="submit" class="save-button" disabled={passwordMatchError}>
          Save Changes
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .edit-profile-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }

  .edit-profile-card {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
  }

  h2 {
    margin-bottom: 2rem;
    text-align: center;
    color: #333;
  }

  h3 {
    margin: 2rem 0 1rem;
    color: #333;
    font-size: 1.2rem;
  }

  .error-message {
    background-color: #fee;
    color: #c00;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .success-message {
    background-color: #efe;
    color: #0c0;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-weight: 500;
  }

  input[type="text"],
  input[type="date"],
  input[type="password"],
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  input.error {
    border-color: #c00;
    background-color: #fff8f8;
  }

  .password-error {
    color: #c00;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
  }

  textarea {
    resize: vertical;
  }

  .avatar-preview {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
  }

  .current-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #555;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
  }

  .file-input {
    width: 100%;
    padding: 0.5rem 0;
  }

  .password-section {
    border-top: 1px solid #eee;
    margin-top: 2rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .cancel-button,
  .save-button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .cancel-button {
    background-color: #f0f0f0;
    color: #333;
  }

  .cancel-button:hover {
    background-color: #e0e0e0;
  }

  .save-button {
    background-color: #99c3eb;
    color: white;
  }

  .save-button:hover:not(:disabled) {
    background-color: #3654a8;
  }

  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
