
var key = load("keycodes.js");
var gui = load("gui.js");
var scenes = load("scenes.js");

var color = { r: 255, g: 127, b: 20, a: 255 };
var color2 = { r: 255, g: 127, b: 20, a: 255 };
var position = {x: 0, y: -1, z: -5};
var rotation = {x: 0, y: 0, z: 0};

var GlobalOffset = {x: 0, y: 0, z: -16};

var ShipIntroLoc = {x: 0, y: -4, z: 0};
var SkyColor = {r: 188, g: 148, b: 192};
var shipX = 0;
var shipY = 0;
var shipSpeed = 1/320;
var shipMomentum = {
    x:0, y:0
};
var friction = -.01 / 2;

var t = 0;

function init()
{
    //Audio.playMusic("scenes/lunaship/music.ogg");

    t = 0;
    shipX = 0;
    shipY = 0;
    shipMomentum = {
        x:0, y:0
    };

    Draw.enableFog();
}

function clamp(cur, min, max)
{
    return Math.min(Math.max(cur, min), max);
}

function lerp(cur, target, alpha)
{
    return (cur + ((target - cur) * clamp(alpha, 0, 1)));
}

function lerpV3(cur,target,alpha)
{
    return {
        x: lerp(cur.x,target.x,alpha),
        y: lerp(cur.y,target.y,alpha),
        z: lerp(cur.z,target.z,alpha),
    }
}

function update(dt)
{
    t += dt;

    Draw.setClearColor(SkyColor);
    Draw.setFog(SkyColor, 16.0, 192.0);

    // gui.label("mouse "+Input.mouseX+" "+Input.mouseY+" "+Input.mouseLeft+" "+Input.mouseLeftDown);
    //gui.label("label "+(scenes));
    gui.space(5);
    gui.button("fucken,, leave", function() {scenes.goToMainMenu();});

    var ct = t * 10;
    color2.b = 128 + Math.sin(ct) * 128;
    color2.r = 128 + Math.sin(ct + 2) * 128;
    color2.g = 128 + Math.sin(ct + 4) * 128;
    Draw.text(75, 24, "LUNA SHIP ZONE", color2);

    var mx = 0;
    var my = 0;
    if(t > 2.5)
    {
    if (Input.getKey(key.left)) { mx -= 1; }
    if (Input.getKey(key.right)) { mx += 1; }
    if (Input.getKey(key.up)) { my += 1; }
    if (Input.getKey(key.down)) { my -= 1; }
    }

    shipMomentum.x += shipSpeed * mx * dt * 1000;
    shipMomentum.y += shipSpeed * my * dt * 1000;
    shipMomentum.x *= Math.exp(friction * dt * 1000);
    shipMomentum.y *= Math.exp(friction * dt * 1000);
    shipX += (shipMomentum.x * dt) * 35;
    shipY += (shipMomentum.y * dt) * 35;

    shipX = clamp(shipX, -8, 8);
    shipY = clamp(shipY, -6, 6);

/*
    if (Input.getKey(key.q)) {
        GlobalOffset.z -= dt / 100;
    }
    if (Input.getKey(key.d)) {
        GlobalOffset.x += dt / 100;
    }
    if (Input.getKey(key.e)) {
        GlobalOffset.z += dt / 100;
    }
    if (Input.getKey(key.a)) {
        GlobalOffset.x -= dt / 100;
    }
    if (Input.getKey(key.w)) {
        GlobalOffset.y += dt / 100;
    }
    if (Input.getKey(key.s)) {
        GlobalOffset.y -= dt / 100;
    }
*/
    var ShipPos =
    {x: GlobalOffset.x + shipX, 
     y: GlobalOffset.y + shipY, 
     z: GlobalOffset.z };

    ShipPos = lerpV3(ShipPos, ShipIntroLoc, 1 - clamp((t / 2.5), 0, 1) );

    gui.space(30)
    //gui.label("Ship Pos (" + Math.round(shipX) + ", " + Math.round(shipY) + "), ofs: " + Math.round(GlobalOffset.z));

    var cycle = ((t % 1.5) / 1.5) * 128;
    
    

    ShipRotation = {x: shipMomentum.y, y: -shipMomentum.x, z: -shipMomentum.x};

    
    var IdleHorz = Math.sin(t*1.5)/2;
    var IdleVert = Math.cos(t*2)/2;    
    var IdleHorzLagged = Math.cos(t*1.5)/2;
    var IdleVertLagged = Math.sin(t*2)/2;    

    ShipRotation.z += IdleHorzLagged / -4;
    ShipRotation.x += IdleVertLagged / -6;

    ShipPos.x += IdleHorz;
    ShipPos.y += IdleVert;

    
    Draw.model(
        ShipPos,
        ShipRotation,
        "scenes/lunaship/ship.obj",
        "scenes/lunaship/ship.tga"
    );

    Draw.model(
        {x: 0, y: 0, z: cycle},
        {x: 0, y: 0, z: 0},
        "scenes/lunaship/terrain.obj",
        "scenes/lunaship/terrain_texture_lit.tga"
    );

    Draw.model(
        {x: 0, y: 0, z: -128 + cycle},
        {x: 0, y: 0, z: 0},
        "scenes/lunaship/terrain.obj",
        "scenes/lunaship/terrain_texture_lit.tga"
    );

    Draw.model(
        {x: 0, y: 0, z: -256 + cycle},
        {x: 0, y: 0, z: 0},
        "scenes/lunaship/terrain.obj",
        "scenes/lunaship/terrain_texture_lit.tga"
    );
}

function close()
{
    Draw.setClearColor({r:0, g:0, b:0});
    Draw.setFog({r:0, g:0, b:0}, 128.0, 128);
    Draw.disableFog();
}