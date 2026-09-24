const { ollamaBaseUrl, ollamaModel } = require('../../config/env');

// Thin wrapper around a locally-running Ollama server (https://ollama.com).
// No API key, no external network call -- everything stays on the machine
// running the backend. Returns null (not a throw) if Ollama isn't reachable
// or isn't running, so callers fall back to the heuristic classifier instead
// of failing the request.
//
// Requires Ollama running locally with a model pulled, e.g.:
//   ollama pull llama3.1
//   ollama serve   (usually already running as a background service)
async function callLocalLLM(systemPrompt, userPrompt) {
  try {
    const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        options: { temperature: 0.2 },
      }),
      // Local inference can be slow on CPU-only machines; don't wait forever.
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error('[ai] Local LLM error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data?.message?.content ?? null;
  } catch (err) {
    // ECONNREFUSED (Ollama not running), timeout, or model not pulled --
    // any of these should silently fall back, not crash the request.
    console.error('[ai] Local LLM call failed, falling back to heuristic:', err.message);
    return null;
  }
}

module.exports = { callLocalLLM };
