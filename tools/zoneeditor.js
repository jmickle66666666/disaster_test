var gui = load("lib/gui.js");
var camera = load("lib/camera.js");
var vmath = load("lib/vmath.js");
var zone = load("lib/zone.js");
var generators = load("lib/zonegenerators.js");

var currentZone;
var currentTool = "box";

var textures;
var time = 0;

var snapSize = 0.5;
var undoStack = [];

function init()
{
    Draw.setCamera(
        {x: 0, y: .75, z: -11},
        {x: 30, y: 0, z: 0}
    );

    currentZone = zone.createNew();

    textures = [];
    var paths = Assets.list().split(',');

    for (var i = 0; i < paths.length; i++)
    {
        if (paths[i].endsWith(".png")) {
            textures.push(paths[i]);
        }
    }

    Audio.playMusic("tools/sounds/sampletext.ogg");
}

function update(dt)
{
    time += dt;
    

    if (Input.mouseRightDown) { Input.lockMouse(); camera.startControl(); }
    if (Input.mouseRight) { camera.fpsControl(dt); }
    if (Input.mouseRightUp) { Input.unlockMouse(); }

    if (Input.getKeyDown(Key.leftbracket)) snapSize /= 2;
    if (Input.getKeyDown(Key.rightbracket)) snapSize *= 2;

    if (Input.getKeyDown(Key.key1)) { currentTool = "select"; tools[currentTool].init(); }
    if (Input.getKeyDown(Key.key2)) { currentTool = "box"; tools[currentTool].init(); }
    if (Input.getKeyDown(Key.key3)) { currentTool = "vertex"; tools[currentTool].init(); }

    if (Input.getKeyDown(Key.g)) { 
        regenerate();        
    }

    if (Input.getKey(Key.leftcontrol) && Input.getKeyDown(Key.z)) {
        undo();
    }

    gui.label("zone editor");
    gui.label("current tool: "+currentTool);

    tools[currentTool].update(dt);


    zone.render(currentZone);

    //gui.objectEditor(this);
}

function regenerate()
{
    zone.unloadMeshes(currentZone);
    for (var i = 0; i < currentZone.parts.length; i++)
    {
        generators.generate(currentZone.parts[i]);
    }
}

function undo()
{
    if (undoStack.length == 0) return;
    currentZone = JSON.parse(undoStack.pop());
    regenerate();
    tools["select"].selection = [];
    tools["vertex"].selection = [];
}

function writeUndo()
{
    undoStack.push(JSON.stringify(currentZone));
}

function drawLine(start, end, color)
{
    var s = Draw.worldToScreenPoint(start);
    var e = Draw.worldToScreenPoint(end);
    Draw.line(s.x, s.y, e.x, e.y, color);
}

function getMouseHit()
{
    var mouseRay = Physics.screenPointToRay(Input.mouseX, Input.mouseY);
    var minDistance = 1000000000;
    var output = { hit : 0 };
    for (var i = 0; i < currentZone.parts.length; i++)
    {
        for (var j = 0; j < currentZone.parts[i].models.length; j++)
        {
            var m = currentZone.parts[i].models[j];
            var hit = Physics.getCollisionRayModel(
                mouseRay, m.position, m.rotation, m.model
            );
            hit.part = currentZone.parts[i];

            if (hit.hit) {
                if (hit.distance < minDistance) {
                    output = hit;
                }
            }
        }
    }

    if (!output.hit)
    {
        output = Physics.getCollisionRayGround(mouseRay, 0);
        output.part = null;
    }
    
    var outputPlane = {position:output.position, normal:vmath.mul(output.normal,1)};
    output.position = snapToGrid(output.position, snapSize, outputPlane);
    
    return output;
}

// tools

