const DEFAULT_ROOMS = [
  {id:1,name:'Standard Room',price:89,guests:2,desc:'Comfortable and cozy with modern amenities',emoji:'🌙',features:['WiFi','AC','TV','Minibar'],available:true,badge:'Best Value'},
  {id:2,name:'Deluxe Sea View',price:189,guests:2,desc:'Breathtaking ocean panoramas with luxury furnishings',emoji:'🌅',features:['WiFi','AC','Sea View','Balcony','Spa'],available:true,badge:'Most Popular'},
  {id:3,name:'Mountain Retreat',price:149,guests:3,desc:'Serene mountain views with forest surroundings',emoji:'🏔',features:['WiFi','AC','Mountain View','Fireplace'],available:true,badge:'New'},
  {id:4,name:'City Panorama Suite',price:229,guests:4,desc:'Stunning city skyline views from every angle',emoji:'🌃',features:['WiFi','AC','City View','Lounge','Bar'],available:false,badge:'Sold Out'},
  {id:5,name:'Garden Sanctuary',price:119,guests:2,desc:'Private garden access with lush greenery',emoji:'🌿',features:['WiFi','AC','Garden','Patio','BBQ'],available:true,badge:'Serene'},
  {id:6,name:'Presidential Suite',price:499,guests:6,desc:'The pinnacle of luxury — unmatched in every way',emoji:'👑',features:['WiFi','AC','Butler','Private Pool','Chef'],available:true,badge:'Exclusive'}
];

const DEFAULT_BOOKINGS = [
  {id:'BK-0041',guest:'Emma Johnson',room:'Deluxe Sea View',checkIn:'2025-04-18',checkOut:'2025-04-21',status:'confirmed',total:'$567'},
  {id:'BK-0040',guest:'James Wilson',room:'Presidential Suite',checkIn:'2025-04-19',checkOut:'2025-04-22',status:'confirmed',total:'$1,497'},
  {id:'BK-0039',guest:'Sophia Martinez',room:'Standard Room',checkIn:'2025-04-20',checkOut:'2025-04-23',status:'pending',total:'$267'},
  {id:'BK-0038',guest:'Liam Chen',room:'Garden Sanctuary',checkIn:'2025-04-15',checkOut:'2025-04-17',status:'confirmed',total:'$238'},
  {id:'BK-0037',guest:'Olivia Smith',room:'Mountain Retreat',checkIn:'2025-04-12',checkOut:'2025-04-14',status:'cancelled',total:'$298'},
  {id:'BK-0036',guest:'Noah Davis',room:'Deluxe Sea View',checkIn:'2025-04-10',checkOut:'2025-04-13',status:'confirmed',total:'$567'}
];

const DEFAULT_CUSTOMERS = [
  {name:'Emma Johnson',email:'emma@example.com',phone:'+1 555-0101',bookings:3,spent:'$1,234',joined:'Mar 2025'},
  {name:'James Wilson',email:'james@example.com',phone:'+1 555-0102',bookings:5,spent:'$3,891',joined:'Jan 2025'},
  {name:'Sophia Martinez',email:'sophia@example.com',phone:'+1 555-0103',bookings:1,spent:'$267',joined:'Apr 2025'},
  {name:'Liam Chen',email:'liam@example.com',phone:'+1 555-0104',bookings:2,spent:'$476',joined:'Feb 2025'},
  {name:'Olivia Smith',email:'olivia@example.com',phone:'+1 555-0105',bookings:4,spent:'$1,782',joined:'Dec 2024'},
  {name:'Noah Davis',email:'noah@example.com',phone:'+1 555-0106',bookings:2,spent:'$888',joined:'Feb 2025'}
];

const DEFAULT_REVIEWS = {
  1:[
    {name:'Sarah P.',rating:4,comment:'Very comfortable for a short stay and the smart check-in experience felt polished.'},
    {name:'Daniel K.',rating:5,comment:'Excellent value and a smooth guest journey from booking to checkout.'}
  ],
  2:[
    {name:'Amelia R.',rating:5,comment:'Sea view, premium finish, and a five-star digital experience.'},
    {name:'Chris T.',rating:4,comment:'Loved the balcony and responsive service updates.'}
  ],
  3:[{name:'Mia L.',rating:5,comment:'Peaceful, scenic, and perfect for a long weekend reset.'}],
  4:[{name:'Aiden N.',rating:4,comment:'Fantastic skyline views and a luxury suite atmosphere.'}],
  5:[{name:'Nethmi S.',rating:5,comment:'Garden access made the stay feel private and restorative.'}],
  6:[{name:'Oliver B.',rating:5,comment:'This suite absolutely feels client-presentation ready. Premium all around.'}]
};

const ROOM_IMAGE_MAP = {
  'standard room': './Images/Standard Room.jpg',
  'deluxe sea view': './Images/Deluxe Sea View.jpg.webp',
  'mountain retreat': './Images/Mountain Retreat.webp',
  'city panorama suite': './Images/City Panorama Suite.jpg',
  'garden sanctuary': './Images/Garden Sanctuary.webp',
  'presidential suite': './Images/Presidential Suite.jpg'
};

const STORAGE_KEY = 'automatex-hotel-multipage-v1';

let appState = loadState();
let selectedRoom = null;
let currentStep = 1;
let currentBookingDetails = null;
let expandedRoomId = null;
let calendarDate = new Date(2025, 3, 1);
let selectedCalendarDate = null;
let demoInterval = null;

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    return {
      rooms: parsed.rooms || clone(DEFAULT_ROOMS),
      bookings: parsed.bookings || clone(DEFAULT_BOOKINGS),
      customers: parsed.customers || clone(DEFAULT_CUSTOMERS),
      reviews: parsed.reviews || clone(DEFAULT_REVIEWS),
      role: parsed.role || 'admin',
      demoMode: false
    };
  } catch {
    return freshState();
  }
}

function freshState() {
  return {
    rooms: clone(DEFAULT_ROOMS),
    bookings: clone(DEFAULT_BOOKINGS),
    customers: clone(DEFAULT_CUSTOMERS),
    reviews: clone(DEFAULT_REVIEWS),
    role: 'admin',
    demoMode: false
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    rooms: appState.rooms,
    bookings: appState.bookings,
    customers: appState.customers,
    reviews: appState.reviews,
    role: appState.role
  }));
}

function roomById(id) {
  return appState.rooms.find(room => room.id === Number(id));
}

function roomImagePath(roomName = '') {
  return ROOM_IMAGE_MAP[roomName.toLowerCase().trim()] || '';
}

function roomVisual(room, className = 'room-photo') {
  const src = roomImagePath(room.name);
  if (src) {
    return `<img src="${src}" alt="${room.name}" class="${className}" loading="lazy" decoding="async" onerror="this.outerHTML='<div class=&quot;room-photo-fallback&quot;>${room.emoji}</div>'">`;
  }
  return `<div class="room-photo-fallback">${room.emoji}</div>`;
}

