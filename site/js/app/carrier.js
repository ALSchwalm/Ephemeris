define(["app/config", "Phaser", "app/unit", "app/player"],
function(config, Phaser, Unit, player){
    "use strict"

    var Carrier = function(game, handler, x, y, config){
        this.spriteKey = "carrier";
        this.backgroundKey = "120empty";
        this.selectKey = "120select";
        this.selectSound = "carrierSelect";
        this.speed = 2;
        this.range = 180;
        this.view = 350;
        this.attackRate = 350;
        this.attackPower = 20;
        this.maxHealth = 600;

        this.init(game, handler, x, y, config);
    }

    Carrier.prototype = new Unit();
    Carrier.prototype.buildFraction = 0.3;
    Carrier.prototype.name = "Carrier";
    Carrier.prototype.weakness = "Bomber";
    Carrier.prototype.iconKey = "carrierIcon"

    Carrier.prototype.update = function() {
        this.unitUpdate();
    }

    return Carrier;
});
