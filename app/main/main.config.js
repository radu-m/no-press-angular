class MainConfig {

    static initRoute($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('main', {
                url: '',
                parent: 'root',
                abstract: true,
                templateUrl: require('./main.template.html'),
                controller: 'MainController as main',            
                resolve: {
                    registeredLang: ['localeService', '$stateParams',
                        function (localeService, $stateParams) {
                            return localeService.getAllRegisteredLang()
                                .then(function (result) {
                                    // $stateParams.lang = result;
                                    return result;
                                });
                        }]            
                }
            });

        $urlRouterProvider.otherwise("/home");
    }
}

MainConfig.initRoute.$inject = ['$stateProvider', '$urlRouterProvider'];
export default MainConfig.initRoute;