/**
 * @module Skritter
 * @submodule Collections
 * @param Vocab
 * @author Joshua McFarland
 */
define([
    'models/data/Vocab'
], function(Vocab) {
    /**
     * @class DataVocabs
     */
    var Vocabs = Backbone.Collection.extend({
        /**
         * @method initialize
         */
        initialize: function() {
            this.on('change', function(vocab) {
                vocab.set('changed', skritter.fn.getUnixTime(), {silent: true, sort: false});
                skritter.user.data.addChangedVocabId(vocab.id);
            });
        },
        /**
         * @property {Vocab} model
         */
        model: Vocab,
        /**
         * @method insert
         * @param {Array|Object} vocabs
         * @param {Function} callback
         */
        insert: function(vocabs, callback) {
            skritter.storage.put('vocabs', vocabs, callback);
        },
        /**
         * @method loadAll
         * @param {Function} callback
         */
        loadAll: function(callback) {
            var self = this;
            skritter.storage.getAll('vocabs', function(vocabs) {
                self.add(vocabs, {merge: true, silent: true, sort: false});
                callback();
            });
        }
    });

    return Vocabs;
});