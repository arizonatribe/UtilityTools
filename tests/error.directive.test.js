(function() {
  'use strict';

  describe('[Error Handling Directive]', function() {
    var _, _s, $rootScope, $scope, element,
            compileDirective = function() {
              inject(function($compile) {
                element = angular.element('<error-message-handler></error-message-handler>');
                $compile(element)($scope);
              });

              $scope.$digest();
            };

    beforeEach(module('Tools.shared'));
    beforeEach(module('shared/templates/error.template.html'));

    beforeEach(inject(function(_errorHandlingService_, $injector, _$rootScope_) {
      $rootScope = _$rootScope_;

      $scope = $rootScope.$new();
      $scope.service = _errorHandlingService_;
      _ = $injector.get('_');
      _s = $injector.get('_s');
    }));

    it('Should verify displaying an error message in the error summary div', function() {
      var errMessage = 'this is an error';

      $scope.service.handleErrors(errMessage);

      compileDirective();
      expect(element.html()).toContain(errMessage);
      expect(element.find('alert').length).toEqual(1);
      expect(element.find('alert').attr('type')).toEqual('danger');
    });

    it('Should verify close event that clears errors is defined for an error message in the error summary div', function() {
      var errMessage = 'this is an error';

      $scope.service.handleErrors(errMessage);

      compileDirective();
      expect(element.html()).toContain(errMessage);
      expect(element.find('alert').attr('close')).toContain('clearError(alert)');
    });

    it('Should verify displaying multiple error messages in the error summary div', function() {
      var errMessage = 'this is an error',
          errMessage2 = 'this is an error as well';

      $scope.service.handleErrors([errMessage, errMessage2]);

      compileDirective();
      expect(element.html()).toContain(errMessage);
      expect(element.html()).toContain(errMessage2);
      expect(element.find('alert').length).toEqual(1);
    });

    it('Should verify error summary div contains no error when no errors in the service collection', function() {
      compileDirective();
      expect(element.find('alert').length).toEqual(0);
    });

    it('Should verify error validation summary div when there are errors', function() {
      var errMessage = 'this is an error',
          errMessage2 = 'this is an error as well';

      $scope.service.handleErrors([errMessage, errMessage2]);

      compileDirective();
      expect(element.find('div').hasClass('validation-summary-errors')).toBeTruthy();
    });

  });
})();
