class MainMenu extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'mainmenu' });
        window.MENU = this;
    }
    preload ()
    {
        this.load.image('buttonBG', 'assets/button-bg.png');
        this.load.image('buttonText', 'assets/button-text.png');
    }

    create ()
    {
        console.log('%c MainMenu ', 'background: red; color: blue; display: block;');

        const bg = this.add.image(0, 0, 'buttonBG');
        const text = this.add.image(0, 0, 'buttonText');

        this.add.container(400, 300, [ bg, text ]);

        bg.setInteractive();

        bg.once('pointerup', function ()
        {

            this.scene.start('Game');

        }, this);
    }
}