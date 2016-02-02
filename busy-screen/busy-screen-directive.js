define(['app'], function (app) {
    app.directive('busyScreen', [function () {
        'use strict';
        
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'busy-screen/busy-screen.html',
            link: function(scope, element, attrs) {
                //scope.message = attrs.waitScreen;
            }
        };
    }]);
});