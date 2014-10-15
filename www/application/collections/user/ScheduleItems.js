/**
 * @module Application
 */
define([
    'framework/BaseCollection',
    'models/user/ScheduleItem'
], function(BaseCollection, ScheduleItem) {
    /**
     * @class ScheduleItems
     * @extend BaseCollection
     */
    var ScheduleItems = BaseCollection.extend({
        /**
         * @method initialize
         * @param {Array} models
         * @param {Object} options
         * @constructor
         */
        initialize: function(models, options) {
            options = options ? options : {};
            this.sorted = undefined;
            this.user = options.user;
        },
        /**
         * @property model
         * @type ScheduleItem
         */
        model: ScheduleItem,
        /**
         * @method comparator
         * @param {ScheduleItem} item
         * @returns {Number}
         */
        comparator: function(item) {
            return -item.getReadiness(this.sorted);
        },
        /**
         * @method getActive
         * @param {Array}
         */
        getActive: function() {
            var activeParts = this.user.settings.getActiveParts();
            var activeStyles = this.user.settings.getActiveStyles();
            return this.filter(function(item) {
                if (!item.attributes.vocabIds.length) {
                    return false;
                }
                if (activeParts.indexOf(item.attributes.part) === -1) {
                    return false;
                }
                if (activeStyles.indexOf(item.attributes.style) === -1) {
                    return false;
                }
                return true;
            });
        },
        /**
         * @method getActiveCount
         * @param {Number}
         */
        getActiveCount: function() {
            return this.getActive().length;
        },
        /**
         * @method getDue
         * @returns {Array}
         */
        getDue: function() {
            var now = moment().add(1, 'minutes').unix();
            return this.getActive().filter(function(item) {
                return item.attributes.next < now;
            });
        },
        /**
         * @method getDueCount
         * @returns {Number}
         */
        getDueCount: function() {
            return this.getDue().length;
        },
        /**
         * @method getNew
         * @returns {ScheduleItems}
         */
        getNew: function() {
            return this.getActive().filter(function(item) {
                return item.isNew();
            });
        },
        /**
         * @method getNewCount
         * @returns {Number}
         */
        getNewCount: function() {
            return this.getNew().length;
        },
        /**
         * @method getNext
         * @param {Number} [index]
         * @returns {DataItem}
         */
        getNext: function(index) {
            var activeParts = this.user.settings.getActiveParts();
            var activeStyles = this.user.settings.getActiveStyles();
            index = index ? index : 0;
            for (var i = 0, length = this.sort().length; i < length; i++) {
                var item = this.at(i);
                var itemBase = item.id.split('-')[2];
                if (!item.attributes.vocabIds.length) {
                    continue;
                }
                if (activeParts.indexOf(item.attributes.part) === -1) {
                    continue;
                }
                if (app.user.isChinese() && activeStyles.indexOf(item.attributes.style) === -1) {
                    continue;
                }
                if (this.user.history.hasBase(itemBase)) {
                    continue;
                }
                if (app.user.isJapanese() && item.equals('part', 'rdng') && app.fn.isKana(itemBase)) {
                    item.set('vocabIds', []);
                    continue;
                }
                if (index > 0) {
                    index--;
                    continue;
                }
                return item;
            }
        },
        /**
         * @method insert
         * @param {Array|Object} items
         * @param {Object} [options]
         */
        insert: function(items, options) {
            items = Array.isArray(items) ? items : [items];
            options = options ? options : {};
            options.merge = options.merge === undefined ? true : options.merge;
            options.silent = options.silent === undefined ? false : options.silent;
            options.sort = options.sort === undefined ? true : options.sort;
            var scheduleItems = [];
            for (var i = 0, length = items.length; i < length; i++) {
                var item = items[i];
                scheduleItems.push({
                    id: item.id,
                    interval: item.interval || 0,
                    last: item.last || 0,
                    next: item.next || 0,
                    part: item.part,
                    reviews: item.reviews,
                    sectionIds: item.sectionIds,
                    style: item.style,
                    successes: item.successes,
                    vocabIds: item.vocabIds,
                    vocabListIds: item.vocabListIds
                });
            }
            console.log('UPDATING SCHEDULE:', scheduleItems);
            return this.add(scheduleItems, options);
        },
        /**
         * @method loadAll
         * @param {Function} callback
         */
        loadAll: function(callback) {
            var self = this;
            app.storage.getSchedule(function(data) {
                self.reset();
                self.lazyAdd(data, callback, {silent: true});
            });
        },
        /**
         * @method logSchedule
         * @param {Number} [limit]
         */
        logSchedule: function(limit) {
            for (var i = 0, length = limit || this.sort().length; i < length; i++) {
                var item = this.at(i);
                if (item) {
                    console.log(item.id, item.getReadiness(this.sorted));
                } else {
                    break;
                }
            }
        },
        /**
         * @method sort
         * @returns {ScheduleItems}
         */
        sort: function() {
            this.sorted = moment().unix();
            return BaseCollection.prototype.sort.call(this);
        }
    });

    return ScheduleItems;
});