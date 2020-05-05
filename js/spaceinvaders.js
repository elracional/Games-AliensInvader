

//  Constantes para identificar las teclas
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_SPACE = 32;
var Filas=9;
var Columas=4;

//  Se crea una funcion que inicaliza el juego y sus ocnfiguracion inicial
function Game() {

    //  establecen los parametros iniciales del juego
    this.config = {
        bombRate: 0.1, //cantidad de bombas que se lanzan
        bombMinVelocity: 60,//velocidades de las bombas
        bombMaxVelocity: 60,
        invaderInitialVelocity: 30,//velocidad a la que se mueven los aliens
        invaderAcceleration: 0,
        invaderDropDistance: 20,
        rocketVelocity: 120,//velovidad de los metioritos
        rocketMaxFireRate: 2,
        gameWidth: 600,
        gameHeight: 300,
        fps: 50,
        debugMode: false,
        invaderRanks: 3,//columnas de aliens
        invaderFiles: 8,//filas de aliens
        shipSpeed: 140,//velocidad de disparo
        levelDifficultyMultiplier: 0.4,//por cada nivel se incrementara en un 0.4
        pointsPerInvader: 5,//puntos por matar
        limitLevelIncrease: 25,
        
    };

    

    //  los parametos iniciales del juego.
    this.lives = 5;//cantidad de vidas
    this.width = 0;
    this.height = 0;
    this.gameBounds = {left: 0, top: 0, right: 0, bottom: 0};
    this.intervalId = 0;
    this.score = 0;
    this.level = 1;

    
    this.stateStack = [];

    
    this.pressedKeys = {};
    this.gameCanvas =  null;

  
    this.sounds = null;

    //  variable que guardara la posision anterior
    this.previousX = 0;
}

//  Se incializa el juevo con canvas
Game.prototype.initialise = function(gameCanvas) {

    //  se establece el jeugo
    this.gameCanvas = gameCanvas;

    //  se define el tamaño
    this.width = gameCanvas.width;
    this.height = gameCanvas.height;

    //  Se establecen los limites del juego.
    this.gameBounds = {
        left: gameCanvas.width / 2 - this.config.gameWidth / 2,
        right: gameCanvas.width / 2 + this.config.gameWidth / 2,
        top: gameCanvas.height / 2 - this.config.gameHeight / 2,
        bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
    };
};

Game.prototype.moveToState = function(state) {
 
   //  Si nos encontramos en un estodo, lo dejamos
   if(this.currentState() && this.currentState().leave) {
     this.currentState().leave(game);
     this.stateStack.pop();
   }
   
   //Si hay una función enter para el nuevo estado, llámalo.
   if(state.enter) {
     state.enter(game);
   }
 
   //   Establecer el estado actual.
   this.stateStack.pop();
   this.stateStack.push(state);
 };

//  Inicio del juego.
Game.prototype.start = function() {

    //  Se va a la bienvenida del juego
    this.moveToState(new WelcomeState());

    //  Se inicializan las variables del jeugo.
    this.lives = 5;
    this.config.debugMode = /debug=true/.test(window.location.href);

    //  Comineza el loop del juego.
    var game = this;
    this.intervalId = setInterval(function () { GameLoop(game);}, 1000 / this.config.fps);

};

//  Retorna el estado actual del juego.
Game.prototype.currentState = function() {
    return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
};

//  Silencia o se habilita el sonido del juego
Game.prototype.mute = function(mute) {

    //  Si nos han dicho que enmudezcamos, mudo.
    if(mute === true) {
        this.sounds.mute = true;
    } else if (mute === false) {
        this.sounds.mute = false;
    } else {
        // Activar silencio
        this.sounds.mute = this.sounds.mute ? false : true;
    }
};

//  El loop principal del juego.
function GameLoop(game) {
    var currentState = game.currentState();
    if(currentState) {

        
        // Delta t es el tiempo para  actualizar / dibujar.
        var dt = 1 / game.config.fps;

        // Obtener el contexto del dibujo.
        var ctx = this.gameCanvas.getContext("2d");
        
        
        // Se actualiza si tenemos una función de actualización. También dibujar
        // si tenemos una función de dibujo.
        if(currentState.update) {
            currentState.update(game, dt);
        }
        if(currentState.draw) {
            currentState.draw(game, dt, ctx);
        }
    }
}

