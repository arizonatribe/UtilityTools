(function() {
  'use strict';

  describe('[Storage Service]', function() {
    var storageService,
    sessionStorageTestKey = 'session-storage-unit-test',
    fakeData,
    localStoreMock,
    sessionStoreMock,
    _;

    beforeEach(module('Tools.unit-testing.storage'));
    beforeEach(module('Tools.unit-testing.fakeData'));
    beforeEach(module('Tools.shared'));

    beforeEach(inject(function(_storageService_, _fakeData_, _sessionStoreMock_, $injector) {
      storageService = _storageService_;
      fakeData = _fakeData_;
      sessionStoreMock = _sessionStoreMock_;
      _ = $injector.get('_');
    }));

    beforeEach(function() {
      var ss = Object.getOwnPropertyDescriptor(window, 'sessionStorage'),
      sessStore = {};

      if (ss && typeof ss.configurable === 'boolean' && !ss.configurable) {
        spyOn(sessionStorage, 'getItem').and.callFake(function(key) {
          return sessStore[key];
        });
        spyOn(sessionStorage, 'setItem').and.callFake(function(key, value) {
          sessStore[key] = value + '';
          return sessStore[key];
        });
        spyOn(sessionStorage, 'removeItem').and.callFake(function(key) {
          delete sessStore[key];
        });
        spyOn(sessionStorage, 'clear').and.callFake(function() {
          sessStore = {};
        });
      } else {
        Object.defineProperty(window, 'sessionStorage', {
          value: sessionStoreMock,
          configurable: true,
          enumerable: true,
          writable: true
        });
      }
    });

    describe('[basic setup]', function() {
      it('Should be defined', function() {
        expect(storageService).toBeDefined();
      });

      it('Should include several methods', function() {
        expect(storageService.setItem).toBeDefined();
        expect(storageService.removeItem).toBeDefined();
        expect(storageService.getItem).toBeDefined();

        expect(_.isFunction(storageService.setItem)).toBeTruthy();
        expect(_.isFunction(storageService.removeItem)).toBeTruthy();
        expect(_.isFunction(storageService.getItem)).toBeTruthy();
      });
    });

    it('Should manage adding/removing items in session storage correctly', function() {
      var sessionStoragePayload,
          incorrectlyRetrievedItem;

      storageService.setItem(sessionStorageTestKey, fakeData.fakeItem);
      sessionStoragePayload = storageService.getItem(sessionStorageTestKey);
      expect(sessionStoragePayload).toEqual(fakeData.fakeItem);

      incorrectlyRetrievedItem = storageService.getItem('fake-item');
      expect(incorrectlyRetrievedItem).toBeNull();

      storageService.removeItem(sessionStorageTestKey);
      sessionStoragePayload = storageService.getItem(sessionStorageTestKey);
      expect(sessionStoragePayload).toBeNull();
    });

    it('Should get an item from storage or default item if it does not exist', function() {
      var testDefaultItem = storageService.getItem('not-in-storage') || fakeData.fakeItem;

      expect(testDefaultItem).toEqual(fakeData.fakeItem);
    });
  });
})();
