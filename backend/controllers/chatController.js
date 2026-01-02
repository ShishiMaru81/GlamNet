const { GoogleGenerativeAI } = require("@google/generative-ai");

// @desc    Get chat response from Gemini
// @route   POST /api/chat
// @access  Private
exports.getChatResponse = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a message'
            });
        }

        // Access your API key as an environment variable
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // The Gemini 1.5 models are versatile and work with most use cases
        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

        const prompt = `
      You are a helpful and knowledgeable AI assistant for a salon booking platform called GlamNet.
      Your role is to assist customers with advice on haircuts, hair treatments, and styles.
      
      Strictly follow these rules:
      1. ONLY answer questions related to haircuts, hair styles, beard trims, hair coloring, and hair treatments.
      2. If a user asks about anything else (e.g., politics, math, general knowledge, other businesses), politely refuse and guide them back to hair-related topics.
      3. Be concise, friendly, and professional.
      4. Suggest popular styles if asked for recommendations.
      5. Do not provide medical advice.

      User asked: "${message}"
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            data: {
                response: text
            }
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get response from AI assistant'
        });
    }
};