Game.prototype.pushState = function(state) {

    
        // se llamma si hay una función enter para el nuevo estado
    if(state.enter) {
        state.enter(game);
    }
    //  se establece el estado actual.
    this.stateStack.push(state);
};

Game.prototype.popState = function() {

   
// Salir y eliminar el estado
    if(this.currentState()) {
        if(this.currentState().leave) {
            this.currentState().leave(game);
        }

        //  se establece el estado actual.
        this.stateStack.pop();
    }
};

//  Funcion stop que termina con el juego.
Game.prototype.stop = function Stop() {
    clearInterval(this.intervalId);
};

//  Informe al juego que se presiono la tecla
Game.prototype.keyDown = function(keyCode) {
    this.pressedKeys[keyCode] = true;
    //  Se actualiza el estado
    if(this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, keyCode);
    }
};
//se inica el juego al precionar barra espaciadora
Game.prototype.touchstart = function(s) {
    if(this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, KEY_SPACE);
    }    
};

Game.prototype.touchend = function(s) {
    delete this.pressedKeys[KEY_RIGHT];
    delete this.pressedKeys[KEY_LEFT];
};
//funcion que mueve a la derecha o a la izquierda
Game.prototype.touchmove = function(e) {
	var currentX = e.changedTouches[0].pageX;
    if (this.previousX > 0) {
        if (currentX > this.previousX) {
            delete this.pressedKeys[KEY_LEFT];
            this.pressedKeys[KEY_RIGHT] = true;
        } else {
            delete this.pressedKeys[KEY_RIGHT];
            this.pressedKeys[KEY_LEFT] = true;
        }
    }
    this.previousX = currentX;
};

// informa al juego cuando la tecla se solto.
Game.prototype.keyUp = function(keyCode) {
    delete this.pressedKeys[keyCode];
    // se actualiza el juego
    if(this.currentState() && this.currentState().keyUp) {
        this.currentState().keyUp(this, keyCode);
    }
};

function WelcomeState() {

}

WelcomeState.prototype.enter = function(game) {

    // Se cargan los sonidos del juego.
    game.sounds = new Sounds();
    game.sounds.init();
    game.sounds.loadSound('shoot', 'sounds/shoot.wav');
    game.sounds.loadSound('bang', 'sounds/bang.wav');
    game.sounds.loadSound('explosion', 'sounds/explosion.wav');
};

WelcomeState.prototype.update = function (game, dt) {


};

WelcomeState.prototype.draw = function(game, dt, ctx) {

    //  Se crea el mensaje de bienvenida.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="30px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle"; 
    ctx.textAlign="center"; 
    ctx.fillText("Aliens Invasores", game.width / 2, game.height/2 - 40); 
    ctx.font="16px Arial";

    ctx.fillText("Presiona la 'Barra Espaciadora' para comenzar.", game.width / 2, game.height/2); 
};

WelcomeState.prototype.keyDown = function(game, keyCode) {
    if(keyCode == KEY_SPACE) {
        //  Niveles del juego.
        game.level = 1;
        game.score = 0;
        game.lives = 5;
        game.moveToState(new LevelIntroState(game.level));
    }
};

function GameOverState() {

}

function    WonState() {

}

GameOverState.prototype.update = function(game, dt) {

};

GameOverState.prototype.draw = function(game, dt, ctx) {

    //  Mensaje cuabdo de pierde
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="30px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="center"; 
    ctx.textAlign="center"; 
    ctx.fillText("Game Over!", game.width / 2, game.height/2 - 40); 
    ctx.font="16px Arial";
    ctx.fillText("Puntuacion: " + game.score + " llegaste al nievel:  " + game.level, game.width / 2, game.height/2);
    ctx.font="16px Arial";
    ctx.fillText("Presiona la 'Barra Espaciadora' para comenzar otra vez.", game.width / 2, game.height/2 + 40);   
};

