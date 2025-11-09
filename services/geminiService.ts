import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { UserLocation, GroundingSource, PlaceType, DiscoveredPlace } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Add missing createPlaceCategory function to generate details for a new user-defined category.
export async function createPlaceCategory(categoryName: string): Promise<{ description: string; emoji: string; promptContext: string; }> {
    const prompt = `Generate details for a new category in a location-based discovery app. The category is "${categoryName}". Provide a suitable emoji, a short description, and a friendly prompt context for a chat assistant.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            emoji: {
                type: Type.STRING,
                description: 'A single emoji that represents the category. e.g., ☕️',
            },
            description: {
                type: Type.STRING,
                description: 'A short, one-sentence description of the category. e.g., "Find the best coffee and pastries."',
            },
            promptContext: {
                type: Type.STRING,
                description: 'A friendly, welcoming one-sentence prompt for a chat assistant. e.g., "Hi there! I can help you find a great coffee shop nearby. What are you looking for?"',
            },
        },
        required: ['emoji', 'description', 'promptContext'],
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        const result = JSON.parse(response.text);
        
        if (typeof result.emoji !== 'string' || typeof result.description !== 'string' || typeof result.promptContext !== 'string') {
            throw new Error("Invalid response structure from Gemini API");
        }
        
        return result;

    } catch (error) {
        console.error(`Failed to create category details for "${categoryName}":`, error);
        throw new Error(`Could not generate details for ${categoryName}.`);
    }
}

export async function reverseGeocode(location: UserLocation): Promise<string> {
    const prompt = `What is the city and state/country for the coordinates latitude: ${location.latitude}, longitude: ${location.longitude}? Provide a short, common name like 'San Francisco, CA' or 'London'.`;

    const toolConfig = {
        retrievalConfig: {
            latLng: {
                latitude: location.latitude,
                longitude: location.longitude,
            }
        }
    };
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig,
            },
        });
        
        return response.text.trim();

    } catch (error) {
        console.error("Failed to reverse geocode:", error);
        return "Your Location"; // Fallback
    }
}

export async function discoverPlaces(category: PlaceType, location: UserLocation | null): Promise<DiscoveredPlace[]> {
    const prompt = `List 5 popular ${category.name} near the user. Your response must be a valid JSON array of objects. Each object must have a "name", a "description", a unique single "emoji" that represents that specific place, and a "rating" (number between 0 and 5, representing the average user rating). Only output the raw JSON array, with no other text, explanation, or markdown formatting.`;

    const toolConfig = location ? {
        retrievalConfig: {
            latLng: {
                latitude: location.latitude,
                longitude: location.longitude,
            }
        }
    } : undefined;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig,
            },
        });
        
        let jsonString = response.text.trim();
        
        const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1];
        } else {
            const arrayStartIndex = jsonString.indexOf('[');
            const arrayEndIndex = jsonString.lastIndexOf(']');
            if (arrayStartIndex !== -1 && arrayEndIndex !== -1) {
                jsonString = jsonString.substring(arrayStartIndex, arrayEndIndex + 1);
            }
        }
        
        const places = JSON.parse(jsonString);
        
        if (!Array.isArray(places)) {
            console.error("Parsed response is not an array:", places);
            return [];
        }

        return places.map((place, index) => ({
            id: `${category.id}-${index}`,
            name: place.name,
            description: place.description,
            emoji: place.emoji || category.emoji, // Fallback to category emoji
            rating: place.rating ? parseFloat(place.rating) : undefined
        }));

    } catch (error) {
        console.error("Failed to discover places:", error);
        return [];
    }
}


export function createChatSession(placeName: string, location: UserLocation | null): Chat {
  const systemInstruction = `You are a helpful local expert assistant for ${placeName}. 
Provide concise, informative, and friendly answers. 
When asked about reservations or bookings, guide the user on typical procedures but clarify you cannot make reservations for them.
Use the provided tools to get up-to-date and location-aware information.`;

  const toolConfig = location ? {
    retrievalConfig: {
      latLng: {
        latitude: location.latitude,
        longitude: location.longitude,
      }
    }
  } : undefined;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
      toolConfig: toolConfig,
    },
  });
}

export function extractGroundingSources(response: any): GroundingSource[] {
    const sources: GroundingSource[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (!groundingMetadata?.groundingChunks) return [];

    for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web) {
            sources.push({ type: 'web', uri: chunk.web.uri, title: chunk.web.title });
        } else if (chunk.maps) {
            sources.push({ type: 'maps', uri: chunk.maps.uri, title: chunk.maps.title });
        }
    }
    return sources;
}