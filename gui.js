var x = 0;
var y = 0;
var textColor = {r: 255, g:128, b:0};
var fillColor = {r: 64, g: 48, b:32};
var highlightColor = {r:255, g:255, b:255};

function reset()
{
    x = 0;
    y = 0;
}

function space(pixels)
{
    y += pixels;
}

function label(message)
{
    var width = message.length * Draw.fontWidth;
    var height = Draw.fontHeight;

    Draw.fillRect(x, y, width, height, fillColor);
    Draw.text(x, y, message, textColor);

    y += height;
}

function button(message, onClick)
{
    var width = message.length * Draw.fontWidth;
    var height = Draw.fontHeight;

    Draw.fillRect(x, y, width, height, fillColor);
    if (mouseHover(x, y, width, height)) {
        Draw.strokeRect(x, y, width, height, highlightColor);
        if (Input.mouseLeftDown) {
            onClick();
        }
    }
    Draw.text(x, y, message, textColor);

    y += height;
}

function mouseHover(x, y, width, height)
{
    return Input.mouseX >= x && Input.mouseX < x + width && Input.mouseY >= y && Input.mouseY < y + height;
}