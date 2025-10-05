import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const env = window.__ENV__ || {};
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
  });
}

function byId(id) { return document.getElementById(id); }

function applyTheme() {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.body.className = document.body.className.replace('bg-white text-gray-900', '');
  if (theme === 'dark') {
    document.body.classList.add('bg-gray-950', 'text-gray-50');
  } else {
    document.body.classList.add('bg-white', 'text-gray-900');
  }
}

function toggleTheme() {
  const current = localStorage.getItem('theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', next);
  applyTheme();
}

async function refreshSessionUI() {
  const signInBtn = byId('signInBtn');
  const accountMenu = byId('accountMenu');
  const userEmail = byId('userEmail');
  if (!supabase) {
    if (signInBtn) signInBtn.classList.remove('hidden');
    if (accountMenu) accountMenu.classList.add('hidden');
    return;
  }
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (session?.user) {
    if (signInBtn) signInBtn.classList.add('hidden');
    if (accountMenu) accountMenu.classList.remove('hidden');
    if (userEmail) userEmail.textContent = session.user.email || '';
  } else {
    if (signInBtn) signInBtn.classList.remove('hidden');
    if (accountMenu) accountMenu.classList.add('hidden');
    if (userEmail) userEmail.textContent = '';
  }
}

function setupAuthModal() {
  const modal = byId('authModal');
  const openBtn = byId('signInBtn');
  const closeBtn = byId('authModalClose');
  const form = byId('magicLinkForm');
  const emailInput = byId('magicEmail');
  const googleBtn = byId('googleSignIn');

  function open() { if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); } }
  function close() { if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); } }

  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput?.value?.trim();
      if (!email) return;
      if (!supabase) {
        alert('Auth not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in public/env.js');
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
      if (error) {
        alert(error.message);
      } else {
        alert('Magic link sent! Check your email.');
      }
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      if (!supabase) {
        alert('Auth not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in public/env.js');
        return;
      }
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
      if (error) alert(error.message);
    });
  }
}

function setupAccountActions() {
  const signOutBtn = byId('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
      await refreshSessionUI();
    });
  }
}

(function init() {
  applyTheme();
  const themeToggle = byId('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  setupAuthModal();
  setupAccountActions();
  refreshSessionUI();
  const yearEl = byId('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
