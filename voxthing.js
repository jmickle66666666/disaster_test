var model = "nul";
var camera = load("lib/camera.js");
var pos = {x: 0, y: 0, z: 10};
var rot = {x: 0, y: 0, z: 0};
var gui = load("lib/gui.js");
var cellular = load("lib/cellular.js");

function init()
{
    
    if (Assets.exists("autosave.voxel")) {
        data = JSON.parse(Assets.readText("autosave.voxel"));
        buildMesh();
    } else {
        generateSphere(16);
    }
}

var width = 16;
var height = 16;
var depth = 16;
var data = [];

var buildMode = "dig";
var blockIndex = 2;

function generateSphere(dist)
{
    data = [];

    for (var i = 0; i < width * height * depth; i++)
    {
        var x = i % width;
        var yz = Math.floor(i / width);
        var y = yz % height;
        var z = Math.floor(yz / height);

        if (sqrdistance(x, y, z, width/2, height/2, depth/2) > dist) {
            data[i] = -1;
        } else {
            data[i] = 6;
        }
    }

    buildMesh();
}


var profile = {"list":["circle","circle","circle","growNoise","growNoise","smooth","smooth"],"randomSeed":true,"min":0,"max":1,"contiguous":false};
function generateLandscape()
{
    data = [];

    cellular.generate(16, 16, profile);

    for (var i = 0; i < width; i++)
    {
        for (var j = 0; j < depth; j++)
        {
            var lheight = 2 + cellular.buffer[i + j*depth];
            for (var k = 0; k < height; k++)
            {
                if (k < lheight) {
                    if (k == lheight-1) data[i + k * height + j * height * depth] = 4;
                    else data[i + k * height + j * height * depth] = 5;
                } else {
                    data[i + k * height + j * height * depth] = -1;
                }
            }
        }
    }

    buildMesh();
}

function buildMesh()
{
    if (model != "nul") Assets.unload(model);
    model = Assets.createVoxelMesh(
        {x: width, y: height, z: depth},
        "voxtex.png",
        {x: 16, y: 16},
        data
    );

    Assets.writeText("autosave.voxel", JSON.stringify(data));
}

function sqrdistance(x1, y1, z1, x2, y2, z2)
{
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    return dx * dx + dy * dy + dz * dz;
}

