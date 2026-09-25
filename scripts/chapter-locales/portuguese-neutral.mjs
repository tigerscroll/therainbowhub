import {applyReviewedPortugueseQuestions} from './portuguese-reviewed-questions.mjs';
import {polishPortugueseInterface} from './portuguese-interface.mjs';
import {portugueseContext} from './portuguese-context.mjs';

// One PT edition: use shared vocabulary and an implicit, polite form of address.
// Keep both technical names where choosing one would privilege a national usage.
// This is an editorial rule set, not a claim of native-speaker certification.
const pairs = [
 ['oxigénio', 'oxigênio'], ['hidrogénio', 'hidrogênio'], ['nitrogénio', 'nitrogênio'],
 ['neurónio', 'neurônio'], ['axónio', 'axônio'], ['fémur', 'fêmur'],
 ['hormona', 'hormônio'], ['hormonas', 'hormônios'], ['vómitos', 'vômitos'],
 ['células estaminais', 'células-tronco'], ['tiroide', 'tireoide'],
 ['paratiroides', 'paratireoides'], ['peritoneu', 'peritônio'],
 ['nefrónio', 'néfron'], ['nefrónios', 'néfrons'],
 ['infeção', 'infecção'], ['infeções', 'infecções'],
 ['colagénio', 'colágeno'], ['termómetro', 'termômetro'],
 ['cromossoma', 'cromossomo'], ['cromossomas', 'cromossomos'],
 ['ribossoma', 'ribossomo'], ['ribossomas', 'ribossomos'],
 ['lisossoma', 'lisossomo'], ['lisossomas', 'lisossomos'],
 ['travão', 'freio'], ['travões', 'freios'], ['fumo', 'fumaça'],
];

function casing(original, replacement) {
 if (original === original.toLocaleUpperCase('pt')) return replacement.toLocaleUpperCase('pt');
 return /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(original) ? replacement[0].toLocaleUpperCase('pt') + replacement.slice(1) : replacement;
}
function replaceWords(text, from, to) {
 return text.replace(new RegExp(`(?<![\\p{L}])(?:${from})(?![\\p{L}])`, 'giu'), match => casing(match, to));
}
function walk(value, fn, parts = []) {
 if (typeof value === 'string') return fn(value, parts);
 if (Array.isArray(value)) return value.map((item, i) => walk(item, fn, [...parts, String(i)]));
 if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) value[key] = walk(item, fn, [...parts, key]);
 return value;
}

