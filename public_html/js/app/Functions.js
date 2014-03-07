/**
 * This class module contains numerous helper functions that are used throughout the application.
 * Additional functions used repeatedly shoud also be stored here. They are stored in the global skritter namespace.
 * 
 * @module Skritter
 * @class Functions
 * @param Bootstrap
 * @param ParamMap
 * @param PinyinConverter
 * @param Recognizer
 * @param Shortstraw
 * @param SimpTradMap
 * @param StrokeMap
 * @author Joshua McFarland
 */
define([
    'functions/Bootstrap',
    'functions/ParamMap',
    'functions/PinyinConverter',
    'functions/Recognizer',
    'functions/Shortstraw',
    'functions/SimpTradMap',
    'functions/StrokeMap'
], function(Bootstrap, ParamMap, PinyinConverter, Recognizer, Shortstraw, SimpTradMap, StrokeMap) {
    /**
     * Parses through and array attempting to convert each value to an int.
     * 
     * @method arrayToInt
     * @param {Array} array
     * @returns {Array}
     */
    var arrayToInt = function(array) {
        return array.map(function(value) {
            return parseInt(value, 10);
        });
    };
    /**
     * @property {Object} bootstrap
     */
    var bootstrap = Bootstrap;
    /**
     * @method boundingRectangle
     * @param {Array} points An array of point values
     * @param {Number} areaWidth The width of the canvas area
     * @param {Number} areaHeight The height of the canvas area
     * @param {Number} pointRadius The radius of
     * @return {Object} The bounds of the calculated rectangle
     */
    var boundingRectangle = function(points, areaWidth, areaHeight, pointRadius) {
        var left = areaWidth;
        var top = 0.0;
        var right = 0.0;
        var bottom = areaHeight;
        for (var i = 0, length = points.length; i < length; i++) {
            var x = points[i].x;
            var y = points[i].y;
            if (x - pointRadius < left)
                left = x - pointRadius;
            if (y + pointRadius > top)
                top = y + pointRadius;
            if (x + pointRadius > right)
                right = x + pointRadius;
            if (y - pointRadius < bottom)
                bottom = y - pointRadius;
        }
        var width = right - left;
        var height = top - bottom;
        var center = {x: width / 2, y: height / 2};
        return {x: left, y: bottom, w: width, h: height, c: center};
    };
    /**
     * @method bytesToSize
     * @param {Number} bytes
     * @returns {String}
     */
    var bytesToSize = function(bytes) {
        var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0)
            return '';
        var value = parseFloat(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, value)).toFixed(2) + ' ' + sizes[value];
    };
    /**
     * Takes a the first character from a string and return whether it is a kana character.
     * 
     * NOTE: It's also currently checking for the unicode tilde because those need to be filtered
     * out of Japanese writings as well. For Chinese it's also filtering out periods, but I don't
     * think they are actually an issue when it comes to rune prompts.
     * 
     * @method isKana
     * @param {String} character
     * @returns {Boolean}
     */
    var isKana = function(character) {
        var charCode = character.charCodeAt(0);
        return (charCode >= 12353 && charCode <= 12436) || (charCode >= 12449 && charCode <= 12539) || charCode === 65374;
    };
    /**
     * Checks to see if one of the approved live server domains is being used or not.
     * 
     * @method isLocal
     * @param {String} hostname
     * @returns {Boolean}
     */
    var isLocal = function(hostname) {
        hostname = hostname ? hostname : document.location.hostname || window.location.hostname || location.hostname;
        if (hostname === 'html5.skritter.com' || hostname === 'html5.skritter.cn')
            return false;
        return true;
    };
    /**
     * @method isNumber
     * @param {Number} number
     * @returns {Boolean}
     */
    var isNumber = function(number) {
        return !isNaN(parseFloat(number)) && isFinite(number);
    };
    /**
     * @method getUnixTime
     * @param {Boolean} milliseconds
     * @returns {Number}
     */
    var getUnixTime = function(milliseconds) {
        var unixtime = new Date().getTime();
        return milliseconds ? unixtime : Math.round(unixtime / 1000);
    };
    /**
     * @property {Object} params
     */
    var params = ParamMap;
    /**
     * @property {Object} pinyin
     */
    var pinyin = PinyinConverter;
    /**
     * @property {Object} recognizer
     */
    var recognizer = new Recognizer();
    /**
     * @property {Object} shortstraw
     */
    var shortstraw = new Shortstraw();
    /**
     * @property {Object} simptrad
     */
    var simptrad = SimpTradMap;
    /**
     * @property {Object} strokes
     */
    var strokes = StrokeMap;
    
    return {
        arrayToInt: arrayToInt,
        bootstrap: bootstrap,
        boundingRectangle: boundingRectangle,
        bytesToSize: bytesToSize,
        getUnixTime: getUnixTime,
        isKana: isKana,
        isLocal: isLocal,
        isNumber: isNumber,
        params: params,
        pinyin: pinyin,
        recognizer: recognizer,
        shortstraw: shortstraw,
        simptrad: simptrad,
        strokes: strokes
    };
});
