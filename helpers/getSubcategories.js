const { CATEGORIES_WITH_SUBCATEGORIES } = require('./constants');

const getSubcategories = ({ category }, options, requestWithDefaults, callback, Logger) =>
  callback(null, { possibleSubcategories: CATEGORIES_WITH_SUBCATEGORIES[category] });

module.exports = getSubcategories;