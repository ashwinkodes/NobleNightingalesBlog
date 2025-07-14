<script>
  import { auth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import Modal from "$lib/components/Modal.svelte";

  let userPosts = [];
  let showPopupBox = false;
  let showDeletePopupBox = false;

  // Function to get full avatar URL from backend
  function getAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    // Remove any leading slash and 'public' from the path
    const cleanPath = avatarPath.replace(/^\//, "").replace(/^public\//, "");
    // Construct URL pointing directly to the static file serving path
    if (!cleanPath.startsWith("image")) {
      return `${PUBLIC_API_BASE_URL.replace(/\/api$/, "")}/${cleanPath}`;
    } else {
      return "/" + cleanPath;
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include"
      });

      if (response.ok) {
        auth.logout();
        goto("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Fetch user's posts when component is created
  fetch(`${PUBLIC_API_BASE_URL}/posts`, {
    credentials: "include"
  })
    .then((response) => response.json())
    .then((allPosts) => {
      userPosts = allPosts.filter((post) => post.author.id === $auth.user.id);
    })
    .catch((error) => {
      console.error("Error fetching user posts:", error);
    });
</script>

<svelte:head>
  <title>User Profile - Noble Nightingales</title>
</svelte:head>

<div class="profile-container">
  <div class="profile-card">
    <div class="profile-header">
      <div class="avatar-section">
        {#if $auth.user?.avatarUrl}
          <img
            src={getAvatarUrl($auth.user.avatarUrl)}
            alt="User avatar"
            class="profile-avatar"
            on:error={(e) => {
              console.log("Avatar failed to load:", getAvatarUrl($auth.user.avatarUrl));
              e.target.style.display = "none";
              e.target.nextElementSibling.style.display = "flex";
            }}
          />
          <div class="profile-avatar-placeholder" style="display: none;">
            {$auth.user?.username?.[0]?.toUpperCase() ?? "U"}
          </div>
        {:else}
          <div class="profile-avatar-placeholder">
            {$auth.user?.username?.[0]?.toUpperCase() ?? "U"}
          </div>
        {/if}
      </div>
      <div class="header-content">
        <h2>{$auth.user?.username}</h2>
        <div class="button-group">
          <a href="/editUser" class="edit-button">Edit Profile</a>
          <button class="logout-button" on:click={handleLogout}>Logout</button>
        </div>
      </div>
    </div>

    <div class="profile-info">
      <p><strong>Name:</strong> {$auth.user?.fname} {$auth.user?.lname}</p>
      <p><strong>Date of Birth:</strong> {new Date($auth.user?.bday).toLocaleDateString()}</p>
      <p><strong>About:</strong> {$auth.user?.detail}</p>
    </div>

    <div class="user-posts">
      <h3>My Articles</h3>
      {#if userPosts.length > 0}
        <div class="posts-grid">
          {#each userPosts as post}
            <article class="post-card">
              <h4>{post.title}</h4>
              <p class="post-excerpt">{post.excerpt}</p>
              <div class="post-meta">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <div class="post-stats">
                  <span>❤️ {post.likeCount}</span>
                  <span>💬 {post.comments.length}</span>
                </div>
              </div>
              <a href={`/post/${post.id}`} class="read-more">Read more</a>
            </article>
          {/each}
        </div>
      {:else}
        <p class="no-posts">You haven't written any articles yet.</p>
      {/if}
    </div>
  </div>
  {#if showDeletePopupBox}
    <Modal
      bind:showPopupBox={showDeletePopupBox}
      description={"Are you sure you want to delete this user?"}
      buttons={[
        {
          text: "Confirm",
          onClick: handleDelete
        }
      ]}
    />
  {/if}
</div>

<style>
  .profile-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }

  .profile-card {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 1200px;
  }

  .profile-header {
    display: flex;
    margin-bottom: 2rem;
  }

  .avatar-section {
    margin-right: 2rem;
  }

  .header-content {
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .button-group {
    display: flex;
    gap: 1rem;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }

  .profile-avatar-placeholder {
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

  .profile-info {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #eee;
  }

  .profile-info p {
    margin: 0.5rem 0;
  }

  .edit-button,
  .logout-button,
  .delete-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    text-decoration: none;
  }

  .edit-button {
    background-color: #555;
    color: white;
    display: inline-block;
  }

  .edit-button:hover {
    background-color: #444;
  }

  .logout-button,
  .delete-button {
    background-color: #dc3545;
    color: white;
  }

  .logout-button:hover,
  .delete-button:hover {
    background-color: #c82333;
  }

  .user-posts {
    margin-top: 2rem;
  }

  .posts-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .post-card {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #eee;
  }

  .post-card h4 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  .post-excerpt {
    color: #666;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .post-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #999;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .post-stats {
    display: flex;
    gap: 1rem;
  }

  .read-more {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #99c3eb;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .read-more:hover {
    background-color: #3654a8;
  }

  .no-posts {
    text-align: center;
    color: #666;
    font-style: italic;
  }
</style>
