define(['shell/shell-service-module'], function (shellServiceModule) {
    shellServiceModule.service('genericGridCommonService', ['$rootScope', '$state', '$q', function ($rootScope, $state, $q) {
        'use strict';

        var self = this,
            textAlignType = {
                left: 1,
                center: 2,
                right: 3
            },
        userId = $rootScope.loggedInUser.UserId;;

        this.grid = null;

        this.gridSetting = null;

        this.gridRequestModel = {};

        this.currentStateName = null;

        this.initService = function (gridEl) {
            if (!gridEl) throw 'Grid defination is not found';
            self.grid = gridEl;

        };

        this.destroy = function () {
            self.grid = null;
            self.gridOnDataBound = null;
        };

        this.getCurrentColumnIndex = function (fieldName, considerColumnVisibility) {
            var hierarchyCellCount = self.grid.thead.find('th.k-hierarchy-cell').length,
                groupCount = self.grid.dataSource.group().length,
                visibleColumns = _.filter(self.grid.columns, function (item) { return !item.hidden; }),
                foundColumn = _.find(self.grid.columns, function (column) { return column.field === fieldName; }),
                index = 0;
            if (considerColumnVisibility) index = _.indexOf(visibleColumns, foundColumn);
            else index = _.indexOf(self.grid.columns, foundColumn);

            return index + 1 + groupCount + hierarchyCellCount;
        };

        this.getCurrentColumn = function (fieldName) {
            var foundColumn = _.find(self.grid.columns, function (column) { return !column.hidden && column.field === fieldName; });

            return foundColumn;
        };

        this.textAlign = function (alignType, fieldName) {
            var idx = self.getCurrentColumnIndex(fieldName),
                tds = self.grid.tbody.find('tr.k-master-row').length > 0 ? self.grid.tbody.find('tr.k-master-row').find('td:not(".k-group-cell"):not("[colspan]"):visible:nth-child(' + idx + ')')
                : self.grid.tbody.find('td:not(".k-group-cell, .k-hierarchy-col"):not("[colspan]"):visible:nth-child(' + idx + ')');

            switch (alignType) {
                case textAlignType.left:
                    if (!tds.hasClass('text-left')) {
                        tds.removeClass('text-center text-right');
                        tds.addClass('text-left');
                    }
                    break;
                case textAlignType.center:
                    if (!tds.hasClass('text-center')) {
                        tds.removeClass('text-left text-right');
                        tds.addClass('text-center');
                    }
                    break;
                case textAlignType.right:
                    if (!tds.hasClass('text-right')) {
                        tds.removeClass('text-left text-center');
                        tds.addClass('text-right');
                    }
                    break;
                default:
            }

            var currentColumn = self.getCurrentColumn(fieldName);
            if (currentColumn)
                currentColumn.align = alignType;
        };

        this.wrap = function (wrapType, fieldName) {
            var idx = self.getCurrentColumnIndex(fieldName),
                tds = self.grid.tbody.find('tr.k-master-row').length > 0 ? self.grid.tbody.find('tr.k-master-row').find('td:not(".k-group-cell"):not("[colspan]"):visible:nth-child(' + idx + ')')
                    : self.grid.tbody.find('td:not(".k-group-cell, .k-hierarchy-col"):not("[colspan]"):visible:nth-child(' + idx + ')'),
                currentColumn = self.getCurrentColumn(fieldName);

            switch (wrapType) {
                case 1:
                    tds.css('white-space', '');
                    break;
                case 2:
                    tds.css({ 'white-space': 'nowrap' });
                    break;
                default:
            }
            if (currentColumn)
                currentColumn.wrappedOrOverflowed = wrapType;
        };

        this.getCurrentGridSetting = function () {
            if (!self.grid) return null; //ToDo

            var gridDs = self.grid.dataSource,
                groups = gridDs.group(),
                sorts = gridDs.sort(),
                columns = [];

            _.forEach(self.grid.columns, function (col, colOrder) {
                var column = {
                    Align: col.align,
                    GridStyleColumnId: col.GridStyleColumnId,
                    ColumnOrder: colOrder,
                    Width: null,
                    SortNo: null,
                    SortOrder: null,
                    GroupNo: null,
                    GroupOrder: null,
                    WrappedOrOverflowed: col.wrappedOrOverflowed,
                    IsHidden: col.hidden,
                };
                var sortIndex,
                    foundInSort = _.find(sorts, function (item, index) {
                        var isExist = item.field === col.field;
                        if (isExist) sortIndex = index;
                        return isExist;
                    });
                if (foundInSort) {
                    column.SortNo = sortIndex;
                    column.SortOrder = foundInSort.dir;
                }

                var groupIndex,
                    foundInGroup = _.find(groups, function (item, index) {
                        var isExist = item.field === col.field;
                        if (isExist) groupIndex = index;
                        return isExist;
                    });
                if (foundInGroup) {
                    column.GroupNo = groupIndex;
                    column.GroupOrder = foundInGroup.dir;
                }

                if (col.width != '0px') column.Width = parseInt(col.width);
                columns.push(column);
            });

            var gridSettings = {
                UserId: userId,
                GridId: self.gridSetting.gridId,
                PageSize: gridDs.pageSize(),
                GridColumnSettings: columns,
                HasColumnSeparator: self.gridSetting.hasColumnSeparator,
                IsRowSelectable: self.gridSetting.isRowSelectable,
                StateName: self.currentStateName
            };

            return gridSettings;
        };

        this.resetAllServices = function () {
            self.grid = null;
            self.gridSetting = null;
            self.gridRequestModel = {};
            self.currentStateName = null;
        };

        this.closeKendoColumnMenuPopup = function () {
            $(".k-column-menu:visible").kendoPopup("close");
        };

        this.refreshGrid = function () {
            if (self.grid) {
                self.grid.dataSource.read();
            }
        };

        this.refreshGridShowFirstPage = function () {
            if (self.grid) {
                self.grid.dataSource._page = 1;
                self.grid.dataSource._skip = 0;
                self.grid.dataSource.read();
            }
        };

        this.goPreviousPage = function () {
            if (self.grid) {
                if (self.grid.dataSource._page > 1) {
                    self.grid.dataSource._page = self.grid.dataSource._page - 1;
                    self.grid.dataSource._skip = self.grid.dataSource._skip - self.grid.dataSource._pageSize;
                }
                self.grid.dataSource.read();
            }
        };

        this.gridOnDataBound = function () { };

        this.clearGridRowSelection = function () {
            self.grid.table.find('tr').removeClass('row-selection');
        };

        this.headerContextMenu = function () {
            console.log(self.grid);
        };


        //example: http://dojo.telerik.com/uloci
        /*
        example: send the added object
        $scope.addRow = function () {
            var dataItem = {
                BusinessCaseId: "f1a594aa-3c87-e682-740d-1f0adb7b1b64",
                BusinessCaseStateId: "c311e9d7-56ef-4259-be1d-000026000001",
                BusinessCaseStateName: "Under construction",
                Inhabitants: "reza1",
                ReportedOn: "2015-05-11T00:00:00",
                TaskId: "bf5874ac-d0c7-dc83-0f27-abcb15f26775",
                ValidFrom: "2015-05-07T15:52:07.007",
                Priority: "",
                DueDate: "2015-05-07T15:52:07.007",
                SubmittedDate: "2015-05-07T15:52:07.007",
                ReportedByUserName: "reza",
                AssignedToUserName: "reza",

            };
            genericGridCommonService.addRow(dataItem);
        };*/
        this.addRow = function (dataItem) {
            self.grid.dataSource.add(dataItem);
        };

        /*
        example: send updated property name and its value as object
        $scope.updateRow = function () {
            genericGridCommonService.updateRow('f1a594aa-3c87-e682-740d-1f0adb7b1b63', { 'Inhabitants': 'reza1' });
        };
        */
        this.updateRow = function (rowId, dataItem) {
            var existingDataItem = getExistingDataItem(rowId);
            for (var prop in dataItem) {
                existingDataItem.set(prop, dataItem[prop]);
            }

        };

        /*       
        example: send primary key
        $scope.removeRow = function () {
            genericGridCommonService.removeRow('f1a594aa-3c87-e682-740d-1f0adb7b1b63');
        };
        */
        this.removeRow = function (rowId) {
            if (self.grid.dataSource.get(rowId)) self.grid.dataSource.remove(getExistingDataItem(rowId));
        };

        /*
        example: set current query options
        to retrieve the query 
        var currentQuery = genericGridCommonService.grid.currentQueryOptions;
        */
        this.setCurrentQueryOptions = function (options) {
            options = angular.copy(options);
            self.grid.currentQueryOptions = options;
            if (_.isEmpty(self.grid.currentQueryOptions.StateGenericSearch))
                self.grid.currentQueryOptions.StateGenericSearch = null;
        };

        this.setGridHeightWithDetail = function(func) {
            self.setGridHeightWithDetail = func;
        }

        function getExistingDataItem(rowId) {
            var dataUid = self.grid.dataSource.get(rowId).uid;
            return self.grid.dataItem(self.grid.tbody.find("tr[data-uid='" + dataUid + "']"));
        };

    }]);
});