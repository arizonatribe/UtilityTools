(function() {
  'use strict';
  angular.module('Tools.shared')
      .controller('ErrorController', ['errorHandlingService', ErrorController])
      .directive('errorMessageHandler', [ErrorMessageHandlerDirective]);

  /**
   * Formats and places the errors or warnings into the DOM
   * @name Tools.shared.ErrorMessageHandlerDirective
   * @class
   * @returns {{restrict: string, templateUrl: string, controllerAs: string, controller: string, bindToController: boolean}}
   * @constructor
   */
  function ErrorMessageHandlerDirective() {
    return {
      restrict: 'E',
      templateUrl: 'shared/templates/error.template.html',
      controllerAs: 'errorCtrl',
      controller: 'ErrorController',
      bindToController: true
    };
  }

  /**
   * ErrorController Javascript class constructor sets default values for certain members and injects dependencies into the constructed instance
   * @name Tools.shared.ErrorController
   * @param {object} errorHandlingService error handling service
   * @class
   * @constructor
   */
  function ErrorController(errorHandlingService) {

    /**
     * error handling service
     * @property {object}
     * @name Tools.shared.ErrorController#service
     */
    this.service = errorHandlingService;
  }
})();
