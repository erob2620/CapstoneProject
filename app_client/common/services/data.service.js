(function() {
    angular
        .module('app')
        .service('meanData', meanData);
    
    meanData.$inject = ['$http', 'authentication', '$location'];
    function meanData($http, authentication, $location) {
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
        var getSharedDesigns = function(email) {
            return $http.get('api/designs/shared', {params: {email: email}})
                .success(function(data) {
                    console.log(data);
                })
                .error(function(e) {
                    console.log(e);
                });
        };
        var getDesign = function(designId) {
            return $http.get('/api/design', {params: {id: designId}})
                .success(function(data) {
                    console.log(data);
                })
                .error(function(e) {
                    console.log(e)
                });
        };
        var saveDesign = function(design) {
              return $http.post('/api/designs/save', design)
                    .success(function(data) {
                  console.log(data);
              });
        };
        var createDesign = function(design) {
            return $http.post('/api/designs/save', design)
                .success(function(data) {
                  console.log('in data service');
                    console.log(data);
                })
                .error(function(e) {
                    console.log(e);
                });
            
        };
        var shareDesign = function(shareInfo) {
              return $http.post('api/designs/share', shareInfo)
                .success(function(data) {
                  console.log('in mean data');
                })
                .error(function(e) {
                  console.log(e);
                });
        };
        
        return {
            getProfile: getProfile,
            getDesigns: getDesigns,
            getSharedDesigns: getSharedDesigns,
            saveDesign: saveDesign,
            getDesign: getDesign,
            createDesign: createDesign,
            shareDesign: shareDesign
        };
    }
})();