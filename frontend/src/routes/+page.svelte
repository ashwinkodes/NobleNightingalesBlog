<script>
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  let blogPosts = [];

  async function loadBlogPosts() {
    const response = await fetch(`${PUBLIC_API_BASE_URL}/posts`);
    blogPosts = await response.json();
  }

  loadBlogPosts();
</script>

<svelte:head>
  <title>Noble Nightingales Blog</title>
</svelte:head>

<header class="hero">
  <div class="hero-content">
    <h1>Welcome to Noble Nightingales Blog</h1>
    <p>Explore our latest thoughts and experiences!</p>
  </div>
</header>

<section class="featured-post">
  <h2>Featured Post</h2>
  {#if blogPosts.length > 0}
    <article class="post-card">
      <h3>{blogPosts[0].title}</h3>
      <p>{blogPosts[0].excerpt}</p>
      <a href={`/post/${blogPosts[0].id}`}>Read more</a>
    </article>
  {:else}
    <p>No featured post available.</p>
  {/if}
</section>

<section class="recent-posts">
  <h2>Recent Posts</h2>
  {#if blogPosts.length > 1}
    <ul>
      {#each blogPosts.slice(1, 4) as post}
        <li>
          <article class="post-card">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <a href={`/post/${post.id}`} class="read-more">Read more</a>
          </article>
        </li>
      {/each}
    </ul>
  {:else}
    <p>No recent posts available.</p>
  {/if}
</section>

<style>
  .hero {
    background-image: url("/MtEden.jpg");
    background-size: cover;
    background-position: center;
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
    border-radius: 10px;
  }

  .hero-content {
    padding: 2rem;
  }

  .hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .hero p {
    font-size: 1.8rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .featured-post,
  .recent-posts {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .post-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin-bottom: 1rem;
  }

  h2 {
    margin-bottom: 1rem;
  }

  h3 {
    margin-top: 0;
  }

  a {
    color: #0066cc;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
