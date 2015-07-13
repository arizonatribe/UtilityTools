(function() {
  'use strict';
  /**
   * @name Tools.shared
   * @namespace
   */
  angular.module('Tools.shared', ['ng', 'LocalStorageModule'])
      /**
       * underscore js library with our custom mixins. This wrapper is for injecting the underscorejs library into a controller, service, etc.
       * @class Tools.shared._
       */
       .factory('_', ['$window', function($window) {
          $window._.mixin({
            /**
             * Searches for and returns the first argument which is not null/undefined
             * @method Tools.shared._#coalesce
             * @returns {*}
             */
            coalesce: function() {
              var $this = this,
                i;
              for (i in arguments) {
                if (!$this.isNullOrUndefined(arguments[i])) {
                  return arguments[i];
                }
              }
              return null;
            },
            /**
             * Simple shorthand check to see if a given object is undefined or null
             * @method Tools.shared._#isNullOrUndefined
             * @param obj
             * @returns {*|boolean}
             */
            isNullOrUndefined: function(obj) {
              return this.isUndefined(obj) || this.isNull(obj);
            },
            /**
             * Generates a unique 36 character hyphenated GUID
             * @method Tools.shared._#generateUUID
             * @returns {string}
             */
            generateUUID: function() {
              var d = new Date().getTime();
              return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
              });
            },
            /**
             * Protects against inconsistencies in the API layer in the way they serialize GUIDs between SignalR and Service Stack
             * @method Tools.shared._#isBadGuid
             * @param field
             * @returns {boolean|*}
             */
            isBadGuid: function(field) {
              return !this.isNullOrUndefined(field) && this.isString(field) && field.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            },
            /**
             * De-hyphenates GUIDs to protect against inconsistencies in the way the API serializes Json between SignalR and Service Stack
             * @method Tools.shared._#makeInconsistentGuidsUniform
             * @param obj
             */
            makeInconsistentGuidsUniform: function(obj) {
              var $this = this,
                  checkField = function(field) {
                    if (!$this.isNullOrUndefined(field) && $this.isString(field) && $this.isBadGuid(field)) {
                      return field.replace(/-/g, '');
                    } else {
                      return field;
                    }
                  },
                  checkObject = function(obj) {
                    if ($this.isArray(obj)) {
                      return checkArray(obj);
                    } else if ($this.isString(obj)) {
                      return checkField(obj);
                    } else if ($this.isRealObject(obj)) {
                      $this.keys(obj).forEach(function(val) {
                          if ($this.isArray(obj[val])) {
                            obj[val] = checkArray(obj[val]);
                          } else if ($this.isRealObject(obj[val])) {
                            obj[val] = checkObject(obj[val]);
                          } else {
                            obj[val] = checkField(obj[val]);
                          }
                        });
                      return obj;
                    } else {
                      return obj;
                    }
                  },
                  checkArray = function(arr) {
                    if ($this.isArray(arr)) {
                      arr.forEach(function(val, index) {
                          if ($this.isArray(val)) {
                            arr[index] = checkArray(val);
                          } else if ($this.isRealObject(val)) {
                            arr[index] = checkObject(val);
                          } else {
                            arr[index] = checkField(val);
                          }
                        });
                      return arr;
                    } else {
                      return arr;
                    }
                  };
              obj = checkObject(obj);
            },
            /**
             * Overwrites the properties in an object with those from another
             * @method Tools.shared._#updateObject
             * @param obj
             * @param newObject
             * @param preservePropertiesUniqueToOriginal
             */
            updateObject: function(obj, newObject, preservePropertiesUniqueToOriginal) {
              var $this = this;
              if ($this.isRealObject(obj) && $this.isRealObject(newObject)) {
                $this.keys(obj).forEach(function(val) {
                  if ($this.has(newObject, val)) {
                    obj[val] = newObject[val];
                  } else if (!preservePropertiesUniqueToOriginal) {
                    delete obj[val];
                  }
                });
              } else {
                obj = newObject;
              }
            },
            /**
             * Checks if null, undefined, empty string, empty array, empty object or unknown enum value
             * @method Tools.shared._#isEmptyField
             * @param obj
             * @returns {*|boolean}
             */
            isEmptyField: function(obj) {
              var $this = this;
              return $this.isNullOrUndefined(obj) ||
                  (($this.isString(obj) || $this.isArray(obj) || $this.isRealObject(obj)) && $this.isEmpty(obj)) ||
                  ($this.isString(obj) && obj.toLowerCase() === 'unknown');
            },
            /**
             * Checks if an object is what is usually meant by "object" (ie, not a function, not an array, and not a date object)
             * @method Tools.shared._#isRealObject
             * @param obj
             * @returns {*|boolean}
             */
            isRealObject: function(obj) {
              return this.isObject(obj) && !this.isArray(obj) && !this.isFunction(obj) && !this.isDate(obj);
            },
            /**
             * Fully clones an object
             * @method Tools.shared._#fullClone
             * @param obj
             * @returns {{}}
             */
            fullClone: function(obj) {
              var $this = this,
                  newObj = {},
                  cloneObject = function(o) {
                    var oj = {};
                    if ($this.isRealObject(o)) {
                      $this.keys(o).forEach(function(v) {
                          if ($this.isArray(o[v])) {
                            oj[v] = cloneArray(o[v]);
                          } else if ($this.isRealObject(o[v])) {
                            oj[v] = cloneObject(o[v]);
                          } else {
                            oj[v] = o[v];
                          }
                        });
                    }
                    return oj;
                  },
                  cloneArray = function(o) {
                    var n = [];
                    o.forEach(function(val) {
                        if ($this.isArray(val)) {
                          n.push(cloneArray(val));
                        } else if ($this.isRealObject(val)) {
                          n.push(cloneObject(val));
                        } else {
                          n.push(val);
                        }
                      });
                    return n;
                  };

              if ($this.isArray(obj)) {
                newObj = cloneArray(obj);
              } else if ($this.isRealObject(obj)) {
                $this.keys(obj).forEach(function(val) {
                  if ($this.isArray(obj[val])) {
                    newObj[val] = cloneArray(obj[val]);
                  } else if ($this.isRealObject(obj[val])) {
                    newObj[val] = cloneObject(obj[val]);
                  } else {
                    newObj[val] = obj[val];
                  }
                });
              }

              return newObj;
            },
            /**
             * Removes nulls, empty strings, empty arrays, "unknown" enum vales and undefined values from an object
             * @method Tools.shared._#cleanupObject
             * @param obj
             */
            cleanupObject: function(obj) {
              var $this = this,
                  cleanObject = function(o) {
                    if ($this.isRealObject(o)) {
                      $this.keys(o).forEach(function(v) {
                          if ($this.isEmptyField(o[v])) {
                            delete o[v];
                          } else if ($this.isArray(o[v])) {
                            o[v] = cleanArray(o[v]);
                            if ($this.isEmptyField(o[v])) {
                              delete o[v];
                            }
                          } else if ($this.isRealObject(o[v])) {
                            o[v] = cleanObject(o[v]);
                            if ($this.isEmptyField(o[v])) {
                              delete o[v];
                            }
                          }
                        });
                    }
                    return o;
                  },
                  cleanArray = function(o) {
                    $this.clone(o).forEach(function(val) {
                        if ($this.isArray(val)) {
                          o[val] = cleanArray(val);
                          if ($this.isEmptyField(o[val])) {
                            delete o[val];
                          }
                        } else if ($this.isRealObject(val)) {
                          o[val] = cleanObject(val);
                          if ($this.isEmptyField(o[val])) {
                            delete o[val];
                          }
                        } else if ($this.isEmptyField(val)) {
                          delete o[val];
                        }
                      });
                    return o;
                  };
              if ($this.isArray(obj)) {
                obj = cleanArray(obj);
              } else if ($this.isRealObject(obj)) {
                $this.keys(obj).forEach(function(val) {
                  if ($this.isEmptyField(obj[val])) {
                    delete obj[val];
                  } else if ($this.isArray(obj[val])) {
                    obj[val] = cleanArray(obj[val]);
                    if ($this.isEmptyField(obj[val])) {
                      delete obj[val];
                    }
                  } else if ($this.isRealObject(obj[val])) {
                    obj[val] = cleanObject(obj[val]);
                    if ($this.isEmptyField(obj[val])) {
                      delete obj[val];
                    }
                  }
                });
              }
            },
            /**
             * Transforms the properties in an object to an encoded URI query string (works best if the object is in the format of { propertyName: propertyValue, propertyName2: propertyValue2 . . } )
             * @method Tools.shared._#objectToURI
             * @param {object} obj an object whose key/value pairs will be transformed into an encoded URI query string
             * @param {boolean} [dontEncode] a boolean value specifying whether or not to encode the serialized object
             * @returns {string} a string value representing the key/value pairs of the original object into query string format
             */
            objectToURI: function(obj, dontEncode) {
              var $this = this,
                  arr = [],
                  uriComp,
                  paramVal,
                  quotedVals;

              if ($this.isRealObject(obj)) {
                $this.keys(obj).forEach(function(val) {
                  if ($this.isArray(obj[val])) {
                    quotedVals = [];
                    obj[val].forEach(function(v) {
                      quotedVals.push(v);
                    });
                    paramVal = '[' + quotedVals.join(',') + ']';
                  } else {
                    paramVal = obj[val];
                  }

                  if (!!dontEncode) {
                    uriComp = val + '=' + paramVal;
                  } else {
                    uriComp = encodeURIComponent(val) + '=' + encodeURIComponent(paramVal);
                  }

                  arr.push(uriComp);
                });
              }
              return arr.join('&');
            },
            /**
             * Serializes an object's properties into JSON string then URI encoded
             * @method Tools.shared._#objectToParam
             * @param {object} obj an object whose key/value pairs will be serialized into an encoded URI string
             * @param {boolean} [dontEncode] a boolean value specifying whether or not to encode the serialized object
             * @returns {string} a string value representing the serialized object (which is encoded by default)
             */
            objectToParam: function(obj, dontEncode) {
              var $this = this,
                  arr = [],
                  paramVal,
                  quotedValues,
                  strParam;

              if ($this.isRealObject(obj)) {
                $this.keys(obj).forEach(function(val) {
                  if ($this.isArray(obj[val])) {
                    quotedValues = [];
                    obj[val].forEach(function(v) {
                      quotedValues.push(isNaN(v) ? '"' + v + '"' : v);
                    });
                    paramVal = '[' + quotedValues.join(',') + ']';
                  } else {
                    paramVal = isNaN(obj[val]) ? '"' + obj[val] + '"' : obj[val];
                  }
                  arr.push(val + ':' + paramVal);
                });
                strParam = '{' + arr.join(',') + '}';
                return dontEncode ? strParam : encodeURIComponent(strParam);
              } else {
                return '';
              }
            },
            /**
             * Generates a random set of characters of a given length. Can be used to generate a random number of a specific precision or the more standard usage of a random string of characters (may not be numeric).
             * @method Tools.shared._#randomString
             * @param {number} length an integer value indicating the number of characters to be generated for the string
             * @param {string} [charSet=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789] a character set from which to generate a random string (defaults to standard alphanumeric characters)
             * @returns {number|string} a string of randomly generate characters
             */
            randomString: function(length, charSet) {
              var $this = this,
                  str = '',
                  isAllNumeric = false,
                  isNegative = false,
                  defaultCharSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                  parsedLength = parseInt(length, 10),
                  parsedIntCharSet;

              if (parsedLength && !$this.isNaN(parsedLength)) {
                if (!$this.isString(charSet)) {
                  if ($this.isNumber(charSet)) {
                    parsedIntCharSet = parseInt(charSet, 10);
                    if (!$this.isNaN(parsedIntCharSet) && parsedIntCharSet !== 0) {
                      isAllNumeric = true;
                      isNegative = parsedIntCharSet < 0;
                      charSet = '' + Math.abs(parsedIntCharSet) + '';
                    } else {
                      charSet = defaultCharSet;
                    }
                  } else {
                    charSet = defaultCharSet;
                  }
                }

                $this.range(0, parsedLength).forEach(function() {
                  var newChar = Math.round(Math.random() * (charSet.length - 1));

                  // If we are generating a random number, make sure the first digit is not zero
                  if (isAllNumeric && str.length === 0) {
                    while (newChar === '0') {
                      newChar = Math.round(Math.random() * (charSet.length - 1));
                    }
                  }
                  str += charSet.charAt(newChar);
                });
              }
              return isAllNumeric ? isNegative ? -parseInt(str, 10) : parseInt(str, 10) : str;
            },
            /**
             * Returns the current milliseconds
             * @method Tools.shared._#currentMilliseconds
             * @returns {number} an integer value representing the current Date in milliseconds
             */
            currentMilliseconds: function() {
              return Math.floor((new Date()).valueOf() / 1000);
            }
          });
          return $window._;
        }])
        /**
         * underscore.string library. This wrapper is for injecting the underscore.string js library into a controller, service, etc.
         * @class Tools.shared._s
         */
        .factory('_s', ['$window', function($window) {
          return $window._.str;
        }])
        /**
         * CryptoJS library. This wrapper is for injecting the CryptoJS library into a controller, service, etc.
         *  @class Tools.shared.$crypto
         */
        .factory('$crypto', ['$window', function($window) {
          // this is for injecting the underscore.string js library into a controller and aliasing it as something more usable
          return $window.CryptoJS;
        }])
        .config(['localStorageServiceProvider', 'apiCallHandlerServiceProvider', 'errorHandlingServiceProvider', function(localStorageServiceProvider, apiCallHandlerServiceProvider, errorHandlingServiceProvider) {
          localStorageServiceProvider.setStorageType('sessionStorage');
          localStorageServiceProvider.setPrefix('App');

          // Sets up the timeouts and call caches to be managed by the api call handling service for this application
          apiCallHandlerServiceProvider.init(['auth', 'realm', 'realmSearch']);
          errorHandlingServiceProvider.allowMultipleErrors = false;
        }]);
})();
