// ── Example catalogue 0.5 (revision plan, Annex D)
// Used by "Load example" in the editor (hidden in study mode) and by the tests.
// state uses the editor input shape; noM is the stamm to use when ENABLE_M is false.

const EXAMPLES = [
  {
    id: 'D.1',
    title: { de: 'Fachartikel mit KI-Schreibhilfe (Gliederung, einzelne Sätze geglättet)', en: 'Journal article with AI writing help (outline, single sentences smoothed)' },
    state: { stamm: ['A', 'S'], host: ['H:C'], review: 'R:H', acc: 'Acc:I', tools: [{ name: 'Claude Opus 4.6', month: '04', year: '2026' }] },
    code: 'AI-DTL 0.5: S/H:C;R:H;Acc:I (Claude Opus 4.6, 04/2026)',
  },
  {
    id: 'D.2',
    title: { de: 'Gutachten, Rechtschreibprüfung mit offenem Modell', en: 'Expert review, spell-checking with an open model' },
    state: { stamm: ['A'], host: ['H:I'], review: 'R:H', acc: 'Acc:I', tools: [{ name: 'Academic Cloud/Llama 3.3 70B', month: '04', year: '2026' }] },
    code: 'AI-DTL 0.5: A/H:I;R:H;Acc:I (Academic Cloud/Llama 3.3 70B, 04/2026)',
  },
  {
    id: 'D.3',
    title: { de: 'Bericht mit dem KI-Chat der eigenen Organisation, selbst betrieben', en: 'Report with your own organisation’s AI chat, self-hosted' },
    state: { stamm: ['S'], host: ['H:L'], review: 'R:H', acc: 'Acc:I', tools: [{ name: 'KI-Chat der eigenen Organisation/offenes Modell', month: '05', year: '2026' }] },
    code: 'AI-DTL 0.5: S/H:L;R:H;Acc:I (KI-Chat der eigenen Organisation/offenes Modell, 05/2026)',
  },
  {
    id: 'D.4',
    title: { de: 'Übungsaufgaben für einen Kurs', en: 'Exercises for a course' },
    state: { stamm: ['G'], host: ['H:C'], review: 'R:H', acc: 'Acc:I', tools: [{ name: 'Microsoft 365 Copilot', month: '04', year: '2026' }] },
    code: 'AI-DTL 0.5: G/H:C;R:H;Acc:I (Microsoft 365 Copilot, 04/2026)',
  },
  {
    id: 'D.5',
    title: { de: 'Beschlussvorlage', en: 'Decision paper' },
    state: { stamm: ['G'], host: ['H:L'], review: 'R:H', acc: 'Acc:O', tools: [{ name: 'Ollama/Llama 4', month: '05', year: '2026' }] },
    code: 'AI-DTL 0.5: G/H:L;R:H;Acc:O (Ollama/Llama 4, 05/2026)',
  },
  {
    id: 'D.6',
    title: { de: 'Code mit Copilot, Tests und Review', en: 'Code with Copilot, tests and review' },
    state: { stamm: ['G'], host: ['H:C'], review: 'R:HM', acc: 'Acc:I', tools: [{ name: 'GitHub Copilot', month: '04', year: '2026' }] },
    code: 'AI-DTL 0.5: G/H:C;R:HM;Acc:I (GitHub Copilot, 04/2026)',
  },
  {
    id: 'D.7',
    title: { de: 'Workflow über zwei Hosts', en: 'Workflow across two hosts' },
    state: { stamm: ['G'], host: ['H:L', 'H:C'], review: 'R:H', acc: 'Acc:I', tools: [{ name: 'Ollama/Llama 4', month: '03', year: '2026' }, { name: 'Claude Opus 4.6', month: '04', year: '2026' }] },
    code: 'AI-DTL 0.5: G/H:C;R:H;Acc:I (Ollama/Llama 4, 03/2026; Claude Opus 4.6, 04/2026)',
  },
  {
    id: 'D.8',
    title: { de: 'Newsletter, nur automatisch geprüft', en: 'Newsletter, checked automatically only' },
    state: { stamm: ['G'], host: ['H:C'], review: 'R:M', acc: 'Acc:O', tools: [{ name: 'GPT-5', month: '04', year: '2026' }] },
    code: 'AI-DTL 0.5: G/H:C;R:M;Acc:O (GPT-5, 04/2026)',
  },
  {
    id: 'D.9',
    title: { de: 'Blogbeitrag ohne KI', en: 'Blog post without AI' },
    state: { stamm: ['N'], host: [], review: null, acc: 'Acc:I', tools: [] },
    code: 'AI-DTL 0.5: N/Acc:I',
  },
  {
    id: 'D.10',
    title: { de: 'Agentensystem ohne menschliche Verantwortung', en: 'Agent system without human accountability' },
    state: { stamm: ['G'], host: ['H:C'], review: 'R:M', acc: 'Acc:N', tools: [{ name: 'GPT-4o', month: '04', year: '2026' }] },
    code: 'AI-DTL 0.5: G/H:C;R:M;Acc:N (GPT-4o, 04/2026)',
  },
  {
    id: 'D.11',
    title: { de: 'Folien mit einem KI-Bild (Teil-Label am Bild)', en: 'Slides with one AI image (part label on the image)' },
    state: { stamm: ['G'], host: ['H:C!'], review: 'R:H', acc: 'Acc:I', tools: [{ name: 'Midjourney v7', month: '10', year: '2026' }] },
    code: 'AI-DTL 0.5: G/H:C!;R:H;Acc:I (Midjourney v7, 10/2026)',
    partLabel: true,
  },
  {
    id: 'D.12',
    title: { de: 'Foto bearbeitet (Person entfernt, Himmel ersetzt)', en: 'Photo edited (person removed, sky replaced)' },
    state: { stamm: ['M'], host: ['H:C'], review: 'R:H', acc: 'Acc:O', tools: [{ name: 'Adobe Photoshop/Firefly', month: '10', year: '2026' }] },
    noM: ['G'],
    code: 'AI-DTL 0.5: M/H:C;R:H;Acc:O (Adobe Photoshop/Firefly, 10/2026)',
    codeNoM: 'AI-DTL 0.5: G/H:C;R:H;Acc:O (Adobe Photoshop/Firefly, 10/2026)',
  },
  {
    id: 'D.13',
    title: { de: 'Telefonansage mit KI-Stimme (Text selbst geschrieben)', en: 'Phone announcement with an AI voice (text written by hand)' },
    state: { stamm: ['G'], host: ['H:C'], review: 'R:H', acc: 'Acc:O', tools: [{ name: 'ElevenLabs', month: '10', year: '2026' }] },
    code: 'AI-DTL 0.5: G/H:C;R:H;Acc:O (ElevenLabs, 10/2026)',
  },
];

if (typeof module !== 'undefined') module.exports = { EXAMPLES };
