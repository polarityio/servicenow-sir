const async = require('async');
const request = require('postman-request');
const config = require('./config/config');
const fs = require('fs');
const incidentLayout = require('./models/incident-layout');
const incidentModel = require('./models/incident-model');
const taskLayout = require('./models/task-layout');
const userLayout = require('./models/user-layout');
const observableLayout = require('./models/observable-layout');
const observableModel = require('./models/observable-model');
const updateTicket = require('./helpers/updateTicket');
const getSubcategories = require('./helpers/getSubcategories');
const getServiceNowObjectType = require('./helpers/getServiceNowObjectType');
const getDropdownOptions = require('./helpers/getDropdownOptions');
const parseResults = require('./helpers/parseResults');
const { setLogger } = require('./helpers/logger');

const MAX_CONCURRENT_ENTITY_LOOKUPS = 5;

let requestWithDefaults;
let Logger;

const layoutMap = {
  incident: incidentLayout,
  observable: observableLayout,
  task: taskLayout,
  sys_user: userLayout
};

function startup(logger) {
  Logger = logger;

  setLogger(logger);

  const requestOptions = {
    json: true
  };

  requestWithDefaults = request.defaults(requestOptions);
}

function doLookup(entities, options, cb) {
  Logger.trace({ options: options });
  let lookupResults = [];
  async.eachLimit(
    entities,
    MAX_CONCURRENT_ENTITY_LOOKUPS,
    (entityObj, done) => {
      if (entityObj.type === 'custom') {
        lookupById(entityObj, options, (err, result) => {
          lookupResults.push(result);
          done();
        });
      } else {
        queryIncidentTable(entityObj, options, (err, incidentResults) => {
          if (err) {
            return done(err);
          }
          queryObservablesTable(entityObj, options, (err, observableResults) => {
            if (err) {
              return done(err);
            }

            Logger.trace(
              { incidentResults, observableResults },
              'Search results for incidents'
            );

            // need to dedupe results here and then create our result objects
            createLookupResults(
              entityObj,
              incidentResults,
              observableResults,
              options,
              (error, entityLookupResults) => {
                if (error) {
                  return done(error);
                }
                lookupResults = lookupResults.concat(entityLookupResults);
                done();
              }
            );
          });
        });
      }
    },
    (err) => {
      if (err) {
        Logger.error({ err }, 'Error in doLookup');
        cb(err);
      } else {
        Logger.trace({ lookupResults: lookupResults }, 'doLookup Results');
        cb(null, lookupResults);
      }
    }
  );
}

/**
 * Takes the raw lookup results from our incident table search and observable table search and
 * combines the results into lookup result object.
 *
 * @param entityObj
 * @param incidentResults
 * @param observableResults array of incidents which also include an `observable` object on them which is the
 * observable that is related to the incident and matched the entity searched on.
 *
 */
function createLookupResults(entity, incidentResults, observableResults, options, cb) {
  const allResults = incidentResults.concat(observableResults);
  // allResults could have duplicate incidents so we dedupe by sysid
  const uniqueResults = allResults.reduce((acc, result) => {
    const sysId = result.sys_id;
    if (!acc.some((item) => item.sys_id === sysId)) {
      acc.push(result);
    }
    return acc;
  }, []);

  if (uniqueResults.length === 0) {
    cb(null, [
      {
        entity,
        data: null
      }
    ]);
  } else {
    const serviceNowObjectType = getServiceNowObjectType(entity);

    parseResults(
      serviceNowObjectType,
      uniqueResults,
      false,
      options,
      requestWithDefaults,
      (err, parsedResults) => {
        if (err) {
          return cb(err);
        }

        const dropdownOptions = getDropdownOptions(parsedResults);

        cb(null, {
          entity,
          data: {
            summary: getSummaryTags(entity, uniqueResults),
            details: {
              serviceNowObjectType,
              layout: layoutMap[serviceNowObjectType],
              observableLayout: layoutMap.observable,
              results: parsedResults,
              isIncident: true,
              ...dropdownOptions
            }
          }
        });
      }
    );
  }
}