const exact = {
 ...portugueseContext,
 'Comunicação clara da equipe': 'Comunicação clara entre colegas',
 'Lendo os instrumentos': 'Leitura dos instrumentos',
 'Encontrando direção': 'Orientação e direção',
 'Tempo e fluxo de ar': 'Meteorologia e circulação do ar',
 'Planejando com números': 'Cálculos para preparar o voo',
 'Controles de aeronaves': 'Comandos da aeronave',
 'Freios e aderência': 'Desaceleração e aderência',
 'Portas do trem de pouso': 'Portas que cobrem as rodas retráteis',
 'O registro da aeronave': 'A matrícula da aeronave',
 'Uma mudança no registro da aeronave': 'Uma mudança na matrícula da aeronave',
 'Uma tarefa é entregue entre a equipe. O que torna a responsabilidade mais clara?': 'Uma tarefa passa de um profissional para outro. O que ajuda a esclarecer a responsabilidade?',
 'O nome preferido de uma pessoa difere do nome usado pela equipe. O que é útil?': 'Uma pessoa prefere um nome diferente daquele que os profissionais usam. O que é útil fazer?',
 'Um colega relata uma nova preocupação de segurança. O que apoia o trabalho em equipe eficaz?': 'Um colega comunica uma nova preocupação de segurança. O que favorece uma boa colaboração?',
 'Um registro odontológico nomeia o lado esquerdo, mas uma referência nomeia o direito. O que precisa de esclarecimento?': 'A documentação dentária indica o lado esquerdo, mas o pedido de avaliação indica o direito. O que é necessário esclarecer?',
 'Um registro não contém nenhuma entrada sobre sangramento gengival. O que pode ser concluído apenas com a entrada faltante?': 'Não há qualquer anotação sobre perda de sangue nas gengivas. O que permite concluir essa ausência de informação?',
 'Essa informação não foi registrada': 'Essa informação não foi documentada',
 'Um registro anterior normal é seguido por nova dificuldade respiratória. Que informações orientam a resposta agora?': 'Uma avaliação anterior foi normal, mas surgiu dificuldade respiratória. Que informações devem orientar a resposta?',
 'A mudança atual junto com o registro anterior': 'A mudança atual em conjunto com a avaliação anterior',
 'O registo clínico diz «braço esquerdo», mas a passagem de informações refere «braço direito». O que precisa de ser esclarecido?': 'A documentação clínica indica «braço esquerdo», mas a passagem de informações refere «braço direito». O que é necessário esclarecer?',
 'Qual entrada registra o que aconteceu com mais clareza?': 'Que anotação descreve com mais clareza o que aconteceu?',
 'Qual registro separa claramente um sintoma relatado de uma observação?': 'Que anotação distingue claramente um sintoma relatado de uma observação?',
 'O que um eletrocardiograma registra?': 'Que atividade mede um eletrocardiograma?',
 'O gráfico tem uma nova página': 'A documentação clínica tem uma nova página',
 'Suponha que o gráfico em branco refute o relatório': 'Supor que a ausência de informação na ficha prova que o relato é falso',
 'Um tablet é movido para uma prateleira': 'Um comprimido é colocado numa prateleira',
 'Adivinhe pela cor do tablet': 'Adivinhar pela cor do comprimido',
 'Número do dente': 'Número de dentes',
 'Número conjunto': 'Número de articulações',
 'Dois ovos se fundem': 'Dois óvulos unem-se',
 'Esclareça através do profissional qualificado apropriado': 'Pedir esclarecimentos a um profissional com a qualificação adequada',
 'Eles permanecem limpos independentemente do que tocam': 'Mantêm-se limpas, independentemente das superfícies em que tocam',
 'Eles tornam a limpeza das mãos desnecessária': 'Dispensam a higiene das mãos',
 'Peça a outro paciente para responder por eles': 'Pedir a outra pessoa que responda em seu lugar',
 'Explique claramente e peça-lhes que descrevam com suas próprias palavras': 'Explicar com clareza e pedir à pessoa que repita a informação pelas próprias palavras',
 'Suponha que eles não possam tomar decisões': 'Supor que a pessoa não pode tomar decisões',
 'Cubra a boca e corra': 'Tapar a boca e falar com pressa',
 'Leve o relatório deles a sério e avalie-o': 'Levar o relato a sério e avaliar a dor',
 'Espere até eles chorarem antes de ouvir': 'Esperar que a pessoa chore antes de a ouvir',
 'Avalie a ajuda e o equipamento necessário antes de se mudar': 'Avaliar a ajuda e o equipamento necessários antes de movimentar a pessoa',
 'Puxe-os rapidamente por um braço': 'Puxar a pessoa rapidamente por um braço',
 'Peça-lhes que se apressem antes de ficarem cansados': 'Pedir à pessoa que se apresse antes de ficar cansada',
 'A respiração deles certamente permanece inalterada': 'A respiração da pessoa permanece certamente igual',
 'Antes estava alerta; agora apresenta confusão recente': 'Antes estava alerta; agora apresenta confusão',
 'Comece com termos técnicos inexplicáveis': 'Começar com termos técnicos sem os explicar',
 'Abreviaturas médicas inexplicáveis': 'Abreviaturas médicas sem explicação',
 'Ignore-o, a menos que outro paciente concorde': 'Ignorar a informação, a menos que outra pessoa a confirme',
 'Combiná-los elimina todas as incertezas': 'Considerá-las em conjunto elimina todas as incertezas',
 'Seu padrão combinado pode ser mais informativo': 'O conjunto das observações pode fornecer mais informação',
 'Somente a dor relatada pode importar': 'Apenas a dor relatada tem importância',
 'Eles fornecem diferentes tipos de informações': 'Fornecem tipos diferentes de informação',
 'Eles podem afetar o planejamento seguro': 'Podem influenciar a preparação segura do tratamento',
 'Explique claramente e faça perguntas antes de solicitar consentimento': 'Explicar com clareza e dar espaço para perguntas antes de pedir consentimento',
 'Porquê verificar o identificador do paciente numa amostra?': 'Por que motivo é necessário confirmar a identificação da pessoa numa amostra?',
 'Para substituir o horário de coleta de amostra': 'Para substituir a indicação da hora de obtenção da amostra',
 'Para prever o resultado do nome': 'Para prever o resultado a partir do nome',
 'Para conectar o resultado à pessoa correta': 'Para associar o resultado à pessoa certa',
 'Qual conclusão é sólida?': 'Que conclusão é justificada?',
 'Qual é a gengiva?': 'Que tecido envolve a base dos dentes?',
 'Apoiando seus soquetes': 'Sustentar os alvéolos onde se alojam os dentes',
 'Apenas o acessório de goma': 'Apenas a zona de ligação da gengiva',
 'Sua dica': 'A extremidade da raiz',
 'Qual osso forma a mandíbula?': 'Que osso forma a parte inferior móvel dos maxilares?',
 'Quais ossos formam a mandíbula superior?': 'Que ossos formam o maxilar superior?',
 'O que a superfície mesial do dente enfrenta?': 'Para onde está voltada a superfície mesial de um dente?',
 'O que uma impressão dentária ou digitalização digital é usada para capturar?': 'O que permite reproduzir um molde dentário ou uma digitalização da boca?',
 'Para remover placas e detritos de espaços, uma escova pode falhar': 'Para retirar placa bacteriana e resíduos de espaços onde a escova pode não chegar',
 'Eles produzem ácidos a partir de carboidratos fermentáveis': 'Produzem ácidos a partir de açúcares e outros hidratos de carbono fermentáveis',
 'Qual é o propósito da limpeza entre os dentes?': 'Qual é o objetivo da limpeza entre os dentes?',
 'Um dente é sensível, mas a causa não foi avaliada. Qual é a conclusão sólida?': 'Um dente apresenta sensibilidade, mas a causa ainda não foi avaliada. Que conclusão é justificada?',
 'Sensibilidade nunca pode importar': 'A sensibilidade nunca tem importância',
 'Uma criança tem dentes decíduos e permanentes. O que um gráfico deve distinguir?': 'Uma criança tem dentes de leite e dentes permanentes. O que deve distinguir o esquema da dentição?',
 'Uma equipe já pagou uma taxa não reembolsável. O que deve orientar se devemos continuar agora?': 'Um grupo já pagou uma taxa que não pode recuperar. O que deve orientar a decisão de continuar?',
 'O benefício que você abre mão do Plano B': 'O benefício do Plano B a que se renuncia',
 'Uma meta são 90 tarefas. A equipe completa 28, 31 e 26. Quantos mais são necessários?': 'A meta é concluir 90 tarefas. Um grupo conclui 28, depois 31 e depois 26. Quantas faltam?',
 'A alíquota muda de 10% para 15%. Qual é o aumento em pontos percentuais?': 'Uma taxa passa de 10% para 15%. Qual é o aumento em pontos percentuais?',
 'Nesse experimento leve, qual é o resultado a ser medido?': 'Nessa experiência sobre a luz, que resultado deve ser medido?',
 'As vendas aumentaram depois que um novo sinal apareceu. O que esse fato por si só estabelece?': 'As vendas aumentaram depois da colocação de uma nova placa publicitária. O que permite concluir apenas essa informação?',
 'A ascensão seguiu a mudança de sinal': 'O aumento ocorreu depois da mudança da placa',
 'Ele negocia custo mais baixo por mais tempo': 'Reduz o custo, mas exige mais tempo',
 'A probabilidade de fracasso': 'A probabilidade de ocorrer uma falha',
 'Uma avaliação pode ser expandida posteriormente se funcionar. Qual recurso torna isso possível?': 'Um projeto experimental pode ser ampliado se der resultado. Que característica do plano permite isso?',
 'Todos que entraram foram cadastrados': 'Todas as pessoas que entraram tinham inscrição',
 'Uma caixa contém 12 fichas vermelhas ou azuis. Que fato adicional determinaria o número de contadores vermelhos?': 'Uma caixa contém 12 fichas vermelhas ou azuis. Que informação permite saber quantas são vermelhas?',
 'O número de contadores azuis': 'O número de fichas azuis',
 'Um cronograma dá um começo, mas não um fim. Qual fato permitiria que você encontrasse o fim?': 'Um horário indica o início de uma atividade, mas não o fim. Que informação permite calcular a hora de fim?',
 'Eles estão associados nos dados': 'Existe uma associação entre as duas medidas nos dados',
 'Um pássaro usa um ninho. Uma colônia de abelhas usa um…': 'Um pássaro vive num ninho. Um grupo de abelhas vive numa…',
 'Adicione o primeiro e o último dígito da sequência numérica anterior. O que você ganha?': 'Some o primeiro e o último algarismo da sequência anterior. Qual é o resultado?',
 'A paz esteja com você': 'A paz esteja convosco',
 'Suponha que todos os bebês parem de se mover antes do nascimento': 'Supor que todos os fetos deixam de se mexer antes do nascimento',
 'O bebê começando a mamar': 'A criança começar a mamar',
 'O bebê abrir os olhos': 'A criança abrir os olhos',
 'Bebê': 'Criança',
 'Parece que toda a gente menos eu': 'Parece que todos menos eu',
 'Uma olhadela': 'Uma observação rápida',
};

