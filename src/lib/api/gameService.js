import sampleData from './sampleData.json';

/**
 * Game API service for backend integration
 * This service provides methods to interact with the backend API
 * In development mode, it uses sample data to simulate responses
 */
class GameService {
  constructor(options = {}) {
    this.apiEndpoint = options.apiEndpoint || '/api';
    this.useSampleData = options.useSampleData || false;
    this.websocket = null;
    this.eventListeners = {};
  }

  /**
   * Initialize WebSocket connection
   * @param {string} endpoint - WebSocket endpoint
   * @param {function} onMessage - Callback for incoming messages
   * @returns {Promise} - Resolves when connected
   */
  initWebSocket(endpoint, onMessage) {
    return new Promise((resolve, reject) => {
      if (this.useSampleData) {
        // Simulate WebSocket with sample data
        console.log('Using simulated WebSocket with sample data');
        this.websocket = {
          send: (message) => {
            console.log('WebSocket message sent:', message);
            // Simulate response based on message
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.action === 'subscribe') {
              // Simulate player update after subscription
              setTimeout(() => {
                onMessage({
                  data: JSON.stringify(sampleData.websocket.messages.playerUpdate)
                });
              }, 1000);
            }
          },
          close: () => {
            console.log('WebSocket connection closed');
          }
        };
        
        // Simulate random game updates
        this.simulateGameUpdates(onMessage);
        resolve(this.websocket);
      } else {
        // Real WebSocket connection
        try {
          const ws = new WebSocket(endpoint);
          
          ws.onopen = () => {
            console.log('WebSocket connected');
            this.websocket = ws;
            resolve(ws);
          };
          
          ws.onmessage = onMessage;
          
          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
          };
          
          ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.websocket = null;
          };
        } catch (error) {
          console.error('Failed to initialize WebSocket:', error);
          reject(error);
        }
      }
    });
  }
  
  /**
   * Simulate periodic game updates for development
   * @param {function} onMessage - Callback for incoming messages
   */
  simulateGameUpdates(onMessage) {
    // Simulate a game update every 10 seconds
    setInterval(() => {
      const gameUpdate = { ...sampleData.websocket.messages.gameUpdate };
      
      // Randomly modify prize pool and time remaining
      const prizePool = parseFloat(gameUpdate.gameData.prizePool);
      gameUpdate.gameData.prizePool = (prizePool + Math.random() * 5000).toFixed(2);
      
      // Decrement time
      const timeRemaining = gameUpdate.gameData.timeRemaining;
      timeRemaining.seconds -= 10;
      if (timeRemaining.seconds < 0) {
        timeRemaining.seconds = 50;
        timeRemaining.minutes -= 1;
        if (timeRemaining.minutes < 0) {
          timeRemaining.minutes = 59;
          timeRemaining.hours -= 1;
          if (timeRemaining.hours < 0) {
            timeRemaining.hours = 0;
            timeRemaining.minutes = 0;
            timeRemaining.seconds = 0;
          }
        }
      }
      
      onMessage({
        data: JSON.stringify(gameUpdate)
      });
      
      // Randomly simulate a new buy (20% chance)
      if (Math.random() < 0.2) {
        setTimeout(() => {
          const newBuy = { ...sampleData.websocket.messages.newBuy };
          newBuy.buyData.timestamp = Date.now();
          onMessage({
            data: JSON.stringify(newBuy)
          });
        }, 2000);
      }
      
      // Randomly simulate a chat message (10% chance)
      if (Math.random() < 0.1) {
        setTimeout(() => {
          const chatMessage = { ...sampleData.websocket.messages.chatMessage };
          chatMessage.chatData.timestamp = Date.now();
          chatMessage.chatData.message = getRandomMessage();
          onMessage({
            data: JSON.stringify(chatMessage)
          });
        }, 3000);
      }
    }, 10000);
  }
  
  /**
   * Get game state from the API
   * @returns {Promise} - Resolves with game state data
   */
  async getGameState() {
    if (this.useSampleData) {
      return await simulateApiCall(sampleData.api.responses.gameState);
    } else {
      const response = await fetch(`${this.apiEndpoint}/game-state`);
      if (!response.ok) throw new Error('Failed to fetch game data');
      return await response.json();
    }
  }
  
  /**
   * Get player data from the API
   * @param {string} address - Player's wallet address
   * @returns {Promise} - Resolves with player data
   */
  async getPlayerData(address) {
    if (!address) throw new Error('Address is required');
    
    if (this.useSampleData) {
      // Return different sample data based on address last digit
      const lastChar = address.slice(-1);
      const stateKey = lastChar === '0' ? 'winning' : 
                       lastChar === '1' ? 'losing' : 'notBought';
      
      return await simulateApiCall(sampleData.player.states[stateKey]);
    } else {
      const response = await fetch(`${this.apiEndpoint}/player/${address}`);
      if (!response.ok) throw new Error('Failed to fetch player data');
      return await response.json();
    }
  }
  
  /**
   * Submit a buy transaction
   * @param {string} address - Player's wallet address
   * @returns {Promise} - Resolves with transaction result
   */
  async submitBuyTransaction(address) {
    if (!address) throw new Error('Address is required');
    
    if (this.useSampleData) {
      // Simulate successful transaction
      const result = { ...sampleData.api.responses.buyTransaction };
      result.playerData.address = address;
      result.gameData.lastBuyer = address;
      
      return await simulateApiCall(result, 2000);
    } else {
      const response = await fetch(`${this.apiEndpoint}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });
      
      if (!response.ok) throw new Error('Failed to process buy');
      return await response.json();
    }
  }
  
  /**
   * Send a chat message
   * @param {object} messageData - Message data
   * @returns {Promise} - Resolves with send result
   */
  async sendChatMessage(messageData) {
    if (!messageData.address || !messageData.message) {
      throw new Error('Address and message are required');
    }
    
    if (this.useSampleData) {
      return await simulateApiCall({ success: true });
    } else {
      const response = await fetch(`${this.apiEndpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    }
  }
}

/**
 * Helper function to simulate API call with delay
 * @param {object} data - Data to return
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise} - Resolves with data after delay
 */
function simulateApiCall(data, delay = 500) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data)));
    }, delay);
  });
}

/**
 * Get a random chat message for simulation
 */
function getRandomMessage() {
  const messages = [
    "Just bought in! LFG!",
    "This project is going to moon 🚀",
    "How long until timer ends?",
    "I'm winning this time!",
    "Who's the current leader?",
    "Prize pool looking nice",
    "I'm going all in",
    "Hope I win this time",
    "Just 5 more minutes to go!",
    "Let the games begin",
    "Anyone here from Twitter?",
    "Diamond hands 💎",
    "WAGMI",
    "LOL someone bought right after me"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Create and export default instance
const gameService = new GameService({ 
  useSampleData: import.meta.env?.DEV || true 
});

export default gameService; 