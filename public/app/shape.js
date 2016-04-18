var MyApp = {};
function setUpFabric() {
    MyApp.canvas = new fabric.Canvas('c');
    MyApp.keepSquare = false;
    MyApp.designId;
    if(canvasDesign !== 1) {
        console.log(canvasDesign);
        MyApp.designId = canvasDesign._id;
        MyApp.canvas.loadFromJSON(canvasDesign.design, MyApp.canvas.renderAll.bind(MyApp.canvas));
    }
    var line, isDown, startPosition={}, shape, drawingMode = true;
    MyApp.canvas.selection = false;
    MyApp.shapeType = 'rect';
    MyApp.canvas.on('mouse:down', function(event) {
        if(!drawingMode) return;
        isDown = true;
        startPosition.x = event.e.offsetX - 5;
        startPosition.y = event.e.offsetY - 5;
        
        console.log(MyApp.shapeType);
        switch(MyApp.shapeType) {
            case 'rect':
                shape = new fabric.Rect({
                    left: startPosition.x,
                    top: startPosition.y,
                    width:0,
                    height:0,
                    stroke:'black',
                    strokeWidth:1,
                    fill:'transparent'
                });
                break;
            case 'ellipse':
                shape = new fabric.Ellipse({
                    left: startPosition.x,
                    top: startPosition.y,
                    originX: 'left',
                    originY: 'top',
                    rx: 0,
                    ry: 0,
                    fill: 'transparent',
                    stroke: 'black',
                    strokeWidth: 1
                });
                break;
            case 'triangle':
                shape = new fabric.Triangle({
                    left: startPosition.x,
                    top: startPosition.y,
                    width:0,
                    height:0,
                    fill: 'transparent',
                    stroke: 'black',
                    strokeWidth: 1,
                });
                break;
            case 'polygon':
                var points = starPolygonPoints(5, 0, 0);
                shape = new fabric.Polygon(points, {
                    stroke: 'black',
                    left: startPosition.x - 10,
                    top: startPosition.y - 10,
                    originX: 'left',
                    originY: 'top',
                    fill: 'transparent',
                    strokeWidth: 1,
                    strokeLineJoin: 'bevil',
                    centeredScaling: true
                }, true);
        }
        MyApp.canvas.add(shape);
    });
    
    MyApp.canvas.on('mouse:move', function(event) {
        var deltaX, deltaY;
        if(!isDown || !drawingMode) return;
        switch(MyApp.shapeType) {
            case 'rect':
                if(MyApp.keepSquare) {
                    deltaX = event.e.offsetX - startPosition.x;
                    deltaY = deltaX;
                } else {
                    deltaX = event.e.offsetX - startPosition.x;
                    deltaY = event.e.offsetY - startPosition.y;
                }
       
                shape.setWidth(deltaX);
                shape.setHeight(deltaY);
                shape.setCoords();
                break;
            case 'ellipse':
                var rx = Math.abs(startPosition.x - event.e.offsetX) / 2;
                var ry = Math.abs(startPosition.y - event.e.offsetY) / 2;
                if( rx > shape.strokeWidth) {
                    rx -= shape.strokeWidth / 2;
                }                
                if( ry > shape.strokeWidth) {
                    ry -= shape.strokeWidth / 2;
                }
                shape.set({rx: rx, ry: ry});
                
                if(startPosition.x > event.e.offsetX) {
                    shape.set({originX: 'right'});
                } else {
                    shape.set({originX: 'left'});
                }
                if(startPosition.y > event.e.offsetY) {
                    shape.set({originY: 'bottom'});
                } else {
                    shape.set({originY: 'top'});
                }
                shape.setCoords();
                break;
            case 'triangle':
                deltaX = event.e.offsetX - startPosition.x;
                deltaY = event.e.offsetY - startPosition.y;
                shape.setWidth(deltaX);
                shape.setHeight(deltaY);
                shape.setCoords();
                break;
            case 'polygon':
                var centerX = shape.getCenterPoint().x;
                console.log(shape.getCenterPoint());
                var radius = (event.e.offsetX - startPosition.x) / 2;
                var points = starPolygonPoints(shape.get('points').length / 2, radius, radius / 2);
                var boundingBox = shape.getBoundingBox();
                shape.set({points: points, width: boundingBox.width, height: boundingBox.height});
                shape.setCoords();
//                shape.set({left: boundingBox.topLeft, top})
                break;
        }
        
        MyApp.canvas.renderAll();
    });
    
    MyApp.canvas.on('mouse:up', function(event) {
        isDown = false;

        if(drawingMode) {
            if(MyApp.shapeType === 'rect') {
                if(event.e.offsetY - startPosition.y < 0) {
                    console.log('change spinner');
                    shape.top = event.e.offsetY;
                    shape.setHeight(shape.getHeight() * -1);
                    shape.setCoords();
                }
            } else if(MyApp.shapeType === 'triangle') {
                if(event.e.offsetY - startPosition.y < 0) {
                    shape.top = event.e.offsetY;
                    shape.setHeight(shape.getHeight() * -1);
                    shape.rotate(180);
                    shape.setCoords();
                }
            }
//            MyApp.canvas.add(shape);
            MyApp.canvas.setActiveObject(shape);
//            MyApp.canvas.off('mouse:move');

        } 
    });
    
    MyApp.canvas.on('object:selected', function() {
        drawingMode = false;
        var shape = MyApp.canvas.getActiveObject();
        MyApp.shapeType = shape.type;
        console.log(MyApp.shapeType);
    });
    MyApp.canvas.on('selection:cleared', function() {
        drawingMode = true;
    });
    
    MyApp.canvas.observe('object:modified', function(e) {
        e.target.resizeToScale();
    });
    
    fabric.Object.prototype.resizeToScale = function() {
        switch(this.type) {
            case 'rect':
                this.width *= this.scaleX;
                this.height *= this.scaleY;
                this.scaleX = 1;
                this.scaleY = 1; 
                break;
            case 'ellipse':
                this.rx *= this.scaleX;
                this.ry *= this.scaleY;
                this.width = this.rx * 2;
                this.height = this.ry * 2;
                this.scaleX = 1;
                this.scaleY = 1;
                break;
            case 'triangle':
                this.width *= this.scaleX;
                this.height *= this.scaleY;
                this.scaleX = 1;
                this.scaleY = 1;
                break;
            case 'polyline':
            case 'polygon':
                var points = this.get('points');
                for (var i = 0; i < points.length; i++) {
                    var p = points[i];
                    p.x *= this.scaleX;
                    p.y *= this.scaleY;
                }
                this.scaleX = 1;
                this.scaleY = 1;
                this.width = this.getBoundingBox().width;
                this.height = this.getBoundingBox().height;
                break;
        }

    }
    fabric.Object.prototype.getBoundingBox = function() {
        var minX = null;
        var minY = null;
        var maxX = null;
        var maxY = null;
        switch( this.type) {
            case 'polygon':
            case 'polyline':
                var points = this.get('points');
                
                for(var i = 0; i < points.length; i++) {
                    if(typeof (minX) == undefined) {
                        console.log('setting min x');
                        minX = points[i].x;
                    } else if(points[i].x < minX) {
                        console.log('changing min x');
                        minX = points[i].x;
                    }
                    if(typeof (minY) == undefined) {
                        minY = points[i].y;
                    } else if(points[i].y < minY) {
                        minY = points[i].y;
                    }
                    if(typeof (maxX) == undefined) {
                        maxX = points[i].x;
                    } else if(points[i].x > maxX) {
                        maxX = points[i].x;
                    }
                    if(typeof (maxY) == undefined) {
                        maxY = points[i].y;
                    } else if(points[i].y > maxY) {
                        maxY = points[i].y;
                    }
                }
                break;
        }
        return {
            topLeft: new fabric.Point(minX, minY),
            bottomRight: new fabric.Point(maxX, maxY),
            width: maxX - minX,
            height: maxY - minY
        }
    }
};

