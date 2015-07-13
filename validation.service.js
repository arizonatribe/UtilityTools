(function() {
  'use strict';
  angular.module('Tools.shared')
      .provider('validationService', [ValidationService]);

  /**
   * ValidationService Javascript class constructor sets default values for certain members and injects dependencies into the constructed instance
   * @name Tools.shared.ValidationService
   * @class
   * @constructor
   * @returns {{getSimpleAlphaNumericRules: Function, getValidations: Function, isValid: Function }}
   */
  function ValidationService() {

    /**
     * A method which concatenates the tile and description fields
     * @name Tools.shared.ValidationService#getFullDescription
     * @private
     * @returns {string} concatenation of the title and description fields
     */
    var getFullDescription = function() {
      return this.title + ' ' + this.description;
    };

    /**
     * Holds the named list of default validations managed by this service to which additional validations can be added during app config (or overwritten)
     * @name Tools.shared.ValidationService#defaultValidations
     * @type {Array}
     * @private
     */
    this.defaultValidations = [
        {
          name: 'username',
          title: 'User Name',
          maxLength: 256,
          minLength: 1,
          types: ['string', 'number'],
          pattern: /^[a-zA-Z0-9@#$%&*\+\-_(),':;?.!\/\[\]\\]{1,256}$/,
          description: 'must be alpha-numeric (along with some optional symbols)',
          fullDescription: getFullDescription
        },
        {
          name: 'password',
          title: 'Password',
          maxLength: 256,
          minLength: 4,
          types: ['string', 'number'],
          pattern: /^[a-zA-Z0-9@#$%&*\+\-_(),':;?.!\/\[\]\\]{4,256}$/,
          description: 'must contain letters, numbers, and/or symbols',
          fullDescription: getFullDescription
        },
        {
          name: 'url',
          title: 'URL',
          maxLength: 512,
          minLength: 10,
          types: ['string'],
          pattern: /^(^|[\s.:;?\-\]<\(])(https?:\/\/[-\w;/?:@&=+$\|_.!~*\|'()\[\]%#,]+[\w/#](\(\))?)(?=$|[\s',\|\(\).:;?\-\[\]>\)])$/i,
          description: 'must be a valid web address',
          fullDescription: getFullDescription
        },
        {
          name: 'email',
          title: 'Email Address',
          maxLength: 512,
          minLength: 6,
          types: ['string'],
          pattern: /^[0-9a-zA-Z]+[-0-9a-zA-Z.+_]*@[0-9a-zA-Z]+[-0-9a-zA-Z.+_]*\.[a-zA-Z]{2,4}$/,
          description: 'must follow the standard email address format',
          fullDescription: getFullDescription
        },
        {
          name: 'guid',
          title: 'ID',
          maxLength: 36,
          minLength: 36,
          types: ['string'],
          pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          description: 'must be an RFC-4122 compliant UUID',
          fullDescription: getFullDescription
        }
    ];

    /**
     * Adds validations to the default list of form input field validations managed by this service.
     * It will overwrite an existing validation if the name passed in matches an existing default (which are 'username', 'password', 'url', 'email', 'guid')
     * @method Tools.shared.ValidationService#addValidation
     * @param {string} name a string value representing the unique name of the validation
     * @param {string} [title=name] a string value representing the user friendly display name for the field
     * @param {string} [description] a string value describing the field validation rules
     * @param {number} [maxLength=256] an integer value representing the cutoff limit for the number of characters accepted in this field
     * @param {number} [minLength=1] an integer value representing the minimum limit for the number of characters accepted in this field
     * @param {string[]} [types] an array of string values representing the types allowed for this field from the list of standard javascript types (defaults to 'string' and 'number')
     * @param {RegExp} [pattern] a regular expression object to use in field validation
     */
    this.addValidation = function(name, title, description, maxLength, minLength, types, pattern) {
      var newValidation = {},
        removeIndex = -1;

      if (typeof name === 'string') {
        newValidation.name = name;
      } else {
        throw new Error('a string must be provided, representing this validation unique name');
      }

      if (title) {
        if (typeof title === 'string') {
          newValidation.title = title;
        } else {
          throw new Error('if a title is provided, it must be a string value (if not provided, the "name" value will be used)');
        }
      } else {
        newValidation.title = newValidation.name;
      }

      if (description) {
        if (typeof description === 'string') {
          newValidation.description = description;
        } else {
          throw new Error('if a description is provided, it must be a string value');
        }
      } else {
        newValidation.description = '';
      }

      if (maxLength) {
        if (typeof maxLength === 'number' && parseInt(maxLength, 10) > 0) {
          newValidation.maxLength = parseInt(maxLength, 10);
        } else {
          throw new Error('if a max length is provided, it must be an integer value greater than zero (if no maxLength specified, 256 will be used)');
        }
      } else {
        newValidation.maxLength = 256;
      }

      if (minLength) {
        if (typeof minLength === 'number' && parseInt(minLength, 10) > 0) {
          newValidation.minLength = parseInt(minLength, 10);
        } else {
          throw new Error('if a min length is provided, it must be an integer value greater than zero (if no minLength specified, 1 will be used)');
        }
      } else {
        newValidation.minLength = 1;
      }

      if (types) {
        if (types instanceof Array && types.every(function(val) {
            return typeof val === 'string' &&
              ['string', 'number', 'boolean', 'object', 'array', 'null', 'undefined'].indexOf(val.toLowerCase()) >= 0;
          })) {
          newValidation.types = types;
        } else {
          throw new Error('if a list of types is provided, those types must be specific as string values (if no types specified, types of "string" and "number" will be used by default)');
        }
      } else {
        newValidation.types = ['string', 'number'];
      }

      if (pattern) {
        if (pattern instanceof RegExp) {
          newValidation.pattern = pattern;
        } else {
          throw new Error('if a pattern is provided, it must be a valid regular expression object');
        }
      }

      newValidation.fullDescription = function() {
        return this.title + ' ' + this.description;
      };

      this.validations.forEach(function(validation, index) {
        if (validation.name === newValidation.name) {
          removeIndex = index;
        }
      });

      if (removeIndex >= 0) {
        this.validations.splice(removeIndex, 1, newValidation);
      } else {
        this.validations.push(newValidation);
      }
    };

    this.$get = ['_', '_s', 'errorHandlingService', GetValidationService];

    function GetValidationService(_, _s, errorHandlingService) {

      /**
       * underscore js library with our custom mixins
       * @property {object}
       * @name Tools.shared.ValidationService#_
       */
      this._ = _;
      /**
       * underscore js library with our custom mixins
       * @property {object}
       * @name Tools.shared.ValidationService#_s
       */
      this._s = _s;
      /**
       * error handling service
       * @property {object}
       * @name Tools.shared.ValidationService#errorHandlingService
       */
      this.errorHandlingService = errorHandlingService;

      var $this = this,
          /**
           * Initializes a collection of validations and sets them up as members of an object managed by the service.
           * The expectation is the provider's init() method has been run during the app config phase with any additional validations besides the basic ones hard-coded here.
           * @name Tools.shared.ValidationService#validations
           * @type {array}
           * @private
           */
          validations = angular.copy($this.defaultValidations),
          /**
           * Simple rules for non-blank alpha-numeric with symbol checking
           * @method Tools.shared.ValidationService#getSimpleAlphaNumericRules
           * @param {string} name a string value to be used for building this default alphanumeric validation rule
           * @param {number} [max] an integer value to be used max length of alphanumeric character validation on this field
           * @param {number} [min] an integer value to be used max length of alphanumeric character validation on this field
           * @param {string} [title] a string value to be used for the user friendly display name on this field (defaults to name otherwise)
           * @returns {{name: string, title: string, maxLength: (number), minLength: (number), types: string[], pattern: RegExp, description: string, fullDescription: Function}}
           */
           getSimpleAlphaNumericRules = function(name, max, min, title) {
            return {
              name: name,
              title: title || name,
              maxLength: $this._.isNumber(max) && parseInt(max, 10) > 0 ? max : 256,
              minLength: $this._.isNumber(min) && parseInt(min, 10) > 0 ? min : 1,
              types: ['string', 'number'],
              pattern: /^[a-zA-Z0-9@#$%&*+\-_(),':;?.!\/\[\]\\]{1,256}$/,
              description: 'must be alpha-numeric (along with some optional symbols)',
              fullDescription: function() {
                return this.title + ' ' + this.description;
              }
            };
          },
          /**
           * Lists the validations present on this service or retrieves a specific one by name
           * @method Tools.shared.ValidationService#getValidations
           * @param {string} [name] a string value corresponding to the name of one of the validations present on this service
           * @returns {object|array} a validations object (if a name was passed in) or the full list of validation objects managed by this service
           */
          getValidations = function(name) {
            return $this._.isString(name) ? $this._.findWhere(validations, {name: name}) || {} : validations;
          },
          /**
           * Checks that a given value meets the validation rules based on the field name it corresponds to (see getValidations() for list)
           * @method Tools.shared.ValidationService#isValid
           * @param {string} name a string value representing the unique name of an existing validation managed by this service
           * @param {*} value a value to be validated against a particular rule set
           * @param {bool} [handleErrors] a boolean value indicating whether or not to pass errors to the error handling service
           * @param {object} [customField] a validation rule set to be used in place of an existing rule set (using this is the only time when the 'name' parameter becomes optional)
           * @returns {boolean} a boolean value indicating whether or not this field passed the validation rules
           */
          isValid = function(name, value, handleErrors, customField) {
            var validationErrors = [],
                validation = $this._.findWhere(getValidations(), {name: name}) || customField,
                fieldName = function() {
                  return !$this._.isNullOrUndefined(validation) ? validation.title || name : name;
                };

            if ($this._.isNullOrUndefined(value) || ($this._.isString(value) && $this._s.isBlank(value))) {
              validationErrors.push(fieldName() + ' is missing or blank');
            } else if (validation) {
              // Check that the value is of an acceptable data type
              if ($this._.isArray(validation.types)) {
                $this._.chain(validation.types)
                    .intersection([typeof value])
                    .tap(function(types) {
                      if (!types.length) {
                        validationErrors.push(
                            'Invalid type: ' +
                            fieldName() +
                            ' can only be of type' + (validation.types.length > 1 ? 's ' : ' ') +
                            validation.types.join(', ')
                        );
                      }
                    })
                    .value();
              }

              if ($this._.isString(value) || $this._.isNumber(value)) {
                // Check that the value meets the min character length restriction
                if (!$this._.isNullOrUndefined(validation.minLength)) {
                  if (($this._.isString(value) && value.length < validation.minLength) ||
                      ($this._.isNumber(value) && ('' + value + '').length < validation.minLength)) {

                    validationErrors.push(fieldName() + ' must be at least ' + validation.minLength + ' characters long.');
                  }
                }

                // Check that the value meets the max character length restriction
                if (!$this._.isNullOrUndefined(validation.maxLength)) {
                  if (($this._.isString(value) && value.length > validation.maxLength) ||
                      ($this._.isNumber(value) && ('' + value + '').length > validation.maxLength)) {

                    validationErrors.push(fieldName() + ' must be no more than ' + validation.maxLength + ' characters long.');
                  }
                }

                // Checks that the value matches any specific regular expression
                if ($this._.isRegExp(validation.pattern) && $this._.isEmpty(validationErrors)) {
                  if (($this._.isString(value) && !value.match(validation.pattern)) ||
                      ($this._.isNumber(value) && ('' + value + '').match(validation.pattern))) {

                    validationErrors.push(fieldName() + ' ' + validation.description);
                  }
                }
              }
            } else {
              validationErrors.push('Cannot find validation rules for "' + name + '"');
            }

            if (handleErrors) {
              $this.errorHandlingService.clearErrors();
              $this.errorHandlingService.handleErrors(validationErrors);
            }

            return !validationErrors.length;
          };

      return {
        getSimpleAlphaNumericRules: getSimpleAlphaNumericRules,
        getValidations: getValidations,
        isValid: isValid
      };
    }
  }
})();
