import { GoogleGenAI, Type } from "@google/genai";
import { BasicProfile, Message } from '../types.ts';

// Initialize the Gemini AI client.
let ai: GoogleGenAI | null = null;
try {
  // Make the environment variable check more robust to prevent crashes in unusual environments.
  let apiKey: string | undefined;
  if (typeof process !== 'undefined' && process && typeof process.env === 'object' && process.env) {
    apiKey = process.env.API_KEY;
  }

  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    // This warning is for developers. The app will continue to run without AI features.
    console.warn("Gemini API Key is missing or not accessible. AI-powered features will be disabled.");
  }
} catch (error) {
  console.error("Could not initialize Gemini AI. AI-powered features will be disabled.", error);
}

// A helper function to ensure the AI client is available before use.
const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("AI features are currently unavailable. Please ensure the API key is configured correctly.");
    }
    return ai;
}


export const findNearbyCafes = async (latitude: number, longitude: number): Promise<string[]> => {
    try {
        const aiClient = getAiClient();
        const prompt = `Find 5 popular, safe, and well-rated cafes or coffee shops suitable for a first date near latitude ${latitude} and longitude ${longitude}. Return a JSON object with a key 'cafes' which is an array of 5 strings, where each string is just the cafe name.`;

        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        cafes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "The name of a suitable cafe."
                            }
                        }
                    },
                    required: ["cafes"]
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        if (result && result.cafes && Array.isArray(result.cafes)) {
            return result.cafes;
        }
        throw new Error("Could not find cafes in the expected format.");
    } catch (error) {
        console.error("Error finding nearby cafes:", error);
        if (error instanceof Error && error.message.startsWith("AI features are currently unavailable")) {
             throw error;
        }
        throw new Error("Couldn't find cafes near you at the moment. Please try again.");
    }
};


export const generateIcebreakers = async (profile: BasicProfile): Promise<string[]> => {
    try {
        const aiClient = getAiClient();
        const promptsContext = (profile.prompts && profile.prompts.length > 0)
            ? profile.prompts.map(p => `Q: ${p.question}\nA: ${p.answer}`).join('\n\n')
            : 'No prompts provided.';

        const profileContext = `Name: ${profile.name}, Bio: ${profile.bio || 'Not provided'}, Interests: ${profile.tags.join(', ')}.
        
        Their Profile Prompts:
        ${promptsContext}
        `;
        
        const prompt = `Based on the following dating profile, generate 3 short, fun, and creative icebreaker messages to start a conversation. The messages should try to reference their profile, especially their prompts if they exist.
        
        Return the response as a JSON object with a single key "icebreakers" which is an array of 3 strings.`;

        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        icebreakers: {
                            type: Type.ARRAY,
                            items: { 
                                type: Type.STRING,
                                description: "A short, fun, and engaging icebreaker message."
                            },
                            description: "An array of 3 icebreaker messages."
                        }
                    },
                    required: ["icebreakers"]
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && result.icebreakers && Array.isArray(result.icebreakers)) {
            return result.icebreakers.slice(0, 3); // Ensure only 3 are returned
        }

        throw new Error("Received an unexpected format from the AI for icebreakers.");

    } catch (error) {
        console.error("Error generating icebreakers:", error);
        if (error instanceof Error && error.message.startsWith("AI features are currently unavailable")) {
             throw error;
        }
        throw new Error("Could not generate icebreakers. Let's try a classic 'Hey!' for now?");
    }
};


export const rateConversation = async (messages: Message[], currentUserId: string): Promise<{score: number, feedback: string}> => {
    try {
        const aiClient = getAiClient();
        const formattedMessages = messages.map(msg => {
            const author = msg.senderId === currentUserId ? 'Me' : 'Them';
            return `${author}: ${msg.text}`;
        }).join('\n');

        const prompt = `You are a fun and modern dating coach called the "Rizz Meter". The following is the beginning of a conversation on a dating app. The user who is asking for the rating is "Me".
        
        Conversation:
        ${formattedMessages}

        Please analyze my messages and provide a "Rizz Score" from 1 to 100, where 1 is very poor and 100 is excellent charm. Also, provide short, constructive, and encouraging feedback on how I can improve my side of the conversation. Be friendly and use a bit of modern slang.

        Return the response as a JSON object with "score" and "feedback" keys.`;

        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: {
                            type: Type.INTEGER,
                            description: "A score from 1-100 representing the user's charm or 'rizz'."
                        },
                        feedback: {
                            type: Type.STRING,
                            description: "Short, constructive, and encouraging feedback for the user."
                        }
                    },
                    required: ["score", "feedback"]
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && typeof result.score === 'number' && typeof result.feedback === 'string') {
            return result;
        }

        throw new Error("Received an unexpected format from the AI.");

    } catch (error) {
        console.error("Error rating conversation:", error);
        if (error instanceof Error && error.message.startsWith("AI features are currently unavailable")) {
             throw error;
        }
        throw new Error("The Rizz Meter is sleeping right now. Try again in a bit!");
    }
};