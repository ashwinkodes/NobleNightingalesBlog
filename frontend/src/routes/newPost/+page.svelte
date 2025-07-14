<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  let blogPosts = [];
  let showMessage = false;
  let message = "";

  onMount(async () => {
    tinymce.init({
      selector: "#tinydemo"
    });

    const response = await fetch(`${PUBLIC_API_BASE_URL}/posts/getmyposts`, {
      credentials: "include"
    });
    if (response.ok) {
      response.json().then((data) => {
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
    console.log(response);
    if (response.ok) {
      const data = await response.json();
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
      }, 3000);
    } else {
      console.error("Failed to like the post");
      message = "Failed to like the post.";
      showMessage = true;
      setTimeout(() => {
        showMessage = false;
      }, 3000);
    }

    const response_1 = await fetch(`${PUBLIC_API_BASE_URL}/posts/getmyposts`, {
      credentials: "include"
    });
    if (response_1.ok) {
      response_1.json().then((data) => {
        blogPosts = data;
      });
    } else {
      console.error("Failed to fetch blog posts");
    }
  }

  async function handleDelete(articleId) {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/posts/${articleId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        const response = await fetch(`${PUBLIC_API_BASE_URL}/posts/getmyposts`, {
          credentials: "include"
        });
        if (response.ok) {
          response.json().then((data) => {
            blogPosts = data;
          });
        } else {
          console.error("Failed to fetch blog posts");
        }
      } else {
        console.error("delete failed");
      }
    } catch (error) {
      console.error("delete error:", error);
    }
  }
</script>

<svelte:head>
  <title>Blog - Noble Nightingales</title>
</svelte:head>

<section class="blog-header">
  <h1>My Articles</h1>
</section>

<section class="blog-controls">
  <a href={`/add`} class="add-button">Add</a>
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
            <a href={`/editArticle/${post.id}`} class="read-more">Edit</a>
            <a href="#" class="read-more" on:click|preventDefault={() => handleDelete(post.id)}
              >Delete</a
            >
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
    justify-content: space-between;
    align-items: center;
  }

  .read-more {
    width: auto;
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #99c3eb;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    white-space: nowrap;
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

  .like-blog:hover {
    background-color: #3654a8;
  }

  .blog-stats {
    display: flex;
    justify-content: space-between;
    color: #999;
    font-size: 0.9rem;
    margin-bottom: 1rem;
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

  .like-icon {
    margin-top: 4px;
    width: 20px;
    height: 20px;
  }

  .add-button {
    width: auto;
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #555;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    white-space: nowrap;
  }

  .add-button:hover {
    background-color: #333;
  }
</style>
