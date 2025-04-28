<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { triggerShockwave } from './GridBackground.svelte';
  import Asteroids from './Asteroids.svelte';
  
  export let toggleAbout;
  export let toggleRules;
  
  let time = new Date();
  let timeInterval;
  let animationFrame;
  let hexGrid;
  let scanlineActive = true;
  let glitchActive = false;
  let glitchEnabled = false;
  let bootupComplete = false;
  let chatboxExpanded = false;
  let chatInput = '';
  let gameContentReady = false;
  let asteroidCount = 100;
  let asteroidColors = ['#00FFFF', '#00CCFF', '#00AAFF', '#0088FF'];
  
  // Mock recent buys data (this would normally come from your backend)
  let recentBuys = [
    { address: '0x42f...3a7b', amount: '0.245 ETH', timestamp: Date.now() - 1000 * 60 * 2 },
    { address: '0x76c...9e2d', amount: '0.12 ETH', timestamp: Date.now() - 1000 * 60 * 15 },
    { address: '0x33a...7c8f', amount: '0.57 ETH', timestamp: Date.now() - 1000 * 60 * 32 },
    { address: '0x91d...4e6a', amount: '0.31 ETH', timestamp: Date.now() - 1000 * 60 * 58 }
  ];
  
  // Mock chat messages (this would normally come from your backend)
  let chatMessages = [
    { sender: 'SYSTEM', message: 'Welcome to Band 4 Band', timestamp: Date.now() - 1000 * 60 * 35 },
    { sender: '0x42f...3a7b', message: 'Just bought in!', timestamp: Date.now() - 1000 * 60 * 30 },
    { sender: '0x33a...7c8f', message: 'This project is going to moon 🚀', timestamp: Date.now() - 1000 * 60 * 25 },
    { sender: '0x76c...9e2d', message: 'Who else is from Twitter?', timestamp: Date.now() - 1000 * 60 * 20 }
  ];
  
  // Game state (would normally connect to blockchain)
  let prizePool = "$10,000,000";
  let timeRemaining = { hours: 23, minutes: 45, seconds: 12 };
  let lastBuyer = "0x42f...3a7b";
  let playerTokens = "0.0";
  let buttonPrice = "$1,000";
  let countdown;
  
  // Add animation control state
  let animationsPaused = false;
  
  // Function to toggle animation state
  function toggleAnimations() {
    animationsPaused = !animationsPaused;
    document.documentElement.style.setProperty('--animation-play-state', 
      animationsPaused ? 'paused' : 'running');
  }
  
  // Function to toggle chatbox expanded state
  function toggleChatbox() {
    chatboxExpanded = !chatboxExpanded;
  }
  
  // Function to send chat message (would connect to backend)
  function sendMessage() {
    if (chatInput.trim()) {
      chatMessages = [...chatMessages, {
        sender: 'YOU',
        message: chatInput,
        timestamp: Date.now()
      }];
      chatInput = '';
    }
  }
  
  // Format timestamp for display
  function formatTimestamp(timestamp) {
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  }
  
  // HUD animation states
  let hudElements = {
    upperLeft: { visible: false, delay: 100 },
    upperRight: { visible: false, delay: 300 },
    lowerLeft: { visible: false, delay: 500 },
    lowerRight: { visible: false, delay: 700 },
    centerLogo: { visible: false, delay: 900 },
    navOptions: { visible: false, delay: 1200 },
    recentBuys: { visible: false, delay: 1400 },
    chatbox: { visible: false, delay: 1600 },
    gameContent: { visible: false, delay: 1800 }
  };
  
  // Function to toggle glitch effect
  function toggleGlitch() {
    glitchEnabled = !glitchEnabled;
    if (!glitchEnabled) {
      glitchActive = false;
    }
  }
  
  // Initialize hexagonal pattern in background
  function initHexGrid() {
    if (!hexGrid) return;
    
    const hexSize = 15;
    const hexWidth = hexSize * 2;
    const hexHeight = Math.sqrt(3) * hexSize;
    const hexagonCount = Math.ceil((window.innerWidth * window.innerHeight) / (hexWidth * hexHeight * 0.5)); // More hexagons
    
    let hexagons = '';
    
    for (let i = 0; i < hexagonCount; i++) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const opacity = 0.2 + Math.random() * 0.3; // More visible
      const size = hexSize * (0.5 + Math.random() * 0.8);
      const rotation = Math.random() * 60;
      const pulseSpeed = 3 + Math.random() * 5; // Add pulsing animation
      const pulseDelay = Math.random() * 5;
      
      hexagons += `<div class="hexagon" style="
        left: ${x}px;
        top: ${y}px;
        opacity: ${opacity};
        transform: rotate(${rotation}deg) scale(${size / hexSize});
        animation: hex-pulse ${pulseSpeed}s infinite alternate ease-in-out;
        animation-delay: -${pulseDelay}s;
      "></div>`;
    }
    
    hexGrid.innerHTML = hexagons;
  }
  
  // Simulate system bootup sequence
  function bootupSequence() {
    setTimeout(() => {
      bootupComplete = true;
      
      // Staggered appearance of HUD elements
      Object.keys(hudElements).forEach(key => {
        setTimeout(() => {
          hudElements[key].visible = true;
          
          // Once all elements are visible, mark game content as ready
          if (key === 'gameContent') {
            setTimeout(() => {
              gameContentReady = true;
              triggerShockwave(); // Trigger shockwave when game is ready
            }, 300);
          }
        }, hudElements[key].delay);
      });
    }, 1000);
  }
  
  // Random glitch effect
  function triggerGlitch() {
    if (glitchEnabled && Math.random() > 0.98) {
      glitchActive = true;
      setTimeout(() => {
        glitchActive = false;
      }, 80 + Math.random() * 100);
    }
    
    animationFrame = requestAnimationFrame(triggerGlitch);
  }
  
  // Update countdown timer
  function updateTimer() {
    if (!gameContentReady) return;
    
    // Decrement seconds
    timeRemaining.seconds--;
    
    // Handle time rollover
    if (timeRemaining.seconds < 0) {
      timeRemaining.seconds = 59;
      timeRemaining.minutes--;
      
      if (timeRemaining.minutes < 0) {
        timeRemaining.minutes = 59;
        timeRemaining.hours--;
        
        if (timeRemaining.hours < 0) {
          // Game ends - winner is determined
          timeRemaining = { hours: 0, minutes: 0, seconds: 0 };
        }
      }
    }
    
    // Update the UI
    timeRemaining = {...timeRemaining};
  }
  
  // Function to simulate clicking the button (would connect to blockchain)
  function clickButton() {
    // In a real implementation, this would trigger a blockchain transaction
    lastBuyer = "YOU";
    // Update prize pool with $ instead of ETH
    prizePool = "$" + (parseFloat(prizePool.replace(/[^0-9.]/g, '')) + 1000).toFixed(2);
    playerTokens = (parseFloat(playerTokens) + 0.05).toFixed(2);
    
    // Reset timer for demo purposes
    timeRemaining = { hours: 23, minutes: 59, seconds: 59 };
    
    // Trigger shockwave effect
    triggerShockwave();
  }

  onMount(() => {
    // Update time display
    timeInterval = setInterval(() => {
      time = new Date();
    }, 1000);
    
    // Game timer update
    countdown = setInterval(updateTimer, 1000);
    
    // Initialize and animate
    initHexGrid();
    triggerGlitch();
    bootupSequence();
    
    // Handle resize
    window.addEventListener('resize', () => {
      initHexGrid();
    });
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(countdown);
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', initHexGrid);
    };
  });
  
  // Format time for display
  $: formattedTime = time.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Format date for display
  $: formattedDate = time.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '.');
  
  // Format time with leading zeros
  function formatTimeUnit(unit) {
    return unit.toString().padStart(2, '0');
  }
