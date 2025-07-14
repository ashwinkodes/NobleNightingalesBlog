<script>
    import CommentCard from "$lib/components/CommentCard.svelte";
    import RecursiveComments from "$lib/components/RecursiveComments.svelte";
    export let comments = [];
    export let authorId;
    export let loginUserId;
    export let onReply;
    export let refreshComments;

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    function handleRefresh() {
        dispatch('refresh'); // 重新触发 refresh 事件
    }
</script>

{#each comments as comment (comment.id)}
    <CommentCard {...comment} {authorId} authorId_={comment.authorId} {loginUserId} onReply={onReply}  on:refresh={handleRefresh} />
    {#if comment.replies && comment.replies.length > 0}
        <div class="replies">
            <RecursiveComments comments={comment.replies} authorId_={comment.replies.authorId} {authorId} {loginUserId} onReply={onReply} on:refresh={handleRefresh} />
        </div>
    {/if}
{/each}

<style>
    .replies {
        margin-left: 30px; /* 适当的缩进 */
    }
</style>
