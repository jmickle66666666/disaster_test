var colors = load("colors.js");
var gui = load("gui.js");

var filled = false;

function init()
{

}

function close()
{

}

function angleoff(angle, distance)
{
    angle /= 180 / 3.14;
    var x = Math.cos(angle) * distance;
    var y = Math.sin(angle) * distance;
    return {x: x, y: y};
}

var angle = 0;
var sides = 10;
var t = 0;

function update(dt)
{
    t += dt;
    var size = 30 + Math.sin(t * 1) * 8;
    Draw.text(160 - 28, 70, "success :)", colors.disaster);
    Draw.circle(160, 120, size, colors.skyblue, true);
    Draw.circle(160, 120, size, colors.disaster, false);

}