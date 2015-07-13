(function() {
  'use strict';

  describe('[Validation Service]', function() {
    var validationService, errorHandlingService, _, _s;

    beforeEach(module('Tools.shared'));
    beforeEach(module('Tools.unit-testing.errorHandlingService'));

    beforeEach(inject(function(_validationService_, _errorHandlingService_, $injector) {
      validationService = _validationService_;
      errorHandlingService = _errorHandlingService_;
      _ = $injector.get('_');
      _s = $injector.get('_s');
    }));

    describe('[basic setup]', function() {
      it('Should be defined', function() {
        expect(validationService).toBeDefined();
      });

      it('Should include several methods', function() {
        expect(validationService.getSimpleAlphaNumericRules).toBeDefined();
        expect(validationService.getValidations).toBeDefined();
        expect(validationService.isValid).toBeDefined();
        expect(_.isFunction(validationService.getSimpleAlphaNumericRules)).toBeTruthy();
        expect(_.isFunction(validationService.getValidations)).toBeTruthy();
        expect(_.isFunction(validationService.isValid)).toBeTruthy();
      });
    });

    describe('[getSimpleAlphaNumericRules]', function() {
      it('Should retrieve simple alpha-numeric validation rules', function() {
        expect(validationService.getSimpleAlphaNumericRules().maxLength).toBeDefined();
        expect(validationService.getSimpleAlphaNumericRules().minLength).toBeDefined();
        expect(validationService.getSimpleAlphaNumericRules().maxLength).toEqual(256);
        expect(validationService.getSimpleAlphaNumericRules().minLength).toEqual(1);
        expect(validationService.getSimpleAlphaNumericRules().types).toBeDefined();
        expect(validationService.getSimpleAlphaNumericRules().types).toEqual(['string', 'number']);
        expect(validationService.getSimpleAlphaNumericRules().pattern).toBeDefined();
        expect(_.isRegExp(validationService.getSimpleAlphaNumericRules().pattern)).toBeDefined();
        expect(validationService.getSimpleAlphaNumericRules().description).toBeDefined();
        expect(_.isFunction(validationService.getSimpleAlphaNumericRules().fullDescription)).toBeTruthy();
        expect(_s.isBlank(validationService.getSimpleAlphaNumericRules().description)).toBeFalsy();
      });

      it('Should override defaults for certain fields in the simple alpha-numeric validation rules', function() {
        expect(validationService.getSimpleAlphaNumericRules('myName').name).toEqual('myName');
        expect(validationService.getSimpleAlphaNumericRules('myName').title).toEqual('myName');
        expect(validationService.getSimpleAlphaNumericRules('myName', null, null, 'myTitle').title).toEqual('myTitle');
        expect(validationService.getSimpleAlphaNumericRules(null, 900).maxLength).toEqual(900);
        expect(validationService.getSimpleAlphaNumericRules(null, null, 100).minLength).toEqual(100);
      });

      it('Should test simple alpha-numeric validation regular expression', function() {
        expect(' '.match(validationService.getSimpleAlphaNumericRules().pattern)).toBeFalsy();
        expect('alpha'.match(validationService.getSimpleAlphaNumericRules().pattern)).toBeTruthy();
        expect('ALPHA'.match(validationService.getSimpleAlphaNumericRules().pattern)).toBeTruthy();
        expect('1234567890'.match(validationService.getSimpleAlphaNumericRules().pattern)).toBeTruthy();
        expect('!@#$%&*();:'.match(validationService.getSimpleAlphaNumericRules().pattern)).toBeTruthy();
        expect('Alp@n#m3r!c'.match(validationService.getSimpleAlphaNumericRules().pattern)).toBeTruthy();
        expect(''.match(validationService.getSimpleAlphaNumericRules().pattern)).toBeFalsy();
        expect('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOP'.match(validationService.getSimpleAlphaNumericRules().pattern)).toBeFalsy();
      });
    });

    describe('[getValidations]', function() {
      it('Should confirm the existing rules in the validation service', function() {
        expect(_.isArray(validationService.getValidations())).toBeTruthy();
        expect(validationService.getValidations().length).toEqual(5);
        expect(_.every(validationService.getValidations(), 'name')).toBeTruthy();
        expect(_.every(validationService.getValidations(), 'title')).toBeTruthy();
        expect(_.every(validationService.getValidations(), 'maxLength')).toBeTruthy();
        expect(_.every(validationService.getValidations(), 'minLength')).toBeTruthy();
        expect(_.every(validationService.getValidations(), 'types')).toBeTruthy();
        expect(_.every(validationService.getValidations(), 'pattern')).toBeTruthy();
        expect(_.every(validationService.getValidations(), 'description')).toBeTruthy();
        expect(_.every(validationService.getValidations(), 'fullDescription')).toBeTruthy();
        expect(_.pluck(validationService.getValidations(), 'name')).toEqual(['username', 'password', 'url', 'email', 'guid']);
      });

      it('Should confirm the username validation rules', function() {
        var rule = _.findWhere(validationService.getValidations(), {name: 'username'});

        expect(rule).toBeDefined();
        expect(rule.minLength).toEqual(1);
        expect(rule.maxLength).toEqual(256);
        expect(rule.types).toEqual(['string', 'number']);
        expect(_s.isBlank(rule.title)).toBeFalsy();
        expect(_s.isBlank(rule.description)).toBeFalsy();
        expect(rule.fullDescription()).toEqual(rule.title + ' ' + rule.description);

        expect('alpha'.match(rule.pattern)).toBeTruthy();
        expect('ALPHA'.match(rule.pattern)).toBeTruthy();
        expect('1234567890'.match(rule.pattern)).toBeTruthy();
        expect('!@#$%&*();:'.match(rule.pattern)).toBeTruthy();
        expect('Alp@n#m3r!c'.match(rule.pattern)).toBeTruthy();
        expect(''.match(rule.pattern)).toBeFalsy();
        expect('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOP'.match(rule.pattern)).toBeFalsy();
      });

      it('Should confirm the password validation rules', function() {
        var rule = _.findWhere(validationService.getValidations(), {name: 'password'});

        expect(rule).toBeDefined();
        expect(rule.minLength).toEqual(4);
        expect(rule.maxLength).toEqual(256);
        expect(rule.types).toEqual(['string', 'number']);
        expect(_s.isBlank(rule.title)).toBeFalsy();
        expect(_s.isBlank(rule.description)).toBeFalsy();
        expect(rule.fullDescription()).toEqual(rule.title + ' ' + rule.description);

        expect('alpha'.match(rule.pattern)).toBeTruthy();
        expect('ALPHA'.match(rule.pattern)).toBeTruthy();
        expect('1234567890'.match(rule.pattern)).toBeTruthy();
        expect('!@#$%&*();:'.match(rule.pattern)).toBeTruthy();
        expect('Alp@n#m3r!c'.match(rule.pattern)).toBeTruthy();
        expect(''.match(rule.pattern)).toBeFalsy();
        expect('a1@'.match(rule.pattern)).toBeFalsy();
        expect('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOP'.match(rule.pattern)).toBeFalsy();
      });

      it('Should confirm the URL validation rules', function() {
        var rule = _.findWhere(validationService.getValidations(), {name: 'url'});

        expect(rule).toBeDefined();
        expect(rule.minLength).toEqual(10);
        expect(rule.maxLength).toEqual(512);
        expect(rule.types).toEqual(['string']);
        expect(_s.isBlank(rule.title)).toBeFalsy();
        expect(_s.isBlank(rule.description)).toBeFalsy();
        expect(rule.fullDescription()).toEqual(rule.title + ' ' + rule.description);

        expect('http://www.url.com'.match(rule.pattern)).toBeTruthy();
        expect('https://www.url.com'.match(rule.pattern)).toBeTruthy();
        expect('http://url.com'.match(rule.pattern)).toBeTruthy();
        expect('https://url.com'.match(rule.pattern)).toBeTruthy();
        expect('ftp://url.com'.match(rule.pattern)).toBeFalsy();

        expect('http://www.url.com/?queryString=myProperty&myValue'.match(rule.pattern)).toBeTruthy();
        expect('http://www.url.com/?queryString=myProperty&myValue'.match(rule.pattern)).toBeTruthy();

        expect(''.match(rule.pattern)).toBeFalsy();
        expect('http//www.no-colon.com'.match(rule.pattern)).toBeFalsy();
        expect('http:/www.one-slash.com'.match(rule.pattern)).toBeFalsy();
        expect('www.no-protocol.com'.match(rule.pattern)).toBeFalsy();
      });

      it('Should confirm the email validation rules', function() {
        var rule = _.findWhere(validationService.getValidations(), {name: 'email'});

        expect(rule).toBeDefined();
        expect(rule.minLength).toEqual(6);
        expect(rule.maxLength).toEqual(512);
        expect(rule.types).toEqual(['string']);
        expect(_s.isBlank(rule.title)).toBeFalsy();
        expect(_s.isBlank(rule.description)).toBeFalsy();
        expect(rule.fullDescription()).toEqual(rule.title + ' ' + rule.description);

        expect('a@blackboard.com'.match(rule.pattern)).toBeTruthy();
        expect('chalk@blackboard.com'.match(rule.pattern)).toBeTruthy();
        expect('chalk.eraser@blackboard.com'.match(rule.pattern)).toBeTruthy();
        expect('nails@scratched.across.blackboard.com'.match(rule.pattern)).toBeTruthy();
        expect('canadian-person@blackboard.ca'.match(rule.pattern)).toBeTruthy();
        expect('number@99.com'.match(rule.pattern)).toBeTruthy();
        expect('99@99.com'.match(rule.pattern)).toBeTruthy();

        expect('small-suffix@blackboard.c'.match(rule.pattern)).toBeFalsy();
        expect('no-suffix@blackboard'.match(rule.pattern)).toBeFalsy();
        expect('no-suffix@blackboard'.match(rule.pattern)).toBeFalsy();
        expect('where-it-is.at.blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('at@@blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('at@at@blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('@blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('@blackboard'.match(rule.pattern)).toBeFalsy();
        expect('.@blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('-@blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('_@blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('?@blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('!@blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('#@blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('&@blackboard.com'.match(rule.pattern)).toBeFalsy();
        expect('number@blackboard.c9'.match(rule.pattern)).toBeFalsy();
        expect('99@99.999'.match(rule.pattern)).toBeFalsy();

        expect(''.match(rule.pattern)).toBeFalsy();
      });

      it('Should confirm the guid validation rules', function() {
        var rule = _.findWhere(validationService.getValidations(), {name: 'guid'});

        expect(rule).toBeDefined();
        expect(rule.minLength).toEqual(36);
        expect(rule.maxLength).toEqual(36);
        expect(rule.types).toEqual(['string']);
        expect(_s.isBlank(rule.title)).toBeFalsy();
        expect(_s.isBlank(rule.description)).toBeFalsy();
        expect(rule.fullDescription()).toEqual(rule.title + ' ' + rule.description);

        _.range(0, 1000).forEach(function() {
          expect(_.generateUUID().match(rule.pattern)).toBeTruthy();
        });
        expect(_.generateUUID().replace(/-/g, '').match(rule.pattern)).toBeFalsy();

        expect(_.generateUUID().substr(1).match(rule.pattern)).toBeFalsy();

        expect('142ee08d-f022-405d-b49d-cb37fcde6405'.match(rule.pattern)).toBeTruthy();

        expect('!42ee08d-f022-405d-b49d-cb37fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ge08d-f022-405d-b49d-cb37fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-g022-405d-b49d-cb37fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-605d-b49d-cb37fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405h-b49d-cb37fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-749d-cb37fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-c49d-cb37fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49g-cb37fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-gb37fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-ch37fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-cbi7fcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-cb3jfcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-cb37kcde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-cb37flde6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-cb37fcme6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-cb37fcdn6405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-cb37fcdeo405'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-cb37fcde6p05'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-cb37fcde64q5'.match(rule.pattern)).toBeFalsy();
        expect('142ee08d-f022-405d-b49d-cb37fcde640r'.match(rule.pattern)).toBeFalsy();
      });

      it('Should fail validation for blank strings', function() {
        _.chain(validationService.getValidations())
          .pluck('pattern')
          .each(function(pattern) {
            expect(' '.match(pattern)).toBeFalsy();
          })
          .value();
      });

      it('Should not send errors to the error handling service unless flagged to do so', function() {
        _.chain(validationService.getValidations())
          .each(function(rule) {
            var characters = _.randomString(rule.maxLength + 1);
            errorHandlingService.clearErrors();

            // Don't log errors unless passing the flag to log errors
            validationService.isValid(rule.name, characters);
            expect(errorHandlingService.getErrors()).toEqual([]);

            // Make sure error handling service is now logging errors
            validationService.isValid(rule.name, characters, true);
            expect(errorHandlingService.getErrors()).not.toEqual([]);
          })
          .value();
      });

      it('Should catch null fields or blank strings', function() {
        _.chain(validationService.getValidations())
          .each(function(rule) {
            // Don't log errors unless passing the flag to log errors
            expect(validationService.isValid(rule.name, ' ')).toBeFalsy();
            expect(_.pluck(errorHandlingService.getErrors(), 'Message')).not.toContain(rule.title + ' is missing or blank');

            // Make sure error handling service is now logging errors
            expect(validationService.isValid(rule.name, ' ', true)).toBeFalsy();
            expect(_.pluck(errorHandlingService.getErrors(), 'Message')).toContain(rule.title + ' is missing or blank');
            expect(validationService.isValid(rule.name, null, true)).toBeFalsy();
            expect(_.pluck(errorHandlingService.getErrors(), 'Message')).toContain(rule.title + ' is missing or blank');
          })
          .value();
      });

      it('Should catch invalid type errors', function() {
        _.chain(validationService.getValidations())
          .each(function(rule) {
            var errMessage = 'Invalid type: ' + rule.title + ' can only be of type' + (rule.types.length > 1 ? 's ' : ' ') + rule.types.join(', ');
            expect(validationService.isValid(rule.name, new Date(), true)).toBeFalsy();
            expect(_.pluck(errorHandlingService.getErrors(), 'Message')).toContain(errMessage);
            expect(validationService.isValid(rule.name, {property: 'value'}, true)).toBeFalsy();
            expect(_.pluck(errorHandlingService.getErrors(), 'Message')).toContain(errMessage);
            expect(validationService.isValid(rule.name, [1, 2, 3], true)).toBeFalsy();
            expect(_.pluck(errorHandlingService.getErrors(), 'Message')).toContain(errMessage);
            expect(validationService.isValid(rule.name, _.noop, true)).toBeFalsy();
            expect(_.pluck(errorHandlingService.getErrors(), 'Message')).toContain(errMessage);
          })
          .value();
      });

      it('Should catch character max length violations', function() {
        _.chain(validationService.getValidations())
          .each(function(rule) {
            var characters = _.randomString(rule.maxLength + 1);
            expect(validationService.isValid(rule.name, characters, true)).toBeFalsy();
            expect(_.pluck(errorHandlingService.getErrors(), 'Message')).toContain(rule.title + ' must be no more than ' + rule.maxLength + ' characters long.');
          })
          .value();
      });

      it('Should catch character min length violations', function() {
        _.chain(validationService.getValidations())
          .filter(function(ru) {
            return ru.minLength > 1;
          })
          .each(function(rule) {
            var characters = _.randomString(rule.minLength - 1);
            expect(validationService.isValid(rule.name, characters, true)).toBeFalsy();
            expect(_.pluck(errorHandlingService.getErrors(), 'Message')).toContain(rule.title + ' must be at least ' + rule.minLength + ' characters long.');
          })
          .value();
      });
    });

    describe('[isValid]', function() {
      it('Should fail validation when no validation rule name is provided', function() {
        expect(validationService.isValid()).toBeFalsy();
      });

      it('Should fail validation when no value is provided to validate against', function() {
        expect(validationService.isValid('username')).toBeFalsy();
      });

      it('Should fail validation the name for a validation rule set is invalid', function() {
        expect(validationService.isValid('fake', 'someUsername')).toBeFalsy();
      });
    });
  });
})();
