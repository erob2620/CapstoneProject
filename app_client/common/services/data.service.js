(function() {
    angular
        .module('app')
        .service('meanData', meanData);
    
    meanData.$inject = ['$http', 'authentication'];
    function meanData($http, authentication) {
        var getProfile = function() {
            console.log(authentication.getToken());
            return $http.get('/api/profile', {
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            });
        };
        var getDesigns = function() {
            return $http.get('/api/designs', {
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            });
        };
        return {
            getProfile: getProfile,
            getDesigns: getDesigns
        };
    }
})();