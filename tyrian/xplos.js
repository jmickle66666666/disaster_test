var screenshake = load("tyrian/screenshake.js");
var xplos = [];

function addBig(x, y)
{
    Audio.playSound("audio/hit2.wav");
    screenshake.shake(20);
    var newXplos = {
        x: x,
        y: y,
        t: 0,
        big : true,
        silent : false
    };
    for (var i = 0; i < xplos.length; i++)
    {
        if (xplos[i] == null) {
            xplos[i] = newXplos;
            return;
        }
    }
    xplos.push(newXplos);
}

function addMultiple(x, y, amount)
{
    for (var i = 0; i < amount; i++)
    {
        add(x,y);
    }
}

function add(x, y)
{
    var rx = -4 + Math.random() * 8;
    var ry = -4 + Math.random() * 8;
    var rt = Math.random() * -.125;
    var newXplos = {
        x: x + rx, 
        y: y + ry, 
        t: rt,
        big : false,
        silent : false
    }
    for (var i = 0; i < xplos.length; i++)
    {
        if (xplos[i] == null) {
            xplos[i] = newXplos;
            return;
        }
    }
    xplos.push(newXplos);
}

function addSilent(x, y)
{
    var rx = -4 + Math.random() * 8;
    var ry = -4 + Math.random() * 8;
    var rt = Math.random() * -.125;
    var newXplos = {
        x: x + rx, 
        y: y + ry, 
        t: rt,
        big : false,
        silent : true
    }
    for (var i = 0; i < xplos.length; i++)
    {
        if (xplos[i] == null) {
            xplos[i] = newXplos;
            return;
        }
    }
    xplos.push(newXplos);
}

var speed = 16;
var soundRate = 0.1;
var soundTimer = 0;

function update(dt)
{
    var playSound = false;
    for (var i = 0; i < xplos.length; i++)
    {   
        if (xplos[i] == null) continue;
        if (xplos[i].t >= 0)  {
            var frame = Math.floor(xplos[i].t * speed);
            if (frame > 6) {
                xplos[i] = null;
                continue;
            }
            if (xplos[i].big) {
                if (frame > 2) {
                    addSilent(xplos[i].x, xplos[i].y);
                    addSilent(xplos[i].x, xplos[i].y);
                    addSilent(xplos[i].x, xplos[i].y);
                    addSilent(xplos[i].x, xplos[i].y);
                    addSilent(xplos[i].x, xplos[i].y);
                    xplos[i] = null;
                    continue;
                } else {
                    Draw.texturePart(
                        xplos[i].x - 8, 
                        xplos[i].y - 8, 
                        { x: 96, y: frame * 16, w:16, h: 16 },
                        "tyrian/sprites/sprites.png"
                    );
                }
            } else {
                Draw.texturePart(
                    xplos[i].x - 8, 
                    xplos[i].y - 8, 
                    { x: 112, y: frame * 16, w:16, h: 16 },
                    "tyrian/sprites/sprites.png"
                );
            }
        }
        var played = xplos[i].t < 0;
        xplos[i].t += dt;
        if (played && xplos[i].t >= 0 && !xplos[i].silent) {
            playSound = true;
        }
    }
    if (playSound && soundTimer > soundRate) {
        Audio.playSound("audio/hit1.wav");
        soundTimer = 0;
    }
    soundTimer += dt;
}