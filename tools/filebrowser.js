var bgMesh = null;
var zero = {x:0, y:0, z:0};
var quadMesh = null;
var quadPos = {x:1, y:-.2, z:-3};
var quadRot = {x:0, y:-40, z:0};
var quadSize = 0.6;
var bandPos = {x:1, y:-.2, z:-3};
var file = load("lib/file.js");
var gui = load("lib/gui.js");
var currentDir = "";
var padding = 2;
var selectedFile = "";

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

    // if (activeTimer < 1) activeTimer += dt * 8;
    // if (activeTimer > 1) activeTimer = 1;
    // if (Input.getKeyDown(Key.up)) {
    //     currentIndex -= 1;
    //     if (currentIndex < 0) currentIndex = 0;
    //     activeTimer = 0;
    // }
    // if (Input.getKeyDown(Key.down)) {
    //     currentIndex += 1;
    //     if (currentIndex >= fileList.files.length + fileList.directories.length) currentIndex = (fileList.files.length + fileList.directories.length)-1;
    //     activeTimer = 0;
    // }

    // if (currentDir != "")
    // {
    //     fileButton(2 + 14 * i, "[up]", currentIndex == 0, function() {
    //         var upDir = Math.max(currentDir.lastIndexOf("\\"), currentDir.lastIndexOf("/"));
    //         if (upDir == -1) {
    //             currentDir = "";
    //         } else {
    //             currentDir = currentDir.substring(0, upDir-1);
    //         }
    //         fileList = file.listDir(currentDir);
    //     });
    // }

    // for (var i = 0; i < fileList.directories.length; i++)
    // {
    //     var active = currentIndex == i;
    //     if (currentDir != "") active = currentIndex == i + 1;
    //     fileButton(18 + 14 * i, fileList.directories[i], active, function() {
    //         fileList = file.listDir(fileList.directories[currentIndex]);
    //         currentIndex = 0;
    //     });
    // }
    // for (var i = 0; i < fileList.files.length; i++)
    // {
        
    //     var active = currentIndex == i + fileList.directories.length;
    //     if (currentDir != "") active = currentIndex == i + fileList.directories.length + 1;
    //     fileButton(18 + 14 * (i + fileList.directories.length), fileList.files[i], active, function() {
    //         log(fileList[files[i]]);
    //     });
    // }

    // if (Input.getKeyDown(Key.return) && currentIndex < fileList.directories.length) {
        
    // }

    var x = padding;
    var y = padding;

    backButtonArea(x, y, 20, 20);
    x += padding + 20;

    currentPathArea(x, y, Draw.screenWidth - x - padding, 20);
    y += padding + 20;
    x = padding;

    fileListArea(x, y, 100, Draw.screenHeight - y - padding*2 - 20);
    okCancelButtonArea(x, Draw.screenHeight - 20 - padding, 100, 20);
    x += padding + 100;

    previewArea(x, y, Draw.screenWidth - x - padding, Draw.screenHeight - y - padding);
}

function fileListArea(x, y, width, height)
{
    Draw.rect(x, y, width, height, Color.darkgray, true);
    Draw.nineSlice("button2.png", buttonSliceRect2, x, y, width, height);

    var ty = y + 6;
    for (var i = 0; i < fileList.directories.length; i++)
    {
        fileListButton(x+6, ty, width - 4, 12, fileList.directories[i], true);
        ty += 12;
    }

    for (var i = 0; i < fileList.files.length; i++)
    {
        fileListButton(x+6, ty, width - 4, 12, fileList.files[i], false);
        ty += 12;
    }
}

function fileListButton(x, y, width, height, path, isDirectory)
{
    if (path == selectedFile) {
        Draw.rect(x, y, width, height, Color.disaster);
    }
    if (mouseHover(x, y, width, height)) {
        Draw.rect(x, y, width, height, Color.white);

        if (Input.mouseLeftDown) {
            if (isDirectory) {
                openDirectory(path);
            } else {
                selectedFile = path;
            }
        }
    }
    Draw.text(
        file.stripToLocalPath(path), 
        x+2, y+2, 
        path==selectedFile?Color.white:Color.gray
    );
}

function currentPathArea(x, y, width, height)
{
    Draw.rect(x, y, width, height, Color.darkgray, true);
    Draw.nineSlice("button2.png", buttonSliceRect2, x, y, width, height);
    
    if (selectedFile != "") {
        Draw.text("> "+selectedFile, x+6, y+6, Color.white);
    } else {
        Draw.text("> "+currentDir, x+6, y+6, Color.white);
    }
}

function backButtonArea(x, y, width, height)
{
    Draw.rect(x, y, width, height, Color.darkgray, true);
    Draw.nineSlice("button2.png", buttonSliceRect2, x, y, width, height);
    Draw.text("<", x+8, y+6, Color.gray);
    if (mouseHover(x, y, width, height)) {
        Draw.rect(x, y, width, height, Color.white);
        if (Input.mouseLeftDown) {
            openDirectory(file.parentDirectory(currentDir));
        }
    }
}

