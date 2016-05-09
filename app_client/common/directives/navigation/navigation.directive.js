(function () {
    angular
        .module('app')
        .directive('navigation', navigation);
    
    function navigation() {
        return {
            restrict: 'A',
            templateUrl: '/common/directives/navigation/navigation.template.html',
            controller: 'navigationCtrl as navvm'
        };
    }
})();