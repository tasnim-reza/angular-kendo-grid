define(['shell/shell-directive-module', 'shell/services/generic-list/saved-search-category-service'],
    function (shellDirectiveModule) {
        shellDirectiveModule.directive('gridConfigMenu', ['genericGridCommonService', 'genericGridSettingService', '$rootScope', 'notificationService', 'savedSearchCategoryService', 'gridSearchService',
            function (genericGridCommonService, genericGridSettingService, $rootScope, notificationService, savedSearchCategoryService, gridSearchService) {
                'use strict';

                return {
                    restrict: 'A',
                    templateUrl: 'shell/partials/generic-list/grid-config-menu.html',
                    replace: true,
                    scope: {
                        gridMenuConfig: '=config'
                    },
                    link: function (scope, element, attrs) {
                        var gridElement = '[' + attrs.gridConfigMenu + ']';

                        element = $(element);
                        gridElement = $(gridElement);

                        $('.k-grouping-header').prependTo('.search-tag');

                        element.find('#inputPageSize').on('keyup', function (e) {
                            if (e.keyCode == 13) {
                                scope.$apply(function () {
                                    scope.changePageSize();
                                });
                            }
                        });

                        element.find('#chkColumnSep').on('change', function (e) {
                            colSeparator(this.checked);
                        });

                        function colSeparator(isSeparate) {
                            if (isSeparate) gridElement.removeClass('grid-no-border');
                            else gridElement.addClass('grid-no-border');

                            genericGridCommonService.gridSetting.hasColumnSeparator = isSeparate;
                        }
                        element.find('#chkColumnSep').prop("checked", !$('.k-grid').hasClass('grid-no-border'));
                    },

                    controller: ['$scope', function ($scope) {

                        $scope.viewReport = function () {
                            $rootScope.$broadcast("viewReport");
                        };

                        $scope.increasePageSize = function () {
                            var currentPageSize = genericGridCommonService.grid.dataSource.pageSize();

                            if (currentPageSize < $scope.gridMenuConfig.maxPageSize) {
                                $scope.gridMenuConfig.pageSize++;
                                genericGridCommonService.grid.dataSource.pageSize($scope.gridMenuConfig.pageSize);
                                notificationService.closeNotification(notificationService.notifyType.information);
                            }
                        };

                        $scope.decreasePageSize = function () {
                            var currentPageSize = genericGridCommonService.grid.dataSource.pageSize();

                            if (currentPageSize > $scope.gridMenuConfig.minPageSize) {
                                $scope.gridMenuConfig.pageSize--;
                                genericGridCommonService.grid.dataSource.pageSize($scope.gridMenuConfig.pageSize);
                                notificationService.closeNotification(notificationService.notifyType.information);
                            }
                        };

                        $scope.changePageSize = function () {
                            if (((/^[0-9]+$/).test($scope.gridMenuConfig.pageSize))) {
                                if ($scope.gridMenuConfig.pageSize > $scope.gridMenuConfig.maxPageSize) {
                                    $scope.gridMenuConfig.pageSize =genericGridCommonService.grid.dataSource.pageSize();
                                    notificationService.notify(notificationService.notifyType.information, 'Grid maximum page size ' + $scope.gridMenuConfig.maxPageSize);
                                    return;
                                }
                                if ($scope.gridMenuConfig.pageSize < $scope.gridMenuConfig.minPageSize) {
                                    $scope.gridMenuConfig.pageSize =genericGridCommonService.grid.dataSource.pageSize();
                                    notificationService.notify(notificationService.notifyType.information, 'Grid minimum page size ' + $scope.gridMenuConfig.minPageSize);
                                    return;
                                }
                               genericGridCommonService.grid.dataSource.pageSize($scope.gridMenuConfig.pageSize);
                                notificationService.closeNotification(notificationService.notifyType.information);
                            } else {
                                $scope.setDeafultPageSize();
                            }
                        }; 

                        $scope.resetGridSetting = function () {
                            $scope.gridMenuConfig.resetGridSetting();
                        };

                        $scope.showColumn = function (field) {
                           genericGridCommonService.grid.showColumn(field);
                            $scope.showHideColumns();
                        };

                        $scope.showHideColumns = function () {
                            $scope.gridMenuConfig.hideColumns = _.filter(genericGridCommonService.grid.columns, function (item) { return item.hidden; });
                        };

                        $scope.setDeafultPageSize = function () {
                            $scope.gridMenuConfig.pageSize =genericGridCommonService.grid.dataSource.pageSize();
                        };

                        $scope.refresh = function() {
                            genericGridCommonService.refreshGrid();
                        };

                        //$scope.saveGridSetting = function (enableGridSetting) {
                        //    if (enableGridSetting)
                        //        $scope.gridMenuConfig.saveGridSetting();
                        //};
                    }]
                };

            }]);
    });
