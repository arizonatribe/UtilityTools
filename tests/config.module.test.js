(function() {
  'use strict';

  describe('[Config module]', function() {
    var configModule;

    beforeEach(function() {
      configModule = angular.module('Tools');
    });

    it('Should be registered', function() {
      expect(configModule).toBeDefined();
    });
  });
})();
