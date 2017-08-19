class HomeConfig {

    static initRoute($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                parent: 'main',
                templateUrl: require("./home.template.html"),
                controller: "HomeController as vm",
                resolve: {
                    pageData: ['stashService', 'registeredLang',
                        function (stashService) {
                            return stashService.getEntirePage('home')
                                .then((result) => {
                                    return result;
                                });
                        }],
                    categories: ['stashService', 'registeredLang',
                        function (stashService) {
                            return stashService.getAllCategories()
                                .then(function (result) {
                                    return result;
                                })
                        }
                    ]
                }
            });
    }
}

HomeConfig.initRoute.$inject = ['$stateProvider', '$urlRouterProvider'];
export default HomeConfig.initRoute;