var key = load("lib/keycodes.js");
var game = load("game.js");
var gui = load("lib/gui.js");
var collision = load("lib/collision.js");

var x = 0;
var y = 0;
var z = 1;
var spriteFrame = 0;

var momx = 0;
var momy = 0;

var moveSpeed = 100;
var gravity = 800;
var jumpHeight = 300;

var coyoteTime = 0.15;
var airTime = 0;

var collisionRect = {x: -4, y: 4, w:8, h:12};
var flipX = false;
var runFrame = 0;

var hurtTimer = 0;

var solidTiles = [
    16, 17, 18, 19, 20,
    64, 65, 66, 67, 68,
    80, 81, 82, 83, 84,
];

var camTarget = {x:0, y:0};

function init()
{
    camTarget.x = x - 160;
    camTarget.y = y - 120;
    game.camera.x = camTarget.x;
    game.camera.y = camTarget.y;
}

function lateUpdate(dt)
{
    camTarget.x = x - 160;
    camTarget.y = y - 140;

    game.camera.x = lerp(game.camera.x, camTarget.x, 10 * dt);
    game.camera.y = lerp(game.camera.y, camTarget.y, 10 * dt);
}

function lerp(a, b, t)
{
    return a * (1-t) + b*t;
}

function update(dt)
{
    var movx = 0;
    var movy = 0;
    if (hurtTimer <= 0) {
        momx = 0;
        if (Input.getKey(key.left)) momx = -moveSpeed;
        if (Input.getKey(key.right)) momx = moveSpeed;
        if (momx!=0) {
            if (momx < 0) flipX = 1; else flipX = 0;
        }
    } else {
        momx *= 0.95;
    }
        
    movx = momx * dt;
    movy = momy * dt;
    momy += gravity * dt;


    if (!collideTiles(x + movx, y)) {
        x += movx;
    } else {
        x = Math.floor(x);
        var s = Math.sign(movx);
        while (!collideTiles(x + s, y))
        {
            x += s;
        }
    }

    if (!collideTiles(x, y + movy)) {
        y += movy;
    } else {
        momy = 0;
        var s = Math.sign(movy);
        while (!collideTiles(x, y + s))
        {
            y += s;
        }
    }

    var onGround = collideTiles(x, y + 1);
    if (!onGround) {
        airTime += dt;
    } else {
        airTime = 0;
    }

    if (airTime < coyoteTime && hurtTimer <= 0) {
        if (Input.getKeyDown(key.z)) {
            momy = -jumpHeight;
        }
    }

    if (hurtTimer > 0) {
        spriteFrame = Math.floor(8 + (hurtTimer * 12) % 2);
        hurtTimer -= dt;
    } else if (!onGround) {
        if (Math.abs(momy) < 50) {
            spriteFrame = 4;
        } else {
            if (momy < 0) spriteFrame = 7;
            if (momy > 0) spriteFrame = 5;
        }
    } else {
        spriteFrame = 0;
        if (movx != 0) {
            runFrame += dt;
            spriteFrame = Math.floor((1 + runFrame * 12) % 3);
        } else {
            runFrame = 0;
            if (Input.getKey(key.up)) {
                spriteFrame = 3;
            }
        }
    }

    Draw.texturePart(
        Math.floor(x - 16) - game.camera.x, 
        Math.floor(y - 16) - game.camera.y, 
        { x: spriteFrame * 32, y: flipX * 32, w:32, h: 32},
        "sprites/platsprites.png"
    );

    collision.bbox(x - game.camera.x + collisionRect.x, y - game.camera.y + collisionRect.y, collisionRect.w, collisionRect.h, this);

    // if (Input.getKeyDown(key.h)) {
    //     hurt();
    // }

    //Draw.rect(x + collisionRect.x, y + collisionRect.y, collisionRect.w, collisionRect.h, {r: 255, g:255, b:255}, false);
}

function hurt(direction)
{
    hurtTimer = 1;
    momx = 200 * direction;
    momy = -jumpHeight * 0.5;
}

function collideTiles(atX, atY)
{
    for (var i = 0; i < collisionRect.w; i++)
    {
        for (var j = 0; j < collisionRect.h; j++)
        {
            var a = Math.floor((i + atX + collisionRect.x)/16);
            var b = Math.floor((j + atY + collisionRect.y)/16);
            var tile = game.level.getTile(a, b);
            for (var k = 0; k < solidTiles.length; k++)
            {
                if (solidTiles[k] == tile) return true;
            }
        }
    }

    return false;
}