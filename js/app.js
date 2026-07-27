(() => {
  const fallback = window.EARL_FALLBACK;
  let state = structuredClone(fallback);
  let pendingSignup = null;
  const $ = (s, root = document) => root.querySelector(s);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const teamById = id => state.teams.find(t => t.id === id);

  function showPage() {
    const id = (location.hash || "#home").slice(1);
    document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === id));
    document.querySelectorAll(".topbar nav a").forEach(a => a.classList.toggle("active", a.hash === `#${id}`));
    $(".topbar nav").classList.remove("open");
    scrollTo({top:0,behavior:"smooth"});
  }

  function render() {
    const upcoming = [...state.races].sort((a,b) => a.round-b.round);
    if (upcoming[0]) {
      $("#next-quali").textContent = `${upcoming[0].qualifying_date} · ${upcoming[0].qualifying_time}`;
      $("#next-race").textContent = `${upcoming[0].race_date} · ${upcoming[0].race_time}`;
    }
    $("#calendar-grid").innerHTML = upcoming.map(r => `<article class="race-card"><span>ROUND ${String(r.round).padStart(2,"0")}</span><h2>${esc(r.name)}</h2><p>${esc(r.circuit)}</p><dl><div><dt>QUALIFYING</dt><dd>${esc(r.qualifying_date)} · ${esc(r.qualifying_time)}</dd></div><div><dt>RENNEN</dt><dd>${esc(r.race_date)} · ${esc(r.race_time)}</dd></div></dl><b class="status">${esc(r.status)}</b></article>`).join("");
    $("#signup-race").innerHTML = upcoming.filter(r => r.race_open).map(r => `<option value="${esc(r.id)}">R${r.round} · ${esc(r.name)}</option>`).join("");
    $("#registration-team").innerHTML = state.teams.map(t => `<option value="${esc(t.id)}" ${t.is_available ? "" : "disabled"}>${esc(t.name)}${t.is_available ? "" : " – nicht verfügbar"}</option>`).join("");
    renderTeams(); renderDrivers(); renderStandings(); renderRules();
  }

  function logoMarkup(team, cls = "") {
    return `<img class="${cls}" src="${esc(team.team_chief_card_url)}" alt="${esc(team.name)}">`;
  }

  function profileCard(team, person, kind) {
    const image = kind === "chief" ? team.team_chief_card_url : (person.card_image_url || team.driver_card_url);
    return `<article class="profile-card"><img src="${esc(image)}" alt=""><div><small>${kind === "chief" ? "TEAMCHEF" : `#${esc(person.race_number || "—")} · ${esc(person.role || "FAHRER")}`}</small><strong>${esc(kind === "chief" ? team.team_principal || "Noch offen" : person.display_name)}</strong></div></article>`;
  }

  function renderTeams() {
    $("#team-list").innerHTML = state.teams.map((t,i) => {
      const drivers = state.drivers.filter(d => d.team_id === t.id);
      const cards = drivers.length ? drivers.map(d => profileCard(t,d,"driver")).join("") : profileCard(t,{display_name:"Freier Sitz",race_number:"01",role:"Stammfahrer"},"driver") + profileCard(t,{display_name:"Freier Sitz",race_number:"02",role:"Stammfahrer"},"driver");
      return `<article class="team-panel" data-team="${esc(t.id)}" style="--team:${esc(t.primary_color)};--team2:${esc(t.secondary_color)}">
        <button class="team-head" type="button" aria-expanded="false"><span class="team-number">${String(i+1).padStart(2,"0")}</span><span class="head-logo">${logoMarkup(t)}</span><span><small>${esc(t.short_code)}</small><strong>${esc(t.name)}</strong></span><em>${t.is_available ? "TEAM FREI" : "RESERVIERT"}</em><b>+</b></button>
        <div class="team-reveal" aria-label="${esc(t.name)} wird geöffnet"><div class="speed-lines"></div><div class="orbit"></div><div class="reveal-mark">${logoMarkup(t)}</div><span>EARL TEAM</span><strong>${esc(t.name)}</strong></div>
        <div class="team-body"><div><span class="label">OFFIZIELLE TEAMCHEFKARTE</span>${profileCard(t,{}, "chief")}</div><div><span class="label">FAHRER-LINE-UP</span><div class="lineup">${cards}</div></div></div>
      </article>`;
    }).join("");
    document.querySelectorAll(".team-head").forEach(button => button.addEventListener("click", () => toggleTeam(button.closest(".team-panel"))));
  }

  function toggleTeam(panel) {
    document.querySelectorAll(".team-panel").forEach(other => {
      if (other !== panel) { clearTimeout(other._timer); other.classList.remove("open","revealing"); $(".team-head",other).setAttribute("aria-expanded","false"); $(".team-head b",other).textContent="+"; }
    });
    if (panel.classList.contains("open") || panel.classList.contains("revealing")) {
      clearTimeout(panel._timer); panel.classList.remove("open","revealing"); $(".team-head",panel).setAttribute("aria-expanded","false"); $(".team-head b",panel).textContent="+"; return;
    }
    panel.classList.add("revealing"); $(".team-head",panel).setAttribute("aria-expanded","true"); $(".team-head b",panel).textContent="−";
    panel._timer = setTimeout(() => { panel.classList.remove("revealing"); panel.classList.add("open"); }, 3000);
  }

  function renderDrivers() {
    $("#driver-grid").innerHTML = state.drivers.map(d => { const t=teamById(d.team_id); return t ? `<div class="driver-shell">${profileCard(t,d,"driver")}<p><b>${esc(t.short_code)}</b> · ${esc(d.discord_name || "")}</p></div>` : ""; }).join("") || `<p class="empty">Freigegebene Fahrer erscheinen hier automatisch.</p>`;
  }
  function renderStandings() {
    $("#standings-body").innerHTML = [...state.drivers].sort((a,b)=>b.championship_points-a.championship_points||a.penalty_points-b.penalty_points).map((d,i)=>`<tr><td><b class="pos">${i+1}</b></td><td>#${esc(d.race_number)} · <strong>${esc(d.display_name)}</strong></td><td>${esc(teamById(d.team_id)?.short_code || "—")}</td><td>${d.wins||0}</td><td>${d.podiums||0}</td><td>${d.penalty_points||0}</td><td><strong>${d.championship_points||0}</strong></td></tr>`).join("");
  }
  function renderRules() {
    $("#rules-list").innerHTML = [...state.rules].sort((a,b)=>a.sort_order-b.sort_order).map(r=>`<details><summary><span>${esc(r.chapter)}</span><strong>${esc(r.title)}</strong><b>+</b></summary><div>${esc(r.content).replace(/\n/g,"<br>")}</div></details>`).join("");
  }

  async function loadSupabase() {
    if (!window.earlDb) return;
    const [teams,drivers,races,rules] = await Promise.all(["teams","drivers","races","rules"].map(table => window.earlDb.from(table).select("*")));
    if (!teams.error && teams.data.length) state.teams = teams.data.map(t => ({...t,team_chief_card_url:t.team_chief_card_url||`./assets/team-cards/team-chief/${t.id}.jpeg`,driver_card_url:t.driver_card_url||`./assets/team-cards/driver/${t.id}-driver-card.png`}));
    if (!drivers.error) state.drivers = drivers.data.filter(d=>d.status==="accepted" || !d.status);
    if (!races.error && races.data.length) state.races = races.data;
    if (!rules.error && rules.data.length) state.rules = rules.data;
    render();
  }

  async function send(table, payload, status) {
    if (!window.earlDb) { status.textContent = "Supabase ist noch nicht verbunden. Trage URL und Anon Key in js/config.js ein."; status.className="form-status error wide"; return false; }
    const {error}=await window.earlDb.from(table).insert(payload);
    status.textContent=error ? `Fehler: ${error.message}` : "Erfolgreich übermittelt. Die Ligaleitung prüft deine Angaben.";
    status.className=`form-status ${error?"error":"success"} wide`; return !error;
  }

  $("#registration-form").addEventListener("submit", async e => {
    e.preventDefault(); const f=new FormData(e.currentTarget); const payload=Object.fromEntries(f); payload.race_number=Number(payload.race_number); payload.status="pending";
    if(await send("registrations",payload,$(".form-status",e.currentTarget))) e.currentTarget.reset();
  });
  $("#signup-form").addEventListener("submit", e => {
    e.preventDefault(); const payload=Object.fromEntries(new FormData(e.currentTarget)); payload.race_id=Number(payload.race_id);
    if(payload.signup_type==="race"){pendingSignup={form:e.currentTarget,payload};$("#confirm-modal").classList.remove("hidden");} else submitSignup(e.currentTarget,payload);
  });
  async function submitSignup(form,payload){ if(await send("event_signups",payload,$(".form-status",form))) form.reset(); }
  $("#confirm-no").onclick=()=>{$("#confirm-modal").classList.add("hidden");pendingSignup=null;};
  $("#confirm-yes").onclick=()=>{if(pendingSignup){pendingSignup.payload.qualifying_confirmed=true;submitSignup(pendingSignup.form,pendingSignup.payload);}$("#confirm-modal").classList.add("hidden");pendingSignup=null;};
  $(".menu-button").onclick=()=>$(".topbar nav").classList.toggle("open");
  addEventListener("hashchange",showPage); showPage(); render(); loadSupabase();
})();
// Intro-Logo Animation: ERC -> EARL Wechsel
document.addEventListener("DOMContentLoaded", () => {
  const ercLogo = document.querySelector(".logo-erc");
  const earlLogo = document.querySelector(".logo-earl");

  if (ercLogo && earlLogo) {
    setTimeout(() => {
      ercLogo.classList.add("hidden-intro");
      earlLogo.classList.remove("hidden-intro");
    }, 2500); // Wechsele nach 2,5 Sekunden von ERC auf EARL
  }
});