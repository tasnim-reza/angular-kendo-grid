define(['app'],
    function (app) {
        app.filter('genericSearchFiltersFilter', function () {
            return function (input, resources) {
                var label = input;

                if (input) {
                    input = input.toUpperCase();
                    if (input === 'TRUE') {
                        label = resources.Yes;
                    } else if (input === 'FALSE') {
                        label = resources.No;
                    } else if (input === '10') {
                        label = resources.Low;
                    } else if (input === '11') {
                        label = resources.Normal;
                    } else if (input === '12') {
                        label = resources.High;
                    } else if (input === '13') {
                        label = resources.Blocker;
                    } else if (input === "STAATENLOS" || input === "APATRIDE" || input === "STAATENLOS" || input === "WITHOUT A STATE") {
                        label = resources.Stateless;
                    }
                }

                return label;
            };
        });
    });