import type { Translations } from "@/lib/i18n";

type StageResultScreenProps = {
  badge: string;
  buttonLabel: string;
  copy: string;
  helperText: string;
  isLoading?: boolean;
  nextStageName?: string | null;
  scoreLabel: string;
  title: string;
  translations: Translations;
  onContinue: () => void;
};

export function StageResultScreen({
  badge,
  buttonLabel,
  copy,
  helperText,
  isLoading = false,
  nextStageName,
  scoreLabel,
  title,
  translations,
  onContinue,
}: StageResultScreenProps) {
  return (
    <section className="legacy-card legacy-result legacy-stage-result">
      <h2>{title}</h2>
      <p className="legacy-stage-copy">{copy}</p>
      {nextStageName ? (
        <p className="legacy-stage-next">
          {translations.results.nextStage}: {nextStageName}
        </p>
      ) : null}
      <div className="legacy-stage-stats">
        <div>
          <strong>{scoreLabel}</strong>
          <span>{translations.results.scoreSoFar}</span>
        </div>
        <div>
          <strong>{badge}</strong>
          <span>{translations.results.roundResult}</span>
        </div>
      </div>
      <button type="button" disabled={isLoading} onClick={onContinue} className="legacy-primary legacy-stage-button">
        {isLoading ? translations.loading.ad : buttonLabel}
      </button>
      <div className="legacy-ad-note">
        <span className="legacy-shield" aria-hidden="true">i</span>
        <span>{helperText}</span>
      </div>
    </section>
  );
}
