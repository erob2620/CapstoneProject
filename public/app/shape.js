var MyApp = {};
function setUpFabric() {
    MyApp.canvas = new fabric.Canvas('c');
    
    var line, isDown, startPosition={}, rect, drawingMode = true;
    MyApp.canvas.selection = false;
    MyApp.canvas.on('mouse:down', function(event) {
        if(!drawingMode) return;
        isDown = true;
        startPosition.x = event.e.offsetX - 5;
        startPosition.y = event.e.offsetY - 5;
        
        console.log(startPosition);
        
        rect = new fabric.Rect({
            left: startPosition.x,
            top: startPosition.y,
            width:0,
            height:0,
            stroke:'black',
            strokeWidth:1,
            fill:undefined
        });
        MyApp.canvas.add(rect);
        
    });
    
    MyApp.canvas.on('mouse:move', function(event) {
        if(!isDown || !drawingMode) return;
        var deltaX = event.e.offsetX - startPosition.x;
        var deltaY = event.e.offsetY - startPosition.y;
        console.log(deltaX + '  ' + deltaY);
        rect.setWidth(deltaX);
        rect.setHeight(deltaY);
        
        MyApp.canvas.renderAll();
    });
    
    MyApp.canvas.on('mouse:up', function(event) {
        isDown = false;
        MyApp.canvas.add(rect);
//        MyApp.canvas.setActiveObject(rect);
    });
    
    MyApp.canvas.on('object:selected', function() {
        drawingMode = false;
    });
    MyApp.canvas.on('selection:cleared', function() {
        drawingMode = true;
    });
    
    MyApp.canvas.observe('object:modified', function(e) {
        e.target.resizeToScale();
    });
    
    fabric.Object.prototype.resizeToScale = function() {
        this.width *= this.scaleX;
        this.height *= this.scaleY;
        this.scaleX = 1;
        this.scaleY = 1;
    }
};
window.deleteShape = function() {
    console.log('deleting shape');
    MyApp.canvas.getActiveObject().remove();
}
function onKeyDownHandler(e) {
    switch (e.keyCode) {
        case 46:
            if(MyApp.canvas.getActiveObject()) {
                console.log('trying to delete');
                var shape = MyApp.canvas.getActiveObject();
                MyApp.canvas.remove(shape);
                MyApp.canvas.renderAll();
                return;
            }
    }
}
window.onkeydown = onKeyDownHandler;
window.onload = setUpFabric;