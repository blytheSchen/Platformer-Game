class EndScreen extends Phaser.Scene {
    constructor() {
        super("endScene");
        this.my = {sprite: {}, text: {}};
    }

    create() {
        let my = this.my;
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        my.text.title = this.add.bitmapText(game.config.width/2.9, game.config.height/2, "pixelFont", "Game Over");
        my.text.title.setFontSize(100); 

        my.text.start = this.add.bitmapText(game.config.width/2.6, game.config.height/1.5, "pixelFont", "Press 'SPACE' to restart");
        my.text.start.setFontSize(30); 
    }

    // Never get here since a new scene is started in create()
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.scene.start("startScene");
        }
    }
}