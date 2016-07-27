const canvas = document.getElementById('simulation');
const canvasContext = canvas.getContext('2d');

const UNIVERSAL_GRAVITATIONAL_CONSTANT = 6.67e-11;
const KM_TO_PIXELS = 1/1e3; //subject to change
const COLLISION_THRESHOLD = 0.85;

var openTutorialWindow = function() {
  document.getElementById('tutorial').className = 'open';
};


// open a window in the sidebar
var openWindow = function(itemName) {
  document.getElementById(itemName).className = 'open';
};

// close a window in the sidebar
var closeWindow = function(itemName) {
  document.getElementById(itemName).className = '';
};

var init = function() {
  // initialise the canvas
  canvas.width = window.innerWidth * 0.75; // set the canvas width to 75% screen width
  canvas.height = window.innerHeight;      // set the canvas height to 100%

  // initialise the follow object
  document.onmousemove = function(event) {
    event = event || window.event;
    var elem = document.getElementById('object-undermouse');
    elem.style.left = event.pageX - (elem.offsetWidth/2) + 'px';
    elem.style.top = event.pageY - (elem.offsetHeight/2) + 'px';
  };

  // open the starting window for the sidebar
  openWindow('start');

  // tutorial button
  document.getElementById('str-btn-tutorial').addEventListener('click', function() {
    document.getElementById('start').className = '';
    openWindow('tutorial');
  });

  // object creation button
  document.getElementById('str-btn-object').addEventListener('click', function() {
    document.getElementById('start').className = '';
    openWindow('object-creation');
  });

  // space settings button
  document.getElementById('str-btn-settings').addEventListener('click', function() {
    document.getElementById('start').className = '';
    openWindow('settings');
  });

  // load state button
  document.getElementById('str-btn-loadstate').addEventListener('click', function() {
    document.getElementById('start').className = '';
    openWindow('load-state');
  });

  // tutorial --> start button
  document.getElementById('sidebar-return-tutorial').addEventListener('click', function() {
    openWindow('start');
    closeWindow('tutorial');
  });

  // object creation --> start button
  document.getElementById('sidebar-return-objectcreation').addEventListener('click', function() {
    openWindow('start');
    closeWindow('object-creation');
  });

  // space settings --> start button
  document.getElementById('sidebar-return-settings').addEventListener('click', function() {
    openWindow('start');
    closeWindow('settings');
  });

  // load state --> start button
  document.getElementById('sidebar-return-loadstate').addEventListener('click', function() {
    openWindow('start');
    closeWindow('load-state');
  });

  // object creation material custom toggle
  document.getElementById('object-material').onchange = function () {
    var elem = document.getElementById('object-material');
    if (elem.value == 0) { // select HTML object has custom selected (with a value of 0)
      document.getElementById('object-material-custom').className = 'shown'; // show the custom text input
    } else {
      document.getElementById('object-material-custom').className = ''; // hide the custom text input
    }
  }

  // create object button
  document.getElementById('object-create').addEventListener('click', function() {
    var radius = document.getElementById('object-radius').value;
    var colour = document.getElementById('object-colour').value;
    createFollowObject(radius, colour);
  });
};

init();




var createFollowObject = function(radius, colour) {
  var obj = document.getElementById('object-undermouse');
  obj.style.display = 'block';
  obj.style.background = colour;
  obj.style.width = radius*2 + 'px';
  obj.style.height = radius*2 + 'px';
  obj.onclick = function (event) {
    removeFollowObject();

    // create the object on the canvas
    var centerX = event.pageX;
    var centerY = event.pageY;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    canvasContext.fillStyle = colour;
    canvasContext.fill();
  };
}

var removeFollowObject = function() {
  var obj = document.getElementById('object-undermouse');
  obj.style.display = 'none';
  obj.style.width = '0px';
  obj.style.height = '0px';
  obj.style.background = 'none';
  obj.onclick = '';
}


// example circle

// var canvas = document.getElementById('simulation');
// var context = canvas.getContext('2d');
// var centerX = canvas.width / 2;
// var centerY = canvas.height / 2;
// var radius = 70;
//
// context.beginPath();
// context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
// context.fillStyle = 'yellow';
// context.fill();
// context.lineWidth = 5;
// context.strokeStyle = '#f1c40f';
// context.stroke();


function object (density, radius, color, x, y) { // Aidan
    // constants on creation
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.density = density;
    this.volume = (4/3) * Math.PI * Math.pow(this.radius, 3);
    this.mass = this.density * this.volume;
    this.color = color;

    // variables that change as the planet moves
    this.vx = 0;
    this.vy = 0;

    this.drawObject = function(x,y) {
        // given its position on the canvas, draws it centred to that location
        canvasContext.beginPath();
        canvasContext.arc(x, y, this.radius, 0, 2 * Math.PI, false);
        canvasContext.fillStyle = this.colour;
        canvasContext.fill();
    };

    this.updatePosition = function(accelX, accelY) {
        // given the acceleration of the object for a frame, moves its position
        // update the objects velocity
        this.vx += accelX;
        this.vy += accelY;

        // update the objects position
        this.x += vx;
        this.y += vy;
    };

    // getters for all parts of the class needed elsewhere
    this.getX = function() {
        return this.x;
    };

    this.getY = function() {
        return this.y;
    };

    this.getMass = function() {
        return this.mass;
    };

    this.getVolume = function() {
        this.volume;
    };

    this.getDensity = function() {
        this.density
    };

    this.getX = function() {
        this.radius;
    };

    this.getColor = function() {
        this.color;
    };

    this.setVelocity = function(vx, vy) {
        // gives the object an instantaneous velocity on creation
        this.vx = vx;
        this.vy = vy;
    }
};

function calculateDistance(x1, y1, x2, y2) {
    var distance = Math.root((x1 - x2)^2 + (y1 - y1)^2);
    return distance;
};

function main(){
    this.objects = [];
    this.magnificationMultiplyer = 1.0;
    this.currentCoordinate = 1;

    this.createObject = function(density, radius, color, x, y){
        this.objects.push(planet(density, radius, color, x, y));
    };

    this.update = function(){
        for(var i = 0; i < this.object.length; i++){

        };

    };

    this.hitDetect = function(object1, object2){
        var hasHit = false;
        var x1 = object1.getX();
        var y1 = object1.getY();
        var r1 = object1.getRadius();
        var x2 = object2.getX();
        var y2 = object2.getY();
        var r2 = object2.getRadius();
        var distance = calculateDistance(x1, y1, x2, y2); // get the distance between planets
        if (distance >= COLLISION_THRESHOLD*(r1 + r2)){ // check if the planets are close enough for a collision
            hasHit = true;
        };
        return hasHit;
    };

};
