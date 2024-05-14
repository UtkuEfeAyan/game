class GameMain extends Phaser.Scene
{
	constructor ()
    {
        super({ key: 'GameMain' });
        window.GAME = this;

        this.controls;
        this.track;
        this.text;
    }

	preload() {
		this.load.image('laser', '/assets/Lasers/laserBlue02.png');
		this.load.image('ship', '/assets/Lasers/playerShip1_red.png');
	}

	create() {
		this.cameras.main.setBackgroundColor(0x1D1923);
		this.cursors = this.input.keyboard.createCursorKeys();
		this.playerShip = new Ship(this, 400, 500);
		this.add.existing(this.myShip);
	
	}

	update() {
		if (this.cursors.down.isDown) {
            this.playerShip.downMove();
        }

        if (this.cursors.left.isDown) {
            this.playerShip.leftMove();
        }

        if (this.cursors.up.isDown) {
            this.playerShip.upMove();
        }

		if (this.cursors.right.isDown) {
            this.playerShip.rightMove();
        }
    }
}

class spaceShip extends Phaser.GameObjects.Sprite  {

    constructor(scene, x , y) {
        super(scene, x, y);
        this.setTexture('ship');
        this.setPosition(x, y);
        this.deltaX = 5;
        this.deltaY = 5;
    }

    leftMove() {
        if (this.x > 0) {
            this.x -= this.deltaX;
        }
    }

    rightMove() {
        if (this.x < SCREEN_WIDTH) {
            this.x += this.deltaX;
        }
    }

    upMove() {
        if (this.y > 0) {
            this.y -= this.deltaY;
        }
    }

    downMove() {

        if (this.y < SCREEN_HEIGHT) {
            this.y += this.deltaY;
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }
}