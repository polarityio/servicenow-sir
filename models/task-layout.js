module.exports = [
  {
    path: 'number',
    depth: 0,
    icon: 'ticket',
    type: 'title',
    taskLink: true
  },
  {
    path: 'description',
    depth: 0,
    type: 'block'
  },
  {
    path: 'secure_notes',
    depth: 0,
    type: 'block'
  },
  {
    path: 'work_notes',
    depth: 0,
    type: 'block'
  },
  {
    path: 'short_description',
    depth: 0
  },
  {
    path: 'active',
    depth: 0
  },
  {
    path: 'category',
    depth: 0
  },
  {
    path: 'subcategory',
    depth: 0
  },
  {
    path: 'value',
    depth: 0,
    icon: 'bug',
    type: 'title',
    observableLink: true
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
    path: 'notes',
    depth: 0
  },
  {
    path: 'risk_score',
    depth: 0
  },
  {
    path: 'severity',
    depth: 0
  },
  {
    path: 'priority',
    depth: 0
  },
  {
    path: 'opened_at',
    depth: 0
  },
  {
    path: 'resolved_at',
    depth: 0
  },
  {
    path: 'closed_at',
    depth: 0
  },
  {
    path: 'parent.details.number',
    depth: 1,
    type: 'title',
    icon: 'ticket',
    incidentLink: true,
    onDetails: true
  },
  {
    path: 'parent.details.description',
    depth: 1,
    type: 'block'
  },
  {
    path: 'parent.details.short_description',
    depth: 1
  },
  {
    path: 'parent.details.active',
    depth: 1
  },
  {
    path: 'parent.details.business_criticality',
    depth: 1
  },
  {
    path: 'parent.details.priority',
    depth: 1
  },
  {
    path: 'parent.details.opened_at',
    depth: 1
  },
  {
    path: 'parent.details.resolved_at',
    depth: 1
  },
  {
    path: 'parent.details.closed_at',
    depth: 1
  },
  {
    path: 'opened_by',
    depth: 1,
    type: 'title',
    icon: 'door-open',
    userLink: true,
    onDetails: true
  },
  {
    path: 'opened_by.details.name',
    depth: 1
  },
  {
    path: 'opened_by.details.title',
    depth: 1
  },
  {
    path: 'opened_by.details.department.details.name',
    depth: 1
  },
  {
    path: 'opened_by.details.location.details.name',
    depth: 1
  },
  {
    path: 'assigned_to',
    depth: 1,
    type: 'title',
    icon: 'user',
    userLink: true,
    onDetails: true
  },
  {
    path: 'assigned_to.details.name',
    depth: 1
  },
  {
    path: 'assigned_to.details.title',
    depth: 1
  },

  {
    path: 'assigned_to.details.email',
    depth: 1
  },
  {
    path: 'assigned_to.details.department.details.name',
    depth: 1
  },
  {
    path: 'assigned_to.details.location.details.name',
    depth: 1
  },
  {
    path: 'resolved_by',
    depth: 1,
    type: 'title',
    icon: 'check',
    userLink: true,
    onDetails: true
  },
  {
    path: 'resolved_by.details.name',
    depth: 1
  },
  {
    path: 'resolved_by.details.title',
    depth: 1
  },
  {
    path: 'resolved_by.details.email',
    depth: 1
  },
  {
    path: 'resolved_by.details.department.details.name',
    depth: 1
  },
  {
    path: 'resolved_by.details.location.details.name',
    depth: 1
  },
  {
    path: 'closed_by',
    depth: 1,
    type: 'title',
    icon: 'door-closed',
    userLink: true,
    onDetails: true
  },
  {
    path: 'closed_by.details.name',
    depth: 1
  },
  {
    path: 'closed_by.details.title',
    depth: 1
  },
  {
    path: 'closed_by.details.email',
    depth: 1
  },
  {
    path: 'closed_by.details.department.details.name',
    depth: 1
  },
  {
    path: 'closed_by.details.location.details.name',
    depth: 1
  },
  {
    path: 'close_code',
    depth: 1
  },
  {
    path: 'close_notes',
    depth: 1
  }
];
