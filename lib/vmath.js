function add(v1, v2)
{
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
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

