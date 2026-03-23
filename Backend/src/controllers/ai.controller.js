import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateVideoSummary = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required for AI summary");
    }

    // 1. Initialize the AI with your Key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 // 🚀 The current "efficiency king" for summarization
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // 2. The "Prompt" - This is how you talk to the AI
    const prompt = `
        You are an expert content analyzer for a video platform called VisionTube.
        Based on the following video details, provide a concise 3-bullet point summary.
        
        Video Title: ${title}
        Video Description: ${description}
        
        Format the response as plain text with bullet points starting with "•". 
        Keep it professional and engaging.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res
            .status(200)
            .json(new ApiResponse(200, { summary: text }, "AI Summary generated successfully"));
    } catch (error) {
        console.error("Gemini AI Error:", error);
        throw new ApiError(500, "AI Service is currently busy. Please try again later.");
    }
});

export { generateVideoSummary };