import { getAllVenues } from '@/backend/firebase/firestore';
import { callLLM } from '@/backend/ai/llm';

export async function handleDiscoverRequest() {
  // 1. Fetch all venues
  const venues = await getAllVenues().catch(() => []);

  if (venues.length === 0) {
    return [
      {
        type: 'gap',
        title: 'Marketplace Launching',
        description: 'PlaySphere AI has just launched in Lucknow! Venue owners are currently listing their facilities.',
        emoji: '🚀',
        urgency: 'high'
      },
      {
        type: 'opportunity',
        title: 'List Your Venue',
        description: 'Are you a venue owner in Lucknow? Register now to list your sports facility and receive bookings.',
        emoji: '🏢',
        urgency: 'medium'
      },
      {
        type: 'value',
        title: 'Opening Specials',
        description: 'Keep checking back for early booking discounts and exclusive rates on Lucknow sports spaces.',
        emoji: '🏷️',
        urgency: 'low'
      }
    ];
  }

  // Calculate real Firestore metrics
  const activeApproved = venues.filter((v) => v.available && v.approvalStatus === 'approved');
  const activeCount = activeApproved.length;
  const totalCount = venues.length;

  const facts: string[] = [];
  facts.push(`PlaySphere has ${totalCount} registered venues in total, with ${activeCount} active and approved venues currently available for booking.`);

  // Compute sport distribution
  const sportCounts: Record<string, number> = {};
  activeApproved.forEach((v) => {
    sportCounts[v.sport] = (sportCounts[v.sport] || 0) + 1;
  });
  Object.entries(sportCounts).forEach(([sport, count]) => {
    facts.push(`There are only ${count} active and approved ${sport} venues available across all of Lucknow.`);
  });

  // Compute area distribution
  const areaCounts: Record<string, number> = {};
  activeApproved.forEach((v) => {
    areaCounts[v.area] = (areaCounts[v.area] || 0) + 1;
  });
  Object.entries(areaCounts).forEach(([area, count]) => {
    facts.push(`Grounded stats: Area "${area}" has exactly ${count} active venue(s).`);
  });

  // Find lowest price
  if (activeApproved.length > 0) {
    const sortedByPrice = [...activeApproved].sort((a, b) => a.price - b.price);
    const cheapest = sortedByPrice[0];
    facts.push(`Cheapest active venue is "${cheapest.name}" located in "${cheapest.area}" priced at ₹${cheapest.price}/hr for ${cheapest.sport}.`);
  }

  const systemPrompt = `You are a grounded data formatting assistant for PlaySphere AI.
You will generate exactly 3 insights based ONLY on the verified Lucknow sports database facts provided below.
Do NOT invent any other facts, opportunities, numbers, or areas.

Verified Lucknow Database Facts:
${facts.map((f) => `- ${f}`).join('\n')}

Output Requirements:
Return a raw JSON object containing an array of 3 insights under the key "insights". Do NOT wrap the JSON in markdown code blocks.
Each insight must follow this interface:
{
  "type": "gap" | "opportunity" | "trend" | "value",
  "title": string (max 4 words, E.g., "Football Turf Scarcity", "Best Value Badminton"),
  "description": string (exactly 1 or 2 sentences explaining the fact and numbers from the database),
  "area": string (optional, the affected area from facts),
  "sport": string (optional, the affected sport from facts),
  "emoji": string (1 relevant emoji),
  "urgency": "high" | "medium" | "low"
}

Make sure types map well: E.g., "gap" for sports with low counts (< 3), "value" for the cheapest venue, "opportunity" for areas with low active density or low counts.`;

  try {
    const response = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate the JSON insights based strictly on the verified facts above.' }
    ], {
      temperature: 0.2,
    });

    const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);
    return data.insights || [];
  } catch (error) {
    console.error('Failed to generate or parse grounded discovery insights:', error);
    // Graceful fallback
    return [
      {
        type: 'gap',
        title: 'Sports Scarcity',
        description: `Currently, there are only ${activeCount} active venues available for sports bookings in Lucknow.`,
        emoji: '🏸',
        urgency: 'high'
      },
      {
        type: 'value',
        title: 'Cheapest Play',
        description: activeApproved.length > 0
          ? `Best rate found at ₹${activeApproved[0].price}/hr for ${activeApproved[0].sport}.`
          : 'Affordable slots are available for morning/afternoon play.',
        emoji: '🏷️',
        urgency: 'medium'
      },
      {
        type: 'opportunity',
        title: 'Marketplace Density',
        description: 'New venues are registering daily across Gomti Nagar, Indira Nagar and Aliganj.',
        emoji: '📈',
        urgency: 'low'
      }
    ];
  }
}
