<script>
  import '$lib/app.css';
  import { onMount } from 'svelte';
  import GridBackgroundLoader from '$lib/components/GridBackgroundLoader.svelte';
  import CyberpunkHUD from '$lib/components/CyberpunkHUD.svelte';
  import Asteroids from '$lib/components/Asteroids.svelte';
  import WizardGuide from '$lib/components/WizardGuide.svelte';
  import RulesWizard from '$lib/components/RulesWizard.svelte';
  import { triggerShockwave } from '$lib/components/GridBackground.svelte';

  let showAbout = false;
  let showRules = false;
  let mounted = false;
  
  function toggleAbout() {
    showAbout = !showAbout;
    showRules = false;
  }
  
  function toggleRules() {
    showRules = !showRules;
    showAbout = false;
  }
  
  function closeModals() {
    showAbout = false;
    showRules = false;
  }
  
  onMount(() => {
    document.body.style.overflow = 'hidden';
    mounted = true;
    
    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<!-- Background placeholder -->
<div class="placeholder-bg"></div>

<!-- Load grid background and HUD only on client side -->
{#if mounted}
  <GridBackgroundLoader />
  <CyberpunkHUD {toggleAbout} {toggleRules} />
{/if}

<!-- Wizard Guides -->
<WizardGuide show={showAbout} {triggerShockwave} on:close={closeModals} />
<RulesWizard show={showRules} {triggerShockwave} on:close={closeModals} />

<style>
  .placeholder-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    background-color: #1A002E;
  }
  
  .game-content-slot {
    width: 100%;
    height: 100%;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(26, 0, 46, 0.85);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-y: auto;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  .modal {
    position: relative;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    background-color: rgba(45, 0, 128, 0.7);
    border: 2px solid #00FFFF;
    border-radius: 10px;
    padding: 30px;
    overflow-y: auto;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
  }
  
  .close-button {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 24px;
    background: none;
    border: none;
    color: #00FFFF;
    cursor: pointer;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  }
  
  .modal-content {
    font-family: monospace;
  }
  
  .modal-content h2 {
    color: #00FFFF;
    margin-bottom: 20px;
    text-align: center;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
  
  .modal-content h3 {
    color: #00FFFF;
    margin-top: 25px;
    margin-bottom: 15px;
  }
  
  .modal-content p {
    margin-bottom: 15px;
    line-height: 1.5;
  }
  
  .modal-content ul {
    margin-bottom: 15px;
    padding-left: 20px;
  }
  
  .modal-content li {
    margin-bottom: 8px;
    list-style-type: none;
    position: relative;
    padding-left: 20px;
  }
  
  .modal-content li:before {
    content: '👉';
    position: absolute;
    left: 0;
  }
  
  .highlight {
    font-size: 1.4rem;
    font-weight: bold;
    color: #00FFFF;
    text-align: center;
    margin: 30px 0;
    padding: 15px;
    border: 2px dashed #00FFFF;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.3);
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
  }
  
  @media (max-width: 768px) {
    .modal {
      width: 95%;
      padding: 20px 15px;
    }
    
    .modal-content h2 {
      font-size: 1.3rem;
    }
    
    .modal-content h3 {
      font-size: 1.1rem;
    }
  }
</style>