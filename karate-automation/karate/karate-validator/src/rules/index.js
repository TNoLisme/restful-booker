const KRTV_S001 = require("./syntax/KRTV-S001");
const KRTV_S002 = require("./syntax/KRTV-S002");
const KRTV_S003 = require("./syntax/KRTV-S003");
const KRTV_S004 = require("./syntax/KRTV-S004");
const KRTV_S005 = require("./syntax/KRTV-S005");
const KRTV_S006 = require("./syntax/KRTV-S006");
const KRTV_S007 = require("./syntax/KRTV-S007");

const ALL_RULES = [
  KRTV_S001,
  KRTV_S002,
  KRTV_S003,
  KRTV_S004,
  KRTV_S005,
  KRTV_S006,
  KRTV_S007,
];

function getActiveRules(config = {}) {
  const disabled = (config.rules && config.rules.disable) || [];
  return ALL_RULES.filter(rule => !disabled.includes(rule.id));
}

module.exports = { ALL_RULES, getActiveRules };
