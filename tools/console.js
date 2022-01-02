let gui = load("lib/gui.js");
let scenes = load("lib/scenes.js");
var iconRect = {x:0, y:0, w:17, h:5};

var active = false;
var toggleKey = Key.f5;

let icons = [];
let clickedIcon = -1;
let rootObject = this;
let deltatime = 0;
let iconBackground = {r:0, g:0, b:0, a:180};
let sidebarwidth = 80;

function init()
{
    rootIcons();
}

function update(dt)
{
    if (Input.getKeyDown(toggleKey)) active =! active;
    if (!active) return;
    
    // this is a hack to make sure gui calls work correctly.
    // to make sure the gui of the open scene doesn't work while the console is open, gui checks 
    // to see if the console is active. to then use gui in the console itself, we pretend its not active
    active = false; 

    deltatime = dt;
    sidebar(Draw.screenWidth - sidebarwidth, 0, sidebarwidth, Draw.screenHeight);
    //commandConsole(0, Draw.screenHeight - (Draw.fontHeight+2), Draw.screenWidth-64, Draw.fontHeight + 2);
    // if (filepreview != "") {
    //     filePreview(8, 16, Draw.screenWidth - sidebarwidth - 8, 240 - 48);
    // } else {
    //     fileList(16, 16);
    // }

    drawIcons(0, 0, Draw.screenWidth - sidebarwidth, Draw.screenHeight);

    active = true;
}

function rootIcons()
{
    genIcons([
        {id:1, text:"main.js", onClick:function() {readObject(rootObject, null, true)}},
        //{id:0, text:"assets", onClick:function() { readDir(""); }},
        {id:0, text:"tools", onClick:function() { loadTools();}},
        {id:2, text:"close scene", onClick:function() {scenes.closeScene();}},
        {id:2, text:"reset", onClick:function() {Engine.reset();}},
        {id:2, text:"quit", onClick:function() {Engine.quit();}},
    ], false);
}

// function readDir(directory)
// {
//     icons = [];
//     files = listDir(directory);
//     files.currentDir = directory;
// }

function loadTools()
{
    genIcons([
        {id:0, text:"cellular generator", onClick:function() {openScene("tools/cellulargenerator.js")}},
        //{id:0, text:"matrix system", onClick:function() {openScene("tools/matrixsystem.js")}},
        //{id:0, text:"sprite editor", onClick:function() {openScene("tools/spriteeditor.js")}},
        //{id:0, text:"tilemap editor", onClick:function() {openScene("tools/tilemapeditor.js")}}, // this is broken
        //{id:0, text:"zone editor", onClick:function() {openScene("tools/zoneeditor.js")}},
        {id:0, text:"back", onClick:function() { rootIcons(); }},
    ])
}

function openScene(scenePath)
{
    scenes.openScene(load(scenePath));
    active = false;
}

// function listDir(directory)
// {
//     let files = [];
//     let directories = [];
//     let dirLen = directory.length;
//     for (let i = 0; i < assetPaths.length; i++)
//     {
//         let path = assetPaths[i];
//         if (!path.startsWith(directory)) continue;

//         let slashIndex = path.indexOf("\\", dirLen+1);
//         if (slashIndex != -1) { // its a subdirectory
//             let pathDir = path.substring(0, path.indexOf("\\", dirLen+1)+1);
            
//             if (pathDir == "\\.git") continue;
    
//             if (directories.indexOf(pathDir) == -1 && pathDir != "") {
//                 directories.push(pathDir);
//             }
//         } else {
//             if (path == "\\.gitattributes") continue;
//             files.push(path);
//         }
//     }
//     return {files: files, directories: directories};
// }

function readObject(target, backTarget = null, ignoreFunctions = false)
{
    var list = [];
    var keys = Object.getOwnPropertyNames(target);
    //var ignoreKeys = Object.getOwnPropertyNames(new Object());
    log(keys);
    //log(ignoreKeys);
    
    for (let i = 0; i < keys.length; i++)
    {
        switch (typeof(target[keys[i]])){
            case 'object':
                list.push({
                    id: 1,
                    text: keys[i],
                    target: target[keys[i]],
                    parent: target,
                    onClick: function() {
                        // log(this.text);
                        readObject(this.target, this.parent);
                    }
                });
            break;
            case 'function':
                if (ignoreFunctions) continue;
                list.push({
                    id: 2,
                    text: keys[i],
                    target: target[keys[i]],
                    parent: target,
                    onClick: function() {
                        // log(this.text);
                        //readObject(this.target, this.parent);
                    }
                });
            break;
            default:
                log("unhandled: "+typeof(target[keys[i]]));
            break;
        }
    }
    list = list.sort(function(a,b) {Math.random() -0.5});

    list.push({
        id:0,
        text: "root",
        onClick: rootIcons
    })
    
    if (backTarget != null) {
        list.push({
            id:0,
            text: "back",
            onClick: function() {
                readObject(backTarget)
            }
        })
    }
    list.reverse();

    genIcons(list);
}



