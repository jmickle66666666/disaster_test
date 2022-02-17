var gui = load("lib/gui.js");
var camera = load("lib/camera.js");
var vmath = load("lib/vmath.js");
var zone = load("lib/zone.js");
var generators = load("lib/zonegenerators.js");
var filebrowser = load("tools/filebrowser.js");

var currentZone;
var currentTool = "box";

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

    //  Audio.playMusic("tools/sounds/sampletext.ogg");
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
    if (Input.getKeyDown(Key.key4)) { currentTool = "edge"; tools[currentTool].init(); }
    if (Input.getKeyDown(Key.key5)) { currentTool = "shapeExtrude"; tools[currentTool].init(); }

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
                if (this.selection[i].part.type == "mesh") {
                    center = vmath.add(center, this.selection[i].part.data.vertices[this.selection[i].vertex]);
                }
            }
            this.position = vmath.mul(center, 1 / this.selection.length);
        },
        moveSelectedVertices: function(amount) {
            for (var i = 0; i < this.selection.length; i++)
            {
                if (this.selection[i].part.type == "mesh") {
                    this.selection[i].part.data.vertices[this.selection[i].vertex] = vmath.add(amount, this.selection[i].part.data.vertices[this.selection[i].vertex]);
                }
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
                //gui.label("nothing selected :) great job");
                tools["select"].update(dt);
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
                if (this.selection[i].part.type == "mesh") {
                    var p = Draw.worldToScreenPoint(this.selection[i].part.data.vertices[this.selection[i].vertex]);
                    Draw.circle(p.x, p.y, 3.5, Color.white, true);
                } 
            }

            if (Input.mouseLeftDown && !gui.hovered) {
                this.recalcPosition();
            }

            
        }
    },

    "shapeExtrude" : {
        selection : [],
        extrudeSelected : false,
        position : {x: 0, y: 0, z:0},
        extrudePosition : {x: 0, y: 0, z:0},
        extrudeCenter : {x: 0, y: 0, z:0},

        modified : true,
        recalcPosition: function() {
            var center = {x: 0, y: 0, z: 0};
            for (var i = 0; i < this.selection.length; i++)
            {
                center = vmath.add(center, this.selection[i].part.points[this.selection[i].point]);
            }
            this.position = vmath.mul(center, 1 / this.selection.length);
        },
        moveSelectedVertices: function(amount) {
            for (var i = 0; i < this.selection.length; i++)
            {
                this.selection[i].part.points[this.selection[i].point] = vmath.add(amount, this.selection[i].part.points[this.selection[i].point]);
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
                //gui.label("nothing selected :) great job");
                tools["select"].update(dt);
                return;
            }

            gui.label(this.extrudeSelected);

            if (this.selection.length != 0 && this.extrudeSelected == false && !Input.getKey(Key.leftshift))
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

            if (this.extrudeSelected && !Input.getKey(Key.leftshift)) {
                var tempPos = vmath.copy(this.extrudePosition);
                if (gui.transform1d(tempPos, selectedParts[0].extrusion)) {
                    var offset = vmath.sub(tempPos, this.extrudePosition);
                    var length = vmath.length(offset);
                    length = Math.round(length / snapSize) * snapSize;
                    var move = vmath.mul(vmath.normalise(offset), length);
                    if (length != 0) {
                        if (!this.modified) {
                            writeUndo();
                            this.modified = true;
                        }
                        Audio.playSound("tools/sounds/click4.wav");
                        selectedParts[0].extrusion = vmath.sub(tempPos, this.extrudeCenter);
                        generators.generate(tools["select"].selection[0]);
                    }
                }
            }

            if (!Input.mouseLeft)
            {
                this.modified = false;
            }

            if (Input.mouseLeftDown && !gui.hovered && !Input.getKey(Key.leftshift)) {
                this.selection = [];
                this.extrudeSelected = false;
                
                Audio.playSound("tools/sounds/click2.wav");
            }

            for (var i = 0; i < selectedParts.length; i++)
            {
                var part = selectedParts[i];

                this.extrudePosition = {x:0, y:0, z:0};

                for (var j = 0; j < part.points.length; j++)
                {
                    this.extrudePosition.x += part.points[j].x;
                    this.extrudePosition.y += part.points[j].y;
                    this.extrudePosition.z += part.points[j].z;
                    var p = Draw.worldToScreenPoint(part.points[j]);
                    if (vmath.distance(p, {x:Input.mouseX, y:Input.mouseY}) < 6) {
                        Draw.circle(p.x, p.y, 3.5, Color.disaster, true);
                        if (Input.mouseLeftDown && !gui.hovered) {
                            this.selection.push({point: j, part: part});
                            Audio.playSound("tools/sounds/click3.wav");
                        }
                    } else {
                        Draw.circle(p.x, p.y, 3.5, Color.disaster, false);
                    }
                }

                this.extrudePosition.x /= part.points.length;
                this.extrudePosition.y /= part.points.length;
                this.extrudePosition.z /= part.points.length;

                this.extrudeCenter = vmath.copy(this.extrudePosition);

                this.extrudePosition = vmath.add(this.extrudePosition, part.extrusion);

                if (selectedParts.length == 1) {
                    var pc = Draw.worldToScreenPoint(this.extrudePosition);

                    if (vmath.distance(pc, {x: Input.mouseX, y:Input.mouseY}) < 6) {
                        Draw.circle(pc.x, pc.y, 3.5, Color.disaster, true);
                        if (Input.mouseLeftDown && !gui.hovered) {
                            this.selection = [];
                            this.extrudeSelected = true;
                            Audio.playSound("tools/sounds/click3.wav");
                        }
                    } else {
                        Draw.circle(pc.x, pc.y, 3.5, Color.disaster, false);
                    }
                }

            }

            for (var i = 0; i < this.selection.length; i++)
            {
                var p = Draw.worldToScreenPoint(this.selection[i].part.points[this.selection[i].point]);
                Draw.circle(p.x, p.y, 3.5, Color.white, true);
            }

            if (Input.mouseLeftDown && !gui.hovered) {
                this.recalcPosition();
            }

            
        }
    },

    "edge" :  {
        selection : [],
        position : {x: 0, y: 0, z:0},
        modified : true,

        init : function() {

        },
        
        update : function (dt) {

            var selectedParts = tools["select"].selection;
            if (selectedParts.length == 0) {
                //gui.label("nothing selected :) great job");
                tools["select"].update(dt);
                return;
            }

            for (var i = 0; i < selectedParts.length; i++)
            {
                var part = selectedParts[i];
                if (part.type == "mesh") {
                    for (var j = 0; j < part.data.indices.length; j++)
                    {
                        var j1 = j;
                        var j2 = j + 1;
                        if (j % 3 == 2) j2 = j - 2;

                        var v1 = part.data.vertices[part.data.indices[j1]];
                        var v2 = part.data.vertices[part.data.indices[j2]]

                        var avg = {
                            x: (v1.x + v2.x) / 2,
                            y: (v1.y + v2.y) / 2,
                            z: (v1.z + v2.z) / 2
                        }

                        // var p1 = Draw.worldToScreenPoint(v1);
                        // var p2 = Draw.worldToScreenPoint(v2);
                        //Draw.line(p1.x, p1.y, p2.x, p2.y, Color.disaster);


                        var avs = Draw.worldToScreenPoint(avg);
                        Draw.circle(avs.x, avs.y, 3.5, Color.disaster, false);
                        // if (vmath.distance(p, {x:Input.mouseX, y:Input.mouseY}) < 6) {
                        //     Draw.circle(p.x, p.y, 3.5, Color.disaster, true);
                        //     if (Input.mouseLeftDown && !gui.hovered) {
                        //         this.selection.push({vertex: j, part: part});
                        //         Audio.playSound("tools/sounds/click3.wav");
                        //     }
                        // } else {
                        //     Draw.circle(p.x, p.y, 3.5, Color.disaster, false);
                        // }
                    }
                }
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

                if (Input.getKeyDown(Key.delete) && this.selection.length > 0) {
                    writeUndo();
                    for (var i = 0; i < currentZone.parts.length; i++)
                    {
                        if (this.selection.includes(currentZone.parts[i])) {
                            currentZone.parts.splice(i, 1);
                            i -= 1;
                        }
                    }
                    this.selection = [];
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
        texture: "textures/AQF019.png",
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
                // this.state = "texture";
                // this.textureListOffset = 0;

                filebrowser.browse(
                    ".png",
                    "",
                    function(loadpath) {
                        tools[currentTool].texture = loadpath;
                        //state = "edit";
                        //return;
                    }
                );

                // log("woops");
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

                    Draw.line3d(start, a, Color.disaster);
                    Draw.line3d(a, end, Color.disaster);
                    Draw.line3d(end, b, Color.disaster);
                    Draw.line3d(b, start, Color.disaster);

                    this.points = [start, a, end, b];
                }

                if (Input.mouseLeftUp && this.state == "dragging") {
                    
                    this.state = "extruding";
                    Audio.playSound("tools/sounds/click2.wav");
                }

                if (this.state == "extruding")
                {
                    Draw.line3d(this.points[0], this.points[1], Color.disaster);
                    Draw.line3d(this.points[1], this.points[2], Color.disaster);
                    Draw.line3d(this.points[2], this.points[3], Color.disaster);
                    Draw.line3d(this.points[3], this.points[0], Color.disaster);

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

                    Draw.line3d(a, b, Color.disaster);
                    Draw.line3d(b, c, Color.disaster);
                    Draw.line3d(c, d, Color.disaster);
                    Draw.line3d(d, a, Color.disaster);

                    Draw.line3d(this.points[0], a, Color.orange);
                    Draw.line3d(this.points[1], b, Color.orange);
                    Draw.line3d(this.points[2], c, Color.orange);
                    Draw.line3d(this.points[3], d, Color.orange);
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
    Draw.line3d(mouseHit.position, vmath.add(mouseHit.position, mouseHit.normal), Color.meat);
}