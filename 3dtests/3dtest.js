var gui = load("lib/gui.js");
var key = load("lib/keycodes.js");
var colors = load("lib/colors.js");
var camera = load("lib/camera.js");
var vmath = load("lib/vmath.js");

var hit;

var cube;

function init()
{
    // hit = Physics.getCollisionRayGround(
    //     {
    //         position : {x:3, y:10, z:5},
    //         direction : {x: 1, y:-1, z:0}
    //     },
    //     0
    // );
    

    Draw.setCamera(
        {x: 0, y: 5, z: -10},
        {x: 30, y: 0, z: 0}
    );

    cube = Assets.createMesh(
        {
            vertices : [ 
                {x: 0, y: 0, z:0}, //0
                {x: 1, y: 0, z:0}, //1
                {x: 0, y: 0, z:1}, //2
                {x: 1, y: 0, z:1}, //3
                {x: 0, y: 1, z:0}, //4
                {x: 1, y: 1, z:0}, //5 
                {x: 0, y: 1, z:1}, //6
                {x: 1, y: 1, z:1}, //7
            ],
            indices : [
                0, 1, 2,
                1, 3, 2, // bottom
                4, 7, 5, 
                4, 6, 7, // top
                0, 4, 1, 
                1, 4, 5, // front
                2, 3, 6, 
                3, 7, 6, // back
                0, 2, 4, 
                2, 6, 4, // left
                1, 5, 3, 
                5, 7, 3, // right
            ],
            // normals : [
            //     {x: -1, y: -1, z: -1},
            //     {x: 1, y: -1, z: -1},
            //     {x: -1, y: -1, z: 1},
            //     {x: 1, y: -1, z: 1},
            //     {x: -1, y: 1, z: -1},
            //     {x: 1, y: 1, z: -1},
            //     {x: -1, y: 1, z: 1},
            //     {x: 1, y: 1, z: 1},
            // ],
            colors: [
                {r: 255, g: 255, b: 255},
                {r: 255, g: 0, b: 255},
                {r: 255, g: 255, b: 0},
                {r: 0, g: 255, b: 255},
            ],
            uvs: [
                {x: 0, y: 1},
                {x: 1, y: 1},
                {x: 1, y: 1},
                {x: 0, y: 1},
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 0},
                {x: 0, y: 0},
            ],
            texture: "3dtests/face.png"
        }
    );
    
}

function makeMesh(a, b)
{

    Assets.unload(cube);

    var min = {
        x : Math.min(a.x, b.x),
        y : Math.min(a.y, b.y),
        z : Math.min(a.z, b.z),
    };

    var max = {
        x : Math.max(a.x, b.x),
        y : Math.max(a.y, b.y),
        z : Math.max(a.z, b.z),
    };

    var verts = [
        min,
        {x: min.x, y: min.y, z: max.z},
        max,
        {x: max.x, y: min.y, z: min.z},
    ];

    var indices = [
        0, 1, 2, 0, 2, 3
    ];

    var uvs = [
        {x: min.x/2, y: max.z/2},
        {x: min.x/2, y: min.z/2},
        {x: max.x/2, y: min.z/2},
        {x: max.x/2, y: max.z/2}
    ];

    var colors = [
        {r: 255, g: 255, b: 255},
        {r: 255, g: 0, b: 255},
        {r: 255, g: 255, b: 0},
        {r: 0, g: 255, b: 255},
    ]

    var texture = "3dtests/floor.png";

    cube = Assets.createMesh({
        vertices: verts, 
        indices: indices, 
        uvs: uvs,
        texture: texture,
    });
}

var t = 0;

var mtoggle = false;
var dragStart;
var boxPos = {x:0, y:0, z:0};

