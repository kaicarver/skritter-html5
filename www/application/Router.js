/**
 * @module Application
 */
define([
    'framework/BaseRouter',
    'routers/RouterAccountCreation',
    'routers/RouterLearningCenter',
    'pages/Account',
    'pages/Dashboard',
    'pages/Landing',
    'pages/Login',
    'pages/Settings',
    'pages/Study',
    'pages/Tests'
], function(BaseRouter, RouterAccountCreation, RouterLearningCenter,
            PageAccount, PageDashboard, PageLanding, PageLogin, PageSettings, PageStudy, PageTests) {
    /**
     * @class Router
     * @extends BaseRouter
     */
    var Router = BaseRouter.extend({
        /**
         * @method initialize
         * @constructor
         */
        initialize: function() {
            this.accountCreation = new RouterAccountCreation();
            this.learningCenter = new RouterLearningCenter();
        },
        /**
         * @property routes
         * @type Object
         */
        routes: {
            '': 'showHome',
            'account': 'showAccount',
            'login': 'showLogin',
            'logout': 'handleLogout',
            'settings': 'showSettings',
            'study': 'showStudy',
            'tests': 'showTests',
            '*route': 'defaultRoute'
        },
        /**
         * @method handleLogout
         */
        handleLogout: function() {
            app.user.logout(true);
        },
        /**
         * @method showAccount
         */
        showAccount: function() {
            this.currentPage = new PageAccount();
            this.currentPage.render();
        },
        /**
         * @method showDashboard
         */
        showDashboard: function() {
            this.currentPage = new PageDashboard();
            this.currentPage.render();
        },
        /**
         * @method showHome
         */
        showHome: function() {
            if (app.user.isAuthenticated()) {
                this.showDashboard();
            } else {
                this.showLanding();
            }
        },
        /**
         * @method showLanding
         */
        showLanding: function() {
            this.currentPage = new PageLanding();
            this.currentPage.render();
        },
        /**
         * @method showLogin
         */
        showLogin: function() {
            this.currentPage = new PageLogin();
            this.currentPage.render();
        },
        /**
         * @method showSettings
         */
        showSettings: function() {
            this.currentPage = new PageSettings();
            this.currentPage.render();
        },
        /**
         * @method showStudy
         */
        showStudy: function() {
            this.currentPage = new PageStudy();
            this.currentPage.render();
        },
        /**
         * @method showTests
         */
        showTests: function() {
            this.currentPage = new PageTests();
            this.currentPage.render();
        }
    });

    return Router;
});
