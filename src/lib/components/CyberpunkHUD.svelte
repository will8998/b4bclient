<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { fly, fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { triggerShockwave } from './GridBackground.svelte';
  import Asteroids from './Asteroids.svelte';
  import gameService from '$lib/api/gameService';
  
  // For backend integration - add exports for properties that will come from parent
  export let toggleAbout;
  export let toggleRules;
  export let apiEndpoint = '/api'; // API endpoint configuration
  export let websocketEndpoint = 'wss://your-backend.com/ws'; // WebSocket endpoint
  export let contractAddress = '0x0000000000000000000000000000000000000000'; // Smart contract address
  export let useSampleData = true; // Use sample data for development
  
  // Configure game service
  gameService.apiEndpoint = apiEndpoint;
  gameService.useSampleData = useSampleData;
  
  // WebSocket connection for real-time updates
  let ws;
  let wsConnected = false;
  
  // Backend API response data with defaults
  let gameData = {
    prizePool: "10000000.00",
    consolationPrizePool: "1000000.00",
    timeRemaining: { hours: 23, minutes: 45, seconds: 12 },
    lastBuyer: "0x0000000000000000000000000000000000000000",
    totalParticipants: 0,
    currentPrice: "1000.00",
    recentBuys: []
  };
  
  // Player state from backend - will be updated on wallet connection/API calls
  let playerState = {
    address: "",
    isConnected: false,
    tokenBalance: "0.0",
    amountSpent: "0.00",
    isCurrentLeader: false,
    shareOfConsolation: "0.00",
    sharePercentage: "0%",
    profit: "0.00",
    isInProfit: false
  };
  
  // First declaring the needed variables that were missing
  // Anxiety mode toggle
  let anxietyMode = false;
  
  // Audio elements
  let bgMusic;
  let clickSound;
  let audioInitialized = false;
  let audioContext;
  
  // All required game variables
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
  
  // Mock data for block information and participants
  let currentBlock = 16842103;
  let participants = 4291;
  
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
  let totalAmountSpent = "$0.00";
  let consolationPrize = "$0.00";
  let referralIncome = "$0.00";
  let countdown;
  
  // Player P&L state
  let playerHasBought = false;
  let playerIsWinning = false;
  let consolationPrizePool = "$1,000,000";
  let shareOfConsolationPrize = "0%";
  let playerShareAmount = "$0.00";
  let profitLoss = "$0.00";
  
  // Add animation control state
  let animationsPaused = false;
  
  // Referral system
  let showReferralModal = false;
  let referralLink = 'https://band4band.com/?ref=' + Math.random().toString(36).substring(2, 10);
  let referralPayout = "$500";
  
  // Mock data for referral leaderboard
  let referralLeaderboard = [
    { address: '0x76c...9e2d', earned: '$2,450' },
    { address: '0x42f...3a7b', earned: '$1,890' },
    { address: '0x33a...7c8f', earned: '$1,240' },
    { address: '0x91d...4e6a', earned: '$950' },
    { address: '0x67b...1d5c', earned: '$820' }
  ];
  
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
  
  const dispatch = createEventDispatcher();
  
  // Function to initialize audio after user interaction
  function initializeAudio() {
    if (audioInitialized) return;
    
    // Create audio context
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Start playing background music
      if (bgMusic) {
        bgMusic.volume = 0.3; // Lower volume for background music
        bgMusic.play().catch(err => console.log('Audio playback prevented by browser:', err));
      }
      
      audioInitialized = true;
    } catch (e) {
      console.error('Web Audio API not supported:', e);
    }
  }
  
  // Function to play click sound
  function playClickSound() {
    if (!audioInitialized) {
      initializeAudio();
      return;
    }
    
    if (clickSound) {
      clickSound.currentTime = 0;
      clickSound.volume = 0.5;
      clickSound.play().catch(err => console.log('Click sound playback prevented:', err));
    }
  }
  
  // Function to switch background music
  function switchBackgroundMusic(mode) {
    if (!audioInitialized) return;
    
    if (bgMusic) {
      // Fade out current music
      const fadeInterval = setInterval(() => {
        if (bgMusic.volume > 0.02) {
          bgMusic.volume -= 0.02;
        } else {
          clearInterval(fadeInterval);
          bgMusic.pause();
          
          // Change the source
          bgMusic.src = mode === 'anxiety' ? '/audio/anxiety.mp3' : '/audio/calm.mp3';
          
          // Play new music with fade in
          bgMusic.volume = 0;
          bgMusic.play().then(() => {
            const fadeInInterval = setInterval(() => {
              if (bgMusic.volume < 0.28) {
                bgMusic.volume += 0.02;
              } else {
                bgMusic.volume = 0.3;
                clearInterval(fadeInInterval);
              }
            }, 100);
          }).catch(err => console.log('Background music switch prevented:', err));
        }
      }, 100);
    }
  }
  
  // Anxiety mode toggle
  function toggleAnxietyMode() {
    anxietyMode = !anxietyMode;
    
    // Change asteroid colors based on mode
    if (anxietyMode) {
      asteroidColors = ['#FF0000', '#FF3333', '#FF6666', '#FF9999'];
      asteroidCount = 150; // More asteroids in anxiety mode
      switchBackgroundMusic('anxiety');
      dispatch('pauseBgMusic');
    } else {
      asteroidColors = ['#00FFFF', '#00CCFF', '#00AAFF', '#0088FF']; 
      asteroidCount = 100; // Normal amount in standard mode
      switchBackgroundMusic('calm');
    }
    
    // Play click sound
    playClickSound();
    
    // Trigger shockwave effect on mode change
    triggerShockwave();
  }
  
  // Mobile detection
  let isMobile = false;
  let touchStartY = 0;
  let isScrolling = false;
  let mobileChatVisible = false;
  let mobileBuysVisible = false;
  
  // Handle mobile content toggle with sound
  function toggleMobileContent(type) {
    playClickSound();
    if (type === 'chat') {
      mobileChatVisible = !mobileChatVisible;
      if (mobileChatVisible) mobileBuysVisible = false;
    } else if (type === 'buys') {
      mobileBuysVisible = !mobileBuysVisible;
      if (mobileBuysVisible) mobileChatVisible = false;
    }
  }
  
  // The rest of the existing variables and functions
  
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
  
  // Toggle wallet modal with sound
  function toggleWalletModal() {
    playClickSound();
    showWalletModal = !showWalletModal;
  }
  
  // Connect wallet function
  async function connectWallet(walletType) {
    playClickSound();
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
    playClickSound();
    walletConnected = false;
    connectedWalletAddress = '';
  }
  
  function shortenAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
  }
  
  // Check if an address is the current user
  function isCurrentUser(address) {
    if (!address || !playerState.address) return false;
    return address.toLowerCase() === playerState.address.toLowerCase();
  }
  
  // Format address for display
  function formatDisplayAddress(address) {
    if (!address) return '';
    if (isCurrentUser(address)) return 'YOU';
    return shortenAddress(address);
  }
  
  // Additional functions for new buttons with sound
  function openTelegram() {
    playClickSound();
    window.open('https://t.me/band4band', '_blank');
  }
  
  function openTwitter() {
    playClickSound();
    window.open('https://twitter.com/band4bandwtf', '_blank');
  }
  
  function openWhitepaper() {
    playClickSound();
    window.open('/whitepaper.pdf', '_blank');
  }
  
  function openDocumentation() {
    playClickSound();
    window.open('/docs', '_blank');
  }
  
  // Function to toggle referral modal with sound
  function toggleReferralModal() {
    playClickSound();
    showReferralModal = !showReferralModal;
  }
  
  // Function to toggle chatbox expanded state with sound
  function toggleChatbox() {
    playClickSound();
    chatboxExpanded = !chatboxExpanded;
  }
  
  // Click button function with sound
  function clickButton() {
    playClickSound();
    submitBuyTransaction();
  }
  
  // Copy referral link with sound
  function copyReferralLink() {
    playClickSound();
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        // Show a temporary "Copied!" message
        const copyButton = document.querySelector('.copy-button');
        if (copyButton) {
          const originalText = copyButton.textContent;
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            copyButton.textContent = originalText;
          }, 2000);
        }
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  }
  
  // Toggle animation state with sound
  function toggleAnimations() {
    playClickSound();
    animationsPaused = !animationsPaused;
    document.documentElement.style.setProperty('--animation-play-state', 
      animationsPaused ? 'paused' : 'running');
  }
  
  // Toggle glitch effect with sound
  function toggleGlitch() {
    playClickSound();
    glitchEnabled = !glitchEnabled;
    if (!glitchEnabled) {
      glitchActive = false;
    }
  }
  
  onMount(() => {
    // Initial data load
    loadGameData();
    
    // Start websocket connection
    initWebSocket();
    
    // Update time display
    timeInterval = setInterval(() => {
      time = new Date();
    }, 1000);
    
    // Game timer update - this acts as a backup timer when WebSocket fails
    countdown = setInterval(updateTimer, 1000);
    
    // Initialize and animate
    initHexGrid();
    triggerGlitch();
    bootupSequence();
    
    // Check if mobile on load
    if (typeof checkMobile === 'function') {
      checkMobile();
    }
    
    // Handle resize
    window.addEventListener('resize', () => {
      initHexGrid();
      if (typeof checkMobile === 'function') {
        checkMobile();
      }
    });
    
    // Check for existing wallet connection
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            handleSuccessfulConnection(accounts[0]);
            loadPlayerData(accounts[0]);
          }
        })
        .catch(err => console.error('Error checking for existing wallet connection:', err));
        
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          disconnectWallet();
        } else {
          // Account changed
          handleSuccessfulConnection(accounts[0]);
          loadPlayerData(accounts[0]);
        }
      });
    }
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(countdown);
      cancelAnimationFrame(animationFrame);
      
      // Close WebSocket
      if (ws) {
        ws.close();
      }
      
      // Remove window event listeners
      window.removeEventListener('resize', initHexGrid);
      
      // Remove ethereum event listeners
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners();
      }
    };
  });
  
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
          // Update the visible property and trigger reactivity by reassigning
          hudElements = {
            ...hudElements,
            [key]: { ...hudElements[key], visible: true }
          };
          
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
  
  // Format time with leading zeros
  function formatTimeUnit(unit) {
    return unit.toString().padStart(2, '0');
  }
  
  // Update block number
  function updateBlockNumber() {
    setInterval(() => {
      currentBlock += 1;
    }, 12000);
  }
  
  // Simulate referral income updates
  function simulateReferrals() {
    setInterval(() => {
      // Simulate a new referral with a 30% chance
      if (Math.random() < 0.3) {
        // Random amount between $50-$200 for the referral
        const referralAmount = Math.floor(Math.random() * 150) + 50;
        referralIncome = "$" + (parseFloat(referralIncome.replace(/[^0-9.]/g, '')) + referralAmount).toFixed(2);
      }
    }, 30000); // Check every 30 seconds
  }
  
  // Rest of the script remains the same...
  
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
  
  // Format prize pool 
  $: formattedPrizePool = gameData?.prizePool ? `$${parseFloat(gameData.prizePool).toLocaleString()}` : prizePool;
  
  // Add a log statement to help debug
  $: if (hudElements.gameContent.visible) {
    console.log('Game content is visible');
  }
  
  // Backend Integration Functions
  
  // Initialize WebSocket connection
  async function initWebSocket() {
    try {
      ws = await gameService.initWebSocket(websocketEndpoint, (event) => {
        // Handle incoming messages
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      wsConnected = true;
      
      // Subscribe to player updates if connected
      if (playerState.isConnected) {
        subscribeToPlayerUpdates(playerState.address);
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      wsConnected = false;
    }
  }
  
  // Handle incoming WebSocket messages
  function handleWebSocketMessage(data) {
    if (!data) return;
    
    if (data.type === 'game_update') {
      // Update game state
      updateGameData(data.gameData);
    } else if (data.type === 'player_update' && data.address === playerState.address) {
      // Update player state
      updatePlayerState(data.playerData);
    } else if (data.type === 'new_buy') {
      // Add to recent buys
      addRecentBuy(data.buyData);
    } else if (data.type === 'chat_message') {
      // Add to chat
      addChatMessage(data.chatData);
    }
  }
  
  // Subscribe to player-specific updates
  function subscribeToPlayerUpdates(address) {
    if (!wsConnected || !address) return;
    
    if (ws) {
      ws.send(JSON.stringify({
        action: 'subscribe',
        address: address
      }));
    }
  }
  
  // Load game data from API
  async function loadGameData() {
    try {
      const data = await gameService.getGameState();
      updateGameData(data);
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  }
  
  // Load player data from API
  async function loadPlayerData(address) {
    if (!address) return;
    
    try {
      const data = await gameService.getPlayerData(address);
      updatePlayerState(data);
    } catch (error) {
      console.error('Error loading player data:', error);
    }
  }
  
  // Update game data from API response
  function updateGameData(data) {
    if (!data) return;
    
    gameData = {
      ...gameData,
      ...data
    };
    
    // Update derived values
    if (data.recentBuys) {
      // Convert to our format
      const formattedBuys = data.recentBuys.map(buy => ({
        address: shortenAddress(buy.address),
        amount: `${buy.amount} ETH`,
        timestamp: buy.timestamp
      }));
      gameData.recentBuys = formattedBuys;
    }
    
    // Update timer if it came from backend
    if (data.timeRemaining) {
      timeRemaining = data.timeRemaining;
    }
    
    // Check if player is the leader
    if (playerState.address && data.lastBuyer) {
      playerState.isCurrentLeader = playerState.address.toLowerCase() === data.lastBuyer.toLowerCase();
    }
  }
  
  // Update player state from API response
  function updatePlayerState(data) {
    if (!data) return;
    
    playerState = {
      ...playerState,
      ...data
    };
    
    // Update UI based on player state
    if (playerState.amountSpent && parseFloat(playerState.amountSpent) > 0) {
      playerHasBought = true;
    }
  }
  
  // Submit a buy transaction
  async function submitBuyTransaction() {
    if (!playerState.isConnected) {
      toggleWalletModal();
      return;
    }
    
    try {
      const result = await gameService.submitBuyTransaction(playerState.address);
      
      // Update game and player state with the result
      if (result.gameData) {
        updateGameData(result.gameData);
      }
      
      if (result.playerData) {
        updatePlayerState(result.playerData);
      }
      
      // Trigger effects
      triggerShockwave();
      
    } catch (error) {
      console.error('Error submitting buy:', error);
      // Show error message
    }
  }
  
  // Send chat message
  async function sendMessage() {
    playClickSound();
    if (!chatInput.trim() || !playerState.isConnected) return;
    
    try {
      // Send to backend
      await gameService.sendChatMessage({
        address: playerState.address,
        message: chatInput
      });
      
      // Add message locally
      chatMessages = [...chatMessages, {
        sender: shortenAddress(playerState.address),
        message: chatInput,
        timestamp: Date.now()
      }];
      
      chatInput = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
</script>

<div class="hud-container" class:glitch={glitchActive} class:anxiety-mode={anxietyMode}>
  <!-- Audio elements -->
  <audio bind:this={bgMusic} loop preload="auto" src="/audio/calm.mp3"></audio>
  <audio bind:this={clickSound} preload="auto" src="/audio/click-sound.mp3"></audio>
  
  <!-- Anxiety mode toggle button -->
  <div class="anxiety-toggle" in:fade={{ duration: 500, delay: 1000 }}>
    <button 
      class="anxiety-button" 
      class:active={anxietyMode} 
      on:click={toggleAnxietyMode}
      title={anxietyMode ? "Switch to Normal Mode" : "Switch to Anxiety Mode"}
    >
      <div class="anxiety-icon">{anxietyMode ? '😰' : '😌'}</div>
    </button>
  </div>
  
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
          <div class="hud-section-title">P&L</div>
          
          {#if !playerHasBought}
            <!-- State 1: Player hasn't bought -->
            <div class="hud-stat">Amount Spent: {totalAmountSpent}</div>
            <div class="hud-stat">Consolation Prize Pool: {consolationPrizePool}</div>
            <div class="hud-stat">Share of Consolation Prize: {shareOfConsolationPrize}</div>
            <div class="hud-stat profit">Profit: $0.00</div>
          {:else if playerIsWinning}
            <!-- State 2: Player is winning -->
            <div class="hud-stat">Prize: {prizePool}</div>
            <div class="hud-stat">Amount Spent: {totalAmountSpent}</div>
            <div class="hud-stat profit">Profit: {profitLoss}</div>
          {:else}
            <!-- State 3: Player is losing -->
            <div class="hud-stat">Amount Spent: {totalAmountSpent}</div>
            <div class="hud-stat">Consolation Prize: {playerShareAmount}</div>
            <div class="hud-stat loss">Loss: {profitLoss}</div>
          {/if}
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
            
            <!-- Referral section (visible when wallet is connected) -->
            <div class="referral-section">
              <div class="referral-payout">PAYOUT {referralPayout}</div>
              <div class="referral-info">IF YOU REFER THE NEXT BUYER:</div>
              <button class="referral-button" on:click={toggleReferralModal}>
                <div class="button-glow"></div>
                <span class="button-text">REFER FRIENDS</span>
                <div class="button-brackets"></div>
              </button>
            </div>
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
      <div class="hud-element game-content visible-content" in:fade={{ duration: 800, delay: 200 }}>
        <div class="game-frame">
          <!-- Game content -->
          <div class="game-interface">
            <!-- Frame corner decorations -->
            <div class="frame-corner top-left"></div>
            <div class="frame-corner top-right"></div>
            <div class="frame-corner bottom-left"></div>
            <div class="frame-corner bottom-right"></div>
            
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
        
            <!-- Prize container -->
            <div class="prize-container">
              <div class="prize-subtitle">{isCurrentUser(gameData.lastBuyer) ? "YOU" : shortenAddress(gameData.lastBuyer)} will win</div>
              <div class="prize-value">{formattedPrizePool}</div>
     
            </div>
          
            <!-- Main button -->
            <div class="button-container">
              <button class="mega-button" on:click={clickButton}>
                <div class="button-pulse"></div>
                <div class="button-content">
                  <div class="prize-subtitle warning">unless you</div>
                  <span class="button-primary-text">TAKE HIS PLACE</span>
                  <span class="button-secondary-text">CURRENT PRICE: {buttonPrice}</span>
                </div>
              </button>
            </div>
              
            <!-- Player stats -->
            <div class="player-stats">
              <div class="stat-item">
                <div class="stat-label">YOUR TOKENS</div>
                <div class="stat-value">{playerState.tokenBalance || playerTokens}</div>
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

<!-- Referral Modal -->
{#if showReferralModal}
  <div class="modal-overlay" on:click={toggleReferralModal} transition:fade={{ duration: 200 }}>
    <div class="referral-modal" on:click|stopPropagation transition:scale={{ duration: 300, easing: quintOut, start: 0.8 }}>
      <button class="close-button" on:click={toggleReferralModal}>×</button>
      <h2>Your Referral Link</h2>
      
      <!-- Referral Link Section -->
      <div class="referral-link-container">
        <input type="text" readonly value={referralLink} class="referral-link-input" />
        <button class="copy-button" on:click={copyReferralLink}>COPY LINK</button>
      </div>
      
      <!-- Leaderboard Section -->
      <div class="referral-leaderboard">
        <h3>TOP REFERRERS</h3>
        <div class="leaderboard-table">
          <div class="leaderboard-header">
            <div class="column">RANK</div>
            <div class="column">ADDRESS</div>
            <div class="column">EARNED</div>
          </div>
          {#each referralLeaderboard as referrer, index}
            <div class="leaderboard-row">
              <div class="column">#{index + 1}</div>
              <div class="column">{referrer.address}</div>
              <div class="column earned">{referrer.earned}</div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Explanation Section -->
      <div class="referral-explanation">
        <p>Share your unique referral link with friends. When they use your link to join Band 4 Band and make a purchase, you'll earn a commission of their purchase amount.</p>
        <p>Top referrers can earn additional bonuses and exclusive perks!</p>
      </div>
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
    transition: color 0.5s ease;
  }
  
  /* Anxiety mode styles */
  .anxiety-mode {
    color: #FF0000;
  }
  
  .anxiety-mode .hud-box,
  .anxiety-mode .button-glow,
  .anxiety-mode .button-brackets:before,
  .anxiety-mode .button-brackets:after,
  .anxiety-mode .mega-button,
  .anxiety-mode .time-unit,
  .anxiety-mode .timer-container,
  .anxiety-mode .prize-container,
  .anxiety-mode .stat-item {
    border-color: rgba(255, 0, 0, 0.5) !important;
  }
  
  .anxiety-mode .hexagon {
    background-color: rgba(255, 0, 0, 0.2);
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
  }
  
  .anxiety-mode .hexagon:before {
    border-bottom: 8.5px solid rgba(255, 0, 0, 0.2);
  }
  
  .anxiety-mode .hexagon:after {
    border-top: 8.5px solid rgba(255, 0, 0, 0.2);
  }
  
  .anxiety-mode .hex-grid::before {
    background: repeating-linear-gradient(
      to bottom,
      rgba(255, 0, 0, 0) 0px,
      rgba(255, 0, 0, 0) 19px,
      rgba(255, 0, 0, 0.2) 20px,
      rgba(255, 0, 0, 0) 21px
    );
    animation: grid-slide-y 12s infinite linear; /* Faster in anxiety mode */
  }
  
  .anxiety-mode .hex-grid::after {
    background: repeating-linear-gradient(
      to right,
      rgba(255, 0, 0, 0) 0px,
      rgba(255, 0, 0, 0) 19px,
      rgba(255, 0, 0, 0.2) 20px,
      rgba(255, 0, 0, 0) 21px
    );
    animation: grid-slide-x 12s infinite linear; /* Faster in anxiety mode */
  }
  
  .anxiety-mode .frame-corner {
    border-color: #FF0000;
    box-shadow: 0 0 8px rgba(255, 0, 0, 0.5);
  }
  
  .anxiety-mode .prize-value,
  .anxiety-mode .stat-value,
  .anxiety-mode .time-unit,
  .anxiety-mode .button-primary-text,
  .anxiety-mode .button-text,
  .anxiety-mode .panel-title,
  .anxiety-mode .wallet-button-text,
  .anxiety-mode .logo-item,
  .anxiety-mode .button-secondary-text,
  .anxiety-mode .timer-label,
  .anxiety-mode .prize-label,
  .anxiety-mode .prize-subtitle,
  .anxiety-mode .stat-label,
  .anxiety-mode .panel-control,
  .anxiety-mode .featured-title,
  .anxiety-mode .time-separator {
    color: #FF0000;
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
  }
  
  .anxiety-mode .button-pulse {
    background: radial-gradient(
      circle,
      rgba(255, 0, 0, 0.5) 0%,
      transparent 70%
    );
  }
  
  .anxiety-mode .pulse-dot {
    background-color: #FF0000;
  }

  /* Anxiety mode button */
  .anxiety-toggle {
    position: fixed;
    top: 15px;
    left: 60%;
    transform: translateX(-60%);
    z-index: 50;
    pointer-events: auto;
  }
  
  .anxiety-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(0, 0, 30, 0.7);
    border: 1px solid rgba(0, 255, 255, 0.5);
    color: #00FFFF;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    overflow: hidden;
    padding: 0;
  }
  
  .anxiety-button:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }
  
  .anxiety-button.active {
    background-color: rgba(30, 0, 0, 0.7);
    border-color: rgba(255, 0, 0, 0.5);
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
  }
  
  .anxiety-button.active:hover {
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
  }
  
  .anxiety-icon {
    font-size: 18px;
    transition: transform 0.3s ease;
  }
  
  .anxiety-button:hover .anxiety-icon {
    transform: scale(1.1);
  }
 
  
  /* Mobile adjustments for anxiety button */
  @media (max-width: 768px) {
    .anxiety-toggle {
      top: 10px;
    }
    
    .anxiety-button {
      width: 32px;
      height: 32px;
    }
    
    .anxiety-icon {
      font-size: 16px;
    }
  }
  
  @media (max-width: 350px) {
    .anxiety-toggle {
      top: 6px;
    }
    
    .anxiety-button {
      width: 28px;
      height: 28px;
    }
    
    .anxiety-icon {
      font-size: 14px;
    }
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
    margin-bottom: 15px;
    text-shadow: 0 0 10px #00FFFF;
    letter-spacing: 2px;
  }
  
  .progress-bar {
    width: 100%;
    height: 10px;
    background-color: rgba(0, 255, 255, 0.1);
    border: 1px solid #00FFFF;
    margin-bottom: 15px;
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
    padding: 8px;
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
    z-index: 10;
  }
  
  .upper-left .hud-box {
    min-width: 250px;
  }
  
  .hud-stat {
    font-size: 14px;
    color: #00FFFF;
    margin-top: 5px;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
    line-height: 1.5;
  }
  
  .hud-participants {
    font-size: 14px;
    color: #00FFFF;
    margin-top: 8px;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
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
    min-width: 250px;
  }
  
  .hud-graph {
    display: flex;
    justify-content: flex-start;
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
    width: auto;
    max-width: 300px;
  }
  
  .logo-container {
    position: relative;
    padding: 10px 20px;
    background-color: rgba(0, 0, 20, 0.7);
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-top: none;
    text-align: center;
  }
  
  .logo-container img {
    height: auto;
    width: auto;
    max-height: 60px;
    max-width: 140px;
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
    /* Hide the upper elements and panels on mobile */
    .upper-left, 
    .upper-right, 
    .recent-buys,
    .chatbox,
    .mobile-toggles {
      display: none;
    }
    
    /* Center logo adjustments */
    .center-logo {
      max-width: 80%;
    }
    
    .logo-container {
      padding: 5px 10px 10px 10px;
    }
    
    .logo-container img {
      max-height: 40px;
      max-width: 100px;
      margin-bottom: 8px;
    }
    
    .whitepaper-link {
      font-size: 9px;
      padding: 3px 8px;
    }
    
    /* Main game content - optimized for mobile full screen */
    .game-content {
      width: 92%;
      top: 80px;
      bottom: 60px; /* Reduced space for smaller nav buttons */
      height: auto;
      margin: 0 auto;
    }
    
    .game-frame {
      padding: 10px;
      height: 100%;
    }
    
    /* Timer adjustments */
    .timer-container {
      padding: 6px;
      margin-bottom: 8px;
    }
    
    .timer-label {
      font-size: 11px;
      margin-bottom: 2px;
    }
    
    .time-unit {
      font-size: 16px;
      min-width: 24px;
      padding: 2px 3px;
    }
    
    .time-separator {
      font-size: 16px;
    }
    
    /* Prize pool must not overflow */
    .prize-container {
      padding: 6px;
      margin-bottom: 6px;
    }
    
    .prize-label {
      font-size: 12px;
      margin-bottom: 2px;
    }
    
    .prize-value {
      font-size: 28px;
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
    
    .prize-subtitle {
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    /* Player stats - equally placed */
    .player-stats {
      width: 100%;
      display: flex;
      justify-content: space-between;
      gap: 6px;
      margin-bottom: 8px;
    }
    
    .stat-item {
      flex: 1;
      padding: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .stat-label {
      font-size: 9px;
      margin-bottom: 3px;
    }
    
    .stat-value {
      font-size: 14px;
    }
    
    /* Main button - smaller for mobile */
    .button-container {
      max-width: 220px;
      margin: 8px 0;
    }
    
    .mega-button {
      height: 70px;
      padding: 8px;
    }
    
    .button-primary-text {
      font-size: 16px;
      margin-bottom: 3px;
    }
    
    .button-secondary-text {
      font-size: 11px;
    }
    
    /* Featured logos section - position it at the bottom of the game area */
    .featured-logos {
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      padding: 4px 0;
    }
    
    .featured-title {
      font-size: 10px;
      margin-bottom: 3px;
    }
    
    .logos-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px;
    }
    
    .logo-item {
      font-size: 9px;
      padding: 3px 5px;
    }
    
    /* Navigation at bottom - smaller and fixed width */
    .nav-options {
      position: fixed;
      bottom: 5px;
      left: 50%;
      width: 100%;
      justify-content: center;
      padding: 5px 0;
      gap: 5px;
      z-index: 20;
    }
    
    .nav-button {
      padding: 6px 8px;
      transform: scale(0.9);
    }
    
    .button-text {
      font-size: 10px;
      letter-spacing: 1px;
    }
    
    /* Frame corners - smaller */
    .frame-corner {
      width: 12px;
      height: 12px;
      border-width: 1px;
    }
  }
  
  /* Extra small mobile devices */
  @media (max-width: 350px) {
    .game-content {
      width: 96%;
      top: 70px;
    }
    
    .prize-value {
      font-size: 24px;
    }
    
    .time-unit {
      font-size: 14px;
      min-width: 20px;
    }
    
    .mega-button {
      height: 60px;
    }
    
    .button-primary-text {
      font-size: 14px;
    }
    
    .nav-button {
      padding: 5px 6px;
      transform: scale(0.85);
    }
    
    .nav-options {
      gap: 2px;
    }
    
    .button-text {
      font-size: 9px;
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
    min-width: auto;
    display: flex;
    flex-direction: column;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 255, 255, 0.3);
    padding-bottom: 6px;
    margin-bottom: 8px;
    cursor: pointer;
  }
  
  .panel-title {
    font-weight: bold;
    font-size: 13px;
    letter-spacing: 1px;
    text-shadow: 0 0 5px #00FFFF;
  }
  
  .panel-controls {
    display: flex;
    gap: 6px;
  }
  
  .panel-control {
    width: 14px;
    height: 14px;
    border: 1px solid rgba(0, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
  
  .panel-content {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 255, 255, 0.5) rgba(0, 0, 0, 0.2);
    max-height: none;
  }
  
  .panel-content::-webkit-scrollbar {
    width: 4px;
  }
  
  .panel-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }
  
  .panel-content::-webkit-scrollbar-thumb {
    background-color: rgba(0, 255, 255, 0.5);
    border-radius: 3px;
    border: 1px solid rgba(0, 255, 255, 0.2);
  }
  
  .panel-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px solid rgba(0, 255, 255, 0.3);
    font-size: 9px;
  }
  
  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #00FFFF;
    animation: pulse 1.5s infinite;
  }
  
  /* Recent Buys Styles */
  .recent-buys {
    position: fixed;
    left: 15px;
    top: 200px;
    bottom: 100px;
    width: 240px;
    height: auto;
    max-height: 60%;
    min-height: 250px;
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
    display: flex;
    flex-direction: column;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 255, 255, 0.5) rgba(0, 0, 0, 0.2);
    padding-right: 5px;
  }
  
  .buy-item {
    padding: 6px 0;
    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  }
  
  .buy-address {
    font-size: 12px;
    color: #00FFFF;
    margin-bottom: 3px;
  }
  
  .buy-details {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: rgba(0, 255, 255, 0.7);
  }
  
  .buy-amount {
    font-weight: bold;
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
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 500px !important;
    height: 500px !important;
    z-index: 1000 !important;
    pointer-events: auto !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .game-frame {
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
    border-radius: 12px !important;
    background-color: rgba(0, 0, 20, 0.8) !important;
    padding: 20px !important;
    box-sizing: border-box !important;
    border: 1px solid rgba(0, 255, 255, 0.5) !important;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5) !important;
    overflow: hidden !important;
    display: block !important;
  }
  
  .frame-corner {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid #00FFFF;
    z-index: 1;
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  }
  
  .top-left {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
  }
  
  .top-right {
    top: 0;
    right: 0;
    border-left: none;
    border-bottom: none;
  }
  
  .bottom-left {
    bottom: 0;
    left: 0;
    border-right: none;
    border-top: none;
  }
  
  .bottom-right {
    bottom: 0;
    right: 0;
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
    justify-content: flex-start;
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
      width: calc(100% - 520px);
    }
    
    .chatbox {
      width: 220px;
      max-width: 18%;
    }
    
    .recent-buys {
      width: 220px;
    }
  }
  
  @media (max-width: 1200px) {
    .recent-buys, .chatbox {
      width: 200px;
    }
    
    .chatbox {
      right: 15px;
      max-width: 20%;
    }
    
    .game-content {
      width: calc(100% - 430px);
    }
    
    .player-stats {
      width: 70%;
    }
    
    .prize-value {
      font-size: 36px;
    }
  }
  
  @media (max-width: 1000px) {
    .recent-buys, .chatbox {
      width: 180px;
    }
    
    .chatbox {
      right: 10px;
    }
    
    .game-content {
      width: calc(100% - 380px);
      top: 100px;
    }
    
    .buy-address, .message-sender {
      font-size: 11px;
    }
    
    .buy-details, .message-time {
      font-size: 9px;
    }
    
    .player-stats {
      width: 90%;
    }
    
    .prize-value {
      font-size: 32px;
    }
    
    .time-unit {
      font-size: 24px;
    }
  }
  
  @media (max-width: 768px) {
    /* Hide the upper elements on mobile */
    .upper-left, .upper-right {
      display: none;
    }
    
    /* Center logo adjustments */
    .center-logo {
      max-width: 80%;
    }
    
    .logo-container {
      padding: 5px 10px 10px 10px;
    }
    
    .logo-container img {
      max-height: 40px;
      max-width: 100px;
      margin-bottom: 8px;
    }
    
    .whitepaper-link {
      font-size: 9px;
      padding: 3px 8px;
    }
    
    /* Main game content - adjust position since top boxes are hidden */
    .game-content {
      width: 90%;
      top: 80px;
      height: calc(100% - 250px);
    }
    
    .game-frame {
      padding: 10px;
    }
    
    .frame-corner {
      width: 15px;
      height: 15px;
    }
    
    /* Timer and prize adjustments */
    .timer-container {
      padding: 8px;
    }
    
    .timer-label {
      font-size: 12px;
    }
    
    .time-unit {
      font-size: 20px;
      min-width: 30px;
      padding: 3px 5px;
    }
    
    .time-separator {
      font-size: 20px;
    }
    
    .prize-label {
      font-size: 14px;
    }
    
    .prize-value {
      font-size: 32px;
    }
    
    .prize-subtitle {
      font-size: 12px;
    }
    
    /* Player stats */
    .player-stats {
      width: 100%;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .stat-label {
      font-size: 10px;
    }
    
    .stat-value {
      font-size: 16px;
    }
    
    /* Main button */
    .button-container {
      max-width: 250px;
    }
    
    .mega-button {
      height: 80px;
      padding: 10px;
    }
    
    .button-primary-text {
      font-size: 18px;
      margin-bottom: 5px;
    }
    
    .button-secondary-text {
      font-size: 12px;
    }
    
    /* Chat and recent buys panels - side by side */
    .recent-buys, .chatbox {
      position: fixed;
      height: 180px;
      width: calc(50% - 10px);
      max-height: 180px;
      min-height: 180px;
      bottom: 90px;
      top: auto;
    }
    
    .recent-buys {
      left: 5px;
    }
    
    .chatbox {
      right: 5px;
      max-width: calc(50% - 10px);
    }
    
    .panel {
      min-width: auto;
      max-height: 100%;
    }
    
    .panel-header {
      padding-bottom: 4px;
      margin-bottom: 5px;
    }
    
    .panel-title {
      font-size: 11px;
    }
    
    .panel-control {
      width: 12px;
      height: 12px;
      font-size: 8px;
    }
    
    /* Featured logos section */
    .featured-logos {
      bottom: 70px;
      padding: 4px 8px;
    }
    
    .featured-title {
      font-size: 10px;
      margin-bottom: 5px;
    }
    
    .logo-item {
      font-size: 10px;
      padding: 3px 6px;
    }
    
    /* Nav buttons */
    .nav-options {
      bottom: 15px;
      gap: 8px;
    }
    
    .nav-button {
      padding: 8px 12px;
    }
    
    .button-text {
      font-size: 12px;
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
  
  /* Referral Section Styles */
  .referral-section {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(0, 255, 255, 0.3);
  }
  
  .referral-payout {
    font-size: 16px;
    font-weight: bold;
    color: #00FFFF;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
    margin-bottom: 5px;
  }
  
  .referral-info {
    font-size: 12px;
    color: rgba(0, 255, 255, 0.8);
    margin-bottom: 10px;
  }
  
  .referral-button {
    position: relative;
    width: 100%;
    padding: 8px 16px;
    background-color: rgba(0, 50, 100, 0.4);
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
  
  .referral-button .button-text {
    position: relative;
    z-index: 2;
  }
  
  .referral-button .button-glow {
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
  
  .referral-button .button-brackets:before,
  .referral-button .button-brackets:after {
    content: "";
    position: absolute;
    width: 8px;
    height: 8px;
    border: 2px solid #00FFFF;
    transition: all 0.3s ease;
    z-index: 3;
  }
  
  .referral-button .button-brackets:before {
    top: 4px;
    left: 4px;
    border-right: none;
    border-bottom: none;
  }
  
  .referral-button .button-brackets:after {
    bottom: 4px;
    right: 4px;
    border-left: none;
    border-top: none;
  }
  
  .referral-button:hover .button-brackets:before {
    transform: translate(-2px, -2px);
  }
  
  .referral-button:hover .button-brackets:after {
    transform: translate(2px, 2px);
  }
  
  .referral-button:hover .button-glow {
    background-color: rgba(0, 255, 255, 0.3);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  }
  
  /* Referral Modal Styles */
  .referral-modal {
    position: relative;
    background-color: rgba(10, 20, 50, 0.95);
    border: 2px solid #00FFFF;
    border-radius: 10px;
    padding: 30px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
    color: #00FFFF;
    font-family: 'Courier New', monospace;
  }
  
  .referral-modal h2 {
    color: #00FFFF;
    text-align: center;
    margin-bottom: 25px;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
  }
  
  .referral-modal h3 {
    font-size: 18px;
    margin: 20px 0 15px;
    color: #00FFFF;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
    letter-spacing: 1px;
  }
  
  .referral-link-container {
    display: flex;
    margin-bottom: 15px;
    gap: 10px;
  }
  
  .referral-link-input {
    flex: 1;
    background-color: rgba(0, 0, 30, 0.5);
    border: 1px solid rgba(0, 255, 255, 0.5);
    color: #00FFFF;
    padding: 10px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
  }
  
  .copy-button {
    background-color: rgba(0, 255, 255, 0.2);
    border: 1px solid rgba(0, 255, 255, 0.6);
    color: #00FFFF;
    padding: 0 15px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    letter-spacing: 1px;
    transition: all 0.3s ease;
  }
  
  .copy-button:hover {
    background-color: rgba(0, 255, 255, 0.3);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
  }
  
  .referral-leaderboard {
    background-color: rgba(0, 0, 30, 0.3);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .leaderboard-table {
    width: 100%;
    font-size: 14px;
  }
  
  .leaderboard-header {
    display: flex;
    border-bottom: 1px solid rgba(0, 255, 255, 0.5);
    padding-bottom: 8px;
    margin-bottom: 8px;
    font-weight: bold;
    color: rgba(0, 255, 255, 0.9);
  }
  
  .leaderboard-row {
    display: flex;
    padding: 6px 0;
    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  }
  
  .leaderboard-row:last-child {
    border-bottom: none;
  }
  
  .column {
    flex: 1;
  }
  
  .column:first-child {
    flex: 0.3;
  }
  
  .column.earned {
    color: #00FF80;
    text-shadow: 0 0 5px rgba(0, 255, 128, 0.7);
    font-weight: bold;
  }
  
  .referral-explanation {
    font-size: 14px;
    line-height: 1.4;
    color: rgba(0, 255, 255, 0.8);
  }
  
  .referral-explanation p {
    margin-bottom: 10px;
  }

  /* Chatbox Styles */
  .chatbox {
    position: fixed;
    right: 15px;
    top: 200px;
    bottom: 100px;
    width: 230px;
    height: auto;
    max-height: 60%;
    min-height: 250px;
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
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 255, 255, 0.5) rgba(0, 0, 0, 0.2);
    padding-right: 5px;
  }
  
  .chatbox .panel-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .chatbox .panel-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  .chatbox .panel-content::-webkit-scrollbar-thumb {
    background-color: rgba(0, 255, 255, 0.5);
    border-radius: 3px;
    border: 1px solid rgba(0, 255, 255, 0.2);
  }

  .featured-logos {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    padding: 5px 10px;
    background-color: rgba(0, 0, 20, 0.5);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 5px;
    z-index: 4;
  }
  
  /* Game Interface Elements */
  .game-interface {
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    height: 100% !important;
    width: 100% !important;
    padding: 20px !important;
    box-sizing: border-box !important;
    position: relative !important;
    z-index: 10 !important;
  }
  
  /* Prize Pool */
  .prize-container {
    text-align: center;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    background-color: rgba(0, 0, 30, 0.3);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 8px;
  }
  
  .prize-label {
    font-size: 16px;
    margin-bottom: 5px;
    color: rgba(0, 255, 255, 0.8);
  }
  
  .prize-value {
    font-size: 40px;
    font-weight: bold;
    color: #00FFFF;
    text-shadow: 0 0 15px rgba(0, 255, 255, 0.9);
    margin-bottom: 10px;
    letter-spacing: 1px;
  }
  
  .prize-subtitle {
    font-size: 18px;
    color: rgba(0, 255, 255, 0.9);
    margin-bottom: 5px;
    text-transform: uppercase;
    font-weight: bold;
  }
  
  .prize-subtitle.warning {
    color: #FF0055;
    text-shadow: 0 0 10px rgba(255, 0, 85, 0.7);
    font-size: 20px;
    margin-top: 5px;
    text-transform: uppercase;
    font-weight: bold;
  }
  
  /* Mega Button */
  .button-container {
    position: relative;
    width: 100%;
    max-width: 300px;
    margin: 15px 0;
  }
  
  .mega-button {
    position: relative;
    width: 100%;
    height: 100px;
    background-color: rgba(0, 50, 100, 0.4);
    border: 2px solid #FF0055;
    cursor: pointer;
    padding: 20px;
    transition: all 0.3s ease;
    overflow: hidden;
    font-family: 'Courier New', monospace;
    z-index: 1;
    box-shadow: 0 0 20px rgba(255, 0, 85, 0.5);
  }
  
  .mega-button:before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid rgba(0, 255, 255, 0.3);
    pointer-events: none;
    z-index: 0;
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
      rgba(255, 0, 85, 0.5) 0%,
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
    font-size: 26px;
    font-weight: bold;
    color: #FF0055;
    text-shadow: 0 0 15px rgba(255, 0, 85, 0.8);
    margin-bottom: 5px;
    display: block;
    letter-spacing: 1px;
  }
  
  .button-secondary-text {
    font-size: 14px;
    color: rgba(0, 255, 255, 0.8);
  }
  
  .mega-button:hover {
    background-color: rgba(0, 70, 140, 0.6);
    box-shadow: 0 0 30px rgba(255, 0, 85, 0.7);
    transform: scale(1.02);
  }
  
  .mega-button:active {
    transform: scale(0.98);
    background-color: rgba(0, 150, 255, 0.6);
  }
  
  /* Player Stats */
  .player-stats {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    gap: 20px;
    margin-bottom: 15px;
  }
  
  .stat-item {
    flex: 1;
    text-align: center;
    border: 1px solid rgba(0, 255, 255, 0.3);
    padding: 10px;
    background-color: rgba(0, 0, 30, 0.3);
    border-radius: 5px;
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
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  }
  
  /* Timer Display */
  .timer-container {
    text-align: center;
    margin-bottom: 15px;
    margin-top: 10px;
    width: 100%;
    background-color: rgba(0, 0, 30, 0.3);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px;
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
    font-size: 28px;
    font-weight: bold;
    color: #00FFFF;
    background-color: rgba(0, 0, 50, 0.5);
    padding: 3px 8px;
    border: 1px solid rgba(0, 255, 255, 0.3);
    min-width: 40px;
    text-align: center;
  }
  
  .time-separator {
    font-size: 28px;
    color: #00FFFF;
  }
  
  .message-content {
    font-size: 11px;
    line-height: 1.3;
    word-break: break-word;
  }
  
  .chat-messages {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .chat-input-container {
    display: flex;
    margin-top: 8px;
    gap: 4px;
  }
  
  .chat-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(0, 255, 255, 0.3);
    color: #00FFFF;
    padding: 6px 8px;
    font-family: 'Courier New', monospace;
    font-size: 11px;
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
    padding: 4px 8px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    transition: all 0.3s ease;
  }
  
  .chat-send:hover {
    background-color: rgba(0, 255, 255, 0.2);
  }

  .prize-subtitle.warning {
    color: #FF0055;
    text-shadow: 0 0 10px rgba(255, 0, 85, 0.7);
    font-size: 16px;
    margin-top: 5px;
    text-transform: uppercase;
    font-weight: bold;
  }

  .hud-section-title {
    font-size: 18px;
    color: #00FFFF;
    font-weight: bold;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.9);
    margin-bottom: 10px;
    letter-spacing: 1px;
  }
  
  .profit {
    color: #00FF80;
    text-shadow: 0 0 5px rgba(0, 255, 128, 0.7);
    font-weight: bold;
  }
  
  .loss {
    color: #FF0055;
    text-shadow: 0 0 5px rgba(255, 0, 85, 0.7);
    font-weight: bold;
  }
  
  .visible-content {

    opacity: 1 !important;
    z-index: 100 !important;
  }
</style> 