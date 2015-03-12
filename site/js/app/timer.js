/**
 * The game timer
 * @module app/timer
 */
define(["app/config", "Phaser"],
function(config, Phaser){
    "use strict"

    /**
     * The game timer
     * @alias module:app/timer
     */
    var Timer = function() {}
    Timer.prototype.init = function(game){
        this.game = game;
        this.onTick = null;
        this.innerTimer = this.game.time.create(false);
        this.innerTimer.loop(100, function(){
            if (this.onTick) {
                this.onTick();
            }
        }.bind(this));
    }

    Timer.prototype.start = function() {
        this.startTime = new Date().getTime();
        this.innerTimer.start(false);
    }

    Timer.prototype.getTime = function() {
        var now = new Date();
        var elapsed = new Date(now.getTime() - this.startTime);

        var seconds = elapsed.getSeconds().toString();
        if (seconds.length < 2) {
            seconds = "0" + elapsed.getSeconds().toString();
        }

        return elapsed.getMinutes().toString() + ":" + seconds;
    }

    Timer.prototype.expired = function() {
        var now = new Date();
        var elapsed = new Date(now.getTime() - this.startTime);
        if (elapsed.getMinutes() >= 10) {
            return true;
        }
        return false;
    }

    var timer = new Timer();
    return timer;
});
