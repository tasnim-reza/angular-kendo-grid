define(['shell/shell-directive-module'],
    function (shellDirectiveModule) {
        shellDirectiveModule.directive('gridPager', ['$timeout', 'genericGridCommonService', '$rootScope', function ($timeout, genericGridCommonService, $rootScope) {
            'use strict';

            return {
                restrict: 'A',
                scope: {
                    config: '=config'
                },
                link: function (scope, element, attrs) {
                    var pager = null;

                    element.kendoPager({
                        autoBind: false,
                        dataSource: genericGridCommonService.grid.dataSource,
                        pageSizes: false,
                        input: true,
                        numeric: true,
                        info: true,
                        buttonCount: scope.config.buttonCount,
                        messages: {
                            display: "{0}-{1} " + $rootScope.resources.Of + " {2} " + $rootScope.resources.Items + ""
                        },
                        change: function (e) {
                            //resetPager();
                            convertPagerButtonIntoTextbox();
                        },
                    }).removeClass('k-pager-wrap k-widget');

                    pager = $(element).data('kendoPager');

                    scope.config.resetPager = function () {
                        resetPager();
                    };

                    var intervalId = setInterval(function () {
                        if (pager.list.find('li').length > 0) {
                            clearInterval(intervalId);
                            pager.list.remove();
                            resetPager();
                            $(".k-pager-info").prependTo(".custom-pager");
                            convertPagerButtonIntoTextbox();
                        }
                    }, 100);

                    function resetPager() {
                        var page = pager.page(),
                            buttonCount = pager.options.buttonCount,
                            center = parseInt(buttonCount / 2) + 1,
                            incrementer = center - 1,
                            start = 1,
                            idx,
                            totalPages = pager.totalPages(),
                            end = buttonCount,
                            html = '<ul class="k-pager-numbers k-reset">';

                        $(element).find('.k-pager-numbers').remove();
                        if (page > totalPages)
                            page = totalPages;
                        if (page > center) {
                            start = page - incrementer;
                            end = page + incrementer;
                        }
                        if (end > totalPages) {
                            start = totalPages - buttonCount + 1;
                            end = totalPages;
                        }

                        if (start < 1) start = 1;

                        for (idx = start; idx <= end; idx++) {
                            html += button(idx === page ? pager.selectTemplate : pager.linkTemplate, idx, idx, true);
                        }

                        $(element).find('a').eq(1).after(html + '</ul>');
                    }

                    function convertPagerButtonIntoTextbox() {
                        $(element).on('click','.k-pager-numbers .k-state-selected' , function (e) {
                            if ($('.k-state-selected').next('.k-pager-input').length) {
                                $('.k-state-selected').next('.k-pager-input').show().children('.k-textbox').focus();
                                $('.k-state-selected').hide();
                                return;
                            }

                            var child = $('.k-pager-input').children('.k-textbox').attr('type', 'text').css({ 'width': '100%' });
                            var pagerInpOrg = $('.k-pager-input').html(child);
                            var input = $(element).find('.k-state-selected').parent().append(pagerInpOrg.clone(true, true)).find('.k-pager-input');
                            input.show();
                            $(element).find('.k-state-selected').hide();
                            input.children('.k-textbox').focus().on('blur', function () {
                                input.hide();
                                $(element).find('.k-state-selected').show();
                            });
                        });
                    }

                    function button(template, idx, text, numeric) {
                        return template({
                            idx: idx,
                            text: text,
                            title: text,
                            ns: kendo.ns,
                            numeric: numeric
                        });
                    }
                }
            };

        }]);
    });