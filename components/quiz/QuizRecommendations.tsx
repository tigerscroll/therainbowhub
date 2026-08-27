import type { QuizRecommendation } from "@/lib/quizzes";

function RecommendationCard({ recommendation }: { recommendation: QuizRecommendation }) {
  return (
    <a className="quiz-engine__recommendation" href={recommendation.href}>
      <span className="quiz-engine__recommendation-thumbnail">
        <img alt={recommendation.thumbnailAlt} decoding="async" loading="lazy" src={recommendation.thumbnailUrl} />
      </span>
      <div className="quiz-engine__recommendation-copy">
        <h3>{recommendation.title}</h3>
        <p>{recommendation.summary}</p>
      </div>
      <span className="quiz-engine__recommendation-arrow" aria-hidden="true">→</span>
    </a>
  );
}

export function QuizRecommendations({ recommendations }: { recommendations: QuizRecommendation[] }) {
  return (
    <section className="quiz-engine__recommendations" aria-label="Recommended quizzes">
      <header>
        <span>RECOMMENDED NEXT</span>
        <h3>Try another challenge</h3>
      </header>
      <div className="quiz-engine__recommendation-grid">
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.href} recommendation={recommendation} />
        ))}
      </div>
    </section>
  );
}