function averageRating(roomId) {
  const reviews = appState.reviews[roomId] || [];
  if (!reviews.length) return 4.9;
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}

function stars(value) {
  const rounded = Math.round(value);
  return '★'.repeat(rounded) + '☆'.repeat(Math.max(0, 5 - rounded));
}

function currency(value) {
  return `$${Number(value).toLocaleString()}`;
}

function pageName() {
  return document.body.dataset.page || 'home';
}

function isPublicPage() {
  return pageName() !== 'admin';
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = '.3s';
    setTimeout(() => toast.remove(), 320);
  }, 3200);
}

function showNotification(title, message) {
  const stack = document.getElementById('notificationStack');
  if (!stack) return;
  const item = document.createElement('div');
  item.className = 'live-notification';
  item.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
  stack.prepend(item);
  setTimeout(() => item.remove(), 5000);
}

function renderNavbar() {
  const mount = document.getElementById('siteNavbar');
  if (!mount) return;
  const samePageRooms = pageName() === 'home' ? './rooms.html' : './rooms.html';
  const aiLink = pageName() === 'home' ? '#' : './index.html#ai-rec';
  const featuresLink = pageName() === 'home' ? '#' : './index.html#features';
  mount.innerHTML = `
    <nav>
      <div class="nav-logo" onclick="goToPage('./index.html')">
        <img src="./Images/logo.png" alt="AutomateX logo" class="brand-logo-img small">
        <span class="brand-logo-text">
          <span>AutomateX<span>.</span></span>
          <span class="brand-logo-sub">AI Hotel System</span>
        </span>
      </div>
      <div class="nav-links">
        <a href="${samePageRooms}">Rooms</a>
        <a href="${aiLink}" ${pageName() === 'home' ? 'data-scroll-target="ai-rec"' : ''}>AI Picks</a>
        <a href="${featuresLink}" ${pageName() === 'home' ? 'data-scroll-target="features"' : ''}>Features</a>
        <a href="./admin.html">Admin</a>
      </div>
      <a class="nav-cta nav-cta-link" href="https://wa.me/?text=${encodeURIComponent('Hello, I would like to book a stay at AutomateX Hotel.')}" target="_blank" rel="noopener">Book Now</a>
      <div class="hamburger" id="mobileToggle">
        <span></span><span></span><span></span>
      </div>
    </nav>
    <div class="mobile-menu" id="mobileMenu">
      <a href="./rooms.html">Rooms</a>
      <a href="${pageName() === 'home' ? '#ai-rec' : './index.html#ai-rec'}" ${pageName() === 'home' ? 'data-scroll-target="ai-rec"' : ''}>AI Picks</a>
      <a href="${pageName() === 'home' ? '#features' : './index.html#features'}" ${pageName() === 'home' ? 'data-scroll-target="features"' : ''}>Features</a>
      <a href="./admin.html">Admin</a>
    </div>
  `;
  document.getElementById('mobileToggle')?.addEventListener('click', () => {
    document.getElementById('mobileMenu')?.classList.toggle('open');
  });
}

function renderFooter() {
  const mount = document.getElementById('siteFooter');
  if (!mount) return;
  mount.innerHTML = `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-brand-head">
              <img src="./Images/logo.png" alt="AutomateX logo" class="brand-logo-img">
              <div><h3>AutomateX Hotel</h3></div>
            </div>
            <p>Redefining luxury hospitality through the power of artificial intelligence and seamless digital experiences.</p>
            <div class="social-links">
              <a class="social-link"><i class="fab fa-instagram"></i></a>
              <a class="social-link"><i class="fab fa-twitter"></i></a>
              <a class="social-link"><i class="fab fa-facebook"></i></a>
              <a class="social-link"><i class="fab fa-linkedin"></i></a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Rooms</h4>
            <ul>
              <li><a href="./rooms.html">Standard Room</a></li>
              <li><a href="./rooms.html">Deluxe Room</a></li>
              <li><a href="./rooms.html">Sea View Suite</a></li>
              <li><a href="./rooms.html">Presidential Suite</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="./index.html">About Us</a></li>
              <li><a href="./contact.html">Contact</a></li>
              <li><a href="./rooms.html">Book Stay</a></li>
              <li><a href="./admin.html">Admin</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a><i class="fa fa-phone" style="margin-right:8px;color:var(--neon)"></i>+94 71 186 1722</a></li>
              <li><a><i class="fa fa-envelope" style="margin-right:8px;color:var(--neon)"></i>automatex.lk</a></li>
              <li><a><i class="fa fa-location-dot" style="margin-right:8px;color:var(--neon)"></i>123 Hatton, Sri Lanka</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 AutomateX AI Hotel System. All rights reserved.</p>
          <p>Built with <span style="color:var(--neon3)">♥</span> and Artificial Intelligence</p>
        </div>
      </div>
    </footer>
  `;
}

