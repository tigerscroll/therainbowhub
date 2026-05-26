import type { Translations } from "@/lib/i18n";

type StageResultScreenProps = {
  badge: string;
  buttonLabel: string;
  copy: string;
  helperText: string;
  isLoading?: boolean;
  scoreLabel: string;
  stageName: string;
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
  scoreLabel,
  stageName,
  title,
  translations,
  onContinue,
}: StageResultScreenProps) {
  return (
    <section className="legacy-card legacy-result">
      <span className="legacy-profile-badge">{badge}</span>
      <h2>{title}</h2>
      <p className="legacy-sub">{copy}</p>
      <p className="legacy-next-round">{translations.results.stageComplete}: {stageName}</p>
      <div className="legacy-score">
        <strong>{scoreLabel}</strong>
        <span>{translations.quiz.finalScore}</span>
      </div>
      <button type="button" disabled={isLoading} onClick={onContinue} className="legacy-primary">
        {isLoading ? translations.loading.ad : buttonLabel}
      </button>
      <div className="legacy-ad-note">
        <span className="legacy-shield" aria-hidden="true">i</span>
        <span>{helperText}</span>
      </div>
    </section>
  );
}
