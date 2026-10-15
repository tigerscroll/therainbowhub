import type { ReactNode } from "react";

type ExperienceIconProps = {
  icon: ReactNode;
};

/** Renders named interface icons while preserving existing emoji and artwork. */
export function ExperienceIcon({ icon }: ExperienceIconProps) {
  if (icon === "lucide:zap") {
    return (
      <svg
        aria-hidden="true"
        className="quiz-engine__lucide-icon quiz-engine__lucide-icon--zap"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path d="M4 14a1 1 0 0 1-.78-1.63l9-11A.5.5 0 0 1 13 1.68V10a1 1 0 0 0 1 1h6a1 1 0 0 1 .78 1.63l-9 11A.5.5 0 0 1 11 23.32V15a1 1 0 0 0-1-1z" />
      </svg>
    );
  }

  return <>{icon}</>;
}
