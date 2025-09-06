import { GroqCompletionResponse } from '@shared-types/index';

/**
 * Fetches a chat completion from the Groq API.
 * @param groqApiKey The API key for Groq.
 * @param message The user's message.
 * @returns A Promise that resolves to the AI's response string.
 * @throws An Error if the Groq API call fails.
 */
export async function getGroqChatCompletion(groqApiKey: string, message: string): Promise<string> {
  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant. Keep responses concise and to the point.' },
        { role: 'user', content: message },
      ],
      temperature: 0.5,
      max_completion_tokens: 150,
    }),
  });

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text();
    console.error('Groq API Error:', groqResponse.status, errorText);
    throw new Error(`Groq API call failed with status ${groqResponse.status}: ${errorText}`);
  }

  const groqData: GroqCompletionResponse = await groqResponse.json();
  const aiResponse = groqData.choices[0]?.message?.content || 'No response from AI.';

  return aiResponse;
}