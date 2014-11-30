// 240 x 240

(function(){
	
	var fns, player, enemy, spriteConfig, spriteSheet, stage, keyCodes, 
	pressedKey, framesize, epCollision, releasedKey, directions;
	
	framesize = 64;
	
	// Animations config
	spriteConfig = {
		 images: ["image/sprite.png"],
		 frames: {
			width: 64,
			height: 64,
			count: 15
		 },
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
	
	// Game configuration
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
		
	// Arrow key code
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
	
	// All directions in which objects can move
	directions = {
		left: 0,
		up: 1,
		right: 2,
		down: 3
	};
	
	//local functions
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
		*	Restrict the object movements within play-area
		*
		*	@method restrictInBounds
		*/
		restrictInBounds: function( o ){				
			// reference to play-area configuration
			var pa =  config.playArea;
			
			if ( o.x < pa.xStart ){
				o.x = pa.xEnd;
			} else if ( o.x > pa.xEnd ){
				o.x = pa.xStart;
			} else if ( o.y < pa.yStart ){
				o.y = pa.yEnd;
			} else if ( o.y > pa.yEnd ){
				o.y = pa.yStart;
			}
		},

		/**
		*	Enemy Movement in play-area
		*
		*	@method moveEnemy
		*/
		moveEnemy: function( delta, collision ){
			// New movement direction
			var newDirection = -1;
			
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
				// Animation
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
				
				// Movement
				// change direction
				enemy.deltaTime += delta;
				if ( enemy.deltaTime >= enemy.changeDirection ){
					// to start the loop
					newDirection = enemy.direction;
					// To ensure newly calculated direction is not same as current direction
					while( newDirection === enemy.direction ){
						newDirection = parseInt( Math.random() * 4 );
					}
					enemy.direction = newDirection;
					// reset elapsed time
					enemy.deltaTime = 0;
				}
				
				switch( enemy.direction ){
					case directions.left:
						enemy.o.x -= Math.round( enemy.speed / 1000 * delta );
					break;

					case directions.up:
						enemy.o.y -= Math.round( enemy.speed / 1000 * delta );
					break;

					case directions.right:
						enemy.o.x += Math.round( enemy.speed / 1000 * delta );
					break;

					case directions.down:
						enemy.o.y -= Math.round( enemy.speed / 1000 * delta );
					break;
				}
				
				// handle out of bounds movement
				this.restrictInBounds( enemy.o );
			}
		},

		/**
		*	Player Movement in play-area
		*
		*	@method movePlayer
		*/
		movePlayer: function( delta, collision ){
			var pCurrAnim;
			
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
					player.o.x -= Math.round( player.speed / 1000 * delta );
					
					// Play this animation only if some-other animation is playing
					// OR this animation is in paused state
					if ( pCurrAnim !== player.move.left || (player.o.paused && pCurrAnim === player.move.left) ){
						player.o.gotoAndPlay( player.move.left );
					}
				break;

				case keyCodes.up:
					player.o.y -= Math.round( player.speed / 1000 * delta );
					
					// Play this animation only if some-other animation is playing
					// OR this animation is in paused state
					if ( pCurrAnim !== player.move.up || (player.o.paused && pCurrAnim === player.move.up) ){
						player.o.gotoAndPlay( player.move.up );
					}
				break;

				case keyCodes.right:
					player.o.x += Math.round( player.speed / 1000 * delta );
					
					// Play this animation only if some-other animation is playing
					// OR this animation is in paused state
					if ( pCurrAnim !== player.move.right || (player.o.paused && pCurrAnim === player.move.right) ){
						player.o.gotoAndPlay( player.move.right );
					}
				break;

				case keyCodes.down:
					player.o.y += Math.round( player.speed / 1000 * delta );
					
					// Play this animation only if some-other animation is playing
					// OR this animation is in paused state
					if ( pCurrAnim !== player.move.down || (player.o.paused && pCurrAnim === player.move.down) ){
						player.o.gotoAndPlay( player.move.down );
					}
				break;				
			}
			
			// handle out of bounds movement
			this.restrictInBounds( player.o );
			
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
		*	To track currently pressed Arrow key
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
		*	To track currently released Arrow key
		*
		*	@method hKeyUp
		*/
		hKeyUp: function( e ){
			// Equality check to ensure we always unset last pressedKey
			if ( e.keyCode === pressedKey ){
				releasedKey = pressedKey;
				pressedKey = null;			
			}	
		},

		/**
		*	Enemy Killed handler
		*
		*	@method hEnemyKilled
		*/
		hEnemyKilled: function( e ){
			this.resetGame();
		},
		
		/**
		*	This method is called after every tick.
		*	This is the main method where all game logic goes
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
			this.moveEnemy( delta, collision );				
						
			// Player's movement based on Arrow keys
			this.movePlayer( delta, collision );
			
			// Save current collision state
			epCollision = collision;

			// renders all the stage objects
			stage.update(e);
		},

		/**
		*	Bind Events
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
		*	Resets Game
		*
		*	@method resetGame
		*/
		resetGame: function( e ){
			if ( !player || !enemy ){
				return false;
			}
			
			// Player's Starting position
			player.o.x = 10;
			player.o.y = config.playArea.yEnd - 100;

			// Enemy's Starting position
			enemy.o.x = config.playArea.xEnd - 300;
			enemy.o.y = 50;
			
			// Objects starting Animations
			player.o.gotoAndStop( player.start );
			enemy.o.gotoAndStop( enemy.start );
			
			// Unset Enemy-player collision
			epcollision = false;
			
			// Unset arrow keys state
			pressedKey = releasedKey = null;
		},
		
		/**
		*	Handler called after images are loaded.
		*	create game objects here.
		*
		*	@method hSpriteReady
		*/
		hSpriteReady: function(){
			// Player Object
			player = {
				// createjs object
				o: new createjs.Sprite(spriteSheet, "playerMoveRight"),
				
				// moving around animations
				move: {
					left: "playerMoveLeft",
					up: "playerMoveTop",
					right:"playerMoveRight",
					down: "playerMoveBottom"
				},
				
				// Starting animation
				start: "playerMoveRight",
				
				// Movement speed
				speed: 600
			};
			
			// Enemy Object
			enemy = {
				// createjs object
				o: new createjs.Sprite(spriteSheet, "enemyLookLeft"),
				
				// looking around animations
				look: {
					left: "enemyLookLeft",
					up: "enemyLookTop",
					right: "enemyLookRight",
					down: "enemyLookBottom"
				},
				
				// killed animation
				killed: "enemyKilled",
				
				// starting animation
				start: "enemyLookLeft",
				
				// current movement direction
				direction: directions.left,
				
				// movement speed
				speed: 500,
				
				// automatically changes direction after this time ( in ms )
				changeDirection: 500,
				
				// elapsed time since last direction change
				deltaTime: 0
			};
			
			// Set Animation speed
			enemy.o.framerate = 3;
			player.o.framerate = 8;
			
			// add to stage
			stage.addChild( enemy.o );
			stage.addChild( player.o );
						
			// Load New Game
			this.resetGame();
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
	
	// Start
	fns.init();
}());