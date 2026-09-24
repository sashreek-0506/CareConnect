const ServiceCategory = require('../../models/ServiceCategory');
const { callLocalLLM } = require('./localLlmClient');

// --- Heuristic fallback: keyword-overlap scoring against category names,
// descriptions, and requiredSkills. Used when the local LLM isn't reachable
// (Ollama not running / model not pulled) or returns something unparsable,
// so classification always works even with no LLM available at all. ---
function heuristicClassify(description, categories) {
  const text = description.toLowerCase();
  const words = new Set(text.split(/\W+/).filter(Boolean));

  let best = null;
  let bestScore = 0;

  for (const cat of categories) {
    const haystack = [cat.name, cat.description, ...(cat.requiredSkills || [])]
      .join(' ')
      .toLowerCase();
    const haystackWords = haystack.split(/\W+/).filter(Boolean);

    let score = 0;
    for (const w of haystackWords) {
      if (w.length > 2 && words.has(w)) score += 1;
      if (text.includes(cat.name.toLowerCase())) score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }

  if (!best) {
    return { categoryId: null, categoryName: null, skills: [], confidence: 0 };
  }

  // Normalize a rough score into a 0-1 confidence band.
  const confidence = Math.min(0.4 + bestScore * 0.08, 0.95);

  return {
    categoryId: best._id,
    categoryName: best.name,
    skills: best.requiredSkills || [],
    confidence: Number(confidence.toFixed(2)),
  };
}

// --- Public entry point: classifies free-text into a ServiceCategory + skills. ---
async function classifyRequest(description) {
  const categories = await ServiceCategory.find({ isActive: true }).lean();

  const aiText = await callLocalLLM(
    'You are a classifier for a home-services marketplace. Given a customer\'s free-text ' +
      'service request and a list of valid categories, respond with ONLY a JSON object of the ' +
      'shape {"categoryName": string, "skills": string[], "confidence": number between 0 and 1}. ' +
      'Pick the single best matching categoryName from the provided list exactly as written. ' +
      'No prose, no markdown fences, just the JSON object.',
    `Valid categories: ${categories.map((c) => c.name).join(', ')}\n\nRequest: "${description}"`
  );

  if (aiText) {
    try {
      const cleaned = aiText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const match = categories.find(
        (c) => c.name.toLowerCase() === String(parsed.categoryName || '').toLowerCase()
      );
      if (match) {
        return {
          categoryId: match._id,
          categoryName: match.name,
          skills: parsed.skills && parsed.skills.length ? parsed.skills : match.requiredSkills,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
          source: 'ai',
        };
      }
    } catch (err) {
      console.error('[ai] Failed to parse classification response, falling back to heuristic.', err.message);
    }
  }

  return { ...heuristicClassify(description, categories), source: 'heuristic' };
}

module.exports = { classifyRequest, heuristicClassify };
