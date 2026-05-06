/**
 * POST /api/telegram-booking
 * Принимает JSON: name, phone, tour, source, page, date, comment
 */

const MAX_BODY_BYTES = 16 * 1024;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function setCorsHeaders(res, allowedOrigin, requestOrigin) {
  if (allowedOrigin && requestOrigin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function readJsonBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    var total = 0;
    req.on("data", function (chunk) {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error("body_too_large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", function () {
      try {
        var raw = Buffer.concat(chunks).toString("utf8");
        if (!raw.trim()) {
          resolve({});
          return;
        }
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

function normalizePhone(phone) {
  if (typeof phone !== "string") {
    return "";
  }
  return phone.replace(/\D/g, "");
}

function validateOptionalName(name) {
  if (name == null) {
    return null;
  }
  if (typeof name !== "string") {
    return "Invalid name";
  }
  if (name.trim().length > 200) {
    return "Invalid name";
  }
  return null;
}

function displayBookingName(name) {
  if (name == null) {
    return "не указано";
  }
  if (typeof name !== "string") {
    return "не указано";
  }
  var t = name.trim();
  return t.length ? t : "не указано";
}

function isValidPhoneDigits(digits) {
  if (!digits || digits.length < 10 || digits.length > 15) {
    return false;
  }
  if (digits.length === 11 && digits[0] === "7") {
    return true;
  }
  if (digits.length === 10 && digits[0] === "9") {
    return true;
  }
  return digits.length >= 10;
}

function buildTelegramText(body) {
  var lines = [
    "📩 Новая заявка с сайта",
    "",
    "Имя: " + displayBookingName(body.name),
    "Телефон: " + String(body.phone || "").trim(),
    "Экскурсия: " + (body.tour != null ? String(body.tour).trim() : "—"),
    "Источник: " + (body.source != null ? String(body.source).trim() : "—"),
    "Страница: " + (body.page != null ? String(body.page).trim() : "—"),
    "Дата: " + (body.date != null ? String(body.date).trim() : "—"),
    "Комментарий: " + (body.comment != null && String(body.comment).trim() ? String(body.comment).trim() : "—"),
  ];
  return lines.join("\n");
}

module.exports = async function handler(req, res) {
  var allowedOrigin = (process.env.ALLOWED_ORIGIN || "").trim();
  var requestOrigin = (req.headers.origin || "").trim() || null;

  if (req.method === "OPTIONS") {
    setCorsHeaders(res, allowedOrigin, requestOrigin);
    res.statusCode = 204;
    return res.end();
  }

  setCorsHeaders(res, allowedOrigin, requestOrigin);

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  if (!allowedOrigin) {
    return json(res, 500, { ok: false, error: "Server misconfiguration" });
  }

  if (requestOrigin !== allowedOrigin) {
    return json(res, 403, { ok: false, error: "Forbidden origin" });
  }

  var token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  var chatId = (process.env.TELEGRAM_CHAT_ID || "").trim();
  if (!token || !chatId) {
    return json(res, 500, { ok: false, error: "Server misconfiguration" });
  }

  var body;
  try {
    body = await readJsonBody(req);
  } catch (e) {
    if (e && e.message === "body_too_large") {
      return json(res, 413, { ok: false, error: "Request body too large" });
    }
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  var nameErr = validateOptionalName(body.name);
  if (nameErr) {
    return json(res, 400, { ok: false, error: nameErr });
  }
  var phoneRaw = body.phone;
  var digits = normalizePhone(phoneRaw);
  if (!isValidPhoneDigits(digits)) {
    return json(res, 400, { ok: false, error: "Invalid phone" });
  }

  var text = buildTelegramText(body);
  var tgUrl = "https://api.telegram.org/bot" + encodeURIComponent(token) + "/sendMessage";

  try {
    var tgRes = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });
    var tgData = await tgRes.json().catch(function () {
      return {};
    });
    if (!tgRes.ok || !tgData.ok) {
      var desc = (tgData && tgData.description) || "Telegram API error";
      return json(res, 502, { ok: false, error: desc });
    }
    return json(res, 200, { ok: true });
  } catch (err) {
    return json(res, 502, { ok: false, error: "Failed to reach Telegram" });
  }
};
