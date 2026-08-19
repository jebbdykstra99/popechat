(function () {
  'use strict';

  const MOBILE_NAV_MQ = 900;
  const LS_USER = 'popechat.user';
  const LS_LIKES = 'popechat.likes';
  const LS_POSTS = 'popechat.localPosts';

  const firebaseConfig = {
    apiKey: "AIzaSyA0AGKwIt3jWCdivlb573i19XEDm12zxIE",
    authDomain: "bakasan-art.firebaseapp.com",
    projectId: "bakasan-art",
    storageBucket: "bakasan-art.firebasestorage.app",
    messagingSenderId: "839964323046",
    appId: "1:839964323046:web:ef9ddbbef5f64acfc2df27",
    measurementId: "G-31WPTPSZQW"
  };
  firebase.initializeApp(firebaseConfig);
  const fbAuth = firebase.auth();

  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');

  const COLORS = ['#0b1c2c', '#1b6b73', '#c0362c', '#2a4a62', '#8a3b32', '#345c6e'];

  const TRENDS = [
    { tag: 'Letter', headline: 'Read the encyclical like a letter, not a headline', snippet: 'Dummy desk. The office writes slowly on purpose. Not official Vatican.', meta: 'From the letter' },
    { tag: 'Square', headline: 'The square is a public room', snippet: 'Pigeons, pilgrims, cameras. Dummy note. The greeting is to the city and the world.', meta: 'In the square' },
    { tag: 'Office', headline: 'The chair is an office, not a brand', snippet: 'Talk about the See. Do not invent a sitting name as live news. Dummy feed.', meta: 'Urbi et orbi' },
    { tag: 'Charity', headline: 'Charity first, culture war never', snippet: 'Hospitals, food, a quiet collection. Dummy, not a fundraiser.', meta: 'From the letter' },
    { tag: 'Conclave', headline: 'White smoke is a process, not a meme', snippet: 'How the church picks. Civic knowledge. Dummy, not a prediction market.', meta: 'The See' },
    { tag: 'Greeting', headline: 'Urbi et orbi. To the city and the world.', snippet: 'A blessing that names everyone. Dummy feed. Not a homily. Not official.', meta: 'Urbi et orbi' }
  ];

  const PLACES = [
    { tag: 'Letter', title: 'Encyclicals', snippet: 'Long letters to the church and anyone who will read slowly.' },
    { tag: 'Letter', title: 'Urbi et orbi', snippet: 'To the city and the world. A greeting, not a slogan.' },
    { tag: 'Letter', title: 'The office', snippet: 'The chair outlasts the man. Dummy talk, not a biography.' },
    { tag: 'Letter', title: 'Charity', snippet: 'Hospitals and bread before the argument.' },
    { tag: 'Letter', title: 'Footnotes of mercy', snippet: 'Read the poor into the document. Dummy desk.' },
    { tag: 'Letter', title: 'Not a homily', snippet: 'This site is a room. Mass is elsewhere.' }
  ];

  const TOPICS = [
    { tag: 'Square', title: 'St. Peter’s square', snippet: 'A public room with a colonnade. Dummy postcard.' },
    { tag: 'Square', title: 'White smoke', snippet: 'The process, explained calmly. Not a countdown clock.' },
    { tag: 'Square', title: 'The Swiss and the doors', snippet: 'Ceremony as civic furniture. Dummy, not a tour.' },
    { tag: 'Square', title: 'Pilgrims', snippet: 'People who came a long way and are tired. Be kind in the thread.' },
    { tag: 'Square', title: 'Bells', snippet: 'Timekeeping for a city that still listens.' },
    { tag: 'Square', title: 'Not official Vatican', snippet: 'We are a dress rehearsal. They have a press office.' }
  ];

  const SEED = [
    { id: 'p1', name: 'Urbi et Orbi', handle: 'urbietorbi', text: 'To the city and the world. That is the whole greeting. Dummy feed. Not official Vatican. Not a meme.', hours: 1, likes: 146, replies: 18, followed: true },
    { id: 'p2', name: 'The Square', handle: 'thesquare', text: 'The square is a public room. Cameras, pilgrims, pigeons. Talk like you are standing in it, not dunking from a couch.', hours: 2, likes: 98, replies: 12, followed: true },
    { id: 'p3', name: 'Encyclical Desk', handle: 'encyclicaldesk', text: 'Read the letter slowly. Headlines flatten it. Dummy desk. The office writes on purpose, not for the cycle.', hours: 3, likes: 121, replies: 16, followed: true },
    { id: 'p4', name: 'White Smoke', handle: 'whitesmoke', text: 'White smoke is a process with rules. Civic knowledge, not a betting market. Dummy, not a prediction.', hours: 5, likes: 87, replies: 11, followed: false },
    { id: 'p5', name: 'Charity First', handle: 'charityfirst', text: 'Hospitals and bread before the argument. If the thread cannot hold that, it is not this room.', hours: 7, likes: 154, replies: 21, followed: true },
    { id: 'p6', name: 'Holy See Desk', handle: 'holyseedesk', text: 'The See is an office. We will not invent a sitting name as live news on a dummy feed. Talk about the chair.', hours: 8, likes: 76, replies: 9, followed: true },
    { id: 'p7', name: 'Keys', handle: 'twokeys', text: 'Keys in a purple square is a mark, not a coat of arms. We are not the press office. Dummy rehearsal.', hours: 10, likes: 64, replies: 7, followed: false },
    { id: 'p8', name: 'Colonnade', handle: 'colonnade', text: 'Bernini built a pair of arms. The architecture is the metaphor. Dummy postcard from the square.', hours: 12, likes: 91, replies: 8, followed: false },
    { id: 'p9', name: 'Quiet Collection', handle: 'quietcollection', text: 'A collection that does not need a camera. Charity first. Dummy, not a fundraiser.', hours: 14, likes: 70, replies: 6, followed: true },
    { id: 'p10', name: 'Bells', handle: 'romanbells', text: 'Bells keep time for people who still look up. Dummy note. The city is in the greeting.', hours: 16, likes: 55, replies: 4, followed: false },
    { id: 'p11', name: 'Pilgrim Thread', handle: 'pilgrimthread', text: 'If you walked a long way, you get the benefit of the doubt. Be kind in the square. Dummy etiquette.', hours: 18, likes: 102, replies: 13, followed: true },
    { id: 'p12', name: 'Not a Homily', handle: 'notahomily', text: 'Mass is elsewhere. This is a room for talking about the office and the letters. Dummy. Not X.com.', hours: 20, likes: 83, replies: 10, followed: true },
    { id: 'p13', name: 'Footnotes', handle: 'letterfootnotes', text: 'The poor are in the footnotes if you actually read. Dummy desk. Culture war is a bad lector.', hours: 22, likes: 117, replies: 15, followed: true },
    { id: 'p14', name: 'Sede', handle: 'sedevacantjoke', text: 'No conspiracy threads. The process is public enough. Dummy feed. Go outside if you need a conclave rumor.', hours: 26, likes: 61, replies: 9, followed: false },
    { id: 'p15', name: 'World', handle: 'adorbem', text: 'Orbi means the world. Include people who are not already in your parish group chat. Dummy, still the point.', hours: 30, likes: 99, replies: 11, followed: true },
    { id: 'p16', name: 'City', handle: 'adurbi', text: 'Urbi means the city. Rome first, then everyone. The greeting still works if you are not there.', hours: 34, likes: 88, replies: 8, followed: true }
  ];

  const NOTIFS = [
    { id: 'n1', text: '@missionfoil liked your take on foil.', time: '1h', unread: true },
    { id: 'n2', text: '@karlthefog mentioned you in a fog check.', time: '3h', unread: true },
    { id: 'n3', text: '@oraclewind started following you. Dummy follow.', time: 'Yesterday', unread: true }
  ];

  const THREADS = [
    { id: 't1', name: 'Mission Foil', handle: 'missionfoil', preview: 'Okay but have you tried the super with extra hot?', messages: [
      { me: false, text: 'Okay but have you tried the super with extra hot?' },
      { me: true, text: 'Every Tuesday. This is not a debate.' }
    ]},
    { id: 't2', name: 'BART Watcher', handle: 'bartwatcher', preview: 'Walking from Montgomery. You?', messages: [
      { me: false, text: 'Walking from Montgomery. You?' },
      { me: true, text: 'Stuck at 16th. See you on Valencia.' }
    ]}
  ];

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function colorFor(handle) {
    let n = 0;
    for (let i = 0; i < handle.length; i++) n = (n + handle.charCodeAt(i) * (i + 1)) % COLORS.length;
    return COLORS[n];
  }
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
  }

  let currentUser = loadJSON(LS_USER, null);
  let likes = loadJSON(LS_LIKES, {});
  let extraPosts = loadJSON(LS_POSTS, []);
  let currentTab = 'foryou';
  let activeThread = null;

  function allPosts() {
    return extraPosts.concat(SEED);
  }

  function isMobileNav() { return window.innerWidth <= MOBILE_NAV_MQ; }
  function closeMobileNav() {
    document.body.classList.remove('nav-open');
    syncHamburgerAria();
  }
  function syncHamburgerAria() {
    if (!hamburger) return;
    const open = isMobileNav()
      ? document.body.classList.contains('nav-open')
      : !document.body.classList.contains('nav-collapsed');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }

  function highlightSocial(name) {
    document.querySelectorAll('.nav-social-link').forEach(function (l) { l.classList.remove('active'); });
    const el = document.querySelector('[data-social="' + name + '"]');
    if (el) el.classList.add('active');
  }

  function closeSocialOverlays() {
    ['explore-overlay', 'notif-overlay', 'chat-overlay', 'profile-overlay'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active', 'thread-open');
    });
  }

  function showContentPage(id) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    const page = document.getElementById('page-' + id);
    if (page) page.classList.add('active');
    window.scrollTo(0, 0);
  }

  function normalizeRoute(route) {
    let id = String(route || '').replace(/^#/, '').trim();
    if (!id) id = 'home';
    try { id = decodeURIComponent(id); } catch (e) { /* keep */ }
    return id;
  }
  function routeFromHash() { return normalizeRoute(window.location.hash); }
  function go(route) {
    const id = normalizeRoute(route);
    const hash = '#' + id;
    if (location.hash === hash) { applyRoute(); return; }
    location.hash = hash;
  }

  function selectThoughtsTab(tab) {
    currentTab = tab;
    document.querySelectorAll('[data-thoughts-tab]').forEach(function (t) {
      t.classList.toggle('active', t.dataset.thoughtsTab === tab);
    });
    renderFeed();
  }

  function applyRoute() {
    closeMobileNav();
    const raw = routeFromHash();

    if (raw === 'following') {
      closeSocialOverlays();
      showContentPage('thoughts');
      highlightSocial('following');
      selectThoughtsTab('following');
      return;
    }
    if (raw === 'hot' || raw === 'new') {
      closeSocialOverlays();
      showContentPage('thoughts');
      highlightSocial('home');
      selectThoughtsTab(raw);
      return;
    }
    if (raw === 'home' || raw === 'feed' || raw === 'thoughts') {
      closeSocialOverlays();
      showContentPage('thoughts');
      highlightSocial('home');
      selectThoughtsTab('foryou');
      return;
    }
    if (raw === 'chat') { openChat(); return; }
    if (raw === 'notifications') { openNotif(); return; }
    if (raw === 'explore') { openExplore(); return; }
    if (raw === 'profile') { openProfile(); return; }
    if (raw === 'news') {
      closeSocialOverlays();
      showContentPage('news');
      highlightSocial('news');
      return;
    }
    closeSocialOverlays();
    showContentPage('thoughts');
    highlightSocial('home');
  }

  function renderPost(post) {
    const liked = !!likes[post.id];
    const likeCount = post.likes + (liked ? 1 : 0);
    const av = initials(post.name);
    const bg = colorFor(post.handle);
    return (
      '<article class="post" data-post-id="' + post.id + '">' +
        '<div class="post-avatar" style="background:' + bg + '">' + av + '</div>' +
        '<div class="post-body">' +
          '<div class="post-meta">' +
            '<span class="post-name">' + escapeHtml(post.name) + '</span>' +
            '<span class="post-handle">@' + escapeHtml(post.handle) + '</span>' +
            '<span class="post-time">· ' + (post.hours != null ? post.hours + 'h' : 'now') + '</span>' +
          '</div>' +
          '<p class="post-text">' + escapeHtml(post.text) + '</p>' +
          '<div class="post-actions">' +
            '<button class="post-action" data-act="reply" type="button">Reply · ' + (post.replies || 0) + '</button>' +
            '<button class="post-action' + (liked ? ' liked' : '') + '" data-act="like" type="button">Like · ' + likeCount + '</button>' +
            '<button class="post-action" data-act="share" type="button">Share</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function renderFeed() {
    const el = document.getElementById('thoughts-feed');
    if (!el) return;
    let posts = allPosts().slice();
    if (currentTab === 'following') posts = posts.filter(function (p) { return p.followed || (currentUser && p.handle === currentUser.handle); });
    if (currentTab === 'hot') posts.sort(function (a, b) { return (b.likes + (likes[b.id] ? 1 : 0)) - (a.likes + (likes[a.id] ? 1 : 0)); });
    if (currentTab === 'new') posts.sort(function (a, b) { return (a.hours || 0) - (b.hours || 0); });
    if (!posts.length) {
      el.innerHTML = '<div class="post-empty">No posts in this ranking yet. Following / Hot / New are UI chrome — dress rehearsal only.</div>';
      return;
    }
    el.innerHTML = posts.map(renderPost).join('');
  }

  function renderTrends() {
    const card = function (t) {
      return '<a class="news-item" href="#explore">' +
        '<div class="news-item-tag">' + escapeHtml(t.tag) + '</div>' +
        '<div class="news-item-headline">' + escapeHtml(t.headline) + '</div>' +
        '<div class="news-item-snippet">' + escapeHtml(t.snippet) + '</div>' +
        '<div class="news-item-meta">' + escapeHtml(t.meta) + '</div>' +
      '</a>';
    };
    const rail = document.getElementById('news-feed');
    const page = document.getElementById('news-page-list');
    const html = TRENDS.map(card).join('');
    if (rail) rail.innerHTML = html;
    if (page) page.innerHTML = html;
  }

  function renderExplore() {
    function cards(list) {
      return list.map(function (c) {
        return '<article class="explore-card">' +
          '<div class="explore-card-tag">' + escapeHtml(c.tag) + '</div>' +
          '<div class="explore-card-title">' + escapeHtml(c.title) + '</div>' +
          '<div class="explore-card-snippet">' + escapeHtml(c.snippet) + '</div>' +
        '</article>';
      }).join('');
    }
    document.getElementById('explore-pane-letters').innerHTML = cards(PLACES);
    document.getElementById('explore-pane-square').innerHTML = cards(TOPICS);
  }

  function renderNotifs() {
    const el = document.getElementById('notif-list');
    if (!el) return;
    el.innerHTML = NOTIFS.map(function (n) {
      return '<div class="notif-item' + (n.unread ? ' unread' : '') + '" data-nid="' + n.id + '">' +
        '<div><p>' + escapeHtml(n.text) + '</p><time>' + n.time + '</time></div></div>';
    }).join('');
    const unread = NOTIFS.filter(function (n) { return n.unread; }).length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = String(unread);
      badge.classList.toggle('visible', unread > 0);
    }
  }

  function renderThreads() {
    const el = document.getElementById('chat-thread-list');
    if (!el) return;
    el.innerHTML = THREADS.map(function (t) {
      return '<div class="chat-thread-item" data-tid="' + t.id + '">' +
        '<div class="post-avatar" style="background:' + colorFor(t.handle) + '">' + initials(t.name) + '</div>' +
        '<div><div class="thread-name">' + escapeHtml(t.name) + '</div>' +
        '<div class="thread-preview">' + escapeHtml(t.preview) + '</div></div></div>';
    }).join('');
  }

  function openThread(id) {
    const t = THREADS.find(function (x) { return x.id === id; });
    if (!t) return;
    activeThread = t;
    document.getElementById('chat-placeholder').hidden = true;
    const view = document.getElementById('chat-thread-view');
    view.hidden = false;
    document.getElementById('chat-active-name').textContent = t.name;
    document.getElementById('chat-messages').innerHTML = t.messages.map(function (m) {
      return '<div class="chat-bubble ' + (m.me ? 'me' : 'them') + '">' + escapeHtml(m.text) + '</div>';
    }).join('');
    document.getElementById('chat-overlay').classList.add('thread-open');
  }

  function openChat() {
    closeSocialOverlays();
    document.getElementById('chat-overlay').classList.add('active');
    highlightSocial('chat');
  }
  function openNotif() {
    closeSocialOverlays();
    document.getElementById('notif-overlay').classList.add('active');
    highlightSocial('notifications');
  }
  function openExplore() {
    closeSocialOverlays();
    document.getElementById('explore-overlay').classList.add('active');
    highlightSocial('explore');
  }
  function openProfile() {
    closeSocialOverlays();
    document.getElementById('profile-overlay').classList.add('active');
    highlightSocial('profile');
    syncProfile();
  }

  function syncProfile() {
    const prompt = document.getElementById('profile-signin-prompt');
    const content = document.getElementById('profile-content');
    if (!currentUser) {
      prompt.hidden = false;
      content.hidden = true;
      document.getElementById('profile-topbar-name').textContent = 'Profile';
      return;
    }
    prompt.hidden = true;
    content.hidden = false;
    document.getElementById('profile-topbar-name').textContent = currentUser.name;
    document.getElementById('profile-display-name').textContent = currentUser.name;
    document.getElementById('profile-handle').textContent = '@' + currentUser.handle;
    document.getElementById('profile-avatar').textContent = initials(currentUser.name);
    document.getElementById('profile-bio').textContent = currentUser.bio || 'Talking about the city.';
    const mine = allPosts().filter(function (p) { return p.handle === currentUser.handle; });
    const pane = document.getElementById('profile-pane-posts');
    if (!mine.length) {
      pane.innerHTML = '<div class="empty-note" id="profile-posts-empty">No posts yet. Hit Post when something about the city is on your mind.</div>';
    } else {
      pane.innerHTML = mine.map(renderPost).join('');
    }
  }

  function renderSidebarAuth() {
    const el = document.getElementById('sidebar-auth');
    const av = document.getElementById('thoughts-compose-avatar');
    if (currentUser) {
      el.innerHTML =
        '<div class="sidebar-auth-user">' +
          '<div class="sidebar-auth-avatar">' + initials(currentUser.name) + '</div>' +
          '<div class="sidebar-auth-name">@' + escapeHtml(currentUser.handle) + '</div>' +
        '</div>' +
        '<button class="sidebar-auth-btn" id="auth-signout" type="button">Sign out</button>';
      av.textContent = initials(currentUser.name);
      av.style.background = colorFor(currentUser.handle);
    } else {
      el.innerHTML = '<button class="sidebar-auth-btn primary" id="auth-signin" type="button">Sign in</button>';
      av.textContent = '415';
      av.style.background = '';
    }
  }

  function openAuth(tab) {
    const ov = document.getElementById('cv-auth-overlay');
    ov.classList.add('open');
    document.querySelectorAll('.conv-modal-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.getElementById('cv-panel-login').style.display = tab === 'login' ? '' : 'none';
    document.getElementById('cv-panel-register').style.display = tab === 'register' ? '' : 'none';
    const closeBtn = document.getElementById('cv-modal-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeAuth() {
    document.getElementById('cv-auth-overlay').classList.remove('open');
  }
  function stubSignIn(name, handle) {
    currentUser = {
      name: name || 'Guest',
      handle: (handle || 'guest415').replace(/^@/, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'guest415',
      bio: 'the Holy See, talking.'
    };
    saveJSON(LS_USER, currentUser);
    closeAuth();
    renderSidebarAuth();
    syncProfile();
  }
  function signOut() {
    currentUser = null;
    saveJSON(LS_USER, null);
    if (fbAuth.currentUser) fbAuth.signOut();
    renderSidebarAuth();
    syncProfile();
  }

  function applyFirebaseUser(user) {
    var emailLocal = (user.email || '').split('@')[0];
    var name = user.displayName || emailLocal || 'Member';
    var handle = (emailLocal || name).replace(/^@/, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'member';
    currentUser = {
      name: name,
      handle: handle,
      bio: 'the Holy See, talking.'
    };
    saveJSON(LS_USER, currentUser);
    renderSidebarAuth();
    syncProfile();
    closeAuth();
  }
  fbAuth.onAuthStateChanged(function (user) {
    if (user) applyFirebaseUser(user);
  });

  function maybePost() {
    const input = document.getElementById('thoughts-compose-input');
    const text = (input.value || '').trim();
    if (!text) return;
    if (!currentUser) { openAuth('login'); return; }
    extraPosts.unshift({
      id: 'local-' + Date.now(),
      name: currentUser.name,
      handle: currentUser.handle,
      text: text.slice(0, 280),
      hours: 0,
      likes: 0,
      replies: 0,
      followed: true
    });
    saveJSON(LS_POSTS, extraPosts);
    input.value = '';
    document.getElementById('thoughts-post-btn').disabled = true;
    renderFeed();
    syncProfile();
  }

  /* ── Events ─────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const social = e.target.closest('[data-social]');
    if (social) {
      e.preventDefault();
      go(social.dataset.social);
      return;
    }
    if (e.target.closest('#auth-signin') || e.target.closest('#profile-signin-prompt-btn')) {
      openAuth('login');
      return;
    }
    if (e.target.closest('#auth-signout')) { signOut(); return; }

    const tab = e.target.closest('[data-thoughts-tab]');
    if (tab) {
      const t = tab.dataset.thoughtsTab;
      if (t === 'following') go('following');
      else if (t === 'hot') go('hot');
      else if (t === 'new') go('new');
      else go('home');
      return;
    }

    const likeBtn = e.target.closest('[data-act="like"]');
    if (likeBtn) {
      const post = likeBtn.closest('[data-post-id]');
      if (!post) return;
      const id = post.dataset.postId;
      likes[id] = !likes[id];
      if (!likes[id]) delete likes[id];
      saveJSON(LS_LIKES, likes);
      renderFeed();
      syncProfile();
      return;
    }
    if (e.target.closest('[data-act="reply"]') || e.target.closest('[data-act="share"]')) {
      if (!currentUser) openAuth('login');
      return;
    }

    const etab = e.target.closest('[data-explore-tab]');
    if (etab) {
      document.querySelectorAll('[data-explore-tab]').forEach(function (t) {
        t.classList.toggle('active', t === etab);
      });
      document.getElementById('explore-pane-letters').classList.toggle('active', etab.dataset.exploreTab === 'places');
      document.getElementById('explore-pane-square').classList.toggle('active', etab.dataset.exploreTab === 'topics');
      return;
    }

    const thread = e.target.closest('[data-tid]');
    if (thread) { openThread(thread.dataset.tid); return; }

    if (isMobileNav() && document.body.classList.contains('nav-open')
        && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileNav();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    const ov = document.getElementById('cv-auth-overlay');
    if (ov && ov.classList.contains('open')) { e.preventDefault(); closeAuth(); return; }
    if (isMobileNav() && document.body.classList.contains('nav-open')) closeMobileNav();
  });

  hamburger.addEventListener('click', function () {
    if (isMobileNav()) document.body.classList.toggle('nav-open');
    else document.body.classList.toggle('nav-collapsed');
    syncHamburgerAria();
  });
  window.addEventListener('resize', syncHamburgerAria);
  document.getElementById('nav-overlay').addEventListener('click', closeMobileNav);
  document.getElementById('right-panel-tab').addEventListener('click', function () {
    document.body.classList.toggle('right-collapsed');
  });
  document.getElementById('sidebar-search-btn').addEventListener('click', function () { go('explore'); });
  document.getElementById('sidebar-post-btn').addEventListener('click', function () {
    go('home');
    setTimeout(function () {
      const input = document.getElementById('thoughts-compose-input');
      if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, 120);
  });

  ['profile-back', 'notif-back', 'explore-back'].forEach(function (id) {
    document.getElementById(id).addEventListener('click', function () { go('home'); });
  });
  document.getElementById('notif-mark-read').addEventListener('click', function () {
    NOTIFS.forEach(function (n) { n.unread = false; });
    renderNotifs();
  });
  document.getElementById('chat-new-btn').addEventListener('click', function () {
    if (!currentUser) { openAuth('login'); return; }
    openThread('t1');
  });
  document.getElementById('chat-placeholder-new').addEventListener('click', function () {
    if (!currentUser) { openAuth('login'); return; }
    openThread('t1');
  });
  document.getElementById('chat-send-btn').addEventListener('click', function () {
    if (!currentUser) { openAuth('login'); return; }
    const input = document.getElementById('chat-compose-input');
    const text = (input.value || '').trim();
    if (!text || !activeThread) return;
    activeThread.messages.push({ me: true, text: text });
    input.value = '';
    openThread(activeThread.id);
  });
  document.getElementById('profile-edit-btn').addEventListener('click', function () {
    openAuth('register');
  });

  const compose = document.getElementById('thoughts-compose-input');
  const postBtn = document.getElementById('thoughts-post-btn');
  compose.addEventListener('input', function () {
    postBtn.disabled = !(compose.value || '').trim();
    compose.style.height = 'auto';
    compose.style.height = Math.min(compose.scrollHeight, 200) + 'px';
  });
  postBtn.addEventListener('click', maybePost);

  document.getElementById('cv-modal-close').addEventListener('click', function (e) {
    e.preventDefault();
    closeAuth();
  });
  document.getElementById('cv-auth-overlay').addEventListener('click', function (e) {
    if (e.target.id === 'cv-auth-overlay') closeAuth();
  });
  document.querySelectorAll('.conv-modal-tab').forEach(function (t) {
    t.addEventListener('click', function () { openAuth(t.dataset.tab); });
  });
  function stubSubmit(errId) {
    const err = document.getElementById(errId);
    err.textContent = 'Dress rehearsal — no live auth. Continuing as guest.';
    err.classList.add('show');
    setTimeout(function () { stubSignIn('Guest', 'guest415'); }, 500);
  }
  document.getElementById('cv-login-btn').addEventListener('click', function () { stubSubmit('cv-login-err'); });
  document.getElementById('cv-reg-btn').addEventListener('click', function () {
    const name = (document.getElementById('cv-reg-name').value || '').trim() || 'Guest';
    const err = document.getElementById('cv-reg-err');
    err.textContent = 'Dress rehearsal — no live auth. Local guest only.';
    err.classList.add('show');
    setTimeout(function () { stubSignIn(name, name.replace(/\s+/g, '').slice(0, 12)); }, 500);
  });
  document.getElementById('cv-google-login').addEventListener('click', function () {
    var err = document.getElementById('cv-login-err');
    err.classList.remove('show');
    var gProvider = new firebase.auth.GoogleAuthProvider();
    fbAuth.signInWithPopup(gProvider).catch(function (e) {
      err.textContent = e.message || String(e);
      err.classList.add('show');
    });
  });
  document.getElementById('cv-guest-login').addEventListener('click', function () { stubSignIn('Guest', 'guest415'); });

  const search = document.getElementById('explore-search-input');
  search.addEventListener('input', function () {
    const q = search.value.trim().toLowerCase();
    function filt(list) {
      if (!q) return list;
      return list.filter(function (c) {
        return (c.title + ' ' + c.snippet + ' ' + c.tag).toLowerCase().indexOf(q) !== -1;
      });
    }
    function cards(list) {
      if (!list.length) return '<p class="empty-note">Nothing in the 415 matched that.</p>';
      return list.map(function (c) {
        return '<article class="explore-card"><div class="explore-card-tag">' + escapeHtml(c.tag) +
          '</div><div class="explore-card-title">' + escapeHtml(c.title) +
          '</div><div class="explore-card-snippet">' + escapeHtml(c.snippet) + '</div></article>';
      }).join('');
    }
    document.getElementById('explore-pane-letters').innerHTML = cards(filt(PLACES));
    document.getElementById('explore-pane-square').innerHTML = cards(filt(TOPICS));
  });

  renderTrends();
  renderExplore();
  renderNotifs();
  renderThreads();
  renderSidebarAuth();
  renderFeed();

  window.addEventListener('hashchange', applyRoute);
  if (!location.hash || location.hash === '#') history.replaceState(null, '', '#home');
  applyRoute();
  syncHamburgerAria();
})();
