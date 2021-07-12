var colors = load("lib/colors.js");
var key = load("lib/keycodes.js");
var vmath = load("lib/vmath.js");

var textColor = colors.disaster;
var fillColor = colors.black;
var highlightColor = colors.white;

var x = 0;
var y = 0;

var keyboardFocus = -1;
var oldTextValue = ""; 
var id = -1;
var openId = -1;
var scrollOffset = 0;

var hovered = false;
var lastHovered = false;

/**
 * Call to reset the gui parameters, usually at the end of a frame
 */
function reset()
{
    x = 0;
    y = 0;
    id = -1;
    hovered = false;
}

/**
 * Create a vertical space in the gui
 * @param {int} pixels space to move the gui
 */
function space(pixels)
{
    y += pixels;
}

/**
 * Write a message to the screen
 * @param {string} message message to write
 */
function label(message)
{
    id += 1;

    var width = message.length * Draw.fontWidth;
    var height = Draw.fontHeight;

    Draw.rect(x, y, width, height, fillColor, true);
    Draw.text(x, y, message, textColor);

    y += height;
}

/**
 * Write a paragraph to the screen, split by the maximum characters that can fit
 * @param {string} message message to write
 */
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

/**
 * Draw a button, which calls onClick when it is clicked
 * @param {string} message button label
 * @param {function} onClick function to be called when the button is clicked
 */
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


/**
 * Draw a boolean field to the screen which can be toggled by clicking on it.
 * @param {string} name bool label
 * @param {bool} bool value to modify
 * @returns The modified property, or original if unmodified.
 */
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

/**
 * Draw a number property, which can be clicked to modify.
 * @param {string} label number label
 * @param {number} value number to modify
 * @returns The modified number, or original if unmodified.
 */
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

/**
 * Draw a text property, which can be modified by clicking on it.
 * @param {string} label text label
 * @param {string} text string to modify
 * @returns The modified property, or the original when unmodified.
 */
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

/**
 * Draw a combo box, which can be clicked to show a list of options to select.
 * @param {string} label combobox label
 * @param {string} value current selected value
 * @param {string[]} options array of possible options
 * @param {function} onSelect callback when a new option is selected
 */
function comboBox(label, value, options, onSelect)
{
    id += 1;
    var myid = id;

    if (openId != myid) {
        button(label + " " + value, function() {
            scrollOffset = 0;
            openId = myid;
        });
    } else {
        if (Input.getKeyDown(key.escape)) {
            openId = -1;
        }

        if ( y + (options.length * Draw.fontHeight) >= 240 ) {
            if (Input.mouseWheel > 0 && scrollOffset > 0) scrollOffset -= 1;
            if (Input.mouseWheel < 0) scrollOffset += 1;
            if (scrollOffset > 240 / Draw.fontHeight) scrollOffset = Math.floor(240 / Draw.fontHeight);
        }

        for (var i = scrollOffset; i < options.length; i++)
        {
            if (value == options[i]) {
                button("-"+options[i]+"-", function() { openId = -1; onSelect(options[i]); });
            } else {
                button(" "+options[i]+" ", function() { openId = -1; onSelect(options[i]); });
            }
        }
    }
}

/**
 * Draw an object editor, automatically exposing all contained fields (recursively) as modifiable properties.
 * @param {string} name object editor label
 * @param {object} obj object to modifiy
 * @returns modified object
 */
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

/**
 * Draw an arbitrary property editor, which detects the object type and draws an appropriate editor for it
 * @param {string} name 
 * @param {object} property 
 * @returns the modified property
 */
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

/**
 * Create a transform handle which can be dragged to modify a 3d position. onChange is called when the mouse button is released, and the position has changed.
 * @param {vector3} position 
 * @param {function} onChange 
 */
function transform3d(position, onChange)
{
    var mouseRay = Physics.screenPointToRay(Input.mouseX, Input.mouseY);
    var xHit = Physics.getCollisionRayModel(mouseRay, position, vmath.zero, "tools/models/transformgizmoX.glb");
    var yHit = Physics.getCollisionRayModel(mouseRay, position, vmath.zero, "tools/models/transformgizmoY.glb");
    var zHit = Physics.getCollisionRayModel(mouseRay, position, vmath.zero, "tools/models/transformgizmoZ.glb");

    Draw.wireframe(position, vmath.zero, colors.meat, "tools/models/transformgizmoX.glb", true, false, xHit.hit || transformAxis=="x");
    Draw.wireframe(position, vmath.zero, colors.slimegreen, "tools/models/transformgizmoY.glb", true, false, yHit.hit || transformAxis=="y");
    Draw.wireframe(position, vmath.zero, colors.skyblue, "tools/models/transformgizmoZ.glb", true, false, zHit.hit || transformAxis=="z");


    if (Input.mouseLeftDown) {
        var axis = {x:0, y:0, z:0};
        
        if (xHit.hit) { axis = vmath.left; transformAxis = "x"; }
        if (yHit.hit) { axis = vmath.up; transformAxis = "y"; }
        if (zHit.hit) { axis = vmath.forward; transformAxis = "z"; }
        
        if (xHit.hit || yHit.hit || zHit.hit)
        {
            var cross = vmath.normalise(vmath.cross(axis, Draw.getCameraTransform().forward));
            var normal = vmath.cross(cross, axis);
            transformPlane = {position:position, normal:normal};
            transform3dStart = Physics.getCollisionRayPlane(mouseRay, transformPlane).position[transformAxis] - position[transformAxis];
        }
    }

    if (Input.mouseLeft && transformAxis != "n") {
        var currentPosition = Physics.getCollisionRayPlane(mouseRay, transformPlane).position[transformAxis] - transform3dStart;
        label(currentPosition);
        if (currentPosition != position[transformAxis]) {
            position[transformAxis] = currentPosition;
            onChange();
        }
    }

    if (Input.mouseLeftUp)
    {
        transformAxis = "n";
    }
}

var transformPlane;
var transformAxis = "n";
var transform3dStart = 0;

/**
 * Internal function for checking if the mouse is hovering an element
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} height 
 * @returns true/false for if it is hovering
 */
function mouseHover(x, y, width, height)
{
    if (keyboardFocus != -1) return false;
    lastHovered = false;
    var output = Input.mouseX >= x && Input.mouseX < x + width && Input.mouseY >= y && Input.mouseY < y + height;
    if (output)
    {
        hovered = true;
        lastHovered = true;
    }
    return output;
}