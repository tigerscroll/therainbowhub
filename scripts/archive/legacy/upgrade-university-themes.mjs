import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const marker = "/* Five-stage university entrance shell */";

const themes = {
  oxford: {
    ink: "#14213b",
    accent: "#702638",
    accent2: "#a77b47",
    track: "#e2d8c7",
    surface: "#fbf5e8",
    soft: "#f5ead7",
    border: "#b9a78d",
    muted: "#6f665c",
    radius: "16px",
  },
  cambridge: {
    ink: "#20323a",
    accent: "#276b78",
    accent2: "#66a7b4",
    track: "#dbeaec",
    surface: "#fffdf8",
    soft: "#edf7f8",
    border: "#a9c7cd",
    muted: "#667980",
    radius: "22px",
  },
  harvard: {
    ink: "#241d1f",
    accent: "#8f2035",
    accent2: "#b78162",
    track: "#eadfd9",
    surface: "#fffdf9",
    soft: "#f8eeea",
    border: "#c2aaa2",
    muted: "#706767",
    radius: "20px",
  },
};

for (const [slug, c] of Object.entries(themes)) {
  const file = path.join(root, "data", "quizzes", slug, "theme.css");
  const existing = fs.readFileSync(file, "utf8");
  const base = existing.includes(marker) ? existing.slice(0, existing.indexOf(marker)).trimEnd() : existing.trimEnd();
  const css = `

${marker}
[data-quiz-theme="${slug}"] .quiz-engine { max-width: 1060px; padding: 32px 20px 72px; }
[data-quiz-theme="${slug}"] .quiz-engine__continuous-shell {
  --university-flow-min-height: clamp(590px, 82svh, 860px);
  box-sizing: border-box;
  position: relative;
  display: flex;
  width: min(800px, 100%) !important;
  max-width: 800px !important;
  min-height: var(--university-flow-min-height) !important;
  flex-direction: column;
  margin-inline: auto !important;
  overflow: hidden;
  border: 1px solid ${c.border} !important;
  border-radius: ${c.radius} !important;
  background: ${c.surface} !important;
  box-shadow: 0 24px 60px rgba(26, 34, 39, .14) !important;
}
[data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell { gap: 0; padding: 0; }
[data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell .quiz-engine__progress-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 19px clamp(20px, 4vw, 34px) 10px;
  border: 0;
  background: transparent;
}
[data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell .quiz-engine__progress-head > span {
  display: none;
}
[data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell .quiz-engine__progress-head > em {
  display: block;
  grid-column: 1;
  grid-row: 1;
  justify-self: start;
  margin: 0;
  padding: 5px 9px;
  border: 1px solid color-mix(in srgb, ${c.accent} 18%, transparent);
  border-radius: 999px;
  background: ${c.soft};
  color: ${c.accent};
  font-size: 12px;
  font-style: normal;
  font-weight: 900;
  letter-spacing: .08em;
  line-height: 1.25;
  text-transform: uppercase;
}
[data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell .quiz-engine__progress-head > strong {
  grid-column: 2;
  grid-row: 1;
  justify-self: end;
  color: ${c.muted};
  font-size: .78rem;
  font-weight: 900;
  letter-spacing: .09em;
  text-transform: uppercase;
}
[data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell .quiz-engine__progress {
  flex: 0 0 auto;
  height: 12px;
  margin: 0 clamp(20px, 4vw, 34px);
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: ${c.track};
  box-shadow: none;
}
[data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell .quiz-engine__progress i {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, ${c.accent}, ${c.accent2});
  transition: width .32s cubic-bezier(.22, 1, .36, 1);
}
[data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell > .quiz-engine__question {
  box-sizing: border-box;
  flex: 1 0 auto;
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: clamp(30px, 4vw, 40px) clamp(22px, 5vw, 46px) 34px;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
[data-quiz-theme="${slug}"] .quiz-engine__question h1 {
  max-width: 690px;
  margin: 0 auto 24px;
  color: ${c.ink};
  font-size: clamp(1.65rem, 3.8vw, 2.55rem);
  line-height: 1.08;
  text-wrap: balance;
}
[data-quiz-theme="${slug}"] .quiz-engine__visual {
  max-width: 680px;
  margin-inline: auto;
  border-color: ${c.border};
  border-radius: 16px;
  background: ${c.soft};
  box-shadow: none;
}
[data-quiz-theme="${slug}"] .quiz-engine__visual span,
[data-quiz-theme="${slug}"] .quiz-engine__visual span strong {
  min-width: 0;
  color: ${c.ink};
  word-break: normal;
  overflow-wrap: normal;
  hyphens: none;
}
[data-quiz-theme="${slug}"] .quiz-engine__answer {
  min-height: 62px;
  border-color: ${c.border};
  border-radius: 14px;
  background: rgba(255,255,255,.76);
  color: ${c.ink};
  box-shadow: 0 5px 14px rgba(26,34,39,.05);
}
[data-quiz-theme="${slug}"] .quiz-engine__answer[data-selected="true"] {
  border-color: ${c.accent};
  background: ${c.soft};
  box-shadow: 0 0 0 3px color-mix(in srgb, ${c.accent} 14%, transparent);
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint.quiz-engine__continuous-shell,
[data-quiz-theme="${slug}"] .quiz-engine__stage-result.quiz-engine__continuous-shell,
[data-quiz-theme="${slug}"] .quiz-engine__results.quiz-engine__continuous-shell,
[data-quiz-theme="${slug}"] .quiz-engine__career-final.quiz-engine__continuous-shell {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: clamp(28px, 5vw, 44px) clamp(22px, 5vw, 46px);
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint--progress-career { align-items: center; text-align: center; }
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint--progress-career .quiz-engine__checkpoint-icon {
  width: 58px;
  height: 58px;
  margin: 9px auto;
  border: 1px solid color-mix(in srgb, ${c.accent} 34%, white);
  border-radius: 18px;
  background: ${c.soft};
  color: ${c.accent};
  box-shadow: none;
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint--progress-career h2 {
  max-width: 680px;
  margin: 7px auto;
  color: ${c.ink};
  font-size: clamp(2rem, 4.4vw, 3.25rem);
  line-height: 1.02;
  text-wrap: balance;
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint--progress-career > p {
  max-width: 580px;
  margin: 0 auto 4px;
  color: ${c.muted};
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-journey-progress {
  width: 100%;
  margin: 16px 0 12px;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-journey-progress > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 7px;
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-journey-progress span,
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-journey-progress strong {
  color: ${c.muted};
  font-size: 14px;
  letter-spacing: 0;
  text-transform: none;
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-journey-progress strong { color: ${c.accent}; }
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-journey-progress > i {
  display: block;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: ${c.track};
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-journey-progress > i > b {
  display: block;
  width: var(--career-result-progress);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, ${c.accent}, ${c.accent2});
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-next--career {
  width: 100%;
  margin: 10px auto 4px;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, ${c.border} 72%, white);
  border-radius: 18px;
  background: ${c.soft};
  box-shadow: none;
}
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-next--career span { color: ${c.muted}; font-size: 12px; font-weight: 900; letter-spacing: .13em; }
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-next--career strong { display: block; margin: 4px 0; color: ${c.ink}; font-size: clamp(1.35rem, 2.6vw, 1.8rem); }
[data-quiz-theme="${slug}"] .quiz-engine__checkpoint-next--career small { display: block; color: ${c.muted}; font-size: 14px; font-weight: 750; line-height: 1.3; }
[data-quiz-theme="${slug}"] .quiz-engine__continuous-shell .quiz-engine__primary {
  display: inline-flex;
  box-sizing: border-box;
  width: 100% !important;
  min-height: 56px;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
  padding-inline: 22px;
  font-size: 17px;
  line-height: 1.15;
  text-align: center;
}
[data-quiz-theme="${slug}"] .quiz-engine__continuous-shell .quiz-engine__checkpoint-ad-note { width: 100%; margin: 13px 0 0; color: ${c.muted}; text-align: center; }
[data-quiz-theme="${slug}"] .quiz-engine__landing .quiz-engine__social,
[data-quiz-theme="${slug}"] .quiz-engine__landing .quiz-engine__primary { width: min(100%, 390px); max-width: 390px; }

/* Match the current compact five-stage landing hierarchy while keeping each
   university's own type, colour and texture. */
[data-quiz-theme="${slug}"] .quiz-engine__landing {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  width: min(100%, 900px);
  min-height: 520px;
  margin-inline: auto;
  padding: clamp(38px, 5vw, 54px);
  place-items: center;
}
[data-quiz-theme="${slug}"] .quiz-engine__landing-copy {
  display: grid;
  grid-column: 1 / -1;
  width: min(100%, 760px);
  margin-inline: auto;
  justify-items: center;
  text-align: center;
}
[data-quiz-theme="${slug}"] .quiz-engine__landing .quiz-engine__eyebrow,
[data-quiz-theme="${slug}"] .quiz-engine__landing .quiz-engine__lede,
[data-quiz-theme="${slug}"] .quiz-engine__landing .quiz-engine__landing-meta,
[data-quiz-theme="${slug}"] .quiz-engine__landing .quiz-engine__info-badge,
[data-quiz-theme="${slug}"] .quiz-engine__landing-art,
[data-quiz-theme="${slug}"] .quiz-engine__landing-symbol { display: none !important; }
[data-quiz-theme="${slug}"] .quiz-engine__landing h1 { max-width: 760px; margin: 11px auto 23px; text-wrap: balance; }
[data-quiz-theme="${slug}"] .quiz-engine__quick-start { max-width: 650px; margin: 0 auto 20px; }
[data-quiz-theme="${slug}"] .quiz-engine__social { margin: 0 auto 17px; }

@media (min-width: 701px) {
  [data-quiz-theme="${slug}"] .quiz-engine__checkpoint--progress-career .quiz-engine__checkpoint-journey-progress,
  [data-quiz-theme="${slug}"] .quiz-engine__checkpoint--progress-career .quiz-engine__checkpoint-next--career,
  [data-quiz-theme="${slug}"] .quiz-engine__checkpoint--progress-career > .quiz-engine__primary,
  [data-quiz-theme="${slug}"] .quiz-engine__checkpoint--progress-career > .quiz-engine__checkpoint-ad-note {
    width: min(100%, 520px) !important;
    max-width: 520px !important;
    align-self: center;
    margin-right: auto !important;
    margin-left: auto !important;
  }
}

@media (max-width: 700px) {
  [data-quiz-theme="${slug}"] .quiz-engine { padding: 18px 8px 56px; }
  [data-quiz-theme="${slug}"] .quiz-engine__landing { min-height: 0; padding: 28px 18px 24px; }
  [data-quiz-theme="${slug}"] .quiz-engine__continuous-shell {
    --university-flow-min-height: clamp(570px, 80svh, 760px);
    width: calc(100vw - 16px) !important;
    max-width: calc(100vw - 16px) !important;
    margin-inline: calc(50% - 50vw + 8px) !important;
    border-radius: 22px !important;
  }
  [data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell .quiz-engine__progress-head { padding: 15px 14px 8px; }
  [data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell .quiz-engine__progress { margin: 0 14px; }
  [data-quiz-theme="${slug}"] .quiz-engine__question-shell.quiz-engine__continuous-shell > .quiz-engine__question { padding: 23px 16px 27px; }
  [data-quiz-theme="${slug}"] .quiz-engine__question h1 { margin-bottom: 17px; font-size: clamp(24px, 7.2vw, 33px); line-height: 1.08; }
  [data-quiz-theme="${slug}"] .quiz-engine__visual { gap: 8px; margin-bottom: 13px; padding: 10px; }
  [data-quiz-theme="${slug}"] .quiz-engine__visual--code { grid-template-columns: 1fr !important; }
  [data-quiz-theme="${slug}"] .quiz-engine__visual--code > span > strong { min-height: 42px; padding: 8px 10px; font-size: clamp(.8rem, 4vw, 1rem); white-space: nowrap; }
  [data-quiz-theme="${slug}"] .quiz-engine__visual--word-sequence { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  [data-quiz-theme="${slug}"] .quiz-engine__visual--word-sequence > span > strong { white-space: nowrap; }
  [data-quiz-theme="${slug}"] .quiz-engine__visual--dense-sequence:not(.quiz-engine__visual--very-dense-sequence) {
    --quiz-visual-gap: 18px;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    column-gap: var(--quiz-visual-gap);
    row-gap: 9px;
  }
  [data-quiz-theme="${slug}"] .quiz-engine__visual--dense-sequence:not(.quiz-engine__visual--very-dense-sequence) > span > strong {
    min-height: 44px;
    padding: 6px 3px;
    font-size: clamp(.82rem, 4vw, 1rem);
    white-space: nowrap;
  }
  [data-quiz-theme="${slug}"] .quiz-engine__visual--dense-sequence:not(.quiz-engine__visual--very-dense-sequence) > span:nth-child(3) > i { display: none; }
  [data-quiz-theme="${slug}"] .quiz-engine__visual--dense-sequence:not(.quiz-engine__visual--very-dense-sequence) > span:nth-child(4) { grid-column: 1; }
  [data-quiz-theme="${slug}"] .quiz-engine__visual--dense-sequence:not(.quiz-engine__visual--very-dense-sequence) > span:nth-child(5) { grid-column: 2; }
  [data-quiz-theme="${slug}"] .quiz-engine__visual--spatial > span > strong { min-height: 48px; padding: 6px; font-size: clamp(1rem, 5vw, 1.45rem); white-space: nowrap; }
  [data-quiz-theme="${slug}"] .quiz-engine__answer { min-height: 58px; padding: 11px 12px; font-size: 15px; line-height: 1.24; }
  [data-quiz-theme="${slug}"] .quiz-engine__answer > strong { min-width: 0; word-break: normal; overflow-wrap: normal; hyphens: none; }
  [data-quiz-theme="${slug}"] .quiz-engine__checkpoint.quiz-engine__continuous-shell,
  [data-quiz-theme="${slug}"] .quiz-engine__stage-result.quiz-engine__continuous-shell,
  [data-quiz-theme="${slug}"] .quiz-engine__results.quiz-engine__continuous-shell,
  [data-quiz-theme="${slug}"] .quiz-engine__career-final.quiz-engine__continuous-shell { padding: 22px 18px 26px; }
  [data-quiz-theme="${slug}"] .quiz-engine__checkpoint--progress-career .quiz-engine__checkpoint-icon { width: 52px; height: 52px; margin-block: 7px; }
  [data-quiz-theme="${slug}"] .quiz-engine__checkpoint--progress-career h2 { font-size: clamp(28px, 8.5vw, 38px); }
  [data-quiz-theme="${slug}"] .quiz-engine__continuous-shell .quiz-engine__primary { min-height: 54px; margin-top: 12px; font-size: 16px; }
}
`;
  fs.writeFileSync(file, `${base}${css}\n`);
  console.log(`Updated ${slug} theme`);
}
