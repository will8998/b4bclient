<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  export let show = false;
  export let triggerShockwave = () => {};
  
  const dispatch = createEventDispatcher();
  
  let currentStep = 0;
  let wizardComplete = false;
  
  // Define wizard steps with content
  const steps = [
    {
      title: "Welcome to Band 4 Band Rules",
      content: "Let's understand how this game works and how you can win big!",
      icon: "🎮",
      animation: "pulse"
    },
    {
      title: "The Timer",
      content: "• The timer starts at 24 hours\n• When it hits ZERO, the game ends\n• Each purchase resets the timer\n• Buying adds at least 2 minutes\n• The bigger the prize pool, the more time each buy adds",
      icon: "⏰",
      animation: "spin"
    },
    {
      title: "The Prize",
      content: "• Last buyer when the timer hits zero wins 75% of the prize pool 👑\n• All token holders share the remaining 25% 💸\n• The prize pool grows with every purchase!",
      icon: "💰",
      animation: "glow"
    },
    {
      title: "Buy Tax",
      content: "• Buy tax starts at 0% after each purchase\n• Increases linearly to 100% as the timer approaches zero\n• Tax is split between the previous buyer and the referrer\n• Buy EARLY to pay less tax!",
      icon: "🧮",
      animation: "bounce"
    },
    {
      title: "Sell Tax",
      content: "• Sells are taxed at 100% - your tokens get burned 🔥\n• This creates UP ONLY price action 📈\n• Everyone takes profit at the same time when the game ends",
      icon: "🚫",
      animation: "shake"
    },
    {
      title: "Game Cycle",
      content: "• Buy to become the potential winner\n• Get paid when others buy after you\n• Win BIG if no one buys before timer hits zero\n• The game keeps going until someone wins!",
      icon: "🔄",
      animation: "spin"
    },
    {
      title: "The Strategy",
      content: "The key is timing. Buy early enough to maximize your chances, but late enough to be the final buyer when the timer hits zero.",
      icon: "🧠",
      animation: "pulse"
    },
    {
      title: "Remember",
      content: "The only way to lose is to stop playing! 🎲",
      icon: "💎",
      animation: "glow"
    }
  ];
  
  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
      triggerShockwave();
    } else {
      wizardComplete = true;
    }
  }
  
  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }
  
  function closeWizard() {
    dispatch('close');
  }
  
  function goToGame() {
    dispatch('close');
    // Add any additional logic to guide the user to the game
  }
  
  onMount(() => {
    // Trigger shockwave effect on first mount
    if (show) {
      setTimeout(() => {
        triggerShockwave();
      }, 500);
    }
  });
</script>

{#if show}
  <div class="wizard-overlay" transition:fade={{ duration: 400 }}>
    <div class="wizard-container" on:click|stopPropagation>
      {#if !wizardComplete}
        <div class="wizard-content">
          <button class="close-button" on:click={closeWizard}>×</button>
          
          <div class="step-indicator">
            {#each steps as _, i}
              <div class="step-dot" class:active={i === currentStep} on:click={() => currentStep = i}></div>
            {/each}
          </div>
          
          <div class="step-content">
            {#key currentStep}
              <div class="step" in:fly={{ y: 20, duration: 400, easing: quintOut }}>
                <div class="step-icon {steps[currentStep].animation}">{steps[currentStep].icon}</div>
                <h2>{steps[currentStep].title}</h2>
                <div class="step-description">{@html steps[currentStep].content.replace(/\n/g, '<br>')}</div>
              </div>
            {/key}
          </div>
          
          <div class="wizard-controls">
            {#if currentStep > 0}
              <button class="wizard-button prev" on:click={prevStep}>Back</button>
            {:else}
              <div></div>
            {/if}
            
            <button class="wizard-button next" on:click={nextStep}>
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      {:else}
        <div class="wizard-complete" in:fly={{ y: 20, duration: 600 }}>
          <button class="close-button" on:click={closeWizard}>×</button>
          <div class="complete-icon">🎉</div>
          <h2>Ready to Play?</h2>
          <p>You now know all the rules of Band 4 Band!</p>
          <p>Time to put your strategy to work and win big.</p>
          <button class="cta-button" on:click={goToGame}>
            START PLAYING NOW
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .wizard-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(26, 0, 46, 0.9);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  .wizard-container {
    position: relative;
    width: 90%;
    max-width: 800px;
    height: 70vh;
    max-height: 800px;
    background-color: rgba(45, 0, 128, 0.8);
    border: 2px solid #00FFFF;
    border-radius: 15px;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .wizard-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 30px;
  }
  
  .close-button {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 28px;
    background: none;
    border: none;
    color: #00FFFF;
    cursor: pointer;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
    z-index: 10;
  }
  
  .step-indicator {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .step-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: rgba(0, 255, 255, 0.3);
    margin: 0 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .step-dot.active {
    background-color: #00FFFF;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
    transform: scale(1.2);
  }
  
  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  
  .step {
    text-align: center;
    width: 100%;
    padding: 20px;
  }
  
  .step-icon {
    font-size: 5rem;
    margin-bottom: 20px;
    display: inline-block;
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  .shake {
    animation: shake 2s infinite;
  }
  
  .bounce {
    animation: bounce 2s infinite;
  }
  
  .glow {
    animation: glow 2s infinite;
  }
  
  .spin {
    animation: spin 8s infinite linear;
  }
  
  h2 {
    color: #00FFFF;
    font-size: 2.2rem;
    margin-bottom: 25px;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
  
  .step-description {
    font-size: 1.3rem;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
    color: white;
  }
  
  .wizard-controls {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }
  
  .wizard-button {
    background-color: rgba(0, 255, 255, 0.2);
    color: #00FFFF;
    border: 2px solid #00FFFF;
    border-radius: 30px;
    padding: 12px 30px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  }
  
  .wizard-button:hover {
    background-color: rgba(0, 255, 255, 0.4);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  }
  
  .wizard-button.next {
    background-color: rgba(0, 255, 255, 0.3);
  }
  
  .wizard-complete {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 30px;
    text-align: center;
  }
  
  .complete-icon {
    font-size: 6rem;
    margin-bottom: 30px;
    animation: bounce 2s infinite;
  }
  
  .cta-button {
    background: linear-gradient(45deg, #FF0055, #FF00CC);
    color: white;
    border: none;
    border-radius: 30px;
    padding: 15px 40px;
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 40px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(255, 0, 85, 0.6);
    animation: pulse 2s infinite;
  }
  
  .cta-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255, 0, 85, 0.8);
  }
  
  /* Animations */
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-20px); }
    60% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.5); }
    50% { text-shadow: 0 0 20px rgba(0, 255, 255, 1), 0 0 30px rgba(0, 255, 255, 0.8); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .wizard-container {
      width: 95%;
      height: 85vh;
    }
    
    .wizard-content, .wizard-complete {
      padding: 20px 15px;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    .step-description {
      font-size: 1rem;
    }
    
    .step-icon {
      font-size: 3.5rem;
    }
    
    .wizard-button {
      padding: 10px 20px;
      font-size: 1rem;
    }
    
    .complete-icon {
      font-size: 4rem;
    }
    
    .cta-button {
      padding: 12px 30px;
      font-size: 1.2rem;
    }
  }
</style> 