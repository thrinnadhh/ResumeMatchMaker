import { GoogleGenAI } from "@google/genai";
import { ResumeDetails } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const parseJsonResponse = <T,>(jsonString: string): T | null => {
    let cleanJsonString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanJsonString.match(fenceRegex);
    if (match && match[2]) {
        cleanJsonString = match[2].trim();
    }

    try {
        return JSON.parse(cleanJsonString) as T;
    } catch (error) {
        console.error("Failed to parse JSON response:", error);
        console.error("Original string:", jsonString);
        return null;
    }
};

export const extractDetailsFromResume = async (resumeText: string): Promise<Omit<ResumeDetails, 'fileName'>> => {
  const prompt = `
    You are a highly accurate resume parsing engine. Your task is to meticulously extract contact and profile information from the provided resume text.
    You MUST return the information in a single, valid JSON object. Do not include any text, explanations, or markdown fences like \`\`\`json around the output.

    The required JSON schema is:
    {
      "name": "string | null",
      "email": "string | null",
      "phone": "string | null",
      "linkedin_url": "string | null",
      "github_url": "string | null",
      "address": "string | null"
    }

    **Extraction Rules:**
    1.  **Name:** The candidate's full name is almost always one of the first lines at the very top of the resume. It should not contain numbers or special characters besides hyphens or apostrophes.
    2.  **Email:** Find the primary email address.
    3.  **Phone:** Find the main phone number.
    4.  **LinkedIn/GitHub:** Find the full URLs to their profiles. If you find a username, construct the full URL (e.g., /in/johndoe -> https://www.linkedin.com/in/johndoe).
    5.  **Address:** Extract the full mailing address (street, city, state, zip).
    6.  **Null Values:** If any field cannot be found, its value in the JSON object MUST be null.

    Resume Text:
    ---
    ${resumeText}
    ---
  `;
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0,
        },
    });

    const parsed = parseJsonResponse<Omit<ResumeDetails, 'fileName'>>(response.text);

    return parsed || { name: 'Parsing Failed', email: null, phone: null, linkedin_url: null, github_url: null, address: null };

  } catch(e) {
      console.error("Error extracting details from resume:", e);
      return { name: 'API Error', email: null, phone: null, linkedin_url: null, github_url: null, address: null };
  }
};

export const advancedMatch = async (resumeText: string, jobDescText: string, customKeywords?: string): Promise<{ score: number; justification: string }> => {
  const customKeywordsPromptSection = customKeywords
    ? `
    In addition to the job description, give special consideration to these keywords when evaluating the resume. They may represent important soft skills or specific requirements:
    ---
    ${customKeywords}
    ---
    `
    : '';

  const prompt = `
    You are an expert technical recruiter providing a standardized, objective analysis. Your task is to score the provided resume against the given job description and optional keywords.
    You MUST return your analysis as a single, valid JSON object with two keys: "score" (a number from 0 to 100) and "justification" (a brief, one-sentence string explaining the score).
    Do not include any text, explanations, or markdown fences like \`\`\`json around the output.

    **Scoring Rubric (Be strict and consistent):**
    - **90-100:** Excellent fit. The resume strongly aligns with all or nearly all key requirements, skills, and experience levels mentioned in the job description.
    - **70-89:** Strong candidate. The resume aligns with most of the key requirements, with only minor gaps in skills or experience.
    - **50-69:** Potential fit. The resume shows some alignment but is missing several key requirements or the experience level is significantly lower than requested.
    - **0-49:** Not a good fit. The resume has significant gaps and does not align with the core requirements of the role.

    Analyze the resume's experience, skills, and qualifications against the criteria below.
    ${customKeywordsPromptSection}
    Job Description:
    ---
    ${jobDescText}
    ---

    Resume:
    ---
    ${resumeText}
    ---
  `;

  try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0, // Set to 0 for deterministic and consistent scoring
        },
      });

      const parsed = parseJsonResponse<{ score: number; justification: string }>(response.text);

      return parsed || { score: 0, justification: "Failed to get a valid score from the AI model." };
  } catch(e) {
      console.error("Error performing advanced match:", e);
      return { score: 0, justification: "An API error occurred during matching." };
  }
};