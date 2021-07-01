// cool camera stuff
var gui = load("lib/gui.js");
var key = load("lib/keycodes.js");
var vmath = load("lib/vmath.js");

var sensitivity = {
    x: -.4,
    y: .4
};

var position = {x: 0, y: 5, z: 0};
var rotation = {x: 30, y: 0, z: 0};
var lmpos;
var d2r = 3.14 / 180;
var moveSpeed = 10;

function startControl()
{
    lmpos = {x:Input.mouseX, y:Input.mouseY};
}

function fpsControl(dt)
{
    rotation.x += (Input.mouseY - lmpos.y) * sensitivity.y;
    rotation.y += (Input.mouseX - lmpos.x) * sensitivity.x;

    var move = {x: 0, y: 0, z: 0};

    if (Input.getKey(key.d)) { move.x += 1; }
    if (Input.getKey(key.a)) { move.x -= 1; }
    if (Input.getKey(key.w)) { move.z += 1; }
    if (Input.getKey(key.s)) { move.z -= 1; }

    gui.label(rotation.x + "," +rotation.y+","+rotation.z);
    
    var trans = Draw.getCameraTransform();
    trans.right = vmath.mul(trans.right, move.x * moveSpeed * dt);
    trans.forward = vmath.mul(trans.forward, move.z * moveSpeed * dt);
    position = vmath.add(position, trans.right);
    position = vmath.add(position, trans.forward);
    
    gui.objectEditor("trans", trans);
    


    Draw.setCamera(position, rotation);
    lmpos.x = Input.mouseX;
    lmpos.y = Input.mouseY;
}