function update(dt)
{
    return;
    if (Input.getKeyDown(key.g)) {
        if (mtoggle) {
            Input.lockMouse();
        } else {
            Input.unlockMouse();
        }
        mtoggle =! mtoggle;
    }

    t += dt;
    gui.label("3d test zone");

    gui.label(Input.mouseX + " " + Input.mouseY);

    if (Input.mouseRightDown)
    {
        Input.lockMouse();
        camera.startControl();
    }

    if (Input.mouseRight)
    {
        camera.fpsControl(dt);
    }

    if (Input.mouseRightUp)
    {
        Input.unlockMouse();
    }

    var mouseRay = Physics.screenPointToRay(Input.mouseX, Input.mouseY);
    var groundHit = Physics.getCollisionRayGround(
        mouseRay,
        0
    );

    groundHit.position.x = Math.round(groundHit.position.x);
    groundHit.position.y = Math.round(groundHit.position.y);
    groundHit.position.z = Math.round(groundHit.position.z);

    // if (Input.mouseLeftDown && groundHit.hit)
    // {
    //     dragStart = {
    //         x: groundHit.position.x,
    //         y: groundHit.position.y,
    //         z: groundHit.position.z
    //     };
    // }

    // if (Input.mouseLeft && groundHit.hit && dragStart!=null)
    // {
    //     var a = {x: dragStart.x, y: 0, z: groundHit.position.z};
    //     var b = {x: groundHit.position.x, y: 0, z: dragStart.z};
    //     drawLine(dragStart, a, colors.white);
    //     drawLine(dragStart, b, colors.white);
    //     drawLine(a, groundHit.position, colors.white);
    //     drawLine(b, groundHit.position, colors.white);
    // }

    // if (Input.mouseLeftUp && dragStart != null)
    // {
    //     makeMesh(dragStart, groundHit.position);
    // }

    Draw.model(
        boxPos,
        {x: 0, y: t * 000, z: 0},   
        cube
    );

    Draw.wireframe(
        boxPos,
        {x: 0, y: t * 000, z: 0},   
        colors.white,
        cube,
        true,
        true
    );

    if (gui.transform3d(boxPos)) {
        boxPos = vmath.snap(boxPos, 1.0);
    }

    //drawLineGradient({x: 0, y: 0, z: 0}, {x:10, y:0, z:20}, colors.disaster, colors.red);

    // var center = Draw.worldToScreenPoint(
    //     {x: 0, y: 0, z:10}
    // );

    // var up = Draw.worldToScreenPoint(
    //     {x:0, y:1, z:10}
    // );

    // Draw.line(center.x, center.y, up.x, up.y, colors.disaster);

    if (groundHit.hit && false)
    {
        // var sp = Draw.worldToScreenPoint(groundHit.position);
        // gui.objectEditor("sp", sp);
        var u = Draw.worldToScreenPoint({ x: groundHit.position.x, y: groundHit.position.y + .5, z: groundHit.position.z });
        var d = Draw.worldToScreenPoint({ x: groundHit.position.x, y: groundHit.position.y - .5, z: groundHit.position.z });
        var l = Draw.worldToScreenPoint({ x: groundHit.position.x - .5, y: groundHit.position.y, z: groundHit.position.z });
        var r = Draw.worldToScreenPoint({ x: groundHit.position.x + .5, y: groundHit.position.y, z: groundHit.position.z });
        var f = Draw.worldToScreenPoint({ x: groundHit.position.x, y: groundHit.position.y, z: groundHit.position.z + .5 });
        var b = Draw.worldToScreenPoint({ x: groundHit.position.x, y: groundHit.position.y, z: groundHit.position.z - .5 });
        Draw.line(u.x, u.y, d.x, d.y, colors.slimegreen);
        Draw.line(l.x, l.y, r.x, r.y, colors.meat);
        Draw.line(f.x, f.y, b.x, b.y, colors.skyblue);
        // gui.transform3d(groundHit.position);
    }

    //gui.objectEditor("mouseray", );

    gui.objectEditor("hit", groundHit);
}

function drawLine(start, end, color)
{
    var s = Draw.worldToScreenPoint(start);
    var e = Draw.worldToScreenPoint(end);
    Draw.line(s.x, s.y, e.x, e.y, color);
}

function drawLineGradient(start, end, color1, color2)
{
    var s = Draw.worldToScreenPoint(start);
    var e = Draw.worldToScreenPoint(end);
    Draw.lineGradient(s.x, s.y, e.x, e.y, color1, color2);
}