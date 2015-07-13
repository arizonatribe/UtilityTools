(function() {
  'use strict';
  angular.module('Tools.shared')
      .provider('apiCallHandlerService', [ApiCallHandlerService]);

  /**
   * ApiCallHandlerService Javascript class constructor sets default values for certain members and injects dependencies into the constructed instance
   * @name Tools.shared.ApiCallHandlerService
   * @class
   * @constructor
   * @returns {{parseCallCollectionName: Function, parseTimeoutName: Function, cancelAll: Function, resetTimeout: Function, addNewCall: Function, callMethodAfterTimeout: Function, callMethodAfterTimeoutPlusCancel: Function, queuedCall: Function, anyUnresolvedRequests: Function, resolveDeferred: Function, rejectDeferred: Function, abortUnresolvedRequests: Function, cleanupFinishedPromises: Function}}
   */
  function ApiCallHandlerService() {

    /**
     * Holds the named list of timeouts to be managed by the service and is filled when the user runs the init() public constructor
     * @default []
     * @name Tools.shared.ApiCallHandlerService#timeoutNames
     * @type {Array}
     */
    this.timeoutNames = [];
    /**
     * Holds the named list of cached calls to be managed by the service and is filled when the user runs the init() public constructor
     * @default []
     * @name Tools.shared.ApiCallHandlerService#callNames
     * @type {Array}
     */
    this.callNames = [];

    /**
     * Initializes the API Call Handler Service by setting up lists of timeouts and cached calls to be managed by the service
     * @param {string[]} timeouts a collection of string values indicating the name of timeouts to be managed by the service (if only this is supplied, the cached calls will be instantiated to mirror the named timeouts)
     * @param {string[]} [cachedCalls] a collection of string values indicating the names of cached calls to be managed by the service (usually this list just mirrors the timeouts, so leave out this parameter unless there are additional timeouts that will not also have a corresponding cached call collection)
     * @method Tools.shared.ApiCallHandlerService#init
     */
    this.init = function(timeouts, cachedCalls) {
      this.timeoutNames = timeouts instanceof Array ? timeouts : [];
      this.callNames = cachedCalls instanceof Array ? cachedCalls : [];
    };

    this.$get = ['$timeout', '$q', '_', '_s', GetApiCallHandlerService];

    function GetApiCallHandlerService($timeout, $q, _, _s) {

      /**
       * angular $timeout service
       * @property {object}
       * @name Tools.shared.ApiCallHandlerService#$timeout
       */
      this.$timeout = $timeout;
      /**
       * angular $q service
       * @property {object}
       * @name Tools.shared.ApiCallHandlerService#$q
       */
      this.$q = $q;
      /**
       * underscore js library with our custom mixins
       * @property {object}
       * @name Tools.shared.ApiCallHandlerService#_
       */
      this._ = _;
      /**
       * underscore.string library
       * @property {object}
       * @name Tools.shared.ApiCallHandlerService#_s
       */
      this._s = _s;

      var $this = this,
          /**
           * Initializes a collection of timeouts (sets each to zero) and sets them up as members of an object managed by the service.
           * The expectation is the provider's init() method has been run during the app config phase and been supplied with the names of timeouts to be instantiated here.
           * @default {}
           * @name Tools.shared.ApiCallHandlerService#timeouts
           * @type {object}
           * @private
           */
          timeouts = $this._.chain($this.timeoutNames)
            .filter($this._.isString)
            .reject($this._s.isBlank)
            .map(function(timeoutName) {
              return [timeoutName + ($this._s.endsWith(timeoutName.toLowerCase(), 'timeout') ? '' : 'Timeout'), 0];
            })
            .object()
            .value() || {},
            /**
             * Initializes a collection of cached API calls and sets them up as members of an object managed by the service.
             * The expectation is the provider's init() method has been run during the app config phase and been supplied with the names of cached calls to be instantiated here.
             * @default {}
             * @name Tools.shared.ApiCallHandlerService#currentCalls
             * @type {object}
             * @private
             */
            currentCalls = $this._.chain($this._.isArray($this.callNames) && !$this._.isEmpty($this.callNames) ? $this.callNames : $this._.map($this.timeoutNames, function(t) { return t.replace('Timeout', ''); }))
                .filter($this._.isString)
                .reject($this._s.isBlank)
                .map(function(cacheName) {
                  return [($this._s.startsWith(cacheName.toLowerCase(), 'current') ? '' : 'current') +
                  $this._s.titleize(cacheName) +
                  ($this._s.endsWith(cacheName.toLowerCase(), 'calls') ? '' : 'Calls'), []];
                })
                .object()
                .value() || {},
            /**
             * Confirm a given timeout or call name exists in the corresponding timeouts or currentCalls collection
             * @method Tools.shared.ApiCallHandlerService#parseName
             * @param {string} name a string value matching (potentially) a named item in the collection
             * @param {object} collection an object from whose keys a single key name will be sought
             * @returns {string} a string value matching the name of the collection if the name passed in corresponds to a key in the collection object
             */
            parseName = function(name, collection) {
              return $this._.chain(collection)
                        .keys()
                        .find(function(keyName) {
                          return keyName.toLowerCase() === name.toLowerCase();
                        })
                        .value() || '';
            },
            /**
             * Extracts a matching timeout by name. Can be the full name or just the root name for short ("current" will be prepended and "Calls" will be appended to the root if necessary).
             * @method Tools.shared.ApiCallHandlerService#pareseCallCollectionName
             * @param {string} callCollectionName a string value matching (potentially) a named item in the cached call collection object
             * @returns {string} a string value matching the name of the cached call collection if it was found
             */
            parseCallCollectionName = function(callCollectionName) {
              if (callCollectionName) {
                // Parse the collection name, depending on whether it was passed in abbreviated (without a "current" prefix and/or without a "Calls" suffix)
                if ($this._s.startsWith(callCollectionName.toLowerCase(), 'current') && $this._s.endsWith(callCollectionName.toLowerCase(), 'calls')) {
                  callCollectionName = $this._s.trim(callCollectionName);
                } else if ($this._s.startsWith(callCollectionName.toLowerCase(), 'current')) {
                  callCollectionName = $this._s.trim(callCollectionName) + 'Calls';
                } else if ($this._s.endsWith(callCollectionName.toLowerCase(), 'calls')) {
                  callCollectionName = 'current' + $this._s.trim(callCollectionName);
                } else {
                  callCollectionName = 'current' + $this._s.trim(callCollectionName) + 'Calls';
                }

                // Validate the collection name against the actual members of this class
                return parseName(callCollectionName, currentCalls);
              }
              return '';
            },
            /**
             * Extracts a matching timeout by name. Can be the full name or just the root name for short ("Timeout" will be appended to the root if necessary).
             * @method Tools.shared.ApiCallHandlerService#parseTimeoutName
             * @param {string} timeoutName a string value matching (potentially) a named item in the timeouts collection object
             * @returns {string} a string value matching the name of the timeouts collection if it was found
             */
            parseTimeoutName = function(timeoutName) {
              if (timeoutName) {
                // Parse the collection name, depending on whether it was passed in abbreviated (without a "Timeout" suffix)
                if ($this._s.endsWith(timeoutName.toLowerCase(), 'timeout')) {
                  timeoutName = $this._s.trim(timeoutName);
                } else {
                  timeoutName = $this._s.trim(timeoutName) + 'Timeout';
                }

                // Validate the collection name against the actual members of this class
                return parseName(timeoutName, timeouts);
              }
              return '';
            },
            /**
             * Resets timeouts and current call caches
             * @method Tools.shared.ApiCallHandlerService#cancelAll
             */
            cancelAll = function() {
              $this._.chain(timeouts)
                    .keys()
                    .filter(function(name) {
                      return $this._s.endsWith(name, 'Timeout');
                    })
                    .each(function(key) {
                      timeouts[key] = 0;
                    })
                    .value();

              $this._.chain(currentCalls)
                .keys()
                .filter(function(name) {
                  return $this._s.endsWith(name, 'Calls');
                })
                .each(abortUnresolvedRequests, $this)
                .each(cleanupFinishedPromises, $this)
                .value();
            },
            /**
             * Resets an in-progress timeout to zero
             * @method Tools.shared.ApiCallHandlerService#resetTimeout
             * @param {string} timeoutName a string value corresponding to a key name in the timeouts collection object
             */
            resetTimeout = function(timeoutName) {
              var timeoutByName = parseTimeoutName(timeoutName);

              if (timeoutByName) {
                timeouts[timeoutByName] = 0;
              }
            },
            /**
             * Adds a given call object to a specific call collection
             * @method Tools.shared.ApiCallHandlerService#addNewCall
             * @param {string} callCollectionName a string value representing a specific cached call collection being managed by this class
             * @returns {string} an string value in GUID format, uniquely identifying the new call that was added to the particular cached calls collection
             */
            addNewCall = function(callCollectionName) {
              var requestId = $this._.generateUUID(),
                  callCollectionByName = parseCallCollectionName(callCollectionName);

              if (callCollectionByName) {
                currentCalls[callCollectionByName].push({
                  RequestId: requestId,
                  DeferredRequest: $this.$q.defer(),
                  ApiRequest: null,
                  Finished: false,
                  RequestedAt: (new Date()).valueOf()
                });
              }

              return requestId;
            },
            /**
             * Places a callback method within a timeout window
             * @method Tools.shared.ApiCallHandlerService#callMethodAfterTimeout
             * @param {number} [timeoutMilliseconds=150] an integer value representing the number of milliseconds to wait for before executing the callback function
             * @param {function} callback a function to execute after the timeout expires
             */
            callMethodAfterTimeout = function(timeoutMilliseconds, callback) {
              if ($this._.isFunction(callback)) {
                $this.$timeout(function() {
                  callback();
                }, $this._.isNumber(timeoutMilliseconds) && timeoutMilliseconds >= 0 ? parseInt(timeoutMilliseconds, 10) : 150);
              }
            },
            /**
             * Throttles a callback method within a timeout window
             * @method Tools.shared.ApiCallHandlerService#callMethodAfterTimeoutPlusCancel
             * @param {number} [timeoutMilliseconds=150] an integer value representing the number of milliseconds to wait for before executing the callback function
             * @param {string} timeoutName a string value corresponding to a key name in the timeouts collection object
             * @param {string} callCollectionName a string value representing a specific cached call collection being managed by this class, to which this corresponds
             * @param {function} callback a function to execute after the timeout expires
             * @param {string} [requestId] a string value in GUID format corresponding to a specific request to NOT cancel (leave blank to cancel all)
             */
            callMethodAfterTimeoutPlusCancel = function(timeoutMilliseconds, timeoutName, callCollectionName, callback, requestId) {
              var timeoutByName = parseTimeoutName(timeoutName),
                  callCollectionByName = parseCallCollectionName(callCollectionName);

              if (timeoutByName) {
                if ($this._.isFunction(callback)) {
                  if (timeouts[timeoutByName]) {
                    $this.$timeout.cancel(timeouts[timeoutByName]);
                    if (callCollectionByName) {
                      abortUnresolvedRequests(callCollectionByName, requestId);
                    }
                  }
                  timeouts[timeoutByName] = $this.$timeout(function() {
                    callback();
                  }, $this._.isNumber(timeoutMilliseconds) && timeoutMilliseconds >= 0 ? parseInt(timeoutMilliseconds, 10) : 150);

                  if (callCollectionByName) {
                    cleanupFinishedPromises(callCollectionByName);
                  }
                }
              }
            },
            /**
             * Retrieves either the newest or oldest unresolved request to get all alarms, but if none, then creates a default one with a new deferred object
             * @method Tools.shared.ApiCallHandlerService#queuedCall
             * @param {boolean} getLast a boolean value indicating whether to grab the most recent call in this particular collection
             * @param {string} callCollectionName a string value representing a specific cached call collection being managed by this class to which the call being searched for corresponds
             * @param {string} [requestId] a string value in GUID format matching the unique Id for a specific call in this collection, when a specific call needs to be retrieved, not necessarily the most recent call
             * @returns {object|null} a cached call object containing the deferred object, api request, and additional flags and identifiers
             */
            queuedCall = function(getLast, callCollectionName, requestId) {
              var callCollectionByName = parseCallCollectionName(callCollectionName);

              if (callCollectionByName) {
                if (requestId && currentCalls[callCollectionByName] && currentCalls[callCollectionByName].length > 0 && $this._.intersection([requestId], $this._.pluck(currentCalls[callCollectionByName], 'RequestId')).length) {
                  return $this._.findWhere(currentCalls[callCollectionByName], {RequestId: requestId});
                } else if (anyUnresolvedRequests(callCollectionByName)) {
                  if (getLast) {
                    return $this._.last($this._.where(currentCalls[callCollectionByName], {Finished: false})) ||
                        {
                          DeferredRequest: $this.$q.defer(),
                          ApiRequest: null
                        };
                  } else {
                    return $this._.find(currentCalls[callCollectionByName], { Finished: false }) ||
                        {
                          DeferredRequest: $this.$q.defer(),
                          ApiRequest: null
                        };
                  }
                } else {
                  return {
                    RequestId: $this._.generateUUID(),
                    DeferredRequest: $this.$q.defer(),
                    ApiRequest: null,
                    Finished: false,
                    RequestedAt: (new Date()).valueOf()
                  };
                }
              } else {
                return null;
              }
            },
            /**
             * Simple check to see if there are any unresolved requests to get all alarms
             * @method Tools.shared.ApiCallHandlerService#anyUnresolvedRequests
             * @param {string} callCollectionName a string value representing a specific cached call collection being managed by this class in which it will search for unresolved requests
             * @returns {boolean} a boolean value indicating whether there are any unresolved requests in a given cached call collection
             */
            anyUnresolvedRequests = function(callCollectionName) {
              var callCollectionByName = parseCallCollectionName(callCollectionName);

              return !!(currentCalls[callCollectionByName] && currentCalls[callCollectionByName].length > 0 && !$this._.every(currentCalls[callCollectionByName], 'Finished'));
            },
            /**
             * Resolves the most recent or the first unresolved request
             * @method Tools.shared.ApiCallHandlerService#resolveDeferred
             * @param {string|object|array} message an object, string, or collection to resolve with this call
             * @param {boolean} resolveLast a boolean value indicating whether to resolve the most recent call in this particular collection
             * @param {string} callCollectionName a string value representing a specific cached call collection being managed by this class to which the call being resolved corresponds
             * @param {string} [requestId] a string value in GUID format matching the unique Id for a specific call in this collection, when a specific call needs to be retrieved, not necessarily the most recent call
             */
            resolveDeferred = function(message, resolveLast, callCollectionName, requestId) {
              var deferredResolution = queuedCall(resolveLast, callCollectionName, requestId);

              if (deferredResolution) {
                deferredResolution.Finished = true;
                deferredResolution.DeferredRequest.resolve(message);
              }
            },
            /**
             * Rejects the most recent or the first unresolved request
             * @method Tools.shared.ApiCallHandlerService#rejectDeferred
             * @param {string|object|array} message an object, string, or collection to reject with this call
             * @param {boolean} rejectLast a boolean value indicating whether to reject the most recent call in this particular collection
             * @param {string} callCollectionName a string value representing a specific cached call collection being managed by this class to which the call being rejected corresponds
             * @param {string} [requestId] a string value in GUID format matching the unique Id for a specific call in this collection, when a specific call needs to be retrieved, not necessarily the most recent call
             */
            rejectDeferred = function(message, rejectLast, callCollectionName, requestId) {
              var deferredResolution = queuedCall(rejectLast, callCollectionName, requestId);

              if (deferredResolution) {
                deferredResolution.Finished = true;
                deferredResolution.DeferredRequest.reject(message);
              }
            },
            /**
             * Cancels API requests and resolves the last request made
             * @method Tools.shared.ApiCallHandlerService#abortUnresolvedRequests
             * @param {string} callCollectionName a string value representing a specific cached call collection being managed by this class for which all unresolved requests need to be resolved
             * @param {string} skipRequestById a string value in GUID format corresponding to a specific call in the cached calls collection that should NOT be resolved along with the rest
             */
            abortUnresolvedRequests = function(callCollectionName, skipRequestById) {
              var callCollectionByName = parseCallCollectionName(callCollectionName);

              if (callCollectionByName && anyUnresolvedRequests(callCollectionByName)) {
                $this._.chain(currentCalls[callCollectionByName])
                    .reject('Finished')
                    .reject({ RequestId: skipRequestById })
                        .each(function(req) {
                          if (req.ApiRequest && req.ApiRequest.abort) {
                            req.ApiRequest.abort();
                          }
                          if (req.DeferredRequest && req.DeferredRequest.resolve) {
                            req.DeferredRequest.resolve({
                              Status: 'Replacing previous call with the more recent call instead',
                              Code: 204
                            });
                          }
                          req.Finished = true;
                        })
                        .value();
              }
            },
            /**
             * Cleanup the resolved promises
             * @method Tools.shared.ApiCallHandlerService#cleanupFinishedPromises
             * @param {string} callCollectionName a string value representing a specific cached call collection being managed by this class for which all finished calls will be removed
             * @param {number} [timeoutMilliseconds=3000] an integer value representing the number of milliseconds to wait for before cleaning up unfinished promises
             */
            cleanupFinishedPromises = function(callCollectionName, timeoutMilliseconds) {
              var callCollectionByName = parseCallCollectionName(callCollectionName);

              if (callCollectionByName) {
                $this.$timeout(function() {
                  currentCalls[callCollectionByName] = $this._.reject(currentCalls[callCollectionByName], 'Finished');
                }, $this._.isNumber(timeoutMilliseconds) && timeoutMilliseconds >= 0 ? parseInt(timeoutMilliseconds, 10) : 3000);
              }
            };

      return {
        parseCallCollectionName: parseCallCollectionName,
        parseTimeoutName: parseTimeoutName,
        cancelAll: cancelAll,
        resetTimeout: resetTimeout,
        addNewCall: addNewCall,
        callMethodAfterTimeout: callMethodAfterTimeout,
        callMethodAfterTimeoutPlusCancel: callMethodAfterTimeoutPlusCancel,
        queuedCall: queuedCall,
        anyUnresolvedRequests: anyUnresolvedRequests,
        resolveDeferred: resolveDeferred,
        rejectDeferred: rejectDeferred,
        abortUnresolvedRequests: abortUnresolvedRequests,
        cleanupFinishedPromises: cleanupFinishedPromises
      };
    }
  }
})();
