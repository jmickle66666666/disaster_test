var bullets = load("tyrian/bullets.js");

var blasterL = bullets.newBulletType(
    "tyrian/sprites/sprites.png", 
    8, 16,
    0, 32, 8, 16,
    240,
    "bullet",
    "enemy"
);

var blasterR = bullets.newBulletType(
    "tyrian/sprites/sprites.png", 
    8, 16,
    8, 32, 8, 16,
    240,
    "bullet",
    "enemy"
);

var tbeam1 = bullets.newBulletType(
    "tyrian/sprites/sprites.png",
    16, 16,
    0, 48, 16, 16,
    16000,
    "bullet",
    "enemy"
);

var tbeam2 = bullets.newBulletType(
    "tyrian/sprites/sprites.png",
    16, 16,
    0, 64, 16, 16,
    16000,
    "bullet",
    "enemy"
);

var list = {
    blaster : {
        fireRate : 0.1,
        fire : function (x, y) {
            bullets.addBullet(x-4, y - 16, blasterL, 0, -1);
            bullets.addBullet(x+4, y - 16, blasterR, 0, -1);
            Audio.playSound("audio/shoot1.wav");
        }
    },
    superBlaster : {
        fireRate : 0.1,
        fire : function (x, y) {
            bullets.addBullet(x-9, y - 14, blasterL, 0, -1);
            bullets.addBullet(x-4, y - 16, blasterL, 0, -1);
            bullets.addBullet(x+4, y - 16, blasterR, 0, -1);
            bullets.addBullet(x+9, y - 14, blasterR, 0, -1);
            Audio.playSound("audio/shoot1.wav");
        }
    },
    tbeam : {
        fireRate : 0.016,
        flip : false,
        count : 0,
        fire : function (x, y) {
            this.count += 1;
            if (this.count > 1) {
                this.flip = !this.flip;
                this.count = 0;
            }
            for (var i = y - 16; i > -16; i -= 16) {
                bullets.addBullet(x, i, this.flip?tbeam1:tbeam2, 0, -1);
            }
            // bullets.addBullet(x, y - 0, tbeam);
        }
    }
}

