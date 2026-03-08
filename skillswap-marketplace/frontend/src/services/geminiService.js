const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`

export async function askGemini(userMessage, context = '') {
  const systemPrompt = `You are SkillSwap AI Assistant, a helpful assistant for a local skill marketplace platform.
Your job is to help customers find the right service providers and answer questions about available skills and services.
${context ? `\nCurrent platform context:\n${context}` : ''}

Be concise, friendly, and helpful. Format responses in a clear, readable way.
When suggesting providers, mention their skills, ratings, and why they'd be a good fit.`

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser question: ${userMessage}` }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.8,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ]
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'Gemini API error')
    }

    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.'
  } catch (error) {
    console.error('Gemini error:', error)
    throw error
  }
}

export async function askGeminiWithHistory(messages, context = '') {
  const systemContext = `You are SkillSwap AI Assistant for a local skill marketplace. Help users find providers, understand services, and navigate the platform. Be concise and friendly.${context ? `\n\nPlatform data: ${context}` : ''}`

  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))

  if (contents.length > 0 && contents[0].role === 'user') {
    contents[0].parts[0].text = `${systemContext}\n\n${contents[0].parts[0].text}`
  }

  const payload = {
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Gemini API failed')
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'
}
