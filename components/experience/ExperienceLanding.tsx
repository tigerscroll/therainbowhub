"use client";

import { forwardRef, type ReactNode } from "react";

type ExperienceLandingProps = {
  adNote?: string;
  disclaimer?: string;
  avatars: string[];
  busy: boolean;
  busyLabel: string;
  ctaIcon?: ReactNode;
  ctaIconPosition?: "start" | "end";
  ctaLabel: string;
  className?: string;
  icon: ReactNode;
  intro: string;
  href?: string;
  onStart: () => boolean | void;
  showCtaIcon?: boolean;
  showSocialProof?: boolean;
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
  disclaimer,
  avatars,
  busy,
  busyLabel,
  ctaIcon = "▶",
  ctaIconPosition = "start",
  ctaLabel,
  className,
  icon,
  intro,
  href,
  onStart,
  showCtaIcon = true,
  showSocialProof = true,
  socialProofText,
  title,
}, ref) {
  const ctaContent = (
    <>
      {showCtaIcon && ctaIconPosition === "start" ? <span aria-hidden="true" className="quiz-engine__primary-icon">{ctaIcon}</span> : null}
      {busy ? busyLabel : ctaLabel}
      {showCtaIcon && ctaIconPosition === "end" ? <span aria-hidden="true" className="quiz-engine__primary-icon">{ctaIcon}</span> : null}
    </>
  );

  return (
    <section className={["quiz-engine__landing", className].filter(Boolean).join(" ")} ref={ref}>
      <div className="quiz-engine__landing-copy">
        <div aria-hidden="true" className="quiz-engine__landing-badge"><span>{icon}</span></div>
        <h1>{title}</h1>
        <p className="quiz-engine__quick-start">{intro}</p>
        {showSocialProof ? <SocialProof avatars={avatars} text={socialProofText} /> : null}
        {href && !busy ? (
          <a
            className="quiz-engine__primary"
            href={href}
            onClick={(event) => {
              event.currentTarget.setAttribute("data-departing", "true");
              event.currentTarget.setAttribute("aria-busy", "true");
              const destination = new URL(href, window.location.href);
              const current = new URL(window.location.href);
              current.searchParams.forEach((value, key) => {
                if (!destination.searchParams.has(key)) destination.searchParams.append(key, value);
              });
              event.currentTarget.href = destination.toString();
              if (onStart() === false) {
                event.currentTarget.removeAttribute("data-departing");
                event.currentTarget.removeAttribute("aria-busy");
                event.preventDefault();
              }
            }}
          >
            {ctaContent}
          </a>
        ) : (
          <button className="quiz-engine__primary" disabled={busy} onClick={onStart} type="button">
            {ctaContent}
          </button>
        )}
        {adNote ? <p className="quiz-engine__ad-note"><span>✓</span>{adNote}</p> : null}
        {disclaimer ? <p className="quiz-engine__landing-disclaimer">{disclaimer}</p> : null}
      </div>
    </section>
  );
});
