// src/services/ai.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const serviceRepo = require('../repositories/service.repository');
const { ApiError } = require('../utils/response.utils');
const { withCache } = require('../utils/cache.utils');
const logger = require('../utils/logger');

let genAI = null;

function getGenAI() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) throw ApiError.internal('Gemini API key not configured');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

class AIService {
  async recommend({ requirement, budget, location, category }) {
    if (!requirement || requirement.trim().length < 5) {
      throw ApiError.badRequest('Please provide a detailed requirement (min 5 chars)');
    }

    const cacheKey = `ai:recommend:${Buffer.from(requirement + budget + location + category).toString('base64').slice(0, 40)}`;

    return withCache(cacheKey, 60, async () => {
      // Fetch top services for context
      const services = await serviceRepo.findForAI(50);

      if (services.length === 0) {
        return { recommendations: [], message: 'No services available yet.' };
      }

      // Build a concise service catalogue for the model
      const catalogue = services.map((s, i) => ({
        index: i + 1,
        id: s._id,
        title: s.title,
        category: s.category,
        description: s.description.slice(0, 200),
        price: `${s.pricing.amount} ${s.pricing.currency}/${s.pricing.type}`,
        rating: s.rating.average,
        reviews: s.rating.count,
        provider: s.providerId?.name,
        providerRating: s.providerId?.rating?.average,
        skills: s.providerId?.skillsOffered?.slice(0, 5),
        remote: s.isRemote,
        city: s.location?.city,
      }));

      const prompt = `
You are an expert skill-exchange marketplace assistant.

User requirement: "${requirement}"
${budget ? `Budget: ${budget}` : ''}
${location ? `Preferred location: ${location}` : ''}
${category ? `Preferred category: ${category}` : ''}

Available services catalogue (JSON):
${JSON.stringify(catalogue, null, 2)}

Task: Analyze the user's requirement and return the TOP 5 most relevant services.
Consider: relevance to requirement, provider rating, price-to-value, location match (if specified), budget fit.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "recommendations": [
    {
      "rank": 1,
      "serviceId": "<_id from catalogue>",
      "title": "<service title>",
      "provider": "<provider name>",
      "price": "<price>",
      "rating": <number>,
      "matchScore": <0-100>,
      "reasoning": "<2-3 sentence explanation of why this matches the requirement>",
      "highlights": ["<point 1>", "<point 2>", "<point 3>"]
    }
  ],
  "summary": "<brief paragraph summarising your recommendations for the user>"
}`;

      let result;
      try {
        const ai = getGenAI();
        const model = ai.getGenerativeModel({
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        });
        const response = await model.generateContent(prompt);
        result = response.response.text();
      } catch (err) {
        logger.error('Gemini API error:', err.message);
        throw ApiError.internal('AI recommendation service temporarily unavailable');
      }

      // Clean and parse JSON response
      try {
        const cleaned = result.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        // Enrich with full service objects for frontend
        const enriched = parsed.recommendations.map((rec) => {
          const full = services.find((s) => s._id.toString() === rec.serviceId);
          return { ...rec, serviceDetails: full || null };
        });

        return { ...parsed, recommendations: enriched };
      } catch (parseErr) {
        logger.error('Failed to parse Gemini response:', parseErr.message, '\nRaw:', result);
        throw ApiError.internal('Failed to parse AI recommendations');
      }
    });
  }
}

module.exports = new AIService();
