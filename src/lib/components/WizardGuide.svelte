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
      title: "Welcome to Band 4 Band",
      content: "The game that can change your life with a single click.",
      icon: "🚀",
      animation: "pulse"
    },
    {
      title: "The World Is Cooked",
      content: "AI is taking all the jobs. The rich are getting RICHER. And normal people? Getting left behind.",
      icon: "🌍",
      animation: "shake"
    },
    {
      title: "Two Ways to Get Rich",
      content: "Build a robot smarter than all humans (good luck 🤡)\n\nOR\n\nClick the Button and change your life forever.",
      icon: "💰",
      animation: "bounce"
    },
    {
      title: "What Is Band 4 Band?",
      content: "This is the ONLY game where you can turn one click into millions.",
      icon: "🎮",
      animation: "glow"
    },
    {
      title: "How It Works",
      content: "There's a 24-hour timer ticking down. Whoever clicked the Button last when the timer hits 0 wins 75% of the prize pool. Everyone else splits the rest.",
      icon: "⏳",
      animation: "spin"
    },
    {
      title: "What Happens When You Click",
      content: "• Reset the timer (buy yourself more time!)\n• Lock in your chance to win it all\n• Get instant bonuses if others click after you!",
      icon: "👆",
      animation: "pulse"
    },
    {
      title: "The Catch",
      content: "If someone else clicks before the timer ends... they steal your spot!",
      icon: "😱",
      animation: "shake"
    },
    {
      title: "Why Band 4 Band Is Different",
      content: "• No selling - tokens get burned if you sell 🔥\n• Chart always goes UP ONLY 📈\n• Winners get paid - no fake pumps and dumps\n• Every buy helps YOU",
      icon: "🛡️",
      animation: "bounce"
    },
    {
      title: "Why Click NOW?",
      content: "• Prize grows bigger every second 💰\n• Button gets more expensive if you wait 🕑\n• Winner takes a life-changing bag 🚀\n• Others are getting ahead while you hesitate",
      icon: "🧠",
      animation: "glow"
    },
    {
      title: "Imagine Winning",
      content: "Imagine having enough money to:\n• Buy your own house\n• Pay off your family's debts\n• Travel the world\n• Flex on everyone who doubted you",
      icon: "💭",
      animation: "spin"
    },
    {
      title: "What To Do Now",
      content: "Click the Button, and you're in.\nWait too long, and you'll be broke AND sad.",
      icon: "⚡",
      animation: "pulse"
    },
    {
      title: "The Final Choice",
      content: "DON'T BE A BROKE BOY.\nCLICK THE BUTTON.\nCLAIM THE BAG.\n\nYour future self will thank you.",
      icon: "🔥",
      animation: "shake"
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
          <h2>Ready to Get Rich?</h2>
          <p>You now know everything about Band 4 Band!</p>
          <p>Click the button below to start your journey to wealth!</p>
          <button class="cta-button" on:click={goToGame}>
            CLICK THE BUTTON NOW
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