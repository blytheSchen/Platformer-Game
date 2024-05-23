class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        this.load.image("dungeon_tiles1", "dungeon_tilemap_packed_bigger.png");
        this.load.image("dungeon_tiles2", "dungeon_tilemap_packed.png"); // dungeon

        this.load.image("farm_tiles", "farm_tilemap_packed.png"); // farm

        this.load.image("food_tiles", "food_tilemap_packed.png"); // food

        this.load.image("industrial_tiles", "industrial_tilemap_packed.png"); // industrial

        this.load.image("platform_tiles", "platform_tilemap_packed.png"); // generic platformer

        this.load.image("urban_tiles1", "urban_tilemap_packed_bigger.png"); 
        this.load.image("urban_tiles2", "urban_tilemap.png"); // urban

        this.load.image("night_sky", "night_sky.png");
        this.load.image("night_sky1", "night_sky1.png"); // night sky background

        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");

        // Load the tilemap as a spritesheet
        this.load.spritesheet("food_sheet", "food_tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.spritesheet("flag_sheet", "platform_tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.spritesheet("enemy_sheet", "dungeon_tilemap_packed_bigger.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.bitmapFont('pixelFont', 'Kenney Pixel Square_0.png', 'Kenney Pixel Square.fnt'); // text

        this.load.audio('jump', 'pepSound5.ogg');
        this.load.audio('playerHit', 'highDown.ogg');
        this.load.audio('collect', 'tone1.ogg');
        this.load.audio('death', 'powerUp3.ogg'); // audio

        this.load.multiatlas("kenny-particles", "kenny-particles.json"); // particle effects
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 2,
                end: 3,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0002.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0003.png" }
            ],
        });

        this.anims.create({
            key: 'hurt',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0005.png" },
                { frame: "tile_0002.png" }
            ],
            frameRate: 5,
            repeat: 0,
            hideOnComplete: false
        });

         // ...and pass to the next Scene
        this.scene.start("startScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}