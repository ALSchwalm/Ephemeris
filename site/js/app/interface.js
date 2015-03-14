/**
 * Module which displays the in-game interface
 * @module app/interface
 */
define(["app/config", "Phaser", "app/utils",
        "app/player", "app/map", "app/fog", "app/controlpoint", "app/timer"],
function(config, Phaser, utils, player, map, fog, ControlPoint, timer){
    "use strict"

    /**
     * Singleton which displays the in-game interface
     * @alias module:app/interface
     */
    var Interface = function() {}

    /**
     * Initialize the interface
     *
     * @param {Phaser.Game} game - A reference to the current game object
     */
    Interface.prototype.init = function(game) {
        this.game = game;
        this.minimapWidth = map.width*config.interface.minimap.scale;
        this.minimapHeight = map.height*config.interface.minimap.scale;
        this.minimapBack = this.game.add.graphics(0, config.game.height -
                                                  this.minimapHeight);
        this.iconBarWidth = this.game.width - this.minimapWidth;
        if (this.iconBarWidth > config.interface.iconBarMaxWidth)
            this.iconBarWidth = config.interface.iconBarMaxWidth;
        this.iconBarHeight = this.minimapHeight - this.minimapHeight*0.1;

        this.minimapBounds = new Phaser.Rectangle(this.minimapBack.x,
                                                  this.minimapBack.y,
                                                  this.minimapWidth,
                                                  this.minimapHeight);
        // Draw backgound
        this.minimapBack.beginFill(0x222222, 1);
        this.minimapBack.drawRect(0, 0, this.minimapWidth, this.minimapHeight);
        this.minimapBack.endFill();

        // Draw regions
        map.regions.map(function(region){
            var transformed = this.worldToMinimapCoord(region.position);
            var minimapRegion = this.game.add.image(transformed.x,
                                                    transformed.y,
                                                    region.image.key);
            minimapRegion.anchor.set(0.5, 0.5);
            minimapRegion.tint = region.tint || 0xFFFFFF;
            minimapRegion.angle = region.angle || 0;
            var scale = region.scale || {x: 1, y: 1};
            minimapRegion.scale = {
                x: config.interface.minimap.scale*scale.x,
                y: config.interface.minimap.scale*scale.y
            }

            if (region.type != "nebula") {
                minimapRegion.alpha = 0.4;
            }

            this.minimapBack.addChild(minimapRegion);
        }, this);

        this.controlPointsGraphics = this.game.add.graphics();
        this.minimapBack.addChild(this.controlPointsGraphics);
        this.displayControlPoints();

        // Draw grid
        var cellSize = this.minimapWidth/config.interface.minimap.gridLines;
        this.minimapBack.lineStyle(1, 0xCCCCCC, 0.1);
        for (var i=0; i < config.interface.minimap.gridLines; ++i) {
            for (var j=0; j < config.interface.minimap.gridLines; ++j) {
                this.minimapBack.drawRect(i*cellSize, j*cellSize, cellSize, cellSize);
            }
        }
        this.minimapBack.endFill();

        this.minimap = this.game.add.graphics(0, config.game.height -
                                              this.minimapHeight);

        this.fogGraphics = this.game.add.graphics(0, config.game.height -
                                                  this.minimapHeight);
        this.fogData = this.game.add.bitmapData(this.minimapWidth,
                                                this.minimapHeight);
        this.fogData.context.fillStyle = 'rgba(0,0,0,0.4)';
        this.fogData.context.fillRect(0, 0, this.minimapWidth,
                                      this.minimapHeight);
        this.fogSprite = this.game.add.sprite(0, config.game.height-this.minimapHeight,
                                              this.fogData);
        this.fogSprite.mask = this.fogGraphics;

        this.infoBar = this.game.add.graphics(this.minimap.position.x + this.minimapWidth,
                                              this.minimap.position.y+this.minimap.position.y*0.1);
        this.infoBarIconGraphics = this.game.add.graphics(0, 0);
        this.infoBar.addChild(this.infoBarIconGraphics);

        this.infoBarSelectedIcons = [];
        this.infoBarSelectedText = [];

        this.infoBar.fixedToCamera = true;
        this.fogGraphics.fixedToCamera = true;
        this.fogSprite.fixedToCamera = true;
        this.minimap.fixedToCamera = true;
        this.minimapBack.fixedToCamera = true;

        // Timer text
        var style = {
            font: "20px Arial",
            fill: "#FFFFFF",
            shadowColor: "#000000"
        };
        var timeText = this.game.add.text(5, -25, "", style);
        this.infoBar.addChild(timeText);

        timer.onTick = function(){
            timeText.text = timer.getTime();
        }.bind(this);

        // Draw initial infopanel
        this.reconstructInfoPanel();
        return this;
    }

    Interface.prototype.displayControlPoints = function() {
        if (ControlPoint.redraw) {
            this.controlPointsGraphics.clear();
            map.controlPoints.map(function(point){
                var transformed = this.worldToMinimapCoord(point.position);
                var range = point.range*2*config.interface.minimap.scale;
                this.controlPointsGraphics.lineStyle(1, point.area.tint, 0.5);
                this.controlPointsGraphics.drawCircle(transformed.x,
                                                      transformed.y,
                                                      range);
            }, this);
            ControlPoint.redraw = false;
        }
        return this;
    }

    /**
     * Update the interface
     */
    Interface.prototype.update = function() {
        this.updateMinimap();
        this.updateInfoPanel();
        return this;
    }

    /**
     * Bring the contents of the menu panel up-to-date. This includes health info
     * for units and unit production time for control points
     */
    Interface.prototype.updateInfoPanel = function() {
        this.game.world.bringToTop(this.infoBar);

        if (this.game.selected.length == 1) {
            if (!(this.game.selected[0] instanceof ControlPoint)) {
                this.infoBarSelectedText[0].text =
                    "Health: " + Math.floor(this.game.selected[0].health) +
                    "/" + this.game.selected[0].maxHealth;
            } else {
                if (!timer.expired()){
                    this.infoBarSelectedText[0].text =
                        "Building: " + Math.floor(this.game.selected[0].buildPercent) + "%";
                } else {
                    this.infoBarSelectedText[0].text = "Build Time Ended";
                }
            }
        } else if (this.game.selected.length > 1) {
            this.infoBarSelectedText.map(function(text, i){
                text.text = Math.floor(this.game.selected[i].health.toString()) +
                    "/" + this.game.selected[i].maxHealth;
            }, this);
        }
    }

    Interface.prototype.addControlPointControls = function() {
        var options = ["fighterIcon", "bomberIcon", "carrierIcon"];
        var point = this.game.selected[0];

        options.map(function(option, i){
            var button = this.game.add.button(50+config.interface.iconSize*i, 160,
                                              option,
                                              function(){
                                                  if (point.owner == player) {
                                                      this.buildUnit(i);
                                                      hud.reconstructInfoPanel();
                                                  }
                                              }, point);
            button.anchor.set(0.5, 0.5);
            this.infoBarSelectedIcons.push(button);
            this.infoBar.addChild(button);

            // Show the current option
            if (point.buildUnitType.prototype.iconKey == option) {
                this.infoBar.lineStyle(1, 0xCCCCCC, 1);
                this.infoBar.beginFill(0x000000, 1);
                this.infoBar.drawRoundedRect(button.x-button.width/2,
                                             button.y-button.height/2,
                                             button.width, button.height,
                                             4);
                this.infoBar.endFill();
            }
        }, this);
    }

    /**
     * Fill the info panel with information about a single selected unit
     */
    Interface.prototype.drawSelectedUnitInfo = function() {
        var key = this.game.selected[0].iconKey;
        var icon = this.game.add.image(50, 60, key);
        icon.anchor.set(0.5, 0.5);
        this.infoBarSelectedIcons.push(icon);
        this.infoBar.addChild(icon);

        if (this.game.selected[0] instanceof ControlPoint) {
            this.addControlPointControls();
        }

        this.infoBar.lineStyle(1, 0xCCCCCC, 1);
        this.infoBar.beginFill(0x000000, 1);
        this.infoBar.drawRoundedRect(icon.x-icon.width/2, icon.y-icon.height/2,
                                     icon.width, icon.height,
                                     4);
        this.infoBar.endFill();

        var style = {
            font: "20px Arial",
            fill: "#FFFFFF",
            shadowColor: "#000000"
        };
        var text = this.game.add.text(200, icon.y-icon.height/3,
                                      this.game.selected[0].name,
                                      style);
        this.infoBarSelectedIcons.push(text);
        this.infoBar.addChild(text);

        var health = this.game.add.text(text.x, text.y+35, "", style);
        this.infoBarSelectedIcons.push(health);
        this.infoBarSelectedText.push(health);
        this.infoBar.addChild(health);
    }

    /**
     * Fill the info panel with information and icons about the
     * the currently selected group of units
     */
    Interface.prototype.drawSelectedGroupInfo = function() {
        var iconBarCount = Math.floor(this.iconBarWidth/config.interface.iconSize);
        var height = -1;

        this.game.selected.map(function(unit, i){
            var key = this.game.selected[i].iconKey;
            if (i%iconBarCount == 0) {
                ++height;
            }

            var clickIcon = function() {
                this.game.selected.map(function(unit){
                    unit.onUnselect();
                });
                this.game.selected = [this];
                this.onSelect();
            };

            // Create an icon for each selected unit
            var icon = this.game.add.button(config.interface.iconSize*(i%iconBarCount)*0.9,
                                            (config.interface.iconSize+10)*height, key,
                                            clickIcon, unit);
            icon.scale.set(0.9, 0.9);
            this.infoBar.addChild(icon);
            this.infoBarSelectedIcons.push(icon);

            var style = {
                font: "12px Arial",
                fill: "#FFFFFF",
                shadowColor: "#000000"
            };
            var text = this.game.add.text(icon.x+icon.width/2, icon.y+icon.height+5,
                                          "", style);
            text.anchor.set(0.5, 0.5);
            this.infoBarSelectedText.push(text);
            this.infoBarSelectedIcons.push(text);
            this.infoBar.addChild(text);

            // Draw border around icons
            this.infoBar.lineStyle(1, 0xCCCCCC, 1);
            this.infoBar.beginFill(0x000000, 1);
            this.infoBar.drawRoundedRect(icon.x+2, icon.y+2,
                                         icon.width-4, icon.height-4,
                                         4);
            this.infoBar.endFill();
        }, this);
    }

    /**
     * Remove all contents of the info panel and re-add them for the currently
     * selected group of units or control point. This should be invoked whenever
     * a unit is destroyed or a control point is captured, etc
     */
    Interface.prototype.reconstructInfoPanel = function() {
        this.infoBar.clear();
        this.infoBar.lineStyle(2, 0x444444, 1);
        this.infoBar.beginFill(0x000000, 1);
        this.infoBar.drawRect(0, 0, this.iconBarWidth,
                              this.iconBarHeight);
        this.infoBar.endFill();

        this.infoBarSelectedIcons.map(function(icon){
            icon.destroy();
        });
        this.infoBarSelectedText = [];

        // Draw more info if only one unit is selected
        if (this.game.selected.length == 1) {
            this.drawSelectedUnitInfo();
        } else if (this.game.selected.length > 1){
            this.drawSelectedGroupInfo();
        }
    }

    Interface.prototype.updateMinimapFoW = function() {
        this.fogGraphics.clear();

        this.fogGraphics.beginFill(0x000000, 1);
        this.game.units.map(function(unit){
            if (unit.owner != player || unit.dead) return;
            this.fogGraphics.drawCircle(unit.position.x*config.interface.minimap.scale,
                                        unit.position.y*config.interface.minimap.scale,
                                        unit.view*2*config.interface.minimap.scale);
        }, this);

        map.controlPoints.map(function(point){
            if (point.owner == player) {
                this.fogGraphics.drawCircle(point.position.x*config.interface.minimap.scale,
                                            point.position.y*config.interface.minimap.scale,
                                            point.view*2*config.interface.minimap.scale);
            }
        }, this);
        this.fogGraphics.endFill();
    }

    Interface.prototype.updateMinimap = function() {
        this.minimap.clear();
        this.game.world.bringToTop(this.minimapBack);
        this.game.world.bringToTop(this.fogSprite);
        this.game.world.bringToTop(this.minimap);

        this.updateMinimapFoW();
        this.displayControlPoints();

        this.minimap.lineStyle(2, 0x444444, 1);
        this.minimap.drawRect(0, 0, this.minimapWidth, this.minimapHeight);
        this.minimap.lineStyle();

        // Draw units
        this.game.units.concat(map.controlPoints).map(function(unit){
            var position = unit.position;
            var transformed = this.worldToMinimapCoord(position);

            if (unit.owner && unit.graphics.visible && unit.graphics.exists) {
                if (this.game.selected.indexOf(unit) == -1) {
                    this.minimap.beginFill(unit.owner.color, 0.5);
                } else {
                    this.minimap.beginFill(0xFFFFFF, 0.5);
                }
                this.minimap.drawRect(transformed.x, transformed.y, 4, 4);
                this.minimap.endFill();
            }
        }, this);

        map.controlPoints.map(function(point){
            if (point.targetGraphics.visible) {
                var position = point.targetGraphics;
                var transformed = this.worldToMinimapCoord(position);
                this.minimap.beginFill(0x00DD00, 0.5);
                this.minimap.drawRect(transformed.x, transformed.y, 4, 4);
                this.minimap.endFill();
            }
        }, this);

        // Draw camera
        this.minimap.lineStyle(1, 0xFFFFFF, 0.7);

        // Phaser.Camera.position returns the center of the camera, so get
        // upper left corner like this
        var cameraPosition = this.worldToMinimapCoord({
            x: this.game.camera.x,
            y: this.game.camera.y
        });
        var cameraSize = this.worldToMinimapCoord({
            x: this.game.camera.width,
            y: this.game.camera.height
        });

        this.minimap.drawRect(cameraPosition.x, cameraPosition.y,
                              cameraSize.x, cameraSize.y);
        this.minimap.endFill();

        return this;
    }

    /**
     * Transform a world coordinate into minimap coordinates
     */
    Interface.prototype.worldToMinimapCoord = function(coord) {
        return {
            x: utils.transform(0, map.width,
                               0, this.minimapWidth,
                               coord.x),
            y: utils.transform(0, map.height,
                               0, this.minimapHeight,
                               coord.y)
        };
    }

    /**
     * Transform a minimap coordinate into world coordinates
     */
    Interface.prototype.minimapToWorldCoord = function(coord) {
        return {
            x: utils.transform(0, this.minimapWidth,
                               0, map.width,
                               coord.x),
            y: utils.transform(0, this.minimapHeight,
                               0, map.height,
                               coord.y)
        };
    }

    var hud = new Interface();

    return hud;
});