</script>

<div class="hud-container" class:glitch={glitchActive}>
  <!-- Hexagonal grid background -->
  <div class="hex-grid" bind:this={hexGrid}></div>
  
  <!-- Asteroids background -->
  <Asteroids count={asteroidCount} colors={asteroidColors} />
  
  <!-- Scanlines overlay -->
  {#if scanlineActive}
    <div class="scanlines"></div>
  {/if}
  
  <!-- Bootup sequence -->
  {#if !bootupComplete}
    <div class="bootup-sequence">
      <div class="bootup-text">
        INITIALIZING NEURAL INTERFACE...
      </div>
      <div class="progress-bar">
        <div class="progress"></div>
      </div>
      <div class="bootup-messages">
        > CONNECTING TO GRID NETWORK<br>
        > LOADING USER CREDENTIALS<br>
        > SECURING QUANTUM TUNNEL<br>
        > SYSTEM READY
      </div>
    </div>
  {:else}
    <!-- Main HUD layout -->
    <!-- Upper left corner (time & date) -->
    {#if hudElements.upperLeft.visible}
      <div class="hud-element upper-left" in:fly={{ y: -20, duration: 800 }}>
        <div class="hud-box">
          <div class="hud-time">{formattedTime}</div>
          <div class="hud-date">{formattedDate}</div>
          <div class="hud-status">[ SYSTEM ONLINE ]</div>
        </div>
      </div>
    {/if}
    
    <!-- Upper right corner (CPU/MEM stats) -->
    {#if hudElements.upperRight.visible}
      <div class="hud-element upper-right" in:fly={{ y: -20, duration: 800 }}>
        <div class="hud-box">
          <div class="hud-graph">
            <div class="graph-bar" style="height: {30 + Math.random() * 60}%"></div>
            <div class="graph-bar" style="height: {30 + Math.random() * 60}%"></div>
            <div class="graph-bar" style="height: {30 + Math.random() * 60}%"></div>
            <div class="graph-bar" style="height: {30 + Math.random() * 60}%"></div>
          </div>
          <div class="hud-stats">NET:SECURE</div>
        </div>
      </div>
    {/if}
    
    <!-- Center logo area -->
    {#if hudElements.centerLogo.visible}
      <div class="hud-element center-logo" in:fade={{ duration: 1000 }}>
        <div class="logo-container">
          <a href="/">
            <img src="/B4B.png" alt="Band 4 Band Logo" />
          </a>
          <div class="logo-glow"></div>
        </div>
      </div>
    {/if}
    
    <!-- Main Game Content Container -->
    {#if hudElements.gameContent.visible}
      <div class="hud-element game-content" in:fade={{ duration: 800, delay: 200 }}>
        <div class="game-frame">
          <!-- Frame decoration elements -->
          <div class="frame-corner top-left"></div>
          <div class="frame-corner top-right"></div>
          <div class="frame-corner bottom-left"></div>
          <div class="frame-corner bottom-right"></div>
          
          <div class="frame-edge top"></div>
          <div class="frame-edge right"></div>
          <div class="frame-edge bottom"></div>
          <div class="frame-edge left"></div>
          
          <!-- Header bar with game info -->
          <div class="game-header">
            <div class="game-status">
              STATUS: {gameContentReady ? 'ACTIVE' : 'LOADING'} 
              <span class="status-indicator"></span>
            </div>
            <div class="game-title">BAND 4 BAND CONTROL INTERFACE</div>
            <div class="game-version">v1.0.23</div>
          </div>
          
          <!-- Game content -->
          <div class="game-interface">
            <!-- Prize pool display -->
            <div class="prize-container">
              <div class="prize-label">PRIZE POOL</div>
              <div class="prize-value">{prizePool}</div>
              <div class="prize-subtitle">CURRENT LEADER: {lastBuyer}</div>
            </div>
            
            <!-- Timer display -->
            <div class="timer-container">
              <div class="timer-label">TIME REMAINING</div>
              <div class="timer-display">
                <span class="time-unit">{formatTimeUnit(timeRemaining.hours)}</span>
                <span class="time-separator">:</span>
                <span class="time-unit">{formatTimeUnit(timeRemaining.minutes)}</span>
                <span class="time-separator">:</span>
                <span class="time-unit">{formatTimeUnit(timeRemaining.seconds)}</span>
              </div>
            </div>
            
            <!-- Main button -->
            <div class="button-container">
              <button class="mega-button" on:click={clickButton}>
                <div class="button-pulse"></div>
                <div class="button-content">
                  <span class="button-primary-text">Claim $10,000,000</span>
                  <span class="button-secondary-text">CURRENT PRICE: {buttonPrice}</span>
                </div>
              </button>
            </div>
            
            <!-- Player stats -->
            <div class="player-stats">
              <div class="stat-item">
                <div class="stat-label">YOUR TOKENS</div>
                <div class="stat-value">{playerTokens}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">NETWORK</div>
                <div class="stat-value">ETHEREUM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Recent Buys Panel (Left side) -->
    {#if hudElements.recentBuys.visible}
      <div class="hud-element recent-buys" in:fly={{ x: -30, duration: 800 }}>
        <div class="hud-box panel">
          <div class="panel-header">
            <div class="panel-title">RECENT BUYS</div>
            <div class="panel-controls">
              <div class="panel-control"></div>
              <div class="panel-control"></div>
            </div>
          </div>
          <div class="panel-content">
            {#each recentBuys as buy}
              <div class="buy-item">
                <div class="buy-address">{buy.address}</div>
                <div class="buy-details">
                  <span class="buy-amount">{buy.amount}</span>
                  <span class="buy-time">{formatTimestamp(buy.timestamp)}</span>
                </div>
              </div>
            {/each}
          </div>
          <div class="panel-footer">
            <div class="pulse-dot"></div>
            <span>LIVE UPDATES</span>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Chatbox Panel (Right side) -->
    {#if hudElements.chatbox.visible}
      <div class="hud-element chatbox" class:expanded={chatboxExpanded} in:fly={{ x: 30, duration: 800 }}>
        <div class="hud-box panel">
          <div class="panel-header" on:click={toggleChatbox}>
            <div class="panel-title">GLOBAL CHAT</div>
            <div class="panel-controls">
              <div class="panel-control"></div>
              <div class="panel-control">{chatboxExpanded ? '−' : '+'}</div>
            </div>
          </div>
          
          <div class="panel-content chat-messages">
            {#each chatMessages as message}
              <div class="chat-message">
                <div class="message-header">
                  <span class="message-sender">{message.sender}</span>
                  <span class="message-time">{formatTimestamp(message.timestamp)}</span>
                </div>
                <div class="message-content">{message.message}</div>
              </div>
            {/each}
          </div>
          
          {#if chatboxExpanded}
            <div class="chat-input-container">
              <input 
                type="text" 
                bind:value={chatInput} 
                placeholder="Type a message..." 
                class="chat-input"
                on:keydown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button class="chat-send" on:click={sendMessage}>SEND</button>
            </div>
          {/if}
        </div>
      </div>
    {/if}
    
    <!-- Navigation options -->
    {#if hudElements.navOptions.visible}
      <div class="hud-element nav-options" in:fly={{ y: 30, duration: 800 }}>
        <div class="nav-button" on:click={toggleAbout}>
          <div class="button-glow"></div>
          <span class="button-text">ABOUT</span>
          <div class="button-brackets"></div>
        </div>
        
        <div class="nav-button" on:click={toggleRules}>
          <div class="button-glow"></div>
          <span class="button-text">RULES</span>
          <div class="button-brackets"></div>
        </div>
      </div>
    {/if}
    
    <!-- Lower left decorative element -->

    
    <!-- Lower right decorative element -->

  {/if}
</div>

<!-- Add animation control button -->
<div class="animation-control">
  <button class="hud-button" on:click={toggleAnimations}>
    {animationsPaused ? 'RESUME' : 'PAUSE'} ANIMATIONS
  </button>
</div>

<style>
  .hud-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
    font-family: 'Courier New', monospace;
    color: #00FFFF;
    overflow: hidden;
  }
  
  /* Hex grid background */
  .hex-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }
  
  .hexagon {
    position: absolute;
    width: 30px;
    height: 17px;
    background-color: rgba(0, 255, 255, 0.2);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
    z-index: 1;
  }
  
  .hexagon:before,
  .hexagon:after {
    content: "";
    position: absolute;
    width: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
  }
  
  .hexagon:before {
    bottom: 100%;
    border-bottom: 8.5px solid rgba(0, 255, 255, 0.2);
  }
  
  .hexagon:after {
    top: 100%;
    border-top: 8.5px solid rgba(0, 255, 255, 0.2);
  }
  
  @keyframes hex-pulse {
    0% { 
      opacity: 0.1; 
      box-shadow: 0 0 5px rgba(0, 255, 255, 0.2);
    }
    100% { 
      opacity: 0.4; 
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    }
  }
  
  /* Add animated grid lines */
  .hex-grid::before, 
  .hex-grid::after {
    content: '';
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  
  /* Horizontal grid lines */
  .hex-grid::before {
    top: 0;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 255, 255, 0) 0px,
      rgba(0, 255, 255, 0) 19px,
      rgba(0, 255, 255, 0.2) 20px,
      rgba(0, 255, 255, 0) 21px
    );
    animation: grid-slide-y 20s infinite linear;
  }
  
  /* Vertical grid lines */
  .hex-grid::after {
    top: 0;
    background: repeating-linear-gradient(
      to right,
      rgba(0, 255, 255, 0) 0px,
      rgba(0, 255, 255, 0) 19px,
      rgba(0, 255, 255, 0.2) 20px,
      rgba(0, 255, 255, 0) 21px
    );
    animation: grid-slide-x 20s infinite linear;
  }
  
  @keyframes grid-slide-y {
    0% { background-position: 0 0; }
    100% { background-position: 0 100vh; }
  }
  
  @keyframes grid-slide-x {
    0% { background-position: 0 0; }
    100% { background-position: 100vw 0; }
  }
  
  /* Scanlines effect */
  .scanlines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 15;
  }
  
  .scanlines:before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: linear-gradient(
      to bottom,
      transparent 50%,
      rgba(0, 255, 255, 0.02) 51%
    );
    background-size: 100% 4px;
    pointer-events: none;
  }
  
  /* Bootup sequence */
  .bootup-sequence {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    width: 80%;
    max-width: 500px;
    z-index: 20;
  }
  
  .bootup-text {
    font-size: 24px;
    margin-bottom: 20px;
    text-shadow: 0 0 10px #00FFFF;
    letter-spacing: 2px;
  }
  
  .progress-bar {
    width: 100%;
    height: 10px;
    background-color: rgba(0, 255, 255, 0.1);
    border: 1px solid #00FFFF;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }
  
  .progress {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 255, 255, 0.5);
    animation: progress 1s ease-in-out forwards;
    box-shadow: 0 0 10px #00FFFF;
  }
  
  @keyframes progress {
    0% { width: 0; }
    100% { width: 100%; }
  }
  
  .bootup-messages {
    font-size: 14px;
    text-align: left;
    color: rgba(0, 255, 255, 0.8);
    line-height: 1.5;
    animation: typewriter 1s steps(40) forwards;
  }
  
  @keyframes typewriter {
    from { height: 0; opacity: 0; }
    to { height: 100px; opacity: 1; }
  }
  
  /* HUD Elements */
  .hud-element {
    position: absolute;
    pointer-events: auto;
  }
  
  .hud-box {
    border: 1px solid rgba(0, 255, 255, 0.5);
    background-color: rgba(0, 0, 20, 0.5);
    backdrop-filter: blur(2px);
    padding: 10px;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
    position: relative;
  }
  
  .hud-box:before {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 1px solid rgba(0, 255, 255, 0.2);
    pointer-events: none;
  }
  
  /* Upper left element - Time */
  .upper-left {
    top: 15px;
    left: 15px;
  }
  
  .upper-left .hud-box {
    min-width: 150px;
  }
  
  .hud-time {
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 1px;
    text-shadow: 0 0 5px #00FFFF;
  }
  
  .hud-date, .hud-status {
    font-size: 12px;
    color: rgba(0, 255, 255, 0.7);
    margin-top: 5px;
  }
  
  /* Upper right element - Stats */
  .upper-right {
    top: 15px;
    right: 15px;
  }
  
  .upper-right .hud-box {
    min-width: 150px;
  }
  
  .hud-graph {
    display: flex;
    justify-content: space-between;
    height: 40px;
    margin-bottom: 5px;
  }
  
  .graph-bar {
    width: 20%;
    background-color: rgba(0, 255, 255, 0.6);
    box-shadow: 0 0 5px #00FFFF;
    align-self: flex-end;
  }
  
  .hud-stats {
    font-size: 12px;
    text-align: right;
  }
  
  /* Center logo */
  .center-logo {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 12;
  }
  
  .logo-container {
    position: relative;
    padding: 15px 30px;
    background-color: rgba(0, 0, 20, 0.7);
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-top: none;
  }
  
  .logo-container img {
    height: auto;
    width: auto;
    max-height: 60px;
    max-width: 180px;
    object-fit: contain;
    filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.7));
    transition: transform 0.3s ease;
    position: relative;
    z-index: 1;
  }
  
  .logo-container a:hover img {
    transform: scale(1.05);
  }
  
  .logo-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(0, 255, 255, 0.2) 0%,
      transparent 70%
    );
    z-index: 0;
  }
  
  /* Navigation buttons */
  .nav-options {
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 30px;
    justify-content: center;
  }
  
  .nav-button {
    position: relative;
    padding: 12px 25px;
    cursor: pointer;
    text-align: center;
    transition: all 0.3s ease;
    overflow: hidden;
  }
  
  .button-text {
    position: relative;
    z-index: 2;
    font-weight: bold;
    letter-spacing: 2px;
    font-size: 16px;
    text-shadow: 0 0 5px #00FFFF;
  }
  
  .button-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.5);
    transition: all 0.3s ease;
    z-index: 1;
  }
  
  .button-brackets:before,
  .button-brackets:after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    border: 2px solid #00FFFF;
    transition: all 0.3s ease;
    z-index: 3;
  }
  
  .button-brackets:before {
    top: 4px;
    left: 4px;
    border-right: none;
    border-bottom: none;
  }
  
  .button-brackets:after {
    bottom: 4px;
    right: 4px;
    border-left: none;
    border-top: none;
  }
  
  .nav-button:hover .button-glow {
    background-color: rgba(0, 255, 255, 0.2);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }
  
  .nav-button:hover .button-brackets:before {
    transform: translate(-3px, -3px);
  }
  
  .nav-button:hover .button-brackets:after {
    transform: translate(3px, 3px);
  }
  
  /* Lower-left element - Radar */
  .lower-left {
    bottom: 15px;
    left: 15px;
  }
  
  .radar-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 1px solid rgba(0, 255, 255, 0.5);
    position: relative;
  }
  
  .radar-line {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 1px;
    background-color: rgba(0, 255, 255, 0.7);
    transform-origin: left center;
    animation: radar-sweep 3s infinite linear;
    z-index: 1;
  }
  
  @keyframes radar-sweep {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .radar-blip {
    position: absolute;
    width: 5px;
    height: 5px;
    background-color: #00FFFF;
    border-radius: 50%;
    box-shadow: 0 0 5px #00FFFF;
    animation: radar-blip 2s infinite alternate;
  }
  
  @keyframes radar-blip {
    0% { opacity: 0.3; }
    100% { opacity: 1; }
  }
  
  /* Lower-right element - Decorative */
  .lower-right {
    bottom: 15px;
    right: 15px;
  }
  
  .corner-decoration {
    width: 80px;
    height: 40px;
    border-top: 2px solid rgba(0, 255, 255, 0.5);
    border-left: 2px solid rgba(0, 255, 255, 0.5);
    margin-bottom: 5px;
  }
  
  .mini-text {
    font-size: 12px;
    text-align: right;
  }
  
  /* Glitch effect */
  .glitch {
    animation: glitch 0.3s infinite;
  }
  
  @keyframes glitch {
    0% { transform: translate(0); }
    25% { transform: translate(1px, -1px); }
    50% { transform: translate(-1px, 1px); }
    75% { transform: translate(1px, 1px); }
    100% { transform: translate(0); }
  }
  
  /* Responsive layout */
  @media (max-width: 768px) {
    .upper-left .hud-box,
    .upper-right .hud-box {
      min-width: 100px;
    }
    
    .hud-time {
      font-size: 16px;
    }
    
    .logo-container img {
      max-height: 50px;
      max-width: 140px;
    }
    
    .nav-button {
      padding: 10px 15px;
    }
    
    .button-text {
      font-size: 14px;
    }
    
    .radar-circle {
      width: 60px;
      height: 60px;
    }
  }
  
  /* HUD Button Styles */
  .hud-button {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(0, 255, 255, 0.5);
    color: #00FFFF;
    padding: 5px 10px;
    margin-top: 8px;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
  }
  
  .hud-button:hover {
    background: rgba(0, 255, 255, 0.2);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
  
  /* Panel Styles for Recent Buys and Chatbox */
  .panel {
    min-width: 280px;
    display: flex;
    flex-direction: column;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 255, 255, 0.3);
    padding-bottom: 8px;
    margin-bottom: 10px;
    cursor: pointer;
  }
  
  .panel-title {
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 1px;
    text-shadow: 0 0 5px #00FFFF;
  }
  
  .panel-controls {
    display: flex;
    gap: 8px;
  }
  
  .panel-control {
    width: 16px;
    height: 16px;
    border: 1px solid rgba(0, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }
  
  .panel-content {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 255, 255, 0.5) rgba(0, 0, 0, 0.2);
    max-height: 250px;
  }
  
  .panel-content::-webkit-scrollbar {
    width: 4px;
  }
  
  .panel-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }
  
  .panel-content::-webkit-scrollbar-thumb {
    background-color: rgba(0, 255, 255, 0.5);
  }
  
  .panel-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 255, 255, 0.3);
    font-size: 10px;
  }
  
  /* Recent Buys Styles */
  .recent-buys {
    position: fixed;
    left: 15px;
    top: 100px;
    bottom: 100px;
    width: 280px;
    height: auto;
  }
  
  .recent-buys .panel {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .recent-buys .panel-content {
    flex: 1;
    max-height: none;
    overflow-y: auto;
  }
  
  .buy-item {
    padding: 8px 0;
    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  }
  
  .buy-address {
    color: #00FFFF;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .buy-details {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(0, 255, 255, 0.7);
  }
  
  .buy-amount {
    font-weight: bold;
  }
  
  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #00FFFF;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7); }
    70% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(0, 255, 255, 0); }
    100% { opacity: 1; }
  }
  
  /* Chatbox Styles */
  .chatbox {
    position: fixed;
    right: 15px;
    top: 100px;
    bottom: 100px;
    width: 280px;
    height: auto;
  }
  
  .chatbox .panel {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  /* Always show chat even when not expanded */
  .chatbox .panel-content {
    flex: 1;
    max-height: none;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  /* Make chat always visible, not just when expanded */
  .chatbox:not(.expanded) .panel-content {
    max-height: calc(100% - 60px);
    display: block;
  }
  
  .chatbox.expanded .panel {
    height: 100%;
  }
  
  .chat-messages {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .chat-message {
    padding: 5px 0;
  }
  
  .message-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
  }
  
  .message-sender {
    font-weight: bold;
    font-size: 12px;
    color: #00FFFF;
  }
  
  .message-time {
    font-size: 10px;
    color: rgba(0, 255, 255, 0.6);
  }
  
  .message-content {
    font-size: 13px;
    line-height: 1.4;
    word-break: break-word;
  }
  
  .chat-input-container {
    display: flex;
    margin-top: 10px;
    gap: 5px;
  }
  
  .chat-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(0, 255, 255, 0.3);
    color: #00FFFF;
    padding: 8px 10px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }
  
  .chat-input:focus {
    outline: none;
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  }
  
  .chat-send {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 255, 255, 0.5);
    color: #00FFFF;
    padding: 5px 10px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    transition: all 0.3s ease;
  }
  
  .chat-send:hover {
    background-color: rgba(0, 255, 255, 0.2);
  }
  
  /* Game Interface Styles */
  .game-interface {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: calc(100% - 35px);
    gap: 20px;
    padding: 10px 0;
  }
  
  /* Prize Pool */
  .prize-container {
    text-align: center;
    width: 100%;
    padding: 15px;
    border: 1px solid rgba(0, 255, 255, 0.3);
    background-color: rgba(0, 0, 50, 0.3);
    margin-bottom: 10px;
  }
  
  .prize-label {
    font-size: 16px;
    margin-bottom: 5px;
    color: rgba(0, 255, 255, 0.8);
  }
  
  .prize-value {
    font-size: 48px;
    font-weight: bold;
    color: #00FFFF;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
    margin-bottom: 5px;
    letter-spacing: 1px;
  }
  
  .prize-subtitle {
    font-size: 14px;
    color: rgba(0, 255, 255, 0.6);
  }
  
  /* Timer Display */
  .timer-container {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .timer-label {
    font-size: 14px;
    margin-bottom: 5px;
    color: rgba(0, 255, 255, 0.8);
  }
  
  .timer-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }
  
  .time-unit {
    font-size: 32px;
    font-weight: bold;
    color: #00FFFF;
    background-color: rgba(0, 0, 50, 0.5);
    padding: 5px 10px;
    border: 1px solid rgba(0, 255, 255, 0.3);
    min-width: 50px;
    text-align: center;
  }
  
  .time-separator {
    font-size: 32px;
    color: #00FFFF;
  }
  
  /* Mega Button */
  .button-container {
    position: relative;
    width: 100%;
    max-width: 300px;
    margin: 10px 0 30px;
  }
  
  .mega-button {
    position: relative;
    width: 100%;
    height: 120px;
    background-color: rgba(0, 50, 100, 0.4);
    border: 2px solid #00FFFF;
    cursor: pointer;
    padding: 20px;
    transition: all 0.3s ease;
    overflow: hidden;
    font-family: 'Courier New', monospace;
    z-index: 1;
  }
  
  .button-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150%;
    height: 150%;
    background: radial-gradient(
      circle,
      rgba(0, 255, 255, 0.5) 0%,
      transparent 70%
    );
    opacity: 0;
    animation: button-pulse 2s infinite;
    z-index: 0;
  }
  
  @keyframes button-pulse {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  }
  
  .button-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  
  .button-primary-text {
    font-size: 24px;
    font-weight: bold;
    color: #00FFFF;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
    margin-bottom: 10px;
    letter-spacing: 2px;
  }
  
  .button-secondary-text {
    font-size: 14px;
    color: rgba(0, 255, 255, 0.8);
  }
  
  .mega-button:hover {
    background-color: rgba(0, 100, 200, 0.4);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    transform: scale(1.02);
  }
  
  .mega-button:active {
    transform: scale(0.98);
    background-color: rgba(0, 150, 255, 0.6);
  }
  
  /* Player Stats */
  .player-stats {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 20px;
  }
  
  .stat-item {
    flex: 1;
    text-align: center;
    border: 1px solid rgba(0, 255, 255, 0.3);
    padding: 10px;
    background-color: rgba(0, 0, 50, 0.3);
  }
  
  .stat-label {
    font-size: 12px;
    margin-bottom: 5px;
    color: rgba(0, 255, 255, 0.7);
  }
  
  .stat-value {
    font-size: 18px;
    font-weight: bold;
    color: #00FFFF;
  }
  
  /* Responsive styles */
  @media (max-width: 1400px) {
    .game-content {
      width: calc(100% - 600px);
    }
  }
  
  @media (max-width: 1200px) {
    .recent-buys, .chatbox {
      width: 240px;
    }
    
    .game-content {
      width: calc(100% - 520px);
    }
  }
  
  @media (max-width: 1000px) {
    .recent-buys, .chatbox {
      width: 200px;
    }
    
    .game-content {
      width: calc(100% - 440px);
    }
    
    .buy-address, .message-sender {
      font-size: 12px;
    }
    
    .buy-details, .message-time {
      font-size: 10px;
    }
  }
  
  @media (max-width: 768px) {
    .game-content {
      width: calc(100% - 20px);
      top: 80px;
      height: calc(100% - 180px);
    }
    
    .recent-buys, .chatbox {
      top: initial;
      position: fixed;
      height: 200px;
      width: calc(50% - 20px);
      bottom: 100px;
    }
    
    .recent-buys {
      left: 10px;
    }
    
    .chatbox {
      right: 10px;
    }
    
    .game-title {
      font-size: 14px;
    }
    
    .game-status, .game-version {
      font-size: 10px;
    }
    
    .prize-value {
      font-size: 36px;
    }
    
    .time-unit {
      font-size: 24px;
      min-width: 40px;
    }
    
    .time-separator {
      font-size: 24px;
    }
    
    .button-primary-text {
      font-size: 20px;
    }
    
    .mega-button {
      height: 100px;
    }
  }
  
  /* Game Content Styles */
  .game-content {
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 640px);
    height: calc(100% - 220px);
    z-index: 5;
  }
  
  .game-frame {
    width: 100%;
    height: 100%;
    position: relative;
    border: 1px solid rgba(0, 255, 255, 0.3);
    background-color: rgba(0, 0, 20, 0.3);
    backdrop-filter: blur(2px);
    padding: 20px;
    box-sizing: border-box;
  }
  
  .frame-corner {
    position: absolute;
    width: 15px;
    height: 15px;
    border: 2px solid #00FFFF;
    z-index: 1;
  }
  
  .top-left {
    top: -2px;
    left: -2px;
    border-right: none;
    border-bottom: none;
  }
  
  .top-right {
    top: -2px;
    right: -2px;
    border-left: none;
    border-bottom: none;
  }
  
  .bottom-left {
    bottom: -2px;
    left: -2px;
    border-right: none;
    border-top: none;
  }
  
  .bottom-right {
    bottom: -2px;
    right: -2px;
    border-left: none;
    border-top: none;
  }
  
  .frame-edge {
    position: absolute;
    background-color: rgba(0, 255, 255, 0.2);
  }
  
  .top, .bottom {
    height: 1px;
    width: calc(100% - 40px);
    left: 20px;
  }
  
  .left, .right {
    width: 1px;
    height: calc(100% - 40px);
    top: 20px;
  }
  
  .top { top: -1px; }
  .right { right: -1px; }
  .bottom { bottom: -1px; }
  .left { left: -1px; }
  
  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 255, 255, 0.3);
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  .game-status {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #00FFFF;
    animation: blink 1.5s infinite;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  
  .game-title {
    font-weight: bold;
    font-size: 16px;
    text-shadow: 0 0 5px #00FFFF;
    letter-spacing: 1px;
  }
  
  .game-version {
    font-size: 12px;
    opacity: 0.7;
  }
  
  /* Animation control */
  .animation-control {
    position: fixed;
    bottom: 15px;
    right: 15px;
    z-index: 15;
    pointer-events: auto;
  }
  
  /* Control asteroid animation state globally */
  :global(:root) {
    --animation-play-state: running;
  }
</style> 