angular.module('app', ['ngResource','ngRoute']);

angular.module('app').config(function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {templateUrl: '/partials/main', controller: 'mainCtrl'});
});

angular.module('app').controller('mainCtrl', function($scope,$http) {
    $scope.myVar = "Hello Angular";
//    $http.get('/');
});
//angular.module('app').controller('designCtrl', function($scope,$http,$routeParams) {
//    $scope.myVar = "Hello Angular";
//    $http.get('/design/' + $routeParams.id); 
//});