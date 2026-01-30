const { OpenAI } = require('openai');

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-...'
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

/**
 * @param {Array} data - The raw data to analyze
 * @param {string} mode - 'summarization', 'classification', or 'predictive'
 */
const analyzeData = async (data, mode = 'summarization') => {
    const startTime = Date.now();

    const prompts = {
        summarization: "Provide a comprehensive summary of the key trends and outliers in this dataset.",
        classification: "Categorize the items in this dataset into 3-5 high-level groups based on their attributes.",
        predictive: "Based on the historical values in this dataset, forecast the next 3 intervals with confidence intervals."
    };

    const prompt = prompts[mode] || prompts.summarization;

    if (!openai) {
        await new Promise(r => setTimeout(r, 1500));
        return {
            mode,
            insight: `[MOCK] ${mode.toUpperCase()} analysis: Significant correlation found between input variables.`,
            summary: `Automated ${mode} result.`,
            metrics: { confidence: 0.88, relevance: 0.95 },
            tokenUsage: 120,
            executionTime: Date.now() - startTime
        };
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: "You are a professional data scientist. Output strictly valid JSON." },
                { role: "user", content: `Data: ${JSON.stringify(data.slice(0, 50))}. Task: ${prompt}` }
            ],
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(response.choices[0].message.content);
        return {
            mode,
            ...content,
            tokenUsage: response.usage.total_tokens,
            executionTime: Date.now() - startTime
        };
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('AI Analysis failed');
    }
};

const convertTextToJson = async (text) => {
    if (!openai) {
        await new Promise(r => setTimeout(r, 1000));
        return [{ id: 1, text: "Mock extracted data", summary: text.substring(0, 50) }];
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: "You are a data extractor. Convert the following unstructured text into a valid JSON array of objects. Infer appropriate keys. Output ONLY valid JSON." },
                { role: "user", content: text.substring(0, 4000) } // Limit text to avoid token limits
            ],
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(response.choices[0].message.content);
        // Ensure we return an array
        if (Array.isArray(content)) return content;
        if (content.data && Array.isArray(content.data)) return content.data;
        return [content];
    } catch (error) {
        console.error('AI Extraction Error:', error);
        throw new Error('Failed to convert text to JSON');
    }
};

module.exports = { analyzeData, convertTextToJson };
