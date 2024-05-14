class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: "gameover" });
        window.OVER = this;
    }

    create() {
        console.log("%c GameOver ", "background: green; color: white; display: block;");

        const restartButton = this.add.text(300, 550, "Restart", { font: "16px Arial", fill: "#fff" });
        restartButton.setInteractive();

        restartButton.on('pointerup', () => {
            this.scene.stop(); // Stop the game over scene
            this.scene.launch('Game'); // Launch the game scene again
        });
        
        console.log("%c GameOver ", "background: green; color: white; display: block;");

        this.add.sprite(400, 300, "ayu");

        this.add.text(300, 500, "Game Over - Click to start restart", { font: "16px Courier", fill: "#00ff00" });

        this.input.once("pointerup", function (event)
        {

            this.scene.start("mainmenu");

        }, this);
    }
}