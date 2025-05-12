<script>
  const navItems = [
    { name: 'ABOUT', href: '/about' },
    { name: 'RULES', href: '/rules' },
    { name: 'TELEGRAM', href: 'https://t.me/band4band' },
    { name: 'TWITTER', href: 'https://twitter.com/band4bandapp' }
  ];
</script>

<div class="hud-element nav-options">
  {#each navItems as item}
    <a href={item.href} class="nav-link">
      <div class="nav-button">
        <div class="button-glow"></div>
        <span class="button-text">{item.name}</span>
        <div class="button-brackets"></div>
      </div>
    </a>
  {/each}
</div>

<style>
  .hud-element {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    gap: 12px;
    padding: 10px;
  }
  
  .nav-options {
    z-index: 100;
    align-items: center;
  }
  
  .nav-link {
    text-decoration: none;
  }
  
  .nav-button {
    position: relative;
    cursor: pointer;
    padding: 8px 16px;
    background-color: rgba(0, 38, 66, 0.6);
    color: #00FFFF;
    text-align: center;
    transition: all 0.2s ease;
    min-width: 110px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(0, 255, 255, 0.3);
  }
  
  .button-text {
    position: relative;
    z-index: 2;
    font-size: 14px;
    letter-spacing: 1px;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
  }
  
  .button-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, rgba(0, 255, 255, 0.15) 0%, rgba(0, 255, 255, 0) 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }
  
  .button-brackets {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    pointer-events: none;
  }
  
  /* Add bracket design with pseudo-elements */
  .button-brackets::before, 
  .button-brackets::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-color: #00FFFF;
    opacity: 0.8;
  }
  
  .button-brackets::before {
    top: 0;
    left: 0;
    border-top: 1px solid;
    border-left: 1px solid;
  }
  
  .button-brackets::after {
    bottom: 0;
    right: 0;
    border-bottom: 1px solid;
    border-right: 1px solid;
  }
  
  .nav-button:hover .button-glow {
    opacity: 1;
  }
  
  .nav-button:hover {
    background-color: rgba(0, 60, 100, 0.8);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
  
  /* Desktop styles */
  @media (min-width: 769px) {
    .hud-element {
      max-width: 800px;
      gap: 20px;
      padding: 20px;
    }
    
    .nav-button {
      min-width: 140px;
      padding: 10px 24px;
    }
    
    .button-text {
      font-size: 16px;
    }
  }
  
  /* Mobile styles */
  @media (max-width: 768px) {
    .hud-element {
      position: fixed;
      bottom: 0;
      left: 50%;
      width: 100%;
      background-color: rgba(0, 10, 30, 0.9);
      padding: 8px 5px;
      gap: 6px;
    }
    
    .nav-button {
      min-width: 80px;
      padding: 6px 8px;
      font-size: 12px;
    }
  }
</style> 