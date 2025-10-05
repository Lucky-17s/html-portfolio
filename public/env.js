// This file exposes a safe subset of env to the browser.
// Replace the placeholders with your Supabase project values, or generate at build time.
window.__ENV__ = {
  SUPABASE_URL: window.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || "",
};
