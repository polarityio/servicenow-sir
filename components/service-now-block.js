polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  results: Ember.computed.alias('details.results'),
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
    // const details = this.get('details');
    // const [result] = details.results;
    // if (this.get('details.isIncident') && result) {
    //   this.set('description', result.description && result.description.value);
    //   this.set(
    //     'businessImpact',
    //     result.business_criticality && result.business_criticality.value
    //   );
    //   this.set('work_notes', result.work_notes && result.work_notes.value);
    //   this.set('state', result.state && result.state.value);
    //   this.set('sysId', result.sys_id && result.sys_id.value);
    //   this.set('category', (result.category && result.category.value) || '-- None --');
    //   this.set(
    //     'subcategory',
    //     (result.subcategory && result.subcategory.value) || '-- None --'
    //   );
    //   this.set(
    //     'ticketClosed',
    //     (result.state && result.state.value === 'Closed') ||
    //       result.state.value === 'Cancelled'
    //   );
    //
    //   this.set('possibleBusinessImpacts', details.possibleBusinessImpacts);
    //   this.set('possibleCategories', details.possibleCategories);
    //   this.set('possibleSubcategories', details.possibleSubcategories);
    //   this.set('possibleStates', details.possibleStates);
    // }

    this._super(...arguments);
  },
  actions: {
    changeTab: function (tabName, resultIndex) {
      this.set(`results.${resultIndex}.__activeTab`, tabName);
      if (
        tabName === 'observables' &&
        !this.get(`results.${resultIndex}.__observables`)
      ) {
        this.getObservables(resultIndex);
      }
    },
    updateTicket: function () {
      this.set('updateMessage', '');
      this.set('updateErrorMessage', '');
      this.set('updateIsRunning', true);
      this.get('block').notifyPropertyChange('data');

      this.sendIntegrationMessage({
        action: 'updateTicket',
        data: {
          entity: this.get('block.entity'),
          sysId: this.get('sysId'),
          description: this.get('description'),
          workNotes: this.get('workNotes'),
          state: this.get('state'),
          businessImpact: this.get('businessImpact'),
          category: this.get('category'),
          subcategory: this.get('subcategory'),
          work_notes: this.get('work_notes')
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
            this.set('details.results', results);
            this.set('possibleBusinessImpacts', possibleBusinessImpacts);
            this.set('possibleCategories', possibleCategories);
            this.set('possibleSubcategories', possibleSubcategories);
            this.set('possibleStates', possibleStates);
            this.set('updateMessage', 'Successfully Updated');
          }
        )
        .catch((err) => {
          console.log(err);
          this.set(
            'updateErrorMessage',
            'Updating Ticket Failed: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          this.set('updateIsRunning', false);
          setTimeout(() => {
            if (!this.isDestroyed) {
              this.set('updateMessage', '');
              this.set('updateErrorMessage', '');
            }
          }, 5000);
        });
    },
    changeCategory: function (category) {
      this.set('category', category);
      this.set('updateMessage', 'Loading Subcategories...');
      this.set('updateErrorMessage', '');

      this.sendIntegrationMessage({
        action: 'getSubcategories',
        data: {
          category
        }
      })
        .then(({ possibleSubcategories }) => {
          this.set('subcategory', '-- None --');
          this.set('possibleSubcategories', possibleSubcategories);
        })
        .catch((err) => {
          this.set(
            'updateErrorMessage',
            'Updating Subcategory Options Failed: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          this.set('updateMessage', '');
          setTimeout(() => {
            if (!this.isDestroyed) {
              this.set('updateErrorMessage', '');
            }
          }, 5000);
        });
    }
  },
  onDetailsError(error){
    console.error('Error loading incident details', error);
    this.set(`error`, JSON.stringify(error, null, 2));
  },
  getObservables: function (resultIndex) {
    const incidentId = this.get(`results.${resultIndex}.fields.sys_id.value`);

    const payload = {
      action: 'getObservables',
      data: {
        incidentId
      }
    };

    this.set(`results.${resultIndex}.__loadingObservables`, true);

    this.sendIntegrationMessage(payload)
      .then((result) => {
        this.set(`results.${resultIndex}.__observables`, result.observables);
      })
      .catch((err) => {
        console.error('Error loading observables', err);
        this.set(`results.${resultIndex}.__error`, JSON.stringify(err, null, 2));
      })
      .finally(() => {
        this.set(`results.${resultIndex}.__loadingObservables`, false);
      });
  }
});
