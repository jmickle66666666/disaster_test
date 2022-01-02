var bgMesh = null;
var zero = {x:0, y:0, z:0};
var quadMesh = null;
var quadPos = {x:1, y:-.2, z:-3};
var quadRot = {x:0, y:-40, z:0};
var quadSize = 0.6;
var bandPos = {x:1, y:-.2, z:-3};
var file = load("lib/file.js");
var gui = load("lib/gui.js");
var scenes = load("lib/scenes.js");
var currentDir = "";
var padding = 2;
var selectedFile = "";

var selectCallback;
var cancelCallback;
var fileFilter = ".png";

function browse(filter, startDir, onSelect, onCancel)
{
    selectCallback = onSelect;
    cancelCallback = onCancel;
    currentDir = startDir;
    fileFilter = filter;
    scenes.openScene(load("tools/filebrowser.js"));
}

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

    fileList = file.listDir(currentDir, fileFilter);
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

var fileListScroll = 0;
function fileListArea(x, y, width, height)
{
    Draw.rect(x, y, width, height, Color.darkgray, true);
    Draw.nineSlice("button2.png", buttonSliceRect2, x, y, width, height);

    var totalViewCount = Math.floor((height-12) / 12);
    var tempDir = currentDir;

    var ty = y + 6;
    var dirViewCount = Math.min(totalViewCount + fileListScroll, fileList.directories.length);
    for (var i = fileListScroll; i < dirViewCount; i++)
    {
        if (i < 0) continue;
        fileListButton(x+6, ty, width - 12, 12, fileList.directories[i], true);
        ty += 12;

        // if we selected a new folder, return
        if (currentDir != tempDir) return;
    }

    var fileViewCount = Math.min(totalViewCount - dirViewCount + fileListScroll, fileList.files.length);
    for (var i = 0; i < fileViewCount; i++)
    {
        fileListButton(x+6, ty, width - 12, 12, fileList.files[i], false);
        ty += 12;
    }

    if (Input.mouseWheel < 0) fileListScroll += 1;
    if (Input.mouseWheel > 0) fileListScroll -= 1;
    if (fileListScroll < 0) fileListScroll = 0;
    if (fileListScroll > (fileList.files.length + fileList.directories.length) - totalViewCount) {
        fileListScroll = (fileList.files.length + fileList.directories.length) - totalViewCount;
    }
}

function fileListButton(x, y, width, height, path, isDirectory)
{
    let charLength = Math.floor(width / Draw.fontWidth);

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
        file.stripToLocalPath(path).substring(0, charLength), 
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
    var w = (width-padding)/2;
    Draw.nineSlice("button2.png", buttonSliceRect2, x, y, w, height);
    Draw.nineSlice("button2.png", buttonSliceRect2, x + w + padding, y, w, height);

    if (mouseHover(x, y, w, height)) {
        Draw.rect(x, y, w, height, Color.white);
        if (Input.mouseLeftDown && selectedFile != "") {
            if (selectCallback != null) selectCallback(selectedFile);
            scenes.closeScene();
        }
    }
    Draw.text("ok", x + 19, y + height/2 - Draw.fontHeight/2, Color.gray);

    if (mouseHover(x + w + padding, y, w, height)) {
        Draw.rect(x + w + padding, y, w, height, Color.white);
        if (Input.mouseLeftDown) {
            if (cancelCallback != null) cancelCallback();
            scenes.closeScene();
        }
    }
    Draw.text("cancel", x + w+12, y + height/2 - Draw.fontHeight/2, Color.gray);
}

var fileList = {};

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
    Draw.nineSlice("button2nobg.png", buttonSliceRect2, x, y, width, height);

    if (selectedFile == "") return;

    var extension = selectedFile.substring(selectedFile.lastIndexOf("."));
    switch (extension) {
        case ".png":
            Draw.texture(selectedFile, x+4, y+4);
            break;
        case ".voxel":
        case ".json":
        case ".tilemap":
            // let data = JSON.parse(Assets.readText(selectedFile));
            // gui.x = x + 4;
            // gui.y = y + 4;
            // gui.objectPreview(selectedFile, data);
            // break;
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
    fileList = file.listDir(currentDir, fileFilter);
    selectedFile = "";
    fileListScroll = 0;
}