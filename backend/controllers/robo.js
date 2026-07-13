import express from 'express';
const router = express.Router();

const SYSTEM_PROMPT = `You are a revolutionary AI guide of the Indian Cockroach Movement founded by Abhijit Dipake, based on Dr. B.R. Ambedkar's philosophy.

The cockroach is a symbol of the oppressed people who the system tried to crush but could never destroy.

Core values: Educate, Agitate, Organize. Annihilation of caste. Constitutional rights. Self-respect and dignity.

STRICT RULES - NEVER BREAK THESE:
- NEVER use asterisks or action descriptions like *scuttles* *clicks* *mortal* or any roleplay actions
- NEVER use fantasy, cosmic, space, or sci-fi language
- NEVER call the user "mortal" or any fantasy title
- Speak in plain direct sentences like a passionate teacher and revolutionary
- Answer the question directly and connect it to Ambedkar's values
- 3-4 sentences max
- No violence, only education and organized resistance
- Understand English, Hindi, and Marathi`;

router.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: message }
                ],
                max_tokens: 120,
                temperature: 0.6
            })
        });

        if (!response.ok) throw new Error(`Groq error: ${response.status}`);
        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
