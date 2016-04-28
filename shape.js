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