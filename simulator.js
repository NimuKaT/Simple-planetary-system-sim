const CANVAS = document.getElementById('simulation');
const CANVAS_CONTEXT = CANVAS.getContext('2d');
const UNIVERSAL_GRAVITATIONAL_CONSTANT = 6.67e-11;
const KM_TO_PIXELS = 1/1e3; //subject to change
const COLLISION_THRESHOLD = 0.85;
const TICKS_PER_SECOND = 25;
const ORBIT_PATH_LENGTH = 100;
const ORBIT_PATH_WIDTH_INITIAL = 5;
const ORBIT_PATH_WIDTH_DECREMENT = 0.1;
const DEFAULT_LINE_WIDTH = 5;

var session = new Main();



//  ###########################################
//  #              INIT FUNCTION              #
//  #            used to create UI            #
//  ###########################################

// flags for optional draw objects
var showOrbitPath = true;
var showVelocity = true;
var showAcceleration = true;

// open a window in the sidebar
var openWindow = function(itemName) {
  document.getElementById(itemName).className = 'open'; // add class open to the chosen element
};

// close a window in the sidebar
var closeWindow = function(itemName) {
  document.getElementById(itemName).className = '';     // remove all classes from the chosen element
};

// initialise the follow object
var initFollowObject = function() {
  document.onmousemove = function(event) {
    event = event || window.event;                                // get the mouse move event
    var elem = document.getElementById('object-undermouse');      // get the mouse under element
    elem.style.left = event.pageX - (elem.offsetWidth/2) + 'px';  // set the absolute left position to be equal to
                                                                  // the mouse's x position minus half the elements
                                                                  // width (as to place in center)
    elem.style.top = event.pageY - (elem.offsetHeight/2) + 'px';  // set the absolute right position similarly
  };
};

window.onresize = function() {
  CANVAS.width = window.innerWidth * 0.75;
  CANVAS.height = window.innerHeight;

  // need to add something so that it keeps what is in the middle in the same place
};

var init = function() {
  // initialise the canvas
  CANVAS.width = window.innerWidth * 0.75; // set the canvas width to 75% screen width
  CANVAS.height = window.innerHeight;      // set the canvas height to 100%

  // initialise the follow object
  initFollowObject();

  // open the starting window for the sidebar
  openWindow('start');

  // tutorial button
  document.getElementById('str-btn-tutorial').addEventListener('mousedown', function() {
    document.getElementById('start').className = '';
    openWindow('tutorial');
  });

  // object creation button
  document.getElementById('str-btn-object').addEventListener('mousedown', function() {
    document.getElementById('start').className = '';
    openWindow('object-creation');
  });

  // space settings button
  document.getElementById('str-btn-settings').addEventListener('mousedown', function() {
    document.getElementById('start').className = '';
    openWindow('settings');
  });

  // load state button
  document.getElementById('str-btn-loadstate').addEventListener('mousedown', function() {
    document.getElementById('start').className = '';
    openWindow('load-state');
  });

  // tutorial --> start button
  document.getElementById('sidebar-return-tutorial').addEventListener('mousedown', function() {
    openWindow('start');
    closeWindow('tutorial');
  });

  // object creation --> start button
  document.getElementById('sidebar-return-objectcreation').addEventListener('mousedown', function() {
    openWindow('start');
    closeWindow('object-creation');
  });

  // space settings --> start button
  document.getElementById('sidebar-return-settings').addEventListener('mousedown', function() {
    openWindow('start');
    closeWindow('settings');
  });

  // load state --> start button
  document.getElementById('sidebar-return-loadstate').addEventListener('mousedown', function() {
    openWindow('start');
    closeWindow('load-state');
  });

  // object creation material custom toggle
  document.getElementById('object-material').onchange = function () {
    var elem = document.getElementById('object-material');
    if (elem.value === "0") { // select HTML object has custom selected (with a value of 0)
      document.getElementById('object-material-custom').className = 'shown'; // show the custom text input
    } else {
      document.getElementById('object-material-custom').className = ''; // hide the custom text input
    }
  };

  // 'create object' button
  document.getElementById('object-create').addEventListener('mouseup', function() {
    var radius = document.getElementById('object-radius').value;    // get the value for the radius
    var color = document.getElementById('object-color').value;    // get the value for the colour
    var density = document.getElementById('object-material').value; // get the value for the material

    // check for the custom density selected
    if (density === "0") {
      density = document.getElementById('object-material-custom').value;  // get the value for the density
    }

    // create the object
    createFollowObject(radius, color, density);
  });
};

