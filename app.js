/* ==========================================
   Mohit's Café - Core Application Logic
   SPA Router, Cart Engine, Auth, CRUD & AI recommends
   ========================================== */

import { initializeChatbot, initializeVoiceOrdering, setMuteState } from './chatbot.js';
import { initializeDashboard, addLog } from './dashboard.js';

// Default Menu Database (Coffee & Food)
const DEFAULT_MENU = [
  { id: 'item-1', name: 'Espresso', price: 120, category: 'drinks', desc: 'Extracted at 18 bars of sub-orbital pressure. Intense, rich flavor.', icon: 'fa-coffee' },
  { id: 'item-2', name: 'Cappuccino', price: 180, category: 'drinks', desc: 'Silky smooth foam with custom cocoa design.', icon: 'fa-mug-hot' },
  { id: 'item-3', name: 'Latte', price: 220, category: 'drinks', desc: 'Double espresso with micro-foamed milk spun in a zero-G centrifuge.', icon: 'fa-mug-saucer' },
  { id: 'item-4', name: 'Cold Coffee', price: 250, category: 'drinks', desc: 'Chilled cream blend shaken inside magnetic fields.', icon: 'fa-whiskey-glass' },
  { id: 'item-5', name: 'Black Coffee', price: 100, category: 'drinks', desc: 'Rich espresso diluted with ultra-purified ionized water.', icon: 'fa-glass-water' },
  { id: 'item-6', name: 'Galaxy Mocha', price: 300, category: 'drinks', desc: 'Asteroid cocoa chunks, steamed milk, and nebula dust.', icon: 'fa-coffee' },
  { id: 'item-7', name: 'Robo Burger', price: 350, category: 'mains', desc: 'Induction-grilled synthetic beef patty, cheddar lock, rocket glaze.', icon: 'fa-hamburger' },
  { id: 'item-8', name: 'Cyber Pizza', price: 420, category: 'mains', desc: 'Superconductor crust topped with synthetic pepperoni and laser-baked cheese.', icon: 'fa-pizza-slice' },
  { id: 'item-9', name: 'Space Fries', price: 180, category: 'sides', desc: 'Triple vacuum-fried lunar potatoes. Tossed with cosmic sea salt.', icon: 'fa-cookie' },
  { id: 'item-10', name: 'Sandwich', price: 200, category: 'sides', desc: 'Toasted synthetic sourdough loaded with plant-based nutrient spreads.', icon: 'fa-cookie-bite' }
];

// Load persistent databases from localStorage
export let MENU_ITEMS = JSON.parse(localStorage.getItem('mohit_cafe_menu')) || DEFAULT_MENU;
if (!localStorage.getItem('mohit_cafe_menu')) {
  localStorage.setItem('mohit_cafe_menu', JSON.stringify(DEFAULT_MENU));
}

let users = JSON.parse(localStorage.getItem('mohit_cafe_users')) || [];
let orders = JSON.parse(localStorage.getItem('mohit_cafe_orders')) || [];

// Active Session state
let cart = [];
let isAudioMuted = true;
let activeSession = JSON.parse(sessionStorage.getItem('mohit_session')) || null;
let currentTrackingOrder = null;
let currentRecomItem = null;

// Audio Context for Web Audio API Sound Generation
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Synthesize Sci-Fi Sounds
export function playSFX(type) {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    switch (type) {
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, time);
        osc.frequency.exponentialRampToValueAtTime(150, time + 0.1);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.12);
        break;
      }
      case 'success': {
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time + idx * 0.08);
          gain.gain.setValueAtTime(0.12, time + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, time + idx * 0.08 + 0.2);
          osc.start(time + idx * 0.08);
          osc.stop(time + idx * 0.08 + 0.25);
        });
        break;
      }
      case 'warning': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.linearRampToValueAtTime(100, time + 0.15);
        osc.frequency.linearRampToValueAtTime(150, time + 0.3);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.32);
        break;
      }
      case 'sweep': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, time);
        osc.frequency.exponentialRampToValueAtTime(1600, time + 0.6);
        gain.gain.setValueAtTime(0.01, time);
        gain.gain.linearRampToValueAtTime(0.12, time + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
        osc.start(time);
        osc.stop(time + 0.62);
        break;
      }
      case 'card-hover': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(900, time + 0.05);
        gain.gain.setValueAtTime(0.02, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        osc.start(time);
        osc.stop(time + 0.06);
        break;
      }
    }
  } catch (err) {
    console.warn("Web Audio API failed to synthesize tone:", err);
  }
}

