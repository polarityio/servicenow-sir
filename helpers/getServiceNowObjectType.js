function getServiceNowObjectType(entityObj) {
  if (entityObj.types.indexOf('custom.task') > -1) {
    return 'task';
  } else {
    return 'incident';
  }
}


module.exports = getServiceNowObjectType;