// function filePreview(x, y, width, height)
// {
    
//     let type = getFileType(filepreview);
//     gui.x = x;
//     gui.y = y;
//     gui.textColor = Color.seablue;
//     gui.button("[ close ]", function() { filepreview = "" });
//     gui.textColor = Color.disaster;
//     gui.label(filepreview);
//     y = gui.y;
//     if (type == 3) {
//         Draw.texture(filepreview, x, y);
//     }

//     if (type == 5) {
//         gui.textColor = Color.gray;
//         gui.button("play", function() { Audio.playSound(filepreview); });
//         gui.button("stop", function() { Audio.stopAllSound(); });
//     }

//     if (type == 2 || type == 8 || type == 7) {
//         Draw.rect(x, y, width, height, Color.black, true);
//         let lines = Assets.readText(filepreview).split("\n");
//         let maxLines = Math.min(height / Draw.fontHeight, lines.length);
//         let maxWidth = width / Draw.fontWidth;
//         gui.textColor = Color.gray;
//         for (let i = 0; i < maxLines; i++)
//         {
//             gui.label(lines[i].substring(0, maxWidth));
//         }
//     }
// }

// let filebreak = false;
// function fileList(x, y)
// {
//     gui.x = x;
//     gui.y = y;

//     if (files == null) return;
//     gui.textColor = Color.seablue;
//     gui.button("[back]", function() {
//         if (files.currentDir == "") {
//             files = null;
//             rootIcons();
//         } else {
//             let newDir = files.currentDir.substring(0, files.currentDir.lastIndexOf('\\', files.currentDir.length -2));
//             files = null;
//             readDir(newDir);
//         }
//     });
//     if (files == null) return;
//     gui.label(files.currentDir);
//     gui.x += 17;
//     y += 16;

    

//     filebreak = false;

//     iconRect.y = 45;
//     gui.textColor = Color.gray;
//     for (let i = 0; i < files.directories.length; i++)
//     {
//         Draw.texture("tools/sprites/consoleicons.png", x, y+2, iconRect);
//         gui.x = x + 19;
//         gui.y = y;
//         gui.button(files.directories[i], function(){readDir(files.directories[i]); filebreak = true});
//         y += 8;
//         if (filebreak) return;
//     }

//     for (let i = 0; i < files.files.length; i++)
//     {
//         let type = getFileType(files.files[i]);
//         iconRect.y = type * 5;
//         Draw.texture("tools/sprites/consoleicons.png", x, y+2, iconRect);
//         gui.x = x + 19;
//         gui.y = y;
//         gui.button(files.files[i], function() { filepreview = files.files[i]; filebreak = true;});
//         y += 8;
//         if (filebreak) return;
//     }
//     gui.textColor = Color.disaster;
// }

// function getFileType(path)
// {
//     if (path.indexOf('.') == -1) return 9;
//     let ext = path.substring(path.lastIndexOf('.'));
//     switch (ext) {
//         case ".js":
//             return 2;
//         case ".png":
//             return 3;
//         case ".glb":
//         case ".gltf":
//         case ".obj":
//             return 4;
//         case ".wav":
//         case ".ogg":
//         case ".mp3":
//             return 5;
//         case ".frag":
//         case ".vert":
//             return 7;
//         case ".txt":
//         case ".json":
//             return 8;
//     }
// }

function sidebar(x, y, width, height)
{
    Draw.rect(x, y, width, height, Color.black, true);
    Draw.line(x, y, x, y + height, Color.disaster);
    x += 4;
    y += 3;
    Draw.text("HAZARD", x, y, Color.disaster);
    y += Draw.fontHeight;
    Draw.text("CONSOLE", x, y, Color.disaster);
    y += Draw.fontHeight;

    dtGraph(x, y, width - 8, 32);
    y += 38;

    gui.y = y;
    gui.x = x;
    gui.label("scenes: "+scenes.sceneStack.length);
    for (let i = 0; i < scenes.sceneStack.length; i++)
    {
        gui.label(scenes.sceneStack[i].path);
    }

    gui.y += 7;
    gui.label("loaded");
    gui.label("assets: "+Assets.loadedAssetCount());

    gui.y += 7;
    gui.button("reset", function() { Engine.reset(); });
    gui.button("reload assets", function() { Assets.unloadAll(); });
    gui.button("reload shaders", function() { Engine.reloadShaders(); });

    //ultraBar(x, y, width, 32);
}

