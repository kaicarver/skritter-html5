/**
 * @module Application
 */
define([
    'prompts/Prompt',
    'require.text!templates/desktop/prompts/prompt-rune.html'
], function(Prompt, DesktopTemplate) {
    /**
     * @class PromptRune
     * @extends {Prompt}
     */
    var PromptRune = Prompt.extend({
        /**
         * @method initialize
         * @param {Object} [options]
         * @param {PromptController} controller
         * @param {DataReview} review
         * @constructor
         */
        initialize: function(options, controller, review) {
            Prompt.prototype.initialize.call(this, options, controller, review);
            this.character = undefined;
        },
        /**
         * @method render
         * @returns {PromptRune}
         */
        render: function() {
            app.timer.setLimits(30, 15);
            this.$el.html(this.compile(DesktopTemplate));
            Prompt.prototype.render.call(this);
            this.canvas.showGrid().show();
            return this;
        },
        /**
         * @method renderAnswer
         * @returns {PromptRune}
         */
        renderAnswer: function() {
            Prompt.prototype.renderAnswer.call(this);
            this.canvas.disableInput();
            this.elements.fieldDefinition.html(this.vocab.getDefinition());
            this.elements.fieldReading.html(this.vocab.getReading(null, {
                hide: false,
                style: app.user.settings.get('readingStyle')
            }));
            this.elements.fieldWriting.html(this.vocab.getWriting(this.position + 1));
            return this;
        },
        /**
         * @method renderQuestion
         * @returns {PromptRune}
         */
        renderQuestion: function() {
            Prompt.prototype.renderQuestion.call(this);
            this.character = this.review.getCharacter();
            this.canvas.enableInput();
            this.elements.fieldDefinition.html(this.vocab.getDefinition());
            this.elements.fieldReading.html(this.vocab.getReading(null, {
                hide: app.user.settings.get('hideReading'),
                style: app.user.settings.get('readingStyle')
            }));
            this.elements.fieldWriting.html(this.vocab.getWriting(this.position));
            if (app.user.settings.get('audio') && this.vocab.getAudio() && this.review.isFirst()) {
                app.assets.playAudio(this.vocab.getAudio());
            }
            return this;
        },
        /**
         * @method handlePromptClicked
         * @param {Event} event
         */
        handleCanvasClicked: function() {
            if (this.review.getAt('answered')) {
                this.next();
            }
        },
        /**
         * @method handleInputUp
         */
        handleInputUp: function(points, shape) {
            if (points && points.length > 1 && shape) {
                var stroke = this.character.recognizeStroke(points, shape);
                if (stroke) {
                    this.canvas.lastMouseDownEvent = null;
                    this.canvas.tweenShape('stroke', stroke.getUserShape(), stroke.getShape());
                    if (this.character.isComplete()) {
                        this.renderAnswer();
                    }
                }
            }
        },
        /**
         * @method reset
         * @returns {PromptRune}
         */
        reset: function() {
            Prompt.prototype.reset.call(this);
            this.canvas.clearAll();
            return this;
        },
        /**
         * @method resize
         * @returns {PromptRune}
         */
        resize: function() {
            Prompt.prototype.resize.call(this);
            var canvasSize = this.canvas.getWidth();
            var contentHeight = app.router.currentPage.getContentHeight();
            var contentWidth = app.router.currentPage.getContentWidth();
            if (app.isPortrait()) {
                this.$el.css({
                    'border-bottom': '1px solid #000000',
                    'border-right': 'none',
                    height: contentHeight - canvasSize - 1,
                    'overflow-y': 'auto',
                    width: canvasSize
                });
            } else {
                this.$el.css({
                    'border-bottom': 'none',
                    'border-right': '1px solid #000000',
                    height: canvasSize,
                    'overflow-y': 'auto',
                    width: contentWidth - canvasSize - 1
                });
            }
            return this;
        }
    });

    return PromptRune;
});