var tools = {
    "vertex" : {
        selection : [],
        position : {x: 0, y: 0, z:0},
        modified : true,
        recalcPosition: function() {
            var center = {x: 0, y: 0, z: 0};
            for (var i = 0; i < this.selection.length; i++)
            {
                center = vmath.add(center, this.selection[i].part.data.vertices[this.selection[i].vertex]);
            }
            this.position = vmath.mul(center, 1 / this.selection.length);
        },
        moveSelectedVertices: function(amount) {
            for (var i = 0; i < this.selection.length; i++)
            {
                this.selection[i].part.data.vertices[this.selection[i].vertex] = vmath.add(amount, this.selection[i].part.data.vertices[this.selection[i].vertex]);
            }
            for (var i = 0; i < tools["select"].selection.length; i++) {
                generators.generate(tools["select"].selection[i]);
            }
        },
        init: function() {

        },
        update: function(dt) {
            var selectedParts = tools["select"].selection;
            if (selectedParts.length == 0) {
                gui.label("nothing selected :) great job");
                return;
            }

            if (this.selection.length != 0)
            {
                var pos = this.position;
                var tempPos = vmath.copy(this.position);
                if (gui.transform3d(tempPos)) {
                    var offset = vmath.sub(tempPos, pos);
                    var length = vmath.length(offset);
                    length = Math.round(length / snapSize) * snapSize;
                    var move = vmath.mul(vmath.normalise(offset), length);
                    if (length != 0) {

                        if (!this.modified) {
                            writeUndo();
                            this.modified = true;
                        }
                        Audio.playSound("tools/sounds/click4.wav");
                    }
                    this.moveSelectedVertices(move);
                    this.recalcPosition();
                }
            }

            if (!Input.mouseLeft)
            {
                this.modified = false;
            }

            if (Input.mouseLeftDown && !gui.hovered && !Input.getKey(Key.leftshift)) {
                this.selection = [];
                
                Audio.playSound("tools/sounds/click2.wav");
            }

            for (var i = 0; i < selectedParts.length; i++)
            {
                var part = selectedParts[i];
                if (part.type == "mesh") {
                    for (var j = 0; j < part.data.vertices.length; j++)
                    {
                        var p = Draw.worldToScreenPoint(part.data.vertices[j]);
                        if (vmath.distance(p, {x:Input.mouseX, y:Input.mouseY}) < 6) {
                            Draw.circle(p.x, p.y, 3.5, Color.disaster, true);
                            if (Input.mouseLeftDown && !gui.hovered) {
                                this.selection.push({vertex: j, part: part});
                                Audio.playSound("tools/sounds/click3.wav");
                            }
                        } else {
                            Draw.circle(p.x, p.y, 3.5, Color.disaster, false);
                        }
                    }
                }
            }

            for (var i = 0; i < this.selection.length; i++)
            {
                var p = Draw.worldToScreenPoint(this.selection[i].part.data.vertices[this.selection[i].vertex]);
                Draw.circle(p.x, p.y, 3.5, Color.white, true);
            }

            if (Input.mouseLeftDown && !gui.hovered) {
                this.recalcPosition();
            }

            
        }
    },
    "select" : {
        selection: [],
        position: {x:0, y:0, z:0},
        modified: false,
        init: function() {
            this.selection = [];
        },
        update : function(dt) {

            var mouseHit = getMouseHit();

            if (this.selection.length > 0) {
                
                for (var i = 0; i < this.selection.length; i++)
                {
                    zone.renderPartWireframe(this.selection[i], Color.disaster);
                }
                var tempPos = vmath.copy(this.position);
                var pos = this.position;
                if (gui.transform3d(tempPos)) {
                    var offset = vmath.sub(tempPos, pos);
                    var length = vmath.length(offset);
                    length = Math.round(length / snapSize) * snapSize;
                    var move = vmath.mul(vmath.normalise(offset), length);

                    if (length != 0)
                    {
                        if (this.modified == false)
                        {
                            this.modified = true;
                            writeUndo();
                        }
                        Audio.playSound("tools/sounds/click4.wav");
                    }

                    for (var i = 0; i < this.selection.length; i++) {
                        generators.move(this.selection[i], move);
                    }
                    var center = {x:0, y:0, z:0};
                    for (var i = 0; i < this.selection.length; i++)
                    {
                        center = vmath.add(generators.getCenter(this.selection[i]), center);
                    }
                    this.position = vmath.mul(center, 1 / this.selection.length);
                }
                
            }

            if (!Input.mouseLeft)
            {
                this.modified = false;
            }

            if (Input.mouseLeftDown && !gui.hovered) {
                if (Input.getKey(Key.leftshift)) {
                    if (mouseHit.part != null) {
                        if (this.selection.includes(mouseHit.part)) {
                            this.selection.splice(this.selection.indexOf(mouseHit.part),1);
                            Audio.playSound("tools/sounds/click2.wav");
                        } else {
                            this.selection.push(mouseHit.part);
                            Audio.playSound("tools/sounds/click3.wav");
                        }
                        
                    }
                } else {
                    if (mouseHit.part == null) {
                        this.selection = [];
                        Audio.playSound("tools/sounds/click2.wav");
                    } else {
                        this.selection = [mouseHit.part];
                        Audio.playSound("tools/sounds/click3.wav");
                    }
                    
                    
                }
                if (this.selection.length > 0) {
                    var center = {x:0, y:0, z:0};
                    for (var i = 0; i < this.selection.length; i++)
                    {
                        center = vmath.add(generators.getCenter(this.selection[i]), center);
                    }
                    this.position = vmath.mul(center, 1 / this.selection.length);
                }
            }

            if (mouseHit.part != null /*&& !this.selection.includes(mouseHit.part)*/) {
                zone.renderPartWireframe(mouseHit.part, Color.white);
            }
        }
    },
    "box" : {
        texture: "3dtests/floor.png",
        state : "default",
        startHeight : 0,
        extrudeHeight : 0,
        dragStart : {},
        dragEnd : {},
        points : [],
        dragPlane: {},
        extrusion: {},

        textureListOffset:0,
        lastPosition:null,

        init : function() {
            this.state = "default";
        },
        texturePickUpdate: function(){
            gui.label("pick a texture");
            if (Input.mouseWheel != 0) {
                this.textureListOffset -= Math.sign(Input.mouseWheel);
                if (this.textureListOffset < 0) this.textureListOffset = 0;
                if (this.textureListOffset > textures.length - (Draw.screenHeight / Draw.fontHeight)) this.textureListOffset = textures.length - (Draw.screenHeight / Draw.fontHeight);
            }

            for (var i = this.textureListOffset; i < Math.min(this.textureListOffset + Draw.screenHeight / Draw.fontHeight, textures.length); i++)
            {
                if (this.texture == textures[i]) {
                    gui.button("-"+textures[i]+"-", function() { tools["box"].state = "default"; });
                } else {
                    gui.button(" "+textures[i], function() { tools["box"].state = "default"; tools["box"].texture = textures[i]; });
                }
        
                if (gui.lastHovered) {
                    var previewSize = Assets.getTextureSize(textures[i]);
                    Draw.texture(textures[i], Draw.screenWidth - 1 - previewSize.w, 0);
                }
            }
        },
        buildUpdate: function(){
            var mouseHit = getMouseHit();

            if (Input.getKeyDown(Key.tab)) {
                this.state = "texture";
                this.textureListOffset = 0;
                log("woops");
            }

            if (mouseHit.hit) {
                if (!Input.mouseLeft && this.state == "default")
                {
                    drawNormalCursor(mouseHit);
                }

                if (Input.mouseLeftDown && this.state == "default")
                {
                    this.dragStart = mouseHit.position;
                    this.dragPlane = {position: mouseHit.position, normal:vmath.mul(mouseHit.normal, -1), distance: vmath.dot(mouseHit.position, mouseHit.normal)};
                    this.state = "dragging";

                    
                    drawNormalCursor(mouseHit);
                }

                if (Input.mouseLeft && this.state == "dragging")
                {
                    var mouseRay = Physics.screenPointToRay(Input.mouseX, Input.mouseY);
                    var mouseHit = Physics.getCollisionRayPlane(mouseRay, this.dragPlane);
                    mouseHit.position = snapToGrid(mouseHit.position, snapSize, this.dragPlane);

                    if (vmath.length(mouseHit.position) != this.lastPosition)
                    {
                        Audio.playSound("tools/sounds/click3.wav");
                        this.lastPosition = vmath.length(mouseHit.position);
                    }

                    var screenPoint = Draw.worldToScreenPoint(mouseHit.position);
                    Draw.circle(screenPoint.x, screenPoint.y, 5, Color.white, false);
                    //drawLine(mouseHit.position, vmath.add(mouseHit.position, this.dragPlane.normal), Color.meat);

                    var start = vmath.copy(this.dragStart);
                    var end = vmath.copy(mouseHit.position);
                    //var dir = vmath.sub(end, start)
                    //var dom = vmath.dominantVector(dir);

                    var norm = vmath.mul(this.dragPlane.normal, 1);

                    var domVecNames = vmath.getDominantAxisNames(norm);
                    var a = {};
                    var b = {};

                    a[domVecNames.nda] = start[domVecNames.nda];
                    a[domVecNames.ndb] = end[domVecNames.ndb];
                    a[domVecNames.dom] = getPlanePoint(domVecNames.nda, domVecNames.ndb, domVecNames.dom, start[domVecNames.nda], end[domVecNames.ndb], this.dragPlane);

                    b[domVecNames.nda] = end[domVecNames.nda];
                    b[domVecNames.ndb] = start[domVecNames.ndb];
                    b[domVecNames.dom] = getPlanePoint(domVecNames.nda, domVecNames.ndb, domVecNames.dom, end[domVecNames.nda], start[domVecNames.ndb], this.dragPlane);

                    drawLine(start, a, Color.disaster);
                    drawLine(a, end, Color.disaster);
                    drawLine(end, b, Color.disaster);
                    drawLine(b, start, Color.disaster);

                    this.points = [start, a, end, b];
                }

                if (Input.mouseLeftUp && this.state == "dragging") {
                    
                    this.state = "extruding";
                    Audio.playSound("tools/sounds/click2.wav");
                }

                if (this.state == "extruding")
                {
                    drawLine(this.points[0], this.points[1], Color.disaster);
                    drawLine(this.points[1], this.points[2], Color.disaster);
                    drawLine(this.points[2], this.points[3], Color.disaster);
                    drawLine(this.points[3], this.points[0], Color.disaster);

                    var cross = vmath.normalise(vmath.cross(this.dragPlane.normal, Draw.getCameraTransform().forward));
                    var normal = vmath.cross(cross, this.dragPlane.normal);
                    var mouseRay = Physics.screenPointToRay(Input.mouseX, Input.mouseY);
                    var mPos = Physics.getCollisionRayPlane(mouseRay, {position:this.points[2], normal:normal}).position;
                    var end = Physics.getCollisionRayPlane(
                        {position:this.points[2], direction:this.dragPlane.normal}, 
                        {position:mPos, normal: vmath.mul(this.dragPlane.normal, 1)}
                    ).position;
                    this.extrusion = vmath.sub(end, this.points[2]);
                    var len = vmath.length(this.extrusion);
                    len = Math.round(len / 0.5) * 0.5;
                    this.extrusion = vmath.mul(vmath.normalise(this.extrusion), len);

                    if (len != this.lastPosition)
                    {
                        Audio.playSound("tools/sounds/click3.wav");
                        this.lastPosition = len;
                    }

                    var a = vmath.add(this.points[0], this.extrusion);
                    var b = vmath.add(this.points[1], this.extrusion);
                    var c = vmath.add(this.points[2], this.extrusion);
                    var d = vmath.add(this.points[3], this.extrusion);

                    drawLine(a, b, Color.disaster);
                    drawLine(b, c, Color.disaster);
                    drawLine(c, d, Color.disaster);
                    drawLine(d, a, Color.disaster);

                    drawLine(this.points[0], a, Color.orange);
                    drawLine(this.points[1], b, Color.orange);
                    drawLine(this.points[2], c, Color.orange);
                    drawLine(this.points[3], d, Color.orange);
                }

                if (Input.mouseLeftDown && this.state == "extruding")
                {
                    // create the new thing
                    writeUndo();
                    var newPart = generators.createShapeExtrude(this.points, this.extrusion, this.texture);
                    currentZone.parts.push(newPart);
                    this.state = "default";

                    Audio.playSound("tools/sounds/click2.wav");
                }
            }
        },
        update : function(dt) {
            if (this.state == "texture") {
                this.texturePickUpdate();
            } else {
                this.buildUpdate();
            }
        },
    },
};

function snapToGrid(point, snap, plane)
{
    var dom = vmath.getDominantAxisNames(plane.normal);
    point[dom.nda] = Math.round(point[dom.nda] / snap) * snap;
    point[dom.ndb] = Math.round(point[dom.ndb] / snap) * snap;
    point[dom.dom] = getPlanePoint(dom.nda, dom.ndb, dom.dom, point[dom.nda], point[dom.ndb], plane);
    return point;
}

// given two known axes/values of a point on a plane, calculate the last axis value
// for instance "i know the X and Y of a point on a plane, whats the Z"
function getPlanePoint(knownAxisA, knownAxisB, unknownAxis, coordA, coordB, plane)
{
    var distance = vmath.dot(plane.position, plane.normal);
    var z = plane.normal[knownAxisA] * coordA + plane.normal[knownAxisB] * coordB - distance;
    z /= -plane.normal[unknownAxis];
    return z;
}

function drawNormalCursor(mouseHit)
{
    var screenPoint = Draw.worldToScreenPoint(mouseHit.position);
    Draw.circle(screenPoint.x, screenPoint.y, 5.5 + Math.sin(time * 3), Color.white, false);
    drawLine(mouseHit.position, vmath.add(mouseHit.position, mouseHit.normal), Color.meat);
}