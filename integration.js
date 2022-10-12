const async = require('async');
const request = require('postman-request');
const config = require('./config/config');
const fs = require('fs');
const incidentLayout = require('./models/incident-layout');
const taskLayout = require('./models/task-layout');
const userLayout = require('./models/user-layout');
const updateTicket = require('./helpers/updateTicket');
const getSubcategories = require('./helpers/getSubcategories');
const getServiceNowObjectType = require('./helpers/getServiceNowObjectType');
const getDropdownOptions = require('./helpers/getDropdownOptions');
const parseResults = require('./helpers/parseResults');

let requestWithDefaults;
let Logger;

const layoutMap = {
  incident: incidentLayout,
  task: taskLayout,
  sys_user: userLayout
};

function doLookup(entities, options, cb) {
  Logger.trace({ options: options });
  const lookupResults = [];
  async.each(
    entities,
    (entityObj, nextEntity) => {
      queryIncidents(entityObj, options, lookupResults, nextEntity, cb);
    },
    (err) => {
      Logger.trace(
        { lookupResults: lookupResults },
        'Checking the final payload coming through'
      );
      cb(err, lookupResults);
    }
  );
}

function queryIncidents(
  entityObj,
  options,
  lookupResults,
  nextEntity,
  cb,
  priorQueryResult
) {
  const queryObj = getQueries(entityObj, options);
  if (queryObj.error) {
    return nextEntity({
      detail: queryObj.error
    });
  }

  if (queryObj.query && queryObj.table) {
    let requestOptions = {
      uri: `${options.url}/api/now/table/${queryObj.table}`,
      ...(options.apiKey
        ? { headers: { Authorization: `key ${options.apiKey}` } }
        : {
            auth: {
              username: options.username,
              password: options.password
            }
          }),
      qs: {
        sysparm_query: queryObj.query,
        sysparm_display_value: true,
        sysparm_limit: 10
      },
      json: true
    };

    Logger.trace({ requestOptions: requestOptions }, 'Checking out request');

    requestWithDefaults(requestOptions, (err, resp, body) => {
      if (err) {
        Logger.error(
          {
            err
          },
          'Network error while querying incidents'
        );

        return cb({
          detail: 'Network error while querying incidents',
          err
        });
      }

      if (resp && resp.statusCode !== 200) {
        Logger.error(
          {
            body,
            statusCode: resp.statusCode
          },
          'API error while looking querying incidents'
        );

        return cb({
          detail: `Unexpected status code ${resp.statusCode} received`,
          body
        });
      }

      const queryResult = body.result || [];

      if (queryResult.length === 0 && !priorQueryResult) {
        lookupResults.push({
          entity: entityObj,
          data: null
        });
        return nextEntity(null);
      } else if (queryResult.length === 0 && priorQueryResult) {
        lookupResults.push({
          entity: entityObj,
          data: priorQueryResult
        });
        return nextEntity(null);
      } else {
        Logger.trace({ body: body }, 'Passing through all others lookup');
        const serviceNowObjectType = getServiceNowObjectType(entityObj);

        parseResults(
          serviceNowObjectType,
          queryResult,
          false,
          options,
          requestWithDefaults,
          Logger,
          (err, parsedResults) => {
            if (err) return nextEntity(err);
            const dropdownOptions = getDropdownOptions(parsedResults);

            if (priorQueryResult) {
              lookupResults.push({
                entity: entityObj,
                data: {
                  summary: getSummaryTags(entityObj, queryResult).concat(
                    priorQueryResult.summary
                  ),
                  details: {
                    ...priorQueryResult.details,
                    serviceNowObjectType: serviceNowObjectType,
                    layout: layoutMap[serviceNowObjectType],
                    results: parsedResults,
                    isIncident: entityObj.types.indexOf('custom.incident') > -1,
                    ...dropdownOptions
                  }
                }
              });
            } else {
              lookupResults.push({
                entity: entityObj,
                data: {
                  summary: getSummaryTags(entityObj, body.result),
                  details: {
                    serviceNowObjectType: serviceNowObjectType,
                    layout: layoutMap[serviceNowObjectType],
                    results: parsedResults,
                    isIncident: entityObj.types.indexOf('custom.incident') > -1,
                    ...dropdownOptions
                  }
                }
              });
            }
            nextEntity(null);
          }
        );
      }
    });
  } else if (priorQueryResult) {
    lookupResults.push({
      entity: entityObj,
      data: {
        summary: priorQueryResult.summary,
        details: priorQueryResult.details
      }
    });
    nextEntity(null);
  }
}

