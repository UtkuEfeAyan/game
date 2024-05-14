


class Bullet extends Phaser.Physics.Arcade.Image
{
    constructor (scene)
    {
        super(scene, 0, 0, "space", "blaster");

        this.setBlendMode(1);
        this.setDepth(1);

        this.speed = 1000;
        this.lifespan = 1000;

        this._temp = new Phaser.Math.Vector2();
    }

    fire (ship)
    {
        this.lifespan = 1000;

        this.setActive(true);
        this.setVisible(true);
        this.setAngle(ship.body.rotation);
        this.setPosition(ship.x, ship.y);
        this.body.reset(ship.x, ship.y);

        const angle = Phaser.Math.DegToRad(ship.body.rotation);

        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

        this.body.velocity.x *= 2;
        this.body.velocity.y *= 2;
    }

    update (time, delta)
    {
        this.lifespan -= delta;

        if (this.lifespan <= 0)
        {
            this.setActive(false);
            this.setVisible(false);
            this.body.stop();
        }
    }
}

class Game extends Phaser.Scene
{
    constructor ()
    {
        super({ key: "Game" });
        window.GAME = this;
    }
    
    lastFired = 0;

    preload ()
    {
        this.load.image("background", "assets/space/nebula.jpg");
        this.load.image("stars", "assets/space/stars.png");
        this.load.atlas("space", "assets/space/space.png", "assets/space/space.json");
    }
    create ()
    {



        this.textures.addSpriteSheetFromAtlas("mine-sheet", { atlas: "space", frame: "mine", frameWidth: 64 });
        this.textures.addSpriteSheetFromAtlas("asteroid1-sheet", { atlas: "space", frame: "asteroid1", frameWidth: 96 });
        this.textures.addSpriteSheetFromAtlas("asteroid2-sheet", { atlas: "space", frame: "asteroid2", frameWidth: 96 });
        this.textures.addSpriteSheetFromAtlas("asteroid3-sheet", { atlas: "space", frame: "asteroid3", frameWidth: 96 });
        this.textures.addSpriteSheetFromAtlas("asteroid4-sheet", { atlas: "space", frame: "asteroid4", frameWidth: 64 });

        this.anims.create({ key: "mine-anim", frames: this.anims.generateFrameNumbers("mine-sheet", { start: 0, end: 15 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: "asteroid1-anim", frames: this.anims.generateFrameNumbers("asteroid1-sheet", { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: "asteroid2-anim", frames: this.anims.generateFrameNumbers("asteroid2-sheet", { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: "asteroid3-anim", frames: this.anims.generateFrameNumbers("asteroid3-sheet", { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: "asteroid4-anim", frames: this.anims.generateFrameNumbers("asteroid4-sheet", { start: 0, end: 23 }), frameRate: 20, repeat: -1 });

        this.add.image(512, 680, "space", "blue-planet").setOrigin(0).setScrollFactor(0.6);
        this.add.image(2833, 1246, "space", "brown-planet").setOrigin(0).setScrollFactor(0.6);
        this.add.image(3875, 531, "space", "sun").setOrigin(0).setScrollFactor(0.6);
        const galaxy = this.add.image(5345 + 1024, 327 + 1024, "space", "galaxy").setBlendMode(1).setScrollFactor(0.6);
        this.add.image(908, 3922, "space", "gas-giant").setOrigin(0).setScrollFactor(0.6);
        this.add.image(3140, 2974, "space", "brown-planet").setOrigin(0).setScrollFactor(0.6).setScale(0.8).setTint(0x882d2d);
        this.add.image(6052, 4280, "space", "purple-planet").setOrigin(0).setScrollFactor(0.6);

        this.bg = this.add.tileSprite(600, 400, 1200, 800, 'background').setScrollFactor(0);


        for (let i = 0; i < 8; i++)
        {
            this.add.image(Phaser.Math.Between(0, 8000), Phaser.Math.Between(0, 8000), "space", "eyes").setBlendMode(1).setScrollFactor(0.8);
        }

        this.stars = this.add.tileSprite(600, 400, 1200, 800, "stars").setScrollFactor(0);

        const emitter = this.add.particles(0, 0, "space", {
            frame: "blue",
            speed: 100,
            lifespan: {
                onEmit: (particle, key, t, value) =>
                {
                    const speed = this.ship.body?.speed || 0; // Use optional chaining and default value
                    return Phaser.Math.Percent(speed, 0, 300) * 2000;
                }
            },
            alpha: {
                onEmit: (particle, key, t, value) =>
                {
                    const speed = this.ship.body?.speed || 0; // Use optional chaining and default value
                    return Phaser.Math.Percent(speed, 0, 300) ;
                }
            },
            angle: {
                onEmit: (particle, key, t, value) =>
                {
                    return (this.ship.angle - 180) + Phaser.Math.Between(-10, 10);
                }
            },
            scale: { start: 0.6, end: 0 },
            blendMode: "ADD"
        });

        this.ship = this.physics.add.image(4000, 3000, "space", "ship").setDepth(2);
           console.log(); 
        this.ship.setAngularVelocity(0);


        this.ship.setDrag(300);
        this.ship.setAngularDrag(400);
        this.ship.setMaxVelocity(600);

        // Player health properties
        this.ship.health = 10; // Adjust starting health
        this.healthText = this.add.text(10, 10, `Health: ${this.ship}`, { font: "16px Arial", fill: "#fff" });


        this.cameras.main.startFollow(this.ship);

        emitter.startFollow(this.ship);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.add.sprite(4300, 3000).play("asteroid1-anim");

        this.tweens.add({
            targets: galaxy,
            angle: 360,
            duration: 100000,
            ease: "Linear",
            loop: -1
        });

         ////enemeis code
        this.enemyBullet = this.physics.add.group({
            classType: EnemyBullet,
            maxSize: 50, // Adjust max number of enemy bullets
            runChildUpdate: true
          });
        this.enemies = this.physics.add.group();

          // Define enemy types (adjust properties as needed)
          // Assuming the attack function is defined in enemy.js
        this.enemyFire = this.load.script('Enemies', '/src/Scenes/Enemies.js').enemyFire; // Load and access enemyFire function
        this.enemyTypes = [
            { animationPrefix: 'enemyBlack', bullet: 'laserBlack', attack: this.enemyFireLaser }, 
          { animationPrefix: 'enemyRed', bullet: 'laserRed', attack: this.enemyFireHomingMissile }, 
          { animationPrefix: 'enemyYellow', bullet: 'laserGreen', attack: this.enemyFireSpreadShot }, 
          { animationPrefix: 'enemyBlue', bullet: 'laserBlue', attack: this.enemyFireBlue }, 
        ];
  
        this.spawnPoints = [
            { x: this.game.config.width / 4, y: this.game.config.height / 4 },
            { x: this.game.config.width * 3 / 4, y: this.game.config.height / 4 },
            { x: this.game.config.width / 4, y: this.game.config.height * 3 / 4 },
            { x: this.game.config.width * 3 / 4, y: this.game.config.height * 3 / 4 },
        ];

        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true
        });


        //Player-enemy bullet collision (damage player)  eenemy thingy
        this.physics.add.overlap(this.ship, this.enemyBullet, (ship, bullet) => {
            bullet.destroy();
            this.handlePlayerHit(); // Handle player damage (reduce health, explosion animation)
            });
        
    }

    update (time, delta)
    {
        const { left, right, up } = this.cursors;

        if (this.ship !== undefined) {

            if (left.isDown)
            {   
                this.ship.setAngularVelocity(-150);
            }
            else if (right.isDown)
            {
                this.ship.setAngularVelocity(150);
            }
            else
            {
                this.ship.setAngularVelocity(0);
                console.log();

            }

            if (up.isDown)
            {
                this.physics.velocityFromRotation(this.ship.rotation, 600, this.ship.body.acceleration);
            }
            else
            {
                this.ship.setAcceleration(0);
                console.log();
            }
        }

        if (this.fire.isDown && time > this.lastFired)
        {
            const bullet = this.bullets.get();

            if (bullet)
            {
                bullet.fire(this.ship);

                this.lastFired = time + 100;
            }
        }

        this.bg.tilePositionX += this.ship.body.deltaX() * 0.5;
        this.bg.tilePositionY += this.ship.body.deltaY() * 0.5;

        this.stars.tilePositionX += this.ship.body.deltaX() * 2;
        this.stars.tilePositionY += this.ship.body.deltaY() * 2;
    }
    handlePlayerHit() {
        // Reduce player health
        this.ship.health -= 1; // Adjust damage amount
        this.healthText.setText(`Health: ${this.ship}`);
      
        // Check for game over
        if (this.ship.health <= 0) {
          this.scene.pause(); // Pause current game scene
          this.scene.launch('gameover'); // Launch the game over scene
        }
      
        // Optional: Visual/Audio feedback
        this.cameras.main.shake(100, 0.01); // Add screen shake effect
        //this.sound.play('playerHit'); // Play sound effect (assuming sound exists)
      }
    }
