import {directionalParts} from './directionalText';

export function QuizText({text}: {text: string}) {
  return <bdi dir="auto">{directionalParts(text).map((part, index) => {
    if (!part.ltr) return part.text;
    const atomic = part.text.length <= 10 || (/^\([^()]+\)$/.test(part.text) && part.text.length <= 18);
    const alphabet = /^[A-Z]{20,}$/.test(part.text);
    const className = `quiz-text__literal${atomic ? ' quiz-text__literal--atomic' : ''}${alphabet ? ' quiz-text__literal--alphabet' : ''}`;
    return <bdi className={className} dir="ltr" key={index}>{part.text}</bdi>;
  })}</bdi>;
}