window.addEventListener('play-sfx', (e) => {
  if (e.detail && e.detail.type) {
    playSFX(e.detail.type);
  }
});

// --------------------------------------------------
// Cart Operations & AI recommendations
// --------------------------------------------------

export function addToCartByName(name) {
  const item = MENU_ITEMS.find(i => i.name.toLowerCase() === name.toLowerCase());
  if (item) {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    triggerAIRecommendations(item.name);
    return true;
  }
  return false;
}

function triggerAIRecommendations(itemName) {
  const recomBanner = document.getElementById('ai-recom-banner');
  const recomText = document.getElementById('ai-recom-text');
  if (!recomBanner || !recomText) return;

  let recommend = null;

  // Recommendation engine rules
  if (itemName.toLowerCase().includes('burger')) {
    recommend = MENU_ITEMS.find(i => i.name.toLowerCase().includes('fries'));
  } else if (itemName.toLowerCase().includes('espresso') || itemName.toLowerCase().includes('coffee') || itemName.toLowerCase().includes('latte')) {
    recommend = MENU_ITEMS.find(i => i.name.toLowerCase().includes('sandwich'));
  } else if (itemName.toLowerCase().includes('pizza')) {
    recommend = MENU_ITEMS.find(i => i.name.toLowerCase().includes('mocha') || i.name.toLowerCase().includes('cappuccino'));
  }

  if (recommend) {
    currentRecomItem = recommend;
    recomText.textContent = `A.V.A recommends pairing a fresh hot "${recommend.name}" (₹${recommend.price}) with your selection. Optimize cargo?`;
    recomBanner.style.display = 'flex';
    gsap.fromTo(recomBanner, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.4 });
    playSFX('card-hover');
  }
}

function setupAIRecommendations() {
  const acceptBtn = document.getElementById('ai-recom-accept-btn');
  const recomBanner = document.getElementById('ai-recom-banner');
  if (acceptBtn && recomBanner) {
    acceptBtn.addEventListener('click', () => {
      if (currentRecomItem) {
        addToCartByName(currentRecomItem.name);
        playSFX('success');
        recomBanner.style.display = 'none';
        currentRecomItem = null;
      }
    });
  }
}

