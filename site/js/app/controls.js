define(["app/config","Phaser", "app/player"],
function(config, Phaser, player){
    "use strict"

    /**
     * A module which defines controls for the game
     * @exports app/controls
     */
    var controls = {
        init : function(game, handler) {
            this.game = game;
            this.handler = handler;
            this.graphics = this.game.add.graphics(0, 0);
            game.canvas.oncontextmenu = function(e) {e.preventDefault();}
        },

        mouseActive : false,
        recentSelection : false,
        selectBoxStart : null,
        postMove : function() {},
        keys : [],

        /**
         * Register a key to be used by the game
         *
         * @param {number} key - The keycode to watch
         * @param {function} func - Callback to execute when the key is pressed
         * @param {object} context - Context for the callback
         * @param {number} delayBetween - Time (in ms) between callback executions
         */
        registerControl : function(key, func, context, delayBetween) {
            var delayBetween = delayBetween || 100;
            var func = func.bind(context);
            var keyObj = {
                key: key,
                callback : func,
                delay: delayBetween,
                active: false,
                press : function() {
                    if (!keyObj.active) {
                        keyObj.callback();
                        keyObj.active = true;
                        setTimeout(function(){
                            keyObj.active = false;
                        }, keyObj.delay);
                        controls.postMove();
                    }
                }
            };
            this.keys.push(keyObj);
        },

        onRightClick : function() {
            if (this.game.selectedUnits.length) {
                this.game.selectedUnits.map(function(unit){
                    this.handler.do({
                        type: "move",
                        data : {
                            id : unit.id,
                            path: [controls.pointerPosition()]
                        }
                    });
                }.bind(this));
            }
        },

        clearSelection : function() {
            this.game.selectedUnits.map(function(unit){
                unit.onUnselect();
            });
        },

        pointerPosition : function(relative) {
            var relative = relative || false;
            if (relative) {
                return  {
                    x: this.game.input.clientX,
                    y: this.game.input.clientY
                };
            }
            return  {
                x: this.game.input.worldX,
                y: this.game.input.worldY
            };
        },

        drawSelectBox : function() {
            if (!this.selectBoxStart) {
                this.selectBoxStart = this.pointerPosition();
            } else {
                this.graphics.clear();
                this.graphics.lineStyle(1, 0xEEEEEE, 0.2);
                this.graphics.beginFill(0x4169E1, 0.3);
                var bounds = this.getSelectBoxBounds()
                this.graphics.drawRect(bounds.x, bounds.y,
                                       bounds.width, bounds.height);
                this.graphics.endFill();
            }
        },

        getSelectBoxBounds : function(relative) {
            if (!this.selectBoxStart) return null;
            var pointerPosition = this.pointerPosition(relative);
            var x = this.selectBoxStart.x;
            var y = this.selectBoxStart.y;
            var width = Math.abs(pointerPosition.x - this.selectBoxStart.x);
            var height = Math.abs(pointerPosition.y - this.selectBoxStart.y);

            // Phaser impliments Rectangle strangely, so always construct one
            // with (x, y) as the upper left hand corner and no negative width/height
            if (this.selectBoxStart.x > pointerPosition.x) {
                x = pointerPosition.x;
            } if (this.selectBoxStart.y > pointerPosition.y) {
                y = pointerPosition.y;
            }
            return new Phaser.Rectangle(x, y, width, height);
        },

        releaseSelectBox : function(){
            var selected = [];
            var rect = this.getSelectBoxBounds();

            for (var id in this.game.units) {
                var point = {
                    x: this.game.units[id].sprite.x,
                    y: this.game.units[id].sprite.y
                }
                if (rect.contains(point.x, point.y) &&
                    this.game.units[id].playerID == player.id) {
                    console.log("selected");
                    selected.push(this.game.units[id]);
                }
            }
            if (selected.length) {
                this.clearSelection();
                selected.map(function(unit){
                    unit.onSelect();
                });
                this.game.selectedUnits = selected;
            }
            this.graphics.clear();
            this.selectBoxStart = null;
        },

        unitSelected : function(unit) {
            this.clearSelection();
            this.game.selectedUnits = [unit];
            this.recentSelection = true;
            setTimeout(function() {
                this.recentSelection = false;
            }.bind(this), 200);
        },

        panCamera : function() {
            if (this.game.input.activePointer.position.x < 10) {
                this.game.camera.x -= 3;
            } else if (this.game.input.activePointer.position.x > config.game.width-10) {
                this.game.camera.x += 3;
            }

            if (this.game.input.activePointer.position.y < 10) {
                this.game.camera.y -= 3;
            } else if (this.game.input.activePointer.position.y > config.game.height-10) {
                this.game.camera.y += 3;
            }
        },

        update : function() {
            this.game.world.bringToTop(this.graphics);
            if (this.game.input.mouse.button == 2 && !this.mouseActive) {
                this.onRightClick();
                this.mouseActive = true;

                setTimeout(function(){
                    this.mouseActive = false
                }.bind(this), 100);
            } else if (this.game.input.mouse.button == 0 && !this.recentSelection) {
                this.drawSelectBox();
            } else if (this.selectBoxStart){
                this.releaseSelectBox();
            }

            this.panCamera();

            for (var i=0; i < this.keys.length; ++i) {
                if (this.game.input.keyboard.isDown(this.keys[i].key)) {
                    this.keys[i].press();
                } else {
                    this.keys[i].active = false;
                }
            }
        }
    };

    controls.registerControl(Phaser.Keyboard.N, function(){
        require(["app/action"], function(action){
            action.do({
                type: "create",
                data: {
                    type: "Ship",
                    x: Math.random()*200,
                    y: Math.random()*200,
                }
            });
        })
    });

    // Prevent the browser from taking the normal action (scrolling, etc)
    window.addEventListener("keydown", function(e) {
        var codes = [];
        controls.keys.map(function(keyObj){
            codes.push(keyObj.key);
        })

        if(codes.indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    return controls;
});
