function add(v1, v2)
{
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    };
}

function sub(v1, v2)
{
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    };
}

function mul(vector, value)
{
    return {
        x: vector.x * value,
        y: vector.y * value,
        z: vector.z * value
    };
}

function dot(a, b)
{
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b)
{
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    }
}

function length(vector)
{
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

function distance(a, b)
{
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    // to support 2d vectors
    var az = 0;
    var bz = 0;
    if (a.z != undefined) { az = a.z; }
    if (b.z != undefined) { bz = b.z; }
    var dz = bz - az;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function sqrDistance(a, b)
{
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    // to support 2d vectors
    var az = 0;
    var bz = 0;
    if (a.z != undefined) { az = a.z; }
    if (b.z != undefined) { bz = b.z; }
    var dz = bz - az;
    return dx * dx + dy * dy + dz * dz;
}

function normalise(vector)
{
    var len = length(vector);
    if (len != 0) {
        return mul(vector, 1/length(vector));
    } else {
        return copy(zero);
    }
}

function min(vectorA, vectorB)
{
    return {
        x: Math.min(vectorA.x, vectorB.x),
        y: Math.min(vectorA.y, vectorB.y),
        z: Math.min(vectorA.z, vectorB.z)
    };
}

function max(vectorA, vectorB)
{
    return {
        x: Math.max(vectorA.x, vectorB.x),
        y: Math.max(vectorA.y, vectorB.y),
        z: Math.max(vectorA.z, vectorB.z)
    };
}

function copy(vector)
{
    return {
        x : vector.x, y : vector.y, z: vector.z
    };
}

function snap(vector, size)
{
    return {
        x: Math.round(vector.x / size) * size,
        y: Math.round(vector.y / size) * size,
        z: Math.round(vector.z / size) * size,
    };
}

function dominantVector(vector)
{
    var x = Math.abs(vector.x);
    var y = Math.abs(vector.y);
    var z = Math.abs(vector.z);
    if (x == 0 && y == 0 && z == 0) return {x:0, y:0, z:0};
    if (x > y && x > z) { return {x:vector.x, y:0, z:0}; }
    if (y > x && y > z) { return {x:0, y:vector.y, z:0}; }
    if (z > x && z > y) { return {x:0, y:0, z:vector.z}; }
    log("nooo");
    return {x:1 * Math.sign(vector.x), y:0, z:0};
}

/**
 * return the names of the dominant axis and the two non-dominant axis of the vector
 * @param {vector} vector 
*/
function getDominantAxisNames(vector)
{
    var x = Math.abs(vector.x);
    var y = Math.abs(vector.y);
    var z = Math.abs(vector.z);
    if (x > y && x > z) { return {dom:"x", nda: "y", ndb:"z"}; }
    if (y > x && y > z) { return {dom:"y", nda: "x", ndb:"z"}; }
    if (z > x && z > y) { return {dom:"z", nda: "x", ndb:"y"}; }
    return {dom:"x", nda: "y", ndb:"z"};
}

var zero = {x:0, y:0, z:0};
var one = {x:1, y:1, z:1};
var left = {x:1, y:0, z:0};
var right = {x:-1, y:0, z:0};
var up = {x:0, y:1, z:0};
var down = {x:0, y:-1, z:0};
var forward = {x:0, y:0, z:1};
var backwards = {x:0, y:0, z:-1};