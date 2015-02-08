define(["app/config", "Phaser", "app/unit", "app/player"],
function(config, Phaser, Unit, player){
    "use strict"

    var Ship = function(game, x, y, config){
        this.init(game, config);

        this.sprite = game.add.sprite(x, y, "ship");
        this.sprite.anchor = {x: 0.5, y:0.5};
        this.sprite.inputEnabled = true;
        this.sprite.events.onInputDown.add(this.onClick, this);
        this.speed = 2;
        this.sprite.update = this.update.bind(this);

        this.highlights = this.game.add.sprite(0, 0, "shipOverlay");
        this.highlights.anchor = {x: 0.5, y:0.5};
        this.highlights.alpha = 0.7
        this.sprite.addChild(this.highlights);

        if (this.playerID == player.id) {
            this.highlights.tint = 0x0000FF;
            this.sprite.tint = 0xAAAAFF;
        } else {
            this.highlights.tint = 0xCC0000;
            this.sprite.tint = 0xFFAAAA;
        }
        this.fadeDirection = 0.02;
    }

    Ship.prototype = new Unit();

    Ship.prototype.update = function() {
        if (this.highlights.alpha < 0.1 ||
            this.highlights.alpha > 0.99){
            this.fadeDirection *= -1;
        }
        this.highlights.alpha += this.fadeDirection;
        this.moveTowardDestination();
    }

    return Ship;
});
