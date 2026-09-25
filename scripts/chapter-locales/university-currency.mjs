const units = {fr:'unités monétaires',de:'Geldeinheiten',it:'unità monetarie',nl:'geldeenheden',es:'unidades monetarias',pt:'unidades monetárias'};
export function correctUniversityCurrency(slug, locale, value, original) {
  if (!['harvard','oxford','cambridge'].includes(slug) || !units[locale] || !/\bcredits?\b/i.test(original ?? '')) return value;
  const cheaper = original.match(/^Plan ([AB]), by (\d+) credits$/);
  if (cheaper) {
    const [,plan,amount] = cheaper;
    return {
      fr:`Le plan ${plan} coûte ${amount} unités monétaires de moins`,
      de:`Plan ${plan} ist ${amount} Geldeinheiten günstiger`,
      it:`Il piano ${plan} costa ${amount} unità monetarie in meno`,
      nl:`Plan ${plan} is ${amount} geldeenheden goedkoper`,
      es:`El plan ${plan} cuesta ${amount} unidades monetarias menos`,
      pt:`O plano ${plan} custa menos ${amount} unidades monetárias`,
    }[locale];
  }
  return value.replace(/\b(?:credits?|crédits?|crediti|créditos?|studiepunten)\b/gi, units[locale]);
}
