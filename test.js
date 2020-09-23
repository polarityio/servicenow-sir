let chai = require('chai');
let assert = chai.assert;

let bunyan = require('bunyan');
let config = require('./config/config');
config.request.rejectUnauthorized = false;

let integration = require('./integration');
// uncomment to debug tests  
integration.startup(bunyan.createLogger({ name: 'Mocha Test'/*, level: bunyan.TRACE*/ }));

describe('Service Now integration', () => {
    let options;

    before(() => {
        options = {
            host: 'https://localhost:5555',
            username: 'username',
            password: 'password',
            custom: ''
        };
    });

    function getEntities(type, value) {
        let isEmail = type === 'email';
        let isIPv4 = type === 'ip';
        let types = type.indexOf('custom') > -1 ? type : undefined;
        return {
            type: type.split('.')[0],
            types: types,
            isEmail: isEmail,
            isIPv4: isIPv4,
            value: value
        };
    }

    describe('email lookups', () => {
        it('should handle request errors', (done) => {
            integration.doLookup(
                [getEntities('email', 'doesnt matter because the SSL fails')],
                { host: 'http://localhost:5555', username: 'asdf', password: 'asdf' },
                (err, results) => {
                    assert.isOk(err);
                    assert.equal(0, results.length);
                    done();
                });
        });

        it('should handle non-200 responses', (done) => {
            integration.doLookup([getEntities('email', 'invalidemail@baddomain.com')], options, (err, results) => {
                assert.isOk(err);
                assert.equal(0, results.length);
                done();
            });
        });

        it('should allow looking up users by email', (done) => {
            integration.doLookup([getEntities('email', 'lucius.bagnoli@example.com')], options, (err, results) => {
                assert.isNotOk(err);
                assert.equal(1, results.length);
                done();
            });
        });

        it('should allow looking up users by more emails', (done) => {
            integration.doLookup([getEntities('email', 'john.example@example.com')], options, (err, results) => {
                assert.isNotOk(err);
                assert.equal(1, results.length);
                done();
            });
        });

        it('should return user details', (done) => {
            integration.doLookup([getEntities('email', 'john.example@example.com')], options, (err, results) => {
                assert.equal('john.example@example.com', results[0].data.details.results.email);
                done();
            });
        });

        it('should lookup multiple entities', (done) => {
            integration.doLookup(
                [getEntities('email', 'john.example@example.com'),
                getEntities('email', 'lucius.bagnoli@example.com')],
                options,
                (err, results) => {
                    assert.equal('john.example@example.com', results[0].data.details.results.email);
                    assert.equal('lucius.bagnoli@example.com', results[1].data.details.results.email);
                    done();
                });
        });
    });

    describe('change lookups', () => {
        it('should allow looksups by change ids', (done) => {
            integration.doLookup([getEntities('custom.change', 'CHG0000001')], options, (err, results) => {
                assert.notOk(err);
                assert.equal(1, results.length);
                assert.equal('CHG0000001', results[0].data.details.results.number)
                done();
            });
        });
    });

    describe('incident lookups', () => {
        it('should allow looksups by incident ids', (done) => {
            integration.doLookup([getEntities('custom.incident', 'INC0000001')], options, (err, results) => {
                assert.notOk(err);
                assert.equal(1, results.length);
                assert.equal('INC0000001', results[0].data.details.results.number)
                done();
            });
        });
    });

    describe('assigned lookup', () => {
        it('should look up assigned info and insert it into the returned result', (done) => {
            integration.doLookup([getEntities('custom.change', 'CHG0000001')], options, (err, results) => {
                assert.notOk(err);
                assert.equal(1, results.length);
                assert.equal('ITIL User', results[0].data.details.results.assigned_to.name);
                done();
            });
        });
    });

    describe('custom looksup', () => {
        it('should allow ip lookups on custom fields', (done) => {
            let options = {
                host: 'https://localhost:5555',
                username: 'username',
                password: 'password',
                custom: 'custom_field'
            };

            integration.doLookup([getEntities('ip', '123.456.789.012')], options, (err, results) => {
                assert.notOk(err);
                assert.equal(1, results.length);
                assert.equal('123.456.789.012', results[0].data.details.results.custom_field);
                done();
            });
        });

        it('should allow ip lookups on multiple custom fields', (done) => {
            let options = {
                host: 'https://localhost:5555',
                username: 'username',
                password: 'password',
                custom: 'custom_field,custom_field2'
            };

            integration.doLookup([getEntities('ip', '123.456.789.012')], options, (err, results) => {
                console.error(err);
                assert.notOk(err);
                assert.equal(1, results.length);
                assert.equal('123.456.789.012', results[0].data.details.results.custom_field);
                done();
            });
        });
    });
});
