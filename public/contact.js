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

const form = document.getElementById('contactForm');
const statusEl = document.getElementById('contactStatus');

function setStatus(text, type = 'info') {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.remove('text-red-600', 'text-green-600');
  if (type === 'error') statusEl.classList.add('text-red-600');
  if (type === 'success') statusEl.classList.add('text-green-600');
}

function validateForm(data) {
  const email = (data.get('email') || '').toString().trim();
  const message = (data.get('message') || '').toString().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email.';
  }
  if (!message || message.length < 10) {
    return 'Message should be at least 10 characters.';
  }
  return null;
}

async function submitToSupabase(data) {
  if (!supabase) throw new Error('Supabase not configured');
  let userId = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    userId = userData?.user?.id || null;
  } catch (_) {}
  const payload = {
    email: data.get('email').toString().trim(),
    message: data.get('message').toString().trim(),
    user_id: userId,
  };
  const { error } = await supabase.from('contact_messages').insert(payload);
  if (error) throw error;
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const validationError = validateForm(formData);
    if (validationError) {
      setStatus(validationError, 'error');
      return;
    }
    setStatus('Sending...');
    try {
      await submitToSupabase(formData);
      setStatus('Message sent! I will get back to you soon.', 'success');
      form.reset();
    } catch (err) {
      setStatus(err.message || 'Something went wrong. Please try again.', 'error');
    }
  });
}