const vocabulary = [
 ['aprendizado', 'aprendizagem'], ['planejamento|planeamento', 'preparação'],
 ['planejado', 'previsto'], ['planejada', 'prevista'], ['planejando', 'preparando'],
 ['treinamentos', 'cursos de formação'], ['o treinamento', 'a formação'], ['do treinamento', 'da formação'],
 ['no treinamento', 'na formação'], ['seu treinamento', 'sua formação'], ['treinamento', 'formação'],
 ['monitoramento', 'acompanhamento'], ['escrutínio', 'análise cuidadosa'],
 ['questionário', 'teste'], ['questionários', 'testes'], ['cotidiano|quotidiano', 'dia a dia'],
 ['cotidianas', 'do dia a dia'], ['cotidian[oa]s?', 'do dia a dia'],
 ['checkpoints', 'pontos de pausa'], ['ponto de verificação', 'ponto de pausa'], ['pontos de verificação', 'pontos de pausa'],
 ['porcentagem', 'percentagem'], ['gerenciar', 'organizar'],
 ['geléia', 'geleia'], ['traquéia', 'traqueia'], ['tireóide', 'tireoide'], ['paratireóide', 'paratireoide'],
 ['supra-renais', 'suprarrenais'], ['microorganismos', 'microrganismos'], ['prevêem', 'preveem'],
 ['arquivo', 'documento'], ['arquivos', 'documentos'],
 ['registrado|registado', 'documentado'], ['registrada|registada', 'documentada'],
 ['registrados|registados', 'documentados'], ['registradas|registadas', 'documentadas'],
 ['registrar|registar', 'documentar'], ['registre|registe', 'documente'], ['registra|regista', 'documenta'],
 ['registro|registo', 'documento'], ['registros|registos', 'documentos'],
 ['contêineres', 'recipientes'], ['contêiner', 'recipiente'],
 ['fatos|factos', 'dados'], ['fato|facto', 'dado'],
 ['da tela', 'do visor'], ['na tela', 'no visor'], ['a tela', 'o visor'], ['tela', 'visor'],
 ['tapete rolante', 'passadeira móvel'],
 ['matrimônio|matrimónio', 'casamento'], ['cerimônia|cerimónia', 'celebração'],
 ['Gênesis|Génesis', 'Génesis (Gênesis)'], ['geladeira|frigorífico', 'aparelho de refrigeração'],
 ['umidade|humidade', 'humidade (umidade)'],
];