function updateCartUI() {
  const listWrapper = document.getElementById('cart-items-list');
  const countSpan = document.getElementById('cart-count');
  const subtotalSpan = document.getElementById('cart-subtotal');
  const taxSpan = document.getElementById('cart-tax');
  const surchargeSpan = document.getElementById('cart-surcharge');
  const totalSpan = document.getElementById('cart-total');

  if (!listWrapper) return;
  listWrapper.innerHTML = '';

  let totalQty = 0;
  let subtotal = 0;

  if (cart.length === 0) {
    listWrapper.innerHTML = `
      <div style="text-align:center; margin-top:50px; color:var(--text-secondary)">
        <i class="fa-solid fa-ban" style="font-size:2.5rem; margin-bottom:15px; color:var(--neon-purple)"></i>
        <p>Cart empty. Order something floating!</p>
      </div>
    `;
    if (countSpan) countSpan.textContent = '0';
    if (subtotalSpan) subtotalSpan.textContent = '₹0';
    if (taxSpan) taxSpan.textContent = '₹0';
    if (surchargeSpan) surchargeSpan.textContent = '₹0';
    if (totalSpan) totalSpan.textContent = '₹0';
    return;
  }

  cart.forEach(item => {
    totalQty += item.qty;
    subtotal += item.price * item.qty;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>₹${item.price} credits</p>
      </div>
      <div class="cart-item-actions">
        <button class="cart-qty-btn decrease-qty" data-id="${item.id}">-</button>
        <span class="cart-qty">${item.qty}</span>
        <button class="cart-qty-btn increase-qty" data-id="${item.id}">+</button>
      </div>
    `;
    listWrapper.appendChild(row);
  });

  const tax = Math.round(subtotal * 0.05);
  const surcharge = 50; 
  const grandTotal = subtotal + tax + surcharge;

  if (countSpan) countSpan.textContent = totalQty;
  if (subtotalSpan) subtotalSpan.textContent = `₹${subtotal}`;
  if (taxSpan) taxSpan.textContent = `₹${tax}`;
  if (surchargeSpan) surchargeSpan.textContent = `₹${surcharge}`;
  if (totalSpan) totalSpan.textContent = `₹${grandTotal}`;

  listWrapper.querySelectorAll('.increase-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = cart.find(c => c.id === id);
      if (item) {
        item.qty += 1;
        playSFX('click');
        updateCartUI();
      }
    });
  });

  listWrapper.querySelectorAll('.decrease-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const itemIdx = cart.findIndex(c => c.id === id);
      if (itemIdx > -1) {
        cart[itemIdx].qty -= 1;
        if (cart[itemIdx].qty <= 0) {
          cart.splice(itemIdx, 1);
        }
        playSFX('click');
        updateCartUI();
      }
    });
  });
}

// --------------------------------------------------
// Menu Cards Generator
// --------------------------------------------------

export function generateMenuCards(categoryFilter = 'all') {
  const grid = document.getElementById('menu-items-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const filtered = MENU_ITEMS.filter(i => categoryFilter === 'all' || i.category === categoryFilter);

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card glass-panel';
    card.innerHTML = `
      <div class="menu-card-glare"></div>
      <div class="menu-card-image">
        <i class="fa-solid ${item.icon || 'fa-cookie'}"></i>
      </div>
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
      <div class="menu-footer">
        <span class="menu-price">₹${item.price}</span>
        <button class="btn-cyber add-to-cart-btn" data-name="${item.name}">Add To Cargo</button>
      </div>
    `;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;
      const rotateX = (0.5 - py) * 20;
      const rotateY = (px - 0.5) * 20;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        ease: 'power2.out',
        duration: 0.3
      });

      card.style.setProperty('--mouse-x', `${px * 100}%`);
      card.style.setProperty('--mouse-y', `${py * 100}%`);
    });

    card.addEventListener('mouseenter', () => playSFX('card-hover'));
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, ease: 'power2.out', duration: 0.5 });
    });

    const addBtn = card.querySelector('.add-to-cart-btn');
    addBtn.addEventListener('click', () => {
      addToCartByName(item.name);
      playSFX('success');
      gsap.fromTo(addBtn, { scale: 0.9 }, { scale: 1, duration: 0.2, ease: 'bounce.out' });
      addLog('info', `CART: Added 1x ${item.name} to transaction stack.`);
    });

    grid.appendChild(card);
  });
}

// --------------------------------------------------
// Router Navigation & Transitions
// --------------------------------------------------

function navigateTo(sectionId) {
  const activeSection = document.querySelector('section.active');
  const targetSection = document.getElementById(sectionId);

  if (!targetSection || activeSection === targetSection) return;

  playSFX('sweep');

  if (activeSection) {
    gsap.to(activeSection, {
      opacity: 0,
      y: -30,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        activeSection.classList.remove('active');
        targetSection.classList.add('active');
        gsap.fromTo(targetSection, 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
    });
  } else {
    targetSection.classList.add('active');
    gsap.fromTo(targetSection, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }

  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('data-section') === sectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  addLog('info', `NAVIGATE: Display terminal synced to [${sectionId.toUpperCase()}] overlay.`);
}

// --------------------------------------------------
// Authentication (Mock JWT / User Signups)
// --------------------------------------------------

function setupAuthentication() {
  const loginForm = document.getElementById('auth-login-form');
  const signupForm = document.getElementById('auth-signup-form');
  const loginNavBtn = document.getElementById('login-nav-btn');
  const adminNav = document.getElementById('admin-nav-link');

  const goToSignup = document.getElementById('go-to-signup-link');
  const goToLogin = document.getElementById('go-to-login-link');
  
  const loginPanel = document.getElementById('login-panel-wrapper');
  const signupPanel = document.getElementById('signup-panel-wrapper');

  const roleCustomer = document.getElementById('auth-role-customer');
  const roleAdmin = document.getElementById('auth-role-admin');
  let selectedRole = 'customer';

  // Toggle Login/Signup views
  if (goToSignup && loginPanel && signupPanel) {
    goToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      playSFX('click');
      gsap.to(loginPanel, { opacity: 0, y: 20, duration: 0.25, onComplete: () => {
        loginPanel.style.display = 'none';
        signupPanel.style.display = 'block';
        gsap.fromTo(signupPanel, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.25 });
      }});
    });
  }

  if (goToLogin && loginPanel && signupPanel) {
    goToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      playSFX('click');
      gsap.to(signupPanel, { opacity: 0, y: 20, duration: 0.25, onComplete: () => {
        signupPanel.style.display = 'none';
        loginPanel.style.display = 'block';
        gsap.fromTo(loginPanel, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.25 });
      }});
    });
  }

  // Role selectors
  if (roleCustomer && roleAdmin) {
    roleCustomer.addEventListener('click', () => {
      selectedRole = 'customer';
      roleCustomer.classList.add('active');
      roleAdmin.classList.remove('active');
      playSFX('click');
    });

    roleAdmin.addEventListener('click', () => {
      selectedRole = 'admin';
      roleAdmin.classList.add('active');
      roleCustomer.classList.remove('active');
      playSFX('click');
    });
  }

  // Forgot password mockup
  const forgotBtn = document.getElementById('forgot-pass-btn');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', () => {
      playSFX('warning');
      alert("SIGNAL TRIGGERED: Syncing neural memory cortex cells. Retrying to beam bypass code to your synced comm device...");
    });
  }

  // Signup Submit
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const phone = document.getElementById('signup-phone').value;
      const pass = document.getElementById('signup-pass').value;
      const confirm = document.getElementById('signup-confirm').value;

      if (pass !== confirm) {
        playSFX('warning');
        alert("BIOMETRIC_ERROR: Passwords encryption signatures do not match!");
        return;
      }

      // Check duplicate email
      if (users.some(u => u.email === email)) {
        playSFX('warning');
        alert("BIOMETRIC_ERROR: Email signature is already registered!");
        return;
      }

      // Create new user profile
      const newUser = { name, email, phone, password: btoa(pass) }; // Basic base64 encryption simulation
      users.push(newUser);
      localStorage.setItem('mohit_cafe_users', JSON.stringify(users));

      playSFX('success');
      addLog('success', `SIGNUP: Registered signature for user [${name.toUpperCase()}].`);
      alert("Biometrics registered successfully! You can now log in.");
      signupForm.reset();
      goToLogin.click();
    });
  }

  // Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-pass').value;

      if (selectedRole === 'admin') {
        // Pre-seeded Admin bypass
        if (email === 'admin@mohit.cafe' && pass === 'pass2099') {
          activeSession = { role: 'admin', id: 'ADM-2099', name: 'Global Administrator' };
          sessionStorage.setItem('mohit_session', JSON.stringify(activeSession));

          playSFX('success');
          loginNavBtn.textContent = 'ADM-2099';
          loginNavBtn.style.borderColor = 'var(--neon-green)';
          loginNavBtn.style.color = 'var(--neon-green)';
          adminNav.style.display = 'block';

          addLog('success', 'AUTH: Admin Desk override synced. Admin Panel unlocked.');
          navigateTo('admin-section');
          syncAdminDashboard();
        } else {
          playSFX('warning');
          alert("SYS_DENIED: Invalid Admin Desk credentials.");
        }
      } else {
        // Customer login check
        const matched = users.find(u => u.email === email && u.password === btoa(pass));
        if (matched) {
          // Simulate JWT token issuance
          const mockJWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ email, name: matched.name }))}.signature`;
          activeSession = { role: 'customer', name: matched.name, email: matched.email, token: mockJWT };
          sessionStorage.setItem('mohit_session', JSON.stringify(activeSession));

          playSFX('success');
          loginNavBtn.textContent = `SYNC: ${matched.name.split(' ')[0].toUpperCase()}`;
          loginNavBtn.style.borderColor = 'var(--neon-cyan)';
          loginNavBtn.style.color = 'var(--neon-cyan)';

          addLog('success', `AUTH: Biometric link authorized for [${matched.name.toUpperCase()}].`);
          navigateTo('menu');
        } else {
          playSFX('warning');
          alert("SYS_DENIED: User biometrics not found in orbital ledger database.");
        }
      }
      loginForm.reset();
    });
  }

  // Load existing session details on boot
  if (activeSession) {
    if (activeSession.role === 'admin') {
      loginNavBtn.textContent = 'ADM-2099';
      loginNavBtn.style.borderColor = 'var(--neon-green)';
      loginNavBtn.style.color = 'var(--neon-green)';
      adminNav.style.display = 'block';
      syncAdminDashboard();
    } else {
      loginNavBtn.textContent = `SYNC: ${activeSession.name.split(' ')[0].toUpperCase()}`;
      loginNavBtn.style.borderColor = 'var(--neon-cyan)';
      loginNavBtn.style.color = 'var(--neon-cyan)';
    }
  }
}