function renderSharedOverlays() {
  if (!isPublicPage()) return;
  const bookingRoot = document.getElementById('bookingRoot');
  if (bookingRoot) {
    bookingRoot.innerHTML = `
      <div class="modal-overlay" id="bookingModal">
        <div class="modal">
          <div class="modal-header">
            <h2>Reserve Your Stay</h2>
            <div class="modal-close" onclick="closeModal()"><i class="fa fa-times"></i></div>
          </div>
          <div class="modal-body">
            <div class="modal-steps">
              <div class="step-dot active" id="stepDot1"></div>
              <div class="step-dot" id="stepDot2"></div>
              <div class="step-dot" id="stepDot3"></div>
              <div class="step-dot" id="stepDot4"></div>
            </div>
            <div class="booking-step active" id="step1">
              <div class="booking-room-summary">
                <div class="booking-room-img" id="modalRoomImg">🏨</div>
                <div class="booking-room-info">
                  <h4 id="modalRoomName">Room Name</h4>
                  <p id="modalRoomPrice">$0 / night</p>
                </div>
              </div>
              <p style="font-size:.85rem;color:var(--text2);line-height:1.6;">You selected this room. Proceed to choose your dates and enter your details.</p>
            </div>
            <div class="booking-step" id="step2">
              <div class="modal-form">
                <div class="form-row">
                  <div class="form-group"><label>Check-In Date</label><input type="date" id="checkIn"></div>
                  <div class="form-group"><label>Check-Out Date</label><input type="date" id="checkOut"></div>
                </div>
                <div class="form-group">
                  <label>Number of Guests</label>
                  <select id="numGuests">
                    <option>1 Guest</option><option>2 Guests</option><option>3 Guests</option><option>4 Guests</option>
                  </select>
                </div>
                <div id="nightSummary" style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:16px;font-size:.85rem;display:none;">
                  <div style="display:flex;justify-content:space-between;"><span>Duration</span><span id="nightCount" style="color:var(--neon);font-family:'Space Mono',monospace;"></span></div>
                  <div style="display:flex;justify-content:space-between;margin-top:8px;font-weight:600;"><span>Total</span><span id="totalPrice" style="color:var(--neon);font-family:'Space Mono',monospace;"></span></div>
                </div>
              </div>
            </div>
            <div class="booking-step" id="step3">
              <div class="modal-form">
                <div class="form-row">
                  <div class="form-group"><label>First Name</label><input type="text" id="guestFirstName" placeholder="John"></div>
                  <div class="form-group"><label>Last Name</label><input type="text" id="guestLastName" placeholder="Doe"></div>
                </div>
                <div class="form-group"><label>Email Address</label><input type="email" id="guestEmail" placeholder="john@example.com"></div>
                <div class="form-group"><label>Phone Number</label><input type="tel" id="guestPhone" placeholder="+1 (555) 0100"></div>
                <div class="form-group"><label>Special Requests (optional)</label><input type="text" placeholder="e.g. High floor, extra pillows"></div>
                <div>
                  <div style="font-size:.8rem;color:var(--text3);margin-bottom:8px;font-weight:600;">Simulated Payment</div>
                  <div class="form-group"><input type="text" placeholder="4242 4242 4242 4242"></div>
                  <div class="form-row"><div class="form-group"><input type="text" placeholder="MM/YY"></div><div class="form-group"><input type="text" placeholder="CVV"></div></div>
                  <div class="payment-icons"><div class="pay-icon">💳 Visa</div><div class="pay-icon">💳 MC</div><div class="pay-icon">💳 Amex</div></div>
                </div>
              </div>
            </div>
            <div class="booking-step" id="step4"><div class="confirm-summary" id="confirmSummary"></div></div>
            <div class="booking-step" id="step5">
              <div class="success-screen">
                <div class="success-icon">✓</div>
                <h3>Booking Confirmed!</h3>
                <p>Your reservation has been successfully placed and is ready for guest communication.</p>
                <p style="font-size:.8rem;color:var(--text3);">Invoice, booking details, and WhatsApp handoff are ready below.</p>
                <div class="booking-id" id="bookingIdDisplay"></div>
                <div class="success-actions">
                  <button class="btn-next" onclick="downloadInvoice()"><i class="fa fa-file-arrow-down" style="margin-right:8px"></i>Download Invoice</button>
                  <button class="btn-back" style="display:block;color:var(--text);" onclick="sendViaWhatsApp()"><i class="fab fa-whatsapp" style="margin-right:8px;color:#25D366"></i>Send via WhatsApp</button>
                </div>
                <div class="invoice-card" id="invoiceCard"></div>
                <div class="payment-ready-label"><i class="fa fa-circle-check"></i>Online Payment Ready (Stripe / PayHere Integration Supported)</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-back" id="btnBack" onclick="prevStep()" style="display:none">Back</button>
            <button class="btn-next" id="btnNext" onclick="nextStep()">Continue</button>
          </div>
        </div>
      </div>
    `;
  }

  const chatbotRoot = document.getElementById('chatbotRoot');
  if (chatbotRoot) {
    chatbotRoot.innerHTML = `
      <div class="chat-fab" id="chatFab"><i class="fa fa-comments"></i></div>
      <div class="chat-window" id="chatWindow">
        <div class="chat-head">
          <div class="chat-avatar">🤖</div>
          <div class="chat-head-info"><h4>AutomateX AI</h4><p>Online — always here to help</p></div>
        </div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-quick" id="chatQuick">
          <div class="quick-btn" onclick="sendQuick('What rooms are available?')">🛏 Rooms</div>
          <div class="quick-btn" onclick="sendQuick('What are your prices?')">💰 Prices</div>
          <div class="quick-btn" onclick="sendQuick('How do I book?')">📅 Booking</div>
          <div class="quick-btn" onclick="sendQuick('Do you have WiFi?')">📶 Amenities</div>
        </div>
        <div class="chat-input-row">
          <input class="chat-input" id="chatInput" placeholder="Ask me anything...">
          <button class="chat-send" id="chatSend"><i class="fa fa-paper-plane"></i></button>
        </div>
      </div>
    `;
  }
}

function bindPublicEvents() {
  if (!isPublicPage()) return;
  document.getElementById('chatFab')?.addEventListener('click', toggleChat);
  document.getElementById('chatSend')?.addEventListener('click', sendChat);
  document.getElementById('chatInput')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') sendChat();
  });
  document.getElementById('checkIn')?.addEventListener('change', updateNightSummary);
  document.getElementById('checkOut')?.addEventListener('change', updateNightSummary);
  document.getElementById('bookingModal')?.addEventListener('click', event => {
    if (event.target.id === 'bookingModal') closeModal();
  });
}

function smoothScrollTo(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const navOffset = document.querySelector('nav')?.offsetHeight || 72;
  const top = target.getBoundingClientRect().top + window.scrollY - navOffset + 2;
  window.scrollTo({ top, behavior: 'smooth' });
  document.getElementById('mobileMenu')?.classList.remove('open');
}

function attachNavigationEnhancements() {
  document.querySelectorAll('[data-scroll-target]').forEach(link => {
    link.addEventListener('click', event => {
      if (pageName() !== 'home') return;
      event.preventDefault();
      smoothScrollTo(link.dataset.scrollTarget);
    });
  });
  document.querySelectorAll('a[href*=".html"]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
      if (href.startsWith('#')) return;
      event.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => { window.location.href = href; }, 180);
    });
  });
}

function goToPage(path) {
  document.body.classList.add('is-leaving');
  setTimeout(() => { window.location.href = path; }, 180);
}

