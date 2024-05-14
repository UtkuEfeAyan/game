class Game extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'Game' });
        window.GAME = this;
    }
    text;
    cursors;
    sprite;

    preload ()
    {
        this.load.image('bullet', 'assets/games/laserBlue05.png');
        this.load.image('ship', 'assets/spaceShip_002.png');
    }

    create ()
    {
        this.sprite = this.physics.add.image(400, 300, 'ship');

        this.sprite.setDamping(true);
        this.sprite.setDrag(0.99);
        this.sprite.setMaxVelocity(200);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
    }

    update ()
    {
        if (this.cursors.up.isDown)
        {
            this.physics.velocityFromRotation(this.sprite.rotation, 200, this.sprite.body.acceleration);
        }
        else
        {
            this.sprite.setAcceleration(0);
        }

        if (this.cursors.left.isDown)
        {
            this.sprite.setAngularVelocity(-300);
        }
        else if (this.cursors.right.isDown)
        {
            this.sprite.setAngularVelocity(300);
        }
        else
        {
            this.sprite.setAngularVelocity(0);
        }

        this.text.setText(`Speed: ${this.sprite.body.speed}`);

        this.physics.world.wrap(this.sprite, 32);
    }
}