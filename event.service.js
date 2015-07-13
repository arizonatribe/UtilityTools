(function() {
  'use strict';
  angular.module('Tools.shared')
      .provider('eventService', [EventService]);

  /**
   * EventService Javascript class constructor sets default values for certain members and injects dependencies into the constructed instance
   * @name Tools.shared.EventService
   * @class
   * @constructor
   * @returns {{getEventKeyCode: Function, getEventName: Function, isEarlierThan: Function, isLaterThan: Function, isValidEvent: Function, killEvent: Function}}
   */
  function EventService() {

    /**
     * A list of event types used in the service. Add to these during app config with the addToEventList() method
     * @property {Array}
     * @name Tools.shared.EventService#eventTypes
     * @type {object[]}
     */
    this.eventTypes = [
        {id: 9, name: 'TAB'},
        {id: 13, name: 'ENTER'},
        {id: 27, name: 'ESCAPE'},
        {id: 40, name: 'DOWN'},
        {id: 38, name: 'UP'},
        {id: 'dblclick', name: 'DOUBLE-CLICK'}
    ];

    /**
     * Adds event types to the default list of event types managed by this service.
     * Set these during app config stage.
     * @method Tools.shared.EventService#addToEventList
     * @param {number|string} id an integer value corresponding to either the keycode or a string name of the event (ie, dblclick)
     * @param {string} name a programmer-friendly display name for the event
     */
    this.addToEventList = function(id, name) {
      if (id && name) {
        this.eventTypes.push({ id: id, name: name });
      }
    };

    this.$get = ['_', function(_) {
      /**
       * underscore js library with our custom mixins
       * @property {object}
       * @name Tools.shared.EventService#_
       */
      this._ = _;

      var $this = this,
          /**
           * The event types used by this service for reference
           * @property {object[]}
           * @type {object[]}
           * @private
           */
          eventTypes = angular.copy($this.eventTypes),
          /**
           * Retrieves the key code for a given keydown/keypress/keyup event
           * @method Tools.shared.EventService#getEventKeyCode
           * @param {object} $event a standard event object from which to retrieve the key code
           * @returns {number|string} a number corresponding to the event keycode or non-key name
           */
           getEventKeyCode = function($event) {
             var match;

             if (isValidEvent($event) && $this._.has($event, 'keyCode')) {
               match = $this._.findWhere(eventTypes, { id: $event.keyCode });
               if (match) { return match.id; }
             }
           },
            /**
             * Retrieves the name of the event (corresponds to the event type if not a key event, otherwise the the particular key)
             * @method Tools.shared.EventService#getEventName
             * @param {object} $event a standard event object from which to retrieve the name
             * @returns {string} a string value representing the event display name
             */
           getEventName = function($event) {
             var match,
                 name;

             if (isValidEvent($event)) {
               if ($this._.has($event, 'keyCode')) {
                 match = $this._.findWhere(eventTypes, { id: $event.keyCode || $event.type });
               } else if ($this._.has($event, 'type')) {
                 match = $this._.findWhere(eventTypes, { id: $event.type.toLowerCase() });
               }

               if (match) { name = match.name; }
             }

             return name;
           },
            /**
             * Checks if an event occurred earlier than a given time (or current time if not provided)
             * @method Tools.shared.EventService#isEarlierThan
             * @param {object} $event a standard event object from which to check the event date/time
             * @param {date} time a datetime value against which to validate the event time
             * @returns {boolean} a boolean indicating whether or not the event is earlier than a given datetime
             */
            isEarlierThan = function($event, time) {
              var timeValue;

              if (isValidEvent($event)) {
                if ($this._.isDate(time)) {
                  timeValue = time.valueOf();
                } else if ($this._.isNumber(time) || $this._.isString(time)) {
                  timeValue = parseInt(time, 10);
                } else if ($this._.isNullOrUndefined(time)) {
                  timeValue = (new Date()).valueOf();
                }
                if (timeValue) {
                  return $event.timeStamp < time;
                }
              }
            },
            /**
             * Checks if an event occurred later than a given time (or current time if not provided)
             * @method Tools.shared.EventService#isLaterThan
             * @param {object} $event a standard event object from which to check the event date/time
             * @param {date} time a datetime value against which to validate the event time
             * @returns {boolean} a boolean indicating whether or not the event is later than a given datetime
             */
            isLaterThan = function($event, time) {
              var timeValue;

              if (isValidEvent($event)) {
                if ($this._.isDate(time)) {
                  timeValue = time.valueOf();
                } else if ($this._.isNumber(time) || $this._.isString(time)) {
                  timeValue = parseInt(time, 10);
                } else if ($this._.isNullOrUndefined(time)) {
                  timeValue = (new Date()).valueOf();
                }
                if (timeValue) {
                  return $event.timeStamp > time;
                }
              }
            },
            /**
             * Makes sure this event object is valid, containing the expected methods
             * @method Tools.shared.EventService#isValidEvent
             * @param {object} $event a standard event object to check for valid identifiers
             * @returns {boolean} a boolean indicating whether or not a given event is valid
             */
            isValidEvent = function($event) {
              return !$this._.isNullOrUndefined($event) &&
                  $event.preventDefault && $this._.isFunction($event.preventDefault) &&
                  $event.stopPropagation && $this._.isFunction($event.stopPropagation) &&
                  $this._.has($event, 'type') && $this._.isString($event.type) &&
                  $this._.has($event, 'target') &&
                  $this._.has($event, 'timeStamp') && $this._.isNumber($event.timeStamp) && $event.timeStamp > 787510420252 && $event.timeStamp <= (new Date()).valueOf() &&
                  (($event.type !== 'keydown' && $event.type !== 'keypress' && $event.type !== 'keyup') || ($this._.isNumber($event.keyCode) && $event.keyCode >= 0));
            },
            /**
             * Stops propagation of events further along in the DOM and cancels this particular event (if it is cancelable)
             * @method Tools.shared.EventService#killEvent
             * @param {object} $event a standard event object on which to stop propagation and prevent default behavior
             */
            killEvent = function($event) {
              if (isValidEvent($event)) {
                if ($event.cancelable) { $event.preventDefault(); }
                $event.stopPropagation();
              }
            };

      return {
        getEventKeyCode: getEventKeyCode,
        getEventName: getEventName,
        isEarlierThan: isEarlierThan,
        isLaterThan: isLaterThan,
        isValidEvent: isValidEvent,
        killEvent: killEvent
      };
    }];
  }
})();
