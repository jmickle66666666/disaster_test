var bgMesh = null;
var zero = {x:0, y:0, z:0};
var quadMesh = null;
var quadPos = {x:1, y:-.2, z:-3};
var quadRot = {x:0, y:-40, z:0};
var quadSize = 0.6;
var bandPos = {x:1, y:-.2, z:-3};
var file = load("lib/file.js");
var currentDir = "";

function init()
{
    if (bgMesh == null) {
        var vertices = [
            {x:-10, y:-5, z:-5},
            {x:-10, y:5, z:-5},
            {x:10, y:5, z:-5},
            {x:10, y:-5, z:-5}
        ];

        var indices = [0, 2, 1, 0, 3, 2];

        var c2 = {
            r: Color.disaster.r * 0.8,
            g: Color.disaster.g * 0.7,
            b: Color.disaster.b * 0.7
        };

        var colors = [
            c2, Color.disaster, Color.disaster, c2
        ];

        bgMesh = Assets.createMesh({
            vertices: vertices,
            indices: indices,
            colors: colors
        });
    }

    if (quadMesh == null) 
    {
        var vertices = [
            {x:0, y:0, z:0},
            {x:0, y:quadSize, z:0},
            {x:quadSize, y:quadSize, z:0},
            {x:quadSize, y:0, z:0},
        ];

        var indices = [
            0, 2, 1, 0, 3, 2
        ];

        var colors = [
            c2,Color.disaster,Color.black,Color.black
        ];

        var uvs = [
            {x:0, y:0},
            {x:0, y:1},
            {x:1, y:1},
            {x:1, y:0},
        ];

        quadMesh = Assets.createMesh({
            vertices: vertices,
            indices: indices,
            colors: colors,
            uvs: uvs
        });
    }

    fileList = file.listDir(currentDir);
}

var t = 0;
function update(dt)
{
    t += dt;
    Draw.model(bgMesh, zero, zero, "shaders/color");

    quadRot.y += dt * 40;
    Draw.model("exlcam.obj", quadPos, quadRot);
    
    Draw.model("tools/models/band.glb", bandPos, {
        x: t * 20, y: t * 9, z: t * 31
    }, "shaders/stripes");

    Draw.model("tools/models/band.glb", bandPos, {
        x: t * 31, y: t * 20, z: 100+t * 48
    }, "shaders/stripes");

    if (activeTimer < 1) activeTimer += dt * 8;
    if (activeTimer > 1) activeTimer = 1;
    if (Input.getKeyDown(Key.up)) {
        currentIndex -= 1;
        if (currentIndex < 0) currentIndex = 0;
        activeTimer = 0;
    }
    if (Input.getKeyDown(Key.down)) {
        currentIndex += 1;
        if (currentIndex >= fileList.files.length + fileList.directories.length) currentIndex = (fileList.files.length + fileList.directories.length)-1;
        activeTimer = 0;
    }

    if (currentDir != "")
    {
        fileButton(2 + 14 * i, "[up]", currentIndex == 0, function() {
            var upDir = Math.max(currentDir.lastIndexOf("\\"), currentDir.lastIndexOf("/"));
            if (upDir == -1) {
                currentDir = "";
            } else {
                currentDir = currentDir.substring(0, upDir-1);
            }
            fileList = file.listDir(currentDir);
        });
    }

    for (var i = 0; i < fileList.directories.length; i++)
    {
        var active = currentIndex == i;
        if (currentDir != "") active = currentIndex == i + 1;
        fileButton(18 + 14 * i, fileList.directories[i], active, function() {
            fileList = file.listDir(fileList.directories[currentIndex]);
            currentIndex = 0;
        });
    }
    for (var i = 0; i < fileList.files.length; i++)
    {
        
        var active = currentIndex == i + fileList.directories.length;
        if (currentDir != "") active = currentIndex == i + fileList.directories.length + 1;
        fileButton(18 + 14 * (i + fileList.directories.length), fileList.files[i], active, function() {
            log(fileList[files[i]]);
        });
    }

    if (Input.getKeyDown(Key.return) && currentIndex < fileList.directories.length) {
        
    }

    preview(100, 10, 210, 220);   
}

var fileList = {};

var currentIndex = 0;

var activeTimer = 0;
var b = {r:0, g:0, b:0, a:100};
function fileButton(y, text, active, action)
{
    var width = 80;
    Draw.rect(0, y, 100, 11, b, true);
    Draw.text(text, 10, y + 2, active?Color.white:Color.black);
    if (active) {
        var x = 10 + (width/2) * (1 - activeTimer);
        Draw.line(x, y, x + width/2 * (activeTimer*2), y, Color.white);
        Draw.line(x, y+10, x + width/2 * (activeTimer*2), y+10, Color.white);
        //Draw.rect(10 + (width/2) * (1 - activeTimer), y, width/2 * (activeTimer*2), 11, Color.white);
    }

    if (active && Input.getKeyDown(Key.return)) {
        action();
    }
}

function preview(x, y, width, height, file)
{
    Draw.setBlendMode("normal");
    var w = {r:255, g:255, b:255, a:100};
    Draw.rect(x, y, width + 1, height + 1, w, true);
    Draw.line(x, y, x + 50, y, Color.white);
    Draw.line(x, y, x, y + 10, Color.white);
    Draw.line(x + width - 50, y + height, x + width, y + height, Color.white);
    Draw.line(x + width, y + height, x + width, y + height - 10, Color.white);
}