// AI systems for the tool autocomplete (Stand: Juni 2026)
// Grouped by vendor / category; flat strings are what ends up in the label.
const AI_TOOLS = [
  { group: 'OpenAI', items: ['GPT-5.5', 'GPT-5.4', 'GPT-5', 'GPT-4o', 'GPT-4.1', 'OpenAI o3', 'ChatGPT'] },
  { group: 'Anthropic', items: ['Claude Fable 5', 'Claude Opus 4.8', 'Claude Opus 4.7', 'Claude Opus 4.6', 'Claude Sonnet 4.6', 'Claude Sonnet 4.5', 'Claude Haiku 4.5', 'Claude Code'] },
  { group: 'Google', items: ['Gemini 3.5 Flash', 'Gemini 3 Pro', 'Gemini 3 Flash', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'NotebookLM'] },
  { group: 'Meta', items: ['Llama 4 Maverick', 'Llama 4 Scout', 'Llama 3.3 70B'] },
  { group: 'Mistral AI', items: ['Mistral Large 3', 'Mistral Medium', 'Le Chat', 'Mixtral 8x22B'] },
  { group: 'xAI', items: ['Grok 4.3', 'Grok 4 Fast', 'Grok 4'] },
  { group: 'DeepSeek', items: ['DeepSeek V4 Pro', 'DeepSeek V3.1', 'DeepSeek R1'] },
  { group: 'Alibaba', items: ['Qwen 3.7 Max', 'Qwen 3.6 Plus'] },
  { group: 'Moonshot AI', items: ['Kimi v2.6'] },
  { group: 'Microsoft', items: ['Microsoft 365 Copilot', 'GitHub Copilot', 'Phi-4'] },
  { group: 'Perplexity', items: ['Perplexity Sonar', 'Perplexity Deep Research'] },
  { group: 'Coding Tools', items: ['Cursor', 'Windsurf', 'JetBrains AI Assistant'] },
  { group: 'Image & Video', items: ['Midjourney v7', 'DALL·E 3', 'Stable Diffusion 3.5', 'FLUX.1', 'Adobe Firefly', 'Sora', 'Runway Gen-4', 'Ideogram 3'] },
  { group: 'Audio & Speech', items: ['ElevenLabs', 'OpenAI Whisper', 'Suno v4'] },
  { group: 'Writing & Translation', items: ['DeepL', 'DeepL Write', 'Grammarly'] },
  { group: 'Local Runtimes', items: ['Ollama', 'LM Studio', 'llama.cpp'] },
];
