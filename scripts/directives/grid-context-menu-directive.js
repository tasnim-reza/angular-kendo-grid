define(['app'],
    function (app) {
        app.directive('gridContextMenu', ['rowSelectionService', 'genericGridCommonService', function (rowSelectionService, genericGridCommonService) {
                'use strict';
                var grid = null;

                return {
                    restrict: 'A',
                    templateUrl: 'shell/partials/generic-list/grid-context-menu.html',
                    replace: true,
                    link: function (scope, element, attrs, ctrl) {
                        var elementName = '[' + attrs.gridContextMenu + ']',
                            close = function (e) {
                                console.log(e);
                                $('#contextMenu').hide();
                                $(document).off("mousedown click");
                                $('#contextMenu').off("click");
                                $('.k-detail-row').off('mousedown');
                                //grid.clearSelection();
                            };

                        grid = $(elementName).data('kendoGrid');
                        if (!grid) return;

                        $(grid.tbody).on("contextmenu", '>tr:not(.k-grouping-row, .k-detail-row)', function (e) {
                            //rowSelectionService.selectSingRow(e.currentTarget);
                            //selectRow(e);
                            showContextMenu(e);
                            stopPropagation(e);
                        });

                        function selectRow(e) {
                            if ($(e.currentTarget).hasClass('k-state-selected')) return;
                            else {
                               genericGridCommonService.grid.clearSelection();
                               genericGridCommonService.grid.select(e.currentTarget);
                            }
                        }

                        function showContextMenu(e) {
                            var offset = {
                                top: e.pageY,
                                left: e.pageX
                            },
                                bottom = $(window).scrollTop() + $(window).height(),
                                right = $(window).scrollLeft() + $(window).width(),
                                height = $('#contextMenu').height(),
                                width = $('#contextMenu').width(),
                                //contentBoxOffset = $('.main-content').offset(),
                                parentOffset = $(elementName).parent().offset(),
                                parentHeight = $(elementName).parent().height(),
                                parentWidth = $(elementName).parent().width();

                            offset.top -= parentOffset.top;
                            offset.left -= parentOffset.left;

                            if ((offset.top + height > bottom) || (offset.top + height > parentHeight)) {
                                offset.top -= height;
                            }

                            if ((offset.left + width > right) || (offset.left + width > parentWidth)) {
                                offset.left -= width;
                            }
                            $("#contextMenu").css(offset).show();
                            e.preventDefault();
                            e.stopPropagation();
                        }

                        function stopPropagation(e) {
                            $(document).on("mousedown click", close);
                            $('.k-detail-row').on('mousedown', close);
                            $('#contextMenu').on("click", close);
                        }

                        $('#contextMenu').on('contextmenu', function (e) {
                            e.preventDefault();
                        });

                        $("#contextMenu").on('mousedown', function (e) {
                            e.stopPropagation();
                        });
                    },
                    controller: ['$scope', function ($scope) {
                        $scope.deselectAll = function () {
                            //grid.clearSelection();
                        };
                    }]
                };
            }]);
    });