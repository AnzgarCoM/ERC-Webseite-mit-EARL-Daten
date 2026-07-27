(() => {
  const $=(s,r=document)=>r.querySelector(s);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const managers = {
    registrations:{title:"Registrierungen",copy:"Fahrer annehmen, ablehnen oder bearbeiten.",columns:["display_name","discord_name","requested_team_id","race_number","status"],fields:{display_name:"text",discord_name:"text",nationality:"text",race_number:"number",platform:"text",requested_team_id:"text",notes:"textarea",status:"text"}},
    drivers:{title:"Fahrerkarten",copy:"Öffentliche Fahrerprofile, Punkte und Strafpunkte.",columns:["display_name","team_id","race_number","championship_points","penalty_points"],fields:{display_name:"text",discord_name:"text",nationality:"text",race_number:"number",team_id:"text",role:"text",card_image_url:"text",championship_points:"number",penalty_points:"number",wins:"number",podiums:"number",status:"text"}},
    teams:{title:"Teams",copy:"Teamchef, Verfügbarkeit, Farben und Kartenvorlagen.",columns:["name","short_code","team_principal","is_available"],fields:{id:"text",name:"text",short_code:"text",primary_color:"color",secondary_color:"color",team_principal:"text",is_available:"boolean",team_chief_card_url:"text",driver_card_url:"text"}},
    races:{title:"Rennkalender",copy:"Termine, Zeiten und Anmeldestatus live pflegen.",columns:["round","name","qualifying_date","race_date","status"],fields:{round:"number",name:"text",circuit:"text",qualifying_date:"date",qualifying_time:"time",race_date:"date",race_time:"time",status:"text",qualifying_open:"boolean",race_open:"boolean"}},
    event_signups:{title:"Renn- & Quali-Anmeldungen",copy:"Teilnahmen prüfen und bearbeiten.",columns:["driver_name","race_id","signup_type","qualifying_confirmed","status"],fields:{driver_name:"text",discord_name:"text",race_id:"number",signup_type:"text",qualifying_confirmed:"boolean",notes:"textarea",status:"text"}},
    rules:{title:"Regelwerk",copy:"Kapitel der öffentlichen Regelwerksakte.",columns:["chapter","title","sort_order","published"],fields:{chapter:"text",title:"text",content:"textarea",sort_order:"number",published:"boolean"}},
    site_content:{title:"Seitentexte",copy:"Überschriften und Inhalte der Website.",columns:["page_key","content_key","value"],fields:{page_key:"text",content_key:"text",value:"textarea"}}
  };
  let table="registrations", rows=[], editing=null;
  function status(node,msg,error=false){node.textContent=msg;node.className=`form-status ${error?"error":"success"}`;}
  async function isAdmin(user){
    const {data,error}=await window.earlDb.from("profiles").select("is_admin").eq("id",user.id).single();
    return !error && data?.is_admin === true;
  }
  async function boot(){
    if(!window.earlDb){status($("#login-form .form-status"),"Supabase ist noch nicht konfiguriert. Öffne js/config.js.",true);return;}
    const {data:{session}}=await window.earlDb.auth.getSession();
    if(session && await isAdmin(session.user)) showAdmin(); else showLogin();
  }
  function showLogin(){$("#login-panel").classList.remove("hidden");$("#admin-panel").classList.add("hidden");$("#logout-button").classList.add("hidden");}
  function showAdmin(){$("#login-panel").classList.add("hidden");$("#admin-panel").classList.remove("hidden");$("#logout-button").classList.remove("hidden");renderTabs();load();}
  function renderTabs(){
    $("#admin-tabs").innerHTML=Object.entries(managers).map(([key,m])=>`<button class="${key===table?"active":""}" data-table="${key}">${esc(m.title)}</button>`).join("");
    $("#admin-tabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{table=b.dataset.table;renderTabs();load();});
  }
  async function load(){
    const m=managers[table];$("#manager-title").textContent=m.title;$("#manager-copy").textContent=m.copy;
    const {data,error}=await window.earlDb.from(table).select("*").order("id",{ascending:false});
    if(error){$("#manager-body").innerHTML=`<tr><td>Fehler: ${esc(error.message)}</td></tr>`;return;} rows=data||[];renderTable();
  }
  function renderTable(){
    const m=managers[table];$("#manager-head").innerHTML=`<tr>${m.columns.map(c=>`<th>${esc(c)}</th>`).join("")}<th>Aktionen</th></tr>`;
    $("#manager-body").innerHTML=rows.map((row,i)=>`<tr>${m.columns.map(c=>`<td>${esc(row[c])}</td>`).join("")}<td><div class="row-actions"><button data-edit="${i}">Bearbeiten</button><button class="danger" data-delete="${i}">Löschen</button></div></td></tr>`).join("")||`<tr><td colspan="${m.columns.length+1}">Noch keine Einträge.</td></tr>`;
    document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openEditor(rows[Number(b.dataset.edit)]));
    document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>remove(rows[Number(b.dataset.delete)]));
  }
  function openEditor(row=null){
    editing=row;const m=managers[table];$("#editor-title").textContent=row?"Eintrag bearbeiten":"Neuer Eintrag";
    $("#editor-fields").innerHTML=Object.entries(m.fields).map(([name,type])=>{
      const value=row?.[name]??""; if(type==="boolean") return `<label>${esc(name)}<select name="${esc(name)}"><option value="true" ${value===true?"selected":""}>Ja</option><option value="false" ${value===false?"selected":""}>Nein</option></select></label>`;
      if(type==="textarea") return `<label class="long">${esc(name)}<textarea name="${esc(name)}">${esc(value)}</textarea></label>`;
      return `<label>${esc(name)}<input name="${esc(name)}" type="${type}" value="${esc(value)}" ${name==="id"&&row?"readonly":""}></label>`;
    }).join("");$("#editor-modal").classList.remove("hidden");
  }
  function closeEditor(){$("#editor-modal").classList.add("hidden");editing=null;$("#editor-form .form-status").textContent="";}
  async function save(e){
    e.preventDefault();const fields=managers[table].fields;const payload={};
    new FormData(e.currentTarget).forEach((v,k)=>{payload[k]=fields[k]==="number"?(v===""?null:Number(v)):fields[k]==="boolean"?v==="true":v;});
    let query=editing?window.earlDb.from(table).update(payload).eq("id",editing.id):window.earlDb.from(table).insert(payload);
    const {error}=await query;if(error){status($("#editor-form .form-status"),error.message,true);return;}closeEditor();load();
  }
  async function remove(row){if(!confirm("Diesen Eintrag wirklich löschen?"))return;const {error}=await window.earlDb.from(table).delete().eq("id",row.id);if(error)alert(error.message);else load();}
  $("#login-form").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const {data,error}=await window.earlDb.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});if(error||!data.user){status($(".form-status",e.currentTarget),error?.message||"Login fehlgeschlagen",true);return;}if(!await isAdmin(data.user)){await window.earlDb.auth.signOut();status($(".form-status",e.currentTarget),"Dieses Konto besitzt keine Adminrechte.",true);return;}showAdmin();};
  $("#logout-button").onclick=async()=>{await window.earlDb.auth.signOut();showLogin();};
  $("#new-record").onclick=()=>openEditor();$("#editor-close").onclick=closeEditor;$("#editor-cancel").onclick=closeEditor;$("#editor-form").onsubmit=save;
  boot();
})();
