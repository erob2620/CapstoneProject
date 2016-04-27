(function() {
    angular.module('app')
        .factory('DrawingService', DrawingService);
    
    DrawingService.$inject = ['ShapeService'];
    function DrawingService(ShapeService) {
        
        var drawingFactory = {};
        
        drawingFactory.createShape = function(options) {
            var parentClass = null;
            console.log(options.shapeType);
            if(options.shapeType === 'rect') {
                parentClass = ShapeService.createRect;
            } else if(options.shapeType === 'ellipse') {
                parentClass = ShapeService.createEllipse;
            } else if(options.shapeType === 'triangle') {
                parentClass = ShapeService.createTriangle;
            }
            
            return new parentClass(options);
        }
        return drawingFactory;
    };
})();