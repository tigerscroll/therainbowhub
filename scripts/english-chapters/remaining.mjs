import {healthQuizzes} from './remaining-health.mjs';
import {flightQuizzes} from './remaining-flight.mjs';
import {socialQuizzes} from './remaining-social.mjs';
import {transportQuizzes} from './remaining-transport.mjs';
import {cultureQuizzes} from './remaining-culture.mjs';
export default {...healthQuizzes, ...flightQuizzes, ...socialQuizzes, ...transportQuizzes, ...cultureQuizzes};
