// generateText.mjs
import { GoogleGenerativeAI } from '@google/generative-ai';



// Function to generate content using Gemini model
export async function Gemini(prompt) {
    try {
        // Initialize the generative AI client
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GenAPI);
        
        // Select the Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Generate content based on the prompt
        const result = await model.generateContent(prompt);
        console.log(result.response.text());
        // Return the generated text
        return result.response.text();
    } catch (error) {
        console.error('Error:', error); // Log the error
        throw new Error("Error generating text."); // Throw error for external handling
    }
}
