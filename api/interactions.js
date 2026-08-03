/**
 * Discord Interactions endpoint (button clicks).
 *
 * Discord Developer Portal → your app → Interactions Endpoint URL:
 *   https://YOUR-DEPLOY.vercel.app/api/interactions
 *
 * Env:
 *   DISCORD_PUBLIC_KEY — application public key (hex)
 */

const { webcrypto } = require("crypto");
const { actionRows, STATUS_LABEL } = require("../lib/discord");

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function verifyDiscordSignature(publicKeyHex, signatureHex, timestamp, rawBody) {
  try {
    const key = await webcrypto.subtle.importKey(
      "raw",
      Buffer.from(publicKeyHex, "hex"),
      "Ed25519",
      false,
      ["verify"],
    );
    return webcrypto.subtle.verify(
      "Ed25519",
      key,
      Buffer.from(signatureHex, "hex"),
      Buffer.from(timestamp + rawBody),
    );
  } catch {
    return false;
  }
}

function statusFromCustomId(customId) {
  const id = String(customId || "");
  if (id === "staffapp:interview") return "interview";
  if (id === "staffapp:review") return "review";
  if (id === "staffapp:hold") return "hold";
  if (id === "staffapp:deny") return "deny";
  return null;
}

/** Rebuild embeds from the message, only updating color/footer status. */
function restyleEmbeds(embeds, status, reviewerTag) {
  const colorMap = {
    new: 0x6db3e0,
    review: 0xe0b45a,
    interview: 0x7dba6f,
    hold: 0x9b8afb,
    deny: 0xd67a7a,
  };
  const color = colorMap[status] || colorMap.new;
  const label = STATUS_LABEL[status] || status;
  const who = reviewerTag ? ` by ${reviewerTag}` : "";

  return (embeds || []).map((embed, i) => {
    const next = { ...embed, color };
    if (i === 0) {
      next.footer = {
        text: `Status · ${label}${who}`,
      };
    }
    return next;
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const publicKey = String(process.env.DISCORD_PUBLIC_KEY || "").trim();
  if (!publicKey) {
    return res.status(500).send("DISCORD_PUBLIC_KEY missing");
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers["x-signature-ed25519"];
  const timestamp = req.headers["x-signature-timestamp"];

  const valid = await verifyDiscordSignature(
    publicKey,
    signature,
    timestamp,
    rawBody,
  );
  if (!valid) {
    return res.status(401).send("invalid request signature");
  }

  let interaction;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return res.status(400).send("invalid json");
  }

  // PING
  if (interaction.type === 1) {
    return res.status(200).json({ type: 1 });
  }

  // MESSAGE_COMPONENT
  if (interaction.type === 3) {
    const status = statusFromCustomId(interaction.data?.custom_id);
    if (!status) {
      return res.status(200).json({
        type: 4,
        data: { content: "Unknown button.", flags: 64 },
      });
    }

    const user =
      interaction.member?.user || interaction.user || {};
    const tag = user.global_name || user.username || "staff";
    const embeds = restyleEmbeds(
      interaction.message?.embeds,
      status,
      tag,
    );

    return res.status(200).json({
      type: 7, // UPDATE_MESSAGE
      data: {
        embeds,
        components: actionRows(status, true),
      },
    });
  }

  return res.status(200).json({ type: 1 });
};
