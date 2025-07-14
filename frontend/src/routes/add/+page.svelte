<script>
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  const apiBaseUrl = PUBLIC_API_BASE_URL;
  let imageFile;
  let showMessage = false;
  let message = "";
  let description = "";
  let title = "";
  let excerpt = "";

  async function handleUpdate(event) {
    event.preventDefault();

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await handleImageUpload(imageFile[0]);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title,
          content: description,
          excerpt,
          imageUrl: imageUrl
        }),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Failed to update user information");
      }

      alert("Save successfully!");
      goto("/newPost");
    } catch (error) {
      console.error("Error save post:", error);
      errorMessage = "An error occurred while updating user information.";
    }
  }

  async function handleImageUpload(file) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${apiBaseUrl}/posts/upload-image`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image.");
      return null;
    }
  }
</script>

<svelte:head>
  <title>Blog - Noble Nightingales</title>
</svelte:head>

<section class="blog-header">
  <h1>Write your article</h1>
</section>

<section class="blog-controls"></section>

<section class="blog-list">
  <div class="user-container">
    <form on:submit={handleUpdate}>
      <div class="form-group">
        <label for="title">Title</label>
        <input id="title" type="text" bind:value={title} required placeholder="Title" />
      </div>
      <div class="form-group">
        <label for="excerpt">Excerpt</label>
        <textarea
          id="excerpt"
          bind:value={excerpt}
          rows="1"
          class="excerpt-textarea"
          placeholder="Enter a brief summary of your post..."
        ></textarea>
      </div>
      <div class="form-group">
        <label for="description">Post Content</label>
      </div>
      <textarea bind:value={description} id="tinydemo" placeholder="Content"></textarea>
      <button type="submit" class="update-button">Save</button>

      <div>
        <label for="image">Image (optional):</label>
        <input type="file" id="image" name="image" accept="image/*" bind:files={imageFile} />
      </div>
    </form>
  </div>
</section>

{#if showMessage}
  <div class="message">
    {message}
  </div>
{/if}

<style>
  .message {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #4caf50;
    color: white;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  .blog-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .blog-header h1 {
    font-size: 2.5rem;
    color: #333;
  }

  .blog-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .user-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .excerpt-textarea {
    resize: vertical;
    min-height: 40px;
    margin-bottom: 0.5rem;
  }

  .update-button {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .update-button {
    background-color: #99c3eb;
    color: white;
    margin-top: 1rem;
  }
</style>
