
const {
  POSSIBLE_BUSINESS_IMPACTS,
  CATEGORIES_WITH_SUBCATEGORIES,
  INCIDENT_STATE_OPTIONS
} = require('./constants');

const getDropdownOptions = ([parsedResults]) => ({
  possibleStates:
    INCIDENT_STATE_OPTIONS[
      parsedResults && parsedResults.state && parsedResults.state.value
    ] || [],
  possibleBusinessImpacts: POSSIBLE_BUSINESS_IMPACTS,
  possibleCategories: Object.keys(CATEGORIES_WITH_SUBCATEGORIES).filter((i) => i),
  possibleSubcategories:
    CATEGORIES_WITH_SUBCATEGORIES[
      parsedResults && parsedResults.category && parsedResults.category.value
    ] || []
});


module.exports = getDropdownOptions;