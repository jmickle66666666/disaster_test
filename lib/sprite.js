var spritelist = JSON.parse(Assets.readText("tyrian/spritedefs.json"));

function draw(x, y, name)
{
    var sprite = spritelist[name];
    if (sprite == null) {
        log("no sprite: "+name);
    } else {
        Draw.texture(
            sprite.texture,
            x - sprite.rect.w/2, y - sprite.rect.h/2,
            sprite.rect
        );
    }
}

function reload()
{
    spritelist = JSON.parse(Assets.readText("tyrian/spritedefs.json"));
}