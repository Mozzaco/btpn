// This example uses the Phaser 2.2.2 framework

// Copyright © 2014 John Watson
// Licensed under the terms of the MIT License

var GameState = function(game) {
};

let points = 0;
let essais = 0;
const max_essais = 10;

// Load images and sounds
GameState.prototype.preload = function() {
    this.game.load.image('canon', '/images/canon_bis_128.png');
    this.game.load.image('bullet', '/images/santa_bis.png');
    this.game.load.spritesheet('ground', '/images/snow_64.png');
    this.game.load.spritesheet('fireplace', '/images/fireplace_64.png');
    this.game.load.spritesheet('explosion', '/images/blood-splatter.png', 128, 128);
    game.load.spritesheet('snowflakes', 'images/snowflakes.png', 17, 17);
    this.game.load.audio('fall1', '/images/fall1.mp3')
    this.game.load.audio('fall2', '/images/fall2.mp3')
    this.game.load.audio('fall3', '/images/fall3.mp3')
    this.game.load.audio('fall4', '/images/fall4.mp3')
    this.game.load.audio('fall5', '/images/fall5.mp3')
    this.game.load.audio('fall6', '/images/fall6.mp3')
    game.load.spritesheet('snowflakes_large', 'images/snowflakes-large.png', 64, 64)
};

var max = 0;
var front_emitter;
var mid_emitter;
var back_emitter;
var update_interval = 4 * 60;
var i = 0;

// Setup the example
GameState.prototype.create = function () {

    this.game.stage.backgroundColor = null;

    // Define constants
    this.SHOT_DELAY = 1000; // milliseconds
    this.BULLET_SPEED = 500; // pixels/second
    this.NUMBER_OF_BULLETS = 10;
    this.GRAVITY = 800; // pixels/second/second

    // Create an object representing our gun
    this.gun = this.game.add.sprite(140, this.game.height - 430, 'canon');

    // Set the pivot point to the center of the gun
    this.gun.anchor.setTo(0.5, 0.5);

    // Create an object pool of bullets
    this.bulletPool = this.game.add.group();
    for (var i = 0; i < this.NUMBER_OF_BULLETS; i++) {
        // Create each bullet and add it to the group.
        var bullet = this.game.add.sprite(0, 0, 'bullet');
        this.bulletPool.add(bullet);

        // Set its pivot point to the center of the bullet
        bullet.anchor.setTo(-0.4, 0.8);

        // Enable physics on the bullet
        this.game.physics.enable(bullet, Phaser.Physics.ARCADE);

        // Set its initial state to "dead".
        bullet.kill();
    }

    // Turn on gravity
    game.physics.arcade.gravity.y = this.GRAVITY;

    // Create some ground
    this.ground = this.game.add.group();
    for (var x = 0; x < 800; x += 64) {
        // Add the ground blocks, enable physics on each, make them immovable
 
        if (x === 256) {
            var groundBlock = this.game.add.sprite(x, this.game.height -64, 'fireplace');
        } else if(x === 384){
            var groundBlock = this.game.add.sprite(x, this.game.height -48, 'fireplace');
        }else if(x === 512){
            var groundBlock = this.game.add.sprite(x, this.game.height -48, 'fireplace');
        }else if(x === 640){
            var groundBlock = this.game.add.sprite(x, this.game.height -64, 'fireplace');
        } else {
            var groundBlock = this.game.add.sprite(x, this.game.height - 32, 'ground');
        }

            this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
            groundBlock.body.immovable = true;
            groundBlock.body.allowGravity = false;
            this.ground.add(groundBlock);
    }

    // Create a group for explosions
    this.explosionGroup = this.game.add.group();

    // Simulate a pointer click/tap input at the center of the stage
    // when the example begins running.
    this.game.input.activePointer.x = this.game.width / 2;
    this.game.input.activePointer.y = this.game.height / 2 - 100;


    back_emitter = game.add.emitter(game.world.centerX, -32, 600);
    back_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
    back_emitter.maxParticleScale = 0.6;
    back_emitter.minParticleScale = 0.2;
    back_emitter.setYSpeed(20, 100);
    back_emitter.gravity = 0;
    back_emitter.width = game.world.width * 1.5;
    back_emitter.minRotation = 0;
    back_emitter.maxRotation = 40;

    mid_emitter = game.add.emitter(game.world.centerX, -32, 250);
    mid_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
    mid_emitter.maxParticleScale = 1.2;
    mid_emitter.minParticleScale = 0.8;
    mid_emitter.setYSpeed(50, 150);
    mid_emitter.gravity = 0;
    mid_emitter.width = game.world.width * 1.5;
    mid_emitter.minRotation = 0;
    mid_emitter.maxRotation = 40;

    front_emitter = game.add.emitter(game.world.centerX, -32, 50);
    front_emitter.makeParticles('snowflakes_large', [0, 1, 2, 3, 4, 5]);
    front_emitter.maxParticleScale = 1;
    front_emitter.minParticleScale = 0.5;
    front_emitter.setYSpeed(100, 200);
    front_emitter.gravity = 0;
    front_emitter.width = game.world.width * 1.5;
    front_emitter.minRotation = 0;
    front_emitter.maxRotation = 40;

    changeWindDirection();

    back_emitter.start(false, 14000, 20);
    mid_emitter.start(false, 12000, 40);
    front_emitter.start(false, 6000, 1000);

};