GameOverState.prototype.keyDown = function(game, keyCode) {
    if(keyCode == KEY_SPACE) {
        //  Niveles del juego
        game.lives = 5;
        game.score = 0;
        game.level = 1;
        game.moveToState(new LevelIntroState(1));
    }
};

//  Se Crea un PlayState con la configuración del juego y el nivel en el que se encuentra
function PlayState(config, level) {
    this.config = config;
    this.level = level;

    //  Estado del juego.
    this.invaderCurrentVelocity =  15;//velocidad actual de los aliens
    this.invaderCurrentDropDistance =  0;
    this.invadersAreDropping =  false;
    this.lastRocketTime = null;

    //  Entorno del juego.
    this.ship = null;
    this.invaders = [];
    this.rockets = [];
    this.bombs = [];
}

PlayState.prototype.enter = function(game) {

    //  Se crea la nave(posicion en la pantalla).
    this.ship = new Ship(game.width / 2, game.gameBounds.bottom);

    //  Configuracion del estado inicial.
    this.invaderCurrentVelocity =  12;
    this.invaderCurrentDropDistance =  0;
    this.invadersAreDropping =  false;

    //  Establece la velocidad de la nave para este nivel, así como los parámetros del alien.
    var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;//se multiplica la dificultad del nivel
    var limitLevel = (this.level < this.config.limitLevelIncrease ? this.level : this.config.limitLevelIncrease);
    this.shipSpeed = this.config.shipSpeed;//se establece la velocidad de la nave
    this.invaderInitialVelocity = this.config.invaderInitialVelocity + 1.5 * (levelMultiplier * this.config.invaderInitialVelocity);//la velociddad de los aliend depende de la inicial y el parametro de dificultas
    this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);//la canridad de bombas al igual incrementaran
    this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
    this.bombMaxVelocity = this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity);
    this.rocketMaxFireRate = this.config.rocketMaxFireRate + 0.4 * limitLevel;

    //  Se crean los aliens
    var ranks = this.config.invaderRanks + 0.1 * limitLevel;
    var files = this.config.invaderFiles + 0.2 * limitLevel;
    var invaders = [];
    for(var rank = 0; rank < ranks; rank++){
        for(var file = 0; file < files; file++) {
            invaders.push(new Invader(
                (game.width / 2) + ((files/2 - file) * 200 / files),
                (game.gameBounds.top + rank * 20),
                rank, file, 'Invader'));
        }
    }
    this.invaders = invaders;
    this.invaderCurrentVelocity = this.invaderInitialVelocity;
    this.invaderVelocity = {x: -this.invaderInitialVelocity, y:0};
    this.invaderNextVelocity = null;
};

