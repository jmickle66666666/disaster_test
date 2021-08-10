var tilemap = load("lib/tilemap.js");
var colors = load("lib/colors.js");
var collision = load("lib/collision.js");

var levelPath = "maps/zupeworld.json";
var level;
var entities = [];

var player;

var camera = {x:0, y:0};

function init()
{
    if (levelPath != "")
    {
        entities = [];
        level = tilemap.load(levelPath);
        for (var i = 0; i < level.entities.length; i++)
        {
            var newEnt = create(level.entities[i].script);
            newEnt.name = level.entities[i].name;
            newEnt.x = level.entities[i].x;
            newEnt.y = level.entities[i].y;
            var keys = Object.keys(level.entities[i].properties);
            for (var j = 0; j < keys.length; j++)
            {
                newEnt[keys[j]] = level.entities[i].properties[keys[j]];
            }
            entities.push(newEnt);
        }

        for (var i = 0; i < entities.length; i++)
        {
            if (entities[i].name == "player") {
                player = entities[i];
            }

            if (entities[i].init != undefined) entities[i].init();
        }
    }
}

function update(dt)
{
    if (Input.getKeyDown(Key.f5)) {
        collision.debugEnabled = !collision.debugEnabled;
    }

    Draw.rect(0, 0, Draw.screenWidth, Draw.screenHeight, colors.nightblue, true);
    level.render(-camera.x, -camera.y);

    // sort entities by z;

    entities.sort(function(a, b) {
        if (a.z == undefined) a.z = 0;
        if (b.z == undefined) b.z = 0;
        return a.z - b.z;
    });

    for (var i = 0; i < entities.length; i++)
    {
        if (entities[i].earlyUpdate != undefined) entities[i].earlyUpdate(dt);
    }

    for (var i = 0; i < entities.length; i++)
    {
        entities[i].update(dt);
    }

    for (var i = 0; i < entities.length; i++)
    {
        if (entities[i].lateUpdate != undefined) entities[i].lateUpdate(dt);
    }

    collision.resolve();
}