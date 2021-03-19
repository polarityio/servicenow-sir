function getServiceNowObjectType(entityObj) {
  if (entityObj.types.indexOf('custom.incident') > -1) {
    return 'incident';
  } else if (entityObj.types.indexOf('custom.task') > -1) {
    return 'task';
  }
}


module.exports = getServiceNowObjectType;