var t = 0;
function update(dt)
{
    t += dt;
    if (Input.mouseRightDown)
    {
        Input.lockMouse();
        camera.startControl();
    }

    if (Input.mouseRight) {
        camera.fpsControl(dt);
    } else {

        if (!inventoryOpen) {

            var ray = Physics.screenPointToRay(Input.mouseX, Input.mouseY);
    
            var rayHit = Physics.getCollisionRayModel(ray, pos, rot, model);
    
            if (rayHit.hit) {
    
                // var rotation = {
                //     x: 0,
                //     y: Math.atan2(rayHit.normal.x, rayHit.normal.z) * 180/3.14,
                //     z: Math.atan2(-rayHit.normal.y, Math.abs(rayHit.normal.x)) * 180/3.14,
                // };
    
                // var position = {
                //     x: rayHit.position.x + rayHit.normal.x * 0.1,
                //     y: rayHit.position.y + rayHit.normal.y * 0.1,
                //     z: rayHit.position.z + rayHit.normal.z * 0.1,
                // }
    
                var aaa = {
                    x: Math.floor(rayHit.position.x - rayHit.normal.x * 0.5), 
                    y: Math.floor(rayHit.position.y - rayHit.normal.y * 0.5), 
                    z: Math.floor(rayHit.position.z - rayHit.normal.z * 0.5)
                };
                var aab = {x: aaa.x, y: aaa.y, z: aaa.z + 1};
                var aba = {x: aaa.x, y: aaa.y + 1, z: aaa.z};
                var abb = {x: aaa.x, y: aaa.y + 1, z: aaa.z + 1};
                var baa = {x: aaa.x + 1, y: aaa.y, z: aaa.z};
                var bab = {x: aaa.x + 1, y: aaa.y, z: aaa.z + 1};
                var bba = {x: aaa.x + 1, y: aaa.y + 1, z: aaa.z};
                var bbb = {x: aaa.x + 1, y: aaa.y + 1, z: aaa.z + 1};
    
                Draw.line3d(aaa, aab, Color.disaster);
                Draw.line3d(aab, abb, Color.disaster);
                Draw.line3d(abb, aba, Color.disaster);
                Draw.line3d(aba, aaa, Color.disaster);
    
                Draw.line3d(baa, bab, Color.disaster);
                Draw.line3d(bab, bbb, Color.disaster);
                Draw.line3d(bbb, bba, Color.disaster);
                Draw.line3d(bba, baa, Color.disaster);
    
                Draw.line3d(aaa, baa, Color.disaster);
                Draw.line3d(aab, bab, Color.disaster);
                Draw.line3d(abb, bbb, Color.disaster);
                Draw.line3d(aba, bba, Color.disaster);
    
                if (Input.mouseLeftDown) {
    
                    var x = aaa.x - pos.x;
                    var y = aaa.y - pos.y;
                    var z = aaa.z - pos.z;
                    if (buildMode == "place") {
                        x += rayHit.normal.x;
                        y += rayHit.normal.y;
                        z += rayHit.normal.z;
                    }
    
                    var index = x + y * width + z * width * height;
    
                    if (buildMode == "dig") data[index] = -1;
                    if (buildMode == "replace") data[index] = blockIndex;
                    if (buildMode == "place") data[index] = blockIndex;
                    buildMesh();
                }
            }
        }
    }

    if (Input.mouseRightUp)
    {
        Input.unlockMouse();
    }

    var s = Math.sin(t);
    s *= 0.5;
    s += 0.5;
    s *= 64;
    ///if (Input.getKey(Key.g)) generate(s);

    gui.label("block selected: "+blockIndex);
    gui.label("mode: "+buildMode);

    if (Input.getKeyDown(Key.key1)) buildMode = "dig";
    if (Input.getKeyDown(Key.key2)) buildMode = "replace";
    if (Input.getKeyDown(Key.key3)) buildMode = "place";
    // if (Input.getKeyDown(Key.key4)) { 
        //     blockIndex += 1;
        //     if (blockIndex > 12) blockIndex = 0;
        // }
    if (Input.getKeyDown(Key.g)) generateLandscape();
        
    if (Input.getKeyDown(Key.e)) inventoryOpen =! inventoryOpen;
    inventory(dt);

    Draw.model(model, pos, rot);
}

var inventoryOpen = false;
var inventoryAnimation = 0;
var invWidth = 64;
var invHeight = 64;
function inventory(dt)
{
    if (inventoryOpen) {
        if (inventoryAnimation < 1) {
            
            Draw.texture("voxtex.png", Draw.screenWidth/2, Draw.screenHeight/2, {w:64, h:64}, {
                originX: 33, originY: 33,
                scaleX: Math.sqrt(inventoryAnimation), 
                scaleY: Math.sqrt(inventoryAnimation)
            });
            inventoryAnimation += dt * 4;
        } else {

            var invX = (Draw.screenWidth-64) / 2;
            var invY = (Draw.screenHeight-64) / 2;

            Draw.texture("voxtex.png", invX, invY);

            if (Input.mouseX >= invX && Input.mouseX < invX + invWidth && Input.mouseY >= invY && Input.mouseY < invY+invHeight) {

                var tileX = Math.floor((Input.mouseX - invX) / 16);
                var tileY = Math.floor((Input.mouseY - invY) / 16);
                var tileIndex = tileX + tileY * 4;

                gui.label(tileX + " " + tileY + " " + tileIndex);
                

                Draw.rect(tileX*16 + invX, tileY*16 + invY, invWidth / 4, invHeight / 4, Color.disaster);

                if (Input.mouseLeftDown) {
                    blockIndex = tileIndex;
                }
            }


        }
    } else {
        if (inventoryAnimation > 0) {
            inventoryAnimation -= dt * 4;
            
            Draw.texture("voxtex.png", Draw.screenWidth/2, Draw.screenHeight/2, {w:64, h:64}, {
                originX: 33, originY: 33,
                scaleX: Math.sqrt(inventoryAnimation), 
                scaleY: Math.sqrt(inventoryAnimation)
            });
        }
    }
}