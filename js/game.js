// 240 x 240

(function(){
	
	var fns, player, enemy, spriteConfig, spriteSheet, stage, keyCodes, speed, pressedKey, framesize, epCollision, releasedKey;
	
	framesize = 64;
	
	// All Images / Animations config
	spriteConfig = {
		 images: ["image/sprite.png"],
		 frames: {
			width: 64,
			height: 64,
			count: 15
		 }
		 /*[
			 [ 0, 0,   64, 64, 0 ],
			 [ 0, 74,  64, 64, 0 ],
			 [ 0, 148, 64, 64, 0 ],
			 [ 0, 222, 64, 64, 0 ],
			 [ 0, 296, 64, 64, 0 ],
			 [ 0, 370, 64, 64, 0 ],
			 [ 0, 444, 64, 64, 0 ],
			 [ 0, 518, 64, 64, 0 ],
			 [ 0, 592, 64, 64, 0 ]

			 [ 0, 0,   64, 64, 0 ],
			 [ 0, 64,  64, 64, 0 ],
			 [ 0, 128, 64, 64, 0 ],
			 [ 0, 192, 64, 64, 0 ],
			 [ 0, 256, 64, 64, 0 ],
			 [ 0, 320, 64, 64, 0 ],
			 [ 0, 384, 64, 64, 0 ],
			 [ 0, 448, 64, 64, 0 ],
			 [ 0, 512, 64, 64, 0 ],

			 [ 0, 576, 64, 64, 0 ],
			 [ 0, 640, 64, 64, 0 ],
			 [ 0, 704, 64, 64, 0 ],
			 [ 0, 768, 64, 64, 0 ],
			 [ 0, 832, 64, 64, 0 ],
			 [ 0, 896, 64, 64, 0 ]
			 ]*/
		 ,
		 animations: {
			playerMoveLeft : {
				frames: [ 1, 0 ]
			},
			playerMoveTop : {
				frames: [ 2, 0 ]
			},
			playerMoveRight : {
				frames: [ 3, 0 ]
			},
			playerMoveBottom : {
				frames: [ 4, 0 ]
			},
			enemyLookLeft : {
				frames: [ 5 ]
			},
			enemyLookTop : {
				frames: [ 6 ]
			},
			enemyLookRight : {
				frames: [ 7 ]
			},
			enemyLookBottom : {
				frames: [ 8 ]
			},
			enemyKilled : {
				frames: [ 9, 10, 11, 12, 13, 14 ]
			}
		 }
	};
	
	// Game config
	config = {
		playArea : {
			xStart: 0,
			xEnd: document.getElementById("catchEm").width,
			yStart: 0,
			yEnd: document.getElementById("catchEm").height
		}
	};
	
	// Enemy-Player Collision
	epCollision = false;
	
	keyCodes = {
		// Left Arrow Key
		left: 37, 
		
		// Up Arrow Key
		up: 38,
		
		// Right Arrow Key
		right: 39,
		
		// Down Arrow Key
		down: 40, 
	};
	
	// Speed for player movement in pixels / second
	speed = 300;
		
	fns = {
		/**
		*	Detects Enemy-Player collision
		*
		*	@method isCollision
		*/
		isCollision: function(){
			if ( !player || !enemy ){
				return false;
			}
			
			// Depth to cut enemy before it dies
			var enemyCut = 10;
			
			// Player Boundaries
			var pxStart = player.o.x;
			var pxEnd = player.o.x + framesize;
			var pyStart = player.o.y;
			var pyEnd = player.o.y + framesize;
			
			// Enemy boundaries
			var exStart = enemy.o.x ;
			var exEnd = enemy.o.x + framesize;			
			var eyStart = enemy.o.y;
			var eyEnd = enemy.o.y + framesize;
			
			if ( ((pxEnd >= exStart + enemyCut && pxEnd <= exEnd) || (pxStart <= exEnd - enemyCut && pxStart >= exStart))
				&& ((pyEnd >= eyStart + enemyCut && pyEnd <= eyEnd) || (pyStart <= eyEnd - enemyCut && pyStart >= eyStart)) ){
				return true;
			}else{
				return false;
			}
		},

		/**
		*	Plays Enemy animation
		*
		*	@method moveEnemy
		*/
		moveEnemy: function( collision ){
			if ( !enemy ){
				return false;
			}
			
			// Collision state - movement and animation
			if ( collision ){
				// If not already in collision state
				if ( !epCollision ){
					enemy.o.gotoAndPlay( enemy.killed );
				}
			}
			
			// Normal state - movement and animation
			else{
				// When Player is moving horizontally
				if ( pressedKey === keyCodes.left || pressedKey ===  keyCodes.right ){
					if ( player.o.x <= enemy.o.x ){
						enemy.o.gotoAndStop( enemy.look.left );
					}else{
						enemy.o.gotoAndStop( enemy.look.right );
					}
				}
				
				// When Player is moving vertically
				else if ( pressedKey === keyCodes.up || pressedKey ===  keyCodes.down ){
					if ( player.o.y <= enemy.o.y ){
						enemy.o.gotoAndStop( enemy.look.up );
					}else{
						enemy.o.gotoAndStop( enemy.look.down );
					}
				}
			}
		},

		/**
		*	Moves Player, takingcare of collision state
		*
		*	@method movePlayer
		*/
		movePlayer: function( delta, collision ){
			var pCurrAnim;
			
			// reference to play-area config
			var pa =  config.playArea;
			
			if ( !player ){
				return false;
			}
			
			// Players current animation
			pCurrAnim = player.o.currentAnimation;
			
			// Player is controlled by two flags - releasedKey and pressedKey
			// these flags are set / unset by keyboard events
			// In collision state, we manipulate these flags to the control player
			// In Normal state, we let user to control the player :)
			
			// In collision state, stop player - movement and animation
			if ( collision ){
				releasedKey = pressedKey;
				pressedKey = null;
			}
			
			// when arrow-key is pressed, plays player's moving animation and moves player accordingly
			switch( pressedKey ){
				case keyCodes.left:
					player.o.x -= Math.round( speed / 1000 * delta );
					
					// Play this animation only if some-other animation is playing
					// OR this animation is in paused state
					if ( pCurrAnim !== player.move.left || (player.o.paused && pCurrAnim === player.move.left) ){
						player.o.gotoAndPlay( player.move.left );
					}
				break;

				case keyCodes.up:
					player.o.y -= Math.round( speed / 1000 * delta );
					
					// Play this animation only if some-other animation is playing
					// OR this animation is in paused state
					if ( pCurrAnim !== player.move.up || (player.o.paused && pCurrAnim === player.move.up) ){
						player.o.gotoAndPlay( player.move.up );
					}
				break;

				case keyCodes.right:
					player.o.x += Math.round( speed / 1000 * delta );
					
					// Play this animation only if some-other animation is playing
					// OR this animation is in paused state
					if ( pCurrAnim !== player.move.right || (player.o.paused && pCurrAnim === player.move.right) ){
						player.o.gotoAndPlay( player.move.right );
					}
				break;

				case keyCodes.down:
					player.o.y += Math.round( speed / 1000 * delta );
					
					// Play this animation only if some-other animation is playing
					// OR this animation is in paused state
					if ( pCurrAnim !== player.move.down || (player.o.paused && pCurrAnim === player.move.down) ){
						player.o.gotoAndPlay( player.move.down );
					}
				break;				
			}
			
			// Lets player get back in , when it goes out of boundaries
			if ( player.o.x < pa.xStart ){
				player.o.x = pa.xEnd;
			} else if ( player.o.x > pa.xEnd ){
				player.o.x = pa.xStart;
			} else if ( player.o.y < pa.yStart ){
				player.o.y = pa.yEnd;
			} else if ( player.o.y > pa.yEnd ){
				player.o.y = pa.yStart;
			}
			
			// when arrow-key is released, stops player's moving animation
			switch( releasedKey ){
				case keyCodes.left:
					player.o.gotoAndStop( player.move.left );
				break;

				case keyCodes.up:
					player.o.gotoAndStop( player.move.up );
				break;

				case keyCodes.right:
					player.o.gotoAndStop( player.move.right );
				break;

				case keyCodes.down:
					player.o.gotoAndStop( player.move.down );
				break;				
			}
		},
		
		/**
		*	When Images are loaded, create game objects
		*
		*	@method hSpriteReady
		*/
		hSpriteReady: function(){
			// Player Object
			player = {
				o: new createjs.Sprite(spriteSheet, "playerMoveRight"),
				move: {
					left: "playerMoveLeft",
					up: "playerMoveTop",
					right:"playerMoveRight",
					down: "playerMoveBottom"
				},
				startAnimation: "playerMoveRight"
			};
			
			// Enemy Object
			enemy = {
				o: new createjs.Sprite(spriteSheet, "enemyLookLeft"),
				look: {
					left: "enemyLookLeft",
					up: "enemyLookTop",
					right: "enemyLookRight",
					down: "enemyLookBottom"
				},
				killed: "enemyKilled",
				startAnimation: "enemyLookLeft"
			};
			
			// Animation speed
			enemy.o.framerate = 3;
			player.o.framerate = 8;
			
			// add to stage
			stage.addChild( enemy.o );
			stage.addChild( player.o );
						
			// Load New Game
			this.resetGame();
		},

		/**
		*	Resets Game stage
		*
		*	@method resetGame
		*/
		resetGame: function( e ){
			if ( !player || !enemy ){
				return false;
			}
			
			// Player's Starting position
			player.o.x = 10;
			player.o.y = 10;

			// Enemy's Starting position
			enemy.o.x = 200;
			enemy.o.y = 200;
			
			// Objects starting Animations
			player.o.gotoAndStop( player.startAnimation );
			enemy.o.gotoAndStop( enemy.startAnimation );
			
			// Unset Enemy-player collision
			epcollision = false;
			
			// Unset arrow keys state
			pressedKey = releasedKey = null;
		},

		/**
		*	To track pressed key
		*
		*	@method hKeyDown
		*/
		hKeyDown: function( e ){			
			switch( e.keyCode ){
				case keyCodes.left:
				case keyCodes.up:
				case keyCodes.right:
				case keyCodes.down:
					pressedKey = e.keyCode;
				break;
			}
			releasedKey = null;
		},

		/**
		*	To Stop Player's movement animation
		*
		*	@method hKeyUp
		*/
		hKeyUp: function( e ){
			// Equality check to ensure we always unset last pressedKey
			// eg: you press left-arrow key and without releasing it press right-arrow
			// and then you release right-arrow
			// this check ensures to skip left-arrow key and only unsets when you release
			// right-arrow
			if ( e.keyCode === pressedKey ){
				releasedKey = pressedKey;
				
				// To stop players movement
				pressedKey = null;			
			}	
		},

		/**
		*	When Enemy is killed, reset game
		*
		*	@method hEnemyKilled
		*/
		hEnemyKilled: function( e ){
			this.resetGame();
		},
		
		/**
		*	This method is called after every tick. This is the main method where all business logic goes
		*
		*	@method hRenderGame
		*/
		hRenderGame: function( e ){
			// Elapsed time since last tick, useful for calculating object movements
			var delta = e.delta;
			
			// true indicated, enemy and player has collided
			var collision;
			
			// Enemy-Player collision detection
			collision = this.isCollision();
						
			// Enemy movement
			this.moveEnemy( collision );				
						
			// Player's movement based on Arrow keys
			this.movePlayer( delta, collision );
			
			// Save current collision state
			epCollision = collision;

			// renders all the stage objects
			stage.update(e);
		},

		/**
		*	Bind all Events
		*
		*	@method bindEvents
		*/
		bindEvents: function(){
			// Registers tick handler, that will be called on each tick
			createjs.Ticker.on( "tick", this.hRenderGame, this );
			
			// Registers keyboard events
			document.addEventListener( "keydown", this.hKeyDown, this );
			document.addEventListener( "keyup", this.hKeyUp, this );
			
			// registers animation complete event, useful for doing tasks post player-enemy collision
			enemy.o.on( "animationend", this.hEnemyKilled, this );
		},
		
		/**
		*	Sets up Game
		*
		*	@method initData
		*/
		initData: function( cb ){		
			cb = cb || function(){};
			
			// Create a new new stage for our game objects
			stage = new createjs.Stage( "catchEm" );
			
			// Create spriteSheet using config
			spriteSheet = new createjs.SpriteSheet( spriteConfig );

			// Make sure images are loaded, before we proceed 
			if ( !spriteSheet.complete ){
				spriteSheet.on( "complete", this.hSpriteReady, this );
				spriteSheet.on( "complete", cb, this );
			}else{
				this.hSpriteReady();
				cb();
			}
		},
		
		/**
		*	Initialize Game
		*
		*	@method init
		*/
		init: function(){
			// Using RAF api over setInterval ( for Performance )
			createjs.Ticker.timingMode = createjs.Ticker.RAF;
			
			this.initData( this.bindEvents );
		}
	};
	
	// Start game
	fns.init();
}());