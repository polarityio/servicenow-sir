module.exports = [
  {
    path: 'value',
    depth: 0,
    icon: 'binoculars',
    type: 'title',
    observableLink: true
  },
  {
    path: 'notes',
    depth: 0,
    type: 'block'
  },
  {
    // we need to use the special `+` character here instead of `.` because the `get` helper in Ember templating does
    // not support properties with periods in them. The `+` character is used to denote a nested property and is 
    // converted into `type.value` when we pass the field to ServiceNow.
    path: 'type+value',
    depth: 0
  },
  {
    path: 'finding',
    depth: 0
  },
  {
    path: 'sys_created_on',
    depth: 0
  },
  {
    path: 'sys_updated_on',
    depth: 0
  },
  {
    path: 'sys_created_by',
    depth: 0
  },
  {
    path: 'priority',
    depth: 0
  },
  {
    path: 'opened_at',
    depth: 0
  }
];