const genericProfiles = [
 'Acertou quase todas as perguntas. A análise por tema mostra onde os conhecimentos se destacaram.',
 'Reconheceu muitas pistas e estabeleceu relações corretas. Explore a análise por tema para descobrir os pontos fortes.',
 'Acertou em vários temas e encontrou boas pistas. A análise das respostas ajuda a identificar o que vale a pena rever.',
 'Encontrou pistas úteis em diferentes temas. Consulte as respostas corretas para esclarecer as perguntas mais difíceis.',
 'Alguns temas foram mais familiares do que outros. As respostas corretas podem ajudar a preparar uma nova tentativa.',
 'Este desafio juntou ideias conhecidas e temas novos. A revisão das respostas ajuda a descobrir as pistas que escaparam.',
];

const gerunds = {
 Substituindo:'Substituir', Usando:'Usar', Adivinhando:'Adivinhar', Removendo:'Remover', Medindo:'Medir',
 Concordando:'Concordar', Falando:'Falar', Planejando:'Preparar', Preparando:'Preparar', Prestando:'Prestar',
 Fazendo:'Fazer', Conhecendo:'Conhecer', Observando:'Observar', Lembrando:'Recordar', Deixando:'Deixar',
 Produzindo:'Produzir', Ignorando:'Ignorar', Alterando:'Alterar', Lendo:'Ler', Nomeando:'Nomear', Separando:'Separar',
 Verificando:'Verificar', Digerindo:'Digerir', Construindo:'Construir', Armazenando:'Armazenar', Levando:'Levar',
 Relatando:'Relatar', Descrevendo:'Descrever', Repetindo:'Repetir', Liberando:'Libertar', Cobrindo:'Cobrir',
 Dando:'Dar', Compartilhando:'Partilhar', Controlando:'Controlar', Escrevendo:'Escrever', Rejeitando:'Rejeitar',
 Selecionando:'Selecionar', Explicando:'Explicar', Mudando:'Alterar', Excluindo:'Excluir', Cortando:'Cortar',
 Congelando:'Congelar', Mexendo:'Mexer', Movendo:'Mover', Apoiando:'Apoiar', Provando:'Provar', Garantindo:'Garantir',
 Aprendendo:'Aprender', Abrindo:'Abrir', Resfriando:'Reduzir a temperatura de', Seguindo:'Seguir', Escolhendo:'Escolher',
 Concluindo:'Concluir', Fechando:'Fechar', Examinando:'Examinar', Assumindo:'Supor', Evitando:'Evitar', Unindo:'Unir',
 Fornecendo:'Fornecer', Esperando:'Esperar', Escondendo:'Esconder', Prevenindo:'Prevenir', Confiando:'Confiar',
 Supondo:'Supor', Praticando:'Praticar', Imprimindo:'Imprimir', Ouvindo:'Ouvir', Tomando:'Tomar', Filtrando:'Filtrar',
 Aumentando:'Aumentar', Questionando:'Questionar', Ajustando:'Ajustar', Entorpecendo:'Anestesiar', Criando:'Criar',
};

