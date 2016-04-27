(function() {
    angular.module('app')
            .factory('ShapeService', ShapeService);
    
    function ShapeService() {
        
        var shapeFactory = {};
        
        shapeFactory.createRect = function(options) {
            var rect = new fabric.Rect({
                left: options.startPosition.x,
                top: options.startPosition.y,
                width:10,
                height:10,
                stroke:'black',
                strokeWidth:1,
                fill:'transparent'
            });
            return rect;
        }
        shapeFactory.createEllipse = function(options) {
            var ellipse = new fabric.Ellipse({
                left: options.startPosition.x,
                top: options.startPosition.y,
                originX: 'left',
                originY: 'top',
                rx: 0,
                ry: 0,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 1                
            });
            return ellipse;
        }
        shapeFactory.createTriangle = function(options) {
            var triangle = new fabric.Triangle({
                left: options.startPosition.x,
                top: options.startPosition.y,
                width:0,
                height:0,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 1            
            });
            return triangle;
        }
        
        return shapeFactory;
    };
    
    
})();