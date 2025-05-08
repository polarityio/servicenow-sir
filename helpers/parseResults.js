const async = require('async');
const incidentModel = require('../models/incident-model');
const observableModel = require('../models/observable-model');
const { getLogger } = require('./logger');

const propertyMap = {
  observable: observableModel,
  task: incidentModel,
  incident: incidentModel,
  sys_user: {
    name: {
      title: 'Name',
      type: 'sys_user'
    },
    title: {
      title: 'Title',
      type: 'sys_user'
    },
    email: {
      title: 'Email',
      type: 'sys_user'
    },
    department: {
      title: 'Department',
      type: 'cmn_department'
    },
    location: {
      title: 'Location',
      type: 'cmn_location'
    }
  },
  cmn_location: {
    name: {
      title: 'Location',
      type: 'cmn_location'
    }
  },
  cmn_department: {
    name: {
      title: 'Department',
      type: 'department'
    }
  }
};

function parseResults(type, results, withDetails, options, requestWithDefaults, cb) {
  if (typeof withDetails === 'undefined') {
    withDetails = false;
  }

  let parsedResults = [];
  async.each(
    results,
    (result, next) => {
      parseResult(
        type,
        // If result.fields is present then these results have been parsed once before
        // and this call is happening from `onDetails`.
        result.fields ? result.fields : result,
        withDetails,
        options,
        requestWithDefaults,
        (err, parsedResult) => {
          parsedResults.push({
            hasMatchedObservable: result.observable ? true : false,
            fields: parsedResult
          });
          next(err);
        }
      );
    },
    (err) => {
      cb(err, parsedResults);
    }
  );
}

function parseResult(type, result, withDetails, options, requestWithDefaults, cb) {
  let parsedResult = {};

  if (typeof propertyMap[type] !== 'undefined') {
    async.eachOf(
      propertyMap[type],
      (propertyMapObject, propertyKey, nextProperty) => {
        let resultValue = result[propertyKey];

        if (typeof resultValue !== 'undefined') {
          if (valueIsLink(resultValue) && !linkIsProcessed(resultValue)) {
            // this property is a link so we need to traverse it
            if (withDetails) {
              getDetailsInformation(
                resultValue.link,
                options,
                requestWithDefaults,
                (err, details) => {
                  if (err) {
                    return nextProperty(err);
                  }

                  parseResult(
                    propertyMapObject.type,
                    details,
                    true,
                    options,
                    requestWithDefaults,
                    (parseDetailsError, parsedDetailsResult) => {
                      if (parseDetailsError) {
                        return nextProperty(parseDetailsError);
                      }

                      if (!valueIsProcessed(resultValue)) {
                        let transformedResult = transformPropertyLinkValue(
                          propertyMapObject,
                          resultValue,
                          result
                        );
                        transformedResult.details = parsedDetailsResult;
                        parsedResult[propertyKey] = transformedResult;
                      } else {
                        resultValue.details = parsedDetailsResult;
                        parsedResult[propertyKey] = resultValue;
                      }

                      return nextProperty(null);
                    }
                  );
                }
              );
            } else {
              // don't need to try and load details yet
              parsedResult[propertyKey] = transformPropertyLinkValue(
                propertyMapObject,
                resultValue,
                result
              );
              return nextProperty(null);
            }
          } else if (!valueIsProcessed(resultValue)) {
            parsedResult[propertyKey] = transformPropertyValue(
              propertyMapObject,
              resultValue,
              result
            );
            return nextProperty(null);
          } else {
            return nextProperty(null);
          }
        } else {
          return nextProperty(null);
        }
      },
      (err) => {
        return cb(err, parsedResult);
      }
    );
  } else {
    return cb(null, parsedResult);
  }
}

function valueIsProcessed(resultValue) {
  if (resultValue !== null && resultValue.isProcessed === true) {
    return true;
  }
  return false;
}

const linkIsProcessed = (resultValue) =>
  !(
    resultValue !== null &&
    (resultValue.details === null || typeof resultValue.details === 'undefined')
  );

const valueIsLink = (resultValue) =>
  resultValue !== null && typeof resultValue.link === 'string';

const transformPropertyLinkValue = (propertyObj, value, parentObj) => ({
  title: propertyObj.title,
  value: propertyObj.title,
  type: propertyObj.type,
  link: value.link,
  isLink: true,
  isProcessed: true,
  details: null,
  sysId: value.value
});

const transformPropertyValue = (propertyObj, value, parentObj) => ({
  title: propertyObj.title,
  value: value,
  ...(propertyObj.title === 'Risk' && {
    color: value <= 50 ? '#90EF8F' : value <= 80 ? '#FFA500' : '#FF6248'
  }),
  ...(propertyObj.title === 'Work Notes' && {
    value:
      value &&
      typeof value === 'string' &&
      value
        .replace(/(?=(\d{4}\-\d{1,2}\-\d{1,2}))/g, ',,,')
        .split(',,,')
        .slice(1)
  }),
  type: propertyObj.type,
  isLink: false,
  isProcessed: true,
  details: null,
  sysId: parentObj.sys_id
});

function getDetailsInformation(link, options, requestWithDefaults, cb) {
  let requestOptions = {
    uri: link,
    ...(options.apiKey
      ? { headers: { [options.apiKeyHeader]: options.apiKey } }
      : {
          auth: {
            username: options.username,
            password: options.password
          }
        }),
    json: true
  };

  requestWithDefaults(requestOptions, (err, response, body) => {
    if (err) {
      return cb({
        err: err,
        link: link,
        detail: 'HTTP Request Error when retrieving details'
      });
    }

    if (response.statusCode !== 200) {
      return cb({
        detail: 'Unexpected Status Code Received',
        link: link,
        statusCode: response.statusCode
      });
    }

    cb(null, body.result);
  });
}

module.exports = parseResults;
