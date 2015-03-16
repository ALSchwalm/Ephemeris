Ephemeris
=========

Ephemeris is a real-time strategy game, written using [Phaser][phaser]. The game may
be played in a web browser [here][live] (hosted by [Nodejitsu][nodejitsu]), or by
cloning this repository, installing [nodejs][nodejs], and executing `npm install`
followed by `npm start` from the project root.

[phaser]: http://phaser.io/
[live]: http://ephemeris.jit.su/
[nodejitsu]: https://www.nodejitsu.com/
[nodejs]: http://nodejs.org/

How To Play
===========

Each game consists of two opposing players. These players attempt to capture control
points distributed in key locations around the map. Once a player has taken a
control point, it will start producing units over time. These units may be used to
destroy units controlled by the other player, or to capture additional control
points. If a player controls no points and has no units, they lose.

The Map
-------

The map also contains different regions which have effects on the units within them.
Some regions may regenerate or damage health over time. These regions are color
coded, and display indicators of their effects on the units within them. The location
of enemy units is obscured by the Fog of War. This fog hides enemy units, but is
revealed by nearby friendly units or captured control points.

The Units
---------

There are three units in Ephemeris: Fighters, Bombers and Carriers. Each unit does
double damage against on other unit type, while taking double damage from a
different unit type. These weaknesses/strengths are as follows:

| Unit     | Strong Against  | Weak Against |
| -------- | --------------- | ------------ |
| Fighter  | Bomber          | Carrier      |
| Bomber   | Carrier         | Fighter      |
| Carrier  | Fighter         | Bomber       |

Controls
--------

Units may be selected by left clicking on them. If a unit or group of units is
selected, it can be moved by right clicking on the map or minimap. If an enemy unit
is right clicked, the currently selected unit or group of units will attack it.
The player may also left click and drag to select a group of friendly units. The
player may hold select and draw a shape using the mouse. This will cause the
currently selected units to "form up" to that shape, allowing for easy, complex
formations.

If the player clicks a control point, the HUD will display a series of buttons
which determine what unit is currently being built. Different units have different
build times.

TODO
====

- [x] Creation of units
- [x] Allow units to move around the map
- [x] Hud (other than the minimap)
- [ ] Sound effects
- [x] More animations (explosions on hit, glow on right click, etc.)
- [ ] Home page
- [ ] Tutorial
- [x] Server support for multiple games
- [x] Effects for regions
- [x] Advanced controls (Ctrl-click, shift-click, hotkeys)
- [x] Add control points

Credit
======

The following individuals created assets which are used in Ephemeris:

- Daniel Cook and Christopher M. Park for most in-game sprites from [AI War: Fleet Command][fleet-command], freely used per link ([link][ai-war])
- [SoulFilcher][soulfilcher] for the selected units icons ([link][icons])
- Background music by DST available at [nosoapradio][nosoap] (unmodified).
- Explosion sound by Isaac200000 available [here][explosion] (unmodified).
- Fighter selection sound by Kijadzel available [here][fighterSelect] (shortened).
- Bomber selection sound by M-RED available [here][bomberSelect] (unmodified).
- Carrier selection sound by THE_bizniss available [here][carrierSelect] (unmodified).
- Laser sound by Nbs Dark available [here][laser] (unmodified).
- Movement sound by Sergenious available [here][move] (unmodified).
- Activate sound by Yuroun available [here][activate] (unmodified).

[fleet-command]: http://arcengames.com/ai-war/
[ai-war]: http://christophermpark.blogspot.com/2009/10/free-graphics-for-indie-developers.html
[soulfilcher]: http://www.sc2mapster.com/profiles/SoulFilcher/
[icons]: http://www.sc2mapster.com/assets/abilities-and-upgrades-icon-pack/
[nosoap]: http://www.nosoapradio.us/
[explosion]: http://www.freesound.org/people/Isaac200000/sounds/184651/
[fighterSelect]: http://www.freesound.org/people/Kijadzel/sounds/170608/
[bomberSelect]: http://www.freesound.org/people/M-RED/sounds/55356/
[carrierSelect]: http://www.freesound.org/people/THE_bizniss/sounds/39469/
[laser]: http://www.freesound.org/people/Nbs%20Dark/sounds/83562/
[move]: http://www.freesound.org/people/Sergenious/sounds/55849/
[activate]: http://www.freesound.org/people/Yuroun/sounds/233028/
