<script>
    import { deleteComment, postComment } from "$lib/js/comments";
    import { PUBLIC_API_BASE_URL, PUBLIC_SERVER_URL } from "$env/static/public";
    const SERVER_URL =PUBLIC_SERVER_URL;
    import { browser } from "$app/environment";
    import dayjs from "dayjs";import relativeTime from "dayjs/plugin/relativeTime";

    // 注册插件
    dayjs.extend(relativeTime);
    import { goto } from "$app/navigation";
    import { auth } from "$lib/stores/auth";
    import { page } from "$app/stores";
    import Modal from "$lib/components/Modal.svelte";
    

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

  
  
    let redirectUrl = "/";
    let showPopupBox = false;
    let showDeletePopupBox = false;
    let loginUser=$auth.user
    
    export let articleId = "";
    export let userId = "";
    export let username = "";
    export let content = "";
    export let children = [];
    export let deep = 0;
    export let id = 0;
    let commentId = id;
    export let isDeleted = false;
    export let createdAt = "now";
    export let authorId = "";
    export let authorId_ = "";
    export let avatarUrl=""
    let avatar = avatarUrl;
    export let refreshComments = async () => {};
  
    const INTENT = 24;
    let replying = false;
    let sending = false;
    let reply = "";
    let errorMessage = "";
    let avatarImage;
    export let loginUserId = 0;

    if(articleId==""){
        const { id } = $page.params;
        articleId = id;
    }
  
    console.log(authorId_, loginUserId,authorId);

  
    $: allowDelete =  (authorId_ === loginUserId)||authorId === loginUserId && !isDeleted;
    $: authorLink = `/profile/${username}`;
    $: {
      if (!replying) errorMessage = "";
    }
  
    function startReply() {
      if (!loginUserId) {
        showPopupBox = true;
        redirectUrl = "/login";
      } else {
        replying = true;
      }
    }
  
    function endReply() {
      replying = false;
    }
  
    function useFallbackAvatar() {
      if (avatarImage) avatarImage.src = "/userDefaultIcon.png";
    }
  
    async function postReply() {
      if (!reply) return endReply();
      sending = true;
      try {
        await postComment({ articleId:articleId, content: reply, parentId: commentId });
        await refreshComments();
        replying = false;
        errorMessage = "";
        reply = "";
        endReply();
      } catch (error) {
        console.error(error);
        errorMessage = "Error on sending message, try again!";
      } finally {
        sending = false;
      }
      dispatch("refresh"); 
    }
  
    async function deleteReply() {
      try {
        await deleteComment({ commentId });
        await refreshComments();
        showDeletePopupBox = false;
      } catch (error) {
        console.error(error);
      } finally {
        endReply();
      }
      dispatch('refresh');

    }
  
    function shouldDeleteCommentCard(comment) {
      if (!comment.children.length) {
        return comment.isDeleted;
      }
  
      const childrenShouldBeDeleted = comment.children.every(shouldDeleteCommentCard);
      const shouldDelete = comment.isDeleted && childrenShouldBeDeleted;
      return shouldDelete;
    }

  </script>
  
  <div
    class="comment-container"
    style="margin-left: {deep ? INTENT : 0}px; display:{shouldDeleteCommentCard({
      commentId,
      isDeleted,
      children
    })
      ? 'none'
      : 'block'}"
  >

  <a class="author-info" href={authorLink} on:click={event => event.preventDefault()}>
    {#if browser}
      <img
        class="avatar"
        src={isDeleted ? "/userDefaultIcon.png" : `${SERVER_URL}/${avatar.replace(/^\/?public\/?/, '')}`}
        alt=""
        bind:this={avatarImage}
        on:error={useFallbackAvatar}
      />
    {/if}
    {#if !isDeleted}
      <div class="author">{username}</div>
      <div class="date">{dayjs(createdAt).fromNow()} - {dayjs(createdAt).format("YYYY-MM-DD hh:mm:ss")}</div>
    {/if}
  </a>
  
    <div class="main-content">
      <p class="content {isDeleted ? 'deleted' : ''}">{content}</p>
      <div class="reply-delete-button">
        {#if deep < 5 && !replying && !isDeleted}
          <button class="edit-button" on:click={startReply}>reply</button>
        {/if}
        {#if allowDelete}
          <button
            on:click={() => {
              showDeletePopupBox = true;
            }}
            class="edit-button">delete</button
          >
        {/if}
      </div>
      <div class="edit">
        {#if replying}
          <textarea
            disabled={sending}
            class="reply-input"
            rows="4"
            maxlength="300"
            bind:value={reply}
            placeholder="Please be nice and kind."
          />
          {#if errorMessage}
            <p class="error">{errorMessage}</p>
          {/if}
          <div class="reply-post-button">
            <button on:click={postReply} disabled={sending}>Submit</button>
            <!-- <button on:click={endReply}>cancel</button> -->
          </div>
        {/if}
        {#if showPopupBox}
          <Modal
            bind:showPopupBox
            description={"Login to reply :)"}
            buttons={[
              {
                text: "Log in",
                onClick: () => {
                  goto(redirectUrl);
                }
              }
            ]}
          />
        {/if}
        {#if showDeletePopupBox}
          <Modal
            bind:showPopupBox={showDeletePopupBox}
            description={"Are you sure you want to delete this comment?"}
            buttons={[
              {
                text: "Confirm",
                onClick: deleteReply
              }
            ]}
          />
        {/if}
      </div>
  
      {#each children as child (child.commentId)}
        <svelte:self {...child} deep={deep + 1} {refreshComments} {authorId} {loginUserId} />
      {/each}
    </div>
  </div>
  
  <style>
    .comment-container {
      padding-top: 24px;
      margin-bottom: 16px;
      border-left: 2px solid #d3d3d3;
      padding-left: 16px;
    }
  
    .author-info {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: #333;
        margin-bottom: 10px;
    }

    .avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        margin-right: 10px;
        border: 2px solid #78cff7; /* 添加边框与主题色一致 */
        object-fit: cover;
    }

    .date {
        margin-left: 10px;
        font-size: 14px;
        color: #777; /* 日期字体颜色浅一点 */
    }

    .author-info:hover {
        color: #78cff7; /* 鼠标悬停时改变用户名颜色 */
    }
  
    /* 评论内容 */
    .main-content {
      padding: 8px 0;
      color: #333;
      line-height: 1.6;
    }
  
    .content {
      white-space: pre-wrap;
      margin: 0;
      padding: 8px;
      font-size: 0.95rem;
    }
  
    .content.deleted {
      color: #ababab;
      font-style: italic;
    }
  
    /* 错误信息 */
    .error {
      font-size: 0.85rem;
      color: red;
      margin-top: 8px;
    }
  
    /* 按钮 */
    .reply-delete-button, .reply-post-button {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
  
    button.edit-button {
      background: transparent;
      border: none;
      color: #454545;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s;
    }
  
    button.edit-button:hover {
      color: #71c0f5;
      text-decoration: underline;
    }
  
    textarea.reply-input {
        display: block;
        width: 100%;
        height: 100px;
        margin: 10px 0;
        padding: 12px;
        box-sizing: border-box;
        border-radius: 6px;
        border: 1px solid #ddd;
        resize: vertical;
        font-size: 1em;
        color: #333;
        background-color: #fff;
        transition: border-color 0.2s ease;
    }

    .reply-input:focus {
        border-color: #79ccec;
        outline: none;
        box-shadow: 0 0 5px rgba(158, 179, 132, 0.4);
    }
  
    /* 按钮样式 */
    .reply-post-button button,
    .reply-delete-button button {
      background-color: #7ac0ee;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: background-color 0.2s;
    }
  
    .reply-post-button button:hover,
    .reply-delete-button button:hover {
      background-color: #7abbe9;
    }
  
    /* 响应式调整 */
    @media (max-width: 700px) {
      .avatar {
        width: 32px;
        height: 32px;
      }
  
      .author {
        font-size: 0.9rem;
      }
  
      .date {
        font-size: 0.8rem;
      }
  
      textarea.reply-input {
        width: 95%;
      }
    }
  </style>
  