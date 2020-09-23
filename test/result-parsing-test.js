const chai = require('chai');
const expect = chai.expect;
const bunyan = require('bunyan');
const integration = require('../integration');

// uncomment to debug tests
integration.startup(bunyan.createLogger({ name: 'Mocha Test' /*, level: bunyan.TRACE*/ }));

describe('Service Now integration', () => {
  let options;

  const incidentLookup = {
    opened_at: '2018-01-07 23:08:05',
    number: 'INC0000006',
    resolved_by: {
      link: 'resolved.com'
    },
    closed_by: {
      link: 'closed.com'
    }
  };

  const incidentResult = {
    number: { title: 'Number', value: 'INC0000006', type: 'text', isLink: false },
    opened_at: {
      title: 'Opened At',
      value: '2018-01-07 23:08:05',
      type: 'date',
      isLink: false
    },
    resolved_by: {
      title: 'Resolved By',
      value: 'resolved.com',
      type: 'sys_user',
      isLink: true
    },
    closed_by: { title: 'Closed By', value: 'closed.com', type: 'sys_user', isLink: true }
  };

  before(() => {
    options = {
      host: 'https://localhost:5555',
      username: 'username',
      password: 'password',
      custom: ''
    };
  });

  describe('parseResult', () => {
    it('should parse non-link properties', (done) => {
      let result = integration.parseResult(
        'custom.incident',
        incidentLookup,
        false,
        {},
        (err, parsedResult) => {
          console.info(JSON.stringify(parsedResult));
          expect(err).to.be.null;
          expect(parsedResult).to.deep.equal(incidentResult);
          done();
        }
      );
    });
  });

  describe('parseResults', () => {
    it('should parse non-link properties', (done) => {
      integration.parseResults(
        'custom.incident',
        [incidentLookup],
        false,
        {},
        (err, parsedResult) => {
          console.info(JSON.stringify(parsedResult));
          expect(err).to.be.null;
          expect(parsedResult).to.deep.equal([incidentResult]);
          done();
        }
      );
    });
  });
});
