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

function buildApplicationEmbeds(app, status = "new") {
  const username = clip(app.discordUsername, 80);
  const id = clip(app.discordId, 32);
  const when = app.submittedAt ? new Date(app.submittedAt) : new Date();

  const overview = {
    title: "New staff application",
    color: COLORS[status] || COLORS.new,
    description: `**${username}** · \`${id}\``,
    fields: [
      { name: "playvortex", value: clip(app.playvortex || "—", 64), inline: true },
      { name: "Age", value: clip(app.ageOk, 32), inline: true },
      { name: "Timezone", value: clip(app.timezone, 64), inline: true },
      { name: "Hours / week", value: clip(app.hours, 32), inline: true },
      { name: "In server", value: clip(app.tenure, 64), inline: true },
      { name: "Contact", value: clip(app.contact, 64), inline: true },
      { name: "Experience", value: clip(app.experience, 400), inline: false },
      {
        name: "Other staff · History",
        value: clip(
          `${app.otherStaff || "—"}\n${app.history || "—"}`,
          500,
        ),
        inline: false,
      },
    ],
    footer: { text: `Status · ${STATUS_LABEL[status] || "New"}` },
    timestamp: when.toISOString(),
  };

  const answers = {
    color: COLORS[status] || COLORS.new,
    fields: [
      { name: "Spam invites", value: clip(app.qSpam), inline: false },
      { name: "Ban request from friend", value: clip(app.qDrama), inline: false },
      { name: "Staff abuse claim", value: clip(app.qAbuse), inline: false },
      { name: "Raid response", value: clip(app.qRaid), inline: false },
      { name: "Friend unban ask", value: clip(app.qFriend), inline: false },
      { name: "Why Vortex07", value: clip(app.why), inline: false },
      { name: "Improvements", value: clip(app.improve), inline: false },
      { name: "Extra", value: clip(app.extra || "—", 600), inline: false },
    ],
  };

  return [overview, answers];
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
  buildApplicationEmbeds,
  actionRows,
  parseApplication,
};
