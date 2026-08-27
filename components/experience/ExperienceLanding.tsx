"use client";

import { forwardRef, type ReactNode } from "react";

type ExperienceLandingProps = {
  adNote?: string;
  avatars: string[];
  busy: boolean;
  busyLabel: string;
  ctaLabel: string;
  className?: string;
  icon: ReactNode;
  intro: string;
  onStart: () => void;
  socialProofText: string;
  title: string;
};

function SocialProof({ avatars, text }: { avatars: string[]; text: string }) {
  const count = text.match(/\d[\d\s,.\u00a0'’]*\+?/);
  const start = count?.index ?? 0;
  const end = start + (count?.[0].length ?? text.length);

  return (
    <div className="quiz-engine__social">
      {avatars.length ? (
        <div aria-hidden="true" className="quiz-engine__avatars">
          {avatars.map((avatar, index) => (
            <span key={`${avatar}-${index}`} style={{ backgroundImage: `url(${avatar})` }} />
          ))}
        </div>
      ) : null}
      <div className="quiz-engine__social-text">
        {start > 0 ? <span>{text.slice(0, start)}</span> : null}
        <strong>{text.slice(start, end)}</strong>
        {end < text.length ? <span>{text.slice(end)}</span> : null}
      </div>
    </div>
  );
}

export const ExperienceLanding = forwardRef<HTMLElement, ExperienceLandingProps>(function ExperienceLanding({
  adNote,
  avatars,
  busy,
  busyLabel,
  ctaLabel,
  className,
  icon,
  intro,
  onStart,
  socialProofText,
  title,
}, ref) {
  return (
    <section className={["quiz-engine__landing", className].filter(Boolean).join(" ")} ref={ref}>
      <div className="quiz-engine__landing-copy">
        <div aria-hidden="true" className="quiz-engine__landing-badge"><span>{icon}</span></div>
        <h1>{title}</h1>
        <p className="quiz-engine__quick-start">{intro}</p>
        <SocialProof avatars={avatars} text={socialProofText} />
        <button className="quiz-engine__primary" disabled={busy} onClick={onStart} type="button">
          <span aria-hidden="true" className="quiz-engine__primary-icon">▶</span>
          {busy ? busyLabel : ctaLabel}
        </button>
        {adNote ? <p className="quiz-engine__ad-note"><span>✓</span>{adNote}</p> : null}
      </div>
    </section>
  );
});