let anyIconsHovered = false;
function drawIcons(x, y, width, height)
{
    if (icons.length > 0) {
        Draw.rect(x, y, width, height, iconBackground, true);
    }
    anyIconsHovered = false;
    for (let i = 0; i < icons.length; i++)
    {
        if (icon(icons[i].icon, icons[i].x, icons[i].y, i == clickedIcon)) {
            clickedIcon = i;
        }
    }
    if (Input.mouseLeftDown && anyIconsHovered == false) clickedIcon = -1;
}

function ultraBar(x, y, width, height)
{
    gui.x = x;
    gui.y = y;
    gui.label("ULTRABAR");
    gui.button("reset", function() { Engine.reset(); });
    gui.button("quit", function() { Engine.quit(); });
    gui.button("unload all", function() { });
}

function genIcons(iconList, boring = true)
{
    boring = iconList.length >= 12;
    clickedIcon = -1;
    let count = iconList.length;
    icons = [];
    let width = 320 - sidebarwidth;
    let height = 240 - 16;

    if (!boring) {
        for (let i = 0; i < count; i++)
        {
            let y = i * (height/count);
            y += (height/count)/2;
            let x = (Math.random() * width) * 0.6;
            x += width * 0.2;
            icons.push({
                x:x, y:y, icon: iconList[i],
            });
        }
        return;
    }

    let hoff = iconSize("g").h;
    let x = 0;
    let y = 0;
    for (let i = 0; i < count; i++)
    {
        let s = iconSize(iconList[i].text);
        if (x + s.w >= width) {
            x = 0;
            y += s.h;
        }
        icons.push({
            x:x + s.w/2, y:y + s.h/2, icon:iconList[i]
        });
        x += s.w;
    }
}

let dts = [];
let jst = [];
let maxDTSLength = 32;
function dtGraph(x, y, width, height)
{
    
    //Draw.text("dt", x, y, Color.white);

    if (dts.length < maxDTSLength) {
        dts.push(deltatime);
        jst.push(Debug.scriptTime);
    } else {
        for (let i = 0; i < dts.length-1; i++)
        {
            dts[i] = dts[i+1];
            jst[i] = jst[i+1];
        }
        dts[dts.length-1] = deltatime;
        jst[jst.length-1] = Debug.scriptTime;
    }

    for (let i = 1; i < dts.length; i++) 
    {
        Draw.line(
            x + (i-1) * (width/dts.length), 
            Math.max(y + height - (dts[i-1] * 35 * height), y),
            x + (i-0) * (width/dts.length), 
            Math.max(y + height - (dts[i-0] * 35 * height), y),
            dtColor(dts[i-1]),
            dtColor(dts[i])
        );

        Draw.line(
            x + (i-1) * (width/jst.length), 
            Math.max(y + height - (jst[i-1] * 35 * height), y),
            x + (i-0) * (width/jst.length), 
            Math.max(y + height - (jst[i-0] * 35 * height), y),
            jstColor(jst[i-1]),
            jstColor(jst[i])
        );

    }

    Draw.rect(x, y, width, height, Color.slimegreen);
}

function jstColor(value)
{
    if (value > 1/30) {
        return Color.red;
    }
    return Color.disaster;
}

function dtColor(value)
{
    if (value > 1/30) {
        return Color.red;
    }
    return Color.green;
}

function commandConsole(x, y, width, height)
{
    Draw.rect(x, y, width, height, Color.black, true);
    Draw.line(x, y, x + width, y, Color.disaster);
    Draw.text("> Engine.reset()_", x, y+2, Color.disaster);
}

function iconSize(text)
{
    return {h: Draw.fontHeight + 11, w: (Draw.fontWidth * text.length) + 6};
}

function icon(icon, x, y, clicked)
{
    let height = Draw.fontHeight + 11;
    let width = (Draw.fontWidth * icon.text.length) + 6;
    x -= width/2;
    y -= height/2;
    Draw.rect(x, y, width+1, height+1, Color.black, true);
    let hovering = hover(x, y, width, height);
    Draw.rect(x, y, width, height, hovering?Color.slimegreen:Color.green, false);
    iconRect.y = icon.id * 5;
    Draw.texture("tools/sprites/consoleicons.png", x + 3, y + 3, iconRect);
    Draw.text(icon.text, x + 3, y + 10, clicked?Color.white:Color.gray);
    if (hovering) anyIconsHovered = true;
    if (clicked && hovering &&Input.mouseLeftDown) {
        clickedIcon = -1;
        icon.onClick();
        return false;
    }
    if (hovering && Input.mouseLeftDown) return true;
    return false;
}

function hover(x, y, width, height)
{
    return (Input.mouseX >= x && Input.mouseX < x + width && Input.mouseY >= y && Input.mouseY < y + height);
}