define(['app'], function (app) {
        app.directive('kendoGrid', [
            'genericGridSettingService',
            'genericGridService',
            '$compile',
            'rowSelectionService',
            'genericGridCommonService',
            'genericGridColumnService',
            'gridSearchService',
            '$rootScope',
            function (
                genericGridSettingService,
                genericGridService,
                $compile,
                rowSelectionService,
                genericGridCommonService,
                genericGridColumnService,
                gridSearchService,
                $rootScope) {
                'use strict';

                return {
                    restrict: 'A',
                    scope: {
                        config: '=kendoGrid'
                    },
                    link: function (scope, element, attrs) {
                        var contextMenuTemplate = '<div grid-context-menu="kendo-grid"></div>',
                            detailsGridTemplate = '<div class="container"></div>',
                            gridService;

                        if (!angular.isDefined(scope.config)) throw Error('Grid configuration is not defined.');

                        if (scope.config.promise) {
                            scope.config.promise.then(function () {
                                genericGridSettingService.getConfig(scope.config).then(function (data) { initGrid(data); });
                            });

                        } else {
                            genericGridSettingService.getConfig(scope.config).then(function (data) { initGrid(data); });
                        }



                        function initGrid(data) {
                            if (!data.masterColumns) return; //ToDo

                            genericGridCommonService.gridSetting = data;
                            console.log('Grid initialization');

                            //configure gridService
                            gridService = new genericGridService(scope);
                            constructGrid(data);
                        }

                        function reloadGridWithSetting(data) {
                            genericGridCommonService.gridSetting = data;
                            gridService.changeGridSetting(scope);
                            constructGrid();
                        }

                        function constructGrid() {
                            //grid configuration
                            var gridLocalConfig = {
                                columns: genericGridCommonService.gridSetting.masterColumns,
                                pageable: false,
                                sortable: {
                                    mode: "multiple",
                                    allowUnsort: true
                                },
                                groupable: {
                                    messages: {
                                        empty: '<i class="icon-mail-reply icon-rotate-270" title="' + $rootScope.resources.DropColHere + '"></i> ' + $rootScope.resources.DropColHere
                                    }
                                },
                                scrollable: true,
                                reorderable: true,
                                resizable: true,
                                selectable: genericGridCommonService.gridSetting.selectable,
                                navigatable: true,
                                columnMenu: false,
                                height: element.parent().height()
                            };

                            if (genericGridCommonService.gridSetting.details) {
                                gridLocalConfig.detailTemplate = kendo.template(detailsGridTemplate);
                                gridLocalConfig.detailInit = gridService.detailInit;
                            }

                            element.kendoGrid(gridLocalConfig);

                            genericGridCommonService.initService(element.data('kendoGrid'));

                            genericGridCommonService.grid.table.addClass('clickable');

                            genericGridCommonService.grid.table.on("keydown", function (e) {
                                $(this).find('tr').removeClass('row-selection').find('td.k-state-focused').parents('tr').addClass('row-selection');
                            });

                            configDataMapToGrid();
                            //gridService.setGridObject(genericGridCommonService.grid);
                            scope.config.gridDataModel.constructGridModel(gridService);

                            genericGridCommonService.grid.setDataSource(gridService.getMasterDataSource());

                            if (genericGridCommonService.gridSetting.hasPager)
                                gridService.initPager();

                            //integrate row context menu
                            if (genericGridCommonService.gridSetting.isEnableContextMenu) {
                                element.append($compile(contextMenuTemplate)(scope));
                            }

                            genericGridCommonService.grid//.bind("columnMenuInit", gridService.gridColumnMenuInit)
                                .bind("columnResize", gridService.gridColumnResize)
                                .bind("columnHide", function () {
                                    $(".k-column-menu:visible").kendoPopup("close");
                                })
                                .bind("columnShow", function () {
                                    $(".k-column-menu:visible").kendoPopup("close");
                                })
                                .bind('dataBound', gridService.dataBound);

                            genericGridCommonService.grid.collapseGroup = gridService.collapseGroup;

                            genericGridCommonService.grid.expandGroup = gridService.expandGroup;

                            genericGridCommonService.grid.groupable._canDrag = function (groupElement) {
                                var field = groupElement.attr(kendo.attr("field"));
                                return groupElement.attr(kendo.attr("groupable")) != "false" &&
                                    field &&
                                    (groupElement.hasClass("k-group-indicator") ||
                                        !this.indicator(field)) && (this.dataSource.group().length < 3);
                            };

                            gridService.initGridMenu();

                            gridService.initGridColumnMenu();

                            gridService.setGridHeight();

                            gridService.disableGridColumnReorder();

                            gridService.setDefaultGridSetting();

                            if (genericGridCommonService.gridSetting.isRowSelectable)
                                rowSelectionService.enableMultipleRowSelection();

                            if (genericGridCommonService.gridSetting.isSingleSelectable)
                                rowSelectionService.enableSingleRowSelection();
                        }

                        function configDataMapToGrid() {
                            genericGridCommonService.gridSetting.element = element;
                            genericGridCommonService.gridSetting.initGrid = initGrid;
                            genericGridCommonService.gridSetting.reloadGridWithSetting = reloadGridWithSetting;
                            genericGridCommonService.gridSetting.createRowSelection = rowSelectionService.createRowSelection;
                        }
                    },
                    controller: ['$scope', '$window', 'rowSelectionColumnCheckBoxService', function ($scope, $window, rowSelectionColumnCheckBoxService) {
                        genericGridCommonService.currentStateName = 'kendo';

                        $scope.$on('$destroy', function () {
                            if (!$rootScope.isLoggingOut) {
                                saveGridSetting();
                                //genericGridCommonService.destroy(); ToDo we have to destroy the grid object
                                genericGridCommonService.resetAllServices();
                                rowSelectionService.initService();
                                genericGridColumnService.initService();
                                gridSearchService.initService();
                                genericGridCommonService.destroy();
                            }

                            //ToDo: Reza: need to refactor grid cell related scope
                            //rowSelectionColumnCheckBoxService.unregisterUpdater();
                            genericGridColumnService.destroyGridCell();
                            rowSelectionColumnCheckBoxService.resetRowSelection();
                        });

                        $window.onbeforeunload = function () {
                            if (!$rootScope.isLoggingOut) {
                                saveGridSetting();
                            }
                        };

                        if (!angular.isDefined($scope.gridMenuConfig)) $scope.gridMenuConfig = {};

                        $scope.gridMenuConfig.saveGridSetting = saveGridSetting;

                        if (!genericGridCommonService.grid) return; //ToDo

                        function saveGridSetting() {
                            var gridSettings = genericGridCommonService.getCurrentGridSetting();
                            if (gridSettings) {
                                genericGridSettingService.saveConfig(gridSettings);
                            }
                        }
                    }]
                };
            }]);

        app.directive('gridCellTemplate', ['genericGridCommonService', function (genericGridCommonService) {
            return {
                restrict: 'A',
                templateUrl: function (element, attrs) {
                    return attrs.url;
                },
                link: function (scope, element, attrs) {
                    $('[uid="' + attrs.uid + '"]').replaceWith(element);
                    genericGridCommonService.gridSetting.createRowSelection();
                    //element.on('$destroy', function () {
                    //    console.log('destroy element');
                    //    scope = null;
                    //    //element.scope().$destroy();
                    //    //scope.$destroy();
                    //});
                    //scope.$on('$destroy', function () {
                    //    console.log('call');
                    //});
                }
            };
        }]);

        app.directive('gridCellHeaderTemplate', [
            'genericGridCommonService',
            'rowSelectionColumnCheckBoxService',
            '$timeout', function (genericGridCommonService, rowSelectionColumnCheckBoxService, $timeout) {
                return {
                    restrict: 'A',
                    templateUrl: function (element, attrs) {
                        return attrs.url;
                    },
                    link: function (scope, element, attrs) {
                        $('[uid="' + attrs.uid + '"]').replaceWith(element);
                        genericGridCommonService.gridSetting.createRowSelection();


                        //rowSelectionColumnCheckBoxService.setCheckAllItemsAreSelected(function () {
                        //    return $timeout(function () {
                        //        return $('td .icon-square-o').length === 0;
                        //    }, 600);
                        //});

                        //rowSelectionColumnCheckBoxService.setCheckItemsArePartiallySelected(function () {
                        //    return $timeout(function () {
                        //        return $('td .icon-square-o').length > 0 &&
                        //            $('td .icon-check-square').length > 0;
                        //    }, 600);
                        //});

                    }
                };
            }]);

        //shellDirectiveModule.controller('gridCellTemplateController', function($scope) {
        //    console.log('call');
        //});
        //ng-controller="gridCellTemplateController"
    });