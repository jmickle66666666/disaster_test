var colors = load("colors.js");
var score = 0;

var levelLength = 1;
var time = 0;

var timerRect = {
    x:8, y:80,
    w:8, h:8
};

var timerStartX = 253;
var timerWidth = 46;

function init(leveltime)
{
    time = 0;
    levelLength = leveltime;
}

function draw(dt)
{
    if (time < levelLength) {
        time += dt;
    } else {
        time = levelLength;
    }

    Draw.texture(0, 224, "tyrian/sprites/scorebar.png");
    Draw.texture(240, 0, "tyrian/sprites/sidebar.png");
    Draw.text(4, 230, "SCORE:"+score, colors.brown);
    Draw.text(4, 229, "SCORE:"+score, colors.disaster);

    Draw.texturePart(
        timerStartX + (timerWidth * (time/levelLength)), 14,
        timerRect,
        "tyrian/sprites/sprites.png"
    );
}