// --------------------------------------------------
// Holographic Admin Desk Controls (CRUD + Order manager)
// --------------------------------------------------

function syncAdminDashboard() {
  const totalSalesEl = document.getElementById('admin-total-sales');
  const activeOrdersEl = document.getElementById('admin-active-orders');
  const productListEl = document.getElementById('admin-product-list');
  const ordersListEl = document.getElementById('admin-orders-list');

  // Recalculate stats
  const totalSalesVal = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrdersVal = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'REJECTED').length;

  if (totalSalesEl) totalSalesEl.textContent = `₹${totalSalesVal}`;
  if (activeOrdersEl) activeOrdersEl.textContent = activeOrdersVal;

  // Render Admin Menu Items (CRUD List)
  if (productListEl) {
    productListEl.innerHTML = '';
    MENU_ITEMS.forEach((item, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justify = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '8px 12px';
      row.style.background = 'rgba(255,255,255,0.02)';
      row.style.border = '1px solid rgba(255,255,255,0.05)';
      row.style.borderRadius = '4px';

      row.innerHTML = `
        <div>
          <span style="font-family:var(--font-header); font-size:0.95rem;">${item.name}</span>
          <span style="color:var(--neon-cyan); margin-left:10px; font-family:var(--font-tech);">₹${item.price}</span>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn-cyber edit-prod-btn" style="padding:2px 10px; font-size:0.8rem;" data-idx="${idx}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-cyber purple del-prod-btn" style="padding:2px 10px; font-size:0.8rem;" data-idx="${idx}"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;
      productListEl.appendChild(row);
    });

    // Add Edit/Delete listeners
    productListEl.querySelectorAll('.edit-prod-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-idx');
        const item = MENU_ITEMS[idx];
        
        document.getElementById('crud-product-index').value = idx;
        document.getElementById('crud-name').value = item.name;
        document.getElementById('crud-price').value = item.price;
        document.getElementById('crud-category').value = item.category;
        document.getElementById('crud-icon').value = item.icon || 'fa-coffee';
        document.getElementById('crud-desc').value = item.desc;

        document.getElementById('crud-cancel-btn').style.display = 'inline-block';
        document.getElementById('crud-submit-btn').textContent = "Update Product";
        playSFX('click');
      });
    });

    productListEl.querySelectorAll('.del-prod-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-idx');
        const removed = MENU_ITEMS.splice(idx, 1)[0];
        localStorage.setItem('mohit_cafe_menu', JSON.stringify(MENU_ITEMS));
        playSFX('warning');
        addLog('warning', `CRUD: Removed menu item [${removed.name.toUpperCase()}].`);
        syncAdminDashboard();
        generateMenuCards('all');
      });
    });
  }

  // Render Orders Queue List
  if (ordersListEl) {
    ordersListEl.innerHTML = '';
    if (orders.length === 0) {
      ordersListEl.innerHTML = `
        <div style="text-align:center; padding-top:50px; color:var(--text-secondary)">
          <i class="fa-solid fa-satellite-dish" style="font-size:2.5rem; margin-bottom:15px; color:var(--neon-purple)"></i>
          <p>No active orders registered in quantum grid.</p>
        </div>
      `;
      return;
    }

    orders.slice().reverse().forEach((order, rIdx) => {
      const idx = orders.length - 1 - rIdx;
      const row = document.createElement('div');
      row.className = 'glass-panel';
      row.style.padding = '15px';
      row.style.display = 'flex';
      row.style.flexDirection = 'column';
      row.style.gap = '8px';

      let statusColor = 'var(--neon-cyan)';
      if (order.status === 'DELIVERED') statusColor = 'var(--neon-green)';
      else if (order.status === 'REJECTED') statusColor = 'var(--neon-red)';
      else if (order.status === 'PREPARING') statusColor = 'var(--neon-purple)';

      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-family:var(--font-tech); border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">
          <span style="font-weight:bold; color:var(--neon-cyan)">Order ID: ${order.id}</span>
          <span style="color:${statusColor}">${order.status.toUpperCase()}</span>
        </div>
        <div style="font-size:0.9rem; color:var(--text-secondary)">
          <strong>Client:</strong> ${order.userEmail}<br>
          <strong>Cargo:</strong> ${order.items.map(i => `${i.name} x${i.qty}`).join(', ')}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed rgba(255,255,255,0.05); padding-top:8px;">
          <span style="font-family:var(--font-header); font-weight:bold;">₹${order.total}</span>
          <div style="display:flex; gap:8px;">
            ${order.status === 'PENDING' ? `
              <button class="btn-cyber accept-ord-btn" style="padding:4px 10px; font-size:0.8rem;" data-idx="${idx}">Accept</button>
              <button class="btn-cyber purple reject-ord-btn" style="padding:4px 10px; font-size:0.8rem;" data-idx="${idx}">Reject</button>
            ` : order.status !== 'DELIVERED' && order.status !== 'REJECTED' ? `
              <button class="btn-cyber advance-ord-btn" style="padding:4px 10px; font-size:0.8rem;" data-idx="${idx}">Advance status</button>
            ` : ''}
          </div>
        </div>
      `;
      ordersListEl.appendChild(row);
    });

    // Order controls click actions
    ordersListEl.querySelectorAll('.accept-ord-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-idx');
        orders[idx].status = 'PREPARING';
        localStorage.setItem('mohit_cafe_orders', JSON.stringify(orders));
        playSFX('success');
        addLog('success', `ADMIN: Order ${orders[idx].id} accepted. Commencing preparation.`);
        syncAdminDashboard();
        syncCustomerOrderTracker();
      });
    });

    ordersListEl.querySelectorAll('.reject-ord-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-idx');
        orders[idx].status = 'REJECTED';
        localStorage.setItem('mohit_cafe_orders', JSON.stringify(orders));
        playSFX('warning');
        addLog('warning', `ADMIN: Order ${orders[idx].id} REJECTED by logistics command.`);
        syncAdminDashboard();
        syncCustomerOrderTracker();
      });
    });

    ordersListEl.querySelectorAll('.advance-ord-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-idx');
        const curr = orders[idx].status;
        let next = 'DELIVERED';
        if (curr === 'PREPARING') next = 'LEVITATING';
        else if (curr === 'LEVITATING') next = 'DISPATCHED';
        else if (curr === 'DISPATCHED') next = 'DELIVERED';

        orders[idx].status = next;
        localStorage.setItem('mohit_cafe_orders', JSON.stringify(orders));
        playSFX('click');
        addLog('info', `ADMIN: Order ${orders[idx].id} advanced to state [${next.toUpperCase()}].`);
        syncAdminDashboard();
        syncCustomerOrderTracker();
      });
    });
  }
}

