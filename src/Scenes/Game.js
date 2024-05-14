


class EnemyBullet extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y) {
      super(scene, x, y, 'laserBlack'); // Replace 'laserBlack' with your actual bullet sprite key
      this.scene = scene;
  
      this.setBlendMode(1);
      this.setScale(0.5); // Adjust bullet size
      this.setVelocity(0, 400); // Adjust bullet speed
  
      scene.physics.world.enableBody(this);
      this.body.setAllowGravity(false);
    }
  
    update(time, delta) {
      if (this.y > this.scene.game.config.height) {
        this.destroy();
      }
    }
  }
  

class Enemies extends Phaser.Scene {
    enemyBullets;
    enemies; // Group to hold all enemy sprites
    enemyFiringTimer;
    enemyTypes; // Array to store different enemy types
    spawnPoints; // Array of spawn points for enemies
  
    constructor() {
      super({ key: 'Enemies' }); // Assuming key for the scene
    }
  
    preload() {
      // Load enemy sprites (assuming consistent naming)
      for (let i = 1; i <= 5; i++) {
        this.load.image(`enemyBlack`, `/assets/enemyBlack1.png`);
        this.load.image(`enemyRed`, `/assets/boss.png`);
        this.load.image(`enemyBlue`, `/assets/enemyBlue.png`);
        this.load.image(`enemyYellow`, `/assets/enemyYellow.png`);
      }
  
      // Load bullet sprites (adjust based on attack types)
      this.load.image('laserBlack', '/assets/enemyBlack1.png');
      this.load.image('laserRed', '/assets/laserRed09.png'); // Homing missile (replace if needed)
      this.load.image('laserGreen', '/assets/laserGreen14.png'); // Spread shot (replace if needed)
      this.load.image('laserBlue', '/assets/laserBlue05.png');
    }
    create() {
        this.stars = this.add.blitter(0, 0, 'starfield'); // Assuming you have a starfield loaded
        this.stars.create(0, 0);
        this.stars.create(0, -512);
    
        this.enemyBullets = this.add.existing(new EnemyBullets(this.physics.world, this, { name: 'enemyBullets' }));
        this.enemyBullets.createMultiple({ key: 'laserBlack', quantity: 5 }); // Replace with actual laser sprite key
    
        this.enemies = this.physics.add.group();
    
        // Define enemy types with properties like animation prefix, bullet type, and attack implementation
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
    
        this.enemyFiringTimer = this.time.addEvent({
          delay: 1000, // Adjust spawn rate
          loop: true,
          callback: this.spawnEnemy,
        });
    
        this.physics.world.on('worldbounds', this.handleWorldBounds, this);
    
        // Player setup (basic physics)
        this.ship = this.physics.add.sprite(this.game.config.width / 2, this.game.config.height / 2, 'ship');
        this.cursors = this.input.keyboard.createCursorKeys();
    
        // Player-enemy bullet collision
        this.physics.add.overlap(this.ship, this.enemyBullets, (ship, bullet) => {
          // Handle player getting hit (reduce health, explosion animation posibly)
          bullet.disableBody(true, true);
        });
    
        // Optional: Player-enemy collision for physical contact damage
        this.physics.add.collider(this.enemies, this.ship);
    
        // Enemy-enemy bullet collision (for friendly fire if applicable)
        this.physics.add.overlap(this.enemies, this.enemyBullets, (enemy, bullet) => {
          const { x, y } = bullet.body.center;
    
          enemy.state -= 1;
          bullet.disableBody(true, true);
          this.plasma.emitParticleAt(x, y); // Assuming you have plasma particles
    
          if (enemy.state <= 0) {
            enemy.destroy();
            // Handle enemy death (e.g., spawn new enemy, possible score)
          }
        });
      }
      spawnEnemy() {
        const randomTypeIndex = Math.floor(Math.random() * this.enemyTypes.length);
        const enemyType = this.enemyTypes[randomTypeIndex];
    
        const randomSpawnPoint = Phaser.Math.RND.pick(this.spawnPoints);
    
        const enemy = this.physics.add.sprite(randomSpawnPoint.x, randomSpawnPoint.y, `${enemyType.animationPrefix}1`);
        enemy.setBodySize(160, 64);
        enemy.state = 5; // Hit points
    
        this.setEnemyPathTowardsPlayer(enemy); // Set enemy movement
    
        // Enemy firing logic (demonstrates different attacks)
        const fireDelay = Math.floor(Math.random() * 2000) + 1000; // Random delay between attacks
        this.time.addEvent({ delay: fireDelay, loop: true, callback: () => this.enemyFire(enemy, this.enemyBullets, enemyType) });
      }
    