GameState.prototype.shootBullet = function() {
    // Enforce a short delay between shots by recording
    // the time that each bullet is shot and testing if
    // the amount of time since the last shot is more than
    // the required delay.
    if (this.lastBulletShotAt === undefined) this.lastBulletShotAt = 0;
    if (this.game.time.now - this.lastBulletShotAt < this.SHOT_DELAY) return;
    this.lastBulletShotAt = this.game.time.now;

    // Get a dead bullet from the pool
    var bullet = this.bulletPool.getFirstDead();

    const cry = ['fall1', 'fall2', 'fall3', 'fall4', 'fall5', 'fall6']
    const shout = this.sound.add(cry[Math.floor(Math.random()*cry.length)])
    shout.play()

    // If there aren't any bullets available then don't shoot
    if (bullet === null || bullet === undefined) return;

    // Revive the bullet
    // This makes the bullet "alive"
    bullet.revive();

    // Bullets should kill themselves when they leave the world.
    // Phaser takes care of this for me by setting this flag
    // but you can do it yourself by killing the bullet if
    // its x,y coordinates are outside of the world.
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = false;

    // Set the bullet position to the gun position.
    bullet.reset(this.gun.x, this.gun.y);
    bullet.rotation = this.gun.rotation;

    // Shoot it in the right direction
    bullet.body.velocity.x = Math.cos(bullet.rotation) * this.BULLET_SPEED;
    bullet.body.velocity.y = Math.sin(bullet.rotation) * this.BULLET_SPEED;
};