export function neutralPortugueseText(value, parts = []) {
 value = exact[value] ?? value;
 value = value.replace(/Comunicação clara da equipe/gi, match => casing(match, 'comunicação clara entre colegas'));
 for (const [from, to] of [
  ['trabalho em equip[ae]', 'colaboração'], ['entre a equip[ae]', 'entre colegas'],
  ['duas equipes|duas equipas', 'dois grupos'], ['as equipes|as equipas', 'os grupos'],
  ['das equipes|das equipas', 'dos grupos'], ['uma equip[ae]', 'um grupo'],
  ['outra equip[ae]', 'outro grupo'], ['pela equip[ae]', 'pelos profissionais'],
  ['da equip[ae]', 'do grupo'], ['na equip[ae]', 'no grupo'], ['a equip[ae]', 'o grupo'],
  ['equipes|equipas', 'grupos'], ['equipe|equipa', 'grupo'],
 ]) value = replaceWords(value, from, to);
 for (const [from,to] of vocabulary) {
  // A paired Bible book title is already complete.
  if (from==='Gênesis|Génesis') value=value.replace(/G[êé]nesis(?:\s*(?:ou|\()\s*G[êé]nesis\)?)?/gi,'Génesis (Gênesis)');
  else if (from==='umidade|humidade') value=value.replace(/(?:h?umidade)(?:\s*\(umidade\))?/gi,match=>casing(match,'humidade (umidade)'));
  else value=replaceWords(value,from,to);
 }
 for (const [eu,br] of pairs) {
  if(eu===br)continue;
  value=replaceWords(value, `${eu}(?:,?\\s*(?:\\(|ou|/|também chamad[oa]s?)\\s*${br}\\)?)?|${br}`,`${eu} (${br})`);
 }
 // The pronoun is not needed for an implied reader, but preserve quoted dialogue
 // and prepositional objects for the explicit rewrites below.
 value=value.replace(/(^|[.!?]\s+)Você (\p{Ll})/gu,(_,prefix,letter)=>prefix+letter.toLocaleUpperCase('pt'));
 value=value.replace(/(?<![\p{L}])você (?=(?:pode|deve|tem|precisa|conta|gasta|usou|descobre|termina|está|vai|consegue|vê|viu|errou|perdeu|quis|definitivamente|não|realmente|acabou|trabalha|tiver|encontrasse|se conecta|se saiu|abre mão|ganha|abordou))/gu,'');
 if(parts.includes('answers')) value=value.replace(/^([\p{L}]+)(?=\s)/u,word=>gerunds[word]??word);
 return value;
}

