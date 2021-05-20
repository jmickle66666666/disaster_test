var colors = load("lib/colors.js");
var key = load("lib/keycodes.js");

var textColor = colors.disaster;
var fillColor = colors.black;
var highlightColor = colors.white;

var x = 0;
var y = 0;

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

    Draw.rect(x, y, width, height, fillColor, true);
    Draw.text(x, y, message, textColor);

    y += height;
}

function paragraph(message)
{
    id += 1;
    var charWidth = Math.floor(Draw.screenWidth / Draw.fontWidth);
    var lines = Math.ceil(message.length / charWidth);
    Draw.rect(x, y, charWidth * Draw.fontWidth, Draw.fontHeight * lines, fillColor, true);
    for (var i = 0; i < lines; i+=1)
    {
        Draw.text(x, y, message.substring(i * charWidth, (i * charWidth) + charWidth), textColor);
        y += Draw.fontHeight;
    }
}

function button(message, onClick)
{
    id += 1;
    var width = message.length * Draw.fontWidth;
    var height = Draw.fontHeight;

    Draw.rect(x, y, width, height, fillColor, true);
    if (mouseHover(x, y, width, height)) {
        Draw.rect(x, y, width, height, highlightColor, false);
        if (Input.mouseLeftDown) {
            onClick();
        }
    }
    Draw.text(x, y, message, textColor);

    y += height;
}

function boolField(name, bool)
{
    id += 1;
    var width = (name.length+4) * Draw.fontWidth;
    var height = Draw.fontHeight;

    Draw.rect(x, y, width, height, fillColor, true);
    if (mouseHover(x, y, width, height)) {
        Draw.rect(x, y, width, height, highlightColor, false);
        if (Input.mouseLeftDown) {
            bool = !bool;
        }
    }
    if (bool) {
        Draw.text(x, y, name + " [X]", textColor);
    } else {
        Draw.text(x, y, name + " [ ]", textColor);
    }

    y += height;

    return bool;
}

function numberField(label, value)
{
    id += 1;
    
    var width = (label.length + value.toString().length + 1) * Draw.fontWidth;
    var height = Draw.fontHeight;

    Draw.rect(x, y, width, height, fillColor, true);
    if (keyboardFocus == id) {

        if (Input.getKeyDown(key.escape)) {
            value = oldTextValue;
            keyboardFocus = -1;
        } else if (Input.getKeyDown(key.return)) {
            var outvalue = parseFloat(value);
            if (outvalue == NaN) {
                value = oldTextValue;
            } else {
                value = outvalue;
            }
            keyboardFocus = -1;
        } else if (Input.getKeyDown(key.backspace)) {
            if (value.length > 0) {
                value = value.substring(0, value.length - 1);
            }
        } else {
            value += Input.inputString;
        }
            
        Draw.line(x + width, y, x + width, y + height, highlightColor);

    } else {
        if (mouseHover(x, y, width, height)) {
            Draw.rect(x, y, width, height, highlightColor, false);
            if (Input.mouseLeftDown) {
                keyboardFocus = id;
                oldTextValue = value;
            }
        }
    }

    Draw.text(x, y, label + " " + value.toString(), textColor);

    y += height;

    return value;
}

function textField(label, text)
{
    id += 1;
    
    var width = (label.length + text.length + 1) * Draw.fontWidth;
    var height = Draw.fontHeight;

    Draw.rect(x, y, width, height, fillColor, true);
    if (keyboardFocus == id) {

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
            text += Input.inputString;
        }
            
        Draw.line(x + width, y, x + width, y + height, highlightColor);

    } else {
        if (mouseHover(x, y, width, height)) {
            Draw.rect(x, y, width, height, highlightColor, false);
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

function objectEditor(name, obj)
{
    label(name+":");
    x += Draw.fontWidth;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++)
    {
        if (obj[keys[i]] != null) obj[keys[i]] = propertyField(keys[i], obj[keys[i]]);
    }
    x -= Draw.fontWidth;
    return obj;
}

function propertyField(name, property)
{
    switch (typeof(property))
    {
        case 'number': return numberField(name, property);
        case 'string': return textField(name, property);
        case 'object': return objectEditor(name, property);
        case 'boolean' : return boolField(name, property);
        case 'function':
            button(name, function() { property(); });
            return property;
        default:
            label(name + ": " + typeof(property));
            return property;
    }
}

function mouseHover(x, y, width, height)
{
    return Input.mouseX >= x && Input.mouseX < x + width && Input.mouseY >= y && Input.mouseY < y + height;
}