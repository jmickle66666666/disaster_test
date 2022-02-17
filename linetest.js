var camera = load("lib/camera.js");
var gui = load("lib/gui.js");
var vmath = load("lib/vmath.js");

var start = {x: 0, y: 0, z: -10};
//var end = {x: 1, y: 1, z: -10};
var normal = {x: 1, y: 1, z:0};
var length = 2;
var end = vmath.add(start, vmath.mul(normal, length));
var angle = 0;

function update(dt)
{
    if (Input.mouseRightDown) { Input.lockMouse(); camera.startControl(); }
    if (Input.mouseRight) { camera.fpsControl(dt); }
    if (Input.mouseRightUp) { Input.unlockMouse(); }

    //angle += dt;

    // end.x = Math.sin(angle);
    // end.z = Math.cos(angle) - 10;

    //Draw.line3d({x: 0, y: 0, z:0}, {x:1, y:0, z:0}, Color.gray);
    // Draw.line3d({x: 1, y: 0, z:1}, {x:1, y:0, z:0}, Color.gray);
    // Draw.line3d({x: 1, y: 0, z:1}, {x:0, y:0, z:1}, Color.gray);
    // Draw.line3d({x: 0, y: 0, z:0}, {x:0, y:0, z:1}, Color.gray);
    
    Draw.line3d(start, end, Color.disaster);
    gui.transform1d(end, vmath.normalise(vmath.sub(end, start)));
    //gui.transform1d(start, vmath.sub(end, start));
}