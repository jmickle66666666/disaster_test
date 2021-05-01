var key = load("keycodes.js");
var gui = load("gui.js");
var scenes = load("scenes.js");

var path = [];
var pathColor = {r: 255, g:180, b:0};
var pointColor = {r: 255, g:255, b:0};

var drawing = false;
var playing = false;
var pathLength = 0;

function init()
{
    path = [];
    drawing = true;
}

function update(dt)
{
    if (drawing) {
        if (Input.mouseLeftDown)
        {
            path.push({x: Input.mouseX, y: Input.mouseY});
            calcPathLength();
        }
    
        if (Input.mouseRightDown)
        {
            if (path.length > 0) {
                path.splice(path.length-1, 1);
                log("right");
                calcPathLength();
            }
        }

        if (Input.getKeyDown(key.return)) {
            drawing = false;
        }

        if (path.length > 0) {
            Draw.line(path[path.length-1].x, path[path.length-1].y, Input.mouseX, Input.mouseY, pathColor)
        }

        Draw.strokeRect(Input.mouseX-1, Input.mouseY-1, 3, 3, pointColor);
    } else {
        gui.button("test");
    }


    if (Input.getKeyDown(key.escape))
    {
        scenes.goToMainMenu();
    }

    for (var i = 0; i < path.length; i++)
    {
        if (i != 0) {
            Draw.line(path[i-1].x, path[i-1].y, path[i].x, path[i].y, pathColor);
        }

        Draw.strokeRect(path[i].x-1, path[i].y-1, 3, 3, pointColor);
    }

    gui.label("points: "+path.length);
    gui.label("path length: "+pathLength);
}

function close()
{

}

function calcPathLength()
{
    pathLength = 0;
    for (var i = 1; i < path.length; i++)
    {
        pathLength += distance(path[i-1].x, path[i-1].y, path[i].x, path[i].y);
    }
}

function distance(x1, y1, x2, y2)
{
    var a = (x2 - x1);
    var b = (y2 - y1);
    return Math.sqrt(a*a + b*b);
}