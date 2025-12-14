export default async function handler(req, res) {
  // CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // preflight запрос
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не дозволено" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Ты полезный ассистент." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    console.log(JSON.stringify(data));
    res.status(200).json({ reply: data.choices?.[0]?.message?.content || "No response" });
  } catch (err) {
    res.status(500).json({ error: "OpenAI request failed" });
  }
}
