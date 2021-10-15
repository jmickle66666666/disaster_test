// cool camera stuff
var gui = load("lib/gui.js");
var vmath = load("lib/vmath.js");

var sensitivity = {
    x: -.4,
    y: .4
};

var position = {x: 0, y: .75, z: 0};
var rotation = {x: 0, y: 0, z: 0};
var lmpos;
var d2r = 3.14 / 180;
var moveSpeed = 10;
var moving = false;

function startControl()
{
    lmpos = {x:Input.mouseX, y:Input.mouseY};
}

function fpsControl(dt)
{
    rotation.x += (Input.mouseY - lmpos.y) * sensitivity.y;
    rotation.y += (Input.mouseX - lmpos.x) * sensitivity.x;

    var move = {x: 0, y: 0, z: 0};

    moving = false;

    if (Input.getKey(Key.d)) { move.x += 1; moving = true; }
    if (Input.getKey(Key.a)) { move.x -= 1; moving = true; }
    if (Input.getKey(Key.w)) { move.z += 1; moving = true; }
    if (Input.getKey(Key.s)) { move.z -= 1; moving = true; }
    if (Input.getKey(Key.q)) { move.y += 1; moving = true; }
    if (Input.getKey(Key.e)) { move.y -= 1; moving = true; }

    //gui.label(rotation.x + "," +rotation.y+","+rotation.z);
    
    var trans = Draw.getCameraTransform();
    trans.right = vmath.mul(trans.right, move.x * moveSpeed * dt);
    trans.up = vmath.mul(trans.up, move.y * moveSpeed * dt);
    trans.forward = vmath.mul(trans.forward, move.z * moveSpeed * dt);
    position = vmath.add(position, trans.right);
    position = vmath.add(position, trans.forward);
    position = vmath.add(position, trans.up);
    
    //gui.objectEditor("trans", trans);
    


    Draw.setCamera(position, rotation);
    lmpos.x = Input.mouseX;
    lmpos.y = Input.mouseY;
}