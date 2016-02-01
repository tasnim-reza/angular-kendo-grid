define(['app'],
    function (app) {
        app.directive('gridColumnMenu', ['genericGridColumnService', 'genericGridCommonService', 'gridColumnMenuService',
            function (genericGridColumnService, genericGridCommonService, gridColumnMenuService) {
                'use strict';

                return {
                    restrict: 'E',
                    templateUrl: 'shell/partials/generic-list/grid-column-menu.html',
                    replace: true,
                    link: function (scope, element, attrs, ctrl) {
                        var menu = element;
                        scope.rowSelection = {
                            isRowSelection: false
                        };

                        if (!menu.data('kendoContextMenu'))
                            initContextMenu();

                        function initContextMenu() {
                            var hasNotColumnMenuFields = '';

                            _.each(genericGridColumnService.hasNotColumnMenuFields, function (field) {
                                hasNotColumnMenuFields += '[data-field="'+ field +'"],';
                            });

                            var target = genericGridCommonService.grid.thead.find('tr th').not('.k-hierarchy-cell').not(_.splice(hasNotColumnMenuFields,hasNotColumnMenuFields.length-1,1));

                            var columnContextMenu = menu.kendoContextMenu({
                                //orientation: orientation,
                                target: target,
                                //filter: ".product",
                                animation: {
                                    open: { effects: "fadeIn" },
                                    duration: 500
                                },
                                open: function (e) {
                                    var fn = e.target.dataset.field;
                                    scope.$apply(function () {
                                        scope.rowSelection.isRowSelection = (fn === 'RowSelection');
                                    });
                                    gridColumnMenuService.initColumnMenu(fn);
                                },
                                //select: function (e) {
                                //    console.log(e);
                                //}
                            }).data('kendoContextMenu');
                            genericGridCommonService.grid.columnContextMenu = columnContextMenu;

                        }
                    }
                };
            }]);

        //todo: should moved to different file
        app.controller('gridColumnMenuController', ['$scope', 'genericGridColumnService', 'genericGridCommonService', 'gridColumnMenuService', 'rowSelectionService',
            function ($scope, genericGridColumnService, genericGridCommonService, gridColumnMenuService, rowSelectionService) {
                'use strict';

                var widthIncreaseIntervel = 5;
                var textAlignType = {
                    left: 1,
                    center: 2,
                    right: 3
                };

                $scope.hide = function () {
                    var fieldName = gridColumnMenuService.getFieldName();
                    genericGridCommonService.grid.hideColumn(fieldName);
                    clearColumnSetting(fieldName);
                    genericGridCommonService.grid.columnContextMenu.close();

                    var contentTable = genericGridCommonService.grid.tbody.parent(),
                        headerTable = genericGridCommonService.grid.thead.parent(),
                        table = headerTable.add(contentTable),
                        currentTableWidth = headerTable.width(),
                        currentWidth = genericGridCommonService.grid.thead.find('tr th[data-field="' + fieldName + '"]').outerWidth();

                    table.css('width', currentTableWidth - currentWidth);
                };

                $scope.group = function () {
                    var fieldName = gridColumnMenuService.getFieldName();
                    var existingGroups = genericGridCommonService.grid.dataSource.group() || [];
                    if (existingGroups.length < 3 && !_.any(existingGroups, function (item) { return item.field === fieldName; })) {
                        existingGroups.push({ aggregates: [], dir: "asc", field: fieldName });
                        genericGridCommonService.grid.dataSource.group(existingGroups);
                        genericGridCommonService.grid.dataSource.group(existingGroups);
                        genericGridCommonService.grid.columnContextMenu.close();
                    }
                };

                $scope.decreaseColumnWidth = function () {
                    var fieldName = gridColumnMenuService.getFieldName();
                    resize(null, fieldName);
                };

                $scope.increaseColumnWidth = function () {
                    var fieldName = gridColumnMenuService.getFieldName();
                    resize(true, fieldName);
                };

                $scope.wrapText = function () {
                    var fieldName = gridColumnMenuService.getFieldName();
                    var wrapType = $scope.isWrapText ? 1 : 2;
                    genericGridCommonService.wrap(wrapType, fieldName);
                    genericGridCommonService.grid.columnContextMenu.close();
                };

                $scope.moveLeft = function () {
                    var fieldName = gridColumnMenuService.getFieldName();
                    reorder(null, fieldName);
                };

                $scope.moveRight = function () {
                    var fieldName = gridColumnMenuService.getFieldName();
                    reorder(true, fieldName);
                };

                $scope.alignTextLeft = function () {
                    var fieldName = gridColumnMenuService.getFieldName();
                    genericGridCommonService.textAlign(textAlignType.left, fieldName);
                    genericGridCommonService.grid.columnContextMenu.close();
                };

                $scope.alignTextCenter = function () {
                    var fieldName = gridColumnMenuService.getFieldName();
                    genericGridCommonService.textAlign(textAlignType.center, fieldName);
                    genericGridCommonService.grid.columnContextMenu.close();
                };

                $scope.alignTextRight = function () {
                    var fieldName = gridColumnMenuService.getFieldName();
                    genericGridCommonService.textAlign(textAlignType.right, fieldName);
                    genericGridCommonService.grid.columnContextMenu.close();
                };

                $scope.selectEntireList = function () {
                    rowSelectionService.selectEntireList();
                    genericGridCommonService.grid.columnContextMenu.close();
                };

                function clearColumnSetting(field) {
                    var sortedColumns = genericGridCommonService.grid.dataSource.sort();
                    var itemExistInSort = _.any(sortedColumns, function (item, i) {
                        var isExist = item.field === field;
                        if (isExist) sortedColumns.splice(i, 1);
                        return isExist;
                    });

                    if (itemExistInSort) {
                        resetSort(sortedColumns);
                    } else {
                        var groupedColumns = genericGridCommonService.grid.dataSource.group();
                        var itemExistInGroup = _.any(groupedColumns, function (item, i) {
                            var isExist = item.field === field;
                            if (isExist) groupedColumns.splice(i, 1);
                            return isExist;
                        });

                        if (itemExistInGroup) {
                            resetGroup(field);
                        }
                    }

                    clearWrapAndTextAlign(field);
                }

                function resetSort(sorts) {
                    $('.ch-sort-order').text('');
                    _.each(sorts, function (sort, index) {
                        $('#' + sort.field).text(index + 1);
                    });
                    genericGridCommonService.grid.dataSource.page(1);
                }

                function resetGroup(field) {
                    $('.k-group-indicator[data-field="' + field + '"]').remove();
                    genericGridCommonService.grid.dataSource.page(1);
                }

                function resize(isIncrease, fieldName) {
                    var index = 0,
                        visibleColumns = _.filter(genericGridCommonService.grid.columns, function (item) { return !item.hidden; }),
                        foundColumn = _.find(visibleColumns, function (column, i) {
                            var isFound = column.field === fieldName;
                            if (isFound) index = i;
                            return isFound;
                        }),
                        contentTable = genericGridCommonService.grid.tbody.parent(),
                        headerTable = genericGridCommonService.grid.thead.parent(),
                        footer = genericGridCommonService.grid.footer || $(),
                        minWidth = parseInt(foundColumn.minWidth),
                        maxWidth = parseInt(foundColumn.maxWidth),
                        currentWidth = genericGridCommonService.grid.thead.find('tr th[data-field="' + fieldName + '"]').outerWidth(),
                        currentTableWidth = headerTable.width(),
                        newWidth = 0,
                        newTableWidth = 0,
                        col = headerTable.find("col:not('.k-group-col, .k-hierarchy-col'):eq(" + index + ")")
                            .add(contentTable.children("colgroup").find("col:not('.k-group-col, .k-hierarchy-col'):eq(" + index + ")"))
                            .add(footer.find("colgroup").find("col:not('.k-group-col, .k-hierarchy-col'):eq(" + index + ")")),
                        table = headerTable.add(contentTable);

                    if (isIncrease) {
                        newWidth = currentWidth + widthIncreaseIntervel;
                        newTableWidth = currentTableWidth + widthIncreaseIntervel;
                        if (newWidth > maxWidth) {
                            newWidth = maxWidth;
                            newTableWidth = currentTableWidth;
                        }

                    } else {
                        newWidth = currentWidth - widthIncreaseIntervel;
                        newTableWidth = currentTableWidth - widthIncreaseIntervel;
                        if (newWidth < minWidth) {
                            newWidth = minWidth;
                            newTableWidth = currentTableWidth;
                        }
                    }

                    col.css('width', newWidth);
                    table.css('width', newTableWidth);
                    foundColumn.width = newWidth;
                }

                function reorder(isRight, fieldName) {
                    var idx = 1,
                        visibleColumns = _.filter(genericGridCommonService.grid.columns, function (item) { return !item.hidden; }),
                        foundColumn = _.find(visibleColumns, function (column, i) {
                            var isFound = column.field === fieldName;
                            if (isFound) idx = i + 1;
                            return isFound;
                        }),
                        destCol,
                        destIdx = 1,
                        hierarchyCellCount = 0;

                    if ((idx === 1 && !isRight) || (idx === visibleColumns.length && isRight)) return;

                    if (isRight) destCol = visibleColumns[idx];
                    else destCol = visibleColumns[idx - 2];

                    if (_.any(genericGridColumnService.notReordeableCols, function (item) { return item.field === destCol.field; })) return;

                    if (genericGridCommonService.grid.thead.find('th.k-hierarchy-cell')) hierarchyCellCount = genericGridCommonService.grid.thead.find('th.k-hierarchy-cell').length;

                    destIdx = genericGridCommonService.grid.thead.find('th[data-field="' + destCol.field + '"]').index() - genericGridCommonService.grid.dataSource.group().length - hierarchyCellCount;

                    genericGridCommonService.grid.reorderColumn(destIdx, foundColumn);
                    genericGridCommonService.grid.columnContextMenu.close();
                }

                function clearWrapAndTextAlign(field) {
                    var tds = genericGridCommonService.grid.tbody.find('tr td:nth-child(' + genericGridCommonService.getCurrentColumnIndex(field) + ')'),
                    currentColumn = _.find(genericGridCommonService.grid.columns, function (column) { return column.field === field; });;

                    tds.css('white-space', '');
                    tds.removeClass('text-left text-center text-right');

                    currentColumn.wrappedOrOverflowed = null;
                    currentColumn.align = null;
                }
            }]);

        app.service('gridColumnMenuService', function () {
            var self = this, fieldName;

            self.initColumnMenu = function (fn) {
                fieldName = fn;
            };

            self.getFieldName = function () {
                return fieldName;
            };
        });
    });