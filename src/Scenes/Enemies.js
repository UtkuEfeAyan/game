class EnemyBullet extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y) {
      super(scene, x, y, 'laserBlack'); 
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
    enemyBullet;
    enemies; // Group to hold all enemy sprites
    enemyFiringTimer;
    enemyTypes; // Array to store different enemy types
    spawnPoints; // Array of spawn points for enemies
  
    constructor() {
      super({ key: 'Enemies' }); // Assuming key for the scene
    }
  
    preload() {
      // Load enemy sprites 
      for (let i = 1; i <= 5; i++) {
        this.load.image(`enemyBlack`, `./assets/enemyBlack1.png`);
        this.load.image(`enemyRed`, `./assets/boss.png`);
        this.load.image(`enemyBlue`, `./assets/enemyBlue4.png`);
        this.load.image(`enemyYellow`, "./assets/ufoGreen.png");
        console.log();

      }

  
      // Load bullet sprites (adjust based on attack types)
      this.load.image('laserBlack', './assets/laserRed09.png');
      this.load.image('laserRed', './assets/spaceMissiles_006.png'); // Homing missile 
      this.load.image('laserGreen', './assets/laserGreen14.png'); // Spread shot 
      this.load.image('laserBlue', './assets/laserBlue05.png');
    }
    create() {
        this.stars = this.add.blitter(0, 0, 'starfield');
        this.stars.create(0, 0);
        this.stars.create(0, -512);
    
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
        this.physics.add.overlap(this.ship, this.enemyBullet, (ship, bullet) => {
          // Handle player getting hit (reduce health, explosion animation posibly)
          bullet.disableBody(true, true);
        });
    
        // Optional: Player-enemy collision for physical contact damage
        this.physics.add.collider(this.enemies, this.ship);
    
        // Enemy-enemy bullet collision (for friendly fire if applicable)
        this.physics.add.overlap(this.enemies, this.enemyBullet, (enemy, bullet) => {
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
        this.time.addEvent({ delay: fireDelay, loop: true, callback: () => this.enemyFire(enemy, this.enemyBullet, enemyType) });
      }
    
      setEnemyPathTowardsPlayer(enemy) {
        const direction = new Phaser.Math.Vector2(this.ship.x - enemy.x, this.ship.y - enemy.y).normalize();
        const speed = 100; // Adjust enemy speed
    
        enemy.setVelocity(direction.x * speed, direction.y * speed);
      }
    
      
        enemyFire(enemy, enemyBullet, enemyType) {
          switch (enemyType.bullet) {
            case 'laserBlack':
              this.enemyFireLaser(enemy, enemyBullet);
              break;
            case 'laserRed':
              this.enemyFireHomingMissile(enemy, enemyBullet);
              break;
            case 'laserGreen':
              this.enemyFireSpreadShot(enemy, enemyBullet);
              break;
            case 'laserBlue':
              this.enemyFireBlue(enemy, enemyBullet);
              break;
          }
        }
      
        enemyFireLaser(enemy, enemyBullet) {
          // Standard laser 
          const bullet = enemyBullet.create(enemy.x, enemy.y, 'laserBlack'); 
          bullet.body.setSize(4, 16);
          bullet.setVelocity(enemy.body.velocity.x * 2, enemy.body.velocity.y * 2);
          bullet.setLifetime(2000); // Adjust bullet lifetime
        }
      
        enemyFireHomingMissile(enemy, enemyBullet) {
          // Homing missile behavior
          const bullet = enemyBullet.create(enemy.x, enemy.y, 'laserRed'); // Replace 'laserRed' with your homing missile sprite key
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
      
        enemyFireSpreadShot(enemy, enemyBullet) {
          for (let i = -1; i <= 1; i++) {
            const spreadBullet = enemyBullet.create(enemy.x + i * 10, enemy.y, 'laserGreen'); // Replace 'laserGreen' with your spread shot sprite key
            spreadBullet.body.setSize(4, 16);
            spreadBullet.setVelocity(enemy.body.velocity.x + (i * 50), enemy.body.velocity.y); // Adjust spread
            spreadBullet.setLifetime(2000); // Adjust bullet lifetime
          }
        }
      
        enemyFireBlue(enemy, enemyBullet) {
          // Slow attack shot
          const slowBullet = enemyBullet.create(enemy.x, enemy.y, 'laserBlue'); // Replace 'laserBlue' with your slow attack bullet sprite key
          slowBullet.body.setSize(4, 16);
          slowBullet.setVelocity(enemy.body.velocity.x, enemy.body.velocity.y); // Inherit enemy's movement (adjust if needed)
          slowBullet.setLifetime(4000); // Adjust bullet lifetime (longer for slow attack)
        }
      }
      
//enemyFire(enemy, enemyBullet, enemyType) {
    //switch (enemyType.bullet) {
      //  case 'laserBlack':
          // Standard laser 
      //    const bullet = enemyBullet.create(enemy.x, enemy.y, enemyType.bullet);
      //    bullet.body.setSize(4, 16);
       ///   bullet.setVelocity(enemy.body.velocity.x * 2, enemy.body.velocity.y * 2);
       //   bullet.setLifetime(2000); // Adjust bullet lifetime
       //   break;
//      case 'laserRed':
  ///        // Regular fast shot
     //     const fastbullet = enemyBullet.create(enemy.x, enemy.y, enemyType.bullet);
      //    fastbullet.body.setSize(4, 16); // Adjust size as needed
            
          // Set bullet velocity
       //   const direction = new Phaser.Math.Vector2(this.player.x - fastbullet.x, this.player.y - fastbullet.y).normalize(); // Calculate direction towards player
         // bullet.body.setVelocity(direction.x * bulletSpeed, direction.y * bulletSpeed); // Set velocity based on direction and speed
            
   //       break;
     //   case 'laserGreen':
       //   for (let i = -1; i <= 1; i++) {
         //   const spreadBullet = enemyBullet.create(enemy.x + i * 10, enemy.y, enemyType.bullet);
         //  // spreadBullet.body.setSize(4, 16);
          //  spreadBullet.setVelocity(enemy.body.velocity.x + (i * 50), enemy.body.velocity.y); // Adjust spread
          //  spreadBullet.setLifetime(2000); // Adjust bullet lifetime
         // }
        //  break;
     //   case 'laserBlue':
       //   // Slow attack shot
        //  const slowBullet = enemyBullet.create(enemy.x, enemy.y, enemyType.bullet);
         // slowBullet.body.setSize(4, 16);
         // slowBullet.setVelocity(enemy.body.velocity.x, enemy.body.velocity.y); // Inherit enemy's movement (adjust if needed)
       //   slowBullet.setLifetime(4000); // Adjust bullet lifetime (longer for slow attack)
         // break;

