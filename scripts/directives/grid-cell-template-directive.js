define(['app'],
    function (app) {
        app.directive('gridCellTemplate', ['rowSelectionService', function (rowSelectionService) {
            'use strict';

            return {
                restrict: 'A',
                templateUrl: 'shell/partials/generic-list/grid-image-column-menu.html',
                scope: {
                    fieldName: '=model'
                },
                replace: true,
                link: function (scope, element, attrs, ctrl) {
                    scope.selectEntireList = function () {
                        rowSelectionService.selectEntireList();
                    };
                }
            };
        }]);
    });