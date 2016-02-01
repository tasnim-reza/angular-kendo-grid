require.config({
    paths: {
        angular: 'lib/angular.min',
        jquery: 'lib/jquery-2.0.3.min',
        kendo: 'lib/kendo.web.min'

    },
    waitSeconds: 0,
    baseUrl: '',
    shim: {
        'angular': { deps: ['jquery'], exports: 'angular' },
        'kendo': { deps: ['jquery'] },
        'app': { deps: ['angular'] },
        'scripts/dependencies': { deps: ['angular'] },
        'lib/underscore.string.min': { deps: ['lib/underscore-min'] },

    },
    priority: [
		"angular",
        'app',
        'scripts/dependencies'
    ]
});

require([
    'jquery',
	'angular',
	'app',
    'kendo',
    'lib/underscore-min',
    'lib/underscore.string.min',
    'scripts/dependencies'

], function ($, angular, app) {
    'use strict';
    angular.element(document).ready(function () {
        angular.bootstrap(document.documentElement, [app['name']]);
        _.mixin(_.str.exports());
        console.log('successfully bootstrapped');
    });
});

