var colliders = [];

function bbox(x, y, width, height, name, object)
{
    colliders.push(
        {
            x: x, y: y, width: width, height: height, name: name, object: object
        }
    );
}

var debugColorBbox = {r: 50, g:255, b:25};
var debugColorOverlap = {r: 255, g:100, b:25};
var debugEnabled = false;

function resolve()
{
    for (var i = 0; i < colliders.length; i++)
    {
        var c1 = colliders[i];
        if (debugEnabled) {
            Draw.rect(c1.x, c1.y, c1.width, c1.height, debugColorBbox, false);
        }
        for (var j = i + 1; j < colliders.length; j++)
        {
            var c2 = colliders[j];
            if (c1.x + c1.width >= c2.x && c1.y + c1.height >= c2.y && c1.x < c2.x + c2.width && c1.y < c2.y + c2.height)
            {
                if (debugEnabled) {
                    Draw.rect(c1.x, c1.y, c1.width, c1.height, debugColorOverlap, false);
                }

                if (c1.object != null) { 
                    c1.object.collide(c2.name);
                }
                if (c2.object != null) {
                    c2.object.collide(c1.name);
                }
            }
        }
    }

    colliders = [];
}