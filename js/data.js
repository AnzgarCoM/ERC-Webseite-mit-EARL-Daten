window.EARL_FALLBACK = {
  teams: [
    ["red-bull","Oracle Red Bull Racing","RBR","#3671c6","#ff1e2d","red-bull"],
    ["cadillac","Cadillac Racing","CAD","#c8a45b","#ffffff","cadillac"],
    ["aston-martin","Aston Martin","AMR","#006f62","#cedc00","aston-martin"],
    ["williams","Williams Racing","WIL","#00a0de","#ffffff","williams"],
    ["audi","Audi F1 Team","AUD","#e10600","#ffffff","audi"],
    ["haas","Haas F1 Team","HAS","#e6002d","#ffffff","haas"],
    ["mclaren","McLaren","MCL","#ff8700","#ffffff","mclaren"],
    ["mercedes","Mercedes-AMG","MER","#00d2be","#c0c0c0","mercedes"],
    ["alpine","Alpine","ALP","#2293d1","#ff87bc","alpine"],
    ["ferrari","Scuderia Ferrari","FER","#dc0000","#ffd700","ferrari"]
  ].map(([id,name,short_code,primary_color,secondary_color,asset]) => ({
    id,name,short_code,primary_color,secondary_color,team_principal:"Noch offen",is_available:true,
    team_chief_card_url:`./assets/team-cards/team-chief/${asset}.jpeg`,
    driver_card_url:`./assets/team-cards/driver/${asset}-driver-card.png`
  })),
  drivers: [
    {id:1,display_name:"EARL Driver 01",discord_name:"Driver01",nationality:"AT",race_number:1,team_id:"red-bull",role:"Stammfahrer",championship_points:0,penalty_points:0,wins:0,podiums:0},
    {id:2,display_name:"EARL Driver 02",discord_name:"Driver02",nationality:"AT",race_number:2,team_id:"ferrari",role:"Stammfahrer",championship_points:0,penalty_points:0,wins:0,podiums:0}
  ],
  races: [
    {id:1,round:1,name:"Großer Preis von Australien",circuit:"Albert Park",qualifying_date:"2026-03-07",qualifying_time:"20:00",race_date:"2026-03-08",race_time:"20:00",status:"Geplant",race_open:true,qualifying_open:true},
    {id:2,round:2,name:"Großer Preis von China",circuit:"Shanghai International Circuit",qualifying_date:"2026-03-14",qualifying_time:"20:00",race_date:"2026-03-15",race_time:"20:00",status:"Geplant",race_open:true,qualifying_open:true},
    {id:3,round:3,name:"Großer Preis von Japan",circuit:"Suzuka",qualifying_date:"2026-03-28",qualifying_time:"20:00",race_date:"2026-03-29",race_time:"20:00",status:"Geplant",race_open:true,qualifying_open:true}
  ],
  rules: [
    {id:1,chapter:"01",title:"Allgemeine Teilnahme",content:"Respektvolles Verhalten ist jederzeit verpflichtend. Entscheidungen der Ligaleitung sind zu befolgen.",sort_order:1},
    {id:2,chapter:"02",title:"Qualifying-Pflicht",content:"Wer sich zu einem Rennen anmeldet, muss am zugehörigen Qualifying teilnehmen. Ausnahmen müssen vorab durch die Ligaleitung genehmigt werden.",sort_order:2},
    {id:3,chapter:"03",title:"Fair Racing",content:"Absichtliche Kollisionen, gefährliches Wiederauffahren und unsportliches Verhalten werden sanktioniert.",sort_order:3}
  ]
};
