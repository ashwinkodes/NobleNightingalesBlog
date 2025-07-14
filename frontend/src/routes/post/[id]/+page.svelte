<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { auth } from "$lib/stores/auth";
  import CommentList from "$lib/components/CommentList.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { goto } from "$app/navigation";


  let article = null;
  let loading = true;
  let error = null;
  let images = [];
  let numComments = 0;
  let comments = [];
  let authorId = null;
  let authorName = "";
  let loginUser = {};
  let showDeletePopupBox = false;
  loginUser = $auth.user || {};
  let user_id = $auth.user != null ? $auth.user.id : 0;
  let message = "";

  // alert(JSON.stringify(loginUser))

  function getImageUrl(imageUrl) {
    // Remove any leading slash
    const cleanPath = imageUrl.replace(/^\//, "");
    // Create URL pointing directly to the static file serving path
    return `${PUBLIC_API_BASE_URL.replace(/\/api$/, "")}/${cleanPath}`;
  }

  async function loadPostImages(postId) {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/posts/${postId}/images`, {
        credentials: "include"
      });
      if (response.ok) {
        images = await response.json();
        console.log("Loaded images:", images); // Debug log
      }
    } catch (e) {
      console.error("Error loading post images:", e);
    }
  }

  onMount(async () => {
    const articleId = $page.params.id;
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/posts/${articleId}`, {
        credentials: "include"
      });
      if (response.ok) {
        article = await response.json();
        authorId = article.authorId;
        authorName = article.author.username;
        numComments = article.comments.length;
        comments = article.comments;
        await loadPostImages(articleId);
      } else {
        throw new Error("Failed to fetch article");
      }
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  async function refreshPosts() {
    const articleId = $page.params.id;
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/posts/${articleId}`, {
        credentials: "include"
      });
      if (response.ok) {
        article = await response.json();
        authorId = article.authorId;
        authorName = article.author.username;
        numComments = article.comments.length;
        comments = article.comments;
        await loadPostImages(articleId);
      } else {
        throw new Error("Failed to fetch article");
      }
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    const articleId = $page.params.id;
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/posts/${articleId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        goto("/blog");
      } else {
        console.error("delete failed");
      }
    } catch (error) {
      console.error("delete error:", error);
    }
  }

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
      // Optionally, you can update the UI to reflect the like action
      // 显示成功消息
      await refreshPosts();
      message = "Post liked successfully!";
      showMessage = true;
      setTimeout(() => {
        showMessage = false;
      }, 3000); // 3秒后隐藏消息
    } else {
      console.error("Failed to like the post");
      // 显示错误消息
      message = "Failed to like the post.";
      showMessage = true;
      setTimeout(() => {
        showMessage = false;
      }, 3000); // 3秒后隐藏消息
    }

    const response_ = await fetch(`${PUBLIC_API_BASE_URL}/posts`, {
      credentials: "include"
    });
    if (response_.ok) {
      response_.json().then((data) => {
        console.log(data);
        blogPosts = data;
      });
    } else {
      console.error("Failed to fetch blog posts");
    }
  }
</script>

<svelte:head>
  <title>{article ? article.title : "Loading article..."} - Noble Nightingales</title>
</svelte:head>

<article class="article-container">
  {#if loading}
    <p>Loading article...</p>
  {:else if error}
    <p>Error: {error}</p>
  {:else if article}
    <div class="header-container">
      <h1>{article.title}</h1>
      {#if authorId == user_id}
        <div class="button-container">
          <button
            class="delete-button"
            on:click={() => {
              showDeletePopupBox = true;
            }}>Delete</button
          >
          <button
            class="edit-button"
            on:click={() => {
              const articleId = $page.params.id;
              goto(`/editArticle/${articleId}`);
            }}>Edit</button
          >
        </div>
      {/if}
    </div>

    <div class="article-meta">
      <span>By {article.author.fname} {article.author.lname}</span>
      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
    </div>
    {#if images.length > 0}
      <img
        src={getImageUrl(images[0].imageUrl)}
        alt={article.title}
        class="article-image"
        on:error={(e) => {
          console.log("Image URL that failed:", getImageUrl(images[0].imageUrl)); // Debug log
          console.error("Failed to load image:", e);
          e.target.style.display = "none";
        }}
      />
    {/if}
    <div class="article-content">
      {@html article.content}
    </div>
    <div class="article-stats">
      <span class="like-wrapper">
        <div class="like-container">
          {#if article.isLiked}
            <a href="#" class="like-blog" on:click|preventDefault={() => likePost(article.id)}>
              <img src="/like.jpg" alt="Unlike" class="like-icon" />
            </a>
          {:else}
            <a href="#" class="like-blog" on:click|preventDefault={() => likePost(article.id)}>
              <img src="/unlike.jpg" alt="Like" class="like-icon" />
            </a>
          {/if}
        </div>
        <span class="like-count">{article.likeCount} likes</span>
      </span>
      <span>💬 {article.comments.length} comments</span>
    </div>
    <div class="commentsDiv">
      <CommentList
        {comments}
        {authorId}
        loginUserId={user_id == 0 ? 0 : user_id}
        bind:numComments
        on:refresh={refreshPosts}
      />
    </div>
  {:else}
    <p>Article not found.</p>
  {/if}

  {#if showDeletePopupBox}
    <Modal
      bind:showPopupBox={showDeletePopupBox}
      description={"Are you sure you want to delete this post?"}
      buttons={[
        {
          text: "Confirm",
          onClick: handleDelete
        }
      ]}
    />
  {/if}
</article>

<style>
  .like-icon {
    margin-top: 4px;
    width: 20px; /* 设置宽度 */
    height: 20px; /* 设置高度 */
    /* 你可以根据需要添加其他样式，例如边距等 */
  }

  .article-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 1rem;
  }

  .article-meta {
    display: flex;
    justify-content: space-between;
    color: #666;
    margin-bottom: 1rem;
  }

  .article-image {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    margin-bottom: 1rem;
    border-radius: 8px;
  }

  .article-content {
    line-height: 1.6;
    color: #333;
  }

  .article-stats {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    color: #666;
  }

  .delete-button {
    background-color: #dc3545;
    color: white;
  }

  .delete-button:hover {
    background-color: #c82333;
  }

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
    background-color: #6af0fa;
    color: white;
  }

  .edit-button:hover {
    background-color: #6af0fa;
  }

  .edit-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    text-decoration: none;
  }

  .header-container {
    display: flex;
    justify-content: space-between; /* 左右分布 */
    align-items: center; /* 垂直居中 */
  }

  .button-container {
    display: flex; /* 按钮水平排列 */
    gap: 10px; /* 按钮之间的间距 */
  }

  .like-container {
    display: flex; /* 让点赞图标和链接并排显示 */
    align-items: center; /* 垂直居中 */
  }

  .like-wrapper {
    display: flex;
    align-items: center; /* 垂直居中对齐 */
  }

  .like-count {
    margin-left: 7px; /* 给点赞数量添加一些左边距 */
  }
</style>
