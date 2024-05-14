// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.AUTO,
    physics: {
		  default: 'arcade',
		  arcade: {
			  debug: false,
		  }
    },
    width: 1200,
    height: 800,
    scene: [ MainMenu, Game, GameOver, Enemies,]
};


// Global variable to hold sprites
var my = {sprite: {}};

const game = new Phaser.Game(config);
