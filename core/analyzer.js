// core/analyzer.js

const { askOpenRouter } = require('./openrouter');

const prompts = {
  summarize: `
Summarize this LAS log data. Provide:
- Depth range
- Key curves and their descriptions
- General formation type (if observable)
- Any geological trends or notable features
`,
  explain_fields: `
For each curve in the LAS data:
- Explain what the curve represents
- Its geological significance
- Typical use in well log interpretation
`,
  payzones: `
Analyze this LAS data for potential hydrocarbon pay zones. Based on:
- Gamma Ray (GR)
- Resistivity (RT or equivalent)
- Density (RHOB) vs Neutron (NPHI) crossplots
- Porosity indications

Output should include:
- Depth intervals likely to be pay zones
- Reasoning behind identification
- Curve thresholds if applicable
`,
  full_summary: `
Provide a complete structured analysis of this LAS file:
- General overview
- All curve details
- Pay zone assessment
- Potential next geological steps or tests
`,
  custom: `
The user may ask a specific question about the LAS file. Answer with technical detail.
`
};

/**
 * Main analyzer function
 * @param {object} lasData - Parsed LAS data (from parser.js)
 * @param {string} intent - One of: summarize, explain_fields, payzones, full_summary, custom
 * @param {string} [question] - Optional: user’s custom question
 * @returns {Promise<string>} - AI response
 */
async function analyzeLogData(lasData, intent, question = '') {
  let prompt;

  switch (intent) {
    case 'summarize':
      prompt = prompts.summarize;
      break;
    case 'explain_fields':
      prompt = prompts.explain_fields;
      break;
    case 'payzones':
      prompt = prompts.payzones;
      break;
    case 'full_summary':
      prompt = prompts.full_summary;
      break;
    case 'custom':
      prompt = `Answer this question about the LAS data: ${question}`;
      break;
    default:
      throw new Error(`❌ Unknown intent "${intent}"`);
  }

  return await askOpenRouter(prompt, lasData);
}

module.exports = { analyzeLogData };
