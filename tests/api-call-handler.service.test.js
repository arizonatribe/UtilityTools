(function() {
  'use strict';

  describe('[API Call Handling Service]', function() {
    var apiCallHandlerService, _, _s, $timeout, $q, $http,
        deleteTimeoutsAndCaches = function() {
          apiCallHandlerService.cancelAll();
        };

    beforeEach(module('Tools.shared'));

    beforeEach(inject(function($injector, _$q_, _$timeout_, _apiCallHandlerService_, _$httpBackend_) {
      _ = $injector.get('_');
      _s = $injector.get('_s');
      $q = _$q_;
      $timeout = _$timeout_;
      apiCallHandlerService = _apiCallHandlerService_;
      $http = _$httpBackend_;

      if (apiCallHandlerService && _.isFunction(apiCallHandlerService.init)) {
        apiCallHandlerService.init(['auth', 'test', 'mock']);
      }
    }));

    describe('[basic setup]', function() {
      it('Should be defined', function() {
        expect(apiCallHandlerService).toBeDefined();
      });

      it('Should include several methods', function() {
        expect(apiCallHandlerService.parseCallCollectionName).toBeDefined();
        expect(apiCallHandlerService.parseTimeoutName).toBeDefined();
        expect(apiCallHandlerService.cancelAll).toBeDefined();
        expect(apiCallHandlerService.resetTimeout).toBeDefined();
        expect(apiCallHandlerService.addNewCall).toBeDefined();
        expect(apiCallHandlerService.callMethodAfterTimeout).toBeDefined();
        expect(apiCallHandlerService.callMethodAfterTimeoutPlusCancel).toBeDefined();
        expect(apiCallHandlerService.queuedCall).toBeDefined();
        expect(apiCallHandlerService.anyUnresolvedRequests).toBeDefined();
        expect(apiCallHandlerService.resolveDeferred).toBeDefined();
        expect(apiCallHandlerService.rejectDeferred).toBeDefined();
        expect(apiCallHandlerService.abortUnresolvedRequests).toBeDefined();
        expect(apiCallHandlerService.cleanupFinishedPromises).toBeDefined();

        expect(_.isFunction(apiCallHandlerService.parseCallCollectionName)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.parseTimeoutName)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.cancelAll)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.resetTimeout)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.addNewCall)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.callMethodAfterTimeout)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.callMethodAfterTimeoutPlusCancel)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.queuedCall)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.anyUnresolvedRequests)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.resolveDeferred)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.rejectDeferred)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.abortUnresolvedRequests)).toBeDefined();
        expect(_.isFunction(apiCallHandlerService.cleanupFinishedPromises)).toBeDefined();
      });
    });

    it('Should ensure all call collection names can be parsed by their root name with/without prefix/suffix', function() {
      ['currentAuthCalls', 'currentRealmCalls', 'currentRealmSearchCalls'].forEach(function(value) {
        expect(value.toLowerCase()).toEqual(apiCallHandlerService.parseCallCollectionName(value).toLowerCase());
        expect(value.toLowerCase()).toEqual(apiCallHandlerService.parseCallCollectionName(value.replace('Calls', '')).toLowerCase());
        expect(value.toLowerCase()).toEqual(apiCallHandlerService.parseCallCollectionName(value.replace('current', '')).toLowerCase());
        expect(value.toLowerCase()).toEqual(apiCallHandlerService.parseCallCollectionName(value.replace('current', '').replace('Calls', '')).toLowerCase());
      });
    });

    it('Should ensure call collection names which do not match actual members of the class fail to be parsed', function() {
      expect(apiCallHandlerService.parseCallCollectionName('nonExistantCalls')).toEqual('');
    });

    it('Should ensure call collection name parsing also checks to make sure the corresponding member is an array', function() {
      apiCallHandlerService.currentFakeCollection = 'This is not an array';

      expect(apiCallHandlerService.parseCallCollectionName('Fake')).toEqual('');
      expect(apiCallHandlerService.parseCallCollectionName('currentFakeCalls')).toEqual('');
      expect(apiCallHandlerService.parseCallCollectionName('currentFake')).toEqual('');
      expect(apiCallHandlerService.parseCallCollectionName('FakeCalls')).toEqual('');
    });

    it('Should ensure all timeout names can be parsed by their root name with/without suffix', function() {
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        expect(value).toEqual(apiCallHandlerService.parseTimeoutName(value).replace('Timeout', ''));
      });
    });

    it('Should ensure timeout names which do not match actual members of the class fail to be parsed', function() {
      expect(apiCallHandlerService.parseTimeoutName('nonExistantTimeout')).toEqual('');
    });

    it('Should ensure timeout names which do not match actual members of the class fail to be parsed', function() {
      expect(apiCallHandlerService.parseTimeoutName('nonExistantTimeout')).toEqual('');
    });

    it('Should ensure cancelAll aborts any unresolved promises', function() {
      var id, call;
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        id = apiCallHandlerService.addNewCall(value);

        apiCallHandlerService.cancelAll();

        call = apiCallHandlerService.queuedCall(null, value, id);
        expect(call.Finished).toBeTruthy();
        expect(call.DeferredRequest.promise.$$state.status).toEqual(1);
      });

      $timeout.flush();
    });

    it('Should ensure finished promises are cleared from their caches', function() {
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        apiCallHandlerService.addNewCall(value);
        apiCallHandlerService.cleanupFinishedPromises(value);
        $timeout.flush();
        expect(apiCallHandlerService.anyUnresolvedRequests()).toBeFalsy();
      });
    });

    it('Should ensure unresolved promises are resolved and marked as finished', function() {
      var id, call;
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        id = apiCallHandlerService.addNewCall(value);
        apiCallHandlerService.abortUnresolvedRequests(value);
        call = apiCallHandlerService.queuedCall(true, value, id);
        expect(call.Finished).toBeTruthy();
        expect(call.DeferredRequest.promise.$$state.status).toEqual(1);
      });
    });

    it('Should add a new call to the respective cache and define certain members on the new call', function() {
      var lowestStamp = (new Date()).valueOf();
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        var id = apiCallHandlerService.addNewCall(value),
          call = apiCallHandlerService.queuedCall(null, value, id);
        expect(call.Finished).toBeDefined();
        expect(call.Finished).toEqual(false);
        expect(call.DeferredRequest).toBeDefined();
        expect(call.DeferredRequest.promise).toBeDefined();
        expect(call.ApiRequest).toBeDefined();
        expect(call.ApiRequest).toBeNull();
        expect(call.RequestedAt).toBeDefined();
        expect(lowestStamp <= call.RequestedAt && call.RequestedAt <= (new Date()).valueOf()).toBeTruthy();
      });
    });

    it('Should resolve a deferred promise in a given collection', function() {
      var firstId, secondId, call;
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        firstId = apiCallHandlerService.addNewCall(value);
        secondId = apiCallHandlerService.addNewCall(value);
        apiCallHandlerService.resolveDeferred('resolved', false, value);
        apiCallHandlerService.resolveDeferred('resolved', true, value);

        call = apiCallHandlerService.queuedCall(null, value, firstId);
        expect(call.Finished).toBeTruthy();
        expect(call.DeferredRequest.promise.$$state.status).toEqual(1);
        expect(call.DeferredRequest.promise.$$state.value).toEqual('resolved');
      });
    });

    it('Should fail to resolve a deferred promise if the collection name is invalid', function() {
      var firstId, secondId, call;
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        firstId = apiCallHandlerService.addNewCall(value);
        secondId = apiCallHandlerService.addNewCall(value);
        apiCallHandlerService.resolveDeferred('resolved', false, 'currentFakeCalls');
        apiCallHandlerService.resolveDeferred('resolved', true, 'currentFakeCalls');

        call = apiCallHandlerService.queuedCall(null, value, firstId);
        expect(call.Finished).toBeFalsy();
        expect(call.DeferredRequest.promise.$$state.status).toEqual(0);
      });
    });

    it('Should reject a deferred promise in a given collection', function() {
      var firstId, secondId, call;
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        firstId = apiCallHandlerService.addNewCall(value);
        secondId = apiCallHandlerService.addNewCall(value);
        apiCallHandlerService.rejectDeferred('rejected', false, value);
        apiCallHandlerService.rejectDeferred('rejected', true, value);

        call = apiCallHandlerService.queuedCall(null, value, firstId);
        expect(call.Finished).toBeTruthy();
        expect(call.DeferredRequest.promise.$$state.status).toEqual(2);
        expect(call.DeferredRequest.promise.$$state.value).toEqual('rejected');
      });
    });

    it('Should fail to reject a deferred promise if the collection name is invalid', function() {
      var firstId, secondId, call;
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        firstId = apiCallHandlerService.addNewCall(value);
        secondId = apiCallHandlerService.addNewCall(value);
        apiCallHandlerService.rejectDeferred('rejected', false, 'currentFakeCalls');
        apiCallHandlerService.rejectDeferred('rejected', true, 'currentFakeCalls');

        call = apiCallHandlerService.queuedCall(null, value, secondId);
        expect(call.Finished).toBeFalsy();
        expect(call.DeferredRequest.promise.$$state.status).toEqual(0);
      });
    });

    it('Should confirm there are unresolved request present in a given cache', function() {
      var firstId, secondId, call;
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        firstId = apiCallHandlerService.addNewCall(value);
        secondId = apiCallHandlerService.addNewCall(value);
        apiCallHandlerService.rejectDeferred('rejected', false, 'currentFakeCalls');
        apiCallHandlerService.rejectDeferred('rejected', true, 'currentFakeCalls');

        expect(apiCallHandlerService.anyUnresolvedRequests(value)).toBeTruthy();
        call = apiCallHandlerService.queuedCall(null, value, secondId);
        expect(call.Finished).toBeFalsy();
        expect(call.DeferredRequest.promise.$$state.status).toEqual(0);
      });
    });

    it('Should be unable to confirm there are unresolved request present if the collection name is incorrect', function() {
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        apiCallHandlerService.addNewCall(value);

        expect(apiCallHandlerService.anyUnresolvedRequests('currentFakeCalls')).toBeFalsy();
      });
    });

    it('Should confirm there are unresolved request present in a given cache', function() {
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        apiCallHandlerService.addNewCall(value);

        expect(apiCallHandlerService.anyUnresolvedRequests(value)).toBeTruthy();
      });
    });

    it('Should confirm there are no unresolved request present in a given cache after resolving them', function() {
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        apiCallHandlerService.addNewCall(value);
        apiCallHandlerService.resolveDeferred('resolved', false, value);

        expect(apiCallHandlerService.anyUnresolvedRequests(value)).toBeFalsy();
      });
    });

    it('Should call a method after a given timeout', function() {
      var message = 'hello',
          incrementCounter = function() {
            message += ' world';
          };

      apiCallHandlerService.callMethodAfterTimeout(300, incrementCounter);
      $timeout.flush();
      expect(message).toEqual('hello world');
    });

    it('Should fail to call a method after a given timeout if a timeout number is invalid', function() {
      var message = 'hello',
          incrementCounter = function() {
            message += ' world';
          };

      apiCallHandlerService.callMethodAfterTimeout('300', incrementCounter);
      expect(message).not.toEqual('hello world');
    });

    it('Should fail to return a queued call if the cache name is invalid', function() {
      expect(apiCallHandlerService.queuedCall()).toBeNull();
      expect(apiCallHandlerService.queuedCall(true, 'fakeCalls')).toBeNull();
    });

    it('Should return the call defaults if there are no unresolved calls in a given cache', function() {
      var lowestStamp = (new Date()).valueOf();
      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        var call = apiCallHandlerService.queuedCall(true, value);
        expect(call.Finished).toBeDefined();
        expect(call.Finished).toEqual(false);
        expect(call.DeferredRequest).toBeDefined();
        expect(call.DeferredRequest.promise).toBeDefined();
        expect(call.ApiRequest).toBeDefined();
        expect(call.ApiRequest).toBeNull();
        expect(call.RequestedAt).toBeDefined();
        expect(lowestStamp <= call.RequestedAt && call.RequestedAt <= (new Date()).valueOf()).toBeTruthy();
      });
    });

    it('Should return an unresolved call in a given cache', function() {
      var resolvedCall,
          rejectedCall,
          firstId,
          secondId;

      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        firstId = apiCallHandlerService.addNewCall(value);
        secondId = apiCallHandlerService.addNewCall(value);

        apiCallHandlerService.resolveDeferred('resolved', false, value);
        apiCallHandlerService.rejectDeferred('rejected', true, value);

        resolvedCall = apiCallHandlerService.queuedCall(null, value, firstId);
        rejectedCall = apiCallHandlerService.queuedCall(null, value, secondId);

        expect(resolvedCall.Finished).toBeTruthy();
        expect(rejectedCall.Finished).toBeTruthy();
      });
    });

    it('Should call a method after a given timeout with throttling', function() {
      var count = 0,
          referenceCount = 0,
          longRunningFunction = function() {
            count = 3;
          };

      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        referenceCount += 42;
        apiCallHandlerService.callMethodAfterTimeoutPlusCancel(3000, value, null, longRunningFunction);
        apiCallHandlerService.callMethodAfterTimeoutPlusCancel(3000, value, null, longRunningFunction);
      });
      $timeout.flush();
      expect(referenceCount).not.toEqual(count);
    });

    it('Should fail to call a method after a given timeout with throttling if the timeout number is invalid', function() {
      var count = 0,
          incrementCounter = function() {
            count++;
          };

      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        apiCallHandlerService.callMethodAfterTimeoutPlusCancel('3000', value, null, incrementCounter);
      });

      expect(count).toEqual(0);
    });

    it('Should call a method after a given timeout with throttling, and cancel previous calls and clean up when finished', function() {
      var count = 0,
          ids = [],
          referenceCount = 0,
          longRunningFunction = function() {
            count = 3;
          };

      ['auth', 'realm', 'realmSearch'].forEach(function(value) {
        ids = [];
        ids.push(apiCallHandlerService.addNewCall(value));
        ids.push(apiCallHandlerService.addNewCall(value));
        referenceCount += 42;
        apiCallHandlerService.callMethodAfterTimeoutPlusCancel(3000, value.replace('current', '').replace('Calls', ''), value, longRunningFunction, ids[0]);
        apiCallHandlerService.callMethodAfterTimeoutPlusCancel(3000, value.replace('current', '').replace('Calls', ''), value, longRunningFunction, ids[1]);

        expect(apiCallHandlerService.anyUnresolvedRequests(value)).toBeTruthy();
        expect(_.some(ids, function(id) {
          return id === apiCallHandlerService.queuedCall(null, value, id).RequestId;
        })).toBeTruthy();
      });

      $timeout.flush();

      expect(referenceCount).not.toEqual(count);
    });

  });
})();