PlayState.prototype.update = function(game, dt) {
    
    
    if(game.pressedKeys[KEY_LEFT]) {
        this.ship.x -= this.shipSpeed * dt;
    }
    if(game.pressedKeys[KEY_RIGHT]) {
        this.ship.x += this.shipSpeed * dt;
    }
    if(game.pressedKeys[KEY_SPACE]) {
        this.fireRocket();
    }

    //  Que la nave no se salga del canvas.
    if(this.ship.x < game.gameBounds.left) {
        this.ship.x = game.gameBounds.left;
    }
    if(this.ship.x > game.gameBounds.right) {
        this.ship.x = game.gameBounds.right;
    }

    //Bombas
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        bomb.y += dt * bomb.velocity;

        
// Si el cohete se ha salido de la pantalla, retíralo.
        if(bomb.y > this.height) {
            this.bombs.splice(i--, 1);
        }
    }

    //  Disparos
    for(i=0; i<this.rockets.length; i++) {
        var rocket = this.rockets[i];
        rocket.y -= dt * rocket.velocity;

        //  Se retira si sale de la pantalla
        if(rocket.y < 0) {
            this.rockets.splice(i--, 1);
        }
    }

    //  Movimientos de los alines.
    var hitLeft = false, hitRight = false, hitBottom = false;
    for(i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        var newx = invader.x + this.invaderVelocity.x * dt;
        var newy = invader.y + this.invaderVelocity.y * dt;
        if(hitLeft == false && newx < game.gameBounds.left) {
            hitLeft = true;
        }
        else if(hitRight == false && newx > game.gameBounds.right) {
            hitRight = true;
        }
        else if(hitBottom == false && newy > game.gameBounds.bottom) {
            hitBottom = true;
        }

        if(!hitLeft && !hitRight && !hitBottom) {
            invader.x = newx;
            invader.y = newy;
        }
    }

    //  Se actualizan las velocidades de los aliens
    if(this.invadersAreDropping) {
        this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
        if(this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
            this.invadersAreDropping = false;
            this.invaderVelocity = this.invaderNextVelocity;
            this.invaderCurrentDropDistance = 0;
        }
    }
    // Si hemos dado con la izquierda, ve a la derecha.
    if(hitLeft) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {x: this.invaderCurrentVelocity , y:0};
    }
   
    // Si hemos dado con la derecha, ve a la izquierda.
    if(hitRight) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {x: -this.invaderCurrentVelocity , y:0};
    }
    //  Si los aliens llegan a la nave se acaba el juego
    if(hitBottom) {
        game.lives = 0;
    }
    
    //  Si colision un disparo de la nave con in invasor.
    for(i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        var bang = false;

        for(var j=0; j<this.rockets.length; j++){
            var rocket = this.rockets[j];

            if(rocket.x >= (invader.x - invader.width/2) && rocket.x <= (invader.x + invader.width/2) &&
                rocket.y >= (invader.y - invader.height/2) && rocket.y <= (invader.y + invader.height/2)) {
                
                
                this.rockets.splice(j--, 1);
                bang = true;

                game.score += this.config.pointsPerInvader;
                if (game.score>500 && game.lives==5){// si logra mas de 500 puntos los puntos valen mas
                  game.score += this.config.pointsPerInvader+5;  
                }else if (game.lives<4) {
                  game.score += this.config.pointsPerInvader-8; // pero si tiene menos de 4 vidas sumara menos puntos
                }
                break;
            }
        }
        if(bang) {
            this.invaders.splice(i--, 1);
            game.sounds.playSound('bang');
        }
    }

    
// Encuentra a todos los invasores de primera fila.
    var frontRankInvaders = {};
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
       
// Si no tenemos invasor para el archivo del juego, o el invasor
        // para el archivo del juego está más atrás, establece el frente
        // clasifica al invasor en el primer juego.
        if(!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank) {
            frontRankInvaders[invader.file] = invader;
        }
    }

    
// Dale a cada invasor de primera línea la oportunidad de lanzar una bomba.
    for(var i=0; i<this.config.invaderFiles; i++) {
        var invader = frontRankInvaders[i];
        if(!invader) continue;
        var chance = this.bombRate * dt;
        if(chance > Math.random()) {
            //  Se dispara
            this.bombs.push(new Bomb(invader.x, invader.y + invader.height / 2, 
                this.bombMinVelocity + Math.random()*(this.bombMaxVelocity - this.bombMinVelocity)));
        }
    }

    //  Si colisionan las bombas con las naves
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        if(bomb.x >= (this.ship.x - this.ship.width/2) && bomb.x <= (this.ship.x + this.ship.width/2) &&
                bomb.y >= (this.ship.y - this.ship.height/2) && bomb.y <= (this.ship.y + this.ship.height/2)) {
            this.bombs.splice(i--, 1);
            game.lives--;
            game.sounds.playSound('explosion');
        }
                
    }

    //  Las colisiondes de las naves y los aliens
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        if((invader.x + invader.width/2) > (this.ship.x - this.ship.width/2) && 
            (invader.x - invader.width/2) < (this.ship.x + this.ship.width/2) &&
            (invader.y + invader.height/2) > (this.ship.y - this.ship.height/2) &&
            (invader.y - invader.height/2) < (this.ship.y + this.ship.height/2)) {
            //  muerte por colison
            game.lives = 0;
            game.sounds.playSound('explosion');
        }
    }

    //  Si se pierde
    var contador=0;
    if(game.lives <= 0) {
        game.moveToState(new GameOverState());
    }

    //  Si se gana
    var puntuacion_total=(((Filas*Columas)*5)*game.level);
    
    if(this.invaders.length === 0 ) {
        console.log(puntuacion_total)
        console.log(game.score)
        
        if(game.score>=puntuacion_total){
        game.level += 1;
        
        game.moveToState(new LevelIntroState(game.level));
    }else{
         contador=contador+1;
        //  Mensaje cuando le faltan puntos
        alert("No obtuviste la puntuacion necesaria, Intenta nuevamente");
        
        game.moveToState(new LevelIntroState(game.level));


        if(contador==2){
            game.moveToState(new GameOverState());
        }
    }
}



    if(game.level ==10 || game.score==2000 ){
          game.moveToState(new WonState());
    }
};

