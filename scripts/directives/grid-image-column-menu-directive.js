define(['shell/shell-directive-module'],
    function (shellDirectiveModule) {
        shellDirectiveModule.directive('gridImageColumnMenu', ['rowSelectionService', 'genericGridCommonService', function (rowSelectionService, genericGridCommonService) {
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
                        genericGridCommonService.closeKendoColumnMenuPopup();
                    };
                }
            };
        }]);
    });