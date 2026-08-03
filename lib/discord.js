/** Shared Discord embed + button helpers for staff apps. */

const COLORS = {
  new: 0x6db3e0,
  review: 0xe0b45a,
  interview: 0x7dba6f,
  hold: 0x9b8afb,
  deny: 0xd67a7a,
};

const STATUS_LABEL = {
  new: "New",
  review: "Reviewing",
  interview: "Interview",
  hold: "Hold",
  deny: "Denied",
};

function clip(text, max = 1024) {
  const s = String(text ?? "").trim() || "—";
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

/** One big embed (overview + answers). */
function buildApplicationEmbed(app, status = "new") {
  const username = clip(app.discordUsername, 80);
  const id = clip(app.discordId, 32);
  const when = app.submittedAt ? new Date(app.submittedAt) : new Date();
  const A = 320; // keep total under Discord’s ~6000 char embed budget

  return {
    title: "📥 Staff application",
    color: COLORS[status] || COLORS.new,
    description: `**${username}** · \`${id}\` · Discord DMs`,
    fields: [
      { name: "playvortex", value: clip(app.playvortex || "—", 64), inline: true },
      { name: "Age", value: clip(app.ageOk, 32), inline: true },
      { name: "Timezone", value: clip(app.timezone, 64), inline: true },
      { name: "Hours / week", value: clip(app.hours, 32), inline: true },
      { name: "In server", value: clip(app.tenure, 64), inline: true },
      { name: "Contact", value: "Discord DMs", inline: true },
      { name: "Experience", value: clip(app.experience, A), inline: false },
      {
        name: "Other staff",
        value: clip(app.otherStaff || "—", 200),
        inline: true,
      },
      {
        name: "History",
        value: clip(app.history || "—", 200),
        inline: true,
      },
      { name: "Q · Spam invites", value: clip(app.qSpam, A), inline: false },
      {
        name: "Q · Ban request from friend",
        value: clip(app.qDrama, A),
        inline: false,
      },
      {
        name: "Q · Staff abuse claim",
        value: clip(app.qAbuse, A),
        inline: false,
      },
      { name: "Q · Raid", value: clip(app.qRaid, A), inline: false },
      { name: "Q · Friend unban", value: clip(app.qFriend, A), inline: false },
      { name: "Why Vortex07", value: clip(app.why, A), inline: false },
      { name: "Improvements", value: clip(app.improve, A), inline: false },
      { name: "Extra", value: clip(app.extra || "—", 280), inline: false },
    ],
    footer: { text: `Status · ${STATUS_LABEL[status] || "New"} · #staff-apps` },
    timestamp: when.toISOString(),
  };
}

function buildApplicationEmbeds(app, status = "new") {
  return [buildApplicationEmbed(app, status)];
}

function actionRows(status = "new", disabled = false) {
  const done = disabled || status !== "new";
  const pick = (id) => done && status === id;

  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: pick("interview") ? "Interview ✓" : "Interview",
          custom_id: "staffapp:interview",
          disabled: done,
        },
        {
          type: 2,
          style: 2,
          label: pick("review") ? "Reviewing ✓" : "Reviewing",
          custom_id: "staffapp:review",
          disabled: done,
        },
        {
          type: 2,
          style: 1,
          label: pick("hold") ? "Hold ✓" : "Hold",
          custom_id: "staffapp:hold",
          disabled: done,
        },
        {
          type: 2,
          style: 4,
          label: pick("deny") ? "Denied ✓" : "Deny",
          custom_id: "staffapp:deny",
          disabled: done,
        },
      ],
    },
  ];
}

function sampleApplication() {
  return {
    discordUsername: "TestApplicant",
    discordId: "123456789012345678",
    playvortex: "TestUser",
    ageOk: "15+",
    timezone: "UTC+1",
    hours: "5–9",
    tenure: "1–3 months",
    contact: "Discord DMs",
    experience: "Modded a small Discord (200 members) for ~6 months.",
    otherStaff: "None currently",
    history: "None",
    qSpam: "Delete messages, timeout, escalate if raid-like.",
    qDrama: "Don’t ban from a DM. Collect context in-server, escalate.",
    qAbuse: "Park the claim, escalate to lead, don’t confront publicly.",
    qRaid: "Lockdown → delete spam → alert staff → slowmode → review joins.",
    qFriend: "Refuse. Same rules for everyone; log the request.",
    why: "Want to help keep Vortex07 chill and fair.",
    improve: "Clearer rules pin + faster raid response.",
    extra: "(test embed — ignore)",
    submittedAt: new Date().toISOString(),
  };
}

function messagePayload(app, status = "new") {
  return {
    embeds: buildApplicationEmbeds(app, status),
    components: actionRows(status, false),
    allowed_mentions: { parse: [] },
  };
}

function parseApplication(body) {
  if (body?.application && typeof body.application === "object") {
    return body.application;
  }
  return null;
}

module.exports = {
  COLORS,
  STATUS_LABEL,
  clip,
  buildApplicationEmbed,
  buildApplicationEmbeds,
  actionRows,
  sampleApplication,
  messagePayload,
  parseApplication,
};
