define(['shell/shell-service-module'], function (shellServiceModule) {
    shellServiceModule.service('rowSelectionService', ['genericGridCommonService', function (genericGridCommonService) {
        'use strict';

        var check = 'icon-check',
            empty = 'disabled icon-check',
            minus = 'icon-minus',
            flipped = 'flipped',
            selectedRowList = [],
            deselectedRowList = [],
            rowSelectionConfig = {},
            isEntireListSelected,
            isPartiallySelected,
            icon = null,
            flipper = null,
            key = null,
            self = this;

        this.enableMultipleRowSelection = function () {
            genericGridCommonService.grid.thead.delegate('th .enable-flipper', 'click', function (e) {
                setDefaultElement();

                if (icon.hasClass('disabled') && icon.hasClass('icon-check')) { //empty check
                    selectAll();
                } else {
                    addEmpty();
                    deselectAll();
                    if (angular.isFunction(genericGridCommonService.gridSetting.onRowSelect)) genericGridCommonService.gridSetting.onRowSelect(selectedRowList, false, selectedRowList);
                }
                setFlippedCount();
                console.log(selectedRowList);
            });

            genericGridCommonService.grid.tbody.delegate('tr .flip-container', 'click', function (e) {
                setDefaultElement();

                var rowId = getSelectedRowId($(e.currentTarget).parent().parent().parent('tr'));
                if (!rowId) throw 'Row Id is not found';
                var flipperEl = $(this).find('.flipper');

                flipperEl.toggleClass(flipped);

                if (flipperEl.hasClass(flipped)) {
                    if (isEntireListSelected) {
                        removeDeselectedRowId(rowId);
                        if (deselectedRowList.length === 0) {
                            isPartiallySelected = false;
                        }
                        setFlippedCount(true);
                    } else {
                        insertRowId(rowId);
                        if (angular.isFunction(genericGridCommonService.gridSetting.onRowSelect)) genericGridCommonService.gridSetting.onRowSelect(rowId, true, selectedRowList);
                    }
                } else {
                    if (isEntireListSelected) {
                        isPartiallySelected = true;
                        insertDeselectedRowId(rowId);
                        setFlippedCount(false);
                    } else {
                        removeRowId(rowId);
                        if (angular.isFunction(genericGridCommonService.gridSetting.onRowSelect)) genericGridCommonService.gridSetting.onRowSelect(rowId, false, selectedRowList);
                    }
                }

                if (isEntireListSelected && isPartiallySelected) {
                    addMinus();

                } else if (isEntireListSelected && !isPartiallySelected) {
                    addCheck();
                }
                else {
                    var physicalSelectedCount = genericGridCommonService.grid.tbody.find('tr .flip-container .flipped').length,
                        isAllSelected = (genericGridCommonService.grid.dataSource.total() === selectedRowList.length) ||
                        (physicalSelectedCount === genericGridCommonService.grid.dataSource.pageSize()) && (physicalSelectedCount === selectedRowList.length);

                    if (isAllSelected) {//icon.hasClass(minus) && 
                        addCheck();
                    } else if (selectedRowList.length === 0) {
                        addEmpty();
                    } else {
                        addMinus();
                    }
                    setFlippedCount();
                    console.log(selectedRowList);
                }
            });
        };

        this.enableSingleRowSelection = function () {
            genericGridCommonService.grid.tbody.delegate('tr .flip-container', 'click', function (e) {
                setDefaultElement();
                var flipperEl = $(this).find('.flipper');
                if (flipperEl.hasClass(flipped)) {
                    flipperEl.toggleClass(flipped);
                } else {
                    flipper.removeClass(flipped);
                    flipperEl.toggleClass(flipped);
                }
                console.log(selectedRowList);
            });
        };

        this.createRowSelection = function () {
            setDefaultElement();

            if (isEntireListSelected && isPartiallySelected) {
                flipper.addClass(flipped);
                _.each(deselectedRowList, function (item) {
                    genericGridCommonService.grid.tbody.find('tr td:contains(' + item + ')').parent().find('.flipper').removeClass(flipped);
                });
            }
            else if (isEntireListSelected && !isPartiallySelected) {
                flipper.addClass(flipped);
            } else {
                _.each(selectedRowList, function (item) {
                    genericGridCommonService.grid.tbody.find('tr td:contains(' + item + ')').parent().find('.flipper').addClass(flipped);
                });

                var isPageChanged = rowSelectionConfig.currentPage && (rowSelectionConfig.currentPage !== genericGridCommonService.grid.dataSource.page()),
                    isPageSizeChanged = rowSelectionConfig.currentPageSize && (rowSelectionConfig.currentPageSize !== genericGridCommonService.grid.dataSource.pageSize()),
                    physicalSelectedCount = genericGridCommonService.grid.tbody.find('tr .flip-container .flipped').length;


                if ((genericGridCommonService.grid.dataSource.total() > 0) && (((physicalSelectedCount === genericGridCommonService.grid.dataSource.pageSize()) && (physicalSelectedCount === selectedRowList.length) || (genericGridCommonService.grid.dataSource.total() === selectedRowList.length))))
                    addCheck();
                else if ((icon.hasClass(check) && (isPageChanged || isPageSizeChanged)) || physicalSelectedCount > 0) {
                    addMinus();
                }
            }
            setFlippedCount();
        };

        this.initService = function () {
            selectedRowList = [];
            deselectedRowList = [];
            rowSelectionConfig = {};
            isEntireListSelected = false;
            isPartiallySelected = false;
            icon = null;
            flipper = null;
            key = null;
        };

        this.selectEntireList = function() {
            setDefaultElement();

            if (icon) {
                selectAll();
            }
            setFlippedCount();
        };

        this.clearSelection = function () {
            deselectAll();
        };

        this.removeRowId = function (rowId) {
            removeRowId(rowId);
        };

        this.selectSingRow = function (row) {
            var rowId = getSelectedRowId($(row));
            if (!rowId) throw 'Row Id is not found';
            var flipperEl = $(row).find('.flipper');
            flipperEl.addClass(flipped);
            insertRowId(rowId);
            setFlippedCount();
        };

        this.getSelectedIds = function () {
            return selectedRowList;
        };

        function setFlippedCount(isInc) {
            var countArea = genericGridCommonService.grid.thead.find('th .enable-flipper').next('small');

            if (isEntireListSelected && (isPartiallySelected || !isPartiallySelected)) {
                var currentVal = parseInt(countArea.text());
                if (!angular.isUndefined(isInc)) {
                    if (isInc) countArea.text(currentVal + 1);
                    else countArea.text(currentVal - 1);
                }
            }
            else if (selectedRowList.length > 0)
                countArea.text(selectedRowList.length);
            else
                countArea.text('');
        }

        function setDefaultElement() {
            icon = genericGridCommonService.grid.thead.find('th .enable-flipper i');
            flipper = genericGridCommonService.grid.tbody.find('tr .flip-container .flipper');
            key = genericGridCommonService.grid.thead.find('th .enable-flipper').data('keycolumn');
            isEntireListSelected = genericGridCommonService.grid.thead.find('th .enable-flipper').data('isallselected');
        }

        function getSelectedRowId(row) {
            return genericGridCommonService.grid.dataItem(row)[key];
        }

        function insertRowId(rowId) {
            if (_.indexOf(selectedRowList, rowId) < 0)
                selectedRowList.push(rowId);
        }

        function removeRowId(rowId) {
            selectedRowList.splice(_.indexOf(selectedRowList, rowId), 1);
        }

        function insertDeselectedRowId(rowId) {
            if (_.indexOf(deselectedRowList, rowId) < 0)
                deselectedRowList.push(rowId);
        }

        function removeDeselectedRowId(rowId) {
            deselectedRowList.splice(_.indexOf(deselectedRowList, rowId), 1);
        }

        function deselectAll() {
            genericGridCommonService.grid.thead.find('th .enable-flipper').data('isallselected', false);
            genericGridCommonService.grid.thead.find('th .enable-flipper').next('small').text('');
            addEmpty();
            if (flipper) {
                 flipper.removeClass(flipped);
            }

            selectedRowList = [];
            rowSelectionConfig = {};
            deselectedRowList = [];
            isPartiallySelected = false;
            isEntireListSelected = false;
        }

        function selectAll() {
            addCheck();
            flipper.addClass(flipped);
            _.each(flipper, function (item) {
                var rowId = getSelectedRowId($(item).parent().parent().parent().parent('tr'));
                if (!rowId) throw 'Row Id is not found';
                insertRowId(rowId);
            });
            rowSelectionConfig.currentPage = genericGridCommonService.grid.dataSource.page();
            rowSelectionConfig.currentPageSize = genericGridCommonService.grid.dataSource.pageSize();
            if (angular.isFunction(genericGridCommonService.gridSetting.onRowSelect)) genericGridCommonService.gridSetting.onRowSelect(selectedRowList, true, selectedRowList);
        }

        function addEmpty() {
            if (icon) {
                 icon.removeClass(check).removeClass(minus).addClass(empty);
            }
        }

        function addMinus() {
            icon.removeClass(check).removeClass(empty).addClass(minus);
        }

        function addCheck() {
            icon.removeClass(empty).removeClass(minus).addClass(check);
        }
    }]);
});