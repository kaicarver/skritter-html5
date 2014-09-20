/**
 * @module Application
 */
define([
    'framework/BaseView'
], function(BaseView) {
    /**
     * @class PromptCanvas
     */
    var PromptCanvas = BaseView.extend({
        /**
         * @method initialize
         * @constructor
         */
        initialize: function() {
            this.canvasSize = 0;
            this.baseStrokeSize = 12;
            this.fadeSpeed = 200;
            this.grid = true;
            this.maxCanvasSize = 600;
            this.mouseDownEvent = null;
            this.mouseDownTimer = null;
            this.mouseMoveEvent = null;
            this.mouseUpEvent = null;
            this.previousMouseDownEvent = null;
            this.stage = undefined;
            this.strokeCaps = 'round';
            this.strokeColor = '#000000';
            this.strokeJoints = 'round';
            this.strokeSize = 12;
        },
        /**
         * @method render
         * @returns {PromptCanvas}
         */
        render: function() {
            this.stage = this.createStage();
            this.$el.html(this.stage.canvas);
            createjs.Ticker.addEventListener('tick', this.stage);
            createjs.Touch.enable(this.stage);
            createjs.Ticker.setFPS(64);
            this.createLayer('grid');
            this.createLayer('background');
            this.createLayer('stroke');
            this.createLayer('overlay');
            this.createLayer('input');
            this.resize().hide();
            return this;
        },
        /**
         * @property {Object} events
         */
        events: function() {
            return _.extend({}, BaseView.prototype.events, {
                'vmousedown.Canvas .prompt-canvas': 'triggerCanvasMouseDown',
                'vmouseup.Canvas .prompt-canvas': 'triggerCanvasMouseUp'
            });
        },
        /**
         * @method clearAll
         * @returns {PromptCanvas}
         */
        clearAll: function() {
            for (var i = 0, length = this.stage.children.length; i < length; i++) {
                this.stage.children[i].removeAllChildren();
            }
            this.resize();
            this.stage.update();
            return this;
        },
        /**
         * @method clearLayer
         * @param {String} layerName
         * @returns {PromptCanvas}
         */
        clearLayer: function(layerName) {
            this.getLayer(layerName).removeAllChildren();
            this.stage.update();
            return this;
        },
        /**
         * @method createLayer
         * @param {String} name
         * @returns {createjs.Container}
         */
        createLayer: function(name) {
            var layer = new createjs.Container();
            layer.name = 'layer-' + name;
            this.stage.addChild(layer);
            return layer;
        },
        /**
         * @method createStage
         * @returns {createjs.Stage}
         */
        createStage: function() {
            var canvas = document.createElement('canvas');
            var stage = new createjs.Stage(canvas);
            canvas.className = 'prompt-canvas';
            stage.autoClear = true;
            stage.enableDOMEvents(true);
            return stage;
        },
        /**
         * @method disableInput
         * @returns {PromptCanvas}
         */
        disableInput: function() {
            this.$el.off('.Input');
            return this;
        },
        /**
         * @method drawCircle
         * @param {String} layerName
         * @param {Object} options
         * @returns {PromptCanvas}
         */
        drawCircle: function(layerName, x, y, radius, options) {
            var layer = this.getLayer(layerName);
            var circle = new createjs.Shape();
            options = options ? options : {};
            circle.graphics.beginFill(options.fill ? options.fill : '#000000');
            circle.graphics.drawCircle(x, y, radius);
            this.getLayer(layerName).addChild(circle);
            this.stage.update();
            return this;
        },
        /**
         * @method drawGrid
         * @param {Object} [options]
         * @returns {PromptCanvas}
         */
        drawGrid: function(options) {
            var grid = new createjs.Shape();
            this.clearLayer('grid');
            options = options ? options : {};
            options.gridLineWidth= options.gridLineWidth ? options.gridLineWidth : 'round';
            options.strokeJointStyle= options.strokeJointStyle ? options.strokeJointStyle : 'round';
            options.color= options.color ? options.color : '#d3d3d3';
            grid.graphics.beginStroke(options.color).setStrokeStyle(this.gridLineWidth, options.strokeCapStyle, options.strokeJointStyle);
            grid.graphics.moveTo(this.canvasSize / 2, 0).lineTo(this.canvasSize / 2, this.canvasSize);
            grid.graphics.moveTo(0, this.canvasSize / 2).lineTo(this.canvasSize, this.canvasSize / 2);
            grid.graphics.moveTo(0, 0).lineTo(this.canvasSize, this.canvasSize);
            grid.graphics.moveTo(this.canvasSize, 0).lineTo(0, this.canvasSize);
            grid.graphics.endStroke();
            grid.cache(0, 0, this.canvasSize, this.canvasSize);
            this.getLayer('grid').addChild(grid);
            this.stage.update();
            return this;
        },
        /**
         * @method drawShape
         * @param {String} layerName
         * @param {createjs.Shape} shape
         * @param {Object} options
         * @returns {PromptCanvas}
         */
        drawShape: function(layerName, shape, options) {
            options = options ? options : {};
            options.alpha= options.alpha ? options.alpha : undefined;
            options.color= options.color ? options.color : undefined;
            if (options.alpha) {
                shape.alpha = options.alpha;
            }
            if (options.color) {
                this.injectColor(shape, options.color);
            }
            this.getLayer(layerName).addChild(shape);
            this.stage.update();
            return this;
        },
        /**
         * @method enableInput
         * @returns {PromptCanvas}
         */
        enableInput: function() {
            var self = this;
            var oldPoint, oldMidPoint, points, marker;
            this.disableInput();
            this.$el.on('vmousedown.Input', down);
            function down() {
                points = [];
                marker = new createjs.Shape();
                marker.graphics.setStrokeStyle(self.strokeSize, self.strokeCaps, self.strokeJoints).beginStroke(self.strokeColor);
                oldPoint = oldMidPoint = new createjs.Point(self.stage.mouseX, self.stage.mouseY);
                self.getLayer('input').addChild(marker);
                self.$el.on('vmouseout.Input vmouseup.Input', up);
                self.$el.on('vmousemove.Input', move);
            }
            function move() {
                var point = new createjs.Point(self.stage.mouseX, self.stage.mouseY);
                var midPoint = {x: oldPoint.x + point.x >> 1, y: oldPoint.y + point.y >> 1};
                marker.graphics.moveTo(midPoint.x, midPoint.y).curveTo(oldPoint.x, oldPoint.y, oldMidPoint.x, oldMidPoint.y);
                oldPoint = point;
                oldMidPoint = midPoint;
                points.push(point);
                self.stage.update();
            }
            function up() {
                marker.graphics.endStroke();
                self.$el.off('vmousemove.Input', move);
                self.$el.off('vmouseout.Input vmouseup.Input', up);
                self.fadeShape('background', marker.clone(true));
                self.getLayer('input').removeAllChildren();
            }
        },
        /**
         * @method fadeShapeOut
         * @param {String} layerName
         * @param {createjs.Shape} shape
         * @param {Object} [options]
         * @param {Function} [callback]
         */
        fadeShape: function(layerName, shape, options, callback) {
            var layer = this.getLayer(layerName);
            options = options ? options : {};
            options.alpha = options.alpha ? options.alpha : undefined;
            options.color = options.color ? options.color : undefined;
            options.milliseconds = options.milliseconds ? options.milliseconds : this.fadeSpeed;
            if (options.alpha) {
                shape.alpha = options.alpha;
            }
            if (options.color) {
                this.injectColor(shape, options.color);
            }
            layer.addChild(shape);
            createjs.Tween.get(shape).to({alpha: 0}, options.milliseconds, createjs.Ease.sineOut).call(function() {
                layer.removeChild(shape);
                if (typeof callback === 'function') {
                    callback();
                }
            });
        },
        /**
         * @method getScaledStrokeSize
         * @returns {Number}
         */
        getScaledStrokeSize: function() {
            return this.baseStrokeSize * (this.canvasSize / this.maxCanvasSize);
        },
        /**
         * @method getLayer
         * @param {String} layerName
         * @returns {createjs.Container}
         */
        getLayer: function(layerName) {
            return this.stage.getChildByName('layer-' + layerName);
        },
        /**
         * @method hide
         * @returns {PromptCanvas}
         */
        hide: function() {
            this.el.style.display = 'none';
            return this;
        },
        /**
         * @method hideGrid
         * @returns {PromptCanvas}
         */
        hideGrid: function() {
            this.getLayer('grid').visible = false;
            return this;
        },
        /**
         * @method injectColor
         * @param {createjs.Container|createjs.Shape} object
         * @param {String} color
         */
        injectColor: function(object, color) {
            var customFill = new createjs.Graphics.Fill(color);
            var customStroke = new createjs.Graphics.Stroke(color);
            function inject(object) {
                if (object.children) {
                    for (var i = 0, length = object.children.length; i < length; i++) {
                        inject(object.children[i]);
                    }
                } else if (object.graphics) {
                    object.graphics._dirty = true;
                    object.graphics._fill = customFill;
                    object.graphics._stroke = customStroke;
                }
            }
            inject(object);
        },
        /**
         * @method remove
         */
        remove: function() {
            View.prototype.remove.call(this);
        },
        /**
         * @method resize
         * @param {Number} [size]
         * @returns {PromptCanvas}
         */
        resize: function(size) {
            this.canvasSize = size > this.maxCanvasSize ? this.maxCanvasSize : size;
            this.stage.canvas.height = this.canvasSize;
            this.stage.canvas.width = this.canvasSize;
            this.strokeSize = this.getScaledStrokeSize();
            if (this.grid) {
                this.drawGrid();
            } else {
                this.clearLayer('grid');
            }
            return this;
        },
        /**
         * @method show
         * @returns {PromptCanvas}
         */
        show: function() {
            this.el.style.display = 'block';
            return this;
        },
        /**
         * @method showGrid
         * @returns {PromptCanvas}
         */
        showGrid: function() {
            this.getLayer('grid').visible = true;
            return this;
        },
        /**
         * @method triggerClick
         * @param {Object} event
         */
        triggerCanvasClick: function(event) {
            this.trigger('canvas:click', event);
        },
        /**
         * @method triggerCanvasClickHold
         * @param {Object} event
         */
        triggerCanvasClickHold: function(event) {
            this.trigger('canvas:clickhold', event);
        },
        /**
         * @method triggerCanvasDoubleClick
         * @param {Object} event
         */
        triggerCanvasDoubleClick: function(event) {
            this.trigger('canvas:doubleclick', event);
        },
        /**
         * @method triggerCanvasMouseDown
         * @param {Object} event
         */
        triggerCanvasMouseDown: function(event) {
            this.mouseDownEvent = event;
            this.trigger('canvas:mousedown', event);
            if (this.previousMouseDownEvent) {
                var elapsed = this.mouseDownEvent.timeStamp - this.previousMouseDownEvent.timeStamp;
                if (elapsed > 20 && elapsed < 400) {
                    var lastPosition = new createjs.Point(this.previousMouseDownEvent.pageX, this.previousMouseDownEvent.pageY);
                    var currentPosition = new createjs.Point(this.mouseDownEvent.pageX, this.mouseDownEvent.pageY);
                    if (app.fn.getDistance(lastPosition, currentPosition) <= 10) {
                        this.triggerCanvasDoubleClick(event);
                    }
                }
            }
            this.$(this.elements.holder).on('vmousemove.Canvas', _.bind(function(event) {
                this.mouseMoveEvent = event;
            }, this));
            this.mouseDownTimer = window.setTimeout(_.bind(function() {
                var distance = 0;
                if (this.mouseMoveEvent) {
                    var startPosition = {x: this.mouseDownEvent.pageX, y: this.mouseDownEvent.pageY};
                    var endPosition = {x: this.mouseMoveEvent.pageX, y: this.mouseMoveEvent.pageY};
                    distance = app.fn.getDistance(startPosition, endPosition);
                }
                if (distance <= 10) {
                    this.triggerCanvasClickHold(event);
                }
            }, this), 1000);
        },
        /**
         * @method triggerClick
         * @param {Object} event
         */
        triggerCanvasMouseUp: function(event) {
            window.clearTimeout(this.mouseDownTimer);
            this.$(this.elements.holder).off('vmousemove.Canvas');
            this.previousMouseDownEvent = this.mouseDownEvent;
            this.mouseMoveEvent = null;
            this.mouseUpEvent = event;
            if (this.mouseDownEvent) {
                var startPosition = new createjs.Point(this.mouseDownEvent.pageX, this.mouseDownEvent.pageY);
                var endPosition = new createjs.Point(this.mouseUpEvent.pageX, this.mouseUpEvent.pageY);
                var angle = app.fn.getAngle(startPosition, endPosition);
                var distance = app.fn.getDistance(startPosition, endPosition);
                var duration = this.mouseUpEvent.timeStamp - this.mouseDownEvent.timeStamp;
                if (distance <= 10 && (duration > 20 && duration < 400)) {
                    this.triggerCanvasClick(event);
                } else if (distance > 100 && angle < -70 && angle > -110) {
                    this.triggerSwipeUp(event);
                } else {
                    this.trigger('canvas:mouseup', event);
                }
            }
        },
        /**
         * @method triggerInputDown
         * @param {Object} event
         * @param {Object} point
         */
        triggerInputDown: function(event, point) {
            this.trigger('input:down', event, point);
        },
        /**
         * @method triggerInputUp
         * @param {Object} event
         * @param {Array} points
         * @param {createjs.Shape} shape
         */
        triggerInputUp: function(event, points, shape) {
            this.trigger('input:up', event, points, shape);
        },
        /**
         * @method triggerSwipeUp
         * @param {Object} event
         */
        triggerSwipeUp: function(event) {
            this.trigger('canvas:swipeup', event);
        },
        /**
         * @method tweenCharacter
         * @param {String} layerName
         * @param {CanvasCharacter} character
         * @param {Function} [callback]
         */
        tweenCharacter: function(layerName, character, callback) {
            var position = 0;
            function tweenComplete() {
                position++;
                if (position >= character.length) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            }
            for (var i = 0, length = character.length; i < length; i++) {
                var stroke = character.at(i);
                this.tweenShape(layerName, stroke.getUserShape(), stroke.inflateShape(), tweenComplete);
            }
        },
        /**
         * @method tweenShape
         * @param {String} layerName
         * @param {createjs.Shape} fromShape
         * @param {createjs.Shape} toShape
         * @param {Function} [callback]
         */
        tweenShape: function(layerName, fromShape, toShape, callback) {
            this.getLayer(layerName).addChild(fromShape);
            this.stage.update();
            createjs.Tween.get(fromShape).to({
                x: toShape.x,
                y: toShape.y,
                scaleX: toShape.scaleX,
                scaleY: toShape.scaleY,
                rotation: toShape.rotation
            }, 300, createjs.Ease.backOut).call(function() {
                if (typeof callback === 'function') {
                    callback();
                }
            });
        }
    });

    return PromptCanvas;
});