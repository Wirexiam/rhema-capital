export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { texts, from, to } = req.body;

  if (!texts || !Array.isArray(texts) || !from || !to) {
    return res.status(400).json({ error: 'Missing texts, from, or to' });
  }

  const SUPPORTED_LANGS = ['ru', 'en', 'de'];
  if (!SUPPORTED_LANGS.includes(from) || !SUPPORTED_LANGS.includes(to)) {
    return res.status(400).json({ error: `Unsupported language pair: ${from} → ${to}` });
  }

  const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
  const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID;

  try {
    const response = await fetch("https://translate.api.cloud.yandex.net/translate/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${YANDEX_API_KEY}`
      },
      body: JSON.stringify({
        folderId: YANDEX_FOLDER_ID,
        texts,
        sourceLanguageCode: from,
        targetLanguageCode: to,
        format: "PLAIN_TEXT"
      })
    });

    const data = await response.json();

    if (data.translations) {
      const translations = data.translations.map(t => ({ text: t.text }));
      return res.status(200).json({ translations });
    }

    return res.status(500).json({ error: "Translation failed", raw: data });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