PlayState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    
    //  Se dibuja la nave.
     let imgNave = new Image();
    imgNave.src = 'img/player.png';
    ctx.drawImage(imgNave,this.ship.x - (this.ship.width / 2), this.ship.y - (this.ship.height / 2), this.ship.width, this.ship.height);

    //  Se dibujam los aliens.
    let imgInvader = new Image();
    imgInvader.src = 'img/invader.png';

    
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
     
    ctx.drawImage(imgInvader, invader.x - invader.width/2, invader.y - invader.height/2, invader.width, invader.height);

        
        
    }

    //  Se dibujan las bombas.
    let imgEBullet = new Image();
    imgEBullet.src = 'img/enemy-bullet.png';
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        ctx.drawImage(imgEBullet,bomb.x - 2, bomb.y - 2, 4, 4);
    }

    //  DSe crean las disparos.
    let imgBullet = new Image();
    imgBullet.src = 'img/bullet.png';
    for(var i=0; i<this.rockets.length; i++) {
        var rocket = this.rockets[i];
            ctx.drawImage(imgBullet,rocket.x, rocket.y - 2, 1, 4);
    }

    //  Se escrbe las puntuaciones y niveles.
    var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom) / 2) + 14/2;
    ctx.font="17px Arial";
    ctx.fillStyle = '#ffffff';
    var info = "Vidas: " + game.lives;
    ctx.textAlign = "left";
    ctx.fillText(info, game.gameBounds.left, textYpos);
    info = "Puntuacion: " + game.score + ", Nivel: " + game.level;
    ctx.textAlign = "right";
    ctx.fillText(info, game.gameBounds.right, textYpos);

    //  If we're in debug mode, draw bounds.
    if(this.config.debugMode) {
        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(0,0,game.width, game.height);
        ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
            game.gameBounds.right - game.gameBounds.left,
            game.gameBounds.bottom - game.gameBounds.top);
    }

};

PlayState.prototype.keyDown = function(game, keyCode) {

    if(keyCode == KEY_SPACE) {
        //  Fire!
        this.fireRocket();
    }
    if(keyCode == 80) {
        //  Push the pause state.
        game.pushState(new PauseState());
    }
};

PlayState.prototype.keyUp = function(game, keyCode) {

};

PlayState.prototype.fireRocket = function() {
    // Si no tenemos el último tiempo de cohete, o el último tiempo de cohete
    // es más antiguo que la velocidad máxima del cohete, podemos disparar.
    if(this.lastRocketTime === null || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / this.rocketMaxFireRate))
    {   
        //  se agrega a rocket.
        this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
        this.lastRocketTime = (new Date()).valueOf();

        //  se laza el sonido 'shoot' .
        game.sounds.playSound('shoot');
    }
};

function PauseState() {

}

PauseState.prototype.keyDown = function(game, keyCode) {

    if(keyCode == 80) {
        //  Pop the pause state.
        game.popState();
    }
};

PauseState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="14px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    ctx.fillText("Pausado", game.width / 2, game.height/2);
    return;
};

