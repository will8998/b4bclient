<script>
  // Added button click effect/sound functionality
  import { onMount } from 'svelte';
  // Import the triggerShockwave function from GridBackground
  import { triggerShockwave } from '$lib/components/GridBackground.svelte';

  let buttonSound;
  let isBrowser = false;

  onMount(() => {
    isBrowser = true;
    if (!isBrowser) return;
    
    // Create audio element for button click
    buttonSound = new Audio();
    buttonSound.src = '/click-sound.mp3'; // Add this sound file to static folder
    buttonSound.volume = 0.5;
  });

  function handleButtonClick() {
    // Play sound when button is clicked
    if (buttonSound) {
      buttonSound.currentTime = 0;
      buttonSound.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Trigger the grid shockwave effect using the imported function
    triggerShockwave();
    
    // Here you would connect to your contract for the actual purchase
    console.log('Button clicked!');
  }
</script>

<button class="pushable" on:click={handleButtonClick}>
  <span class="shadow"></span>
  <span class="edge"></span>
  <span class="front"> 
    Claim $10,000,000
    <br>
    <span class="font-sm">Price: $2,000</span>
  </span>
</button>

<style>
  .font-sm {
    font-size: 14px;
    opacity: 0.89;
  }
  
  .pushable {
    position: relative;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    outline-offset: 4px;
    transition: filter 250ms;
    transform: scale(1.5);
  }
  
  .shadow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: hsl(0deg 0% 0% / 0.4);
    will-change: transform;
    transform: translateY(2px);
    transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
    filter: blur(4px);
  }
  
  .edge {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: linear-gradient(
      to left,
      hsl(340deg 100% 16%) 0%,
      hsl(340deg 100% 32%) 8%,
      hsl(340deg 100% 32%) 92%,
      hsl(340deg 100% 16%) 100%
    );
    box-shadow: 0 0 15px rgb(255, 215, 0, 0.4);
  }
  
  .front {
    display: block;
    position: relative;
    padding: 16px 46px;
    border-radius: 12px;
    font-size: 1.5rem;
    color: white;
    background: linear-gradient(145deg, hsl(345deg 100% 47%), hsl(5deg 100% 50%));
    will-change: transform;
    transform: translateY(-4px);
    transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  }

  .pushable:hover {
    filter: brightness(110%);
  }

  .pushable:hover .front {
    transform: translateY(-6px);
    transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
  }
  
  .pushable:active .front {
    transform: translateY(-2px);
    transition: transform 34ms;
  }

  .pushable:hover .shadow {
    transform: translateY(4px);
    transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
  }
  
  .pushable:active .shadow {
    transform: translateY(1px);
    transition: transform 34ms;
  }

  .pushable:focus:not(:focus-visible) {
    outline: none;
  }
  
  /* Add pulsing effect to indicate importance */
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 0, 85, 0.7);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(255, 0, 85, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 0, 85, 0);
    }
  }
  
  .front {
    animation: pulse 2s infinite;
  }
</style>
