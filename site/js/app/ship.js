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

        if (this.playerID == player.id) {
            this.sprite.tint = 0x4169FF;
        } else {
            this.sprite.tint = 0xCC0000;
        }
    }

    Ship.prototype = new Unit();

    Ship.prototype.update = function() {
        this.moveTowardDestination();
    }

    return Ship;
});
