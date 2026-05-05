const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API endpoint to generate bullets
app.post('/api/generate-bullets', async (req, res) => {
    try {
        const { role, experience } = req.body;

        if (!role || !experience) {
            return res.status(400).json({ error: 'Role and experience are required' });
        }

        const prompt = `You are a professional resume writer. Generate 12-15 professional resume bullet points for the following:

Role: ${role}
Experience/Project: ${experience}

Requirements:
- Start each bullet with a strong action verb (Developed, Built, Implemented, Designed, Created, Led, Managed, Optimized, etc.)
- Include specific technologies or methods mentioned
- Add quantifiable metrics or impact when possible
- Keep each bullet concise (1-2 lines)
- Use professional resume language
- Provide variety in the action verbs and focus areas
- Format: Return ONLY the bullet points, one per line, without bullet symbols or numbers

Generate 12-15 resume bullets now:`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
                'X-Title': 'AI Resume Bullet Generator'
            },
            body: JSON.stringify({
                model: 'openrouter/auto:free',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errBody}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();

        // Split by newlines and filter out empty lines
        const bullets = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[-•*]\s*/, '')) // Remove any bullet symbols
            .map(line => line.replace(/^\d+\.\s*/, '')); // Remove any numbers

        res.json({ bullets });

    } catch (error) {
        console.error('Error generating bullets:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
