(function() {
  'use strict';

  describe('[Error Handling Service]', function() {
    var errorHandlingService, _;

    beforeEach(module('Tools.shared'));

    beforeEach(inject(function(_errorHandlingService_, $injector) {
      errorHandlingService = _errorHandlingService_;
      _ = $injector.get('_');
    }));

    describe('[basic setup]', function() {
      it('Should be defined', function() {
        expect(errorHandlingService).toBeDefined();
      });

      it('Should include several methods', function() {
        expect(errorHandlingService.getErrors).toBeDefined();
        expect(errorHandlingService.getWarning).toBeDefined();
        expect(errorHandlingService.enableLogging).toBeDefined();
        expect(errorHandlingService.getErrorCodes).toBeDefined();
        expect(errorHandlingService.stampErrorId).toBeDefined();
        expect(errorHandlingService.handleErrors).toBeDefined();
        expect(errorHandlingService.handleWarning).toBeDefined();
        expect(errorHandlingService.clearError).toBeDefined();
        expect(errorHandlingService.clearErrors).toBeDefined();
        expect(errorHandlingService.clearWarning).toBeDefined();
        expect(errorHandlingService.formatErrorMessage).toBeDefined();
        expect(errorHandlingService.extractMessageFromErrorPromise).toBeDefined();
        expect(errorHandlingService.handleErrorsAndWarnings).toBeDefined();

        expect(_.isFunction(errorHandlingService.getErrors)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.getWarning)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.enableLogging)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.getErrorCodes)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.stampErrorId)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.handleErrors)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.handleWarning)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.clearError)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.clearErrors)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.clearWarning)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.formatErrorMessage)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.extractMessageFromErrorPromise)).toBeTruthy();
        expect(_.isFunction(errorHandlingService.handleErrorsAndWarnings)).toBeTruthy();
      });
    });

    it('Should keep a hold of this useful list of HTTP status codes', function() {
      var errorCodes = [
          {Code: 200, Title: 'OK'},
          {Code: 201, Title: 'Created'},
          {Code: 202, Title: 'Accepted'},
          {Code: 203, Title: 'Non-Authoritative Information'},
          {Code: 204, Title: 'No Content'},
          {Code: 205, Title: 'Reset Content'},
          {Code: 206, Title: 'Partial Content'},
          {Code: 207, Title: 'Multi-Status'},
          {Code: 208, Title: 'Already Reported'},
          {Code: 226, Title: 'IM Used'},
          {Code: 400, Title: 'Bad Request'},
          {Code: 401, Title: 'Unauthorized'},
          {Code: 403, Title: 'Forbidden'},
          {Code: 404, Title: 'Not Found'},
          {Code: 405, Title: 'Method Not Allowed'},
          {Code: 406, Title: 'Not Acceptable'},
          {Code: 407, Title: 'Proxy Authentication Required'},
          {Code: 408, Title: 'Request Timeout'},
          {Code: 409, Title: 'Conflict'},
          {Code: 410, Title: 'Gone'},
          {Code: 411, Title: 'Length Required'},
          {Code: 412, Title: 'Precondition Failed'},
          {Code: 413, Title: 'Request Entity Too Large'},
          {Code: 414, Title: 'Request-URI Too Long'},
          {Code: 415, Title: 'Unsupported Media Type'},
          {Code: 416, Title: 'Requested Range Not Satisfiable'},
          {Code: 417, Title: 'Expectation Failed'},
          {Code: 500, Title: 'Internal Server Error'},
          {Code: 501, Title: 'Not Implemented'},
          {Code: 502, Title: 'Bad Gateway'},
          {Code: 503, Title: 'Service Unavailable'},
          {Code: 504, Title: 'Gateway Timeout'},
          {Code: 505, Title: 'HTTP Version Not Supported'},
          {Code: 506, Title: 'Variant Also Negotiates'},
          {Code: 507, Title: 'Insufficient Storage'},
          {Code: 508, Title: 'Loop Detected'},
          {Code: 509, Title: 'Bandwidth Limit Exceeded'},
          {Code: 510, Title: 'Not Extended'},
          {Code: 511, Title: 'Network Authentication Required'}
      ];

      errorCodes.forEach(function(val) {
        expect(errorHandlingService.getErrorCodes()).toContain(val);
      });

      expect(errorHandlingService.getErrorCodes().length).toEqual(errorCodes.length);
    });

    it('Should stamp an error with a unique id', function() {
      var stampErrorTest = {Message: 'Error'},
          badErrorTest;

      errorHandlingService.stampErrorId(stampErrorTest);
      expect(stampErrorTest.Id).toBeDefined();
      expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stampErrorTest.Id)).toBeTruthy();

      errorHandlingService.stampErrorId(badErrorTest);
      expect(badErrorTest).toBeUndefined();
    });

    describe('[warnings]', function() {
      it('Should handle warning message(s) being added', function() {
        var warning = 'calling out a warning';
        errorHandlingService.handleWarning(warning);
        expect(errorHandlingService.getWarning()).toEqual(warning);
        errorHandlingService.clearWarning();
        errorHandlingService.handleWarning([warning]);
        expect(errorHandlingService.getWarning()).toEqual(warning);
        errorHandlingService.clearWarning();
      });

      it('Should clear a warning', function() {
        errorHandlingService.handleWarning('This is a warning');
        errorHandlingService.clearWarning();
        expect(errorHandlingService.getWarning()).toEqual('');
      });

      it('Should handle a warning message being added through the ambiguous error/warning handler', function() {
        var testWarning = {Warning: 'This could be a warning'};

        // Test creating a warning
        errorHandlingService.handleErrorsAndWarnings(testWarning);
        expect(errorHandlingService.getWarning()).toEqual(testWarning.Warning);
        errorHandlingService.clearWarning();
      });
    });

    describe('[errors]', function() {
      it('Should handle an error message being added', function() {
        var testError = {Message: 'This is an error'};

        errorHandlingService.clearErrors();

        // Test storing an error
        errorHandlingService.handleErrors(testError);
        expect(errorHandlingService.getErrors()[0].Id).toBeDefined();
        testError.Id = errorHandlingService.getErrors()[0].Id;
        expect(errorHandlingService.getErrors()).toContain(testError);
      });

      it('Should clear an error message', function() {
        errorHandlingService.handleErrors([{ Id: _.generateUUID(), Message: 'This is an error' }, { Id: _.generateUUID(), Message: 'This is also an error' }]);
        errorHandlingService.clearErrors();
        expect(errorHandlingService.getErrors()).toEqual([]);
      });

      it('Should handle an error message being added through the ambiguous error/warning handler', function() {
        var testError = {Message: 'This could be an error'};

        errorHandlingService.handleErrorsAndWarnings(testError);
        expect(errorHandlingService.getErrors()[0].Id).toBeDefined();
        testError.Id = errorHandlingService.getErrors()[0].Id;
        expect(errorHandlingService.getErrors()).toContain(testError);
        errorHandlingService.clearErrors();
      });

      it('Should not allow multiple error messages for this particular project', function() {
        var testError = {Message: 'This is an error'},
            testError2 = {Message: 'This is also an error'};

        errorHandlingService.clearErrors();

        // Test storing multiple errors
        errorHandlingService.handleErrors([testError, testError2]);
        testError2.Id = errorHandlingService.getErrors()[0].Id;
        expect(errorHandlingService.getErrors()).toContain(testError2);
        expect(errorHandlingService.getErrors().length).toBe(1);

        // Test clearing one specific error
        errorHandlingService.clearError(testError2);
        expect(errorHandlingService.getErrors()).not.toContain(testError2);

        // Cleanup
        errorHandlingService.clearErrors();
        expect(errorHandlingService.getErrors()).toEqual([]);
      });

      it('Should handle constructing an error message object from a promise, HTTP status code and/or the request header', function() {
        var goodStatus = 500,
            badStatus = 999,
            testError = {ErrorField: 'An unknown error occurred. Please try again.'},
            testErrorWithStatus = {ErrorField: 'An error occurred: Internal Server Error (code ' + goodStatus + ')'},
            anErrorMessage = {Message: 'This is an Error Message'},
            headers = function(field) {
              if (field === 'error') {
                return 'An Error Message';
              } else {
                return null;
              }
            },
            badHeaders = function(field) {
              if (field === 'warning') {
                return 'A Warning Message';
              } else {
                return null;
              }
            };

        // Constructs error from a valid HTTP status code and a generic error from an invalid code
        expect(errorHandlingService.extractMessageFromErrorPromise(null, goodStatus, null)).toEqual(testErrorWithStatus);
        expect(errorHandlingService.extractMessageFromErrorPromise(null, badStatus, null)).toEqual(testError);

        // Extracting error from the request headers
        expect(errorHandlingService.extractMessageFromErrorPromise(null, null, headers)).toEqual({ErrorField: headers('error')});
        expect(errorHandlingService.extractMessageFromErrorPromise(null, null, badHeaders)).toEqual(testError);

        // Extracting error message from the promise itself
        expect(errorHandlingService.extractMessageFromErrorPromise(anErrorMessage, null, null)).toEqual({ErrorField: anErrorMessage.Message});

        // Defaults to generic error message
        expect(errorHandlingService.extractMessageFromErrorPromise(null, null, null)).toEqual(testError);
      });

      it('Should handle extracting the correct error message from an ambiguous object', function() {
        var error = {
          data: {
            Message: 'Data Error Message',
            OtherStuff: 'Lorem ipsum dolor sit amet'
          },
          ErrorField: 'An Error Field',
          WarningField: 'A Warning Field',
          Warning: 'A Warning',
          Message: 'A Message',
          message: 'A little message'
        },
        formattedError = {Message: ''},
        formattedWarning = {Warning: ''};

        // Ignores 'cancel' message
        expect(errorHandlingService.formatErrorMessage('cancel')).toBeNull();

        // Handles any other string being passed in
        expect(errorHandlingService.formatErrorMessage('A test message')).toEqual({Message: 'A test message'});

        // Error nested in data.Message
        formattedError.Message = error.data.Message;
        expect(errorHandlingService.formatErrorMessage(error)).toEqual(formattedError);

        // Ignore 'OtherStuff' in the data object if there is no 'Message' member contained there (otherwise we don't know what structure to expect)
        delete error.data.Message;
        expect(errorHandlingService.formatErrorMessage(error)).toBeNull();

        // Changing data to a string is okay though
        error.data = 'An Error Message';
        formattedError.Message = error.data;
        expect(errorHandlingService.formatErrorMessage(error)).toEqual(formattedError);
        delete error.data;

        // Falls through to extract from an 'ErrorField' member
        formattedError.Message = error.ErrorField;
        expect(errorHandlingService.formatErrorMessage(error)).toEqual(formattedError);
        error.ErrorField = {NestedErrorField: error.ErrorField};

        // Does not parse though when 'ErrorField' is not a string
        expect(errorHandlingService.formatErrorMessage(error)).not.toEqual(formattedError);
        delete error.ErrorField;

        // Falls through to extract from a 'WarningField' member
        formattedWarning.Warning = error.WarningField;
        expect(errorHandlingService.formatErrorMessage(error)).toEqual(formattedWarning);
        error.WarningField = {NestedWarningField: error.WarningField};

        // Does not parse though when 'WarningField' is not a string
        expect(errorHandlingService.formatErrorMessage(error)).not.toEqual(formattedWarning);
        delete error.WarningField;

        // Falls through to extract from a 'Warning' member
        formattedWarning.Warning = error.Warning;
        expect(errorHandlingService.formatErrorMessage(error)).toEqual(formattedWarning);
        error.Warning = {NestedWarning: error.Warning};

        // Does not parse though when 'Warning' is not a string
        expect(errorHandlingService.formatErrorMessage(error)).not.toEqual(formattedWarning);
        delete error.Warning;

        // Falls through to extract from a 'Message' member
        formattedError.Message = error.Message;
        expect(errorHandlingService.formatErrorMessage(error)).toEqual(formattedError);
        error.Message = {NestedMessage: error.Message};

        // Does not parse though when 'Message' is not a string
        expect(errorHandlingService.formatErrorMessage(error)).not.toEqual(formattedError);
        delete error.Message;

        // Falls through to extract from a 'message' member
        formattedError.Message = error.message;
        expect(errorHandlingService.formatErrorMessage(error)).toEqual(formattedError);
        error.message = {NestedMessage: error.message};

        // Does not parse though when 'message' is not a string
        expect(errorHandlingService.formatErrorMessage(error)).not.toEqual(formattedError);
        delete error.message;

        // Now we have an object with no known members or safe types to extract
        expect(errorHandlingService.formatErrorMessage(error)).toBeNull();
      });
    });
  });
})();
