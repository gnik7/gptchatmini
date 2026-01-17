export default async function handler(req, res) {
  // CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // preflight запрос
  if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не дозволено" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
          model: "gpt-5",
          input: [
            {
              role: "system",
              content: "Ты полезный ассистент.",
            },
            {
              role: "user",
              content: message,
            },
        ]
      })
    });

    const data = await response.json();
    console.log(JSON.stringify(data));

    const reply = extractOutputText(data);

    res.status(200).json({
      reply: reply || "No response",
      raw: data,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
}

function extractOutputText(data) {
  if (data.output_text) return data.output_text;

  if (!Array.isArray(data.output)) return null;

  for (const item of data.output) {
    if (item.type === "message") {
      for (const content of item.content || []) {
        if (content.type === "output_text") {
          return content.text;
        }
      }
    }
  }

  return null;
}
