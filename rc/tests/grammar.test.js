// Grammar tests (revision plan, Annex E.1 and E.1.1)
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../js/label-core.js');
const { SPEC, buildSpec05 } = require('../js/spec.js');

const withM = { '0.4': SPEC['0.4'], '0.5': buildSpec05(true) };
const withoutM = { '0.4': SPEC['0.4'], '0.5': buildSpec05(false) };
const valid = (s, specs = withM, opts = {}) => core.parseCode(s, { specs, ...opts }) !== null;

test('0.5: valid labels', () => {
  for (const s of [
    'AI-DTL 0.5: N/Acc:I',
    'AI-DTL 0.5: N/Acc:O',
    'AI-DTL 0.5: A/H:L;R:H;Acc:I (Ollama/Llama 4, 03/2026)',
    'AI-DTL 0.5: M/H:C;R:H;Acc:O (Adobe Firefly, 10/2026)',
    'AI-DTL 0.5: G/H:C!;R:N;Acc:N (GPT-5, 05/2026; Claude Opus 4.6, 06/2026)',
    'AI-DTL 0.5: S/H:I;R:HM;Acc:O (Academic Cloud/Llama 3.3 70B, 12/2025)',
  ]) assert.ok(valid(s), s);
});

test('0.5: commit-trailer form', () => {
  assert.ok(valid('AI-DTL: 0.5 G/H:C;R:H;Acc:I (GitHub Copilot, 10/2026)'));
  assert.ok(!valid('AI-DTL: 0.5 X/H:C;R:H;Acc:I (GitHub Copilot, 10/2026)'));
});

test('0.5: invalid labels', () => {
  for (const s of [
    'AI-DTL 0.5: N/Acc:N',
    'AI-DTL 0.5: G/H:C;R:H;Acc:I',
    'AI-DTL 0.5: G/H:C;R:H;Acc:I (GPT-5)',
    'AI-DTL 0.5: G/H:C;R:H;Acc:I (GPT-5, 13/2026)',
    'AI-DTL 0.5: X/H:C;R:H;Acc:I (GPT-5, 05/2026)',
    'AI-DTL 0.5: G/H:C;R:H;Acc:I (GPT-5, 05/1999)',
    'AI-DTL 0.5: G/H:X;R:H;Acc:I (GPT-5, 05/2026)',
    'AI-DTL 0.5: G/H:C;R:H;Acc:I ( GPT-5, 05/2026)',
    'AI-DTL 0.5: G/H:C;R:H;Acc:I (GPT|5, 05/2026)',
    'AI-DTL 0.5: G/H:C;R:H;Acc:I (' + 'x'.repeat(81) + ', 05/2026)',
    'AI-DTL 0.5: G/H:C;R:H;Acc:I (GPT​5, 05/2026)',
    'AI-DTL 0.5: N/H:C;R:H;Acc:I (GPT-5, 05/2026)',
    'AI-DTL 0.6: G/H:C;R:H;Acc:I (GPT-5, 05/2026)',
    '',
  ]) assert.ok(!valid(s), JSON.stringify(s));
});

test('0.5: M only with ENABLE_M', () => {
  const s = 'AI-DTL 0.5: M/H:C;R:H;Acc:O (Adobe Firefly, 10/2026)';
  assert.ok(valid(s, withM));
  assert.ok(!valid(s, withoutM));
});

test('0.5: tool names up to 80 characters', () => {
  assert.ok(valid('AI-DTL 0.5: G/H:C;R:H;Acc:I (' + 'x'.repeat(80) + ', 05/2026)'));
});

// 0.4 – all former valid cases from js/test.js except N/Acc:N for "generatable"
const CASES_04 = [
  { label: 'AI-DTL 0.4: N/Acc:I', gen: true, disp: true },
  { label: 'AI-DTL 0.4: N/Acc:O', gen: true, disp: true },
  { label: 'AI-DTL 0.4: N/Acc:N', gen: false, disp: true },
  { label: 'AI-DTL 0.4: A/H:L;R:H;Acc:I', gen: true, disp: true },
  { label: 'AI-DTL 0.4: S/H:I;R:M;Acc:O', gen: true, disp: true },
  { label: 'AI-DTL 0.4: G/H:C;R:HM;Acc:I', gen: true, disp: true },
  { label: 'AI-DTL 0.4: G/H:C!;R:N;Acc:N', gen: true, disp: true },
  { label: 'AI-DTL 0.4: G/H:C;R:H;Acc:I (Claude Opus 4.6, 06/2026)', gen: true, disp: true },
  { label: 'AI-DTL 0.4: A/H:L;R:H;Acc:I (Ollama)', gen: true, disp: true },
  { label: 'AI-DTL 0.4: G/H:C;R:H;Acc:I (GPT-5, 05/2026; Claude Opus 4.6, 06/2026)', gen: true, disp: true },
  { label: 'AI-DTL 0.4: G/H:C;R:H;Acc:I (Ollama/Llama 4; Claude Opus 4.6, 04/2026)', gen: true, disp: true },
  { label: 'AI-DTL 0.4: G/H:I;R:M;Acc:O', gen: true, disp: true },
  { label: 'AI-DTL 0.4: G/H:L;R:HM;Acc:I', gen: true, disp: true },
  { label: 'AI-DTL 0.4: G/H:C;R:H;Acc:I (GPT-5, 13/2026)', gen: false, disp: false },
  { label: 'AI-DTL 0.4: N;Acc:I', gen: false, disp: false },
  { label: 'AI-DTL 0.3: G/H:C;R:H;Acc:I', gen: false, disp: false },
  { label: 'AI-DTL 0.4: G H:C;R:H;Acc:I', gen: false, disp: false },
  { label: 'AI-DTL 0.4: X/H:C;R:H;Acc:I', gen: false, disp: false },
  { label: 'AI-DTL 0.4: M/H:C;R:H;Acc:I', gen: false, disp: false },
  { label: 'AI-DTL 0.4: G/H:C;Acc:I', gen: false, disp: false },
  { label: 'AI-DTL 0.4: N/H:C;R:H;Acc:I', gen: false, disp: false },
  { label: '', gen: false, disp: false },
];

test('0.4: generatable vs. displayable', () => {
  for (const { label, gen, disp } of CASES_04) {
    assert.equal(valid(label, withM), gen, `generatable: ${label}`);
    assert.equal(valid(label, withM, { displayable: true }), disp, `displayable: ${label}`);
  }
});
