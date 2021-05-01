var collision = load("tyrian/collision.js");
var xplos = load("tyrian/xplos.js");

var bullets = [];

function newBulletType(texture, width, height, clipX, clipY, clipWidth, clipHeight, speed, collisionName, targetName)
{
    return {
        rect: {x : clipX, y : clipY, w : clipWidth, h : clipHeight},
        width: width,
        height: height,
        speed : speed,
        texture : texture,
        collisionName : collisionName,
        targetName : targetName,
    };
}

function addBullet(x, y, bulletType, vectorX, vectorY) {
    var newBullet = {
        x: x,
        y: y,
        type: bulletType,
        vectorX: vectorX,
        vectorY: vectorY,
        destroyed: false,
        collide: function(name) {
            if (name == this.type.targetName) {
                this.destroyed = true;
                xplos.add(this.x, this.y);
            }
        }
    };
    for (var i = 0; i < bullets.length; i++) {
        if (bullets[i] == null) {
            bullets[i] = newBullet;
            return;
        }
    }
    bullets.push(newBullet);
}

function update(dt)
{
    for (var i = 0; i < bullets.length; i++)
    {
        if (bullets[i] == null) continue;

        if (bullets[i].destroyed || bullets[i].y < -20 || bullets[i].y > 240 + bullets[i].type.height) {
            bullets[i] = null;
            continue;
        }
        
        collision.bbox(
            bullets[i].x - bullets[i].type.width/2, 
            bullets[i].y - bullets[i].type.height/2, 
            bullets[i].type.width, 
            bullets[i].type.height, 
            bullets[i].type.collisionName, 
            bullets[i]
        );
            
        Draw.texturePart(
            bullets[i].x - bullets[i].type.rect.w/2, 
            bullets[i].y - bullets[i].type.rect.h/2, 
            bullets[i].type.rect, 
            bullets[i].type.texture
        );

        bullets[i].x += bullets[i].vectorX * bullets[i].type.speed * dt;
        bullets[i].y += bullets[i].vectorY * bullets[i].type.speed * dt;
    }
}