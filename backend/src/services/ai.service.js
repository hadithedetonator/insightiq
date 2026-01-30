const { OpenAI } = require('openai');

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-...'
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const analyzeData = async (data, prompt) => {
    const startTime = Date.now();

    if (!openai) {
        // Mocked response for demonstration
        console.log('AI Service: No API key found, using mocked response');
        await new Promise(r => setTimeout(r, 1500)); // Simulate latency

        return {
            insight: "Based on the provided dataset, we observed a 15% increase in efficiency across core metrics. The trend suggests continued growth if current parameters are maintained.",
            summary: "Positive growth trend detected.",
            metrics: { confidence: 0.92, anomalyScore: 0.05 },
            tokenUsage: 150,
            executionTime: Date.now() - startTime
        };
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: "You are a data analyst. Provid structured JSON insights." },
                { role: "user", content: `Analyze this data: ${JSON.stringify(data)}. Prompt: ${prompt}` }
            ],
            response_format: { type: "json_object" }
        });

        return {
            ...JSON.parse(response.choices[0].message.content),
            tokenUsage: response.usage.total_tokens,
            executionTime: Date.now() - startTime
        };
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('AI Analysis failed');
    }
};

module.exports = { analyzeData };