function getSummaryTags(entityObj, results) {
  let summaryProperties;

  if (entityObj.types.indexOf('custom.incident') > -1) {
    summaryProperties = ['category', 'phase'];
  } else if (entityObj.types.indexOf('custom.task') > -1) {
    summaryProperties = ['category', 'phase', 'priority'];
  } else {
    summaryProperties = ['finding'];
  }

  return results.reduce((acc, result) => {
    summaryProperties.forEach((prop) => {
      if (typeof result[prop] !== 'undefined') {
        const tag = result[prop];
        acc.push(prop === 'priority' ? `Priority: ${tag}` : tag);
      }
    });

    if (typeof result.active !== 'undefined') {
      acc.push(result.active === 'true' ? 'active' : 'inactive');
    }

    return acc;
  }, []);
}

function getQueries(entityObj, options) {
  let result = {
    table: '',
    query: '',
    error: null
  };

  if (entityObj.types.indexOf('custom.incident') > -1) {
    result.table = 'sn_si_incident';
    result.query = `number=${entityObj.value}`;
  } else if (entityObj.types.indexOf('custom.task') > -1) {
    result.table = 'sn_si_task';
    result.query = `number=${entityObj.value}`;
  } else {
    result.table = 'sn_ti_observable';
    result.query = `value=${entityObj.value}`;
  }

  return result;
}

function onDetails(lookupObject, options, cb) {
  parseResults(
    lookupObject.data.details.serviceNowObjectType,
    lookupObject.data.details.results,
    true,
    options,
    requestWithDefaults,
    Logger,
    (err, parsedResults) => {
      if (err) {
        return cb(err, lookupObject.data);
      } else {
        Logger.debug({ results: lookupObject }, 'onDetails');
        cb(null, lookupObject.data);
      }
    }
  );
}

function startup(logger) {
  Logger = logger;
  const requestOptions = {
    json: true
  };

  if (typeof config.request.cert === 'string' && config.request.cert.length > 0) {
    requestOptions.cert = fs.readFileSync(config.request.cert);
  }

  if (typeof config.request.key === 'string' && config.request.key.length > 0) {
    requestOptions.key = fs.readFileSync(config.request.key);
  }

  if (
    typeof config.request.passphrase === 'string' &&
    config.request.passphrase.length > 0
  ) {
    requestOptions.passphrase = config.request.passphrase;
  }

  if (typeof config.request.ca === 'string' && config.request.ca.length > 0) {
    requestOptions.ca = fs.readFileSync(config.request.ca);
  }

  if (typeof config.request.proxy === 'string' && config.request.proxy.length > 0) {
    requestOptions.proxy = config.request.proxy;
  }

  if (typeof config.request.rejectUnauthorized === 'boolean') {
    requestOptions.rejectUnauthorized = config.request.rejectUnauthorized;
  }

  requestWithDefaults = request.defaults(requestOptions);
}

function validateOption(errors, options, optionName, errMessage) {
  if (
    typeof options[optionName].value !== 'string' ||
    (typeof options[optionName].value === 'string' &&
      options[optionName].value.length === 0)
  ) {
    errors.push({
      key: optionName,
      message: errMessage
    });
  }
}

function validateOptions(options, callback) {
  let errors = [];

  validateOption(errors, options, 'url', 'You must provide a valid URL.');
  if (!(options.username.value || options.password.value)) {
    validateOption(
      errors,
      options,
      'apiKey',
      !(options.username.value || options.password.value || options.apiKey.value)
        ? 'You must provide a valid Username and Password in the above fields, or an API Key here.'
        : 'You must provide a valid API Key.'
    );
  } else {
    validateOption(errors, options, 'username', 'You must provide a valid username.');
    validateOption(errors, options, 'password', 'You must provide a valid password.');
  }

  callback(null, errors);
}

const getOnMessage = { updateTicket, getSubcategories };

const onMessage = ({ action, data: actionParams }, options, callback) =>
  getOnMessage[action](actionParams, options, requestWithDefaults, callback, Logger);

module.exports = {
  doLookup,
  startup,
  validateOptions,
  onDetails,
  onMessage
};