init();



//  ###########################################
//  #             OBJECT CREATION             #
//  #    used in the object creation window   #
//  ###########################################

// create an object to follow the mouse around when the user creates an object
// and give this following object the correct properties
var createFollowObject = function(radius, color, density) {
  var obj = document.getElementById('object-undermouse'); // the mouse follow object
  obj.style.display = 'block';          // set the visiblilty to show
  obj.style.background = color;        // set the background colour
  obj.style.width = radius*2 + 'px';    // set the width
  obj.style.height = radius*2 + 'px';   // set the height

  // get when the user places the object on the canvas (only place where the
  // user is able to click the object, without something else being above)
  obj.onclick = function (event) {
    // create the object on the canvas
    var x = event.pageX;
    var y = event.pageY;

    // create the placeholder object
    createPlaceholderObject(radius, color, x, y);

    // create velocity line
    createVelocityLine(x,y);

    // remove the mouse follow object
    clearFollowObject();
    createObjectCancellation();

    var cf = false; // a click flag to determine the second click (velocity click)

    // get the next click event (for the velocity)
    document.onclick = function(event) {
      if (cf) {
        var vx = event.pageX - x; // x-axis length of the velocity
        var vy = event.pageY - y; // y-axis length of the velocity
        vx = vx / 50; // make the velocity not as large
        vy = vy / 50;
        session.createObject(density, radius, color, x, y, vx, vy);
        clearObjectCreation();
      } else { cf = true; }
    };
  };

  createObjectCancellation(true);
};

// allows the user to cancel the object creation
var createObjectCancellation = function(a = false) {
  // 'a' is whether the object is in another click event
  var clickFlag = true;
  if (a) {
    clickFlag = false; // determines whether the user has clicked
                       // needed because this code is still within another event
                       // for a click so the following code would run straight
                       // away rather than on the next click
  }

  // get when the user doesnt place the object on the canvas
  document.getElementById('sidebar').onclick = function() {
    if(clickFlag) {
      clearObjectCreation(); // remove the mouse follow object
    }
    clickFlag = true;
  };

  // get when a keyboard button is clicked
  document.onkeydown = function(event) {
    if (event.which === 27) {  // if escape key pressed
      clearObjectCreation();   // remove the mouse follow object
    }
  };
};

// clear the follow object's styles
var clearFollowObject = function() {
  var obj = document.getElementById('object-undermouse');
  obj.style.display = 'none';   // set the visibility to none
  obj.style.width = '0px';      // set the width to 0
  obj.style.height = '0px';     // set the height to 0
  obj.style.background = 'none';// set the background to no background
  obj.onclick = '';             // remove any on click functionality
};


// remove the follow object and clear it's styles
var clearObjectCreation = function() {
  // remove the event listener for a click on the sidebar
  document.getElementById('sidebar').onclick = '';

  // remove the event listening for key presses
  document.onkeydown = '';

  // remove all on click effects
  document.onclick = '';

  clearFollowObject();        // clear the styles of follow object
  removePlaceholderObject();  // remove the placeholder
  removeVelocityLine();       // remove velocity line
  initFollowObject();         // start follow object again (rather than velocity point)
};

// create placeholder object
var createPlaceholderObject = function(radius, color, x, y) {
  var obj = document.getElementById("object-placeholder");
  obj.style.width = radius*2 + 'px';
  obj.style.height = radius*2 + 'px';
  obj.style.background = color;
  obj.style.left = (x - radius) + 'px';
  obj.style.top = (y - radius) + 'px';
};

// remove placeholder object
var removePlaceholderObject = function() {
  var obj = document.getElementById("object-placeholder");
  obj.style.width = '';
  obj.style.height = '';
  obj.style.background = 'none';
  obj.style.left = '';
  obj.style.top = '';
};

