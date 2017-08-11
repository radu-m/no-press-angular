function noPressConfig ($stateProvider,
                        $mdThemingProvider, 
                        $provide, 
                        $locationProvider, 
                        $urlRouterProvider, 
                        $urlMatcherFactoryProvider){

    $mdThemingProvider.theme('default').primaryPalette('light-blue', {'default': '800'}).accentPalette('blue-grey');
    $mdThemingProvider.theme("success-notification");
    $mdThemingProvider.theme("error-notification");

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    // Deal with missing trailing slash
    // https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-make-a-trailing-slash-optional-for-all-routes
    $urlMatcherFactoryProvider.strictMode(false);
    $urlRouterProvider.rule(function ($injector, $location) {
        var path = $location.path(), search = $location.search();
        if (path[path.length - 1] !== '/') {
            if (search === {}) {
                return path + '/';
            } else {
                var params = [];
                angular.forEach(search, function (v, k) {
                    params.push(k + '=' + v);
                });
                return path + '/?' + params.join('&');
            }
        }
    });

    $stateProvider.state("root",
    {
        abstract: true,
        views: {
            'content@': {
                controller: 'NoPressRootController'
            }
        }
    })

}

noPressConfig.$inject = [
    '$stateProvider',
    '$mdThemingProvider', 
    '$provide', 
    '$locationProvider', 
    '$urlRouterProvider', 
    '$urlMatcherFactoryProvider'
];
export default noPressConfig;