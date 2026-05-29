import { getApprovedVenues } from '@/backend/firebase/firestore';
import { callLLM, ChatMessage } from '@/backend/ai/llm';

export async function handleConciergeRequest(
  message: string,
  history: { role: string; content: string }[],
  mode: 'discovery' | 'guidance' = 'discovery'
) {
  // ── LIVE FIRESTORE GROUNDING ───────────────────────────────────────────
  // Firestore is the single source of truth. No static fallback.
  // If there are no venues, we inform the AI so it can respond honestly.
  const liveVenues = await getApprovedVenues().catch(() => []);

  const venueContext = liveVenues.map((v) => ({
    id: v.id,
    name: v.name,
    sport: v.sport,
    area: v.area,
    price: v.price,
    rating: v.rating,
    skillLevel: v.skillLevel,
    amenities: v.amenities,
    available: v.available,
    description: v.description,
    timings: `${v.timings?.open ?? 'N/A'} – ${v.timings?.close ?? 'N/A'}`,
  }));

  const noVenuesMessage = venueContext.length === 0
    ? `\n\nIMPORTANT: There are currently NO venues listed on the platform. Politely inform the user that PlaySphere AI is a new marketplace and venue owners are still onboarding. Encourage them to check back soon or suggest they sign up as a venue owner if they have a sports facility.`
    : '';

  let modeInstructions = '';
  if (mode === 'guidance') {
    modeInstructions = `You are currently in GUIDANCE MODE.
Your focus is to provide lightweight sports tips, basic rules, workout timing advice, and beginner suggestions.
- Keep it lightweight. Do NOT create coaching programs, act as a health advisor, medical consultant, or life assistant.
- Provide simple rules, gear tips, warm-up habits, and suggestions on the best timing to book slots to save money (afternoon slots are 15% cheaper).
- If appropriate, refer to suitable active venues from the database below (never invent them).`;
  } else {
    modeInstructions = `You are currently in DISCOVERY MODE.
Your focus is to provide venue search, comparisons, alternatives, and marketplace booking assistance.
- Filter, search, and recommend the best matching venues from the database below matching their sport, location, price, skill, or timing preferences.
- Explain clearly why they match (E.g. price, location, amenities).
- If a slot/venue is unavailable, recommend the closest alternative from the database below.
- Factor in peak pricing differences clearly: Morning (5-8 AM) = normal, Afternoon (11-4 PM) = 15% cheaper, Evening (5-10 PM) = 30% more expensive.`;
  }

  const systemPrompt = `You are PlaySphere AI — a helpful, conversational sports concierge for Lucknow, India.

${modeInstructions}

You have access to the following LIVE sports venues database (${venueContext.length} venues, sourced in real-time from Firestore):
${venueContext.length > 0 ? JSON.stringify(venueContext, null, 2) : '[]'}
${noVenuesMessage}

STRICT GROUNDING RULES:
1. AI is NOT the search engine. Firestore is the single source of truth.
2. AI must NEVER invent venues or hallucinate names.
3. Only recommend venues that are explicitly in the database provided above. If no match is found, state that honestly. Do not make up fallbacks.
4. Response should be concise, helpful, and highly grounded.
5. All prices are in Indian Rupees (₹). Lucknow areas include: Gomti Nagar, Gomti Nagar Extension, Aliganj, Hazratganj, Indira Nagar, Chowk, Ashiyana, Sultanpur Road, Aishbagh.

Response Format:
- Start with a brief, friendly acknowledgment.
- Keep recommendations to 1-3 venues with exact names.
- Mention pricing insights (afternoon discount etc.) if relevant.
- End with a next step or action.`;

  // Build chat with history in OpenAI format
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt }
  ];

  if (history && Array.isArray(history)) {
    history.forEach((msg: { role: string; content: string }) => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    });
  }

  messages.push({ role: 'user', content: message });

  const response = await callLLM(messages);
  return response;
}
