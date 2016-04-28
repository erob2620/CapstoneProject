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
        var getDesigns = function(email) {
            console.log(email);
            return $http.get('/api/designs', {params: {email: email}})
                .success(function(data) {
                    console.log(data);   
                })
                .error(function(e) {
                    console.log(e);
                });
        };
        var saveDesign = function(design) {
              $http.post('/api/designs/save', design)
                    .success(function(data) {
                  console.log(data);
              });
        };
        return {
            getProfile: getProfile,
            getDesigns: getDesigns,
            saveDesign: saveDesign
        };
    }
})();