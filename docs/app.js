/* ============================================================
   whova-three — prototype app logic (vanilla JS, no build step)
   Fully interactive: actions mutate state and persist locally so
   the mockup behaves like the real app for demos.
   ============================================================ */
(function () {
  const D = window.DATA;
  const VERSION = 3; // bump when data shape / seeds change
  const state = { role: "attendee", view: "home", params: {}, stack: [] };

  const TABS = {
    attendee: [
      { id: "home", ico: "🏠", label: "Home" },
      { id: "agenda", ico: "📅", label: "Agenda" },
      { id: "board", ico: "💬", label: "Community" },
      { id: "people", ico: "👥", label: "People" },
      { id: "more", ico: "⋯", label: "More" },
    ],
    vendor: [
      { id: "v_dash", ico: "📊", label: "Dashboard" },
      { id: "v_leads", ico: "🧲", label: "Leads" },
      { id: "scan", ico: "📷", label: "Scan" },
      { id: "v_company", ico: "🏢", label: "Booth" },
      { id: "more", ico: "⋯", label: "More" },
    ],
    admin: [
      { id: "ad_dash", ico: "📊", label: "Overview" },
      { id: "ad_manage", ico: "🛠️", label: "Manage" },
      { id: "ad_mod", ico: "🚩", label: "Moderate" },
      { id: "ad_help", ico: "🎧", label: "Help Desk" },
      { id: "scan", ico: "📷", label: "Scan" },
    ],
  };
  const DEFAULT = { attendee: "home", vendor: "v_dash", admin: "ad_dash" };
  const ROLE_LABEL = { attendee: "Attendee", vendor: "Vendor", admin: "Admin" };
  const PALETTE = ["#2f6df6", "#12b3a6", "#f5a623", "#7a5cff", "#e0526b", "#3aa655"];

  /* ---------- persistence ---------- */
  function persist() { try { localStorage.setItem("whova3", JSON.stringify({ v: VERSION, d: D })); } catch (e) {} }
  function restore() {
    try {
      const raw = localStorage.getItem("whova3"); if (!raw) return;
      const o = JSON.parse(raw);
      if (o && o.v === VERSION && o.d) Object.keys(o.d).forEach((k) => { D[k] = o.d[k]; });
    } catch (e) {}
  }
  function ensureDefaults() {
    if (!Array.isArray(D.me.contactsReceived)) D.me.contactsReceived = [];
    if (!Array.isArray(D.bookmarks)) D.bookmarks = [];
    D.discussions.forEach((d) => { if (!Array.isArray(d.replyList)) d.replyList = []; });
    D.sessions.forEach((s) => {
      if (!Array.isArray(s.questions)) s.questions = s.id === "s1"
        ? [{ text: "Will the slides be shared afterward?", up: 8, official: "Yes — slides post to the Documents tab within 24h." }]
        : [];
    });
    D.photos.forEach((p) => { if (typeof p.liked !== "boolean") p.liked = false; });
    D.helpdeskQueue.forEach((t) => { if (!Array.isArray(t.msgs)) t.msgs = [{ from: "them", text: t.preview, time: t.time }]; });
  }

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const byId = (arr, id) => arr.find((x) => x.id === id);
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
  const avatar = (p, cls = "") => `<div class="avatar ${cls}" style="background:${p.color}">${p.initials || "?"}</div>`;
  const speakerNames = (ids) => ids.map((id) => byId(D.speakers, id)?.name).filter(Boolean).join(", ");
  const inits = (name) => name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
  function nowLabel() { try { return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); } catch (e) { return "just now"; } }
  const myVendor = () => byId(D.vendors, D.me.vendorCompanyId);
  function meIdentity() { return { author: D.me.name, initials: D.me.initials, color: D.me.color, role: "attendee" }; }
  function vendorIdentity() { const v = myVendor(); return { author: v.company, initials: v.initials, color: v.color, role: "vendor" }; }
  function identity() { return state.role === "vendor" ? vendorIdentity() : meIdentity(); }

  function pseudoQR(seed) {
    let hsh = 0;
    for (let i = 0; i < seed.length; i++) hsh = (hsh * 31 + seed.charCodeAt(i)) >>> 0;
    const rand = () => ((hsh = (hsh * 1103515245 + 12345) >>> 0) / 4294967296);
    const N = 21, cell = 8, rects = [];
    const finder = (ox, oy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const on = x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        if (on) rects.push([ox + x, oy + y]);
      }
    };
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && rand() > 0.55) rects.push([x, y]);
    const body = rects.map(([x, y]) => `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`).join("");
    return `<svg viewBox="0 0 ${N * cell} ${N * cell}" fill="var(--ink)">${body}</svg>`;
  }

  /* ============================================================
     SCREENS
     ============================================================ */
  const SCREENS = {};

  SCREENS.home = () => ({
    title: null, hero: true,
    body: `
      <div class="hero">
        <button class="role-pill" style="position:absolute;top:14px;right:16px" onclick="App.openRoles()">${roleIcon()} ${ROLE_LABEL[state.role]} ⇄</button>
        <div class="banner"><span class="pill">🔴 Live · Opening Keynote in Ballroom A</span></div>
        <h2>${esc(D.event.name)}</h2>
        <div class="meta"><span>📅 &nbsp;${esc(D.event.dates)}</span><span>📍 &nbsp;${esc(D.event.location)}</span><span>👥 &nbsp;${D.event.attendees.toLocaleString()} attendees</span></div>
      </div>
      <div class="section-title">Quick actions</div>
      <section><div class="grid">
        ${tile("agenda", "📅", "Agenda")}
        ${tile("schedule", "⭐", "My Schedule")}
        ${tile("speakers", "🎤", "Speakers")}
        ${tile("suppliers", "🏢", "Suppliers")}
        ${tile("board", "💬", "Discussion")}
        ${tile("helpdesk", "🎧", "Help Desk")}
        ${tile("photos", "📸", "Photos")}
        ${tile("contacts", "🪪", "Contacts")}
        ${tile("map", "🗺️", "Venue Map")}
        ${tile("expomap", "🛍️", "Expo Map")}
        ${tile("qr", "🔳", "My QR")}
        ${tile("more", "⋯", "More")}
      </div></section>
      <div class="section-title">Latest announcements <a onclick="App.nav('announcements')">See all</a></div>
      <section>${D.announcements.filter((a) => a.kind === "attendee").slice(0, 3).map(announceCard).join("")}</section>
      <div class="demo-note">Interactive prototype · your changes are saved on this device · whova-three</div>`,
  });

  const tile = (id, emoji, label, badge) =>
    `<button class="tile" onclick="App.nav('${id}')">${badge ? `<span class="badge">${badge}</span>` : ""}<span class="emoji">${emoji}</span><span class="label">${label}</span></button>`;

  const announceCard = (a) => `
    <div class="card row" style="align-items:flex-start">
      <div class="avatar sm" style="background:${a.kind === "vendor" ? "#0a7d72" : "var(--brand)"}">📢</div>
      <div class="grow"><h4>${esc(a.title)}</h4><div class="sub" style="white-space:normal">${esc(a.body)}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:6px">${esc(a.time)} · ${esc(a.who)}</div></div>
    </div>`;

  SCREENS.agenda = (p) => {
    const day = p.day ?? 0;
    const items = D.sessions.filter((s) => s.day === day);
    return {
      title: "Agenda",
      actions: `<button class="icon-btn" onclick="App.nav('schedule')">⭐</button>`,
      body: `
        <div class="daybar">${D.days.map((d, i) => `<button class="day ${i === day ? "active" : ""}" onclick="App.nav('agenda',{day:${i}})">${d}</button>`).join("")}</div>
        <section style="padding-top:12px">${items.map(sessionCard).join("") || `<div class="empty">No sessions this day.</div>`}</section>`,
    };
  };

  function sessionCard(s) {
    const starred = D.starred.includes(s.id);
    const conflict = starred && D.starred.some((id) => id !== s.id && conflicts(byId(D.sessions, id), s));
    return `
      <div class="card">
        <div class="session">
          <div class="rail"><div class="start">${s.start}</div><div class="end">${s.ampm}</div></div>
          <div class="track" style="background:${s.track}"></div>
          <div class="info" onclick="App.nav('session',{id:'${s.id}'})">
            <span class="tag" style="background:${s.tagBg};color:${s.tagInk}">${s.tag}</span>
            <h4>${esc(s.title)}</h4>
            <div class="room">📍 ${esc(s.room)} · ${s.start}–${s.end} ${s.ampm}</div>
            ${s.speakers.length ? `<div class="spk">🎤 ${esc(speakerNames(s.speakers))}</div>` : ""}
            ${conflict ? `<div class="conflict">⚠ Double-booked with another starred session</div>` : ""}
          </div>
          <button class="star ${starred ? "on" : ""}" onclick="App.toggleStar('${s.id}')">${starred ? "★" : "☆"}</button>
        </div>
      </div>`;
  }
  function conflicts(a, b) { return a && b && a.day === b.day && a.start === b.start; }

  SCREENS.session = (p) => {
    const s = byId(D.sessions, p.id);
    if (!s) return notFound();
    const starred = D.starred.includes(s.id);
    return {
      title: "Session", back: true,
      body: `
        <section class="pad">
          <span class="tag" style="background:${s.tagBg};color:${s.tagInk}">${s.tag}</span>
          <h2 style="margin:8px 0 6px;font-size:20px">${esc(s.title)}</h2>
          <div class="sub" style="white-space:normal">📍 ${esc(s.room)} · ${D.days[s.day]} · ${s.start}–${s.end} ${s.ampm}</div>
          <button class="btn ${starred ? "ghost" : ""} block" style="margin-top:14px" onclick="App.toggleStar('${s.id}')">${starred ? "★ In My Schedule — tap to remove" : "☆ Add to My Schedule"}</button>
          <div class="card" style="margin-top:14px"><p style="margin:0">${esc(s.desc)}</p></div>
          ${s.speakers.length ? `<div class="section-title">Speakers</div>${s.speakers.map((id) => personRow(byId(D.speakers, id), "speaker")).join("")}` : ""}
          <div class="section-title">Session Q&A · ${s.questions.length}</div>
          ${s.questions.map(qCard).join("") || `<div class="empty" style="padding:16px">No questions yet — ask the first one.</div>`}
          <div class="field" style="margin-top:8px"><textarea id="q-box" placeholder="Ask the speaker a question…"></textarea></div>
          <button class="btn block" onclick="App.askQuestion('${s.id}')">Submit question</button>
        </section>`,
    };
  };
  const qCard = (q) => `<div class="card"><div class="up" onclick="App.upvote(this)">▲ ${q.up}</div><p style="margin:8px 0 0">${esc(q.text)}</p>${q.official ? `<div class="official"><b>Official answer</b>${esc(q.official)}</div>` : ""}</div>`;

  function personRow(p, target) {
    if (!p) return "";
    return `<div class="card row tap" onclick="App.nav('${target}',{id:'${p.id}'})">${avatar(p)}<div class="grow"><h4>${esc(p.name)}</h4><div class="sub">${esc(p.title)}${p.company ? " · " + esc(p.company) : ""}</div></div><span style="color:var(--muted)">›</span></div>`;
  }

  SCREENS.schedule = () => {
    const items = D.sessions.filter((s) => D.starred.includes(s.id)).sort((a, b) => a.day - b.day);
    return {
      title: "My Schedule", back: true,
      body: `
        <section style="padding-top:14px">
          ${items.length ? items.map((s) => {
            const clash = items.some((o) => o.id !== s.id && conflicts(o, s));
            const alt = D.sessions.find((o) => o.id !== s.id && o.title === s.title);
            return sessionCard(s) + (clash ? `<div class="card" style="margin-top:-6px;background:#fff4e5;border:1px solid #f3d9a8"><div class="conflict" style="margin:0">⚠ Conflicts with another session at ${s.start} ${s.ampm}.${alt ? " A similar session is offered at another time." : ""}</div></div>` : "");
          }).join("") : `<div class="empty">No starred sessions yet.<br>Star sessions in the Agenda to build your schedule.</div>`}
        </section>
        <div class="demo-note">You'll get a push reminder 15 min before each starred session.</div>`,
    };
  };

  SCREENS.speakers = () => ({ title: "Speakers", back: true, body: `<section style="padding-top:14px">${D.speakers.map((s) => personRow(s, "speaker")).join("")}</section>` });
  SCREENS.speaker = (p) => { const s = byId(D.speakers, p.id); if (!s) return notFound(); return { title: "Speaker", back: true, body: profileBody(s, s.bio) }; };

  function profileBody(p, bio, extra = "") {
    return `<section class="pad" style="text-align:center">
      ${avatar(p, "lg")}<h2 style="margin:12px 0 2px">${esc(p.name)}</h2>
      <div class="sub">${esc(p.title || "")}${p.company ? " · " + esc(p.company) : ""}</div>
      ${bio ? `<div class="card" style="text-align:left;margin-top:16px"><p style="margin:0">${esc(bio)}</p></div>` : ""}
      ${extra}</section>`;
  }

  SCREENS.suppliers = () => ({
    title: "Suppliers", back: true,
    body: `<section style="padding-top:14px">${D.vendors.map((v) => `
      <div class="card row tap" onclick="App.nav('supplier',{id:'${v.id}'})">
        <div class="avatar" style="background:${v.color}">${v.initials}</div>
        <div class="grow"><h4>${esc(v.company)}${D.bookmarks.includes(v.id) ? " ⭐" : ""}</h4><div class="sub">Booth ${v.booth} · ${esc(v.cats.join(", "))}</div></div>
        <span style="color:var(--muted)">›</span></div>`).join("")}</section>`,
  });
  SCREENS.supplier = (p) => {
    const v = byId(D.vendors, p.id); if (!v) return notFound();
    const marked = D.bookmarks.includes(v.id);
    return {
      title: "Supplier", back: true,
      body: `<section class="pad" style="text-align:center">
        <div class="avatar lg" style="background:${v.color};margin:0 auto">${v.initials}</div>
        <h2 style="margin:12px 0 2px">${esc(v.company)}</h2>
        <div class="sub">Booth ${v.booth} · ${esc(v.mapLoc)}</div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:14px">
          <button class="btn" onclick="App.contactVendor('${v.id}')">Request contact</button>
          <button class="btn ghost" onclick="App.toggleBookmark('${v.id}')">${marked ? "★ Bookmarked" : "☆ Bookmark"}</button>
        </div>
        <div class="card" style="text-align:left;margin-top:16px"><p style="margin:0 0 10px">${esc(v.about)}</p>
          <div class="kv"><span class="k">Categories</span><span class="v">${esc(v.cats.join(", "))}</span></div>
          <div class="kv"><span class="k">Website</span><span class="v">${esc(v.site)}</span></div>
          <div class="kv"><span class="k">Reps</span><span class="v">${esc(v.reps.join(", "))}</span></div>
          <div class="kv" style="border:none"><span class="k">Booth</span><span class="v">${v.booth}</span></div>
        </div></section>`,
    };
  };

  /* ---------- Discussion board ---------- */
  SCREENS.board = (p) => {
    const cat = p.cat || "All";
    const list = D.discussions.filter((d) => cat === "All" || d.cat === cat).slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return {
      title: "Community",
      actions: `<button class="icon-btn" onclick="App.nav('newthread')">＋</button>`,
      body: `
        <div class="search"><input placeholder="Search discussions…" oninput="return false"></div>
        <div class="chip-row">${["All", ...D.categories].map((c) => `<button class="chip ${c === cat ? "active" : ""}" onclick="App.nav('board',{cat:'${c}'})">${c}</button>`).join("")}</div>
        <section style="padding-top:8px" class="board">${list.map(threadRow).join("") || `<div class="empty">No discussions in “${esc(cat)}” yet.<br>Tap ＋ to start one.</div>`}</section>`,
    };
  };
  const threadRow = (d) => `
    <div class="card tap" onclick="App.nav('thread',{id:'${d.id}'})">
      <div class="row" style="align-items:flex-start">
        <div class="grow">
          <h4>${d.pinned ? "📌 " : ""}${esc(d.title)}</h4>
          <div class="thread meta"><span class="tag">${esc(d.cat)}</span><span>${esc(d.author)}${d.role === "vendor" ? " · vendor" : ""}</span><span>· ${esc(d.time)}</span></div>
        </div>
        <div class="count">${d.replyList.length} 💬</div>
      </div>${d.official ? `<div class="official"><b>Official answer</b>${esc(d.official)}</div>` : ""}
    </div>`;

  SCREENS.thread = (p) => {
    const d = byId(D.discussions, p.id); if (!d) return notFound();
    return {
      title: "Thread", back: true,
      body: `<section class="pad">
        <span class="tag">${esc(d.cat)}</span><h2 style="margin:8px 0 4px;font-size:19px">${esc(d.title)}</h2>
        <div class="thread meta" style="margin-bottom:10px">${esc(d.author)}${d.role === "vendor" ? " · posting as vendor 🏢" : ""} · ${esc(d.time)}</div>
        <div class="card"><p style="margin:0 0 10px">${esc(d.body)}</p>
          <div style="display:flex;gap:8px"><span class="up" onclick="App.upvote(this)">▲ ${d.up}</span>
          <span class="up" onclick="App.toggleSub(this)">🔔 Subscribe</span>
          <span class="up" onclick="App.toast('Reported to moderators')">⚑ Report</span></div>
        </div>
        ${d.official ? `<div class="official"><b>Official answer</b>${esc(d.official)}</div>` : ""}
        <div class="section-title">${d.replyList.length} ${d.replyList.length === 1 ? "reply" : "replies"}</div>
        <div id="reply-list">${d.replyList.map(replyCard).join("")}</div>
        <div class="field" style="margin-top:8px"><textarea id="reply-box" placeholder="Write a reply…"></textarea></div>
        <div class="thread meta" style="margin:-4px 2px 8px">Posting as <b style="margin-left:4px">${esc(identity().author)}</b>${state.role === "vendor" ? " 🏢" : ""}</div>
        <button class="btn block" onclick="App.postReply('${d.id}')">Post reply</button>
      </section>`,
    };
  };
  const replyCard = (r) => `
    <div class="card" ${r.mine ? 'style="border:1px solid var(--brand-tint);background:var(--brand-tint)"' : ""}>
      <div class="row"><div class="avatar sm" style="background:${r.color}">${r.initials}</div>
      <div class="grow"><b>${esc(r.author)}</b>${r.role === "vendor" ? ' <span class="tag" style="font-size:9px">vendor</span>' : ""} <span style="color:var(--muted);font-size:12px">· ${esc(r.time)}</span></div></div>
      <p style="margin:8px 0 0">${esc(r.text)}</p>
    </div>`;

  SCREENS.newthread = () => ({
    title: "New thread", back: true,
    body: `<section class="pad">
      <div class="field"><label>Title</label><input id="nt-title" placeholder="Keep it short and clear" oninput="App.similar(this.value)"></div>
      <div id="nt-similar"></div>
      <div class="field"><label>Category</label><select id="nt-cat">${D.categories.map((c) => `<option>${c}</option>`).join("")}</select></div>
      <div class="field"><label>Post</label><textarea id="nt-post" placeholder="What do you want to discuss?"></textarea></div>
      <div class="field"><label>Post as</label><select id="nt-as"><option value="me">${esc(D.me.name)} (you)</option><option value="vendor">${esc(myVendor().company)} (vendor)</option></select></div>
      <button class="btn block" onclick="App.createThread()">Post thread</button>
    </section>`,
  });

  /* ---------- People / contact exchange ---------- */
  SCREENS.people = () => ({
    title: "Attendees",
    body: `<div class="search"><input placeholder="Search ${D.event.attendees.toLocaleString()} attendees…" oninput="return false"></div>
      <section style="padding-top:12px">${D.attendees.map((a) => `
        <div class="card row">${avatar(a)}<div class="grow tap" onclick="App.nav('person',{id:'${a.id}'})"><h4>${esc(a.name)}${a.isVendor ? " 🏢" : ""}</h4><div class="sub">${esc(a.title)} · ${esc(a.company)}</div></div>
        <button class="btn ghost sm" onclick="App.requestContact('${a.id}')">${a.isVendor ? "Get card" : "Say hi 👋"}</button></div>`).join("")}</section>`,
  });
  SCREENS.person = (p) => {
    const a = byId(D.attendees, p.id); if (!a) return notFound();
    return { title: "Profile", back: true, body: profileBody(a, a.isVendor ? "Vendor representative — requesting contact shares their company's public profile." : "", `<button class="btn block" style="margin-top:16px" onclick="App.requestContact('${a.id}')">${a.isVendor ? "Get company card" : "Request contact info"}</button>`) };
  };
  SCREENS.contacts = () => ({
    title: "My Contacts", back: true,
    body: `<section style="padding-top:14px">${D.me.contactsReceived.length ? D.me.contactsReceived.map((c) => `
      <div class="card"><div class="row"><div class="avatar sm" style="background:${c.color || "#2f6df6"}">${esc(c.initials || inits(c.name))}</div>
      <div class="grow"><h4>${esc(c.name)}</h4><div class="sub">${esc(c.fields.join(" · "))}</div></div>
      <button class="btn ghost sm" onclick="App.toast('Saved to phone Contacts (demo)')">＋ Save</button></div></div>`).join("")
      : `<div class="empty">No contacts yet.<br>Tap “Request contact” on an attendee or vendor.</div>`}</section>`,
  });

  /* ---------- Photos ---------- */
  SCREENS.photos = () => ({
    title: "Photo Gallery", back: true,
    actions: `<button class="icon-btn" onclick="App.uploadSheet()">＋</button>`,
    body: `<div class="photo-grid">${D.photos.map((ph) => `
      <div class="photo"><div class="img" style="background:${ph.color}22;color:${ph.color}">${ph.emoji}</div>
        <div class="cap">${esc(ph.caption)}<div class="likes"><span onclick="App.like('${ph.id}')">${ph.liked ? "❤️" : "🤍"} ${ph.likes}</span><span onclick="App.reportPhoto('${ph.id}')">⚑</span></div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">${esc(ph.author)}</div></div></div>`).join("") || `<div class="empty" style="grid-column:1/-1">No photos yet.</div>`}</div>
      <div class="demo-note">Photos are subject to admin approval &amp; removal.</div>`,
  });

  SCREENS.announcements = () => ({ title: "Announcements", back: true, body: `<section style="padding-top:14px">${D.announcements.map(announceCard).join("")}</section>` });

  /* ---------- Help Desk ---------- */
  SCREENS.helpdesk = () => ({
    title: "Help Desk", back: true,
    actions: `<button class="icon-btn" onclick="App.nav('newhelp')">＋</button>`,
    body: `<div class="demo-note" style="text-align:left;padding:14px 16px 4px">Personal questions, registration, or account issues. For questions others may share, try the <a onclick="App.nav('board')" style="color:var(--role);font-weight:700">Discussion Board</a>.</div>
      <section>${D.helpdeskMine.map((c) => `
        <div class="card tap row" onclick="App.nav('helpchat',{id:'${c.id}'})">
          <div class="avatar sm" style="background:var(--role)">🎧</div>
          <div class="grow"><h4>${esc(c.subject)}</h4><div class="sub">${esc(c.cat)} · ${esc(c.msgs[c.msgs.length - 1].text)}</div></div>
          <span class="status ${c.status}">${c.status}</span></div>`).join("") || `<div class="empty">No conversations yet.</div>`}
        <button class="btn block" style="margin-top:6px" onclick="App.nav('newhelp')">＋ New conversation</button></section>`,
  });
  SCREENS.helpchat = (p) => {
    const c = byId(D.helpdeskMine, p.id); if (!c) return notFound();
    return {
      title: c.cat, back: true,
      body: `<section class="pad">${c.msgs.map((m) => `
        <div class="row" style="margin-bottom:12px;${m.from === "me" ? "flex-direction:row-reverse" : ""}">
          <div class="avatar sm" style="background:${m.from === "me" ? "var(--brand)" : "var(--role)"}">${m.from === "me" ? D.me.initials : "🎧"}</div>
          <div class="card" style="margin:0;max-width:78%;background:${m.from === "me" ? "var(--brand-tint)" : "var(--card)"}"><p style="margin:0">${esc(m.text)}</p><div style="font-size:10px;color:var(--muted);margin-top:4px">${esc(m.time)}</div></div>
        </div>`).join("")}
        <div class="field"><textarea id="hc-box" placeholder="Reply to RSA…"></textarea></div>
        <button class="btn block" onclick="App.sendHelp('${c.id}')">Send</button></section>`,
    };
  };
  SCREENS.newhelp = () => ({
    title: "New conversation", back: true,
    body: `<section class="pad">
      <div class="field"><label>Category</label><select id="nh-cat">${["Registration", "Schedule", "Venue", "Technical Issue", "General Question"].map((c) => `<option>${c}</option>`).join("")}</select></div>
      <div class="field"><label>Message</label><textarea id="nh-msg" placeholder="How can RSA help?" oninput="App.helpSuggest(this.value)"></textarea></div>
      <div id="hd-suggest"></div>
      <button class="btn ghost block" style="margin-bottom:10px" onclick="App.toast('Photo attached (demo)')">📎 Attach photo / screenshot</button>
      <button class="btn block" onclick="App.createHelp()">Send to RSA</button>
    </section>`,
  });

  /* ---------- Maps ---------- */
  SCREENS.map = () => ({
    title: "Venue Map", back: true,
    body: `<div class="mapbox">
        <div class="booth" style="top:20px;left:24px">Ballroom A</div>
        <div class="booth" style="top:20px;right:24px;background:#12b3a6">Ballroom C</div>
        <div class="booth" style="top:110px;left:40%">Room 204</div>
        <div class="booth" style="bottom:60px;left:24px;background:#f5a623">Room 118</div>
        <div class="booth" style="bottom:20px;right:24px;background:#7a5cff">Registration</div>
      </div><div class="demo-note">Session rooms link to their agenda entries. Pinch-to-zoom in the real app.</div>`,
  });
  SCREENS.expomap = () => ({
    title: "Expo / Trade-Show Map", back: true,
    body: `<div class="mapbox">
        ${D.vendors.map((v, i) => `<div class="booth" style="top:${30 + i * 60}px;left:${20 + (i % 2) * 150}px;background:${v.color}" onclick="App.nav('supplier',{id:'${v.id}'})">${v.booth} · ${v.initials}</div>`).join("")}
      </div><div class="demo-note">Tap a booth to open the supplier profile.</div>`,
  });

  /* ---------- Profile / notifications / QR ---------- */
  SCREENS.profile = () => {
    const m = D.me;
    return {
      title: "My Profile", back: true,
      body: `${profileBody(m, m.bio)}
        <section class="pad">
          <div class="section-title">Privacy — what others can request</div>
          ${["name", "email", "phone", "company"].map((k) => `<div class="card row"><div class="grow"><h4 style="text-transform:capitalize">${k}</h4></div><button class="toggle ${m.privacy[k] ? "on" : ""}" onclick="App.togglePriv('${k}',this)"><span class="knob"></span></button></div>`).join("")}
          <button class="btn ghost block" style="margin-top:6px" onclick="App.nav('qr')">🔳 Show my event QR code</button>
        </section>`,
    };
  };
  SCREENS.notif = () => ({
    title: "Notification Settings", back: true,
    body: `<section style="padding-top:14px">${D.notifCategories.map((n) => `
      <div class="card row"><div class="grow"><h4>${esc(n.label)}</h4>${n.locked ? `<div class="sub">Always on — safety</div>` : ""}</div>
      <button class="toggle ${n.on ? "on" : ""}" ${n.locked ? "disabled style=opacity:.5" : `onclick="App.toggleNotif('${n.key}',this)"`}><span class="knob"></span></button></div>`).join("")}
      <div class="demo-note">You receive alerts for every assigned role, even while viewing another role.</div></section>`,
  });
  SCREENS.qr = () => ({
    title: "My Event QR", back: true,
    body: `<div class="qr-wrap">
      <p class="sub">One code for check-in, training, vendor scans &amp; admin lookup.</p>
      <div class="qr">${pseudoQR(D.me.id)}</div>
      <div class="qr-id">${esc(D.me.id)}</div>
      <div class="warn" style="text-align:left;margin:16px 0 0">🔒 This code contains only your attendee ID — never your personal info. What a scanner sees depends on who they are.</div>
    </div>`,
  });

  /* ---------- MORE menu ---------- */
  SCREENS.more = () => {
    const links = {
      attendee: [
        ["profile", "👤", "My Profile", "Bio, company & privacy"],
        ["qr", "🔳", "My QR Code", D.me.id],
        ["contacts", "🪪", "My Contacts", D.me.contactsReceived.length + " saved"],
        ["notif", "🔔", "Notification Settings", "Mute categories"],
        ["speakers", "🎤", "Speakers", ""],
        ["suppliers", "🏢", "Supplier Directory", ""],
        ["photos", "📸", "Photo Gallery", ""],
        ["map", "🗺️", "Venue Map", ""],
        ["helpdesk", "🎧", "Help Desk (Contact RSA)", ""],
      ],
      vendor: [
        ["v_announce", "📢", "Vendor Announcements", ""],
        ["v_company", "🏢", "Company Profile", ""],
        ["qr", "🔳", "My QR Code", ""],
        ["notif", "🔔", "Notification Settings", ""],
        ["profile", "👤", "My Profile", ""],
      ],
    };
    const set = links[state.role] || links.attendee;
    return {
      title: "More",
      body: `<div class="pad"><div class="card row" style="background:var(--role);color:#fff" onclick="App.openRoles()">
          <div class="avatar sm" style="background:rgba(255,255,255,.25)">${D.me.initials}</div>
          <div class="grow"><h4 style="color:#fff">${esc(D.me.name)}</h4><div style="font-size:12px;opacity:.9">Viewing as ${ROLE_LABEL[state.role]} · tap to switch role</div></div>
          <span>⇄</span></div></div>
        <div class="list-tap">${set.map(([id, ico, t, sub]) => `<div class="item" onclick="App.nav('${id}')"><span class="ico">${ico}</span><div class="grow"><h4>${t}</h4>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}</div><span class="chev">›</span></div>`).join("")}</div>
        <div class="pad"><button class="btn danger block" onclick="App.resetDemo()">↺ Reset demo data</button></div>`,
    };
  };

  /* ============ VENDOR ============ */
  SCREENS.v_dash = () => {
    const v = myVendor();
    return {
      title: "Vendor Dashboard",
      body: `<div class="stats">
          <div class="stat"><div class="v">${D.leads.length}</div><div class="l">Leads captured</div><div class="s">this device</div></div>
          <div class="stat"><div class="v">${v.leads}</div><div class="l">Total leads</div><div class="s">all reps</div></div>
          <div class="stat"><div class="v">Booth ${v.booth}</div><div class="l">${esc(v.mapLoc)}</div></div>
          <div class="stat"><div class="v">${v.reps.length}</div><div class="l">Reps active</div></div>
        </div>
        <div class="section-title">Quick actions</div>
        <section><div class="grid">${tile("scan", "📷", "Scan lead")}${tile("v_leads", "🧲", "My leads")}${tile("v_company", "🏢", "Edit booth")}${tile("v_announce", "📢", "News")}</div></section>
        <div class="section-title">Recent leads <a onclick="App.nav('v_leads')">See all</a></div>
        <section>${D.leads.slice(0, 3).map(leadRow).join("") || `<div class="empty">No leads yet — tap Scan lead.</div>`}</section>`,
    };
  };
  const leadRow = (l) => `
    <div class="card tap row" onclick="App.nav('v_lead',{id:'${l.id}'})">
      <div class="avatar sm" style="background:#0a7d72">${inits(l.name)}</div>
      <div class="grow"><h4>${esc(l.name)}</h4><div class="sub">${esc(l.store)} · ${esc(l.time)}</div></div>
      <span class="tag" style="background:${l.qual === "Hot" ? "#fde3e8" : l.qual === "Warm" ? "#fff0d6" : "#eef1f6"};color:${l.qual === "Hot" ? "#b13251" : l.qual === "Warm" ? "#a56a00" : "#6b7789"}">${l.qual}</span></div>`;

  SCREENS.v_leads = () => ({
    title: "My Leads",
    actions: `<button class="icon-btn" onclick="App.exportLeads()">⤓</button>`,
    body: `<div class="demo-note" style="text-align:left;padding:12px 16px 2px">${D.leads.length} leads · duplicates auto-merged · each stamped with time &amp; rep.</div>
      <section>${D.leads.map(leadRow).join("") || `<div class="empty">No leads yet.</div>`}</section>
      <div class="pad"><button class="btn block" onclick="App.exportLeads()">⤓ Export all leads (CSV)</button></div>`,
  });
  SCREENS.v_lead = (p) => {
    const l = byId(D.leads, p.id); if (!l) return notFound();
    return {
      title: "Lead", back: true,
      body: `<section class="pad">
        <div style="text-align:center"><div class="avatar lg" style="background:#0a7d72;margin:0 auto">${inits(l.name)}</div><h2 style="margin:12px 0 2px">${esc(l.name)}</h2><div class="sub">${esc(l.store)}</div></div>
        <div class="card" style="margin-top:16px">
          <div class="kv"><span class="k">Shared contact</span><span class="v">${esc(l.contact)}</span></div>
          <div class="kv"><span class="k">Scanned</span><span class="v">${esc(l.time)}</span></div>
          <div class="kv" style="border:none"><span class="k">By rep</span><span class="v">${esc(l.rep)}</span></div>
        </div>
        <div class="field" style="margin-top:14px"><label>Qualification</label><select id="ld-qual"><option ${l.qual === "Hot" ? "selected" : ""}>Hot</option><option ${l.qual === "Warm" ? "selected" : ""}>Warm</option><option ${l.qual === "Cold" ? "selected" : ""}>Cold</option></select></div>
        <div class="field"><label>Notes</label><textarea id="ld-note">${esc(l.note)}</textarea></div>
        <button class="btn block" onclick="App.saveLead('${l.id}')">Save lead</button></section>`,
    };
  };
  SCREENS.v_company = () => {
    const v = myVendor();
    return {
      title: "Company / Booth",
      body: `<section class="pad" style="text-align:center"><div class="avatar lg" style="background:${v.color};margin:0 auto">${v.initials}</div><h2 style="margin:12px 0 2px">${esc(v.company)}</h2><div class="sub">Booth ${v.booth} · ${esc(v.mapLoc)}</div></section>
        <section><div class="field"><label>About</label><textarea id="co-about">${esc(v.about)}</textarea></div>
        <div class="field"><label>Product categories</label><input id="co-cats" value="${esc(v.cats.join(", "))}"></div>
        <div class="field"><label>Website</label><input id="co-site" value="${esc(v.site)}"></div>
        <div class="field"><label>Public contact info (approved for sharing)</label><input id="co-contact" placeholder="sales@company.com"></div>
        <button class="btn block" onclick="App.saveCompany()">Save profile</button></section>`,
    };
  };
  SCREENS.v_announce = () => ({
    title: "Vendor Announcements", back: true,
    body: `<section style="padding-top:14px">${D.announcements.filter((a) => a.kind === "vendor").map(announceCard).join("") || `<div class="empty">No vendor announcements.</div>`}</section>`,
  });

  /* ============ ADMIN ============ */
  SCREENS.ad_dash = () => ({
    title: "Event Overview",
    body: `<div class="stats">${D.reports.map((r) => `<div class="stat"><div class="v" style="color:${r.color}">${r.value}</div><div class="l">${esc(r.label)}</div><div class="s">${esc(r.sub)}</div></div>`).join("")}</div>
      <div class="section-title">Admin tools</div>
      <section><div class="grid">
        ${tile("ad_manage", "🛠️", "Manage")}${tile("ad_mod", "🚩", "Moderate")}${tile("ad_help", "🎧", "Help Desk")}${tile("scan", "📷", "Scan QR")}
        ${tile("ad_users", "👥", "Users")}${tile("ad_training", "🎓", "Training")}${tile("ad_reports", "📈", "Reports")}${tile("ad_audit", "🧾", "Audit")}
      </div></section>
      <div class="section-title">Recent activity</div>
      <section>${D.auditLog.slice(0, 3).map(auditRow).join("")}</section>`,
  });
  const auditRow = (a) => `<div class="card row"><div class="avatar sm" style="background:#5b3fd6">🧾</div><div class="grow"><h4 style="font-size:14px">${esc(a.what)}</h4><div class="sub">${esc(a.who)} · ${esc(a.time)}</div></div></div>`;

  SCREENS.ad_manage = () => ({
    title: "Manage",
    body: `<div class="list-tap" style="margin-top:14px">${[
      ["ad_broadcast", "📢", "Send announcement / push", "Now or scheduled"],
      ["agenda", "📅", "Manage agenda", "Sessions & rooms"],
      ["speakers", "🎤", "Manage speakers", ""],
      ["suppliers", "🏢", "Manage suppliers", "Booths & profiles"],
      ["ad_users", "👥", "Users & roles", "Assign & dual-role"],
      ["ad_training", "🎓", "Training management", "Rosters & attendance"],
      ["ad_maps", "🗺️", "Maps & venue", "Upload & link rooms"],
      ["ad_reports", "📈", "Reporting", "Export event data"],
      ["ad_system", "⚙️", "System controls", "Notifications, backup"],
      ["ad_audit", "🧾", "Audit log", ""],
    ].map(([id, ico, t, sub]) => `<div class="item" onclick="App.nav('${id}')"><span class="ico">${ico}</span><div class="grow"><h4>${t}</h4>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}</div><span class="chev">›</span></div>`).join("")}</div>`,
  });

  SCREENS.ad_broadcast = () => ({
    title: "Send announcement", back: true,
    body: `<section class="pad">
      <div class="field"><label>Audience</label><select id="bc-aud"><option>All attendees</option><option>Vendors only</option><option>Speakers</option><option>Admins</option></select></div>
      <div class="field"><label>Category</label><select id="bc-cat"><option>General</option><option>Session reminder</option><option>Vendor update</option><option>Emergency alert</option></select></div>
      <div class="field"><label>Title</label><input id="bc-title" placeholder="Short headline"></div>
      <div class="field"><label>Message</label><textarea id="bc-msg" placeholder="What do you want to send?"></textarea></div>
      <div class="field"><label>When</label><select id="bc-when"><option>Send now</option><option>Schedule for later</option></select></div>
      <button class="btn block" onclick="App.sendBroadcast()">Send push notification</button></section>`,
  });

  SCREENS.ad_mod = () => ({
    title: "Moderation",
    body: `<div class="demo-note" style="text-align:left;padding:12px 16px 2px">Reported content queue · ${D.reported.length} item${D.reported.length === 1 ? "" : "s"}</div>
      <section>${D.reported.map(modItem).join("") || `<div class="empty">🎉 Queue is clear — nothing reported.</div>`}</section>
      <div class="section-title">Bulk thread controls</div>
      <div class="list-tap">
        <div class="item"><span class="ico">📌</span><div class="grow"><h4>Pinned threads</h4><div class="sub">${D.discussions.filter((d) => d.pinned).length} pinned</div></div><span class="chev">›</span></div>
        <div class="item"><span class="ico">🔒</span><div class="grow"><h4>Locked threads</h4><div class="sub">0 locked</div></div><span class="chev">›</span></div>
      </div>`,
  });
  const modItem = (r) => `<div class="card"><div class="row"><span style="font-size:22px">${r.ico}</span><div class="grow"><h4 style="text-transform:capitalize">${r.kind}</h4><div class="sub" style="white-space:normal">${esc(r.text)}</div></div><span class="status open">${esc(r.flag)}</span></div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn danger sm" onclick="App.moderate('${r.id}','remove')">Remove</button><button class="btn ghost sm" onclick="App.moderate('${r.id}','dismiss')">Dismiss</button><button class="btn ghost sm" onclick="App.toast('User warned (demo)')">Warn user</button></div></div>`;

  SCREENS.ad_help = (p) => {
    const f = p.filter || "All";
    const list = D.helpdeskQueue.filter((t) => f === "All" || (f === "Unassigned" && !t.assignee) || (f === "Mine" && t.assignee === "You") || (f === "Resolved" && t.status === "resolved"));
    return {
      title: "Help Desk Queue",
      body: `<div class="chip-row">${["All", "Unassigned", "Mine", "Resolved"].map((c) => `<button class="chip ${c === f ? "active" : ""}" onclick="App.nav('ad_help',{filter:'${c}'})">${c}</button>`).join("")}</div>
        <section style="padding-top:8px">${list.map((t) => `
          <div class="card tap row" onclick="App.nav('ad_ticket',{id:'${t.id}'})">
            <div class="avatar sm" style="background:#5b3fd6">${inits(t.attendee)}</div>
            <div class="grow"><h4>${esc(t.attendee)}</h4><div class="sub">${esc(t.cat)} · ${esc(t.msgs[t.msgs.length - 1].text)}</div>${t.assignee ? `<div class="sub">👤 ${esc(t.assignee)}</div>` : ""}</div>
            <span class="status ${t.status}">${t.status}</span></div>`).join("") || `<div class="empty">Nothing here.</div>`}</section>`,
    };
  };
  SCREENS.ad_ticket = (p) => {
    const t = byId(D.helpdeskQueue, p.id); if (!t) return notFound();
    return {
      title: "Ticket", back: true,
      body: `<section class="pad">
        <div class="row"><div class="avatar" style="background:#5b3fd6">${inits(t.attendee)}</div><div class="grow"><h4>${esc(t.attendee)}</h4><div class="sub">${esc(t.cat)} · ${esc(t.time)}${t.assignee ? " · 👤 " + esc(t.assignee) : ""}</div></div><span class="status ${t.status}">${t.status}</span></div>
        <div style="margin-top:14px">${t.msgs.map((m) => `
          <div class="row" style="margin-bottom:12px;${m.from === "staff" ? "flex-direction:row-reverse" : ""}">
            <div class="avatar sm" style="background:${m.from === "staff" ? "var(--role)" : "#5b3fd6"}">${m.from === "staff" ? "🎧" : inits(t.attendee)}</div>
            <div class="card" style="margin:0;max-width:78%;${m.from === "staff" ? "background:var(--brand-tint)" : ""}"><p style="margin:0">${esc(m.text)}</p><div style="font-size:10px;color:var(--muted);margin-top:4px">${esc(m.time)}</div></div></div>`).join("")}</div>
        <div style="display:flex;gap:8px;margin:4px 0 12px"><button class="btn sm" onclick="App.assignTicket('${t.id}')">Assign to me</button><button class="btn ghost sm" onclick="App.resolveTicket('${t.id}')">${t.status === "resolved" ? "Reopen" : "Resolve"}</button></div>
        <div class="field"><label>Internal note (staff only)</label><textarea id="tk-note" placeholder="Private note…"></textarea></div>
        <div class="field"><label>Reply to attendee</label><textarea id="tk-reply" placeholder="Type a reply…"></textarea></div>
        <button class="btn block" onclick="App.replyTicket('${t.id}')">Send reply</button>
        <div class="demo-note">If the attendee replies after resolution, the ticket auto-reopens.</div></section>`,
    };
  };

  SCREENS.ad_users = () => ({
    title: "Users & Roles", back: true,
    body: `<div class="search"><input placeholder="Search users…" oninput="return false"></div>
      <section style="padding-top:12px">
        <div class="card"><div class="row">${avatar(D.me)}<div class="grow"><h4>${esc(D.me.name)}</h4><div class="sub">${esc(D.me.company)}</div></div></div>
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${["Attendee", "Vendor", "Admin"].map((r) => `<span class="tag" style="background:var(--brand-tint);color:var(--brand-dark)">${r} ✓</span>`).join("")}</div>
          <button class="btn ghost sm" style="margin-top:10px" onclick="App.toast('Role editor (demo)')">Edit roles</button></div>
        ${D.attendees.slice(0, 4).map((a) => `<div class="card row">${avatar(a)}<div class="grow"><h4>${esc(a.name)}</h4><div class="sub">${a.isVendor ? "Attendee, Vendor" : "Attendee"}</div></div><button class="btn ghost sm" onclick="App.toast('Assign role (demo)')">Roles</button></div>`).join("")}
      </section><div class="demo-note">Dual-role users keep one account, one login, one QR code.</div>`,
  });
  SCREENS.ad_training = () => ({
    title: "Training Management", back: true,
    body: `<section style="padding-top:14px">
      <div class="card"><div class="row"><div class="grow"><h4>AI at the Counter</h4><div class="sub">Room 204 · 10:30 AM</div></div><span class="tag">42 / 60</span></div>
        <div style="display:flex;gap:8px;margin-top:12px"><button class="btn ghost sm" onclick="App.toast('Roster opened (demo)')">Roster</button><button class="btn ghost sm" onclick="App.toast('Attendance exported (demo)')">Export</button><button class="btn ghost sm" onclick="App.nav('scan')">Door scan</button></div></div>
      <div class="card"><div class="row"><div class="grow"><h4>Endcap Strategy</h4><div class="sub">Room 118 · 10:30 AM</div></div><span class="tag">31 / 40</span></div>
        <div style="display:flex;gap:8px;margin-top:12px"><button class="btn ghost sm" onclick="App.toast('Roster opened (demo)')">Roster</button><button class="btn ghost sm" onclick="App.toast('Fixed check-in (demo)')">Fix check-in</button></div></div>
      </section>`,
  });
  SCREENS.ad_maps = () => ({ title: "Maps & Venue", back: true, body: SCREENS.expomap().body + `<div class="pad"><button class="btn block" onclick="App.toast('Upload new map (demo)')">⤒ Upload / replace map</button></div>` });
  SCREENS.ad_reports = () => ({
    title: "Reporting", back: true,
    body: `<div class="stats">${D.reports.map((r) => `<div class="stat"><div class="v" style="color:${r.color}">${r.value}</div><div class="l">${esc(r.label)}</div><div class="s">${esc(r.sub)}</div></div>`).join("")}</div>
      <div class="pad"><button class="btn block" onclick="App.exportLeads()">⤓ Export event data (CSV)</button></div>`,
  });
  SCREENS.ad_system = () => ({
    title: "System Controls", back: true,
    body: `<div class="list-tap" style="margin-top:14px">
      <div class="item" onclick="App.nav('notif')"><span class="ico">🔔</span><div class="grow"><h4>Notification categories</h4></div><span class="chev">›</span></div>
      <div class="item" onclick="App.nav('ad_broadcast')"><span class="ico">🕓</span><div class="grow"><h4>Scheduled announcements</h4><div class="sub">View delivery status</div></div><span class="chev">›</span></div>
      <div class="item" onclick="App.nav('ad_audit')"><span class="ico">🧾</span><div class="grow"><h4>Audit log</h4></div><span class="chev">›</span></div>
      <div class="item" onclick="App.toast('Backup started (demo)')"><span class="ico">💾</span><div class="grow"><h4>Backup &amp; recovery</h4><div class="sub">Last backup 3:00 AM</div></div><span class="chev">›</span></div>
    </div><div class="pad"><button class="btn danger block" onclick="App.resetDemo()">↺ Reset demo data</button></div>`,
  });
  SCREENS.ad_audit = () => ({ title: "Audit Log", back: true, body: `<section style="padding-top:14px">${D.auditLog.map(auditRow).join("")}</section>` });

  /* ---------- SCAN ---------- */
  SCREENS.scan = () => {
    if (state.role === "vendor") {
      return { title: "Scan Lead", body: viewfinder("Point at an attendee's QR to capture a lead"), footer: `<button class="btn block" onclick="App.scanResult('lead')">Simulate scan</button>` };
    }
    return {
      title: "Scan QR",
      body: `<div class="chip-row"><button class="chip active" id="scan-reg" onclick="App.scanMode('reg')">Check-in</button><button class="chip" id="scan-train" onclick="App.scanMode('train')">Training</button><button class="chip" id="scan-look" onclick="App.scanMode('look')">Lookup</button></div>
        ${viewfinder("Universal QR — result depends on the mode above")}`,
      footer: `<button class="btn block" onclick="App.scanResult(App._scanMode||'reg')">Simulate scan</button>`,
    };
  };
  const viewfinder = (hint) => `<div class="viewfinder"><div class="frame"></div><div class="scanline"></div><div class="hint">${esc(hint)}</div></div>
    <div class="demo-note">Camera is simulated in this prototype. In the app this uses the device camera.</div>`;

  function notFound() { return { title: "Not found", back: true, body: `<div class="empty">Item not found.</div>` }; }

  /* ============================================================
     Router / render
     ============================================================ */
  function render(opts = {}) {
    const def = SCREENS[state.view] || SCREENS[DEFAULT[state.role]];
    const s = def(state.params);
    const tabs = TABS[state.role];
    const isTab = tabs.some((t) => t.id === state.view);
    const showBack = s.back || (!isTab && !s.hero);

    let header = "";
    if (!s.hero) {
      header = `<div class="topbar">
        ${showBack ? `<span class="back" onclick="App.back()">‹</span>` : ""}
        <h1>${esc(s.title || D.event.name)}</h1>
        ${s.actions || ""}
        <button class="role-pill" onclick="App.openRoles()">${roleIcon()} ${ROLE_LABEL[state.role]} ⇄</button>
      </div>`;
    }

    const area = document.getElementById("scrollArea");
    area.innerHTML = header + s.body;
    area.scrollTo({ top: opts.bottom ? area.scrollHeight : 0 });
    document.getElementById("footer").innerHTML = s.footer || "";
    document.getElementById("tabbar").innerHTML = tabs.map((t) =>
      `<button class="tab ${state.view === t.id ? "active" : ""}" onclick="App.nav('${t.id}')"><span class="ico">${t.ico}</span>${t.label}</button>`).join("");
  }
  const roleIcon = () => ({ attendee: "🎟️", vendor: "🏢", admin: "🛡️" }[state.role]);

  /* ============================================================
     Public API
     ============================================================ */
  const App = {
    _scanMode: "reg",
    nav(view, params = {}, opts = {}) {
      if (view !== state.view || JSON.stringify(params) !== JSON.stringify(state.params)) {
        state.stack.push({ view: state.view, params: state.params });
      }
      state.view = view; state.params = params; render(opts);
    },
    back() {
      const prev = state.stack.pop();
      if (prev) { state.view = prev.view; state.params = prev.params; render(); }
      else { state.view = DEFAULT[state.role]; state.params = {}; render(); }
    },
    setRole(role) {
      state.role = role; document.body.className = "role-" + role;
      state.view = DEFAULT[role]; state.params = {}; state.stack = [];
      closeSheet(); render();
    },
    openRoles() {
      const opts = D.me.roles.map((r) => `<div class="check ${state.role === r ? "on" : ""}" onclick="App.setRole('${r}')">
        <div class="box">${state.role === r ? "✓" : ""}</div><div class="grow"><b>${ROLE_LABEL[r]} View</b><div class="sub">${roleDesc(r)}</div></div></div>`).join("");
      openSheet(`<h3>Switch role</h3><p class="sub">One account, one login, one QR. You still get notifications for every role.</p>${opts}`);
    },

    toggleStar(id) { const i = D.starred.indexOf(id); if (i >= 0) D.starred.splice(i, 1); else D.starred.push(id); persist(); render(); },
    upvote(el) { const n = parseInt(el.textContent.replace(/\D/g, "")) + 1; el.textContent = "▲ " + n; el.style.color = "var(--role)"; },
    toggleSub(el) { const on = el.dataset.on === "1"; el.dataset.on = on ? "0" : "1"; el.textContent = on ? "🔔 Subscribe" : "🔔 Subscribed"; el.style.color = on ? "" : "var(--role)"; },
    togglePriv(k, el) { D.me.privacy[k] = !D.me.privacy[k]; el.classList.toggle("on"); persist(); },
    toggleNotif(k, el) { const n = D.notifCategories.find((x) => x.key === k); n.on = !n.on; el.classList.toggle("on"); persist(); },
    toggleBookmark(id) { const i = D.bookmarks.indexOf(id); if (i >= 0) D.bookmarks.splice(i, 1); else D.bookmarks.push(id); persist(); render(); toast(i >= 0 ? "Removed bookmark" : "Bookmarked"); },

    // Discussion
    postReply(id) {
      const d = byId(D.discussions, id); const t = val("reply-box").trim();
      if (!t) { toast("Write a reply first"); return; }
      d.replyList.push({ ...identity(), text: t, time: nowLabel(), mine: true });
      persist(); render({ bottom: true }); toast("Reply posted");
    },
    createThread() {
      const title = val("nt-title").trim(); if (!title) { toast("Add a title"); return; }
      const body = val("nt-post").trim(); const cat = val("nt-cat"); const asVendor = val("nt-as") === "vendor";
      const id = "d" + Math.floor(performance.now());
      const who = asVendor ? vendorIdentity() : meIdentity();
      D.discussions.unshift({ id, cat, title, ...who, body, up: 0, official: null, pinned: false, time: "just now", replyList: [], mine: true });
      persist(); state.view = "board"; state.params = {}; App.nav("thread", { id }); toast("Thread posted");
    },
    askQuestion(sid) {
      const s = byId(D.sessions, sid); const t = val("q-box").trim();
      if (!t) { toast("Type a question"); return; }
      s.questions.push({ text: t, up: 0, official: null, mine: true }); persist(); render({ bottom: true }); toast("Question submitted");
    },
    similar(v) {
      const box = document.getElementById("nt-similar"); if (!box) return;
      if (v.trim().length < 3) { box.innerHTML = ""; return; }
      const hit = D.discussions.filter((d) => overlap(d.title, v)).slice(0, 2);
      box.innerHTML = hit.length ? `<div class="suggest"><b>💡 Similar discussions — check these first?</b>${hit.map((d) => `<div style="margin-top:6px;cursor:pointer" onclick="App.nav('thread',{id:'${d.id}'})">• ${esc(d.title)} <span style="color:#a58">(${d.replyList.length} replies)</span></div>`).join("")}</div>` : "";
    },

    // People / contacts
    requestContact(id) {
      const a = byId(D.attendees, id);
      if (a && a.isVendor) return App.contactVendor(a.vendorId);
      const nm = a ? a.name : "This attendee";
      const fields = [["Name", true], ["Email", true], ["Phone", false], ["Company", true]];
      openSheet(`<h3>Request contact</h3><p class="sub">${esc(nm)} chooses exactly what to share with you.</p>
        <div class="warn">⚠ They'll be shown a warning that they're about to share private information.</div>
        <div id="cr-fields">${fields.map(([l, on]) => `<div class="check ${on ? "on" : ""}" onclick="this.classList.toggle('on')"><div class="box">✓</div><div class="grow"><b>${l}</b></div></div>`).join("")}</div>
        <button class="btn block" style="margin-top:14px" onclick="App.sendContactRequest('${a ? a.id : ""}')">Send request</button>`);
    },
    sendContactRequest(id) {
      const a = byId(D.attendees, id);
      const chosen = Array.from(document.querySelectorAll("#cr-fields .check.on b")).map((b) => b.textContent);
      openSheet(`<h3>Request sent ✓</h3><p class="sub">${esc(a ? a.name : "They")} approved and shared their info. It's saved to <b>My Contacts</b>, and in the real app your phone's contact screen opens pre-filled.</p><button class="btn block" onclick="App.addContact('${id}','${esc(chosen.join("|"))}')">＋ Add to Contacts</button>`);
    },
    addContact(id, fieldsStr) {
      const a = byId(D.attendees, id);
      const fields = (fieldsStr ? fieldsStr.split("|") : ["Name", "Email"]).filter(Boolean);
      if (a && !D.me.contactsReceived.some((c) => c.name === a.name)) D.me.contactsReceived.push({ name: a.name, initials: a.initials, color: a.color, fields });
      persist(); closeSheet(); toast("Saved to My Contacts"); if (state.view === "contacts") render();
    },
    contactVendor(vid) {
      const v = byId(D.vendors, vid);
      openSheet(`<h3>Vendor card shared</h3><p class="sub">Vendors share their approved company profile automatically — no waiting.</p>
        <div class="card" style="margin:0"><div class="row">${v ? `<div class="avatar" style="background:${v.color}">${v.initials}</div>` : ""}<div class="grow"><h4>${esc(v ? v.company : "Vendor")}</h4><div class="sub">Booth ${v ? v.booth : ""}</div></div></div>
        <div class="kv" style="margin-top:8px"><span class="k">Website</span><span class="v">${esc(v ? v.site : "")}</span></div>
        <div class="kv" style="border:none"><span class="k">Reps</span><span class="v">${esc(v ? v.reps.join(", ") : "")}</span></div></div>
        <button class="btn block" style="margin-top:14px" onclick="App.addVendorContact('${vid}')">＋ Add to Contacts</button>`);
    },
    addVendorContact(vid) {
      const v = byId(D.vendors, vid);
      if (v && !D.me.contactsReceived.some((c) => c.name === v.company)) D.me.contactsReceived.push({ name: v.company, initials: v.initials, color: v.color, fields: ["Company", "Website", "Rep"] });
      persist(); closeSheet(); toast("Vendor card saved to Contacts"); if (state.view === "contacts") render();
    },

    // Photos
    uploadSheet() { openSheet(`<h3>Share a photo</h3><p class="sub">Add a caption — it posts to the gallery (pending admin approval).</p><div class="field"><textarea id="ph-cap" placeholder="Say something about this photo…"></textarea></div><button class="btn block" onclick="App.doUpload()">Post photo</button>`); },
    doUpload() {
      const cap = val("ph-cap").trim() || "Shared a photo";
      const color = PALETTE[D.photos.length % PALETTE.length];
      D.photos.unshift({ id: "p" + Math.floor(performance.now()), caption: cap, author: D.me.name, likes: 0, color, emoji: "📸", liked: false });
      persist(); closeSheet(); if (state.view !== "photos") App.nav("photos"); else render(); toast("Photo posted");
    },
    like(id) { const p = D.photos.find((x) => x.id === id); if (!p) return; p.liked = !p.liked; p.likes += p.liked ? 1 : -1; persist(); render(); },
    reportPhoto(id) { const i = D.photos.findIndex((x) => x.id === id); if (i >= 0) D.photos.splice(i, 1); persist(); render(); toast("Reported — hidden pending review"); },

    // Help desk (attendee)
    sendHelp(id) {
      const c = byId(D.helpdeskMine, id); const t = val("hc-box").trim(); if (!t) { toast("Type a message"); return; }
      c.msgs.push({ from: "me", text: t, time: nowLabel() }); if (c.status === "resolved") c.status = "open";
      persist(); render({ bottom: true }); toast("Message sent");
    },
    createHelp() {
      const cat = val("nh-cat"); const msg = val("nh-msg").trim(); if (!msg) { toast("Write a message"); return; }
      const id = "h" + Math.floor(performance.now());
      D.helpdeskMine.unshift({ id, cat, subject: msg.slice(0, 40) + (msg.length > 40 ? "…" : ""), status: "open", msgs: [{ from: "me", text: msg, time: nowLabel() }] });
      persist(); state.view = "helpdesk"; state.params = {}; App.nav("helpchat", { id }); toast("Sent to RSA");
    },
    helpSuggest(v) {
      const box = document.getElementById("hd-suggest"); if (!box) return;
      const low = v.toLowerCase(); const hit = D.helpdeskSuggestions.filter((s) => low.includes(s.q));
      box.innerHTML = hit.length ? `<div class="suggest"><b>💡 This might answer it — no need to wait for staff:</b>${hit.map((s) => `<div style="margin-top:6px">• ${esc(s.a)}</div>`).join("")}</div>` : "";
    },

    // Vendor
    scanMode(m) { App._scanMode = m; ["reg", "train", "look"].forEach((x) => { const el = document.getElementById("scan-" + x); if (el) el.classList.toggle("active", x === m); }); },
    scanResult(kind) {
      if (kind === "lead") {
        const pool = D.attendees.filter((a) => !a.isVendor);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        const dup = D.leads.find((l) => l.name === pick.name);
        if (dup) { openSheet(`<div class="scanres"><div class="big no">↺</div><h3>Already scanned</h3><p class="sub">${esc(pick.name)} is already in your leads — duplicate prevented.</p></div><button class="btn block" onclick="App.closeSheet()">OK</button>`); return; }
        const lead = { id: "l" + Math.floor(performance.now()), name: pick.name, store: pick.company, contact: pick.name + " · email shared", qual: "Warm", note: "", time: nowLabel(), rep: D.me.name };
        D.leads.unshift(lead); const v = myVendor(); v.leads += 1; persist();
        openSheet(`<div class="scanres"><div class="big ok">🧲</div><h3>Lead captured</h3><p class="sub">Added to your list — duplicates prevented automatically.</p></div>
          <div class="kv"><span class="k">Name</span><span class="v">${esc(lead.name)}</span></div>
          <div class="kv"><span class="k">Store</span><span class="v">${esc(lead.store)}</span></div>
          <div class="kv" style="border:none"><span class="k">Stamped</span><span class="v">${esc(lead.time)} · ${esc(lead.rep)}</span></div>
          <button class="btn block" style="margin-top:14px" onclick="App.closeSheet();App.nav('v_lead',{id:'${lead.id}'})">Add notes</button>`);
      } else if (kind === "train") {
        const enrolled = Math.random() > 0.35;
        openSheet(`<div class="scanres"><div class="big ${enrolled ? "ok" : "no"}">${enrolled ? "✓" : "✕"}</div>
          <h3>${enrolled ? "Enrolled" : "Not registered"}</h3><p class="sub">${enrolled ? "Attendance recorded automatically." : "This attendee isn't on the roster for this class."}</p></div>
          <div class="kv"><span class="k">Attendee</span><span class="v">Sara Delgado</span></div>
          <div class="kv"><span class="k">Class</span><span class="v">AI at the Counter</span></div>
          <div class="kv" style="border:none"><span class="k">Status</span><span class="v" style="color:${enrolled ? "var(--ok)" : "var(--danger)"}">${enrolled ? "Checked in" : "Do not admit"}</span></div>
          <button class="btn block" style="margin-top:14px" onclick="App.closeSheet()">Next</button>`);
      } else if (kind === "reg") {
        openSheet(`<div class="scanres"><div class="big ok">🎟️</div><h3>Sara Delgado</h3><p class="sub">Delgado Paint &amp; Tool · Attendee</p></div>
          <div class="kv"><span class="k">Badge</span><span class="v">Table 4 · pre-printed</span></div>
          <div class="kv"><span class="k">Check-in</span><span class="v" style="color:var(--danger)">Not checked in</span></div>
          <div class="kv"><span class="k">Goody bag</span><span class="v">Not issued</span></div>
          <div class="kv" style="border:none"><span class="k">Training</span><span class="v">Endcap Strategy</span></div>
          <button class="btn block" style="margin-top:14px" onclick="App.toast('Checked in &amp; badge issued');App.closeSheet()">Check in &amp; issue badge</button>`);
      } else {
        openSheet(`<div class="scanres"><div class="big ok">🛡️</div><h3>Admin Lookup</h3><p class="sub">Full profile (permissions-based)</p></div>
          <div class="kv"><span class="k">Attendee</span><span class="v">Sara Delgado</span></div>
          <div class="kv"><span class="k">ID</span><span class="v">A-100412</span></div>
          <div class="kv"><span class="k">Roles</span><span class="v">Attendee</span></div>
          <div class="kv"><span class="k">Check-in</span><span class="v">9:04 AM</span></div>
          <div class="kv" style="border:none"><span class="k">Vendor scans</span><span class="v">2 booths</span></div>
          <button class="btn block" style="margin-top:14px" onclick="App.closeSheet()">Close</button>`);
      }
    },
    saveLead(id) { const l = byId(D.leads, id); if (!l) return; l.qual = val("ld-qual"); l.note = val("ld-note"); persist(); toast("Lead saved"); App.back(); },
    saveCompany() { const v = myVendor(); v.about = val("co-about"); v.cats = val("co-cats").split(",").map((s) => s.trim()).filter(Boolean); v.site = val("co-site"); persist(); toast("Company profile saved"); },
    exportLeads() {
      const rows = [["Name", "Store", "Contact", "Qualification", "Notes", "Time", "Rep"], ...D.leads.map((l) => [l.name, l.store, l.contact, l.qual, l.note, l.time, l.rep])];
      const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
      try {
        const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        toast("Exported " + D.leads.length + " leads");
      } catch (e) { toast("Export ready · " + D.leads.length + " leads"); }
    },

    // Admin
    sendBroadcast() {
      const aud = val("bc-aud"); const cat = val("bc-cat"); const title = val("bc-title").trim() || cat; const msg = val("bc-msg").trim(); const when = val("bc-when");
      if (!msg) { toast("Write a message"); return; }
      const kind = aud === "Vendors only" ? "vendor" : "attendee";
      D.announcements.unshift({ id: "an" + Math.floor(performance.now()), kind, title: title, body: msg, time: when === "Send now" ? "just now" : "scheduled", who: "You (Admin)" });
      D.auditLog.unshift({ who: D.me.name + " (Admin)", what: "Sent " + (kind === "vendor" ? "vendor " : "") + "announcement: “" + title + "”", time: nowLabel() });
      persist(); toast(when === "Send now" ? "Push sent to " + D.event.attendees.toLocaleString() + " devices" : "Scheduled"); App.nav("announcements");
    },
    moderate(id, action) {
      const i = D.reported.findIndex((r) => r.id === id); if (i >= 0) D.reported.splice(i, 1);
      D.auditLog.unshift({ who: D.me.name + " (Admin)", what: (action === "remove" ? "Removed" : "Dismissed") + " reported content", time: nowLabel() });
      persist(); render(); toast(action === "remove" ? "Content removed" : "Report dismissed");
    },
    assignTicket(id) { const t = byId(D.helpdeskQueue, id); t.assignee = "You"; if (t.status === "open") t.status = "assigned"; persist(); render(); toast("Assigned to you"); },
    resolveTicket(id) { const t = byId(D.helpdeskQueue, id); t.status = t.status === "resolved" ? "assigned" : "resolved"; persist(); render(); toast(t.status === "resolved" ? "Marked resolved" : "Reopened"); },
    replyTicket(id) {
      const t = byId(D.helpdeskQueue, id); const r = val("tk-reply").trim(); if (!r) { toast("Type a reply"); return; }
      t.msgs.push({ from: "staff", text: r, time: nowLabel() }); if (!t.assignee) t.assignee = "You"; if (t.status === "open") t.status = "assigned";
      persist(); render({ bottom: true }); toast("Reply sent");
    },

    resetDemo() {
      openSheet(`<h3>Reset demo data?</h3><p class="sub">This clears everything you've added (posts, leads, contacts, photos…) and restores the original sample data.</p>
        <button class="btn danger block" onclick="App.doReset()">Yes, reset</button>
        <button class="btn ghost block" style="margin-top:8px" onclick="App.closeSheet()">Cancel</button>`);
    },
    doReset() { try { localStorage.removeItem("whova3"); } catch (e) {} location.reload(); },

    toast(msg) { showToast(msg); },
    closeSheet() { closeSheet(); },
  };
  window.App = App;

  /* ---------- utils ---------- */
  function overlap(a, b) {
    const wa = a.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const wb = b.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    return wa.some((w) => wb.includes(w));
  }
  function roleDesc(r) { return { attendee: "Agenda, networking, discussion, help desk", vendor: "Booth, leads, scanner, vendor tools", admin: "Manage event, moderation, help desk, scanning" }[r]; }
  function openSheet(html) { const sc = document.getElementById("scrim"); sc.querySelector(".sheet").innerHTML = `<div class="grip"></div>` + html; sc.classList.add("show"); }
  function closeSheet() { document.getElementById("scrim").classList.remove("show"); }
  function toast(msg) { showToast(msg); }
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.style.opacity = "1"; t.style.transform = "translateY(0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(10px)"; }, 1900);
  }

  // init
  restore(); ensureDefaults();
  document.body.className = "role-attendee";
  render();
  document.getElementById("scrim").addEventListener("click", (e) => { if (e.target.id === "scrim") closeSheet(); });
})();