// The update() method is called every frame
GameState.prototype.update = function() {
    // Check if bullets have collided with the ground
    this.game.physics.arcade.collide(this.bulletPool, this.ground, function(bullet, ground) {
        // Create an explosion

        if (bullet._bounds.x >= 256 - 16 && bullet._bounds.x <= 256 + 16) {
            if (this.ground.children[4].visible === false) {
                console.log("perdu");
                essais = essais + 1
                this.getExplosion(bullet.x, bullet.y);
            } else {
                console.log("victoire!")
                points = points + 1
                essais = essais + 1
                this.ground.children[4].visible = false
            }
        } else if (bullet._bounds.x >= 384 - 16 && bullet._bounds.x <= 384 + 16) {
            if (this.ground.children[6].visible === false) {
                console.log("perdu");
                essais = essais + 1
                this.getExplosion(bullet.x, bullet.y);
            } else {
                console.log("victoire!")
                points = points + 1
                essais = essais + 1
                this.ground.children[6].visible = false
            }
        } else if (bullet._bounds.x >= 512 - 16 && bullet._bounds.x <= 512 + 16) {
            if (this.ground.children[8].visible === false) {
                console.log("perdu");
                essais = essais + 1
                this.getExplosion(bullet.x, bullet.y);
            } else {
                console.log("victoire!")
                points = points + 1
                essais = essais + 1
                this.ground.children[8].visible = false
            }
        } else if (bullet._bounds.x >= 640 - 16 && bullet._bounds.x <= 640 + 16) {
            if (this.ground.children[10].visible === false) {
                console.log("perdu");
                essais = essais + 1
                this.getExplosion(bullet.x, bullet.y);
            } else {
                console.log("victoire!")
                points = points + 1
                essais = essais + 1
                this.ground.children[10].visible = false
            }
        } else {
                console.log("perdu")
                essais = essais + 1
                this.getExplosion(bullet.x, bullet.y);
            }
        
        // Kill the bullet
        bullet.kill();
    }, null, this);

    // Rotate all living bullets to match their trajectory
    this.bulletPool.forEachAlive(function(bullet) {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
    }, this);

    // Aim the gun at the pointer.
    // All this function does is calculate the angle using
    // Math.atan2(yPointer-yGun, xPointer-xGun)
    this.gun.rotation = this.game.physics.arcade.angleToPointer(this.gun);

    // Shoot a bullet
    if (this.game.input.activePointer.isDown) {
        this.shootBullet();
    }  

    i++;

    if (i === update_interval)
    {
        changeWindDirection();
        update_interval = Math.floor(Math.random() * 20) * 60; // 0 - 20sec @ 60fps
        i = 0;
    }

};

function changeWindDirection() {

    var multi = Math.floor((max + 200) / 4),
        frag = (Math.floor(Math.random() * 100) - multi);
    max = max + frag;

    if (max > 200) max = 150;
    if (max < -200) max = -150;

    setXSpeed(back_emitter, max);
    setXSpeed(mid_emitter, max);
    setXSpeed(front_emitter, max);

}

function setXSpeed(emitter, max) {

    emitter.setXSpeed(max - 20, max);
    emitter.forEachAlive(setParticleXSpeed, this, max);

}

function setParticleXSpeed(particle, max) {

    particle.body.velocity.x = max - Math.floor(Math.random() * 30);

}

// Try to get a used explosion from the explosionGroup.
// If an explosion isn't available, create a new one and add it to the group.
// Setup new explosions so that they animate and kill themselves when the
// animation is complete.
GameState.prototype.getExplosion = function(x, y) {
    // Get the first dead explosion from the explosionGroup
    var explosion = this.explosionGroup.getFirstDead();

    // If there aren't any available, create a new one
    if (explosion === null) {
        explosion = this.game.add.sprite(0, 0, 'explosion');
        explosion.anchor.setTo(0, 0);

        // Add an animation for the explosion that kills the sprite when the
        // animation is complete
        var animation = explosion.animations.add('boom', [0], 2, false);
        animation.killOnComplete = true;

        // Add the explosion sprite to the group
    }

    // Revive the explosion (set it's alive property to true)
    // You can also define a onRevived event handler in your explosion objects
    // to do stuff when they are revived.
    explosion.revive();

    // Move the explosion to the given coordinates
    explosion.x = x;
    explosion.y = y;

    // Set rotation of the explosion at random for a little variety
    explosion.angle = this.game.rnd.integerInRange(0, 0);

    // Play the animation
    explosion.animations.play('boom');

    // Return the explosion itself in case we want to do anything else with it
    return explosion;
};



var game = new Phaser.Game(800, 600, Phaser.AUTO, 'my-game',null, true);

game.state.add('my-game', GameState, true);
