<script>
  import TheButton from '$lib/components/TheButton.svelte';
  import TheTimer from '$lib/components/TheTimer.svelte';

  const KING_ADDRESS = '0x0000000000000000000000000000000000000000';

  function shortenAddress(_address) {
    return `${_address.substring(0, 6)}...${_address.slice(-4)}`
  }
</script>

<div class="game-content">
  <div class="prize-info">
    <p class="current-winner">👑 Current Winner</p>
    <a class="address text-cyan text-underline" href="https://etherscan.io/address/{KING_ADDRESS}" target="_blank">
      {shortenAddress(KING_ADDRESS)}
    </a>
    
    <div class="prize-amount">
      <span class="prize-label">Prize Pool</span>
      <span class="prize-value text-neon">$10,000,000</span>
    </div>
    
    <div class="timer-container">
      <span class="timer-label">Time Remaining</span>
      <span class="timer-value text-cyan"><TheTimer /></span>
    </div>
    
    <p class="instructions">Press the button before the timer runs out to claim the prize</p>
  </div>

  <div class="button-container">
    <TheButton />
  </div>
</div>

<style>
  .game-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
  
  .prize-info {
    text-align: center;
    margin-bottom: 60px;
    background-color: rgba(26, 0, 46, 0.5);
    padding: 30px;
    border-radius: 15px;
    border: 1px solid rgba(0, 255, 255, 0.3);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
  
  .current-winner {
    font-size: 24px;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  
  .address {
    font-size: 32px;
    font-weight: bold;
    display: block;
    margin-bottom: 40px;
  }
  
  .prize-amount {
    margin-bottom: 30px;
  }
  
  .prize-label, .timer-label {
    display: block;
    font-size: 18px;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.8;
  }
  
  .prize-value {
    font-size: 48px;
    font-weight: bold;
    display: block;
  }
  
  .timer-container {
    margin-bottom: 40px;
  }
  
  .timer-value {
    font-size: 36px;
    font-weight: bold;
    display: block;
    letter-spacing: 2px;
  }
  
  .instructions {
    font-size: 20px;
    margin-bottom: 20px;
    max-width: 500px;
  }
  
  .button-container {
    transform: scale(1.2);
    margin-bottom: 40px;
  }
  
  .text-cyan {
    color: #00FFFF;
  }
  
  .text-neon {
    color: #FF0055;
    text-shadow: 0 0 10px rgba(255, 0, 85, 0.8);
  }
  
  @media (max-width: 768px) {
    .prize-info {
      padding: 20px;
    }
    
    .prize-value {
      font-size: 36px;
    }
    
    .timer-value {
      font-size: 30px;
    }
    
    .address {
      font-size: 24px;
    }
  }
</style>
