import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini Pro Vision
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');

export interface DiagnosisResult {
  issue: string;
  confidence: number;
  repairs: {
    steps: string[];
    difficulty: string;
    estimatedTime: string;
    requiredTools: string[];
    professionalAdvice: string;
  };
  warnings: string[];
  severity?: 'low' | 'medium' | 'high';
  description?: string;
  estimatedCost?: string;
  steps?: string[];
}

export async function analyzeVehicleImage(imageBase64: string): Promise<DiagnosisResult> {
  try {
    // Get the model - using the newer version
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Convert base64 to proper format
    const imageData = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
        mimeType: 'image/jpeg'
      }
    };

    // Prepare the prompt with more specific automotive focus
    const prompt = `You are an expert automotive diagnostic system. Analyze this vehicle image and provide:
    1. Identify any visible issues, damage, or abnormal conditions
    2. Confidence level in the diagnosis (as a decimal between 0 and 1)
    3. Detailed step-by-step repair instructions if applicable
    4. List of required tools and estimated repair time
    5. Professional service recommendation if needed
    
    Focus on:
    - Visible mechanical issues
    - Body damage
    - Fluid leaks
    - Tire conditions
    - Warning lights
    - Unusual wear patterns
    
    IMPORTANT: Return ONLY the JSON object without any markdown formatting or code blocks.
    
    Response format:
    {
      "issue": "Brief description of the problem",
      "confidence": 0.85,
      "repairs": {
        "steps": ["Step 1", "Step 2", "Step 3"],
        "difficulty": "Beginner|Intermediate|Advanced",
        "estimatedTime": "Time estimate",
        "requiredTools": ["Tool 1", "Tool 2"],
        "professionalAdvice": "Recommendation about professional service"
      },
      "warnings": ["Warning 1", "Warning 2"]
    }`;

    // Generate content with safety timeout
    const result = await Promise.race([
      model.generateContent([prompt, imageData]) as Promise<any>,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analysis timeout')), 30000)
      )
    ]);

    if (!result || typeof result === 'string') {
      throw new Error('Analysis timeout or invalid response');
    }

    const response = await result.response;
    let text = response.text();

    // Clean up the response text
    // Remove markdown code blocks and any extra whitespace
    text = text.replace(/```json\n?|\n?```/g, '').trim();
    
    // If the text starts with a newline and {, trim up to the first {
    if (text.includes('{\n')) {
      text = text.substring(text.indexOf('{'));
    }

    try {
      // Try to parse the cleaned response as JSON
      const parsedResponse = JSON.parse(text);
      return parsedResponse;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw response:', text); // For debugging
      // Return a fallback response if parsing fails
      return {
        issue: "Could not analyze image properly",
        confidence: 0,
        repairs: {
          steps: ["Please try taking another photo with better lighting and focus"],
          difficulty: "N/A",
          estimatedTime: "N/A",
          requiredTools: [],
          professionalAdvice: "Please try taking another photo with better lighting and focus on the specific area of concern, or consult a mechanic for in-person diagnosis"
        },
        warnings: ["Analysis failed - please try again with a clearer image"]
      };
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze vehicle image');
  }
} 