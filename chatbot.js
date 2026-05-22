/* ==========================================
   Mohit's Café - AI Assistant (A.V.A)
   Voice Ordering & Natural Language Processor
   ========================================== */

import { addToCartByName } from './app.js';

// Keywords database for chatbot conversations
const AVA_RESPONSES = [
  {
    keywords: ['hello', 'hi', 'greetings', 'hey', 'start'],
    reply: "Greetings, traveler. System online. I am A.V.A, the station AI administrator for Mohit's Café. Ready to synthesize drinks, optimize magnetic grids, or take voice orders."
  },
  {
    keywords: ['menu', 'food', 'drink', 'beverage', 'eat', 'hungry', 'price'],
    reply: "Our menu features Espresso (₹120), Cappuccino (₹180), Latte (₹220), Cold Coffee (₹250), Black Coffee (₹100), Galaxy Mocha (₹300), Robo Burger (₹350), Cyber Pizza (₹420), Space Fries (₹180), and Sandwich (₹200). All served on superconducting floating plates!"
  },
  {
    keywords: ['espresso'],
    reply: "Espresso is extracted at 18 bars of sub-orbital pressure. Cost is ₹120. Would you like me to add it to your order?"
  },
  {
    keywords: ['cappuccino'],
    reply: "Our Cappuccino features a glowing design and rich espresso flavor. Cost is ₹180."
  },
  {
    keywords: ['latte'],
    reply: "Latte uses micro-foamed milk swirled in a zero-gravity centrifuge. Cost is ₹220."
  },
  {
    keywords: ['cold coffee'],
    reply: "Our Cold Coffee is blended with ice and cream, suspended magnetically. Cost is ₹250."
  },
  {
    keywords: ['black coffee'],
    reply: "Black Coffee is an intense dilution of high-grade beans with ionized water. Cost is ₹100."
  },
  {
    keywords: ['mocha', 'galaxy'],
    reply: "Galaxy Mocha contains asteroid cocoa chunks and nebula dust powder. Cost is ₹300."
  },
  {
    keywords: ['burger', 'robo'],
    reply: "Robo Burger features an organic synthetic patty grilled by induction lasers. Cost is ₹350."
  },
  {
    keywords: ['pizza', 'cyber'],
    reply: "Cyber Pizza is cooked with multi-wavelength microwaves in under 12 seconds. Cost is ₹420."
  },
  {
    keywords: ['fries', 'space'],
    reply: "Space Fries are vacuum-fried for maximum crispiness. Seasoned with lunar sea salt. Cost is ₹180."
  },
  {
    keywords: ['sandwich'],
    reply: "Sandwich features plant-based spreads on laser-toasted synthetic sourdough. Cost is ₹200."
  },
  {
    keywords: ['location', 'where', 'station', 'coordinates'],
    reply: "Mohit's Café is stationed at the Earth-Moon Lagrange Point L2, orbiting 1.5 million kilometers from Earth."
  },
  {
    keywords: ['stability', 'core', 'calibrat', 'fusion'],
    reply: "Fusion Core is currently operating at 98.4% capacity. Plasma shielding is active. Calibrations are occurring automatically every 30 seconds."
  },
  {
    keywords: ['thank', 'cool', 'awesome', 'nice'],
    reply: "Affirmative. Serving human crew members is my primary directive."
  }
];

const DEFAULT_REPLY = "Signal received, but request is outside my programming. You can ask me about the Menu, Kitchen Status, our space coordinates, or tell me to add food/coffee to your cart.";

// Global audio mute reference from app.js
let isMuted = true;

export function setMuteState(muted) {
  isMuted = muted;
}

// --------------------------------------------------
// Web Speech Synthesis (AVA Speaks)
// --------------------------------------------------
export function speakText(text) {
  if (isMuted) return; // Respect global mute state
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a cool, cyber-sounding voice
  const voices = window.speechSynthesis.getVoices();
  const spaceVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Female'));
  if (spaceVoice) utterance.voice = spaceVoice;

  utterance.pitch = 1.35; // Slightly higher pitched for a robotic vibe
  utterance.rate = 1.05;  // Slightly faster speech rate
  utterance.volume = 0.8;

  window.speechSynthesis.speak(utterance);
}

// --------------------------------------------------
// Chatbot Logic
// --------------------------------------------------
function getBotResponse(userMsg) {
  const cleanMsg = userMsg.toLowerCase().trim();
  
  for (const item of AVA_RESPONSES) {
    if (item.keywords.some(kw => cleanMsg.includes(kw))) {
      return item.reply;
    }
  }

  // Handle direct "add to cart" inside chatbot
  const menuItems = [
    { name: "Espresso", match: ["espresso"] },
    { name: "Cappuccino", match: ["cappuccino"] },
    { name: "Latte", match: ["latte"] },
    { name: "Cold Coffee", match: ["cold coffee", "cold"] },
    { name: "Black Coffee", match: ["black coffee", "black"] },
    { name: "Galaxy Mocha", match: ["galaxy mocha", "mocha", "galaxy"] },
    { name: "Robo Burger", match: ["burger", "robo"] },
    { name: "Cyber Pizza", match: ["pizza", "cyber"] },
    { name: "Space Fries", match: ["fries", "space"] },
    { name: "Sandwich", match: ["sandwich"] }
  ];

  for (const item of menuItems) {
    if (item.match.some(m => cleanMsg.includes(m)) && (cleanMsg.includes('order') || cleanMsg.includes('add') || cleanMsg.includes('buy'))) {
      const added = addToCartByName(item.name);
      if (added) {
        return `Confirmed. One ${item.name} has been added to your cargo bay. Subtotal has been recalculated.`;
      }
    }
  }

  return DEFAULT_REPLY;
}

