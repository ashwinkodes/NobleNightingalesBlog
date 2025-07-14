<script>
    import { onDestroy } from "svelte";
    export let description = "";
    export let buttons = [];
    export let showPopupBox = false;
    export let cancellCallback = () => {};
    export let countdown;
    export let countdownCallback = () => {};
    export let cancellable = true;
    export let lightText = "Cancel";
  
    let countdownInterval;
    let timeLeft = countdown;
  
    if (countdown !== undefined && countdown > 0) {
      countdownInterval = setInterval(() => {
        timeLeft = timeLeft - 1;
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          countdownCallback();
          showPopupBox = false;
        }
      }, 1000);
    }
  
    onDestroy(() => {
      if (countdownInterval) clearInterval(countdownInterval);
    });
  </script>
  
  <div class="screen" style="display: {showPopupBox ? '' : 'none'};">
    <main class="modal">
      <p class="description">{description}</p>
      {#if countdown !== undefined && countdown > 0}
        <p class="redirect-text">Redirecting in {timeLeft} seconds</p>
      {/if}
      <div class="modal-buttons">
        {#if cancellable}
          <button
            class="modal-button cancel-button"
            on:click={() => {
              cancellCallback();
              if (countdownInterval) clearInterval(countdownInterval);
              showPopupBox = false;
            }}>{lightText}</button
          >
        {/if}
        {#each buttons as { text, onClick }}
          <button class="modal-button" on:click={onClick}>{text}</button>
        {/each}
      </div>
    </main>
  </div>
  
  <style>
    .screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999999999;
    }
  
    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      border-radius: 8px;
      transform: translate(-50%, -50%);
      width: 320px;
      padding: 10px;
      min-height: 70px;
      background: #fff;
      text-align: center;
    }
  
    .modal-buttons {
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 10px;
  
      & .modal-button {
        margin: 0 8px;
        padding: 8px 16px;
        background: #77daf3;
        cursor: pointer;
        color: #fff;
        border: 1px solid #7feaf8;
        border-radius: 10px;
        &:hover {
          background: #69ccda;
        }
      }
  
      & .cancel-button {
        background: #fff;
        color: #66b2cf;
        border: 1px solid #64c1d8;
        border-radius: 10px;
        &:hover {
          background: #72eeee7e;
          color: #fff;
        }
      }
    }
  
    .redirect-text {
      font-size: 0.8rem;
      color: #3e3e3e;
      margin: 8px;
    }
  
    p {
      margin: 5px;
      padding: 0;
    }
  
    .description {
      font-size: 1.2rem;
      font-weight: 600;
      color: #3e3e3e;
      margin-bottom: 10px;
    }
  </style>