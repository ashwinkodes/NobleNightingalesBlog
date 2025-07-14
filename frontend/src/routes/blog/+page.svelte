<script>
  import { onMount } from "svelte";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  let blogPosts = [];
  let searchQuery = "";
  let sortOption = "date"; // Default sort option
  let showMessage = false;
  let message = "";

  onMount(async () => {
    const response = await fetch(`${PUBLIC_API_BASE_URL}/posts`, {
      credentials: "include"
    });
    if (response.ok) {
      response.json().then((data) => {
        console.log(data);
        blogPosts = data;
      });
    } else {
      console.error("Failed to fetch blog posts");
    }
  });

  async function likePost(postId) {
    const response = await fetch(`${PUBLIC_API_BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    if (response.ok) {
      const data = await response.json();
      console.log(JSON.stringify(data));

      const updatedPosts = blogPosts.map((post) => {
        if (post.id === postId) {
          if (data.message.includes("Post liked successfully")) {
            post.likeCount += 1;
            message = "Post liked successfully!";
            post.isLiked = 1;
          } else if (data.message.includes("Post unliked successfully")) {
            post.likeCount -= 1;
            message = "Post unliked successfully!";
            post.isLiked = 0;
          }
        }
        return post;
      });

      blogPosts = updatedPosts;
      showMessage = true;
      setTimeout(() => {
        showMessage = false;
      }, 1000);
    } else {
      console.error("Failed to like the post");
      message = "Failed to like the post.";
      showMessage = true;
      setTimeout(() => {
        showMessage = false;
      }, 1000);
    }
  }

  async function searchPosts() {
    const response = await fetch(
      `${PUBLIC_API_BASE_URL}/posts/search?query=${searchQuery}&sortBy=${sortOption}`,
      {
        credentials: "include"
      }
    );
    console.log(response);
    if (response.ok) {
      const data = await response.json();
      blogPosts = [...data];
    } else {
      console.error("Failed to search posts");
    }
    console.log("Updated blogPosts:", blogPosts);
  }
</script>

<svelte:head>
  <title>Blog - Noble Nightingales</title>
</svelte:head>

<section class="blog-header">
  <h1>Explore our latest thoughts and experiences</h1>
</section>

<section class="blog-controls">
  <div class="search-bar">
    <input type="text" placeholder="Search articles..." bind:value={searchQuery} />
    <button on:click={searchPosts}>Search</button>
  </div>
  <div class="sort-options">
    <label for="sort">Sort by:</label>
    <select id="sort" bind:value={sortOption}>
      <option value="date">Date</option>
      <option value="title">Title</option>
      <option value="author">Author</option>
      <option value="likes">Likes</option>
    </select>
  </div>
</section>

<section class="blog-list">
  {#if blogPosts.length > 0}
    {#each blogPosts as post}
      <article class="blog-card">
        <div class="blog-content">
          <h2>{post.title}</h2>
          <p class="blog-excerpt">{post.excerpt}</p>
          <div class="blog-meta">
            <span>By {post.author.fname} {post.author.lname}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="blog-stats">
            <span class="like-wrapper">
              <div class="like-container">
                {#if post.isLiked}
                  <a href="#" class="like-blog" on:click|preventDefault={() => likePost(post.id)}>
                    <img src="/like.jpg" alt="Unlike" class="like-icon" />
                  </a>
                {:else}
                  <a href="#" class="like-blog" on:click|preventDefault={() => likePost(post.id)}>
                    <img src="/unlike.jpg" alt="Like" class="like-icon" />
                  </a>
                {/if}
              </div>
              <span class="like-count">{post.likeCount} likes</span>
            </span>

            <span>💬 {post.comments.length} comments</span>
          </div>
          <div class="post-actions">
            <a href={`/post/${post.id}`} class="read-more">Read more</a>
          </div>
        </div>
      </article>
    {/each}
  {:else}
    <p>No blog posts available at the moment.</p>
  {/if}
</section>

{#if showMessage}
  <div class="message">
    {message}
  </div>
{/if}

<style>
  .like-icon {
    margin-top: 4px;
    width: 20px;
    height: 20px;
  }

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

  .search-bar {
    display: flex;
    gap: 0.5rem;
  }

  .search-bar input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .search-bar button,
  .sort-options select {
    padding: 0.5rem 1rem;
    background-color: #555;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .search-bar button:hover,
  .sort-options select:hover {
    background-color: #333;
  }

  .blog-list {
    display: grid;
    gap: 2rem;
  }

  .blog-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease;
  }

  .blog-card:hover {
    transform: translateY(-5px);
  }

  .blog-content {
    padding: 1.5rem;
  }

  .blog-content h2 {
    margin-top: 0;
    color: #333;
  }

  .blog-excerpt {
    color: #666;
    margin-bottom: 1rem;
  }

  .blog-meta {
    display: flex;
    justify-content: space-between;
    color: #999;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .post-actions {
    display: flex;
    align-items: center;
  }

  .like-container {
    display: flex;
    align-items: center;
  }

  .like-wrapper {
    display: flex;
    align-items: center;
  }

  .like-count {
    margin-left: 7px;
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

  .like-blog {
    display: inline-block;
    padding: 0.5rem 1rem;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .blog-stats {
    display: flex;
    justify-content: space-between;
    color: #999;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
</style>