function lookupById(entityObj, options, cb) {
  let table;
  let query;

  if (entityObj.types.indexOf('custom.incident') > -1) {
    table = 'sn_si_incident';
    query = `number=${entityObj.value}`;
  } else if (entityObj.types.indexOf('custom.task') > -1) {
    table = 'sn_si_task';
    query = `number=${entityObj.value}`;
  }

  let requestOptions = {
    uri: `${options.url}/api/now/table/${table}`,
    ...(options.apiKey
      ? { headers: { [options.apiKeyHeader]: options.apiKey } }
      : {
          auth: {
            username: options.username,
            password: options.password
          }
        }),
    qs: {
      sysparm_query: query,
      sysparm_display_value: true,
      sysparm_limit: 10
    },
    json: true
  };

  Logger.trace({ requestOptions }, 'Lookup Incident/Task by ID Request options');

  requestWithDefaults(requestOptions, (err, resp, body) => {
    if (err) {
      Logger.error({ err }, 'Network error while looking up incident or task by id');

      return cb({
        detail: 'Network error while looking up incident or task by id',
        err
      });
    }

    if (resp && resp.statusCode !== 200) {
      Logger.error(
        { body, statusCode: resp.statusCode },
        'API error while looking up incident or task by id'
      );

      return cb({
        detail: `Unexpected status code ${resp.statusCode} received when looking up incident or task by id`,
        body
      });
    }

    Logger.trace({ body }, 'Raw Incident/Task Lookup Result');

    const queryResult = body.result || [];

    if (queryResult.length === 0) {
      return cb(null, {
        entity: entityObj,
        data: null
      });
    } else {
      const serviceNowObjectType = getServiceNowObjectType(entityObj);

      parseResults(
        serviceNowObjectType,
        queryResult,
        false,
        options,
        requestWithDefaults,
        (err, parsedResults) => {
          if (err) {
            return cb(err);
          }

          const dropdownOptions = getDropdownOptions(parsedResults);

          cb(null, {
            entity: entityObj,
            data: {
              summary: getSummaryTags(entityObj, body.result),
              details: {
                serviceNowObjectType,
                layout: layoutMap[serviceNowObjectType],
                results: parsedResults,
                isIncident: entityObj.types.indexOf('custom.incident') > -1,
                ...dropdownOptions
              }
            }
          });
        }
      );
    }
  });
}

function queryIncidentTable(entityObj, options, cb) {
  let requestOptions = {
    uri: `${options.url}/api/now/table/sn_si_incident`,
    ...(options.apiKey
      ? { headers: { [options.apiKeyHeader]: options.apiKey } }
      : {
          auth: {
            username: options.username,
            password: options.password
          }
        }),
    qs: {
      sysparm_query: `short_descriptionCONTAINS${entityObj.value}^ORdescriptionCONTAINS${entityObj.value}`,
      sysparm_display_value: true,
      sysparm_limit: 10
    },
    json: true
  };

  Logger.trace(
    { requestOptions: requestOptions },
    'Query incident table request options'
  );

  requestWithDefaults(requestOptions, (err, resp, body) => {
    if (err) {
      Logger.error({ err }, 'Network error while querying incidents');

      return cb({
        detail: 'Network error while querying incidents',
        err
      });
    }

    if (resp && resp.statusCode !== 200) {
      Logger.error(
        { body, statusCode: resp.statusCode },
        'API error while looking querying incidents'
      );

      return cb({
        detail: `Unexpected status code ${resp.statusCode} received`,
        body
      });
    }

    const queryResult = body.result || [];

    cb(null, queryResult);
  });
}

/**
 * We query the sn_ti_m2m_task_observable to search observables because this table is a pivot table which gives
 * us access to both the observable information as well as the parent task (incident) that the observable is related
 * to.
 *
 * @param entityObj
 * @param options
 * @param cb
 */
function queryObservablesTable(entityObj, options, cb) {
  let returnFields = [
    'observable.value',
    'observable.finding',
    'observable.type.value',
    'observable.sighting_count',
    'observable.notes',
    'observable.sys_created_on',
    'observable.sys_created_by',
    'observables.finding_expiry_time'
  ];

  // Add all fields from our incident model to ensure they are also returned
  returnFields = returnFields.concat(
    Object.keys(incidentModel).map((key) => `task.${key}`)
  );

  let requestOptions = {
    uri: `${options.url}/api/now/table/sn_ti_m2m_task_observable`,
    ...(options.apiKey
      ? { headers: { [options.apiKeyHeader]: options.apiKey } }
      : {
          auth: {
            username: options.username,
            password: options.password
          }
        }),
    qs: {
      sysparm_query: `observable.value=${entityObj.value}`,
      sysparm_display_value: true,
      sysparm_limit: 10,
      sysparm_fields: returnFields.join(',')
    },
    json: true
  };

  Logger.trace(
    { requestOptions: requestOptions },
    'Query observable table request options'
  );

  requestWithDefaults(requestOptions, (err, resp, body) => {
    if (err) {
      Logger.error({ err }, 'Network error while querying incidents');

      return cb({
        detail: 'Network error while querying incidents',
        err
      });
    }

    if (resp && resp.statusCode !== 200) {
      Logger.error(
        { body, statusCode: resp.statusCode },
        'API error while looking querying incidents'
      );

      return cb({
        detail: `Unexpected status code ${resp.statusCode} received`,
        body
      });
    }

    const queryResult = body.result || [];

    // For each result, we want to rename the fields to remove the leading `task.` string.  We also
    // take all the observable fields and put them into an observable object.
    queryResult.forEach((result) => {
      let observable = {};
      returnFields.forEach((field) => {
        // Any fields that starts with `task.` should be renamed to just the portion
        // after `task.`.  For example, `task.description` would becomes `description`.
        // Note that `task` is an incident here.
        if (field.startsWith('task.')) {
          const newField = field.replace('task.', '');
          result[newField] = result[field];
          delete result[field];
        } else if (field.startsWith('observable.')) {
          // any fields that start with observable should be placed on a new observable object
          const newField = field.replace('observable.', '');
          observable[newField] = result[field];
          delete result[field];
        }
      });
      result.observable = observable;
    });

    cb(null, queryResult);
  });
}

