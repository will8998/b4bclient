<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly, fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { triggerShockwave } from './GridBackground.svelte';
  import Asteroids from './Asteroids.svelte';
  
  export let toggleAbout;
  export let toggleRules;
  
  // Wallet connection state
  let walletConnected = false;
  let connectedWalletAddress = '';
  let showWalletModal = false;
  let connectingWallet = false;
  
  // Wallet list
  const walletOptions = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊' },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '💰' },
    { id: 'trustwallet', name: 'Trust Wallet', icon: '🔐' }
  ];
  
  // Toggle wallet modal
  function toggleWalletModal() {
    showWalletModal = !showWalletModal;
  }
  
  // Connect wallet function
  async function connectWallet(walletType) {
    connectingWallet = true;
    
    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock connection - in production, this would integrate with actual wallet providers
      if (walletType === 'metamask') {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
          try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleSuccessfulConnection(accounts[0]);
          } catch (error) {
            console.error('User denied account access', error);
          }
        } else {
          window.open('https://metamask.io/download/', '_blank');
        }
      } else {
        // Mock connection for other wallets
        const mockAddress = '0x' + Array(40).fill(0).map(() => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        handleSuccessfulConnection(mockAddress);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      connectingWallet = false;
      showWalletModal = false;
    }
  }
  
  function handleSuccessfulConnection(address) {
    walletConnected = true;
    connectedWalletAddress = address;
    // Add animation effect
    triggerShockwave();
  }
  
  function disconnectWallet() {
    walletConnected = false;
    connectedWalletAddress = '';
  }
  
  function shortenAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
  }
  
  // Additional functions for new buttons
  function openTelegram() {
    window.open('https://t.me/band4band', '_blank');
  }
  
  function openTwitter() {
    window.open('https://twitter.com/band4bandwtf', '_blank');
  }
  
  function openWhitepaper() {
    window.open('/whitepaper.pdf', '_blank');
  }
  
  function openDocumentation() {
    window.open('/docs', '_blank');
  }
  
  // Mock data for block information and participants
  let currentBlock = 16842103;
  let participants = 4291;
  
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

  // Update the block number every few seconds
  function updateBlockNumber() {
    setInterval(() => {
      currentBlock += 1;
    }, 12000);
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
    updateBlockNumber();
    
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
    <!-- Upper left corner (time, date & participants) -->
    {#if hudElements.upperLeft.visible}
      <div class="hud-element upper-left" in:fly={{ y: -20, duration: 800 }}>
        <div class="hud-box">
         
          <div class="hud-status">[ SYSTEM ONLINE ]</div>
          <div class="hud-participants">PARTICIPANTS: {participants.toLocaleString()}</div>
        </div>
      </div>
    {/if}
    
    <!-- Upper right corner (CPU/MEM stats & block number) -->
    {#if hudElements.upperRight.visible}
      <div class="hud-element upper-right" in:fly={{ y: -50, duration: 800 }}>
        <div class="hud-box">
    
        
          <!-- Connect Wallet Button -->
          {#if !walletConnected}
            <button class="wallet-button" on:click={toggleWalletModal}>
              <div class="button-glow"></div>
              <span class="wallet-button-text">CONNECT WALLET</span>
              <div class="button-brackets"></div>
            </button>
          {:else}
            <button class="wallet-button connected" on:click={disconnectWallet}>
              <div class="button-glow"></div>
              <span class="wallet-button-text">{shortenAddress(connectedWalletAddress)}</span>
              <div class="button-brackets"></div>
            </button>
          {/if}
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
          <a href="/whitepaper.pdf" class="whitepaper-link" on:click|preventDefault={openWhitepaper}>WHITEPAPER</a>
        </div>
      </div>
    {/if}
    
    <!-- Main Game Content Container -->
    {#if hudElements.gameContent.visible}
      <div class="hud-element game-content" in:fade={{ duration: 800, delay: 200 }}>
        <div class="game-frame">
    
          <!-- Game content -->
          <div class="game-interface">
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
            <!-- Prize pool display -->
            <div class="prize-container">
              <div class="prize-label">PRIZE POOL</div>
              <div class="prize-value">{prizePool}</div>
              <div class="prize-subtitle">CURRENT LEADER: {lastBuyer}</div>
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
            <!-- Main button -->
            <div class="button-container">
              <button class="mega-button" on:click={clickButton}>
                <div class="button-pulse"></div>
                <div class="button-content">
                  <span class="button-primary-text">Claim Your Bag</span>
                  <span class="button-secondary-text">CURRENT PRICE: {buttonPrice}</span>
                </div>
              </button>
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
        
    <!-- Featured on logos section -->
    {#if hudElements.navOptions.visible}
      <div class="hud-element featured-logos" in:fade={{ duration: 1000, delay: 1500 }}>
        <div class="featured-title">AS SEEN ON</div>
        <div class="logos-container">
          <div class="logo-item">YAHOO FINANCE</div>
          <div class="logo-item">VICE</div>
          <div class="logo-item">COINDESK</div>
          <div class="logo-item">COINTELEGRAPH</div>
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
        
        <div class="nav-button" on:click={openTelegram}>
          <div class="button-glow"></div>
          <span class="button-text">TELEGRAM</span>
          <div class="button-brackets"></div>
        </div>
        
        <div class="nav-button" on:click={openTwitter}>
          <div class="button-glow"></div>
          <span class="button-text">TWITTER</span>
          <div class="button-brackets"></div>
        </div>
      </div>
    {/if}

    <!-- Lower left decorative element -->

    
    <!-- Lower right decorative element -->

  {/if}
</div>

<!-- Wallet Modal -->
{#if showWalletModal}
  <div class="modal-overlay" on:click={toggleWalletModal} transition:fade={{ duration: 200 }}>
    <div class="wallet-modal" on:click|stopPropagation transition:scale={{ duration: 300, easing: quintOut, start: 0.8 }}>
      <button class="close-button" on:click={toggleWalletModal}>×</button>
      <h2>Connect Your Wallet</h2>
      <div class="wallet-options">
        {#each walletOptions as wallet}
          <button 
            class="wallet-option" 
            on:click={() => connectWallet(wallet.id)} 
            disabled={connectingWallet}
          >
            <span class="wallet-icon">{wallet.icon}</span>
            <span class="wallet-name">{wallet.name}</span>
          </button>
        {/each}
      </div>
      {#if connectingWallet}
        <div class="connecting-indicator">
          <div class="loader"></div>
          <span>Connecting...</span>
        </div>
      {/if}
    </div>
  </div>
{/if}

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
    gap: 15px;
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
    right: 20px;
    top: 100px;
    bottom: 100px;
    width: 260px;
    height: auto;
    max-width: 20%;
  }
  
  .chatbox .panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
    gap: 0px;
    padding: 0px 0;
  }
  
  /* Prize Pool */
  .prize-container {
    text-align: center;
    width: 100%;
    padding: 10px;
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
    width: 50%;
    gap: 20px;
  }
  
  .stat-item {
    flex: 1;
    text-align: center;
    border: 1px solid rgba(0, 255, 255, 0.3);
    padding: 10px;

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
  
  /* New styles for added features */
  .hud-participants {
    font-size: 14px;
    color: #00FFFF;
    margin-top: 8px;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  }
  
  .hud-block {
    font-size: 14px;
    color: #00FFFF;
    margin-top: 5px;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
    text-align: right;
  }
  
  .whitepaper-link {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #00FFFF;
    text-decoration: none;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
    padding: 3px 8px;
    border: 1px solid rgba(0, 255, 255, 0.3);
    background-color: rgba(0, 0, 20, 0.5);
    transition: all 0.3s ease;
  }
  
  .whitepaper-link:hover {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.6);
  }
  
  .docs-link {
    position: absolute;
    top: -20px;
    right: 0;
  }
  
  .docs-link a {
    font-size: 12px;
    color: #00FFFF;
    text-decoration: none;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
    padding: 3px 8px;
    border: 1px solid rgba(0, 255, 255, 0.3);
    background-color: rgba(0, 0, 20, 0.5);
    transition: all 0.3s ease;
  }
  
  .docs-link a:hover {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.6);
  }
  
  .featured-logos {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    padding: 10px 20px;
    background-color: rgba(0, 0, 20, 0.5);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 5px;
  }
  
  .featured-title {
    font-size: 12px;
    color: rgba(0, 255, 255, 0.7);
    margin-bottom: 8px;
    letter-spacing: 2px;
  }
  
  .logos-container {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .logo-item {
    font-size: 14px;
    font-weight: bold;
    color: #00FFFF;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.7);
    padding: 5px 10px;
    border: 1px solid rgba(0, 255, 255, 0.3);
    background-color: rgba(0, 0, 20, 0.7);
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
    height: 90%;
    position: relative;
border-radius:12px;
    backdrop-filter: blur(1px);
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

  /* Responsive styles */
  @media (max-width: 1400px) {
    .game-content {
      width: calc(100% - 600px);
    }
    
    .chatbox {
      width: 240px;
      max-width: 18%;
    }
  }
  
  @media (max-width: 1200px) {
    .recent-buys, .chatbox {
      width: 220px;
    }
    
    .chatbox {
      right: 15px;
      max-width: 20%;
    }
    
    .game-content {
      width: calc(100% - 500px);
    }
  }
  
  @media (max-width: 1000px) {
    .recent-buys, .chatbox {
      width: 190px;
    }
    
    .chatbox {
      right: 10px;
    }
    
    .game-content {
      width: calc(100% - 420px);
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
      height: 180px;
      width: calc(50% - 15px);
      bottom: 100px;
      max-width: none;
    }
    
    .recent-buys {
      left: 10px;
    }
    
    .chatbox {
      right: 10px;
    }
    
    .panel {
      min-width: auto;
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
  
  /* Wallet Button Styles */
  .wallet-button {
    position: relative;
    width: 100%;
    padding: 8px 16px;
    margin-top: 10px;
    background-color: rgba(0, 0, 20, 0.5);
    border: none;
    color: #00FFFF;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    letter-spacing: 1px;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
    transition: all 0.3s ease;
    overflow: hidden;
    z-index: 2;
  }
  
  .wallet-button-text {
    position: relative;
    z-index: 2;
    font-weight: bold;
    letter-spacing: 1px;
  }
  
  .wallet-button .button-brackets:before,
  .wallet-button .button-brackets:after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    border: 2px solid #00FFFF;
    transition: all 0.3s ease;
    z-index: 3;
  }
  
  .wallet-button .button-brackets:before {
    top: 4px;
    left: 4px;
    border-right: none;
    border-bottom: none;
  }
  
  .wallet-button .button-brackets:after {
    bottom: 4px;
    right: 4px;
    border-left: none;
    border-top: none;
  }
  
  .wallet-button .button-glow {
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
  
  .wallet-button:hover .button-glow {
    background-color: rgba(0, 255, 255, 0.2);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }
  
  .wallet-button.connected .button-glow {
    background-color: rgba(0, 255, 128, 0.2);
    border-color: rgba(0, 255, 128, 0.6);
  }
  
  .wallet-button.connected {
    color: #00FF80;
    text-shadow: 0 0 5px rgba(0, 255, 128, 0.7);
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 20, 0.8);
    backdrop-filter: blur(5px);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .wallet-modal {
    position: relative;
    background-color: rgba(10, 20, 50, 0.9);
    border: 2px solid #00FFFF;
    border-radius: 10px;
    padding: 30px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
  }
  
  .wallet-modal h2 {
    color: #00FFFF;
    text-align: center;
    margin-bottom: 25px;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
  }
  
  .wallet-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .wallet-option {
    display: flex;
    align-items: center;
    background-color: rgba(0, 40, 70, 0.6);
    border: 1px solid rgba(0, 255, 255, 0.4);
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .wallet-option:hover {
    background-color: rgba(0, 60, 100, 0.6);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
    transform: translateY(-2px);
  }
  
  .wallet-icon {
    font-size: 24px;
    margin-right: 15px;
  }
  
  .wallet-name {
    color: #00FFFF;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 1px;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  }
  
  .connecting-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
    padding: 12px;
    color: #00FFFF;
    background-color: rgba(0, 40, 70, 0.4);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 8px;
  }
  
  .loader {
    width: 22px;
    height: 22px;
    border: 2px solid rgba(0, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #00FFFF;
    animation: spin 1s linear infinite;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
  
  .connecting-indicator span {
    font-weight: bold;
    letter-spacing: 1px;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .wallet-option:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Mobile adjustments */
  @media (max-width: 768px) {
    .wallet-button {
      padding: 8px 15px;
      font-size: 12px;
    }
    
    .wallet-options {
      gap: 10px;
    }
    
    .wallet-icon {
      font-size: 20px;
      margin-right: 10px;
    }
    
    .wallet-name {
      font-size: 14px;
    }
  }
</style> 