var buttonSliceRect = {x: 12, y: 9, w: 10, h: 16};
var buttonSliceRect2 = {x: 5, y: 5, w: 6, h: 6};

function okCancelButtonArea(x, y, width, height)
{
    //Draw.rect(x, y, width, height, Color.darkgray, true);
    // Draw.text("ok cancel", x, y, Color.white);

    var w = (width-padding)/2;
    Draw.nineSlice("button2.png", buttonSliceRect2, x, y, w, height);
    Draw.nineSlice("button2.png", buttonSliceRect2, x + w + padding, y, w, height);

    
    Draw.text("ok", x + 19, y + height/2 - Draw.fontHeight/2, Color.gray);
    Draw.text("cancel", x + w+12, y + height/2 - Draw.fontHeight/2, Color.gray);
}

var fileList = {};

// var currentIndex = 0;

// var activeTimer = 0;
// var b = {r:0, g:0, b:0, a:100};
// function fileButton(y, text, active, action)
// {
//     var width = 80;
//     Draw.rect(0, y, 100, 11, b, true);
//     Draw.text(text, 10, y + 2, active?Color.white:Color.black);
//     if (active) {
//         var x = 10 + (width/2) * (1 - activeTimer);
//         Draw.line(x, y, x + width/2 * (activeTimer*2), y, Color.white);
//         Draw.line(x, y+10, x + width/2 * (activeTimer*2), y+10, Color.white);
//         //Draw.rect(10 + (width/2) * (1 - activeTimer), y, width/2 * (activeTimer*2), 11, Color.white);
//     }

//     if (active && Input.getKeyDown(Key.return)) {
//         action();
//     }
// }

function previewArea(x, y, width, height)
{
    if (!selectedFile.endsWith("obj") && !selectedFile.endsWith("glb")) {

        if (selectedFile == "") {
            Draw.setBlendMode("normal");
            var w = {r:255, g:255, b:255, a:100};
            Draw.rect(x, y, width, height, w, true);
        } else {
            Draw.rect(x, y, width, height, Color.darkgray, true);
        }
    }
    // Draw.line(x, y, x + 50, y, Color.white);
    // Draw.line(x, y, x, y + 10, Color.white);
    // Draw.line(x + width - 50, y + height, x + width, y + height, Color.white);
    // Draw.line(x + width, y + height, x + width, y + height - 10, Color.white);
    Draw.nineSlice("button2nobg.png", buttonSliceRect2, x, y, width, height);


    if (selectedFile == "") return;

    var extension = selectedFile.substring(selectedFile.lastIndexOf("."));
    switch (extension) {
        case ".png":
            Draw.texture(selectedFile, x+4, y+4);
            break;
        case ".txt":
        case ".js":
            let lines = Assets.readText(selectedFile).split("\n");
            for (var i = 0; i < lines.length; i++)
            {
                if (extension == ".js") {
                    drawSyntaxText(lines[i], x + 4, y + 4 + i * Draw.fontHeight);
                } else {
                    Draw.text(lines[i], x + 4, y + 4 + i * Draw.fontHeight, Color.gray);
                }
            }
            break;
        case ".glb":
        case ".obj":
            Draw.model(selectedFile, {x: 0, y:0, z:-1}, {x:0, y:0, z:0});
            break;
        case ".voxel":
        case ".json":
            let data = JSON.parse(Assets.readText(selectedFile));
            gui.x = x + 4;
            gui.y = y + 4;
            gui.objectPreview(selectedFile, data);
            break;
        default:
            Draw.text("can't preview "+extension+" files sorry :(", x + 4, y + 4, Color.gray);
            break;
    }
}

function drawSyntaxText(text, x, y)
{
    var line = text.replace("var", "$c4var$c2");
    line = line.replace("let", "$c4let$c2");
    line = line.replace("function", "$c7function$c2");
    line = line.replace("{", "$c8{$c2");
    line = line.replace("}", "$c8}$c2");
    line = line.replace("if", "$cAif$c2");
    line = line.replace("else", "$cAelse$c2");
    line = line.replace("(", "$c8($c2");
    line = line.replace(")", "$c8)$c2");
    line = line.replace(";", "$c6;$c2");
    line = line.replace("//", "$cD//");
    Draw.textStyled(line, x, y);
}

function mouseHover(x, y, width, height)
{
    return Input.mouseX >= x && Input.mouseX < x + width && Input.mouseY >= y  && Input.mouseY < y + height;
}

function openDirectory(path)
{
    currentDir = path;
    fileList = file.listDir(currentDir);
    selectedFile = "";
}