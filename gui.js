var colors = load("colors.js");
var key = load("keycodes.js");

var x = 0;
var y = 0;
var textColor = colors.disaster;
var fillColor = colors.black;
var highlightColor = colors.white;

var keyboardFocus = -1;
var oldTextValue = ""; 
var id = -1;

function reset()
{
    x = 0;
    y = 0;
    id = -1;
}

function space(pixels)
{
    y += pixels;
}

function label(message)
{
    id += 1;
    var width = message.length * Draw.fontWidth;
    var height = Draw.fontHeight;

    Draw.fillRect(x, y, width, height, fillColor);
    Draw.text(x, y, message, textColor);

    y += height;
}

function button(message, onClick)
{
    id += 1;
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

function textField(label, text)
{
    id += 1;
    
    var width = (label.length + text.length + 1) * Draw.fontWidth;
    var height = Draw.fontHeight;

    Draw.fillRect(x, y, width, height, fillColor);
    if (keyboardFocus == id) {

        if (Input.anyKeyDown) {   
            if (Input.getKeyDown(key.escape)) {
                text = oldTextValue;
                keyboardFocus = -1;
            } else if (Input.getKeyDown(key.return)) {
                keyboardFocus = -1;
            } else if (Input.getKeyDown(key.backspace)) {
                if (text.length > 0) {
                    text = text.substring(0, text.length - 1);
                }
            } else {
                text += Input.lastChar;
            }
        }
            
        Draw.line(x + width, y, x + width, y + height, highlightColor);

    } else {
        if (mouseHover(x, y, width, height)) {
            Draw.strokeRect(x, y, width, height, highlightColor);
            if (Input.mouseLeftDown) {
                keyboardFocus = id;
                oldTextValue = text;
            }
        }
    }

    Draw.text(x, y, label + " " + text, textColor);

    y += height;

    return text;
}

function mouseHover(x, y, width, height)
{
    return Input.mouseX >= x && Input.mouseX < x + width && Input.mouseY >= y && Input.mouseY < y + height;
}