function getObservables(incidentId, options, cb) {
  // Add all fields from our incident model to ensure they are also returned
  let returnFields = Object.keys(observableModel).map((key) => {
    // We need to replace the `+` with a `.` so that the key will match how
    // ServiceNow references nested values. We use `+` in our config because the
    // Ember `get` helper doesn't work if a key value has a `.` in it.
    return `observable.${key.replace('+', '.')}`;
  });

  let requestOptions = {
    uri: `${options.url}/api/now/table/sn_ti_m2m_task_observable`,
    ...(options.apiKey
      ? { headers: { [options.apiKeyHeader]: options.apiKey } }
      : {
          auth: {
            username: options.username,
            password: options.password
          }
        }),
    qs: {
      sysparm_query: `task.sys_id=${incidentId}`,
      sysparm_display_value: true,
      sysparm_limit: 10,
      sysparm_fields: returnFields.join(',')
    },
    json: true
  };

  Logger.trace({ requestOptions: requestOptions }, 'Get observables request options');

  requestWithDefaults(requestOptions, (err, resp, body) => {
    if (err) {
      Logger.error({ err }, 'Network error while getting observables');

      return cb({
        detail: 'Network error while getting observables',
        err
      });
    }

    if (resp && resp.statusCode !== 200) {
      Logger.error(
        { body, statusCode: resp.statusCode },
        'API error while looking getting observables'
      );

      return cb({
        detail: `Unexpected status code ${resp.statusCode} received`,
        body
      });
    }

    const queryResult = body.result || [];

    // For each result, we want to rename the fields to remove the leading `task.` string.  We also
    // take all the observable fields and put them into an observable object.
    queryResult.forEach((result) => {
      returnFields.forEach((field) => {
        // Any fields that starts with `observable.` should be renamed to just the portion
        // after `task.`.  For example, `observable.note` becomes `note`.
        if (field.startsWith('observable.')) {
          let newField = field.replace('observable.', '');
          newField = newField.replace('.', '+');
          result[newField] = result[field];
          delete result[field];
        }
      });
    });

    Logger.trace({ queryResult }, 'Get Observables raw result');

    parseResults(
      'observable',
      queryResult,
      false,
      options,
      requestWithDefaults,
      (err, parsedResults) => {
        if (err) {
          return cb(err);
        }

        cb(null, parsedResults);
      }
    );
  });
}

function getSummaryTags(entityObj, results) {
  const tags = [];

  if (results.length > 1) {
    tags.push(`${results.length} incidents`);
    const numObservables = results.reduce((acc, result) => {
      if (result.observable) {
        acc++;
      }
      return acc;
    }, 0);
    if (numObservables > 0) {
      tags.push(`${numObservables} observable${numObservables > 1 ? 's' : ''}`);
    }
  } else {
    let result = results[0];
    if (entityObj.type !== 'custom') {
      // no need for the ticket number since this is custom
      tags.push(result.number);
    }

    let status = '';

    if (typeof result.active === 'string') {
      status = result.active === 'true' ? 'Active' : 'Inactive';
    }

    if (typeof result.state === 'string') {
      if (status.length > 0) {
        status += ` (${result.state})`;
      } else {
        status += result.state;
      }
    }

    if (status.length > 0) {
      tags.push(status);
    }

    if (typeof result.priority === 'string') {
      tags.push(`Priority: ${result.priority}`);
    }

    if (tags.length === 0) {
      tags.push(`1 incident`);
    }
  }

  return tags;
}

function onDetails(lookupObject, options, cb) {
  parseResults(
    lookupObject.data.details.serviceNowObjectType,
    lookupObject.data.details.results,
    true,
    options,
    requestWithDefaults,
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

const onMessage = ({ action, data: actionParams }, options, callback) => {
  switch (action) {
    case 'updateTicket':
      return callback({
        detail: 'Updating ticket is not supported in this integration'
      });
      updateTicket(actionParams, options, requestWithDefaults, callback);
      break;
    case 'getSubcategories':
      return callback({
        detail: 'Updating ticket is not supported in this integration'
      });
      getSubcategories(actionParams, options, requestWithDefaults, callback);
      break;
    case 'getObservables':
      getObservables(actionParams.incidentId, options, (err, observables) => {
        if (err) {
          return callback(err);
        }
        Logger.trace({ observables }, 'getObservables Results');
        callback(null, {
          observables
        });
      });
      break;
  }
};

module.exports = {
  doLookup,
  startup,
  validateOptions,
  onDetails,
  onMessage
};
