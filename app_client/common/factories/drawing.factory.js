(function() {
    angular.module('app')
        .factory('DrawingService', DrawingService);
    
    DrawingService.$inject = ['ShapeService'];
    function DrawingService(ShapeService) {
        
        var drawingFactory = {};
        
        drawingFactory.createShape = function(options, callback) {
            var parentClass = null;
            console.log(options.shapeType);
            if(options.shapeType === 'rect') {
                parentClass = ShapeService.createRect;
            } else if(options.shapeType === 'ellipse') {
                parentClass = ShapeService.createEllipse;
            } else if(options.shapeType === 'triangle') {
                parentClass = ShapeService.createTriangle;
            } else if(options.shapeType === 'imgShape') {
                parentClass = ShapeService.createImgShape;
            } else if(options.shapeType === 'i-text') {
                parentClass = ShapeService.createText;
            } else if(options.shapeType === 'polygon') {
                parentClass = ShapeService.createPolygon;
            } else if(options.shapeType === 'line') {
                parentClass = ShapeService.createLine;
            }
            
            new parentClass(options, function(shape) {
                callback(shape);
            });
        }
        return drawingFactory;
    };
})();