const getServiceNowObjectType = require('./getServiceNowObjectType');
const getDropdownOptions = require('./getDropdownOptions');
const parseResults = require('./parseResults');

const {
  INCIDENT_STATE_CODES,
  INCIDENT_IMPACT_CODES,
  INCIDENT_PRIORITY_CODES,
  INCIDENT_SEVERITY_CODES
} = require('./constants');

const updateTicket = (
  {
    entity,
    sysId,
    description,
    workNotes,
    state,
    businessImpact,
    category,
    subcategory,
    work_notes
  },
  options,
  requestWithDefaults,
  callback,
  Logger
) => {
  const requestOptions = {
    url: `${options.url}/api/now/table/sn_si_incident/${sysId}`,
    method: 'PATCH',
    auth: {
      username: options.username,
      password: options.password
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: {
      description,
      work_notes: workNotes,

      state: INCIDENT_STATE_CODES[state],

      business_criticality: INCIDENT_IMPACT_CODES[businessImpact],

      category,
      subcategory
    }
  };

  requestWithDefaults(requestOptions, (err, response, body) => {
    if (err) {
      return callback({
        errors: [
          {
            err,
            detail: 'HTTP Request Error when retrieving details'
          }
        ]
      });
    }

    if (response.statusCode !== 200) {
      return callback({
        errors: [
          {
            detail: body.error
              ? `Unexpected Status Code Received: ${body.error.message} - ${body.error.detail}`
              : 'Unexpected Status Code Received'
          }
        ]
      });
    }

    const serviceNowObjectType = getServiceNowObjectType(entity);

    parseResults(
      serviceNowObjectType,
      [body.result],
      true,
      options,
      requestWithDefaults,
      Logger,
      (err, [parsedResult]) => {
        if (err)
          return callback({
            errors: [{ err, detail: err.message }]
          });
        const stateTextValue = Object.entries(INCIDENT_STATE_CODES).find(
          ([textValue, code]) => code === (parsedResult.state && parsedResult.state.value)
        );

        const results = [
          {
            ...parsedResult,
            subcategory: { ...parsedResult.subcategory, value: subcategory },
            work_notes: {
              ...parsedResult.work_notes,
              value: [`Just Now - (Work notes) ${workNotes}`, ...work_notes]
            },
            business_criticality: {
              ...parsedResult.business_criticality,
              value: businessImpact
            },
            state: {
              ...parsedResult.state,
              value: stateTextValue ? stateTextValue[0] : 'Unknown'
            },
            priority: {
              ...parsedResult.priority,
              value:
                INCIDENT_PRIORITY_CODES[
                  parsedResult.priority && parsedResult.priority.value
                ] || '-- None --'
            },
            severity: {
              ...parsedResult.severity,
              value:
                INCIDENT_SEVERITY_CODES[
                  parsedResult.severity && parsedResult.severity.value
                ] || '-- None --'
            }
          }
        ];

        const dropdownOptions = getDropdownOptions(results);

        Logger.trace({
          test: 9898989898989,
          requestOptions,
          state,
          results,
          dropdownOptions
        });
        callback(null, {
          results,
          ...dropdownOptions
        });
      }
    );
  });
};

module.exports = updateTicket;
