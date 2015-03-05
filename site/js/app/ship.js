define(["app/config", "Phaser", "app/unit", "app/player"],
function(config, Phaser, Unit, player){
    "use strict"

    var Ship = function(game, handler, x, y, config){
        this.spriteKey = "ship";
        this.overlayKey = "shipOverlay";
        this.backgroundKey = "20empty";
        this.selectKey = "20select";
        this.speed = 4;
        this.range = 180;
        this.view = 300;
        this.attackRate = 400;
        this.attackPower = 5;
        this.maxHealth = 100;
        this.fadeDirection = 0.02;

        this.init(game, handler, x, y, config);
    }

    Ship.prototype = new Unit();
    Ship.prototype.buildFraction = 1;
    Ship.prototype.name = "Fighter";
    Ship.prototype.iconKey = "fighterIcon"

    Ship.prototype.update = function() {
        this.unitUpdate();
        if (this.highlights.alpha < 0.1 ||
            this.highlights.alpha > 0.99){
            this.fadeDirection *= -1;
        }
        this.highlights.alpha += this.fadeDirection;
    }

    return Ship;
});
