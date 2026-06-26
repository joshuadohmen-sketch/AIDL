// AI-DTL 0.4 grammar validator — run in browser console: runTests()
// Not loaded by index.html; developer tool only.

const GRAMMAR = /^AI-DTL 0\.4: (N\/Acc:(I|O|N)|[ASG]\/H:(L|I|C|C!);R:(H|M|HM|N);Acc:(I|O|N)(\s+\(.+\))?)$/;

const CASES = [
  // valid – N form
  { label: 'AI-DTL 0.4: N/Acc:I',                                              expect: true  },
  { label: 'AI-DTL 0.4: N/Acc:O',                                              expect: true  },
  { label: 'AI-DTL 0.4: N/Acc:N',                                              expect: true  },
  // valid – full form, all stamm values
  { label: 'AI-DTL 0.4: A/H:L;R:H;Acc:I',                                     expect: true  },
  { label: 'AI-DTL 0.4: S/H:I;R:M;Acc:O',                                     expect: true  },
  { label: 'AI-DTL 0.4: G/H:C;R:HM;Acc:I',                                    expect: true  },
  { label: 'AI-DTL 0.4: G/H:C!;R:N;Acc:N',                                    expect: true  },
  // valid – with single tool
  { label: 'AI-DTL 0.4: G/H:C;R:H;Acc:I (Claude Opus 4.6, 06/2026)',          expect: true  },
  { label: 'AI-DTL 0.4: A/H:L;R:H;Acc:I (Ollama)',                            expect: true  },
  // valid – with multiple tools
  { label: 'AI-DTL 0.4: G/H:C;R:H;Acc:I (GPT-5, 05/2026; Claude Opus 4.6, 06/2026)', expect: true },
  // valid – all review codes
  { label: 'AI-DTL 0.4: G/H:I;R:M;Acc:O',                                     expect: true  },
  { label: 'AI-DTL 0.4: G/H:L;R:HM;Acc:I',                                    expect: true  },
  // invalid – old N syntax
  { label: 'AI-DTL 0.4: N;Acc:I',                                              expect: false },
  // invalid – wrong version
  { label: 'AI-DTL 0.3: G/H:C;R:H;Acc:I',                                     expect: false },
  // invalid – missing separator
  { label: 'AI-DTL 0.4: G H:C;R:H;Acc:I',                                     expect: false },
  // invalid – unknown code
  { label: 'AI-DTL 0.4: X/H:C;R:H;Acc:I',                                     expect: false },
  // invalid – missing dimension
  { label: 'AI-DTL 0.4: G/H:C;Acc:I',                                          expect: false },
  // invalid – empty string
  { label: '',                                                                   expect: false },
];

function runTests() {
  let pass = 0, fail = 0;
  CASES.forEach(({ label, expect }) => {
    const result = GRAMMAR.test(label);
    const ok = result === expect;
    if (ok) {
      pass++;
      console.log(`%c✓ ${label || '(empty)'}`, 'color:#2a9d2a');
    } else {
      fail++;
      console.error(`✗ ${label || '(empty)'} — expected ${expect}, got ${result}`);
    }
  });
  console.log(`\nResults: ${pass} passed, ${fail} failed out of ${CASES.length} tests.`);
  return { pass, fail, total: CASES.length };
}
