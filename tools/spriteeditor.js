var gui = load("lib/gui.js");
var scenes = load("lib/scenes.js");
var colors = load("lib/colors.js");
var spritelist;
var spritekeys;
var textures;

var showingFiles = false;
var selectTexture = false;
var currentSprite = null;
var spriteName;

var textureSize;
var dragStart;

var texturePos = {x:96, y:64};

function init()
{
    spritelist = JSON.parse(Assets.readText("lib/spritedefs.json"));

    var paths = Assets.list().split(',');
    textures = [];
    for (var i = 0; i < paths.length; i++)
    {
        if (paths[i].endsWith(".png")) {
            textures.push(paths[i]);
        }
    }

    spritekeys = Object.keys(spritelist);

    showingFiles = false;
    selectTexture = false;
    currentSprite = null;
}

function close()
{

}

function update(dt)
{
    //Draw.rect(0, 0, 320, 240, colors.nightblue, true);
    gui.button("file", function() { showingFiles = !showingFiles });
    if (showingFiles) {
        gui.button("new")
        gui.button("exit", function() { scenes.goToMainMenu(); });
        gui.label("--");
        for (var i = 0; i < spritekeys.length; i++)
        {
            gui.button(spritekeys[i], function() {
                currentSprite = JSON.parse(JSON.stringify(spritelist[spritekeys[i]]));
                spriteName = spritekeys[i];
                textureSize = Assets.getTextureSize(currentSprite.texture);
                showingFiles = false;
            });
        }
    }

    if (selectTexture) {
        for (var i = 0; i < textures.length; i++) {
            gui.button(textures[i], function() {
                currentSprite.texture = textures[i];
                textureSize = Assets.getTextureSize(currentSprite.texture);
                selectTexture = false;
            });
        }
    }

    if (currentSprite != null)
    {
        var sprite = currentSprite;

        gui.label("--");

        spriteName = gui.textField("name:", spriteName);
        
        gui.button("texture: "+sprite.texture, function() {
            selectTexture = true;
        });

        Draw.texturePart(texturePos.x - sprite.rect.w, texturePos.y, sprite.rect, sprite.texture);
        Draw.texture(texturePos.x, texturePos.y, sprite.texture);

        Draw.rect(
            texturePos.x,
            texturePos.y,
            textureSize.w + 1,
            textureSize.h + 1,
            colors.darkbrown,
            false
        );

        if (Input.mouseX >= texturePos.x &&
            Input.mouseX < texturePos.x + textureSize.w &&
            Input.mouseY >= texturePos.y &&
            Input.mouseY < texturePos.y + textureSize.h) 
        {
            var mx = Math.round(Input.mouseX / 8) * 8;
            var my = Math.round(Input.mouseY / 8) * 8;

            if (Input.mouseLeftDown) {
                dragStart = {
                    x : mx - texturePos.x,
                    y : my - texturePos.y
                };
            }

            Draw.line(mx, texturePos.y, mx, texturePos.y + textureSize.h, colors.gray);
            Draw.line(texturePos.x, my, texturePos.x + textureSize.w, my, colors.gray);

            if (Input.mouseLeft) {
                Draw.rect(
                    texturePos.x + dragStart.x,
                    texturePos.y + dragStart.y,
                    mx - (texturePos.x + dragStart.x),
                    my - (texturePos.y + dragStart.y),
                    colors.seablue,
                    false
                );
            }

            if (Input.mouseLeftUp) {
                sprite.rect.x = dragStart.x;
                sprite.rect.y = dragStart.y;
                sprite.rect.w = mx - (texturePos.x + dragStart.x);
                sprite.rect.h = my - (texturePos.y + dragStart.y);
            }
        }

        Draw.rect(
            texturePos.x + sprite.rect.x, 
            texturePos.y + sprite.rect.y,
            sprite.rect.w + 1,
            sprite.rect.h + 1,
            colors.slimegreen,
            false
        );

        gui.button("save", function() { 
            spritelist[spriteName] = sprite;
            Assets.writeText("tyrian/spritedefs.json", JSON.stringify(spritelist));
            spritekeys = Object.keys(spritelist);
            currentSprite = null; 
        });
        gui.button("close", function() { currentSprite = null; });

        

    }
    

    // for (var i = 0; i < textures.length; i++)
    // {
    //     gui.label(textures[i]);
    // }
    //gui.label(typeof(spritelist));
    //gui.objectEditor("spritedefs", spritelist);
    
}