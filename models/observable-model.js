module.exports = {
  sys_id: {
    title: 'Sys Id',
    type: 'observable'
  },
  notes: {
    title: 'Notes',
    type: 'observable'
  },
  value: {
    title: 'Value',
    type: 'observable'
  },
  sighting_count: {
    title: 'Sighting Count',
    type: 'observable'
  },
  // we need to use the special `+` character here instead of `.` because the `get` helper in Ember templating does
  // not support properties with periods in them. The `+` character is used to denote a nested property and is 
  // converted into `type.value` when we pass the field to ServiceNow.
  'type+value': {
    title: 'Type',
    type: 'observable'
  },
  finding: {
    title: 'Finding',
    type: 'observable'
  },
  sys_created_by: {
    title: 'Created By',
    type: 'user'
  },
  sys_created_on: {
    title: 'Created On',
    type: 'observable'
  },
  sys_updated_on: {
    title: 'Updated On',
    type: 'observable'
  },
  sys_updated_by: {
    title: 'Updated By',
    type: 'user'
  }
};