      setEnemyPathTowardsPlayer(enemy) {
        const direction = new Phaser.Math.Vector2(this.ship.x - enemy.x, this.ship.y - enemy.y).normalize();
        const speed = 100; // Adjust enemy speed
    
        enemy.setVelocity(direction.x * speed, direction.y * speed);
      }
    
      
        enemyFire(enemy, enemyBullets, enemyType) {
          switch (enemyType.bullet) {
            case 'laserBlack':
              this.enemyFireLaser(enemy, enemyBullets);
              break;
            case 'laserRed':
              this.enemyFireHomingMissile(enemy, enemyBullets);
              break;
            case 'laserGreen':
              this.enemyFireSpreadShot(enemy, enemyBullets);
              break;
            case 'laserBlue':
              this.enemyFireBlue(enemy, enemyBullets);
              break;
          }
        }
      
        enemyFireLaser(enemy, enemyBullets) {
          // Standard laser 
          const bullet = enemyBullets.create(enemy.x, enemy.y, enemyType.bullet); // Assuming enemyType.bullet is set to 'laserBlack'
          bullet.body.setSize(4, 16);
          bullet.setVelocity(enemy.body.velocity.x * 2, enemy.body.velocity.y * 2);
          bullet.setLifetime(2000); // Adjust bullet lifetime
        }
      
        enemyFireHomingMissile(enemy, enemyBullets) {
          // Homing missile behavior
          const bullet = enemyBullets.create(enemy.x, enemy.y, 'laserRed'); // Replace 'laserRed' with your homing missile sprite key
          bullet.body.setSize(4, 16);
      
          // Calculate direction towards player
          const direction = new Phaser.Math.Vector2(this.player.x - bullet.x, this.player.y - bullet.y).normalize();
      
          // Set initial velocity with a slight offset (adjust for desired homing behavior)
          bullet.setVelocity(direction.x * 200, direction.y * 200);
      
          // Update bullet velocity every frame to track player movement (basic homing)
          this.physics.world.on('update', () => {
            const newDirection = new Phaser.Math.Vector2(this.player.x - bullet.x, this.player.y - bullet.y).normalize();
            bullet.setVelocity(newDirection.x * 200, newDirection.y * 200);
          });
        }
      
        enemyFireSpreadShot(enemy, enemyBullets) {
          for (let i = -1; i <= 1; i++) {
            const spreadBullet = enemyBullets.create(enemy.x + i * 10, enemy.y, 'laserGreen'); // Replace 'laserGreen' with your spread shot sprite key
            spreadBullet.body.setSize(4, 16);
            spreadBullet.setVelocity(enemy.body.velocity.x + (i * 50), enemy.body.velocity.y); // Adjust spread
            spreadBullet.setLifetime(2000); // Adjust bullet lifetime
          }
        }
      
        enemyFireBlue(enemy, enemyBullets) {
          // Slow attack shot
          const slowBullet = enemyBullets.create(enemy.x, enemy.y, 'laserBlue'); // Replace 'laserBlue' with your slow attack bullet sprite key
          slowBullet.body.setSize(4, 16);
          slowBullet.setVelocity(enemy.body.velocity.x, enemy.body.velocity.y); // Inherit enemy's movement (adjust if needed)
          slowBullet.setLifetime(4000); // Adjust bullet lifetime (longer for slow attack)
        }
      }
      




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
        this.enemyBullets = this.physics.add.group({
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
        this.physics.add.overlap(this.ship, this.enemyBullets, (ship, bullet) => {
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