export function initializeChatbot() {
  const sidebar = document.getElementById('chatbot-sidebar');
  const toggleBtn = document.getElementById('chatbot-toggle-btn');
  const closeBtn = document.getElementById('chat-close-btn');
  const chatForm = document.getElementById('chat-input-form');
  const chatInput = document.getElementById('chat-input');
  const messagesContainer = document.getElementById('chat-messages');

  // Toggle Sidebar
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      triggerUIAudio('click');
      if (sidebar.classList.contains('active')) {
        speakText("A.V.A online at Mohit's Café. State your request.");
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('active');
      triggerUIAudio('click');
    });
  }

  // Handle Chat Input
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      triggerUIAudio('click');
      appendChatBubble('user', text);
      chatInput.value = '';

      // Simulate bot thinking
      setTimeout(() => {
        const response = getBotResponse(text);
        appendChatBubble('bot', response);
        speakText(response);
      }, 500);
    });
  }

  function appendChatBubble(sender, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Helper to trigger UI audio effects exported from main app.js
function triggerUIAudio(type) {
  const event = new CustomEvent('play-sfx', { detail: { type: type } });
  window.dispatchEvent(event);
}

// --------------------------------------------------
// Web Speech Recognition (Voice Ordering)
// --------------------------------------------------
let recognition;
let isListening = false;

export function initializeVoiceOrdering() {
  const micBtn = document.getElementById('mic-trigger-btn');
  const micStatus = document.getElementById('mic-status-label');
  const terminalScreen = document.getElementById('voice-terminal-screen');

  if (!micBtn) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micStatus.innerHTML = "Microphone Blocked <span>API unsupported on this browser</span>";
    micBtn.style.opacity = '0.5';
    micBtn.style.cursor = 'not-allowed';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  micBtn.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error("Speech Recognition Error:", err);
      }
    }
  });

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('listening');
    micStatus.innerHTML = "TRANSMITTING SIGNAL <span>Listening to neural speech...</span>";
    triggerUIAudio('sweep');
    appendTerminalMsg('system', "Speech recognition channel opened. Say your order...");
  };

  recognition.onspeechend = () => {
    recognition.stop();
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('listening');
    micStatus.innerHTML = "Tap To Transmit <span>Requires audio mic authorization</span>";
  };

  recognition.onerror = (event) => {
    console.error("Recognition Error:", event.error);
    isListening = false;
    micBtn.classList.remove('listening');
    micStatus.innerHTML = "TRANSMISSION ERROR <span>Bypass override failed.</span>";
    appendTerminalMsg('error', `SPEECH_ERROR: ${event.error.toUpperCase()}`);
    triggerUIAudio('warning');
  };

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    appendTerminalMsg('user', `[TRANSCRIPT] ${speechResult}`);
    
    // Parse order
    processVoiceOrder(speechResult);
  };

  function appendTerminalMsg(sender, text) {
    if (!terminalScreen) return;
    const msg = document.createElement('div');
    msg.className = `terminal-msg ${sender}`;
    
    const senderSpan = document.createElement('span');
    senderSpan.className = 'sender';
    senderSpan.textContent = sender === 'system' ? '[SYSTEM]' : sender === 'user' ? '[COMS]' : '[FAIL]';
    
    const bodySpan = document.createElement('span');
    bodySpan.className = 'body';
    bodySpan.textContent = ` ${text}`;

    msg.appendChild(senderSpan);
    msg.appendChild(bodySpan);
    terminalScreen.appendChild(msg);
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
  }

  function processVoiceOrder(text) {
    const cleanText = text.toLowerCase();
    
    const menuList = [
      { name: "Espresso", match: ["espresso"] },
      { name: "Cappuccino", match: ["cappuccino"] },
      { name: "Latte", match: ["latte"] },
      { name: "Cold Coffee", match: ["cold coffee", "cold"] },
      { name: "Black Coffee", match: ["black coffee", "black"] },
      { name: "Galaxy Mocha", match: ["galaxy mocha", "mocha", "galaxy"] },
      { name: "Robo Burger", match: ["robo burger", "burger", "robo"] },
      { name: "Cyber Pizza", match: ["cyber pizza", "pizza", "cyber"] },
      { name: "Space Fries", match: ["space fries", "fries", "space"] },
      { name: "Sandwich", match: ["sandwich"] }
    ];

    let foundAny = false;

    // Check for number of items (simple parser)
    let quantity = 1;
    if (cleanText.includes("two") || cleanText.includes(" 2 ")) quantity = 2;
    if (cleanText.includes("three") || cleanText.includes(" 3 ")) quantity = 3;
    if (cleanText.includes("four") || cleanText.includes(" 4 ")) quantity = 4;

    for (const item of menuList) {
      if (item.match.some(m => cleanText.includes(m))) {
        foundAny = true;
        for (let q = 0; q < quantity; q++) {
          addToCartByName(item.name);
        }
        
        appendTerminalMsg('system', `SUCCESS: Added (${quantity}) ${item.name} to cyber cart ledger.`);
        triggerUIAudio('success');
        speakText(`Confirmed. Adding ${quantity} ${item.name} to your cargo load.`);
      }
    }

    if (!foundAny) {
      appendTerminalMsg('error', "ORDER_FAILED: No valid items recognized in transmission spectral bands.");
      speakText("Transmission unclear. Please specify Espresso, Cappuccino, or other menu items.");
      triggerUIAudio('warning');
    }
  }
}

// Make sure voices are loaded initially
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
