// ── Services and models for the tool autocomplete (revision plan, Annex C)
// Only `name` goes into the label. `hint` appears only in the suggestion list.
// `host` is a suggestion for the hosting step – every entry with a host must be
// checked against the University of Koblenz contracts before going live.
// `generic`: the editor inserts "name/" and asks for the model.
// The model list goes out of date quickly and is maintained by hand; nothing is loaded from outside.

const SERVICES = [
  { group: { de: 'Wissenschaftsdienste', en: 'Research services' }, items: [
    { name: 'Academic Cloud', hint: { de: 'offenes Modell, z. B. Llama, Qwen, Mistral', en: 'open model, e.g. Llama, Qwen, Mistral' }, host: 'H:I', generic: true },
    { name: 'Academic Cloud', hint: { de: 'externes Modell eines Anbieters, z. B. GPT', en: 'external provider model, e.g. GPT' }, host: 'H:C', generic: true },
    { name: 'Hochschul-KI-Chat', hint: { de: 'von der Hochschule selbst betrieben', en: 'run by the university itself' }, host: 'H:I', generic: true },
    { name: 'Hochschul-KI-Chat', hint: { de: 'Anbieter-Modell über Vertrag der Hochschule', en: 'provider model under a university contract' }, host: 'H:C', generic: true },
  ] },
  { group: { de: 'Microsoft', en: 'Microsoft' }, items: [
    { name: 'Microsoft 365 Copilot', hint: { de: 'Hochschullizenz', en: 'university licence' }, host: 'H:C' },
    { name: 'Microsoft 365 Copilot Chat', hint: { de: 'mit Hochschulkonto angemeldet', en: 'signed in with a university account' }, host: 'H:C' },
    { name: 'GitHub Copilot', hint: { de: 'Lizenz der Einrichtung', en: 'institutional licence' }, host: 'H:C' },
    { name: 'GitHub Copilot', hint: { de: 'privates Konto', en: 'private account' }, host: 'H:C!' },
  ] },
  { group: { de: 'Lokal', en: 'Local' }, items: [
    { name: 'Ollama', hint: { de: 'eigener Rechner', en: 'own computer' }, host: 'H:L', generic: true },
    { name: 'LM Studio', hint: { de: 'eigener Rechner', en: 'own computer' }, host: 'H:L', generic: true },
    { name: 'llama.cpp', hint: { de: 'eigener Rechner', en: 'own computer' }, host: 'H:L', generic: true },
  ] },
  { group: { de: 'Private Konten', en: 'Private accounts' }, items: [
    { name: 'ChatGPT', hint: { de: 'privates oder kostenloses Konto', en: 'private or free account' }, host: 'H:C!', generic: true },
    { name: 'Claude', hint: { de: 'privates Konto', en: 'private account' }, host: 'H:C!', generic: true },
    { name: 'Gemini', hint: { de: 'privates Konto', en: 'private account' }, host: 'H:C!', generic: true },
  ] },
  { group: { de: 'Übersetzung', en: 'Translation' }, items: [
    { name: 'DeepL', hint: { de: 'kostenlose Version', en: 'free version' }, host: 'H:C!' },
    { name: 'DeepL Pro', hint: { de: 'Vertrag der Einrichtung', en: 'institutional contract' }, host: 'H:C' },
  ] },
  { group: { de: 'Modelle (ohne Kontext)', en: 'Models (no context)' }, items: [
    // former js/tools.js entries; no host suggestion
    ...['GPT-5.5', 'GPT-5.4', 'GPT-5', 'GPT-4o', 'GPT-4.1', 'OpenAI o3',
      'Claude Fable 5', 'Claude Opus 4.8', 'Claude Opus 4.7', 'Claude Opus 4.6', 'Claude Sonnet 4.6', 'Claude Sonnet 4.5', 'Claude Haiku 4.5',
      'Gemini 3.5 Flash', 'Gemini 3 Pro', 'Gemini 3 Flash', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'NotebookLM',
      'Llama 4 Maverick', 'Llama 4 Scout', 'Llama 3.3 70B',
      'Mistral Large 3', 'Mistral Medium', 'Mixtral 8x22B',
      'Grok 4.3', 'Grok 4 Fast', 'Grok 4',
      'DeepSeek V4 Pro', 'DeepSeek V3.1', 'DeepSeek R1',
      'Qwen 3.7 Max', 'Qwen 3.6 Plus', 'Kimi v2.6', 'Phi-4',
      'Perplexity Sonar', 'Perplexity Deep Research',
      'Windsurf', 'JetBrains AI Assistant',
      'Midjourney v7', 'DALL·E 3', 'Stable Diffusion 3.5', 'FLUX.1', 'Adobe Firefly', 'Sora', 'Runway Gen-4', 'Ideogram 3',
      'ElevenLabs', 'OpenAI Whisper', 'Suno v4',
      'DeepL Write', 'Grammarly',
    ].map(name => ({ name })),
    ...['ChatGPT', 'Claude Code', 'Le Chat', 'Cursor'].map(name => ({ name, generic: true })),
  ] },
];

if (typeof module !== 'undefined') module.exports = { SERVICES };
