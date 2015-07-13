(function() {
  'use strict';
  angular.module('Tools.shared')
      .factory('storageService', ['_', '_s', '$window', 'localStorageService', '$crypto', StorageService]);

  /**
   * StorageService Javascript class constructor sets default values for certain members and injects dependencies into the constructed instance
   * @name Tools.shared.StorageService
   * @param {object} _ underscore js library with our custom mixins
   * @param {object} _s underscore.string library
   * @param {object} $window angular document wrapper service
   * @param {object} localStorageService localStorage, sessionStorage, and cookie handling service
   * @param {object} $crypto wrapper for the global JSCrypto object
   * @class
   * @constructor
   */
  function StorageService(_, _s, $window, localStorageService, $crypto) {

    /**
     * underscore js library with our custom mixins
     * @property {object}
     * @name Tools.shared.StorageService#_
     */
    this._ = _;
    /**
     * underscore.string library
     * @property {object}
     * @name Tools.shared.StorageService#_s
     */
    this._s = _s;
    /**
     * angular window wrapper service
     * @property {object}
     * @name Tools.shared.StorageService#$window
     */
    this.$window = $window;
    /**
     * local storage, session storage, and cookie handling service
     * @property {object}
     * @name Tools.shared.StorageService#localStorageService
     */
    this.localStorageService = localStorageService;
    /**
     * wrapper for the CryptoJS library
     * @property {object}
     * @name Tools.shared.StorageService#$crypto
     */
    this.$crypto = $crypto;

    var $this = this,
        /**
        * Places an item into Storage
        * @method Tools.shared.StorageService#setItem
        * @param {string} key a string value representing the key name to be associated with the item being placed into storage
        * @param {object} payload an item to place into storage
        * @param {string} [encryptionString] a string value used to encrypt an item prior to placing into storage
        * @param {boolean} [useCookies=false] a boolean value indicating whether or not the item should be placed into cookies (instead of local or session storage)
        */
        setItem = function(key, payload, encryptionString, useCookies) {
          var useEncryption = $this._.isString(encryptionString) && !$this._s.isBlank(encryptionString),
              stringPayload = useEncryption ? $this.$crypto.AES.encrypt(angular.toJson(payload), encryptionString).toString() : angular.toJson(payload);

          if (!$this._.isNullOrUndefined(payload)) {
            if (useCookies) {
              $this.localStorageService.cookie.set(key, stringPayload);
            } else {
              $this.localStorageService.set(key, stringPayload);
            }
          }
        },
        /**
         * Removes a specific item from Local Storage/session storage by its identifying key name
         * @method Tools.shared.StorageService#removeItem
         * @param {string} key a string value representing the key name associated with the item being removed from storage
         */
        removeItem = function(key) {
          if ($this._.isString(key) && !$this._s.isBlank(key)) {
            $this.localStorageService.cookie.remove(key);
            $this.localStorageService.remove(key);
          }
        },
        /**
         * Retrieves an item from storage
         * @method Tools.shared.StorageService#getItem
         * @param {string} key a string value representing the key name associated with the item being retrieved from storage
         * @param {string} [decryptionString] a string value used to decrypt an item that was encrypted when placed into storage with the same encryption string
         * @param {boolean} [useCookies=false] a boolean value indicating whether or not the item is in cookies (instead of local or session storage)
         * @returns {*} the item retrieve from storage associated with the given key
         */
        getItem = function(key, decryptionString, useCookies) {
          var useEncryption = $this._.isString(decryptionString) && !$this._s.isBlank(decryptionString),
              payload = useCookies ? $this.localStorageService.cookie.get(key) : $this.localStorageService.get(key);

          if (!$this._.isNullOrUndefined(payload)) {
            return useEncryption ? angular.fromJson($this.$crypto.AES.decrypt(payload, decryptionString).toString($crypto.enc.Utf8)) : angular.fromJson(payload);
          }

          return null;
        };

    return {
      setItem: setItem,
      removeItem: removeItem,
      getItem: getItem
    };
  }
})();
