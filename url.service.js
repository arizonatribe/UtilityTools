(function() {
  'use strict';
  angular.module('Tools.shared')
      .factory('urlService', ['_', '_s', 'errorHandlingService', 'validationService', '$sce', '$document', '$location', UrlService]);

  /**
   * UrlService Javascript class constructor sets default values for certain members and injects dependencies into the constructed instance
   * @name Tools.shared.UrlService
   * @class
   * @param {object} _ underscore js library with our custom mixins
   * @param {object} _s underscore.string library
   * @param {object} errorHandlingService error handling service
   * @param {object} validationService input validation service
   * @param {object} $sce angular $sce service
   * @param {object} $document angular document wrapper service
   * @param {object} $location angular window.location wrapper service
   * @constructor
   */
  function UrlService(_, _s, errorHandlingService, validationService, $sce, $document, $location) {

    /**
     * underscore js library with our custom mixins
     * @property {object}
     * @name Tools.shared.UrlService#_
     */
    this._ = _;
    /**
     * underscore js library with our custom mixins
     * @property {object}
     * @name Tools.shared.UrlService#_s
     */
    this._s = _s;
    /**
     * error handling service
     * @property {object}
     * @name Tools.shared.UrlService#errorHandlingService
     */
    this.errorHandlingService = errorHandlingService;
    /**
     * basic form input validation service
     * @property {object}
     * @name Tools.shared.UrlService#validationService
     */
    this.validationService = validationService;
    /**
     * angular strict contextual escaping service
     * @property {object}
     * @name Tools.shared.UrlService#$sce
     */
    this.$sce = $sce;
    /**
     * angular document wrapper service
     * @property {object}
     * @name Tools.shared.UrlService#$document
     */
    this.$document = $document;
    /**
     * angular window.location wrapper service
     * @property {object}
     * @name Tools.shared.UrlService#$location
     */
    this.$location = $location;

    var $this = this,
        /**
         * Returns back a URL if it passes a validation test
         * @method Tools.shared.UrlService#parseValidUrl
         * @param {string} url a string value representing a URL to check for validity
         * @returns {string} a valid URL string or blank if invalid
         */
          parseValidUrl = function(url) {
            return url && $this.validationService.isValid('url', url, true) ? url : '';
          },
          /**
           * Retrieves the URL's domain
           * @method Tools.shared.UrlService#getDomain
           * @param {string} url a string value representing a URL from which to parse the domain (or host) from
           * @returns {string} a string value representing the URL's domain (or blank if none found)
           */
          getDomain = function(url) {
            var urlArray = parseValidUrl(url).split('/');

            if (urlArray && urlArray.length >= 3) {
              return $this._.first(urlArray, 3).join('/');
            }

            return '';
          },
          /**
           * Makes sure that the page that referred us here is the one being requested to send back to
           * @method Tools.shared.UrlService#originatingDomainMatchesReferrer
           * @param {string} url a string value representing the URL that is claimed to come from the domain that sent the user to their current location
           * @returns {boolean} a boolean value indicating whether or not the domain that sent the user here matches this particular URL value
           */
          originatingDomainMatchesReferrer = function(url) {
            var referringUrl = $this.$document[0].referrer.split('/'),
                communicatingWithURL = getDomain(url);

            if (communicatingWithURL && referringUrl && referringUrl.length >= 3) {
              // Referring URL will have the protocol, a double-slash, followed by the domain name
              referringUrl = $this._.first(referringUrl, 3).join('/');

              // If the domain the token information is being sent to matches the domain the user came from
              if (communicatingWithURL === referringUrl) {
                return true;
              } else {
                $this.errorHandlingService.handleErrors({Message: 'The page you came from (or are hosting this login page from) does not match the domain configured to send you back to. For security purposes, cannot log you in.'});
              }
            } else if ($this._s.isBlank(referringUrl) && isHttps()) {
              $this.errorHandlingService.handleErrors({Message: 'It appears the page you came from is not using SSL. For security purposes, cannot log you in.'});
            }
            return false;
          },
          /**
           * Parses a valid URL and returns it back as a trusted resource
           * @method Tools.shared.UrlService#getTrustedUrl
           * @param {string} url a string value representing the URL to evaluate and mark as a trusted resource
           * @returns {object|null} an object from which a directive can parse a URL marked as a trusted resource (null if unsuccessful)
           */
          getTrustedUrl = function(url) {
            return originatingDomainMatchesReferrer(url) ? $this.$sce.trustAsResourceUrl(url) : null;
          },
          /**
           * Checks if a URL is using HTTPS
           * @method Tools.shared.UrlService#isHttps
           * @param {string} [url] a string value whose protocol prefix will be checked (excluding this parameter will check the protocol on the current window location url)
           * @returns {boolean} a boolean value indicating whether or not the given URL uses the https protocol
           */
          isHttps = function(url) {
            return $this._.isString(url) ? parseValidUrl(url).split('/')[0].toLowerCase().replace(':', '') === 'https' : $this.$location.protocol() === 'https';
          };

    return {
      parseValidUrl: parseValidUrl,
      getDomain: getDomain,
      originatingDomainMatchesReferrer: originatingDomainMatchesReferrer,
      getTrustedUrl: getTrustedUrl,
      isHttps: isHttps
    };
  }
})();
