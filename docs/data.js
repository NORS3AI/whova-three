/* ============================================================
   whova-three — mock data for the interactive prototype
   All data is fake and lives only in the browser.
   ============================================================ */
window.DATA = {
  event: {
    name: "RSA National Training & Expo 2026",
    dates: "Mar 12–14, 2026",
    location: "Gaylord Opryland, Nashville TN",
    attendees: 2480,
  },

  // The signed-in demo user — has multiple roles to demo role switching.
  me: {
    id: "A-100294",
    name: "Jordan Cole",
    initials: "JC",
    color: "#2f6df6",
    company: "Northwind Hardware",
    role: "Store Owner",
    bio: "Second-generation hardware store owner. Here for the merchandising track.",
    roles: ["attendee", "vendor", "admin"], // multi-role demo account
    vendorCompanyId: "V-02",
    privacy: { name: true, email: true, phone: false, company: true },
  },

  days: ["Thu · Mar 12", "Fri · Mar 13", "Sat · Mar 14"],

  sessions: [
    { id: "s1", day: 0, start: "9:00", ampm: "AM", end: "10:00", title: "Opening Keynote: Independent Retail in 2026", room: "Ballroom A", track: "#2f6df6", tag: "Keynote", tagBg: "#eaf1ff", tagInk: "#1e50c8", speakers: ["sp1"], desc: "The state of independent hardware retail and where the next decade is headed." },
    { id: "s2", day: 0, start: "10:30", ampm: "AM", end: "12:00", title: "AI at the Counter: Practical Store Tools", room: "Room 204", track: "#12b3a6", tag: "Training", tagBg: "#d9f6f2", tagInk: "#0a7d72", speakers: ["sp2"], desc: "Hands-on look at everyday AI tools for inventory, pricing, and customer service." },
    { id: "s3", day: 0, start: "10:30", ampm: "AM", end: "11:30", title: "Merchandising That Sells: Endcap Strategy", room: "Room 118", track: "#f5a623", tag: "Training", tagBg: "#fdeccd", tagInk: "#a56a00", speakers: ["sp3"], desc: "Build endcaps that move product. Overlaps with the AI session — pick one!" },
    { id: "s4", day: 0, start: "1:00", ampm: "PM", end: "2:30", title: "Panel: Competing with the Big Boxes", room: "Ballroom C", track: "#7a5cff", tag: "Panel", tagBg: "#ece7ff", tagInk: "#5b3fd6", speakers: ["sp1", "sp4"], desc: "Four owners share what actually works against national chains." },
    { id: "s5", day: 1, start: "9:00", ampm: "AM", end: "10:30", title: "Loss Prevention for Small Stores", room: "Room 204", track: "#2f6df6", tag: "Training", tagBg: "#eaf1ff", tagInk: "#1e50c8", speakers: ["sp4"], desc: "Low-cost, high-impact loss prevention tactics." },
    { id: "s6", day: 1, start: "11:00", ampm: "AM", end: "12:00", title: "Hiring & Keeping Great Staff", room: "Room 118", track: "#12b3a6", tag: "Training", tagBg: "#d9f6f2", tagInk: "#0a7d72", speakers: ["sp3"], desc: "Recruiting, onboarding, and retention on a small-store budget." },
    { id: "s7", day: 2, start: "10:00", ampm: "AM", end: "11:30", title: "Expo Hall Power Hour", room: "Exhibit Hall B", track: "#e0526b", tag: "Expo", tagBg: "#fde3e8", tagInk: "#b13251", speakers: [], desc: "Meet every supplier, collect deals, scan for prizes." },
  ],

  // starred session ids (My Schedule)
  starred: ["s2", "s4"],

  speakers: [
    { id: "sp1", name: "Dana Whitfield", title: "CEO", company: "RSA", initials: "DW", color: "#2f6df6", bio: "Leads the association's retail strategy and member growth." },
    { id: "sp2", name: "Marcus Lee", title: "Head of Retail Tech", company: "Nimbus", initials: "ML", color: "#12b3a6", bio: "Builds practical technology tools for independent retailers." },
    { id: "sp3", name: "Priya Nair", title: "Merchandising Director", company: "Loop Retail", initials: "PN", color: "#f5a623", bio: "20 years designing store layouts that convert." },
    { id: "sp4", name: "Tomás Bianchi", title: "Operations Consultant", company: "Vela Advisory", initials: "TB", color: "#7a5cff", bio: "Helps small stores tighten operations and cut shrink." },
  ],

  attendees: [
    { id: "a1", name: "Amara Osei", title: "Owner", company: "Osei Hardware", initials: "AO", color: "#2f6df6", isVendor: false },
    { id: "a2", name: "Liang Wu", title: "Store Manager", company: "Riverside Supply", initials: "LW", color: "#12b3a6", isVendor: false },
    { id: "a3", name: "Priya Nair", title: "Merchandising Director", company: "Loop Retail", initials: "PN", color: "#f5a623", isVendor: false },
    { id: "a4", name: "Mina Khoury", title: "Sales Rep", company: "Acme Shipping Supplies", initials: "MK", color: "#e0526b", isVendor: true, vendorId: "V-01" },
    { id: "a5", name: "Tomás Bianchi", title: "Consultant", company: "Vela Advisory", initials: "TB", color: "#3aa655", isVendor: false },
    { id: "a6", name: "Sara Delgado", title: "Owner", company: "Delgado Paint & Tool", initials: "SD", color: "#7a5cff", isVendor: false },
  ],

  vendors: [
    { id: "V-01", company: "Acme Shipping Supplies", initials: "AS", color: "#e0526b", booth: "212", mapLoc: "Hall B · Aisle 200", cats: ["Packaging", "Logistics"], site: "acmeship.example", about: "Boxes, mailers, and fulfillment supplies for independent retailers.", reps: ["Mina Khoury", "Carl Reyes"], leads: 34 },
    { id: "V-02", company: "Northwind Hardware Brands", initials: "NH", color: "#2f6df6", booth: "104", mapLoc: "Hall B · Aisle 100", cats: ["Tools", "Fasteners"], site: "northwindbrands.example", about: "Private-label tools and fasteners for the independent channel.", reps: ["Jordan Cole"], leads: 51 },
    { id: "V-03", company: "BrightPay POS", initials: "BP", color: "#12b3a6", booth: "330", mapLoc: "Hall B · Aisle 300", cats: ["Point of Sale", "Payments"], site: "brightpay.example", about: "Modern point-of-sale and payments built for small stores.", reps: ["Dana Fox"], leads: 22 },
  ],

  categories: ["General Discussion", "Event Questions", "Travel and Hotel", "Training and Sessions", "Vendors and Products", "Store Operations"],

  discussions: [
    { id: "d1", cat: "Event Questions", title: "What's the Wi-Fi password?", author: "Liang Wu", role: "attendee", initials: "LW", color: "#12b3a6", body: "Can't find it anywhere — anyone have it?", up: 12, official: "Network: RSA2026 · Password: retail (posted by Organizer)", pinned: true, time: "8:40 AM",
      replyList: [
        { author: "Sara Delgado", initials: "SD", color: "#7a5cff", role: "attendee", text: "It's on the back of your badge too!", time: "8:44 AM" },
        { author: "Liang Wu", initials: "LW", color: "#12b3a6", role: "attendee", text: "Found it, thanks 🙏", time: "8:46 AM" },
      ] },
    { id: "d2", cat: "Travel and Hotel", title: "Best restaurants near the Opryland?", author: "Sara Delgado", role: "attendee", initials: "SD", color: "#7a5cff", body: "First time in Nashville — where should we eat?", up: 21, official: null, pinned: false, time: "Yesterday",
      replyList: [
        { author: "Amara Osei", initials: "AO", color: "#2f6df6", role: "attendee", text: "Hattie B's for hot chicken — worth the line.", time: "Yesterday" },
      ] },
    { id: "d3", cat: "Vendors and Products", title: "Anyone using BrightPay POS?", author: "Acme Shipping Supplies", role: "vendor", initials: "AS", color: "#e0526b", body: "Curious how it compares for a 2-register store.", up: 6, official: null, pinned: false, time: "Yesterday",
      replyList: [
        { author: "Riverside Supply", initials: "RS", color: "#12b3a6", role: "attendee", text: "We switched last year, happy so far.", time: "Yesterday" },
      ] },
    { id: "d4", cat: "Store Operations", title: "Endcap ideas for spring?", author: "Amara Osei", role: "attendee", initials: "AO", color: "#2f6df6", body: "Share your best-performing spring endcaps!", up: 9, official: null, pinned: false, time: "Mon",
      replyList: [] },
  ],

  photos: [
    { id: "p1", caption: "Packed house for the keynote! 🎬", author: "Amara Osei", likes: 42, color: "#2f6df6", emoji: "🎤" },
    { id: "p2", caption: "Our booth is ready — come say hi, Aisle 100", author: "Northwind Hardware", likes: 18, color: "#12b3a6", emoji: "🏢" },
    { id: "p3", caption: "Great endcap workshop takeaways", author: "Sara Delgado", likes: 27, color: "#f5a623", emoji: "🛒" },
    { id: "p4", caption: "Nashville nights 🎸", author: "Liang Wu", likes: 55, color: "#7a5cff", emoji: "🌆" },
  ],

  announcements: [
    { id: "an1", kind: "attendee", title: "Keynote starting soon 🎬", body: "Doors to Ballroom A are open. Opening keynote begins at 9:00 AM.", time: "8:42 AM", who: "Organizer" },
    { id: "an2", kind: "attendee", title: "Lunch & networking 🍽️", body: "Boxed lunches on Level 2. Owner meetups by region near the windows.", time: "11:15 AM", who: "Organizer" },
    { id: "an3", kind: "vendor", title: "Exhibit hall access 🏢", body: "Vendor early access begins at 7:00 AM for booth setup.", time: "Pinned", who: "Expo Team" },
    { id: "an4", kind: "attendee", title: "Wi-Fi details 📶", body: "Network: RSA2026 · Password: retail", time: "Pinned", who: "Organizer" },
  ],

  // Attendee's own Help Desk conversations (Contact RSA)
  helpdeskMine: [
    { id: "h1", cat: "Registration", subject: "Missing badge in my packet", status: "open",
      msgs: [
        { from: "me", text: "My goody bag didn't have a badge — what should I do?", time: "9:02 AM" },
        { from: "rsa", text: "Hi Jordan! Please stop by the Registration desk in the main lobby and we'll reprint it. — Taylor (RSA)", time: "9:11 AM" },
      ] },
  ],

  // Admin Help Desk shared queue
  helpdeskQueue: [
    { id: "t1", attendee: "Sara Delgado", cat: "Technical Issue", preview: "App won't load my schedule", status: "open", assignee: null, time: "9:20 AM",
      msgs: [{ from: "them", text: "The app won't load my schedule — just spins.", time: "9:20 AM" }] },
    { id: "t2", attendee: "Liang Wu", cat: "Registration", preview: "Need to add a colleague", status: "assigned", assignee: "Taylor", time: "8:55 AM",
      msgs: [{ from: "them", text: "Can I add a colleague to my registration?", time: "8:55 AM" }, { from: "staff", text: "Sure — send me their name & email.", time: "8:58 AM" }] },
    { id: "t3", attendee: "Amara Osei", cat: "Venue", preview: "Where is the mother's room?", status: "resolved", assignee: "Priya", time: "Yesterday",
      msgs: [{ from: "them", text: "Where is the mother's room?", time: "Yesterday" }, { from: "staff", text: "Level 2 near the elevators. 🙂", time: "Yesterday" }] },
  ],

  // Admin moderation queue (reported content)
  reported: [
    { id: "r1", kind: "reply", ico: "💬", text: "“…this vendor is a total scam, stay away…”", flag: "Reported ×2" },
    { id: "r2", kind: "photo", ico: "📸", text: "Blurry booth photo", flag: "Reported ×1" },
  ],

  helpdeskSuggestions: [
    { q: "wifi", a: "Wi-Fi — Network: RSA2026 · Password: retail" },
    { q: "ballroom", a: "Ballrooms A–C are on Level 1, past the main escalators." },
    { q: "badge", a: "Lost badge? Visit the Registration desk in the main lobby for a reprint." },
    { q: "park", a: "Self-parking is $18/day in the Magnolia garage." },
  ],

  // Vendor leads (for the demo vendor V-02)
  leads: [
    { id: "l1", name: "Amara Osei", store: "Osei Hardware", contact: "amara@osei.example", qual: "Hot", note: "Wants private-label pricing.", time: "10:05 AM", rep: "Jordan Cole" },
    { id: "l2", name: "Sara Delgado", store: "Delgado Paint & Tool", contact: "sara@delgado.example", qual: "Warm", note: "Follow up after show.", time: "10:22 AM", rep: "Jordan Cole" },
    { id: "l3", name: "Liang Wu", store: "Riverside Supply", contact: "shared: name only", qual: "Cold", note: "", time: "10:41 AM", rep: "Jordan Cole" },
  ],

  notifCategories: [
    { key: "sessions", label: "Session reminders", on: true },
    { key: "general", label: "General announcements", on: true },
    { key: "vendor", label: "Vendor announcements", on: true },
    { key: "replies", label: "Discussion replies", on: true },
    { key: "contact", label: "Contact requests", on: true },
    { key: "helpdesk", label: "Help Desk responses", on: true },
    { key: "leads", label: "New vendor leads", on: true },
    { key: "emergency", label: "Emergency alerts", on: true, locked: true },
  ],

  // Admin reporting tiles
  reports: [
    { label: "Checked in", value: "1,842", sub: "of 2,480", color: "#2f6df6" },
    { label: "Training scans", value: "3,109", sub: "today", color: "#12b3a6" },
    { label: "Leads captured", value: "6,540", sub: "all vendors", color: "#f5a623" },
    { label: "Help Desk open", value: "7", sub: "2 unassigned", color: "#e0526b" },
  ],

  auditLog: [
    { who: "Taylor (Admin)", what: "Sent push: 'Keynote starting soon'", time: "8:42 AM" },
    { who: "Priya (Admin)", what: "Resolved Help Desk ticket #t3", time: "Yesterday" },
    { who: "System", what: "Nightly backup completed", time: "3:00 AM" },
    { who: "Dana (Admin)", what: "Pinned thread 'What's the Wi-Fi password?'", time: "Yesterday" },
  ],
};