function setupAdminProductCRUD() {
  const form = document.getElementById('admin-product-form');
  const cancelBtn = document.getElementById('crud-cancel-btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const idxVal = document.getElementById('crud-product-index').value;
      const name = document.getElementById('crud-name').value;
      const price = parseInt(document.getElementById('crud-price').value);
      const category = document.getElementById('crud-category').value;
      const icon = document.getElementById('crud-icon').value;
      const desc = document.getElementById('crud-desc').value;

      if (idxVal === '') {
        // Create product
        const newProduct = {
          id: `item-${Date.now()}`,
          name, price, category, icon, desc
        };
        MENU_ITEMS.push(newProduct);
        addLog('success', `CRUD: Synthesized new menu product [${name.toUpperCase()}].`);
      } else {
        // Update product
        const idx = parseInt(idxVal);
        const oldName = MENU_ITEMS[idx].name;
        MENU_ITEMS[idx] = { ...MENU_ITEMS[idx], name, price, category, icon, desc };
        addLog('success', `CRUD: Redefined specifications for item [${oldName.toUpperCase()}] -> [${name.toUpperCase()}].`);
      }

      localStorage.setItem('mohit_cafe_menu', JSON.stringify(MENU_ITEMS));
      playSFX('success');
      form.reset();
      document.getElementById('crud-product-index').value = '';
      cancelBtn.style.display = 'none';
      document.getElementById('crud-submit-btn').textContent = "Save Product";
      
      syncAdminDashboard();
      generateMenuCards('all');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('crud-product-index').value = '';
      cancelBtn.style.display = 'none';
      document.getElementById('crud-submit-btn').textContent = "Save Product";
      playSFX('click');
    });
  }
}

