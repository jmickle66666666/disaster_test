var collision = load("tyrian/collision.js");
var xplos = load("tyrian/xplos.js");
var bullets = load("tyrian/bullets.js");
var score = load("tyrian/score.js");

var enemies = [];

var enemyBullet = bullets.newBulletType(
    "tyrian/sprites/sprites.png",
    8, 8,
    0, 80, 8, 8,
    80,
    "enemyBullet",
    "player"
);

var shootFreq = 1;
var shootTime = 0;

function addEnemy(x, y, movetype, speed, type)
{
    var newEnemy = {
        x: x, y: y, type : type,
        hit: false,
        hp : type.hp,
        deathLength : .5,
        deathTime : 0,
        movetype : movetype,
        speed: speed,
        collide: function(othername) 
        {
            if (othername == "bullet") {
                this.hit = true;
                this.hp -= 1;
            }
        }
    };

    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i] == null) {
            enemies[i] = newEnemy;
            return;
        }
    }

    enemies.push(
        newEnemy  
    );
}

function newEnemyType(width, height, hp, bulletType, spriteRect, spriteRectHit)
{
    return {
        width: width, height: height, hp: hp, bulletType: bulletType, spriteRect: spriteRect, spriteRectHit: spriteRectHit
    };
}

function update(dt, px, py)
{
    shootTime += dt;
    var shoot = false;
    if (shootTime > shootFreq)
    {
        shootTime -= shootFreq;
        shoot = true;
    }
    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i] == null) continue;

        switch(enemies[i].movetype) 
        {
            case "down":
                enemies[i].y += dt * 20 * enemies[i].speed;
                break;
            case "sine":
                enemies[i].y += dt * 20 * enemies[i].speed;
                enemies[i].x = 120 + Math.sin(enemies[i].y / 20) * 60;
                break;
            case "-sine":
                enemies[i].y += dt * 20 * enemies[i].speed;
                enemies[i].x = 120 - Math.sin(enemies[i].y / 20) * 60;
                break;
        }

        if (enemies[i].hp <= 0) {
            enemies[i].hit = true;
            enemies[i].deathTime += dt;
            xplos.add(
                enemies[i].x + (Math.random() * enemies[i].type.width) - enemies[i].type.width/2,
                enemies[i].y + (Math.random() * enemies[i].type.height) - enemies[i].type.height/2
            );
        } else {

            collision.bbox(
                enemies[i].x - enemies[i].type.width/2, 
                enemies[i].y - enemies[i].type.height/2, 
                enemies[i].type.width, 
                enemies[i].type.height, 
                "enemy", 
                enemies[i]
            );
            
        }



        if (shoot) {
            if (enemies[i].type.bulletType == "target") {
                var vectorX = px - enemies[i].x;
                var vectorY = py - enemies[i].y;
                var magnitude = Math.sqrt((vectorX * vectorX) + (vectorY * vectorY));
                vectorX /= magnitude;
                vectorY /= magnitude;
                bullets.addBullet(enemies[i].x, enemies[i].y, enemyBullet, vectorX, vectorY);
            }
        }

        Draw.texturePart(
            Math.floor(enemies[i].x - enemies[i].type.spriteRect.w/2), 
            Math.floor(enemies[i].y - enemies[i].type.spriteRect.h/2), 
            enemies[i].hit? enemies[i].type.spriteRectHit : enemies[i].type.spriteRect, 
            "tyrian/sprites/sprites.png"
        );

        enemies[i].hit = false;

        if (enemies[i].deathTime > enemies[i].deathLength) { 
            score.score += 10;
            xplos.addBig(enemies[i].x, enemies[i].y);
            enemies[i] = null;
        }

        if (enemies[i] != null && enemies[i].y > 240 + enemies[i].type.height) {
            enemies[i] = null;
        }
    }
}
