// AI-DTL 0.4 grammar checks — run in the browser console: runTests()
// Not loaded by index.html; developer tool only.
//
// Two grammars:
//   GENERATABLE – what the 0.4.1 editor can produce (N/Acc:N is no longer possible)
//   DISPLAYABLE – what the explanation page must still show (old links, incl. N/Acc:N)
// In 0.4 the tool part is optional, and so is the date of each tool.

const TOOL_PART = String.raw`(\s\([^(),|;]+(, (0[1-9]|1[0-2])\/\d{4})?(; [^(),|;]+(, (0[1-9]|1[0-2])\/\d{4})?)*\))?`;
const FULL_PART = String.raw`[ASG]\/H:(L|I|C|C!);R:(H|M|HM|N);Acc:(I|O|N)` + TOOL_PART;

const GRAMMAR_GENERATABLE = new RegExp(String.raw`^AI-DTL 0\.4: (N\/Acc:(I|O)|` + FULL_PART + ')$');
const GRAMMAR_DISPLAYABLE = new RegExp(String.raw`^AI-DTL 0\.4: (N\/Acc:(I|O|N)|` + FULL_PART + ')$');

// gen = expected for GENERATABLE, disp = expected for DISPLAYABLE
const CASES = [
  // N form
  { label: 'AI-DTL 0.4: N/Acc:I',                                                    gen: true,  disp: true  },
  { label: 'AI-DTL 0.4: N/Acc:O',                                                    gen: true,  disp: true  },
  { label: 'AI-DTL 0.4: N/Acc:N',                                                    gen: false, disp: true  },
  // full form, all stamm values
  { label: 'AI-DTL 0.4: A/H:L;R:H;Acc:I',                                            gen: true,  disp: true  },
  { label: 'AI-DTL 0.4: S/H:I;R:M;Acc:O',                                            gen: true,  disp: true  },
  { label: 'AI-DTL 0.4: G/H:C;R:HM;Acc:I',                                           gen: true,  disp: true  },
  { label: 'AI-DTL 0.4: G/H:C!;R:N;Acc:N',                                           gen: true,  disp: true  },
  // tools
  { label: 'AI-DTL 0.4: G/H:C;R:H;Acc:I (Claude Opus 4.6, 06/2026)',                 gen: true,  disp: true  },
  { label: 'AI-DTL 0.4: A/H:L;R:H;Acc:I (Ollama)',                                   gen: true,  disp: true  },
  { label: 'AI-DTL 0.4: G/H:C;R:H;Acc:I (GPT-5, 05/2026; Claude Opus 4.6, 06/2026)', gen: true,  disp: true  },
  { label: 'AI-DTL 0.4: G/H:C;R:H;Acc:I (Ollama/Llama 4; Claude Opus 4.6, 04/2026)', gen: true,  disp: true  },
  { label: 'AI-DTL 0.4: G/H:I;R:M;Acc:O',                                            gen: true,  disp: true  },
  { label: 'AI-DTL 0.4: G/H:L;R:HM;Acc:I',                                           gen: true,  disp: true  },
  // invalid
  { label: 'AI-DTL 0.4: G/H:C;R:H;Acc:I (GPT-5, 13/2026)',                           gen: false, disp: false },
  { label: 'AI-DTL 0.4: N;Acc:I',                                                    gen: false, disp: false },
  { label: 'AI-DTL 0.3: G/H:C;R:H;Acc:I',                                            gen: false, disp: false },
  { label: 'AI-DTL 0.4: G H:C;R:H;Acc:I',                                            gen: false, disp: false },
  { label: 'AI-DTL 0.4: X/H:C;R:H;Acc:I',                                            gen: false, disp: false },
  { label: 'AI-DTL 0.4: G/H:C;Acc:I',                                                gen: false, disp: false },
  { label: 'AI-DTL 0.4: N/H:C;R:H;Acc:I',                                            gen: false, disp: false },
  { label: '',                                                                        gen: false, disp: false },
];

function runTests() {
  let pass = 0, fail = 0;
  CASES.forEach(({ label, gen, disp }) => {
    const g = GRAMMAR_GENERATABLE.test(label);
    const d = GRAMMAR_DISPLAYABLE.test(label);
    const name = label || '(empty)';
    if (g === gen && d === disp) {
      pass++;
      if (typeof console !== 'undefined') console.log(`✓ ${name}`);
    } else {
      fail++;
      console.error(`✗ ${name} — generatable: expected ${gen}, got ${g}; displayable: expected ${disp}, got ${d}`);
    }
  });
  console.log(`\nResults: ${pass} passed, ${fail} failed out of ${CASES.length} tests.`);
  return { pass, fail, total: CASES.length };
}

if (typeof module !== 'undefined') module.exports = { GRAMMAR_GENERATABLE, GRAMMAR_DISPLAYABLE, CASES, runTests };
