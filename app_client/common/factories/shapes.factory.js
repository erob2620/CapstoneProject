(function() {
    angular.module('app')
            .factory('ShapeService', ShapeService);
    
    function ShapeService() {
        
        var shapeFactory = {};
        
        shapeFactory.createRect = function(options, callback) {
            var rect = new fabric.Rect({
                left: options.startPosition.x,
                top: options.startPosition.y,
                width:0,
                height:0,
                stroke:'black',
                strokeWidth:1,
                fill:'transparent'
            });
            callback(rect);
        }
        shapeFactory.createEllipse = function(options, callback) {
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
            callback(ellipse);
        }
        shapeFactory.createTriangle = function(options, callback) {
            var triangle = new fabric.Triangle({
                left: options.startPosition.x,
                top: options.startPosition.y,
                width:0,
                height:0,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 1            
            });
            callback(triangle);
        }
        shapeFactory.createText = function(options, callback) {
            var text = new fabric.IText("Click to change text", {
                top: options.startPosition.x,
                left: options.startPosition.y,
                fontSize: 18,
            });
            callback(text);
        }
        shapeFactory.createImgShape = function(params, callback) {
            var group = [];
            fabric.loadSVGFromURL('svgs/imageShape.svg', function(objects, options) {
                var loadedObjects = new fabric.Group(group);
                loadedObjects.set({
                    left: params.startPosition.x,
                    top: params.startPosition.y,
                    fill: 'transparent',
                    stroke: 'black',
                    originX: 'left',
                    originY: 'top',
                    strokeWidth: 1,
                    type: 'imgShape',
                    transformMatrix: [1,0,0,1,0,0]
                });
                console.log(loadedObjects);
                callback(loadedObjects);
            },
            function(item, object) {
                object.set('id', item.getAttribute('id'));
                group.push(object);
            });

        }
        shapeFactory.createLine = function(params, callback) {
            var points = [params.startPosition.x,params.startPosition.y,params.startPosition.x, params.startPosition.y];
            console.log(points);
            var line = new fabric.Line(points, {
                strokeWidth: 3,
                fill: 'black',
                stroke: 'black',
                originX: 'center',
                originY: 'center'
            });
            callback(line);
        }
        shapeFactory.createPolygon = function(params, callback) {
            var points = regularPolygonPoints(6,5);
            var polygon = new fabric.Polygon(points, {
                stroke: 'black',
                left: params.startPosition.x,
                top: params.startPosition.y,
                strokeWidth: 2,
                fill:'transparent'
            }, false);
            callback(polygon);
        }
        function regularPolygonPoints(sideCount, radius) {
            var sweep = Math.PI*2/sideCount;
            var cx = radius;
            var cy = radius;
            var points = [];
            for(var i = 0; i < sideCount; i++) {
                var x = cx+radius*Math.cos(i*sweep);
                var y = cy+radius*Math.sin(i*sweep);
                points.push({x:x, y:y});
            }
            return points;
        }
        return shapeFactory;
    };
    
    
})();