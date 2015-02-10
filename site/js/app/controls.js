define(["app/config","Phaser", "app/player", "app/movement",
        "app/map", "app/interface"],
function(config, Phaser, player, movement, map, hud){
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
        minimapActive : false,
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

        /**
         * Callback executed when a right click occurs
         */
        onRightClick : function() {
            if (this.game.selectedUnits.length) {
                movement.groupMoveToPoint(this.game.selectedUnits,
                                          controls.pointerPosition());
            }
        },

        /**
         * Unselect an currently selected units
         */
        clearSelection : function() {
            this.game.selectedUnits.map(function(unit){
                unit.onUnselect();
            });
        },

        /**
         * Get the current pointer position with respect to the game world
         *
         * @param {bool} [relative=false] - If true, returns the position with respect to the window
         * @returns An (x, y) pair representing the cursor position
         */
        pointerPosition : function(relative) {
            var relative = relative || false;
            if (relative) {
                return  {
                    x: this.game.input.x,
                    y: this.game.input.y
                };
            }
            return  {
                x: this.game.input.worldX,
                y: this.game.input.worldY
            };
        },

        /**
         * Draws the box when dragging to select units
         */
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

        /**
         * Get the current bounds of the active selection box
         *
         * @returns {PIXI.Rectangle} A rectangle representing the current bounds
         */
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

        /**
         * A callback executed when a group selection is made
         */
        onReleaseSelectBox : function(){
            var selected = [];
            var rect = this.getSelectBoxBounds();

            for (var id in this.game.units) {
                var point = {
                    x: this.game.units[id].sprite.x,
                    y: this.game.units[id].sprite.y
                }
                if (rect.contains(point.x, point.y) &&
                    this.game.units[id].playerID == player.id) {
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

        /**
         * A function when should be executed by any unit/structure after it is
         * selected
         */
        unitSelected : function(unit) {
            this.clearSelection();
            this.game.selectedUnits = [unit];
            this.recentSelection = true;
            setTimeout(function() {
                this.recentSelection = false;
            }.bind(this), 200);
        },

        /**
         * Set the star parallax position based on the camara
         */
        updateParallax : function() {
            map.graphics.cameraOffset.x = this.game.camera.x/config.map.parallaxFactor -
                map.width/2;
            map.graphics.cameraOffset.y = this.game.camera.y/config.map.parallaxFactor -
                map.height/2;
        },

        /**
         * Method which pans the camera when the cursor is near the edges of the screen
         */
        panCamera : function() {
            if (this.game.input.activePointer.position.x < 10 &&
                this.game.camera.x >= 3) {
                this.game.camera.x -= 3;
            } else if (this.game.input.activePointer.position.x > config.game.width-10 &&
                       this.game.camera.x <= map.width - this.game.camera.width - 3) {
                this.game.camera.x += 3;
            }

            if (this.game.input.activePointer.position.y < 10 &&
                this.game.camera.y >= 3) {
                this.game.camera.y -= 3;
            } else if (this.game.input.activePointer.position.y > config.game.height-10 &&
                       this.game.camera.y <= map.height - this.game.camera.height - 3) {
                this.game.camera.y += 3;
            }
            this.updateParallax();
        },

        /**
         * Main controls loop which invokes registered callbacks after the
         * appropriate keys are pressed.
         */
        update : function() {
            this.game.world.bringToTop(this.graphics);
            if (this.game.input.mouse.button == 2 && !this.mouseActive) {
                this.onRightClick();
                this.mouseActive = true;

                setTimeout(function(){
                    this.mouseActive = false
                }.bind(this), 100);
            } else if (this.game.input.mouse.button == 0 &&
                       !this.selectBoxStart &&
                       (hud.minimapBounds.contains(this.pointerPosition(true).x,
                                                   this.pointerPosition(true).y) ||
                        this.minimapActive)) {
                var pointer = this.pointerPosition();
                pointer.x -= hud.minimap.x;
                pointer.y -= hud.minimap.y;
                var position = hud.minimapToWorldCoord(pointer);
                this.game.camera.x = position.x - this.game.camera.width/2;
                this.game.camera.y = position.y -  this.game.camera.height/2;
                this.minimapActive = true;
            } else if (this.game.input.mouse.button == 0 &&
                       !this.recentSelection && !this.minimapActive) {
                this.drawSelectBox();
            } else if (this.game.input.mouse.button != 0 &&
                       !this.selectBoxStart && this.minimapActive) {
                this.minimapActive = false;
            } else if (this.game.input.mouse.button != 0 && this.selectBoxStart){
                this.onReleaseSelectBox();
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

    // TODO remove this
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
