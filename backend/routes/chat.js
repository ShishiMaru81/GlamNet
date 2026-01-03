// const express = require('express');
// const { getChatResponse } = require('../controllers/chatController');
// const { protect } = require('../middleware/auth');

// const router = express.Router();

// router.post('/', protect, getChatResponse);

// module.exports = router;





const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Hair-only filter (blocks off-topic requests)
function isHairRelated(text = "") {
  const t = text.toLowerCase();
  const keywords = [
    "hair", "haircut", "hairstyle", "fade", "taper", "undercut",
    "layers", "bangs", "fringe", "bob", "pixie",
    "frizz", "dandruff", "scalp", "shampoo", "conditioner",
    "curl", "curly", "wavy", "straight", "perm",
    "color", "dye", "balayage", "highlights", "bleach",
    "split ends", "heat protectant", "hairfall", "hair fall"
  ];
  return keywords.some(k => t.includes(k));
}

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required (string)" });
    }

    // Hard block off-topic queries
    if (!isHairRelated(message)) {
      return res.json({
        reply:
          "I’m a hair-only assistant 🙂 Ask about haircuts, hairstyles, hair tips, or hair care."
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are HairBuddy, a specialized hair consultant.

You ONLY answer questions about:
- hair tips & routine, haircuts, hairstyles, styling, and hair products.

Rules:
- If user asks anything outside hair topics, refuse and redirect to hair.
- No medical diagnosis. If severe scalp pain, bleeding, infection, or sudden patchy hair loss: recommend a dermatologist.
- Be friendly and concise.
- Ask up to 2 short follow-up questions if needed (hair length, hair type, face shape, occasion).

User: ${message}
Assistant:
`.trim();

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Chat failed" });
  }
});

module.exports = router;
