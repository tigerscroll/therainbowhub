// Language relationships replace the two English compound-word questions.
// Each row is prompt, correct answer, then three distractors. Answer IDs and
// score positions come from the shared manifest, never from this text order.
const rows = {
  fr: [
    ['On lit un livre. Que fait-on avec de la musique ?', 'On l’écoute', 'On la pèse', 'On la plie', 'On l’arrose'],
    ['Un couteau sert à couper. À quoi sert un stylo ?', 'À écrire', 'À cuisiner', 'À mesurer la température', 'À verrouiller une porte'],
    ['Oiseau → volée associe un animal à un groupe de son espèce. Quel autre couple suit cette logique ?', 'Poisson → banc', 'Abeille → miel', 'Lion → tanière', 'Cheval → écurie'],
  ],
  de: [
    ['Ein Buch wird gelesen. Was macht man mit Musik?', 'Man hört sie', 'Man wiegt sie', 'Man faltet sie', 'Man gießt sie'],
    ['Ein Messer dient zum Schneiden. Wozu dient ein Stift?', 'Zum Schreiben', 'Zum Kochen', 'Zum Messen der Temperatur', 'Zum Abschließen einer Tür'],
    ['Vogel → Schwarm verbindet ein Tier mit einer Gruppe seiner Art. Welches Paar hat dieselbe Beziehung?', 'Fisch → Schwarm', 'Biene → Honig', 'Löwe → Höhle', 'Pferd → Stall'],
  ],
  it: [
    ['Un libro si legge. Che cosa si fa con la musica?', 'Si ascolta', 'Si pesa', 'Si piega', 'Si annaffia'],
    ['Un coltello serve a tagliare. A che cosa serve una penna?', 'A scrivere', 'A cucinare', 'A misurare la temperatura', 'A chiudere una porta a chiave'],
    ['Uccello → stormo collega un animale a un gruppo della sua specie. Quale coppia segue la stessa logica?', 'Pesce → banco', 'Ape → miele', 'Leone → tana', 'Cavallo → stalla'],
  ],
  nl: [
    ['Een boek lees je. Wat doe je met muziek?', 'Je luistert ernaar', 'Je weegt het', 'Je vouwt het', 'Je geeft het water'],
    ['Een mes gebruik je om te snijden. Waarvoor gebruik je een pen?', 'Om te schrijven', 'Om te koken', 'Om de temperatuur te meten', 'Om een deur op slot te doen'],
    ['Vogel → zwerm koppelt een dier aan een groep van zijn soort. Welk paar heeft dezelfde relatie?', 'Vis → school', 'Bij → honing', 'Leeuw → hol', 'Paard → stal'],
  ],
  es: [
    ['Un libro se lee. ¿Qué se hace con la música?', 'Se escucha', 'Se pesa', 'Se dobla', 'Se riega'],
    ['Un cuchillo sirve para cortar. ¿Para qué sirve un bolígrafo?', 'Para escribir', 'Para cocinar', 'Para medir la temperatura', 'Para cerrar una puerta con llave'],
    ['Pájaro → bandada relaciona un animal con un grupo de su especie. ¿Qué par tiene la misma relación?', 'Pez → banco', 'Abeja → miel', 'León → guarida', 'Caballo → establo'],
  ],
  pt: [
    ['Um livro serve para ler. A música serve para…', 'Ouvir', 'Pesar', 'Dobrar', 'Regar'],
    ['Uma faca serve para cortar. Uma caneta serve para…', 'Escrever', 'Cozinhar', 'Medir a temperatura', 'Trancar uma porta'],
    ['Pássaro → bando relaciona um animal com o seu grupo. Que par tem a mesma relação?', 'Peixe → cardume', 'Abelha → mel', 'Leão → toca', 'Cavalo → estábulo'],
  ],
  ar: [
    ['الكتاب يُقرأ. ماذا نفعل بالموسيقى؟', 'نستمع إليها', 'نزنها', 'نطويها', 'نسقيها'],
    ['تُستخدم السكين للقطع. فيمَ يُستخدم القلم؟', 'الكتابة', 'الطهي', 'قياس الحرارة', 'إقفال باب'],
    ['يربط «طائر ← سرب» الحيوانَ بمجموعة من نوعه. أي زوج يعبر عن العلاقة نفسها؟', 'سمكة ← سرب', 'نحلة ← عسل', 'أسد ← عرين', 'حصان ← إسطبل'],
  ],
};

export function polishWordPuzzles(copy, manifest, locale) {
  const questions = Object.assign({}, ...Object.values(copy.stages).map(stage => stage.questions));
  for (const [index, [prompt, correct, ...wrong]] of rows[locale].entries()) {
    const id = `iq-s3q${index + 4}`, logic = manifest.structure.questions[id];
    const question = questions[id];
    question.question = prompt;
    let distractor = 0;
    question.answers = Object.fromEntries(logic.answerIds.map(key => [key, key === logic.correctAnswerId ? correct : wrong[distractor++]]));
  }
}
