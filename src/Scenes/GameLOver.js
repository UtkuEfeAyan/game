class GameOver extends Phaser.Scene
{
    constructor ()
    {
        super({ key: "gameover" });
        window.OVER = this;
    }

    create ()
    {
        console.log("%c GameOver ", "background: green; color: white; display: block;");

        this.add.sprite(400, 300, "ayu");

        this.add.text(300, 500, "Game Over - Click to start restart", { font: "16px Courier", fill: "#00ff00" });

        this.input.once("pointerup", function (event)
        {

            this.scene.start("mainmenu");

        }, this);
    }
}