function renderRoomsGrid(containerId, limit = null) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  const items = limit ? appState.rooms.slice(0, limit) : appState.rooms;
  grid.innerHTML = items.map(room => `
    <div class="room-card ${expandedRoomId === room.id ? 'expanded' : ''}" role="button" tabindex="0"
      onclick="toggleRoomExpand(${room.id})"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleRoomExpand(${room.id});}">
      <div class="room-img-wrap">
        ${roomVisual(room)}
        <div class="room-badge ${!room.available ? 'sold' : ''}">${room.badge}</div>
      </div>
      <div class="room-body">
        <div class="room-name"><a href="./room-details.html?room=${room.id}" onclick="event.stopPropagation()" style="color:inherit;text-decoration:none;">${room.name}</a></div>
        <div class="room-desc">${room.desc}</div>
        <div class="rating-row">
          <div class="rating-pill"><span class="rating-stars">${stars(averageRating(room.id))}</span><span>${averageRating(room.id).toFixed(1)} Rating</span></div>
          <div class="rating-pill">${(appState.reviews[room.id] || []).length} reviews</div>
        </div>
        <div class="room-features">${room.features.slice(0, 4).map(feature => `<div class="feature-tag"><i class="fa fa-check" style="color:var(--neon);font-size:.6rem"></i>${feature}</div>`).join('')}</div>
        <div class="room-footer">
          <div class="room-price"><span class="price-amount">${currency(room.price)}</span><span class="price-per"> / night</span></div>
          <button class="btn-book" ${!room.available ? 'disabled' : ''} onclick="event.stopPropagation();openBooking(${room.id})">${room.available ? 'Book Now' : 'Sold Out'}</button>
        </div>
        <div class="reviews-wrap" onclick="event.stopPropagation()">
          <div class="reviews-head">
            <h4>Guest Reviews</h4>
            <a href="./room-details.html?room=${room.id}" onclick="event.stopPropagation()" class="rating-pill" style="text-decoration:none;">Details</a>
          </div>
          <div class="review-list">
            ${(appState.reviews[room.id] || []).slice(0, 2).map(review => `
              <div class="review-item">
                <strong>${review.name} • ${stars(review.rating)}</strong>
                <p>${review.comment}</p>
              </div>
            `).join('') || '<div class="review-empty">No guest reviews yet.</div>'}
          </div>
          <div class="review-form">
            <select id="reviewRating${room.id}">
              <option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option>
            </select>
            <input type="text" id="reviewComment${room.id}" placeholder="Share your experience">
            <button onclick="submitReview(${room.id})">Submit</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  attachRippleEffects();
}

function toggleRoomExpand(roomId) {
  expandedRoomId = expandedRoomId === roomId ? null : roomId;
  if (document.getElementById('roomsGrid')) renderRoomsGrid('roomsGrid');
  if (document.getElementById('roomsPreviewGrid')) renderRoomsGrid('roomsPreviewGrid', 3);
}

function submitReview(roomId) {
  const commentInput = document.getElementById(`reviewComment${roomId}`);
  const ratingInput = document.getElementById(`reviewRating${roomId}`);
  if (!commentInput || !ratingInput) return;
  const comment = commentInput.value.trim();
  if (!comment) {
    showToast('Please enter a review comment.', 'error');
    return;
  }
  if (!appState.reviews[roomId]) appState.reviews[roomId] = [];
  appState.reviews[roomId].unshift({
    name: 'Recent Guest',
    rating: Number(ratingInput.value),
    comment
  });
  saveState();
  commentInput.value = '';
  if (document.getElementById('roomsGrid')) renderRoomsGrid('roomsGrid');
  if (document.getElementById('roomsPreviewGrid')) renderRoomsGrid('roomsPreviewGrid', 3);
  if (document.getElementById('roomDetailsMount')) renderRoomDetails();
  renderAdminInsights();
  showToast('Review submitted successfully!');
}

function renderGallery() {
  const mount = document.getElementById('galleryGrid');
  if (!mount) return;
  mount.innerHTML = appState.rooms.slice(0, 4).map(room => `
    <div class="gallery-card">
      ${roomVisual(room)}
      <div class="gallery-overlay"><strong>${room.name}</strong><span>${room.desc}</span></div>
    </div>
  `).join('');
}

function renderContactCards() {
  const mount = document.getElementById('contactCards');
  if (!mount) return;
  mount.innerHTML = `
    <div class="feature-card"><div class="feat-icon blue"><i class="fa fa-phone"></i></div><h3>Call Us</h3><p>Reach our reservations desk on +94 71 186 1722.</p></div>
    <div class="feature-card"><div class="feat-icon purple"><i class="fa fa-location-dot"></i></div><h3>Visit</h3><p>123 Hatton, Sri Lanka — designed for premium mountain hospitality.</p></div>
    <div class="feature-card"><div class="feat-icon gold"><i class="fab fa-whatsapp"></i></div><h3>WhatsApp</h3><p>Book instantly or talk to our team with one tap on WhatsApp.</p></div>
  `;
}

function renderAIRecommendation() {
  const button = document.getElementById('runAIButton');
  if (!button) return;
  button.addEventListener('click', () => {
    const budget = Number(document.getElementById('aibudget').value);
    const guests = Number(document.getElementById('aiguests').value);
    const thinking = document.getElementById('aiThinking');
    const result = document.getElementById('aiResult');
    thinking?.classList.add('show');
    result?.classList.remove('show');
    setTimeout(() => {
      const match = appState.rooms.filter(room => room.available && room.price <= budget && room.guests >= guests).sort((a, b) => b.price - a.price)[0] ||
        appState.rooms.filter(room => room.available).sort((a, b) => a.price - b.price)[0];
      document.getElementById('aiRoomName').textContent = `✦ ${match.name} — ${currency(match.price)}/night`;
      document.getElementById('aiReason').textContent = `Based on your budget of ${currency(budget)}/night and ${guests} guest${guests > 1 ? 's' : ''}, this is our best match.`;
      thinking?.classList.remove('show');
      result?.classList.add('show');
    }, 900);
  });
}

function renderRoomDetails() {
  const mount = document.getElementById('roomDetailsMount');
  if (!mount) return;
  const params = new URLSearchParams(window.location.search);
  const room = roomById(params.get('room') || 2) || appState.rooms[0];
  selectedRoom = room;
  mount.innerHTML = `
    <section class="page-hero">
      <div class="container">
        <div class="page-hero-content">
          <div class="section-tag">Room Details</div>
          <h1 class="section-title">${room.name}</h1>
          <p class="section-sub">${room.desc}</p>
        </div>
      </div>
    </section>
    <section style="padding-top:40px;">
      <div class="container room-detail-layout">
        <div class="room-detail-visual">${roomVisual(room, 'room-detail-photo')}</div>
        <div class="ai-card">
          <div class="rating-pill" style="margin-bottom:16px;"><span class="rating-stars">${stars(averageRating(room.id))}</span><span>${averageRating(room.id).toFixed(1)} / 5</span></div>
          <h3 style="font-family:'Playfair Display',serif;font-size:2rem;margin-bottom:12px;">${currency(room.price)} <span style="font-size:1rem;color:var(--text3)">/ night</span></h3>
          <p style="color:var(--text2);line-height:1.7;margin-bottom:20px;">Perfect for ${room.guests} guests with ${room.features.join(', ')}.</p>
          <div class="room-features" style="margin-bottom:24px;">${room.features.map(feature => `<div class="feature-tag">${feature}</div>`).join('')}</div>
          <div class="hero-btns" style="justify-content:flex-start;">
            <button class="btn-primary" onclick="openBooking(${room.id})">Book Now</button>
            <a class="btn-outline" href="./rooms.html" style="text-decoration:none;display:inline-flex;align-items:center;">Back to Rooms</a>
          </div>
        </div>
      </div>
    </section>
    <section style="padding-top:0;">
      <div class="container">
        <div class="section-header" style="margin-bottom:30px;">
          <div class="section-tag">Guest Reviews</div>
          <h2 class="section-title">What Guests <span class="gradient-text">Say</span></h2>
        </div>
        <div class="review-list">${(appState.reviews[room.id] || []).map(review => `
          <div class="review-item">
            <strong>${review.name} • ${stars(review.rating)}</strong>
            <p>${review.comment}</p>
          </div>
        `).join('')}</div>
      </div>
    </section>
  `;
}

function openBooking(roomId) {
  selectedRoom = roomById(roomId);
  currentStep = 1;
  renderModalRoom();
  updateStepUI();
  const modal = document.getElementById('bookingModal');
  if (!modal) return;
  modal.classList.add('open');
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const checkIn = document.getElementById('checkIn');
  const checkOut = document.getElementById('checkOut');
  if (checkIn && checkOut) {
    checkIn.min = today;
    checkOut.min = today;
    checkIn.value = today;
    checkOut.value = tomorrow;
  }
  updateNightSummary();
}

function closeModal() {
  document.getElementById('bookingModal')?.classList.remove('open');
}

function renderModalRoom() {
  if (!selectedRoom) return;
  const img = document.getElementById('modalRoomImg');
  const name = document.getElementById('modalRoomName');
  const price = document.getElementById('modalRoomPrice');
  if (img) img.innerHTML = roomVisual(selectedRoom, 'booking-room-photo');
  if (name) name.textContent = selectedRoom.name;
  if (price) price.textContent = `${currency(selectedRoom.price)} / night`;
}

function updateStepUI() {
  for (let i = 1; i <= 5; i++) document.getElementById(`step${i}`)?.classList.toggle('active', i === currentStep);
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById(`stepDot${i}`);
    if (!dot) continue;
    dot.classList.toggle('active', i === currentStep);
    dot.classList.toggle('done', i < currentStep);
  }
  const back = document.getElementById('btnBack');
  const next = document.getElementById('btnNext');
  if (back) back.style.display = currentStep > 1 && currentStep < 5 ? 'block' : 'none';
  if (next) next.textContent = currentStep === 4 ? '✓ Confirm Booking' : currentStep === 5 ? 'Done' : 'Continue';
}

function nextStep() {
  if (currentStep === 4) return confirmBooking();
  if (currentStep === 5) return closeModal();
  if (currentStep === 2) updateNightSummary();
  if (currentStep === 3) buildConfirmSummary();
  currentStep += 1;
  updateStepUI();
}

function prevStep() {
  if (currentStep > 1) {
    currentStep -= 1;
    updateStepUI();
  }
}

function updateNightSummary() {
  const checkIn = document.getElementById('checkIn')?.value;
  const checkOut = document.getElementById('checkOut')?.value;
  if (!selectedRoom || !checkIn || !checkOut) return;
  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
  const total = nights * selectedRoom.price;
  document.getElementById('nightCount').textContent = `${nights} night${nights > 1 ? 's' : ''}`;
  document.getElementById('totalPrice').textContent = currency(total);
  document.getElementById('nightSummary').style.display = 'block';
}

function buildConfirmSummary() {
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
  const total = nights * selectedRoom.price;
  const fullName = `${document.getElementById('guestFirstName').value || 'Guest'} ${document.getElementById('guestLastName').value || ''}`.trim();
  document.getElementById('confirmSummary').innerHTML = `
    <div class="confirm-row"><span>Guest</span><span>${fullName}</span></div>
    <div class="confirm-row"><span>Room</span><span>${selectedRoom.name}</span></div>
    <div class="confirm-row"><span>Check-In</span><span>${checkIn}</span></div>
    <div class="confirm-row"><span>Check-Out</span><span>${checkOut}</span></div>
    <div class="confirm-row"><span>Guests</span><span>${document.getElementById('numGuests').value}</span></div>
    <div class="confirm-row"><span>Nights</span><span>${nights}</span></div>
    <div class="confirm-row"><span>Total</span><span>${currency(total)}</span></div>
  `;
}

function confirmBooking() {
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
  const total = nights * selectedRoom.price;
  const id = `BK-${Math.floor(1000 + Math.random() * 8999)}`;
  const fullName = `${document.getElementById('guestFirstName').value || 'Guest'} ${document.getElementById('guestLastName').value || ''}`.trim();
  const email = document.getElementById('guestEmail').value || 'guest@automatex.ai';
  const phone = document.getElementById('guestPhone').value || '+94 71 000 0000';
  currentBookingDetails = {
    id,
    guest: fullName,
    room: selectedRoom.name,
    checkIn,
    checkOut,
    total: currency(total),
    date: new Date().toLocaleDateString('en-CA')
  };
  appState.bookings.unshift({ id, guest: fullName, room: selectedRoom.name, checkIn, checkOut, status: 'pending', total: currency(total) });
  if (!appState.customers.some(customer => customer.email.toLowerCase() === email.toLowerCase())) {
    appState.customers.unshift({
      name: fullName,
      email,
      phone,
      bookings: 1,
      spent: currency(total),
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    });
  }
  saveState();
  document.getElementById('bookingIdDisplay').textContent = `Booking ID: ${id}`;
  renderInvoiceCard();
  currentStep = 5;
  updateStepUI();
  showToast('Booking confirmed successfully!');
  showNotification('New booking created', `${fullName} reserved ${selectedRoom.name}.`);
}

function renderInvoiceCard() {
  if (!currentBookingDetails) return;
  const card = document.getElementById('invoiceCard');
  if (!card) return;
  card.innerHTML = `
    <div class="invoice-head">
      <div class="invoice-brand">
        <h4>AutomateX Demo Hotel</h4>
        <p>Invoice generated automatically after booking confirmation.</p>
      </div>
      <div class="invoice-meta"><div class="invoice-badge"><i class="fa fa-file-invoice"></i>Invoice Ready</div></div>
    </div>
    <div class="invoice-body">
      <div class="invoice-row"><span>Booking ID</span><strong>${currentBookingDetails.id}</strong></div>
      <div class="invoice-row"><span>Customer Name</span><strong>${currentBookingDetails.guest}</strong></div>
      <div class="invoice-row"><span>Room Name</span><strong>${currentBookingDetails.room}</strong></div>
      <div class="invoice-row"><span>Check-In</span><strong>${currentBookingDetails.checkIn}</strong></div>
      <div class="invoice-row"><span>Check-Out</span><strong>${currentBookingDetails.checkOut}</strong></div>
      <div class="invoice-row"><span>Issued Date</span><strong>${currentBookingDetails.date}</strong></div>
      <div class="invoice-total"><div class="invoice-row"><span>Total Amount</span><strong>${currentBookingDetails.total}</strong></div></div>
    </div>
  `;
}

function downloadInvoice() {
  if (!currentBookingDetails) return;
  const popup = window.open('', '_blank', 'width=900,height=700');
  if (!popup) return showToast('Please allow popups to download the invoice.', 'error');
  popup.document.write(`
    <html><head><title>${currentBookingDetails.id} Invoice</title><style>
      body{font-family:Arial,sans-serif;background:#eef4f8;padding:40px;color:#122033}
      .sheet{max-width:760px;margin:0 auto;background:#fff;border-radius:20px;padding:40px;box-shadow:0 24px 80px rgba(10,20,40,.12)}
      .head{display:flex;justify-content:space-between;gap:20px;padding-bottom:20px;border-bottom:1px solid #dbe7f0;margin-bottom:28px}
      .row{display:flex;justify-content:space-between;gap:20px;padding:14px 0;border-bottom:1px dashed #dbe7f0;font-size:15px}
      .actions{margin-top:30px}button{background:#08131f;color:#fff;border:none;padding:14px 22px;border-radius:999px;cursor:pointer}
      @media print{body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0;max-width:none}button{display:none}}
    </style></head><body>
      <div class="sheet">
        <div class="head"><div><h1>AutomateX Demo Hotel</h1><div>AI Hotel Management Invoice</div></div><div>${currentBookingDetails.date}</div></div>
        <div class="row"><span>Booking ID</span><strong>${currentBookingDetails.id}</strong></div>
        <div class="row"><span>Customer Name</span><strong>${currentBookingDetails.guest}</strong></div>
        <div class="row"><span>Room Name</span><strong>${currentBookingDetails.room}</strong></div>
        <div class="row"><span>Check-In</span><strong>${currentBookingDetails.checkIn}</strong></div>
        <div class="row"><span>Check-Out</span><strong>${currentBookingDetails.checkOut}</strong></div>
        <div class="row"><span>Total Amount</span><strong>${currentBookingDetails.total}</strong></div>
        <div class="actions"><button onclick="window.print()">Download Invoice</button></div>
      </div>
    </body></html>
  `);
  popup.document.close();
}

function sendViaWhatsApp() {
  if (!currentBookingDetails) return;
  const message = `Hello, your booking (${currentBookingDetails.id}) is confirmed from ${currentBookingDetails.checkIn} to ${currentBookingDetails.checkOut}. Thank you for choosing us.`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

function toggleChat() {
  const windowEl = document.getElementById('chatWindow');
  const fab = document.getElementById('chatFab');
  if (!windowEl || !fab) return;
  const open = windowEl.classList.toggle('open');
  fab.classList.toggle('open', open);
  fab.innerHTML = open ? '<i class="fa fa-times"></i>' : '<i class="fa fa-comments"></i>';
  if (open && !document.getElementById('chatMessages').children.length) {
    addBotMsg("Hello! I'm AutomateX AI, your personal hotel concierge.");
  }
}

function addBotMsg(text) {
  const wrap = document.getElementById('chatMessages');
  if (!wrap) return;
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.textContent = text;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function addUserMsg(text) {
  const wrap = document.getElementById('chatMessages');
  if (!wrap) return;
  const div = document.createElement('div');
  div.className = 'msg user';
  div.textContent = text;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function getChatResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes('room')) return `We have ${appState.rooms.length} room types, including ${appState.rooms.map(room => room.name).join(', ')}.`;
  if (msg.includes('price')) return `Our prices range from ${currency(Math.min(...appState.rooms.map(room => room.price)))} to ${currency(Math.max(...appState.rooms.map(room => room.price)))}/night.`;
  if (msg.includes('book')) return 'Visit the Rooms page or tap Book Now on any room to start the booking flow.';
  if (msg.includes('wifi')) return 'Yes, high-speed WiFi is complimentary in all rooms and common areas.';
  return 'I can help with rooms, prices, amenities, and booking guidance. What would you like to know?';
}

function sendChat() {
  const input = document.getElementById('chatInput');
  if (!input || !input.value.trim()) return;
  const message = input.value.trim();
  addUserMsg(message);
  input.value = '';
  document.getElementById('chatQuick')?.style.setProperty('display', 'none');
  setTimeout(() => addBotMsg(getChatResponse(message)), 450);
}

function sendQuick(message) {
  addUserMsg(message);
  document.getElementById('chatQuick')?.style.setProperty('display', 'none');
  setTimeout(() => addBotMsg(getChatResponse(message)), 450);
}

function renderAdminPage() {
  renderAdminChart();
  renderBookingsTable();
  renderRecentBookings();
  renderCustomersTable();
  renderAdminRooms();
  renderCalendar();
  renderAdminInsights();
  bindAdminEvents();
}

function bindAdminEvents() {
  document.querySelectorAll('.sidebar-item[data-panel]').forEach(item => {
    item.addEventListener('click', () => showPanel(item.dataset.panel, item));
  });
  document.getElementById('bookingSearch')?.addEventListener('input', event => filterBookings(event.target.value));
  document.getElementById('customerSearch')?.addEventListener('input', event => filterCustomers(event.target.value));
  document.getElementById('demoModeBtn')?.addEventListener('click', toggleDemoMode);
  document.getElementById('languageToggle')?.addEventListener('change', event => {
    document.documentElement.lang = event.target.value;
  });
}

function showPanel(name, el) {
  document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById(`panel-${name}`)?.classList.add('active');
  document.querySelectorAll('.sidebar-item[data-panel]').forEach(item => item.classList.remove('active'));
  if (el) el.classList.add('active');
  const titles = {
    dashboard: 'Dashboard Overview',
    bookings: 'Booking Management',
    calendar: 'Booking Calendar',
    rooms: 'Room Management',
    customers: 'Customer Management',
    insights: 'AI Smart Insights'
  };
  const title = document.getElementById('adminTitle');
  if (title) title.textContent = titles[name] || 'Admin';
  document.getElementById('adminSidebar')?.classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('adminSidebar')?.classList.toggle('open');
}

function renderAdminChart() {
  const chart = document.getElementById('weeklyChart');
  if (!chart) return;
  const values = [6, 9, 7, 12, 18, 15, 11];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(...values);
  chart.innerHTML = labels.map((label, index) => `
    <div class="bar-wrap">
      <div class="bar neon" style="height:${(values[index] / max) * 100}%" data-val="${values[index]} bookings"></div>
      <div class="bar-label">${label}</div>
    </div>
  `).join('');
}

function renderBookingsTable(list = appState.bookings) {
  const table = document.getElementById('bookingsTable');
  if (!table) return;
  table.innerHTML = `
    <thead><tr><th>Booking ID</th><th>Guest</th><th>Room</th><th>Check-In</th><th>Check-Out</th><th>Status</th><th>Total</th><th>Actions</th></tr></thead>
    <tbody>${list.map(booking => `
      <tr>
        <td><span style="font-family:'Space Mono',monospace;color:var(--neon);font-size:.8rem">${booking.id}</span></td>
        <td>${booking.guest}</td><td>${booking.room}</td><td>${booking.checkIn}</td><td>${booking.checkOut}</td>
        <td><span class="status-badge badge-${booking.status}">${booking.status}</span></td>
        <td style="font-family:'Space Mono',monospace;font-size:.85rem">${booking.total}</td>
        <td style="display:flex;gap:6px;margin-top:4px;">
          <div class="action-btn success" onclick="updateStatus('${booking.id}','confirmed')"><i class="fa fa-check"></i></div>
          <div class="action-btn danger" onclick="updateStatus('${booking.id}','cancelled')"><i class="fa fa-times"></i></div>
        </td>
      </tr>
    `).join('')}</tbody>
  `;
}

function renderRecentBookings() {
  const table = document.getElementById('recentBookingsTable');
  if (!table) return;
  table.innerHTML = `
    <thead><tr><th>Booking ID</th><th>Guest</th><th>Room</th><th>Status</th><th>Total</th></tr></thead>
    <tbody>${appState.bookings.slice(0, 5).map(booking => `
      <tr>
        <td><span style="font-family:'Space Mono',monospace;color:var(--neon);font-size:.8rem">${booking.id}</span></td>
        <td>${booking.guest}</td><td>${booking.room}</td>
        <td><span class="status-badge badge-${booking.status}">${booking.status}</span></td>
        <td style="font-family:'Space Mono',monospace;font-size:.85rem">${booking.total}</td>
      </tr>
    `).join('')}</tbody>
  `;
}

function renderCustomersTable(list = appState.customers) {
  const table = document.getElementById('customersTable');
  if (!table) return;
  table.innerHTML = `
    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Bookings</th><th>Total Spent</th><th>Joined</th></tr></thead>
    <tbody>${list.map(customer => `
      <tr>
        <td>${customer.name}</td><td>${customer.email}</td><td>${customer.phone}</td>
        <td style="font-family:'Space Mono',monospace;color:var(--neon)">${customer.bookings}</td>
        <td>${customer.spent}</td><td>${customer.joined}</td>
      </tr>
    `).join('')}</tbody>
  `;
}

function renderAdminRooms() {
  const grid = document.getElementById('adminRoomsGrid');
  if (!grid) return;
  grid.innerHTML = appState.rooms.map(room => `
    <div class="room-admin-card">
      <div class="room-admin-img">${roomVisual(room, 'room-admin-photo')}</div>
      <div class="room-admin-body">
        <h4>${room.name}</h4>
        <p>${room.desc}</p>
        <p style="margin-bottom:8px"><span class="status-badge ${room.available ? 'badge-available' : 'badge-occupied'}">${room.available ? 'Available' : 'Occupied'}</span></p>
        <div class="room-admin-footer"><div class="room-admin-price">${currency(room.price)}<span style="font-size:.7rem;color:var(--text3)">/night</span></div></div>
      </div>
    </div>
  `).join('');
}

function updateStatus(id, status) {
  const booking = appState.bookings.find(item => item.id === id);
  if (!booking) return;
  booking.status = status;
  saveState();
  renderBookingsTable();
  renderRecentBookings();
  renderCalendar();
  renderAdminInsights();
  showToast(`Booking ${id} marked as ${status}`);
}

function filterBookings(query) {
  const lowered = query.toLowerCase();
  renderBookingsTable(appState.bookings.filter(booking =>
    booking.id.toLowerCase().includes(lowered) ||
    booking.guest.toLowerCase().includes(lowered) ||
    booking.room.toLowerCase().includes(lowered)
  ));
}

function filterCustomers(query) {
  const lowered = query.toLowerCase();
  renderCustomersTable(appState.customers.filter(customer =>
    customer.name.toLowerCase().includes(lowered) ||
    customer.email.toLowerCase().includes(lowered)
  ));
}

function bookingsForDate(dateStr) {
  return appState.bookings.filter(booking => dateStr >= booking.checkIn && dateStr < booking.checkOut);
}

function changeCalendarMonth(delta) {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + delta, 1);
  renderCalendar();
}

function selectCalendarDate(date) {
  selectedCalendarDate = date;
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const label = document.getElementById('calendarMonthLabel');
  const detailLabel = document.getElementById('calendarSelectedDateLabel');
  const list = document.getElementById('dayBookingsList');
  if (!grid || !label || !detailLabel || !list) return;
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  label.textContent = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  if (!selectedCalendarDate || !selectedCalendarDate.startsWith(monthKey)) selectedCalendarDate = `${monthKey}-01`;
  grid.innerHTML = Array.from({ length: totalCells }, (_, index) => {
    const day = index - firstDay + 1;
    if (day < 1 || day > daysInMonth) return '<div class="calendar-day muted"></div>';
    const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
    const dateBookings = bookingsForDate(dateStr);
    return `
      <div class="calendar-day ${dateBookings.length ? 'has-bookings' : ''} ${selectedCalendarDate === dateStr ? 'active' : ''}" onclick="selectCalendarDate('${dateStr}')">
        <div class="calendar-day-number">${day}</div>
        <div class="occupancy-strip">${Array.from({ length: Math.min(6, appState.rooms.length) }, (_, dot) => `<span class="occupancy-dot ${dot < dateBookings.length ? 'filled' : ''}"></span>`).join('')}</div>
        <div class="calendar-day-count">${dateBookings.length ? `${dateBookings.length} booking${dateBookings.length > 1 ? 's' : ''}` : 'Available'}</div>
      </div>
    `;
  }).join('');
  const selected = bookingsForDate(selectedCalendarDate);
  detailLabel.textContent = `${new Date(selectedCalendarDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • ${selected.length} active booking${selected.length !== 1 ? 's' : ''}`;
  list.innerHTML = selected.length ? selected.map(booking => `
    <div class="day-booking-item">
      <h4>${booking.room}</h4>
      <p><strong style="color:var(--text)">${booking.guest}</strong> • ${booking.id}</p>
      <p>${booking.checkIn} to ${booking.checkOut} • <span class="status-badge badge-${booking.status}">${booking.status}</span></p>
    </div>
  `).join('') : '<div class="day-booking-item"><h4>No bookings on this date</h4><p>All rooms are currently open for new reservations.</p></div>';
  document.getElementById('calendarOccupancyLabel').textContent = `Occupancy ${Math.round((selected.length / Math.max(appState.rooms.length, 1)) * 100)}%`;
}

function peakBookingDay() {
  const counts = {};
  appState.bookings.forEach(booking => {
    const label = new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'long' });
    counts[label] = (counts[label] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Friday';
}

function pricingInsight() {
  const weekend = appState.bookings.filter(booking => {
    const day = new Date(booking.checkIn).getDay();
    return day === 5 || day === 6 || day === 0;
  }).length;
  const weekday = Math.max(1, appState.bookings.length - weekend);
  return weekend >= weekday * 0.75
    ? 'High demand detected on weekends — consider increasing price by 10%.'
    : 'Demand is balanced across weekdays — maintain current pricing and test value-add packages.';
}

function renderAdminInsights() {
  const assistant = document.getElementById('assistantInsights');
  const watchlist = document.getElementById('insightWatchlist');
  const pricing = document.getElementById('smartPricingMessage');
  const reviewMetric = document.getElementById('avgReviewInsight');
  const reviewSub = document.getElementById('avgReviewInsightSub');
  const allReviews = Object.values(appState.reviews).flat();
  const avgReview = allReviews.length ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length).toFixed(1) : '4.9';
  const todayKey = new Date().toISOString().split('T')[0];
  const todaysBookings = appState.bookings.filter(booking => booking.checkIn === todayKey).length;
  const lowOccupancy = appState.rooms.map(room => ({
    room: room.name,
    count: appState.bookings.filter(booking => booking.room === room.name && booking.status !== 'cancelled').length
  })).sort((a, b) => a.count - b.count)[0];
  if (assistant) {
    assistant.innerHTML = `
      <div class="assistant-insight"><strong>You have ${todaysBookings} bookings today</strong><span>Front desk and housekeeping can prepare based on live arrivals.</span></div>
      <div class="assistant-insight"><strong>Peak booking day: ${peakBookingDay()}</strong><span>Use premium campaigns and dynamic pricing on your strongest demand day.</span></div>
      <div class="assistant-insight"><strong>Low occupancy alert for ${lowOccupancy.room}</strong><span>Consider an offer or value-add package to improve conversion.</span></div>
    `;
  }
  if (watchlist) {
    watchlist.innerHTML = `
      <div class="assistant-insight"><strong>Pricing signal</strong><span>${pricingInsight()}</span></div>
      <div class="assistant-insight"><strong>Guest sentiment</strong><span>Average review score is ${avgReview}/5 across ${allReviews.length} reviews.</span></div>
      <div class="assistant-insight"><strong>Pending actions</strong><span>${appState.bookings.filter(booking => booking.status === 'pending').length} bookings are awaiting action.</span></div>
    `;
  }
  if (pricing) pricing.textContent = pricingInsight();
  if (reviewMetric) reviewMetric.textContent = `${avgReview} / 5`;
  if (reviewSub) reviewSub.textContent = `Based on ${allReviews.length} reviews`;
}

function downloadCSV(filename, rows) {
  const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportBookingsCSV() {
  downloadCSV('automatex-bookings.csv', [
    ['Booking ID', 'Guest', 'Room', 'Check-In', 'Check-Out', 'Status', 'Total'],
    ...appState.bookings.map(booking => [booking.id, booking.guest, booking.room, booking.checkIn, booking.checkOut, booking.status, booking.total])
  ]);
  showToast('Bookings CSV exported.');
}

function exportCustomersCSV() {
  downloadCSV('automatex-customers.csv', [
    ['Name', 'Email', 'Phone', 'Bookings', 'Spent', 'Joined'],
    ...appState.customers.map(customer => [customer.name, customer.email, customer.phone, customer.bookings, customer.spent, customer.joined])
  ]);
  showToast('Customers CSV exported.');
}

function toggleDemoMode() {
  const button = document.getElementById('demoModeBtn');
  appState.demoMode = !appState.demoMode;
  button?.classList.toggle('active', appState.demoMode);
  button?.querySelector('span')?.replaceChildren(document.createTextNode(appState.demoMode ? 'Disable Demo Mode' : 'Enable Demo Mode'));
  if (appState.demoMode) {
    const samples = [
      {guest:'Demo Guest A',room:'Deluxe Sea View',checkIn:'2026-04-24',checkOut:'2026-04-26',status:'confirmed',total:'$378'},
      {guest:'Demo Guest B',room:'Garden Sanctuary',checkIn:'2026-04-25',checkOut:'2026-04-27',status:'pending',total:'$238'}
    ];
    samples.forEach((sample, index) => appState.bookings.unshift({ id: `BK-D${Date.now().toString().slice(-4)}${index}`, ...sample }));
    demoInterval = setInterval(() => {
      const room = appState.rooms[Math.floor(Math.random() * appState.rooms.length)];
      const start = new Date();
      start.setDate(start.getDate() + Math.floor(Math.random() * 7));
      const end = new Date(start);
      end.setDate(end.getDate() + 2);
      const booking = {
        id: `BK-${Math.floor(1000 + Math.random() * 8999)}`,
        guest: 'Demo Walk-in',
        room: room.name,
        checkIn: start.toISOString().split('T')[0],
        checkOut: end.toISOString().split('T')[0],
        status: 'confirmed',
        total: currency(room.price * 2)
      };
      appState.bookings.unshift(booking);
      renderBookingsTable();
      renderRecentBookings();
      renderCalendar();
      renderAdminInsights();
      showNotification('Demo activity', `${booking.guest} booked ${booking.room}.`);
    }, 9000);
    showToast('Demo mode enabled');
  } else {
    clearInterval(demoInterval);
    demoInterval = null;
    showToast('Demo mode disabled');
  }
  saveState();
  renderBookingsTable();
  renderRecentBookings();
  renderCalendar();
  renderAdminInsights();
}

function attachRippleEffects() {
  document.querySelectorAll('button,.toolbar-btn,.btn-book,.btn-next,.btn-back,.nav-cta-link').forEach(button => {
    if (button.dataset.rippleBound) return;
    button.dataset.rippleBound = 'true';
    button.addEventListener('click', event => {
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
      circle.className = 'ripple';
      button.querySelector('.ripple')?.remove();
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(circle);
    });
  });
}

function setupScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.room-card,.feature-card,.stat-chip,.gallery-card').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(24px)';
    item.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.23,1,.32,1)';
    observer.observe(item);
  });
}

function scrollToHashOnLoad() {
  if (pageName() === 'home' && window.location.hash) {
    const id = window.location.hash.replace('#', '');
    requestAnimationFrame(() => requestAnimationFrame(() => smoothScrollTo(id)));
  }
}

function initHomePage() {
  renderRoomsGrid('roomsPreviewGrid', 3);
  renderGallery();
  renderContactCards();
  renderAIRecommendation();
}

function initRoomsPage() {
  renderRoomsGrid('roomsGrid');
}

function initContactPage() {
  renderContactCards();
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
  renderSharedOverlays();
  bindPublicEvents();
  attachNavigationEnhancements();
  if (pageName() === 'home') initHomePage();
  if (pageName() === 'rooms') initRoomsPage();
  if (pageName() === 'details') renderRoomDetails();
  if (pageName() === 'contact') initContactPage();
  if (pageName() === 'admin') renderAdminPage();
  attachRippleEffects();
  setupScrollAnimations();
  scrollToHashOnLoad();
  document.body.classList.add('is-ready');
});
