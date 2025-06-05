// core/openrouter.js
const axios = require('axios');

/**
 * Sends data to OpenRouter using a structured prompt
 * @param {string} prompt - The base prompt
 * @param {object} lasData - The parsed LAS data
 * @param {string} [model='mistralai/mistral-7b-instruct:free'] - Model to use
 * @returns {Promise<string>} - LLM-generated response
 */
async function askOpenRouter(prompt, lasData, model = 'mistralai/mistral-7b-instruct:free') {
  const content = `${prompt}\n\nHere is the parsed LAS data in JSON:\n\`\`\`json\n${JSON.stringify(lasData, null, 2)}\n\`\`\``;

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model,
      messages: [
        { role: 'system', content: 'You are an expert petroleum geologist and log analyst.' },
        { role: 'user', content }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = response.data.choices[0].message.content;
    return reply;
  } catch (error) {
    console.error('OpenRouter error:', error.response?.data || error.message);
    throw new Error('Failed to fetch from OpenRouter API.');
  }
}

module.exports = { askOpenRouter };