// create velocity line
var createVelocityLine = function(x,y) {
  var obj = document.getElementById("velocity-line");
  obj.style.left = x + 'px';
  obj.style.top = y + 'px';
  var a = 0; // flag needed for below

  document.onmousemove = function(event) {
    if (a === 0) { obj.style.display = 'block'; a++; } // show the velocity line on the first movement
    var mx = event.pageX;
    var my = event.pageY;

    var distance = Math.hypot(mx-x, my-y);
    var angle = Math.atan2(my-y, mx-x) * 180 / Math.PI;

    obj.style.width = distance + 'px';
    obj.style.transform = 'rotate(' + angle + 'deg)';
  };
};

// remove velocity line
var removeVelocityLine = function() {
  var obj = document.getElementById("velocity-line");
  obj.style.display = 'none';
  obj.style.left = '';
  obj.style.top = '';
  obj.style.width = '';
  obj.style.transform = '';
};



//  ###########################################
//  #               LOAD STATE                #
//  #      used in the load state window      #
//  ###########################################








//  ###########################################
//  #              MANAGE SPACE               #
//  #     used in the manage space window     #
//  ###########################################

var updateObjManagement = function (objects) {
  var output = '';
  var colors = [];
  for(var i = 0; i < objects.length; i++) {
    var obj = objects[i];
    colors.push(obj.getColor());

    output += '<div class="settings-object-wrap">';
    output += '<div class="settings-o-color" id="settings-color-'+i+'"></div>';
    output += '<div class="settings-o-information">';
    output += '<span>Density:&nbsp;&nbsp;<span>';
    output +=  + obj.getDensity() + 'kg/m^3</span></span>';
    output += '<span>Radius:&nbsp;&nbsp;<span>';
    output +=  + obj.getRadius() + 'km</span></span>';
    output += '<span>Coordinates:&nbsp;&nbsp;<span>';
    output +=  + obj.getX() + ', ' + obj.getY() + '</span></span>';
    output += '<span>Velocity X:&nbsp;&nbsp;<span>';
    output +=  + obj.getVelocity()[0] + 'km</span></span>';
    output += '<span>Velocity Y:&nbsp;&nbsp;<span>';
    output +=  + obj.getVelocity()[1] + 'km</span></span>';
    output += '<button class="settings-o-delete" id="settings-o-delete-'+i+'">Delete</button>';
    output += '</div></div>';
  }
  document.getElementById('object-management').innerHTML = output;

  for(i = 0; i < objects.length; i++) {
    document.getElementById('settings-color-' + i).style.background = colors[i];
  }

  if (objects.length === 0) {
    document.getElementById('object-management').innerHTML = 'No objects created.';
    document.getElementById('download-objects').className = 'disabled';
    document.getElementById('clear-objects').className = 'disabled';
  } else {
    document.getElementById('download-objects').className = '';
    document.getElementById('clear-objects').className = '';
  }
};

