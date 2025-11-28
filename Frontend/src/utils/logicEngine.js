export const shouldShowQuestion = (rules, answersSoFar) => {
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    return true;
  }

  const { logic, conditions } = rules;

  const results = conditions.map(condition => {
    const relevantAnswer = answersSoFar[condition.questionKey];
    const { operator, value } = condition;

    if (relevantAnswer === undefined || relevantAnswer === null) return false;

    const strAnswer = String(relevantAnswer);
    const strValue = String(value);

    switch (operator) {
      case 'equals': return strAnswer === strValue;
      case 'notEquals': return strAnswer !== strValue;
      case 'contains': return strAnswer.includes(strValue);
      default: return false;
    }
  });

  if (logic === 'OR') {
    return results.some(r => r === true);
  }
  return results.every(r => r === true);
};