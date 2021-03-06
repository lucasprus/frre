'use strict';

/**
 * @ngdoc overview
 * @name contentfulCustomCmsApp
 * @description
 * # contentfulCustomCmsApp
 *
 * Main module of the application.
 */
angular
    .module('contentfulCustomCmsApp', [
        'ngCookies',
        'ngAnimate',
        'ngSanitize',
        'ngTouch',
        'ui.router',
        'ui.bootstrap',
        'ngFileUpload',
        'textAngular'
    ])
    .constant('CONFIG', {
        // Content management API URL
        cmApiUrl: 'https://api.contentful.com/spaces/mtagzvdvtbff/',
        // Content delivery API URL
        cdApiUrl: 'https://cdn.contentful.com/spaces/mtagzvdvtbff/',
        // File upload URL
        uploadUrl: 'https://meck-schweizer-dev.appspot.com/',
        paginationResultsPerPage: 5,
        paginationLinksOffset: 3
    })
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push(['Utilities', '$q', function(Utilities, $q) {
            return {
                request: function(config) {
                    if (config.url.indexOf('api.contentful.com') > -1) {
                        config.headers.Authorization = 'Bearer 1e8d598435a76638fa3b874712b2a6e57dfd695b3999d83eb798f545b3e822b3';
                    } else if (config.url.indexOf('cdn.contentful.com') > -1) {
                        config.headers.Authorization = 'Bearer 5ff5442d5e7269dc9f4a6d73840070b265ddb97589486d78de7e7d77e6c011a2';
                    }

                    return config;
                },
                response: function(response) {
                    var successMessage = response.config.successMessage;

                    if (successMessage) {
                        Utilities.handlers.success(successMessage);
                    }

                    return response;
                },
                responseError: function(rejection) {
                    var errorMessage = rejection.config.errorMessage;

                    if (errorMessage) {
                        Utilities.handlers.error(errorMessage, rejection.data);
                    }

                    return $q.reject(rejection);
                }
            };
        }]);
    }])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider
            .when('', '/')
            .otherwise('404');

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'views/main.html'
            })
            .state('404', {
                url: '/404',
                templateUrl: 'views/404.html'
            });

        var contentTypes = contentfulCustomCmsAppData.contentTypes;

        $stateProvider
            .state('admin', {
                url: '/admin',
                templateUrl: 'views/admin.html',
                controller: ['$scope', function($scope) {
                    $scope.contentTypesMenu = contentfulCustomCmsAppData.contentTypes;
                }],
                redirectTo: contentTypes[0] ? 'admin.' + contentTypes[0].sys.id : 'home'
            });

        contentTypes.forEach(function(section) {
            var id = section.sys.id;

            $stateProvider
                .state('admin.' + id, {
                    url: '/' + id,
                    templateUrl: 'views/items.html',
                    redirectTo: 'admin.' + id + '.list',
                    params: {
                        contentType: section
                    }
                })
                .state('admin.' + id + '.list', {
                    url: '/list',
                    templateUrl: 'views/items.list.html',
                    controller: 'ItemsListCtrl',
                    params: {page: 1}
                })
                .state('admin.' + id + '.add', {
                    url: '/add',
                    templateUrl: 'views/items.addEdit.html',
                    controller: 'ItemsAddEditCtrl',
                    params: {mode: 'add'}
                })
                .state('admin.' + id + '.edit', {
                    url: '/edit/:id',
                    templateUrl: 'views/items.addEdit.html',
                    controller: 'ItemsAddEditCtrl',
                    params: {mode: 'edit'}
                })
                .state('admin.' + id + '.detail', {
                    url: '/detail/:id',
                    templateUrl: 'views/items.detail.html',
                    controller: 'ItemsDetailCtrl'
                });
        });

    }])
    .run(['$rootScope', '$state', '$timeout', function($rootScope, $state, $timeout) {
        $rootScope.$on('$stateChangeStart', function(evt, to, params) {
            if (to.redirectTo) {
                evt.preventDefault();

                $timeout(function() {
                    $state.go(to.redirectTo, params);
                });
            }
        });
    }])
    .run(['$rootScope', 'ENLanguagePack', 'DELanguagePack', '$cookies', function($rootScope, ENLanguagePack, DELanguagePack, $cookies) {
        var locale = $cookies.get('locale');

        if (locale === 'de-de') {
            $rootScope.locale = 'de-de';
            $rootScope.T = DELanguagePack;

            $rootScope.TC = function(value) {
                return _.first(value.split('|'));
            };
        } else {
            $cookies.put('locale', 'en-gb');
            $rootScope.locale = 'en-gb';
            $rootScope.T = ENLanguagePack;

            $rootScope.TC = function(value) {
                return _.last(value.split('|'));
            };
        }
    }])
    .run(['$rootScope', '$window', function($rootScope, $window) {
        $rootScope.contentTypes = _.indexBy($window.contentfulCustomCmsAppData.contentTypes, 'sys.id');
    }]);