// --------------------------------------------------
// Checkout & Ledger Authorization simulation
// --------------------------------------------------

function setupCheckoutWorkflow() {
  const checkoutBtn = document.getElementById('checkout-btn');
  const paymentModal = document.getElementById('payment-modal');
  const paymentClose = document.getElementById('payment-close-btn');
  const paymentForm = document.getElementById('payment-details-form');
  const paymentDetails = document.getElementById('payment-form-content');
  const processingOverlay = document.getElementById('payment-processing');
  const successContent = document.getElementById('payment-success-content');
  
  if (checkoutBtn && paymentModal) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert("Your cart is empty traveler!");
        return;
      }

      if (!activeSession) {
        alert("BIOMETRICS REQUIRED: Please authenticate your neural link first!");
        navigateTo('login-section');
        paymentModal.classList.remove('active');
        document.getElementById('cart-sidebar').classList.remove('active');
        return;
      }
      
      // Sync names
      document.getElementById('quantum-card-display-holder').textContent = activeSession.name.toUpperCase();

      paymentDetails.style.display = 'block';
      processingOverlay.classList.remove('active');
      successContent.style.display = 'none';

      paymentModal.classList.add('active');
      playSFX('sweep');
    });
  }

  if (paymentClose && paymentModal) {
    paymentClose.addEventListener('click', () => {
      paymentModal.classList.remove('active');
      playSFX('click');
    });
  }

  const cardNumberInput = document.getElementById('pay-card-number');
  const cardDisplayNumber = document.getElementById('quantum-card-display-number');
  if (cardNumberInput && cardDisplayNumber) {
    cardNumberInput.addEventListener('input', () => {
      let val = cardNumberInput.value;
      cardDisplayNumber.textContent = val === '' ? '•••• •••• •••• 2099' : val;
    });
  }

  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playSFX('click');
      processingOverlay.classList.add('active');

      const processLabel = document.getElementById('payment-process-label');
      const processMessages = [
        "Syncing sub-space ledger channels...",
        "Checking quantum balance credits...",
        "Authorizing cargo container docking locks...",
        "Logging transaction sequence in terminal..."
      ];

      processMessages.forEach((msg, index) => {
        setTimeout(() => {
          if (processLabel) processLabel.textContent = msg;
        }, index * 900);
      });

      // Transaction authorized
      setTimeout(() => {
        processingOverlay.classList.remove('active');
        paymentDetails.style.display = 'none';
        successContent.style.display = 'flex';
        playSFX('success');

        const totalAmountText = document.getElementById('cart-total').textContent;
        const totalCreditsVal = parseInt(totalAmountText.replace('₹', ''));
        document.getElementById('receipt-total-credits').textContent = totalAmountText;
        
        // Save order inside persistent database
        const nextOrderId = `ORD-${1000 + orders.length + 1}`;
        document.getElementById('receipt-order-id').textContent = nextOrderId;

        const newOrder = {
          id: nextOrderId,
          userEmail: activeSession.email,
          userName: activeSession.name,
          items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
          total: totalCreditsVal,
          status: 'PENDING',
          timestamp: Date.now()
        };

        orders.push(newOrder);
        localStorage.setItem('mohit_cafe_orders', JSON.stringify(orders));

        addLog('success', `LEDGER DISPATCHED: Order ${nextOrderId} logged. Credits: ${totalAmountText}`);
        
        currentTrackingOrder = newOrder;

        // Reset cart
        cart = [];
        updateCartUI();
        syncAdminDashboard();
      }, 4000);
    });
  }

  // Open Tracking HUD
  const trackBtn = document.getElementById('track-order-btn');
  const trackerPanel = document.getElementById('order-tracker-panel');
  const trackerClose = document.getElementById('tracker-close-btn');

  if (trackBtn && trackerPanel) {
    trackBtn.addEventListener('click', () => {
      paymentModal.classList.remove('active');
      playSFX('sweep');

      gsap.to(trackerPanel, {
        y: '0%',
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.5,
        ease: 'back.out(1.2)'
      });

      syncCustomerOrderTracker();
    });
  }

  if (trackerClose && trackerPanel) {
    trackerClose.addEventListener('click', () => {
      gsap.to(trackerPanel, { y: '150%', opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'power2.in' });
    });
  }
}

