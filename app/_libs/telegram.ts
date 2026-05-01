export default async function Telegram(message: string, slug: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  let chatId;

  switch (slug) {
    case "technician":
      chatId = process.env.TELEGRAM_CHAT_ID_MT;
      break;
    case "it":
      chatId = process.env.TELEGRAM_CHAT_ID_IT;
      break;
    case "patientwifi":
      chatId = process.env.TELEGRAM_CHAT_ID_WIFI;
      break;
    case "meeting":
      chatId = process.env.TELEGRAM_CHAT_ID_MEETING; // MedUP Meeting
      break;
    case "pr":
      chatId = process.env.TELEGRAM_CHAT_ID_PR; // PR-Service
      break;
  }

  if (!token || !chatId) return;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });
}
