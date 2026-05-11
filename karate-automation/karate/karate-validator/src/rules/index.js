const RULE = require("./syntax/run");

const ALL_RULES = [
  RULE
];

function getActiveRules(config = {}) {
  const disabled = (config.rules && config.rules.disable) || [];
  return ALL_RULES.filter(rule => !disabled.includes(rule.id));
}

module.exports = { ALL_RULES, getActiveRules };
