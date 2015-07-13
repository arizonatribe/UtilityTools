(function() {
  'use strict';
  angular.module('Tools.shared')
      .provider('errorHandlingService', [ErrorHandlingService]);

  /**
   * ErrorHandlingService Javascript class constructor sets default values for certain members and injects dependencies into the constructed instance
   * @name Tools.shared.ErrorHandlingService
   * @class
   * @constructor
   * @returns {{getErrors: Function, getWarning: Function, enableLogging: Function, getErrorCodes: Function, stampErrorId: Function, handleErrors: Function, handleWarning: Function, clearError: Function, clearErrors: Function, clearWarning: Function, formatErrorMessage: Function, extractMessageFromErrorPromise: Function, handleErrorsAndWarnings: Function}}
   */
  function ErrorHandlingService() {

    /**
     * A list of default HTTP error codes used in error message formatting by the service. Add to these during app config with the addToErrorCodes() method
     * @property {Array}
     * @name Tools.shared.ErrorHandlingService#errorCodes
     * @type {object[]}
     */
    this.errorCodes = [
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

    /**
     * Adds error codes to the default list of HTTP error codes managed by this service.
     * Set these during app config stage.
     * @method Tools.shared.ErrorHandlingService#addToErrorCodes
     * @param {number} code an integer value corresponding to the error message
     * @param {string} title a string value representing the user friendly message for the error
     */
    this.addToErrorCodes = function(code, title) {
      if (code && title) {
        this.errorCodes.push({ Code: code, Title: title });
      }
    };

    /**
     * Determines whether only one error will be displayed in the collection at a time (useful when limited display space or only the last error matters).
     * Set this during app config stage.
     * @property {boolean}
     * @name Tools.shared.ErrorHandlingService#allowMultipleErrors
     * @type {boolean}
     */
    this.allowMultipleErrors = true;

    this.$get = ['_', '$rootScope', '$timeout', function(_, $rootScope, $timeout) {

      /**
       * underscore js library with our custom mixins
       * @property {object}
       * @name Tools.shared.ErrorHandlingService#_
       */
      this._ = _;
      /**
       * angular root scope service
       * @property {object}
       * @name Tools.shared.ErrorHandlingService#$rootScope
       */
      this.$rootScope = $rootScope;
      /**
       * angular $timeout service
       * @property {object}
       * @name Tools.shared.ErrorHandlingService#$timeout
       */
      this.$timeout = $timeout;

      var $this = this,
          /**
           * The error codes used by this service for reference
           * @property {object[]}
           * @type {object[]}
           * @private
           */
          errorCodes = angular.copy($this.errorCodes),
          /**
           * The errors managed by this service
           * @property {object[]}
           * @default []
           * @type {object[]}
           * @private
           */
          errors = [],
          /**
           * The warning field managed by this service
           * @property {string}
           * @default ""
           * @type {string}
           * @private
           */
          warning = '',
          /**
           * The error/warning logging flag. If set to true, will mirror errors and warnings to the browser's <tt>console.error</tt> or <tt>console.warning</tt> methods
           * @default false
           * @type {boolean}
           * @private
           */
          logging = false,
          /**
           * Turns logging on or off
           * @method Tools.shared.ErrorHandlingService#enableLogging
           * @param {boolean} [value] a boolean value indicating whether or not to enable logging (turns it off only if <tt>false</tt> is passed in).
           */
           enableLogging = function(value) {
              logging = $this._.isNullOrUndefined(value) || value ? true : !!value;
            },
            /**
             * Returns the collection of errors managed by this service
             * @method Tools.shared.ErrorHandlingService#getErrors
             * @returns {Array} a collection of errors placed in the service by another service, controller, directive, etc.
             */
            getErrors = function() {
              return errors;
            },
            /**
             * Returns any warning placed into the service
             * @method Tools.shared.ErrorHandlingService#getWarning
             * @returns {string} a string value detailing a warning sent to the service
             */
            getWarning = function() {
              return warning;
            },
            /**
             * Returns the collection of read-only HTTP Codes hard-coded into this service and relevant to error handling
             * @method Tools.shared.ErrorHandlingService#getErrorCodes
             * @returns {object[]}
             */
            getErrorCodes = function() {
              return errorCodes;
            },
            /**
             * Gives an Error a unique Id (GUID)
             * @method Tools.shared.ErrorHandlingService#stampErrorId
             * @param {object} error an error message object to be stamped with a unique id
             */
            stampErrorId = function(error) {
              if (error && !error.Id) {
                error.Id = $this._.generateUUID();
              }
            },
            /**
             * Places an error or an array of errors into the Error Handling Service's singleton collection of errors
             * @method Tools.shared.ErrorHandlingService#handleErrors
             * @param {object} error a raw error object generated by one of many possible sources
             */
            handleErrors = function(error) {
              var clearErrorsAfter20Seconds = $this._.debounce(function() {
                $this.$timeout(function() {
                  clearErrors();
                });
              }, 20000);

              if (error) {
                $this._.chain($this._.isArray(error) ? error : [error])
                    .map(formatErrorMessage)
                    .each(stampErrorId)
                    .each(function(err) {
                      // Check if we're flagged to only allow one error at a time in the collection
                      if (!$this.allowMultipleErrors) {
                        errors = [err];
                      } else {
                        errors.push(err);
                      }

                      // Log the error to the console if flagged to do so
                      if (logging && err.Message) {
                        console.error(err.Message);
                      }
                    })
                    .tap(clearErrorsAfter20Seconds)
                    .value();

                if (!$this.$rootScope.$$phase) {
                  $this.$rootScope.$apply();
                }
              }
            },
            /**
             * Places a warning into the Error Handling Service's singleton member for warnings
             * @method Tools.shared.ErrorHandlingService#handleWarning
             * @param {string} warn a string value to be placed into the service warning cache
             */
            handleWarning = function(warn) {
              var clearWarningAfter5Seconds = $this._.debounce(function() {
                $this.$timeout(function() {
                  clearWarning();
                });
              }, 5000);

              if (warn) {
                $this._.chain($this._.isArray(warn) ? warn : [warn])
                        .each(function(warn) {
                          warning = warn;

                          // Log the warning to the console if flagged to do so
                          if (logging && warn) {
                            console.warn(warn);
                          }
                        })
                        .tap(clearWarningAfter5Seconds)
                        .value();

                if (!$this.$rootScope.$$phase) {
                  $this.$rootScope.$apply();
                }
              }
            },
            /**
             * Remove a specific Error from the Error Handling Service's singleton collection of errors
             * @method Tools.shared.ErrorHandlingService#clearError
             * @param {object} error an error object (with a unique Id field) to be removed from the service collection
             */
            clearError = function(error) {
              if (error && error.Id) {
                errors = $this._.reject(errors, { Id: error.Id});
              }
            },
            /**
             * Removes everything from the Error Handling Service's singleton collection of errors
             * @method Tools.shared.ErrorHandlingService#clearErrors
             */
            clearErrors = function() {
              errors = [];
            },
            /**
             * Removes the warning from the Error Handling Service's singleton member for warnings
             * @method Tools.shared.ErrorHandlingService#clearWarning
             */
            clearWarning = function() {
              warning = '';
            },
            /**
             * Handles formatting of various types of error objects (handles object with keys of <tt>ErrorField</tt>, <tt>WarningField</tt>, <tt>Warning</tt>, <tt>Message</tt>, <tt>message</tt>, <tt>data.Message</tt> or is simply a string)
             * @method Tools.shared.ErrorHandlingService#formatErrorMessage
             * @param {object} error an error object whose message may be nested or on the first level of the object with one of several possible key names
             * @returns {object} an error object whose message is placed in a <tt>Message</tt> field
             */
            formatErrorMessage = function(error) {
              var errOrWarning = null;
              if (error && error !== 'cancel') {
                if (error.data) {
                  if (error.data.Message) {
                    errOrWarning = {Message: error.data.Message};
                  } else {
                    errOrWarning = {Message: error.data};
                  }
                } else if (error.ErrorField) {
                  errOrWarning = {Message: error.ErrorField};
                } else if (error.WarningField) {
                  errOrWarning = {Warning: error.WarningField};
                } else if (error.Warning) {
                  errOrWarning = {Warning: error.Warning};
                } else if (error.Message) {
                  errOrWarning = {Message: error.Message};
                } else if (error.message) {
                  errOrWarning = {Message: error.message};
                } else {
                  errOrWarning = {Message: error};
                }

                // Make sure the error/warning message is a string and not another nested object
                $this._.keys(errOrWarning).forEach(function(val) {
                  if (!$this._.isString(errOrWarning[val])) {
                    errOrWarning = null;
                  }
                });
              }
              return errOrWarning;
            },
            /**
             * Looks through the four default objects on an error promise from an $http get request and extracts an error
             * @method Tools.shared.ErrorHandlingService#extractMessageFromErrorPromise
             * @param {object} data an error object or some other type of object
             * @param {number} status an integer value corresponding to a standard HTTP request status code
             * @param {function} headers HTTP request headers
             * @returns {object} an object whose error message is placed into an <tt>ErrorField</tt> field
             */
            extractMessageFromErrorPromise = function(data, status, headers) {
              var errMessage = formatErrorMessage(data),
                  errorStatus;

              if (errMessage && errMessage.Message) {
                return {ErrorField: errMessage.Message};
              } else if (status) {
                errorStatus = $this._.findWhere(errorCodes, {Code: status});
                if (errorStatus) {
                  return {ErrorField: data && data.Message ? data.Message : 'An error occurred: ' + (errorStatus ? errorStatus.Title : '') + ' (code ' + status + ')'};
                }
              } else if (headers && !$this._.isNullOrUndefined(headers('error'))) {
                return {ErrorField: headers('error')};
              }
              return {ErrorField: 'An unknown error occurred. Please try again.'};
            },
            /**
             * Determines whether an Error or a Warning is being processed (if has a property of "Warning" it is a warning, else it is an error)
             * @method Tools.shared.ErrorHandlingService#handleErrorsAndWarnings
             * @param {object} error an error/warning object or an array of objects to be sent to the underlying <tt>handleErrors()</tt> or <tt>handleWarning()</tt> methods
             */
            handleErrorsAndWarnings = function(error) {
              if (error) {
                if (error.Warning) {
                  handleWarning(error.Warning);
                } else {
                  clearErrors();
                  handleErrors(error);
                }
              }
            };

      return {
        getErrors: getErrors,
        getWarning: getWarning,
        enableLogging: enableLogging,
        getErrorCodes: getErrorCodes,
        stampErrorId: stampErrorId,
        handleErrors: handleErrors,
        handleWarning: handleWarning,
        clearError: clearError,
        clearErrors: clearErrors,
        clearWarning: clearWarning,
        formatErrorMessage: formatErrorMessage,
        extractMessageFromErrorPromise: extractMessageFromErrorPromise,
        handleErrorsAndWarnings: handleErrorsAndWarnings
      };
    }];
  }
})();
