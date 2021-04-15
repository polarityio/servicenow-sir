polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  activeTab: 'details',
  description: '',
  workNotes: '',
  state: '',
  possibleStates: [],
  businessImpact: '',
  possibleBusinessImpacts: [],
  category: '',
  possibleCategories: [],
  subcategory: '',
  possibleSubCategories: [],
  sysId: '',
  updateMessage: '',
  updateErrorMessage: '',
  updateIsRunning: false,
  ticketClosed: false,
  init() {
    const details = this.get('details');
    const [result] = details.results;
    if (this.get('details.isIncident') && result) {
      this.set('description', result.description && result.description.value);
      this.set(
        'businessImpact',
        result.business_criticality && result.business_criticality.value
      );
      this.set('work_notes', result.work_notes && result.work_notes.value);
      this.set('state', result.state && result.state.value);
      this.set('sysId', result.sys_id && result.sys_id.value);
      this.set('category', (result.category && result.category.value) || '-- None --');
      this.set(
        'subcategory',
        (result.subcategory && result.subcategory.value) || '-- None --'
      );
      this.set(
        'ticketClosed',
        (result.state && result.state.value === 'Closed') ||
          result.state.value === 'Cancelled'
      );

      this.set('possibleBusinessImpacts', details.possibleBusinessImpacts);
      this.set('possibleCategories', details.possibleCategories);
      this.set('possibleSubcategories', details.possibleSubcategories);
      this.set('possibleStates', details.possibleStates);
    }

    this._super(...arguments);
  },
  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
    },
    updateTicket: function () {
      const outerThis = this;
      outerThis.set('updateMessage', '');
      outerThis.set('updateErrorMessage', '');
      outerThis.set('updateIsRunning', true);
      outerThis.get('block').notifyPropertyChange('data');

      outerThis
        .sendIntegrationMessage({
          action: 'updateTicket',
          data: {
            entity: outerThis.get('block.entity'),
            sysId: outerThis.get('sysId'),
            description: outerThis.get('description'),
            workNotes: outerThis.get('workNotes'),
            state: outerThis.get('state'),
            businessImpact: outerThis.get('businessImpact'),
            category: outerThis.get('category'),
            subcategory: outerThis.get('subcategory'),
            work_notes: outerThis.get('work_notes')
          }
        })
        .then(
          ({
            results,
            possibleStates,
            possibleBusinessImpacts,
            possibleCategories,
            possibleSubcategories
          }) => {
            outerThis.set('details.results', results);
            outerThis.set('possibleBusinessImpacts', possibleBusinessImpacts);
            outerThis.set('possibleCategories', possibleCategories);
            outerThis.set('possibleSubcategories', possibleSubcategories);
            outerThis.set('possibleStates', possibleStates);
            outerThis.set('updateMessage', 'Successfully Updated');
          }
        )
        .catch((err) => {
          console.log(err);
          outerThis.set(
            'updateErrorMessage',
            'Updating Ticket Failed: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          outerThis.set('updateIsRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('updateMessage', '');
            outerThis.set('updateErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    },
    changeCategory: function (category) {
      const outerThis = this;
      outerThis.set('category', category);
      outerThis.set('updateMessage', 'Loading Subcategories...');
      outerThis.set('updateErrorMessage', '');
      outerThis.get('block').notifyPropertyChange('data');

      outerThis
        .sendIntegrationMessage({
          action: 'getSubcategories',
          data: {
            category
          }
        })
        .then(({ possibleSubcategories }) => {
          outerThis.set('subcategory', '-- None --');
          outerThis.set('possibleSubcategories', possibleSubcategories);
        })
        .catch((err) => {
          outerThis.set(
            'updateErrorMessage',
            'Updating Subcategory Options Failed: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          outerThis.set('updateMessage', '');
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('updateErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    }
  }
});