window.deleteShape = function() {
    console.log('deleting shape');
    var shapeToRemove = MyApp.canvas.getActiveObject();
    MyApp.canvas.remove(shapeToRemove);
    MyApp.canvas.remove(shapeToRemove);
    
//    MyApp.canvas.clear();
    MyApp.canvas.renderAll();
}
function changeShapeToRect() {
    MyApp.shapeType = 'rect';
}
function changeShapeToEllipse() {
    MyApp.shapeType = 'ellipse';
}
function changeShapeToTriangle() {
    MyApp.shapeType = 'triangle';
}
function starPolygonPoints(spikeCount, outerRadius, innerRadius) {
    //var rot = Math.PI / 2 * 3;
    var cx = outerRadius;
    var cy = outerRadius;
    var sweep = Math.PI / spikeCount;
    var points = [];
    var angle = 0;
    
    for (var i = 0; i < spikeCount; i++) {
        var x = cx + Math.cos(angle) * outerRadius;
        var y = cy + Math.sin(angle) * outerRadius;
        points.push({x: x, y: y});
        angle += sweep;
        
        x = cx + Math.cos(angle) * innerRadius;
        y = cy + Math.sin(angle) * innerRadius;
        points.push({x: x,y: y});
        angle += sweep;
    }
    return points;
}
function saveCanvas() {
    var canvasJson = MyApp.canvas.toJSON();
    console.log(canvasJson);
    var canvasString = JSON.stringify(canvasJson);

    $.post('http://localhost:3000/save', {id: MyApp.designId, json: canvasString}, function(id) {
        console.log(id);
        MyApp.designId = id;
    });
}
function onKeyDownHandler(e) {
    switch (e.keyCode) {
        case 46:
            if(MyApp.canvas.getActiveObject()) {
                console.log('trying to delete');
                var shapeToRemove = MyApp.canvas.getActiveObject();
                MyApp.canvas.remove(shapeToRemove);
                MyApp.canvas.remove(shapeToRemove);
                MyApp.canvas.renderAll();
                return;
            }
            break;
        case 16:
            MyApp.keepSquare = true;
            break;
    }
}
function onKeyUpHandler(e) {
    switch( e.keyCode) {
        case 16: 
            console.log('shift released');
            MyApp.keepSquare = false;
            break;
    }
}
window.onkeydown = onKeyDownHandler;
window.onkeyup = onKeyUpHandler;
window.onload = setUpFabric;