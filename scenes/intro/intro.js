var key = load("keycodes.js");
var gui = load("gui.js");
var scenes = load("scenes.js");

var t;

function easeOutElastic(x)
{
    const c4 = (2 * Math.PI) / 3;
    
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;    
}

function clamp(cur, min, max)
{
    return Math.min(Math.max(cur, min), max);
}

function init()
{
    t = 0;
    logoStrWidth = logoString.length * Draw.fontWidth;
}

var logoString = "disaster engine";
var textColor = {r: 255, g:128, b:0};
var textBColor = {r: 0, g:0, b:0};
var logoStrWidth = logoString.length * Draw.fontWidth;

function update(dt)
{
    t += dt;
    //Draw.setClearColor({r:0,g:0,b:0});

    if (t<1) {
        Draw.setClearColor({r:t * 60,g:t * 60,b:t * 60});
    }

    if(t > 4.25)
    {
        scenes.goToMainMenu();
        return;
    }
    if(t > 1)
    {
        var timeAlpha = clamp((t - 1), 0, 1);
        var timeAlpha2 = clamp((t - 1.1), 0, 1);
        var timeAlpha3 = clamp((t - 1.4), 0, 1);

        var squish = easeOutElastic(timeAlpha);
        var squish2 = easeOutElastic(timeAlpha2);
        var squish3 = easeOutElastic(timeAlpha3);

        var outScale = 1 - (clamp(t - 4, 0, 1) * 8);
        squish3 *= outScale;
        Draw.setClearColor({r:outScale * 60,g:outScale * 60,b:outScale * 60});

        var targetSize = 120 / 32;

        var texTransform = {
            originX: 8,
            originY: 8,
            scaleX: squish * targetSize * outScale,
            scaleY: squish2 * targetSize * outScale,
            
        };

        Draw.textureTransformed((Draw.screenWidth/2), (Draw.screenHeight/2), texTransform, "scenes/intro/disaster.png");
        var textX = (Draw.screenWidth / 2) - (logoStrWidth/2);
        var textY = Draw.screenHeight - (50 * squish3);
        Draw.text(textX + (-2 + Math.random() * 4), textY + (-2 + Math.random() * 4), logoString, textBColor);
        Draw.text(textX + (-2 + Math.random() * 4), textY + (-2 + Math.random() * 4), logoString, textBColor);
        Draw.text(textX, textY, logoString, textColor);

        return;
    }
}

function close()
{
    Draw.setClearColor({r:0,g:0,b:0});
}