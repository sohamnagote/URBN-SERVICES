import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env';
import { logger } from '../config/logger';

class AIGroundingService {
  private aiClient: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.aiClient) {
      if (!ENV.GEMINI_API_KEY) {
        logger.warn('GEMINI_API_KEY is not set. Real-time Maps Grounding requests will operate in fallback mode.');
      }
      this.aiClient = new GoogleGenAI({
        apiKey: ENV.GEMINI_API_KEY || '',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.aiClient;
  }

  public async queryMapsGrounding(prompt: string, locality?: string) {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      const ai = this.getClient();
      const nashikContext = locality
        ? `You are an expert Nashik local logistics and service route assistant for URBN Services in Nashik, Maharashtra, India. Current user locality: ${locality}, Nashik.`
        : `You are an expert Nashik local logistics and service route assistant for URBN Services in Nashik, Maharashtra, India.`;

      const fullPrompt = `${nashikContext}
User Query: ${prompt}
Provide precise, real-time location details, hardware shops, route conditions, or landmarks in Nashik. If suggesting places, include name, locality, and why it is relevant.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: fullPrompt,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      return {
        text: response.text || 'No response generated.',
        groundingMetadata: response.candidates?.[0]?.groundingMetadata || null,
        locality: locality || 'Nashik',
      };
    } catch (error: any) {
      logger.error('Error in Gemini Maps Grounding:', error);
      return {
        text: `Here are local service and hardware recommendations for ${locality || 'Nashik'}: Popular hubs include Gangapur Road Hardware Market, College Road Electricals, and Canada Corner spare parts centers.`,
        groundingMetadata: null,
        locality: locality || 'Nashik',
        fallback: true,
      };
    }
  }

  public async getRouteAdvice(originLocality?: string, destinationLocality?: string, serviceType?: string) {
    try {
      const ai = this.getClient();
      const prompt = `Provide real-time route recommendation and ETA insights for a home service technician in Nashik, Maharashtra.
Origin: ${originLocality || 'Gangapur Road Hub, Nashik'}
Destination: ${destinationLocality || 'Indira Nagar, Nashik'}
Service: ${serviceType || 'Plumbing Repair'}

Detail the best transit route in Nashik (mentioning key roads like Gangapur Rd, Trimbak Rd, Mumbai-Agra Highway NH-60, Canada Corner, College Rd, or Untwadi Rd), estimated travel time considering typical Nashik city traffic, and any important landmark checkpoints.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      return {
        routeSummary: response.text || 'Direct route via main arterial roads in Nashik with nominal 12-18 mins transit time.',
        groundingMetadata: response.candidates?.[0]?.groundingMetadata || null,
      };
    } catch (error: any) {
      logger.error('Error in Gemini Route Advisor:', error);
      return {
        routeSummary: 'Direct route via main arterial roads in Nashik with nominal 12-18 mins transit time.',
        groundingMetadata: null,
        fallback: true,
      };
    }
  }
}

export const aiGroundingService = new AIGroundingService();
