define(['app'], function (app) {
    app.directive('stopProp', [function() {
        'use strict';

            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.on('click', function (event) {
                        /*event.preventDefault();*/
                        event.stopPropagation();
                    });
                }
            };
    }]);
})