document.getElementById('download-objects').onclick = function() {
  if (document.getElementById('download-objects').className != 'disabled') {
    var text = JSON.stringify(session.objects,null,2);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'objects.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
};

document.getElementById('clear-objects').onclick = function() {
  if (document.getElementById('download-objects').className != 'disabled') {
    session.objects = [];
  }
};






function radiusToVolume(radius) {
  return (4/3) * Math.PI * Math.pow(radius, 3);
}

function volumeToRadius(volume) {
  return Math.cbrt(3*volume/4*Math.PI);
}

function object (density, radius, color, x, y, id) { // Aidan
  // constants on creation
  this.id = id;
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.density = density;
  this.volume = radiusToVolume(radius);
  this.mass = this.density * this.volume;
  this.color = color;

  // variables that change as the planet moves
  this.vx = 0;
  this.vy = 0;
  this.ax = 0;
  this.ay = 0;
  this.orbitPath = [];

  this.drawObject = function(xShift, yShift, accelX, accelY) {
    // given its position on the canvas, draws it centred to that location

    // draw the planet's main body
    CANVAS_CONTEXT.beginPath();
    CANVAS_CONTEXT.arc(this.x - xShift, this.y - yShift, this.radius, 0, 2 * Math.PI, false);
    CANVAS_CONTEXT.fillStyle = this.color;
    CANVAS_CONTEXT.fill();
    CANVAS_CONTEXT.closePath();

    CANVAS_CONTEXT.lineWidth = DEFAULT_LINE_WIDTH;

    if (showVelocity == true) {
      // draw line in the direction of velocity for the current frame
      CANVAS_CONTEXT.beginPath();
      CANVAS_CONTEXT.moveTo(this.x - xShift, this.y - yShift);
      CANVAS_CONTEXT.lineTo(this.x - xShift + this.vx, this.y - yShift + this.vy);
      CANVAS_CONTEXT.strokeStyle = "red";
      CANVAS_CONTEXT.stroke();
      CANVAS_CONTEXT.closePath();
    }


    if (showAcceleration == true) {
      // draw line in the direction of acceleration for the current frame
      CANVAS_CONTEXT.beginPath();
      CANVAS_CONTEXT.moveTo(this.x - xShift, this.y - yShift);
      CANVAS_CONTEXT.lineTo(this.x - xShift + this.ax, this.y - yShift + this.ay);
      CANVAS_CONTEXT.strokeStyle = "blue";
      CANVAS_CONTEXT.stroke();
      CANVAS_CONTEXT.closePath();
    }

    if (showOrbitPath == true) {
      var pathWidth = ORBIT_PATH_WIDTH_INITIAL;
      // draw line showing the orbit path for the past ORBIT_PATH_LENGTH frames
      CANVAS_CONTEXT.beginPath();
      CANVAS_CONTEXT.strokeStyle = "green";
      CANVAS_CONTEXT.moveTo(this.x - xShift, this.y - yShift);
      for (var i = 0; i < this.orbitPath.length; i++) {
        CANVAS_CONTEXT.lineWidth = pathWidth;
        CANVAS_CONTEXT.lineTo(this.orbitPath[i][0] - xShift, this.orbitPath[i][1] - yShift);
        CANVAS_CONTEXT.stroke();
        pathWidth -= ORBIT_PATH_WIDTH_DECREMENT;
      }
      CANVAS_CONTEXT.closePath();
    }

    // reset acceleration for the next frame
    this.ax = 0;
    this.ay = 0;
  };

  this.updatePosition = function(timeScale) {
    // given the acceleration of the object for a frame, moves its position
    this.orbitPath.unshift([this.x, this.y]);
    if (this.orbitPath.length > ORBIT_PATH_LENGTH) {
      this.orbitPath.pop();
    }

    // update coordinates according to s = ut + 1/2at^2
    this.x += (this.vx*timeScale/TICKS_PER_SECOND + 0.5*this.ax*Math.pow((timeScale/TICKS_PER_SECOND), 2));
    this.y += (this.vy*timeScale/TICKS_PER_SECOND + 0.5*this.ay*Math.pow((timeScale/TICKS_PER_SECOND), 2));

    // update the objects velocity according to v = u + at
    this.vx += this.ax*timeScale/TICKS_PER_SECOND;
    this.vy += this.ay*timeScale/TICKS_PER_SECOND;

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
    return this.volume;
  };

  this.getDensity = function() {
    return this.density
  };

  this.getRadius = function() {
    return this.radius;
  };

  this.getColor = function() {
    return this.color; 
  };

  this.getVelocity = function() {
    return [this.vx, this.vy];
  }

  this.getID = function() {
    return this.id;
  }

  this.setVelocity = function(vx, vy) {
    // gives the object an instantaneous velocity
    this.vx = vx;
    this.vy = vy;
  }

  this.setAcceleration = function(ax, ay) {
    // sets the objects acceleration for the next position update
    this.ax = ax;
    this.ay = -ay;
  }
};

// GAB: not sure if this works, but i found an easier way (look up Math.hypot)
function calculateDistance(x1, y1, x2, y2) {
  // finds the distance between to points on the canvas
  var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  return distance;
};

function getAngleBetweenPoints(x1, y1, x2, y2) {
  // gets the angle of point 2 relative to point 1
  var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  angle *= -1; // set the angle to be positive above axis, negative below
  return angle;
}

function calculateGravityAccel(x1, y1, x2, y2, mass, dist, angle) {
  // get the effective acceleration on object 1 due to object 2
  var magnitude = (mass)/Math.pow(dist, 2);
  var yMag = magnitude*Math.sin(angle*Math.PI/180);
  var xMag = magnitude*Math.cos(angle*Math.PI/180);
  return [xMag, yMag];
}


function Main(){
    this.objects = []; // contains all the planet objects
    this.magnificationMultiplyer = 1.0;
    this.currentCoordinate = [0, 0];
    this.idCounter = 0;

    this.createObject = function(density, radius, color, x, y, velocityx=0, velocityy=0){
        this.objects.push(new object(density, radius, color, x, y, this.idCounter)); // adds values into new planet object
        if (velocityx !== 0 || velocityy !== 0){ // sets velocity value if supplied (may use id to find added object when to prevent errors during clustered thread) ) 
          this.objects[this.objects.length-1].setVelocity(velocityx, velocityy);
        }
        console.log("Created object with\nDensity: " + density + "kg/m^3\nRadius: " + radius + "km\nColor: " + color + "\nCoordinates: " + x + ", " + y + "\nID: " + this.idCounter); // debug info
        this.idCounter++;
    };

    this.update = function(){
      if (typeof this.objects !== 'undefined') { //prevents update when array is broken
        var acceleration = [0, 0];
        var angle = 0;
        var distance = 0;
        CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)
        for (var i = 0; i < this.objects.length; i++) {
          acceleration = [0, 0];
          for (var p = 0; p < this.objects.length; p++) {
            if (this.objects[i].getID() != this.objects[p].getID()) {
              var magnitude = 0;
              // get angle
              angle = getAngleBetweenPoints(this.objects[i].getX(), this.objects[i].getY(),
                this.objects[p].getX(), this.objects[p].getY());
              // get distance
              distance = calculateDistance(this.objects[i].getX(), this.objects[i].getY(),
                this.objects[p].getX(), this.objects[p].getY());
              // get acceleration
              acceleration = calculateGravityAccel(
                this.objects[i].getX(), this.objects[i].getY(),
                this.objects[p].getX(), this.objects[p].getY(),
                this.objects[p].getMass(),
                distance, angle);
            }
          }
          this.objects[i].setAcceleration(acceleration[0], acceleration[1]);
        }
        for (var i = 0; i < this.objects.length; i++) {
          this.objects[i].updatePosition(1);
          this.objects[i].drawObject(this.currentCoordinate[0], this.currentCoordinate[1]);
        }
        updateObjManagement(this.objects);
      }
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

        if (distance <= COLLISION_THRESHOLD*(r1 + r2)){ // check if the planets are close enough for a collision
            hasHit = true;
        }
        return hasHit;
    };



    this.mergeObject = function(mergeObjects){
      this.totalMomentum = [0,0];
      this.totalMass = 0;
      this.totalVolume = 0;
      for(i = 0; i > mergeObjects.length; i++){
        var mass = mergeObjects[i].getMass();
        var velocity = mergeObjects[i].getVelocity;
        this.totalMomentum[0] = this.totalMomentum[0] + mass * velocity[0];
        this.totalMomentum[1] = this.totalMomentum[1] + mass * velocity[1];
        this.totalMass = this.totalMass + mass;
        this.totalVolume = this.totalVolume + mergeObjects[i].getVolume();


      }
    };

    this.getObject = function(index){
      return this.objects[index];
    };

    this.getIndexFromID = function(objectID){ // for testing purposes ONLY
      return objectID === this.value;

    };

};


/*session.createObject(100, 200, "#000000", 500, 500);
session.createObject(500, 100, "#FFFFFF", 100, 100);
session.createObject(20, 50, "#FF3", 800, 800);*/

var sessionInterval =  window.setInterval(function(){session.update()}, 1000/TICKS_PER_SECOND);
//session.createObject(1000, 100, "#000000", 400, 400, 0, 0);
//session.createObject(100, 100, "#ffffff", 600, 600, 20, -10);

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// <form onsubmit="download(this['name'].value, this['text'].value)">
//   <input type="text" name="name" value="test.txt">
//   <textarea name="text"></textarea>
//   <input type="submit" value="Download">
// </form>
//http://www.html5rocks.com/en/tutorials/file/dndfiles/ata:text/plain;charset=utf-8,' + encodeURIComponent(text));