// --------------------------------------------------
// Live Order Tracking Sync
// --------------------------------------------------

function syncCustomerOrderTracker() {
  const trackerPanel = document.getElementById('order-tracker-panel');
  const desc = document.getElementById('tracker-item-desc');
  const eta = document.getElementById('tracker-eta');
  const steps = ['step-0', 'step-1', 'step-2', 'step-3', 'step-4'];
  const stepLbles = ['step-lbl-1', 'step-lbl-2', 'step-lbl-3', 'step-lbl-4'];

  if (!currentTrackingOrder || !trackerPanel) return;

  // Retrieve freshest status from orders list
  const refreshed = orders.find(o => o.id === currentTrackingOrder.id);
  if (!refreshed) return;

  // Render current status details
  let activeIndex = 0;
  let statusText = "";
  let etaText = "";

  switch (refreshed.status) {
    case 'PENDING':
      activeIndex = 0;
      statusText = "LOGGED: Waiting for admin desk approval...";
      etaText = "ETA: 120s";
      break;
    case 'PREPARING':
      activeIndex = 1;
      statusText = "PREP: Robotic barista arm calibrating extraction...";
      etaText = "ETA: 90s";
      break;
    case 'LEVITATING':
      activeIndex = 2;
      statusText = "FLOAT: Superconductor field cooling plate...";
      etaText = "ETA: 45s";
      break;
    case 'DISPATCHED':
      activeIndex = 3;
      statusText = "FLY: Dispatch drone cruising at Vector 4...";
      etaText = "ETA: 15s";
      break;
    case 'DELIVERED':
      activeIndex = 4;
      statusText = "DOCKED: Cargo delivered to table plate. Enjoy!";
      etaText = "ETA: 0s";
      break;
    case 'REJECTED':
      activeIndex = 0;
      statusText = "REJECTED: Logistics grid returned transmission.";
      etaText = "ETA: --";
      break;
  }

  if (desc) desc.textContent = statusText;
  if (eta) eta.textContent = etaText;

  // Visual highlights
  steps.forEach((s, idx) => {
    const el = document.getElementById(s);
    if (el) {
      if (idx <= activeIndex && refreshed.status !== 'REJECTED') {
        el.style.backgroundColor = 'var(--neon-purple)';
        el.style.boxShadow = '0 0 8px var(--neon-purple)';
      } else {
        el.style.backgroundColor = 'rgba(255,255,255,0.1)';
        el.style.boxShadow = 'none';
      }
    }
  });

  stepLbles.forEach((lblId, idx) => {
    const lbl = document.getElementById(lblId);
    if (lbl) {
      if (idx < activeIndex && refreshed.status !== 'REJECTED') {
        lbl.style.color = 'var(--neon-purple)';
      } else {
        lbl.style.color = 'var(--text-secondary)';
      }
    }
  });

  // Play a chime when status changes
  playSFX('click');
}