WonState.prototype.draw = function(game, dt, ctx) {

     //  Mensaje cuabdo de pierde
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="30px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="center"; 
    ctx.textAlign="center"; 
    ctx.fillText("Ganaste !", game.width / 2, game.height/2 - 40); 
    ctx.font="16px Arial";
    ctx.fillText("Puntuacion: " + game.score + " llegaste al nievel:  " + game.level, game.width / 2, game.height/2);
    ctx.font="16px Arial";
    ctx.fillText("Presiona la 'Barra Espaciadora' para comenzar otra vez.", game.width / 2, game.height/2 + 40);   
};

/*  
    Level Intro State

    The Level Intro state shows a 'Level X' message and
    a countdown for the level.
*/
function LevelIntroState(level) {
    this.level = level;
    this.countdownMessage = "3";
}
//cuanta regreriva
LevelIntroState.prototype.update = function(game, dt) {

    //  Se actualiza la cuenta regresiva
    if(this.countdown === undefined) {
        this.countdown = 3; // inicia desde 3 segundos
    }
    this.countdown -= dt;

    if(this.countdown < 2) { 
        this.countdownMessage = "2"; 
    }
    if(this.countdown < 1) { 
        this.countdownMessage = "1"; 
    } 
    if(this.countdown <= 0) {
        //  Se va al siguiente nivel
        game.moveToState(new PlayState(game.config, this.level));
    }

};
//Introduciion antes del nivel
LevelIntroState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="36px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle"; 
    ctx.textAlign="center"; 
    ctx.fillText("Nivel " + this.level, game.width / 2, game.height/2);
    ctx.font="24px Arial";
    ctx.fillText("Comienza en " + this.countdownMessage, game.width / 2, game.height/2 + 36);      
    return;
};


/*
 
  Ship

  La nave y su posicion

*/
function Ship(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 23;
}

/*
    Rocket

    
     Lanzados por la nave, tienen una posición, velocidad y estado.

    */
function Rocket(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}

/*
    Bomb

    Lanzados por los aliens, tienen posición, velocidad.

*/
function Bomb(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}
 
/*
    Invader 

    Se establace el tamaño y la posicion 
*/

function Invader(x, y, rank, file, type) {
    this.x = x;
    this.y = y;
    this.rank = rank;
    this.file = file;
    this.type = type;
    this.width = 22;
    this.height = 18;

}

/*
    Game State

    A Game State is simply an update and draw proc.
    When a game is in the state, the update and draw procs are
    called, with a dt value (dt is delta time, i.e. the number)
    of seconds to update or draw).

*/
function GameState(updateProc, drawProc, keyDown, keyUp, enter, leave) {
    this.updateProc = updateProc;
    this.drawProc = drawProc;
    this.keyDown = keyDown;
    this.keyUp = keyUp;
    this.enter = enter;
    this.leave = leave;
}

/*

    Sounds

    The sounds class is used to asynchronously load sounds and allow
    them to be played.

*/
function Sounds() {

    //  The audio context.
    this.audioContext = null;

    //  The actual set of loaded sounds.
    this.sounds = {};
}

Sounds.prototype.init = function() {

    //  Create the audio context, paying attention to webkit browsers.
    context = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new context();
    this.mute = false;
};

Sounds.prototype.loadSound = function(name, url) {

    //  Reference to ourselves for closures.
    var self = this;

    //  Create an entry in the sounds object.
    this.sounds[name] = null;

    //  Create an asynchronous request for the sound.
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = 'arraybuffer';
    req.onload = function() {
        self.audioContext.decodeAudioData(req.response, function(buffer) {
            self.sounds[name] = {buffer: buffer};
        });
    };
    try {
      req.send();
    } catch(e) {
      console.log("An exception occured getting sound the sound " + name + " this might be " +
         "because the page is running from the file system, not a webserver.");
      console.log(e);
    }
};

Sounds.prototype.playSound = function(name) {

    //  If we've not got the sound, don't bother playing it.
    if(this.sounds[name] === undefined || this.sounds[name] === null || this.mute === true) {
        return;
    }

    //  Create a sound source, set the buffer, connect to the speakers and
    //  play the sound.
    var source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name].buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
};
