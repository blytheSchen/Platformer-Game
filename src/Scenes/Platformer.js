class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.my = {sprite: {}, text: {}, vfx: {}};
    }

    init() {
        // variables and settings
        this.ACCELERATION = 700;
        this.DRAG = 1200;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -700;
        this.PARTICLE_VELOCITY = 100;
    }

    create() {
        let my = this.my;
        this.map = this.add.tilemap("platformer-level-1", 16, 16, 120, 25);
        this.physics.world.setBounds(0,0, 120*16*SCALE, 16*25*SCALE);
        this.score = 0;
        this.health = 3;
        this.gameOver = false;
        this.gameOverTimer = 500;

        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.secret = this.input.keyboard.addKey("P");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Add a tileset to the map
        this.tileList = [
            this.map.addTilesetImage("night_sky", "night_sky"), 
            this.map.addTilesetImage("night_sky1", "night_sky1"), // night 

            this.map.addTilesetImage("dungeon_tilemap_packed_bigger", "dungeon_tiles1"),
            this.map.addTilesetImage("dungeon_tilemap_packed", "dungeon_tiles2"),
            this.map.addTilesetImage("dungeon_tilemap_packed_bigger_alt", "dungeon_tiles3"), // dungeon

            this.map.addTilesetImage("farm_tilemap_packed", "farm_tiles"), // farm

            this.map.addTilesetImage("food_tilemap_packed", "food_tiles"), // food

            this.map.addTilesetImage("industrial_tilemap_packed", "industrial_tiles"), 
            this.map.addTilesetImage("industrial_tilemap_packed_alt", "industrial_tiles"), // industrial

            this.map.addTilesetImage("platform_tilemap_packed", "platform_tiles"), // generic platformer

            this.map.addTilesetImage("urban_tilemap_packed_bigger", "urban_tiles1"), 
            this.map.addTilesetImage("urban_tilemap", "urban_tiles2") // urban
            
        ];

        // Create layers
        this.backgroundLayer = this.map.createLayer("Background", this.tileList);
        this.backgroundLayer.setScale(SCALE);

        this.backgroundOverlayLayer = this.map.createLayer("Background-Overlay", this.tileList);
        this.backgroundOverlayLayer.setScale(SCALE);

        this.silhouetteLayer = this.map.createLayer("Silhouette", this.tileList);
        this.silhouetteLayer.setTint(0x000000);
        this.silhouetteLayer.setScale(SCALE);

        this.silhouetteOverlayLayer = this.map.createLayer("Silhouette-Details", this.tileList);
        this.silhouetteOverlayLayer.setTint(0xffff00);
        this.silhouetteOverlayLayer.setScale(SCALE);

        this.poleLayer = this.map.createLayer("Poles-n-Wires", this.tileList);
        this.poleLayer.setTint(0x999999);
        this.poleLayer.setScale(SCALE);

        this.buildLayer = this.map.createLayer("Buildings", this.tileList);
        this.buildLayer.setTint(0xb9b9b9);
        this.buildLayer.setScale(SCALE);

        this.buildOverlayLayer = this.map.createLayer("Buildings-Overlay", this.tileList);
        this.buildOverlayLayer.setTint(0xb9b9b9);
        this.buildOverlayLayer.setScale(SCALE);

        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileList);
        this.groundLayer.setScale(SCALE);

        this.treeLayer = this.map.createLayer("Trees-n-Foliage", this.tileList);
        this.treeLayer.setTint(0xb9b9b9);
        this.treeLayer.setScale(SCALE);

        this.decoLayer = this.map.createLayer("Decorations-n-Stuff", this.tileList);
        this.decoLayer.setTint(0xb9b9b9);
        this.decoLayer.setScale(SCALE);

        this.overlayLayer = this.map.createLayer("Overlay-Tiles", this.tileList);
        this.overlayLayer.setScale(SCALE);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(game.config.width/8, game.config.height/2, "platformer_characters", "tile_0002.png").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to E key)
        this.input.keyboard.on('keydown-E', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // movement vfx
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            random: true,
            scale: {start: 0.01, end: 0.07},
            maxAliveParticles: 10,
            lifespan: 350,
            gravityY: -400,
            alpha: {start: 1, end: 0.2}, 
        });

        my.vfx.walking.stop();

        // camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        // make candies (updates score)
        this.candies = this.map.createFromObjects("Objects", {
            name: "candy",
            key: "food_sheet",
            frame: 43
        });

        this.scaleHelper(this.candies);
        this.physics.world.enable(this.candies, Phaser.Physics.Arcade.STATIC_BODY);
        this.candiesGroup = this.add.group(this.candies);

        this.physics.add.overlap(my.sprite.player, this.candiesGroup, (obj1, obj2) => {
            this.sound.play('collect');
            obj2.destroy();
            this.score += 1;
            this.updateScore();
        });

        //make health items
        this.healthUps = this.map.createFromObjects("Objects", {
            name: "health",
            key: "food_sheet",
            frame: 25
        });

        this.scaleHelper(this.healthUps);
        this.physics.world.enable(this.healthUps, Phaser.Physics.Arcade.STATIC_BODY);
        this.healthGroup = this.add.group(this.healthUps);

        this.physics.add.overlap(my.sprite.player, this.healthGroup, (obj1, obj2) => {
            this.sound.play('collect');
            obj2.destroy();
            this.health += 1;
            this.updateHealth();
        });

        // make victory flag
        this.flags = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "flag_sheet",
            frame: 111
        });
        this.scaleHelper(this.flags);
        this.physics.world.enable(this.flags, Phaser.Physics.Arcade.STATIC_BODY);
        this.flagGroup = this.add.group(this.flags);
        this.victory = false;

        this.physics.add.overlap(my.sprite.player, this.flagGroup, (obj1, obj2) => {
            this.sound.play('collect');
            obj2.destroy();
            this.victory = true;
        });

        // make enemies: ghosts
        this.enemies_ghosts = this.map.createFromObjects("Objects", {
            name: "enemy_ghost",
            key: "enemy_sheet",
            frame: 121
        });
        this.scaleHelper(this.enemies_ghosts);
        this.physics.world.enable(this.enemies_ghosts, Phaser.Physics.Arcade.STATIC_BODY);
        this.ghostGroup = this.add.group(this.enemies_ghosts);

        // make enemies: bats
        this.enemies_bats = this.map.createFromObjects("Objects", {
            name: "enemy_bat",
            key: "enemy_sheet",
            frame: 120
        });
        this.scaleHelper(this.enemies_bats);
        this.physics.world.enable(this.enemies_bats, Phaser.Physics.Arcade.STATIC_BODY);
        this.batGroup = this.add.group(this.enemies_bats);

        // text
        // Put score and health on screen
        my.text.score = this.add.bitmapText(10, 10, "pixelFont", "Score: " + this.score).setScrollFactor(0);
        console.log(my.text.score);
        my.text.health = this.add.bitmapText(10, 50, "pixelFont", "Health: " + this.health).setScrollFactor(0);
        my.text.victory = this.add.bitmapText(game.config.width/2.9, game.config.height/2, "pixelFont", "You won!").setScrollFactor(0);
        my.text.victory.setFontSize(100); 
        my.text.victory.visible = false;

        this.bounceTimer = 0;

        this.physics.add.collider(my.sprite.player, this.ghostGroup, (obj1, obj2) => {
            if (!this.gameOver) {
                this.sound.play('playerHit');
                obj2.destroy();
                this.health -= 1;
                this.updateHealth();
                my.sprite.player.anims.play('hurt');
            }
        });

        this.physics.add.collider(my.sprite.player, this.batGroup, (obj1, obj2) => {
            if (!this.gameOver) {
                my.sprite.player.setBounce(100, 50);
                if (this.bounceTimer == 0) {
                    this.health -= 1;
                    this.updateHealth();
                    this.sound.play('playerHit');
                    my.sprite.player.anims.play('hurt');
                }
                this.bounceTimer = 30;
            }
        });
        // some player char config stuff
        my.sprite.player.body.setMaxVelocity(400, 800);
    }

    scaleHelper(objectArray) {
        for (let obj of objectArray) //rescale
        {
            obj.setScale(SCALE);
            obj.y = obj.y * SCALE;
            obj.x = obj.x * SCALE;
        }
    }

    update() {
        let my = this.my;

        if (this.health > 0 && this.victory == false) {
            if (this.health == 1) {
                my.text.health.setTint(0xaa0000);
            }
            else {
                my.text.health.setTint(0xffffff);
            }

            if (my.sprite.player.y > 380 * SCALE) { // if player falls into void
                my.sprite.player.x = game.config.width/8;
                my.sprite.player.y = game.config.height/2;
                this.health -= 1;
                this.updateHealth();
            }
    
            if (this.bounceTimer > 0) { // determine how long the player bounces for before reverting to normal
                this.bounceTimer--;
            }
            else if (this.bounceTimer <= 0) {
                my.sprite.player.setBounce(0, 0);
            }
    
            if(cursors.left.isDown || this.left.isDown) {
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                my.sprite.player.resetFlip();
                my.sprite.player.anims.play('walk', true);

                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) {
                    my.vfx.walking.start();
                }
    
            } else if(cursors.right.isDown || this.right.isDown) {
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                my.sprite.player.setFlip(true, false);
                my.sprite.player.anims.play('walk', true);

                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) {
                    my.vfx.walking.start();
                }
            } else {
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');
                my.vfx.walking.stop();
            }
    
            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
            if(!my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('jump');
                my.vfx.walking.stop();
            }
            if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up) || my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.space)) {
                // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
                this.sound.play('jump');
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2-5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) {
                    my.vfx.walking.start();
                }
            }

            // secret area implementation
            if (my.sprite.player.y == 616 && my.sprite.player.x > 710 && my.sprite.player.x < 770) {
                if (this.secret.isDown) {
                    my.sprite.player.y = 200;
                }
            }
        }  
        else if (this.victory == false) {
            this.gameOverTimer--;
            this.gameOver = true;
            my.sprite.player.setBounce(0, 0)
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('hurt');
            if (this.gameOverTimer > 498) {
                this.sound.play('death');
            }

            if (this.gameOverTimer == 0) {
                this.scene.start("endScene");
            }
        }
        else {
            this.gameOverTimer--;
            my.sprite.player.setBounce(0, 0)
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.text.victory.visible = true;
            my.sprite.player.anims.play('idle');
            if (this.gameOverTimer == 0) {
                this.scene.start("startScene");
            }
        }
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score: " + this.score);
    }

    updateHealth() {
        let my = this.my;
        my.text.health.setText("Health: " + this.health);
    }
}