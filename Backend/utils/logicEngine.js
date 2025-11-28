const evaluateCondition = (condition, userAnswer) => {
  const { operator, value } = condition;


  if (userAnswer === undefined || userAnswer === null) {
    if (operator === 'notEquals') return true;
    return false;
  }

  const strAnswer = String(userAnswer);
  const strValue = String(value);

  switch (operator) {
    case 'equals':
      return strAnswer === strValue;

    case 'notEquals':
      return strAnswer !== strValue;

    case 'contains':
      if (Array.isArray(userAnswer)) {
        return userAnswer.some(item => String(item) === strValue);
      }
      if (typeof userAnswer === 'string') {
        return userAnswer.includes(strValue);
      }
      return false;

    default:
      return false;
  }
};

const shouldShowQuestion = (rules, answersSoFar) => {
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    return true;
  }

  const { logic, conditions } = rules;


  const results = conditions.map(condition => {

    const relevantAnswer = answersSoFar[condition.questionKey];
    return evaluateCondition(condition, relevantAnswer);
  });

  if (logic === 'OR') {
    return results.some(result => result === true);
  } else {
    return results.every(result => result === true);
  }
};

module.exports = { shouldShowQuestion };