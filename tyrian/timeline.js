var enemies = load("tyrian/enemies.js");
var enemyTypes = load("tyrian/enemytypes.js");

var level = "";
var lines = [];
var lineIndex = -1;
var waitTime = 0;
var next = null;
var done = true;
var length = 0;

function loadlevel(path)
{
    level = Assets.readText(path);
    lines = level.split(/\r?\n/);
    lineIndex = -1;
    waitTime = 0.1;
    next = null;
    done = false;
    calculateLevelTime();
}

function update(dt)
{
    if (done) return;
    if (waitTime <= 0) {
        spawnNext();
        readLine();
    } else {
        waitTime -= dt;
    }
}

function calculateLevelTime()
{
    length = 0
    for (var i = 0; i < lines.length; i++)
    {
        var line = lines[i];
        if (line == "" || line[0] == "#")
        {
            continue;
        }
        
        length += parseFloat(line.split(' ')[0]);
    }
    if (length == 0) length = 1;
}

function spawnNext()
{
    if (next == null) return;

    enemies.addEnemy(next.xPosition, -16, next.moveType, next.speed, enemyTypes.list[next.shipType]);

    next = null;
}

function readLine()
{
    lineIndex += 1;
    if (lineIndex >= lines.length) { done = true; return; }
    
    var line = lines[lineIndex];
    log(line);

    while (line == "" || line[0] == "#")
    {
        readLine();
        return;
    }

    var tokens = line.split(' ');
    
    var time = parseFloat(tokens[0]);

    next = {
        shipType: tokens[1],
        moveType: tokens[2],
        xPosition: parseFloat(tokens[3]),
        speed: parseFloat(tokens[4]),
    };

    if (time == 0) {
        spawnNext();
        readLine();
        return;
    } else {
        waitTime = time;
    }
}