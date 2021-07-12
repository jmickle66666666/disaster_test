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

function normalise(vector)
{
    return mul(vector, 1/length(vector));
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
    if (x > y && x > z) { return {x:1 * Math.sign(vector.x), y:0, z:0}; }
    if (y > x && y > z) { return {x:0, y:1 * Math.sign(vector.y), z:0}; }
    if (z > x && z > y) { return {x:0, y:0, z:1 * Math.sign(vector.z)}; }
    log("nooo");
    return {x:1 * Math.sign(vector.x), y:0, z:0};
}

var zero = {x:0, y:0, z:0};
var left = {x:1, y:0, z:0};
var right = {x:-1, y:0, z:0};
var up = {x:0, y:1, z:0};
var down = {x:0, y:-1, z:0};
var forward = {x:0, y:0, z:1};
var backwards = {x:0, y:0, z:-1};