export function polishNeutralPortuguese(slug, copy, manifest) {
 walk(copy, neutralPortugueseText);
 applyReviewedPortugueseQuestions(slug, copy);
 polishPortugueseInterface(slug, copy);
 if (slug === 'bible') {
  // Saul the king and Saul/Paul the apostle have different established names.
  for (const stage of Object.values(copy.stages)) for (const [id, q] of Object.entries(stage.questions)) {
   if (['bible-s3q1','bible-s3q2','bible-s3q5','bible-s5q6'].includes(id)) {
    for (const key of Object.keys(q.answers)) if (q.answers[key] === 'Saulo') q.answers[key] = 'Saul';
   }
  }
 }
 if(manifest.engine.scoring==='correct-answer' && !['treatments','memory','vision'].includes(slug)) {
  Object.values(copy.results.profiles).forEach((profile,i)=>{profile.copy=genericProfiles[i];});
 }
 for(const q of Object.values(copy.stages).flatMap(stage=>Object.values(stage.questions))){
  if(slug==='vision'&&q.image)q.image.alt=`Desafio visual. ${q.question}`;
 }
 if(copy.results.score?.strongest)copy.results.score.strongest='O seu ponto forte';
 if(copy.results.score?.trickiest)copy.results.score.trickiest='A área mais desafiante';
 if(copy.results.score?.insights)copy.results.score.insights.overview='A pontuação em resumo';
}
