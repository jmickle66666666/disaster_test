var offsetX = 0;
var offsetY = 0;
var friction = 10;

function shake(amount)
{
    offsetX += amount * -Math.random();
    offsetY += amount * Math.random();
}

function update(dt)
{
    Draw.offset(offsetX, offsetY);
    offsetX *= Math.exp(friction * -dt);
    offsetY *= Math.exp(friction * -dt);
}