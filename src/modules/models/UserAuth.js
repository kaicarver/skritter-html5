/**
 * @module Application
 * @submodule Models
 */
define([
    'core/modules/GelatoModel'
], function(GelatoModel) {

    /**
     * @class UserAuth
     * @extends GelatoModel
     */
    var UserAuth = GelatoModel.extend({
        /**
         * @method initialize
         * @param {Object} [attributes]
         * @param {Object} [options]
         * @constructor
         */
        initialize: function(attributes, options) {
            options = options || {};
            this.user = options.user;
            this.on('change', this.cache);
        },
        /**
         * @property defaults
         * @type Object
         */
        defaults: {},
        /**
         * @method cache
         * @returns {UserAuth}
         */
        cache: function() {
            localStorage.setItem(this.user.getCachePath('auth', false), JSON.stringify(this.toJSON()));
            return this;
        },
        /**
         * @method loadCache
         * @returns {UserAuth}
         */
        loadCache: function() {
            var item = localStorage.getItem(this.user.getCachePath('auth', false));
            if (item) {
                this.set(JSON.parse(item), {silent: true});
            }
            return this;
        }
    });

    return UserAuth;

});