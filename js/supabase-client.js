(() => {
  const cfg = window.EARL_CONFIG || {};
  const ready = /^https:\/\/.+\.supabase\.co$/.test(cfg.supabaseUrl || "") && !String(cfg.supabaseAnonKey || "").startsWith("YOUR_");
  window.EARL_SUPABASE_READY = ready;
  window.earlDb = ready && window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
})();
