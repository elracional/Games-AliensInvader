/*
	Se crea el espacio 

*/

//	Se crea la clase que se encargara de crear el capo de estrellas
function Starfield() {
	this.fps = 30;//fotogramas por segundo
	this.canvas = null;
	this.width = 0;
	this.width = 0;
	this.minVelocity = 20;
	this.maxVelocity = 40;
	this.stars = 150;//cantidad de estrellas
	this.intervalId = 0;
}

//	funcion principal - inicializa el espacio.
Starfield.prototype.initialise = function(div) {
	var self = this;

	
	this.containerDiv = div;
	self.width = window.innerWidth;
	self.height = window.innerHeight;

	window.onresize = function(event) {
		self.width = window.innerWidth;
		self.height = window.innerHeight;
		self.canvas.width = self.width;
		self.canvas.height = self.height;
		self.draw();
 	}

	//	Secrea el canvas que se invoca en el html
	var canvas = document.createElement('canvas');
	div.appendChild(canvas);
	this.canvas = canvas;
	this.canvas.width = this.width;
	this.canvas.height = this.height;
};

Starfield.prototype.start = function() {

	//	Se crean las estrellas
	var stars = [];
	for(var i=0; i<this.stars; i++) {
		stars[i] = new Star(Math.random()*this.width, Math.random()*this.height, Math.random()*3+1,
		 (Math.random()*(this.maxVelocity - this.minVelocity))+this.minVelocity);
	}
	this.stars = stars;

	var self = this;
	//	Comienza en tiempo 
	this.intervalId = setInterval(function() {
		self.update();
		self.draw();	
	}, 1000 / this.fps);
};

Starfield.prototype.stop = function() {
	clearInterval(this.intervalId);
};

Starfield.prototype.update = function() {
	var dt = 1 / this.fps;

	for(var i=0; i<this.stars.length; i++) {
		var star = this.stars[i];
		star.y += dt * star.velocity;

// Si la estrella se ha movido desde la parte inferior de la pantalla, se crea nuevamente en la parte superior.
		if(star.y > this.height) {
			this.stars[i] = new Star(Math.random()*this.width, 0, Math.random()*3+1, 
		 	(Math.random()*(this.maxVelocity - this.minVelocity))+this.minVelocity);
		}
	}
};

Starfield.prototype.draw = function() {

	
	var ctx = this.canvas.getContext("2d"),
          grd;
      
     
      //Se crea la elipse
      ctx.setTransform(1, 0, 0, 0.7990936555891238, 0, 0);
      
      // Se hace el gradiente
      grd = ctx.createRadialGradient(667.296, 1324.000, 0.000, 662.000, 1324.000, 662.000);
      
      //Se agregan los colores
      grd.addColorStop(0.549, 'rgba(13, 32, 73, 1.000)');
      grd.addColorStop(0.972, 'rgba(13, 16, 40, 1.000)');
      
      //Por ultimo se rellena el gradiente
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 1370.000, 1290.000);

	//	Se dibujan las estrellas
	ctx.fillStyle = '#ffffff';
	for(var i=0; i<this.stars.length;i++) {
		var star = this.stars[i];
		ctx.fillRect(star.x, star.y, star.size, star.size);
	}
};

function Star(x, y, size, velocity) {
	this.x = x;
	this.y = y; 
	this.size = size;
	this.velocity = velocity;
}