// --------------------------------------------------
// Setup UI Controls & Routing Redirects
// --------------------------------------------------

function setupUIControls() {
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
      const section = link.getAttribute('data-section');
      navigateTo(section);
    });
  });

  const logo = document.getElementById('logo-nav');
  if (logo) {
    logo.addEventListener('click', () => navigateTo('home'));
  }

  const orderHero = document.getElementById('hero-order-btn');
  if (orderHero) {
    orderHero.addEventListener('click', () => navigateTo('menu'));
  }

  const exploreHero = document.getElementById('hero-explore-btn');
  if (exploreHero) {
    exploreHero.addEventListener('click', () => navigateTo('kitchen'));
  }

  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundLabel = document.getElementById('sound-label-text');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      isAudioMuted = !isAudioMuted;
      setMuteState(isAudioMuted); 
      
      if (isAudioMuted) {
        soundBtn.classList.add('muted');
        if (soundLabel) soundLabel.textContent = 'SFX OFF';
      } else {
        soundBtn.classList.remove('muted');
        if (soundLabel) soundLabel.textContent = 'SFX ON';
        playSFX('sweep');
        addLog('success', 'AUDIO: Web Synth sound generators calibrated.');
      }
    });
  }

  const cartToggle = document.getElementById('cart-toggle-btn');
  const cartClose = document.getElementById('cart-close-btn');
  const cartSidebar = document.getElementById('cart-sidebar');

  if (cartToggle && cartSidebar) {
    cartToggle.addEventListener('click', () => {
      cartSidebar.classList.add('active');
      playSFX('click');
    });
  }

  if (cartClose && cartSidebar) {
    cartClose.addEventListener('click', () => {
      cartSidebar.classList.remove('active');
      playSFX('click');
    });
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    // Avoid overriding auth role button styles
    if (btn.id.includes('auth-role')) return;
    btn.addEventListener('click', () => {
      playSFX('click');
      document.querySelectorAll('.tab-btn').forEach(b => {
        if (!b.id.includes('auth-role')) b.classList.remove('active');
      });
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');
      generateMenuCards(cat);
    });
  });

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const alias = document.getElementById('contact-name').value;
      const text = document.getElementById('contact-msg').value;

      playSFX('success');
      addLog('success', `SUB-SPACE TRANS: Sender [${alias}] broadcasted signal.`);
      contactForm.reset();
      alert("Transmission broadcasted! Signal logged in telemetry console.");
    });
  }

  // Auth navigation redirect toggle buttons
  const loginNavBtn = document.getElementById('login-nav-btn');
  if (loginNavBtn) {
    loginNavBtn.addEventListener('click', () => {
      navigateTo('login-section');
    });
  }
}

// --------------------------------------------------
// Window Scroll Header effects
// --------------------------------------------------
window.addEventListener('scroll', () => {
  const header = document.getElementById('main-header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  setupUIControls();
  generateMenuCards('all');
  initializeChatbot();
  initializeVoiceOrdering();
  initializeDashboard();
  setupAuthentication();
  setupAdminProductCRUD();
  setupCheckoutWorkflow();
  setupAIRecommendations();

  addLog('success', 'NETWORK: Sub-orbital quantum firewall synced successfully. Secure port active.');
});
