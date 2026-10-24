import {spanishYears} from './years-left-es.mjs';

// Broadly understood Spanish. Stable question IDs keep each answer aligned with
// its original meaning, including the calibration question shown last.
export const spanishYearsQuestions = Object.fromEntries(spanishYears.map((row, i) => [
  `yl-s${Math.floor(i / 7) + 1}q${i % 7 + 1}`, row.join('|'),
]));

Object.assign(spanishYearsQuestions, {
  'yl-s1q8': 'Tienes cinco minutos antes de que el día se complique. ¿Qué te llama la atención?|Un momento de calma antes de empezar|Ese mensaje que llevo tiempo evitando|Lo primero que me parezca interesante|Quedarme un poco más en mi rincón favorito',
  'yl-s1q9': 'Elige la música para empezar tu mañana.|Una canción que me encanta para empezar bien el día|Algo conocido mientras me preparo|Silencio. Mi cabeza ya tiene suficiente ruido|La lista de canciones de anoche sigue sonando',
  'yl-s1q10': 'La lluvia cambia tus planes de la mañana. ¿Qué haces?|Busco otra forma de disfrutar el día|Ajusto el plan y sigo adelante|Convierto quedarme en casa en un pequeño lujo|Siento que no puedo avanzar antes de empezar',
  'yl-s2q8': 'Una receta tarda más de lo esperado. ¿Qué pasa?|Disfruto el experimento de todos modos|La simplifico y preparo algo para comer|Ojalá hubiera elegido mi plato favorito de siempre|Me apresuro porque todo lo demás está esperando',
  'yl-s2q9': 'Puedes inventar una pequeña tradición con la comida. Elige una.|Probar algo nuevo cada semana|Tener una comida sencilla preparada para los días ocupados|Una comida reconfortante cuando la necesite|Un festín sorpresa cuando me apetezca celebrar',
  'yl-s2q10': 'Encuentras un ingrediente olvidado en la despensa. ¿Qué haces?|Busco una forma interesante de usarlo|Lo incluyo en un plan para otro día|Lo uso si encaja con lo que ya quería preparar|Cierro la despensa. Hoy no',
  'yl-s3q8': 'Tienes tiempo para tomar una ruta algo distinta. ¿Qué haces?|Exploro para ver qué descubro|Disfruto de un pequeño cambio de paisaje|Sigo la ruta que mejor encaja con mi día|Voy con prisa de todos modos, por si acaso',
  'yl-s3q9': 'Suena música mientras haces una tarea pequeña. ¿Qué haces?|Aprovecho para bailar un poco|Dejo que marque un ritmo agradable|Termino rápido para poder descansar|Me distraigo y empiezo otra cosa',
  'yl-s3q10': 'Tienes un momento libre entre dos tareas. ¿Qué te sale hacer?|Cambio de postura y hago una pequeña pausa|Lo que me resulte más cómodo en ese momento|Busco una razón para ir a un lugar nuevo|Me quedo donde estoy. Empezar algo cuesta',
  'yl-s4q8': 'Por la noche, tu cabeza empieza a repasar el día. ¿Qué haces?|Anoto una idea y la dejo ahí|Me distraigo con una historia conocida|Sigo pensando hasta llegar a los problemas de mañana|Empiezo a planear una aventura completamente nueva',
  'yl-s4q9': 'Por fin hay silencio en casa. ¿Qué buscas?|Un momento de paz sin nada que hacer|Mi rutina habitual para relajarme|Un episodio o una canción más|Lo que me ayude a sentir tranquilidad',
  'yl-s4q10': 'Puedes quitar una cosa de tus noches. Elige.|La presión de seguir haciendo cosas útiles|Ese rato con el teléfono que nunca planeé|Los planes que me dejan sin tiempo de tranquilidad|Cualquier cosa que complique el día de mañana',
  'yl-s5q8': 'Una respuesta importante tarda más de lo esperado. ¿Qué haces?|Sigo con algo que sí puedo controlar|Vuelvo a mirar. Y luego otra vez|Me distraigo con algo que disfruto|Abandono ese plan y busco otro',
  'yl-s5q9': 'Alguien se ofrece a compartir una tarea difícil. ¿Cuál es tu primera reacción?|Sí. Hagámosla más fácil entre los dos|Acordamos qué parte hará cada uno|Digo que sí, pero termino haciendo casi todo|Siento alivio. Necesitaba que alguien me ayudara',
  'yl-s5q10': 'Una semana intensa está por terminar. ¿Qué pequeño cierre prefieres?|Dejar algo útil preparado para la próxima semana|Dejar todo y disfrutar el momento|Encontrar un motivo para celebrar a lo grande|Por fin permitirme parar',
  'yl-s6q8': 'Un amigo quiere organizar una celebración para ti. ¿Qué eliges?|Algo sencillo con las personas que quiero|Un pequeño gusto tranquilo con alguien cercano|Una experiencia que nunca hayamos probado|Una reunión que se convierta en todo un fin de semana',
  'yl-s6q9': 'Recuerdas un pequeño detalle que te contó un amigo. ¿Qué haces?|Le pregunto por eso la próxima vez que hablemos|Lo guardo como idea para una sorpresa especial|Le mando un mensaje en cuanto lo recuerdo|Pienso mencionarlo, pero el día a día se interpone',
  'yl-s6q10': 'Dos personas que aprecias proponen planes muy distintos. ¿Qué haces?|Explico qué me viene bien esta vez|Elijo el plan con la mejor sorpresa|Intento encontrar la forma de hacer los dos|Elijo el que me parezca más relajado',
  'yl-s7q8': 'Siempre olvidas una pequeña tarea cotidiana. ¿Qué solución eliges?|La uno a algo que ya hago|Pongo un recordatorio imposible de ignorar|La convierto en un juego o un pequeño reto|Sigo prometiendo que la próxima vez me acordaré',
  'yl-s7q9': 'Tu teléfono necesita cargarse y tú necesitas una pausa. ¿Qué haces?|Dejo que ambos recuperemos energía un rato|Aprovecho la pausa para hacer algo sencillo|Busco otra pantalla sin pensarlo|Disfruto de que nadie pueda localizarme por un rato',
  'yl-s7q10': 'Una rutina de antes ya no encaja con tu vida. ¿Qué haces?|Creo una versión más sencilla que sí pueda mantener|Pruebo un enfoque totalmente distinto|Conservo las partes que todavía disfruto|No sé muy bien por dónde volver a empezar',
  'yl-s8q8': 'Una afición parece un poco ridícula, pero muy divertida. ¿Qué haces?|La pruebo. Hacerlo bien no es lo importante|Me lanzo y llevo a alguien conmigo|Primero observo y después decido|Prefiero las cosas que ya sé que me gustan',
  'yl-s8q9': 'Puedes crear algo solo para ti. Elige.|Una lista de canciones que me haga sentir como quiero|Un rincón acogedor que sienta mío|Un pequeño proyecto que pueda desarrollar poco a poco|Algo extraño sin una finalidad evidente',
  'yl-s8q10': 'Alguien te pregunta qué haces solo por diversión. ¿Qué respondes?|Tengo una actividad favorita que mencionar enseguida|Menciono unas cuantas cosas sencillas|Me doy cuenta de que mis aficiones se han vuelto tareas|Creo que necesito volver a encontrar esa respuesta',
  'yl-s9q8': 'Tu versión del futuro recibe un regalo sorpresa. ¿Qué contiene?|Una habilidad que seguí practicando|Recuerdos de algo inesperado|Más tiempo para las personas y los pequeños placeres|Un recordatorio de que divertirse sigue siendo importante',
  'yl-s9q9': 'Puedes elegir un tema para el próximo mes. ¿Cuál será?|Hacer más fáciles las cosas sencillas|Probar algo que despierte mi curiosidad|Proteger un poco de comodidad y tranquilidad|Encontrar mi equilibrio antes de añadir más planes',
  'yl-s9q10': 'Un plan parece impresionante, pero no deja espacio para disfrutar la vida. ¿Qué haces?|Lo rediseño en torno a lo que me importa|Mantengo una meta y dejo espacio para otras cosas|Sigo adelante. Ya me comprometí|Lo cambio por un camino menos predecible',
  'yl-s10q8': 'Tu reloj tiene una función secreta. ¿Qué hace?|Me ayuda a apreciar los momentos cotidianos|Me permite seguir a un ritmo que puedo mantener|Reserva algo de energía para los planes inesperados|Me avisa cuando necesito empezar de nuevo',
  'yl-s10q9': 'Elige el pequeño lujo al que no quieres renunciar.|Un momento sin prisas ni exigencias|Tiempo para disfrutar algo sin tener que ganármelo|Una noche espontánea que termine en una buena historia|Una tarea menos en un día lleno de cosas',
  'yl-s10q10': 'Tu próxima etapa necesita un lema. ¿Cuál encaja?|Conservar el entusiasmo y dejar las prisas innecesarias|Los pasos pequeños también hacen avanzar la historia|Dejar espacio para una buena sorpresa|Un nuevo comienzo también puede ser tranquilo',
  // Reviewed refinements to the existing 70-question Spanish authoring source.
  'yl-s2q6': 'Cuando compras alimentos, ¿cómo te organizas?|Llevo una lista y tengo pensadas las comidas habituales|Me gusta descubrir un ingrediente nuevo|Voy con prisa y compro lo esencial|Acabo volviendo por algo que olvidé',
  'yl-s3q3': 'Llevas un rato sin levantarte. ¿Qué te hace moverte?|Las pausas que incluyo en mi día|Que alguien proponga algo divertido|Notar que necesito cambiar de postura|Normalmente, solo me levanto cuando hace falta',
  'yl-s4q6': 'Surge una oportunidad de descansar. ¿Puedes aprovecharla?|Claro. Sé cómo ponerme a gusto|Solo cuando haya terminado todo|Sí, procuro hacerle espacio|Lo intento, pero mi cabeza no para',
  'yl-s6q1': 'Llega una invitación de última hora. ¿Qué decide tu respuesta?|Quién va y cómo me siento|La posibilidad de vivir una buena historia|Si ya me puse las zapatillas de estar en casa|Nada. Ya estoy diciendo que sí.',
  'yl-s8q1': 'Un martes cualquiera necesita algo de emoción. ¿Qué eliges?|Una pequeña aventura de camino a casa|Mi comida favorita y una película conocida|Una llamada espontánea que termina en un plan|Un pequeño gusto sin reorganizar todo el día',
  'yl-s9q1': 'Tu versión de mañana te deja una nota. ¿Qué dice?|Gracias por dejar eso preparado esta noche|Tenemos que hablar de tu hora de dormir|No me dejes todas las tareas difíciles|Sigue reservando un poco de margen',
  'yl-s10q1': 'Tu vida se convierte en película. ¿Qué título encaja?|Una cosa más antes de descansar|El camino de los descubrimientos|El arte de una noche tranquila|Pequeños pasos, buena vida',
});
