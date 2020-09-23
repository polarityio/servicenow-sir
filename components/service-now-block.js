polarity.export = PolarityComponent.extend({
    details: Ember.computed.alias('block.data.details'),
    items: Ember.computed('block.data.details', function () {
        var entity = this.get('block.entity');
        var details = this.get('block.data.details');
        details = details.results;

        var openedBy;
        var assignedTo;
        var resolvedBy;
        var closedBy;
        var updatedBy;

        if (!entity.isEmail) {
            openedBy = details.opened_by ? details.opened_by.name : 'Unavailable';
            assignedTo = details.assigned_to ? details.assigned_to.name : 'Unavailable';
            resolvedBy = details.resolved_by ? details.resolved_by.name : 'Unavailable';
            closedBy = details.closed_by ? details.closed_by.name : 'Unavailable';
            updatedBy = details.sys_updated_by ? details.sys_updated_by.name : 'Unavailable';
        }

        var items = [
            // Email Attributes
            { title: 'Name:', value: details.name },
            { title: 'VIP', value: details.vip, boolean: true },
            { title: 'Active', value: details.active, boolean: true },
            { title: 'Gender:', value: details.gender },
            { title: 'Education Status:', value: details.edu_status },
            { title: 'Locked Out', value: details.locked_out, boolean: true },
            { title: 'Failed Attempts:', value: details.failed_attempts },
            { title: 'Needs Password Reset', value: details.password_needs_reset, boolean: true },

            // INC/CHG Attributes
            { title: 'Short Description:', value: details.short_description },
            { title: 'Urgency:', value: details.urgency },
            { title: 'Severity:', value: details.severity },
            { title: 'Category:', value: details.category },
            { title: 'Close Code:', value: details.close_code },
            { title: 'Close Notes:', value: details.close_notes },
            { title: 'Opened By:', value: openedBy },
            { title: 'Assigned To:', value: assignedTo },
            { title: 'Resolved By:', value: resolvedBy },
            { title: 'Closed By:', value: closedBy },
            { title: 'Updated By:', value: updatedBy },

            // Universal?
            { title: 'Created On:', value: details.sys_created_on },
            { title: 'Created By:', value: details.sys_created_by }
        ]
            .filter(item => {
                if (item.boolean) {
                    return item.value == 'true';
                } else {
                    return item.value;
                }
            })
            .map(item => {
                if (item.boolean) {
                    item.value = 'Yes';
                }

                return item;
            });

        return items;
    }),
    section: Ember.computed('block.data.details', function () {
        var details = this.get('block.data.details');
        var type = details.results.sys_class_name;

        return {
            'sys_user': 'User',
            'sn_si_incident': 'Incident'
        }[type];
    }),
    link: Ember.computed('block.data.details', function () {
        var details = this.get('block.data.details');
        return `${details.host}/nav_to.do?uri=${details.uriType}do?sys_id=${details.results.sys_id}`;
    })
});
