<script>
    import CommentCard from "$lib/components/CommentCard.svelte";
    import RecursiveComments from "$lib/components/RecursiveComments.svelte";
    import { page } from "$app/stores";
    import { getComments, postComment } from "$lib/js/comments";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Modal from "$lib/components/Modal.svelte";

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let redirectUrl = "/login";
    let showPopupBox = false;
    let parentCommentId = 0;

    export let numComments = 0;
    export let comments = [];
    $: numComments = comments?.filter((element) => !element.isDeleted)?.length;

    export let refreshPosts;

    export let authorId;
    export let loginUserId = 0;


    let commentToArticle = "";
    const { id } = $page.params;
    const articleId = id;

    let loadedComment = false;
    let sending = false;
    let showComments = true;

    function toggleComments() {
        showComments = !showComments;
    }

    function generateCommentProps(comments, parentId = null) {
        if (!comments) return [];

        // 获取当前层级的评论
        const currentComments = comments.filter((comment) => comment.parentCommentId === parentId);
        return currentComments;
    }

    onMount(async () => {
        try {
            loadedComment = true;
        } catch (error) {
            console.error(error);
        }
    });

    function handleReply(parentId) {
        parentCommentId = parentId;
        console.log('Selected parentCommentId:', parentCommentId);
    }

    $: commentProps = generateCommentProps(comments);
    console.log(commentProps);
    

    async function postCommentToArticle() {
        if (loginUserId === 0) {
            showPopupBox = true;
            return;
        }
        sending = true;
        try {
            console.log('Posting comment with parentCommentId:', parentCommentId);
            await postComment({ content: commentToArticle, parentId: parentCommentId == 0 ? null : parentCommentId, articleId });
            clearTextarea();
            await refreshComments();
            setTimeout(() => {
                window.scrollTo(0, document.body.scrollHeight);
            }, 100);
        } catch (error) {
            console.error(error);
        } finally {
            sending = false;
        }
    }

    function clearTextarea() {
        commentToArticle = "";
    }

    async function refreshComments() {
        dispatch('refresh');
    }

</script>

<section class="comments">
    <div class="title-area">
        <h2>Comments</h2>
        <button class="title-button" on:click={toggleComments} aria-label="Toggle Comments">
            <img class="comment-view-control" src={showComments ? "/icons/up-arrow.png" : "/icons/down-arrow.png"} alt="Toggle Comments" />
        </button>
    </div>

    <textarea class="comment-input" placeholder="Write your comment here!" maxlength="300" disabled={sending} bind:value={commentToArticle} />
    <div class="operations">
        <button on:click={postCommentToArticle} disabled={sending}>Submit</button>
    </div>

    <div class="list" style="display: {showComments ? '' : 'none'};">
        {#if !loadedComment}
            <p class="loading">Loading...</p>
        {:else}
            {#each commentProps as comment (comment.id)}
                <CommentCard {...comment} {articleId} authorId_={comment.authorId} {authorId} {loginUserId} onReply={handleReply}  on:refresh={refreshComments}/>
                {#if comment.replies && comment.replies.length > 0}
                    <div class="replies">
                        <RecursiveComments comments={comment.replies} authorId_={comment.replies.authorId} {authorId} {loginUserId} onReply={handleReply} on:refresh={refreshComments} />
                    </div>
                {/if}
            {/each}
        {/if}
    </div>
    
    
</section>

{#if showPopupBox}
    <Modal
        bind:showPopupBox
        description={"Login to reply :)"}
        buttons={[{
            text: "Log in",
            onClick: () => {
                goto(redirectUrl);
            }
        }]}
    />
{/if}

<style>
    .comments {
        min-height: 200px;
        flex: 1;
        margin: 50px;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: #f9f9f9;
    }

    .title-area {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        font-size: 1.5em;
        font-weight: bold;
        color: #333;
    }

    .title-button {
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        position: relative;
        width: 24px;
        height: 24px;
    }

    .title-button:focus {
        outline: none;
    }


    .comment-view-control {
        width: 20px;
        margin-left: 10px;
        cursor: pointer;
        transition: transform 0.3s ease;
        background-size: contain;
        background-repeat: no-repeat;
        filter: brightness(0) saturate(100%) invert(75%) sepia(10%) saturate(900%) hue-rotate(170deg) brightness(95%);
    }
    .comment-view-control:hover {
        transform: scale(1.1);
    }

    .loading {
        font-size: 1.2em;
        text-align: center;
        color: #999;
        padding: 20px 0;
    }

    .comment-input {
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
    .comment-input:focus {
        border-color: #79ccec;
        outline: none;
        box-shadow: 0 0 5px rgba(158, 179, 132, 0.4);
    }

    .operations {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-bottom: 20px;
    }

    .operations button {
        padding: 8px 12px;
        font-size: 0.9em;
        font-weight: bold;
        color: #fff;
        background: linear-gradient(135deg, #78cff7, #77dcf5);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .operations button:hover {
        background: linear-gradient(135deg, #5dddee, #5bc5e6);
    }

    .operations button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }

    .list {
        margin-top: 20px;
        padding: 10px;
        border-top: 1px solid #ddd;
    }

    .replies {
        margin-left: 30px;
        padding-left: 10px;
        border-left: 2px solid #e0e0e0;
    }
</style>
