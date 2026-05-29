export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  max_tokens?: number;
}

/**
 * Calls a hosted LLM API that provides an OpenAI-compatible /chat/completions endpoint.
 * Requires LLM_API_URL, LLM_API_KEY, and LLM_MODEL in environment variables.
 */
export async function callLLM(messages: ChatMessage[], options?: LLMOptions): Promise<string> {
  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || 'llama-3.1-8b-instant';

  if (!apiUrl || !apiKey) {
    throw new Error('LLM_API_URL or LLM_API_KEY is not configured in environment variables.');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LLM API Error (${response.status}):`, errorText);
      throw new Error(`LLM API failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling LLM:', error);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('LLM request timed out after 30 seconds.');
    }
    throw error;
  }
}
