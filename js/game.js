// 240 x 240

(function(){
	
	var fns, player, enemy, spriteConfig, spriteSheet, stage, keyCodes, speed, pressedKey;
	
	// All Images / Animations config
	spriteConfig = {
		 framerate: 20,
		 images: ["image/sprite.png"],
		 frames: [
			 [ 0, 0,   64, 64, 0 ],
			 [ 0, 74,  64, 64, 0 ],
			 [ 0, 148, 64, 64, 0 ],
			 [ 0, 222, 64, 64, 0 ],
			 [ 0, 296, 64, 64, 0 ],
			 [ 0, 370, 64, 64, 0 ],
			 [ 0, 444, 64, 64, 0 ],
			 [ 0, 518, 64, 64, 0 ],
			 [ 0, 592, 64, 64, 0 ]
		 ],
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
			}
		 }
	};
	
	// Game config
	config = {

	};
	
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
	speed = 50;
	
	// represents any key if user has pressed
	currKey = null;
		
	fns = {
		/**
		*	Init Game Objects
		*
		*	@method bindEvents
		*/
		initData: function(){
			// Create a new new stage for our game objects
			stage = new createjs.Stage( "catchEm" );
			
			// Create spriteSheet using config
			spriteSheet = new createjs.SpriteSheet( spriteConfig );

			// Make sure images are loaded, before we proceed 
			if ( !spriteSheet.complete ){
				spriteSheet.on( "complete", this.hSpriteReady, this );
			}else{
				this.hSpriteReady();
			}
		},

		/**
		*	To start player's movement animation
		*
		*	@method hKeyDown
		*/
		hKeyDown: function( e ){
			var keyCode = e.keyCode,
				delta = e.delta,
				i;
			
			if ( !player ){
				return false;
			}
			
			// Store pressed key, for player movements
			//currKey = keyCode;
			
			switch( keyCode ){
				case keyCodes.left:
					player.o.gotoAndPlay( player.move.left );
				break;

				case keyCodes.up:
					player.o.gotoAndPlay( player.move.up );
				break;

				case keyCodes.right:
					player.o.gotoAndPlay( player.move.right );
				break;

				case keyCodes.down:
					player.o.gotoAndPlay( player.move.down );
				break;				
			}
			
			// Save pressed key
			pressedKey = keyCode;
		},

		/**
		*	To Stop Player's movement animation
		*
		*	@method hKeyUp
		*/
		hKeyUp: function( e ){
			var releasedKey = e.keyCode;
			
			if ( releasedKey === pressedKey ){
				// Animate player movement as per pressed arrow key
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
				
				// To stop players movement
				pressedKey = null;
			}
		},
		
		/**
		*	Bind all Events
		*
		*	@method bindEvents
		*/
		bindEvents: function(){
			createjs.Ticker.on( "tick", this.hRenderGame, this );
			document.addEventListener( "keydown", this.hKeyDown, this );
			document.addEventListener( "keyup", this.hKeyUp, this );
		},

		/**
		*	When Images are loaded, create game objects
		*
		*	@method bindEvents
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
				startAnimation: "enemyLookLeft"
			};
			
			// add to stage
			stage.addChild( enemy.o );
			stage.addChild( player.o );
						
			// Load New Game
			this.resetGame();
		},

		/**
		*	Resets Game stage
		*
		*	@method hRenderGame
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
		},

		/**
		*	Updates Game on each Tick and renders updated UI
		*
		*	@method hRenderGame
		*/
		hRenderGame: function( e ){
			var delta = e.delta;
			
			var playerRelPos;
			
			/**
			*	Player's movement based on Arrow keys
			*/
			switch( pressedKey ){
				case keyCodes.left:
					player.o.x -= Math.round( speed / delta );
				break;

				case keyCodes.up:
					player.o.y -= Math.round( speed / delta );
				break;

				case keyCodes.right:
					player.o.x += Math.round( speed / delta );
				break;

				case keyCodes.down:
					player.o.y += Math.round( speed / delta );
				break;				
			}
			
			/**
			*	Enemy Eye movement based on Player's movement
			*/
			// Player's Horizontal Movement
			if ( pressedKey === keyCodes.left || pressedKey ===  keyCodes.right ){
				if ( player.o.x <= enemy.o.x ){
					enemy.o.gotoAndStop( enemy.look.left );
				}else{
					enemy.o.gotoAndStop( enemy.look.right );
				}
			}
			
			// Player's Verticle  Movement
			else if ( pressedKey === keyCodes.up || pressedKey ===  keyCodes.down ){
				if ( player.o.y <= enemy.o.y ){
					enemy.o.gotoAndStop( enemy.look.up );
				}else{
					enemy.o.gotoAndStop( enemy.look.down );
				}
			}
			
			
			/**
			*	Player and Enemy Collision Detection
			*/
			if ( player && enemy ){			
				playerRelPos = player.o.localToLocal( 0, 0, enemy.o );
				
				if ( enemy.o.hitTest( playerRelPos ) ){
				//	this.resetGame();
				}
			}
						
			// update UI
			stage.update();
		},
		
		/**
		*	Init Game
		*
		*	@method init
		*/
		init: function(){
			// Using RAF api over setInterval ( for Performance )
			createjs.Ticker.timingMode = createjs.Ticker.RAF;
			
			this.initData();
			this.bindEvents();
		}
	};
	
	// Start game
	fns.init();
}());