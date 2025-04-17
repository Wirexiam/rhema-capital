export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
  
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { texts, lang } = req.body;
  
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
          sourceLanguageCode: "ru",
          targetLanguageCode: lang,
          format: "PLAIN_TEXT"
        })
      });
  
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  