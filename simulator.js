const CANVAS = document.getElementById('simulation');
const CANVAS_CONTEXT = CANVAS.getContext('2d');
const UNIVERSAL_GRAVITATIONAL_CONSTANT = 6.67e-11;
const KM_TO_PIXELS = 1/1e3; //subject to change
const COLLISION_THRESHOLD = 0.85;
const TICKS_PER_SECOND = 25;

var testSession = new main;

// open a window in the sidebar
var openWindow = function(itemName) {
  document.getElementById(itemName).className = 'open'; // add class open to the chosen element
};

// close a window in the sidebar
var closeWindow = function(itemName) {
  document.getElementById(itemName).className = '';     // remove all classes from the chosen element
};

var init = function() {
  // initialise the canvas
  CANVAS.width = window.innerWidth * 0.75; // set the canvas width to 75% screen width
  CANVAS.height = window.innerHeight;      // set the canvas height to 100%

  // initialise the follow object
  document.onmousemove = function(event) {
    event = event || window.event;                                // get the mouse move event
    var elem = document.getElementById('object-undermouse');      // get the mouse under element
    elem.style.left = event.pageX - (elem.offsetWidth/2) + 'px';  // set the absolute left position to be equal to
                                                                  // the mouse's x position minus half the elements
                                                                  // width (as to place in center)
    elem.style.top = event.pageY - (elem.offsetHeight/2) + 'px';  // set the absolute right position similarly
  };

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
    var colour = document.getElementById('object-colour').value;    // get the value for the colour
    var density = document.getElementById('object-material').value; // get the value for the material

    // check for the custom density selected
    if (density === 0) {
      density = document.getElementById('object-material-custom').value;  // get the value for the density
    }

    // create the object
    createFollowObject(radius, colour, density);
  });
};

init();



// create an object to follow the mouse around when the user creates an object
// and give this following object the correct properties
var createFollowObject = function(radius, colour, density) {
  var obj = document.getElementById('object-undermouse'); // the mouse follow object
  obj.style.display = 'block';          // set the visiblilty to show
  obj.style.background = colour;        // set the background colour
  obj.style.width = radius*2 + 'px';    // set the width
  obj.style.height = radius*2 + 'px';   // set the height

  // get when the user places the object on the canvas (only place where the
  // user is able to click the object, without something else being above)
  obj.onclick = function (event) {
    // create the object on the canvas
    var x = event.pageX;
    var y = event.pageY;
    var object = testSession.createObject(density, radius, colour, x, y); // create the new object

    removeFollowObject();   // remove the mouse follow object
  };

  var t = false; // the code should run on the next click if t is true
             // this is needed because the browser calls the below code as it
             // thinks the click of the 'Create Object' button is still going

  // get when the user doesnt place the object on the canvas
  document.getElementById('sidebar').onclick = function() {
    if(t) {
      removeFollowObject(); // remove the mouse follow object
    }
    t = true; // whenever the next time the sidebar is clicked the code in the
              // if statement above should run
  };

  // get when a keyboard button is clicked
  document.onkeydown = function(event) {
    if (event.which === 27) {  // if escape key pressed
      removeFollowObject();   // remove the mouse follow object
    }
  };
};

// remove the follow object and clear it's styles
var removeFollowObject = function() {
  document.getElementById('sidebar').onclick = '';   // remove the event listener for a click on the sidebar
  document.onkeydown = '';// remove the event listening for key presses

  var obj = document.getElementById('object-undermouse');
  obj.style.display = 'none';   // set the visibility to none
  obj.style.width = '0px';      // set the width to 0
  obj.style.height = '0px';     // set the height to 0
  obj.style.background = 'none';// set the background to no background
  obj.onclick = '';             // remove any on click functionality
};

function object (density, radius, color, x, y, id) { // Aidan
    // constants on creation
    this.id = id
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

    this.drawObject = function(xShift, yShift) {
        // given its position on the canvas, draws it centred to that location
        CANVAS_CONTEXT.beginPath();
        CANVAS_CONTEXT.arc(this.x - xShift, this.y - yShift, this.radius, 0, 2 * Math.PI, false);
        CANVAS_CONTEXT.fillStyle = this.color;
        CANVAS_CONTEXT.fill();
        CANVAS_CONTEXT.closePath();

        CANVAS_CONTEXT.beginPath();
        CANVAS_CONTEXT.moveTo(this.x - xShift, this.y - yShift);
        CANVAS_CONTEXT.lineTo(this.x - xShift + this.vx*200, this.y - yShift + this.vy*200);
        CANVAS_CONTEXT.strokeStyle = "red";
        CANVAS_CONTEXT.stroke();
        CANVAS_CONTEXT.closePath();
    };

    this.updatePosition = function(accelX, accelY, timeScale) {
        // given the acceleration of the object for a frame, moves its position
        // update the objects velocity
        this.vx += (accelX*timeScale/TICKS_PER_SECOND + 0.5*accelX*Math.pow((timeScale/TICKS_PER_SECOND), 2));
        this.vy += (accelY*timeScale/TICKS_PER_SECOND + 0.5*accelX*Math.pow((timeScale/TICKS_PER_SECOND), 2));

        // update the objects position
        this.x += this.vx*timeScale/TICKS_PER_SECOND;
        this.y += this.vy*timeScale/TICKS_PER_SECOND;
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
        return this.color; // gets object color
    };

    this.getVelocity = function() {
        return [this.vx, this.vy];
    }

    this.getID = function() {
        return this.id;
    }

    this.setVelocity = function(vx, vy) {
        // gives the object an instantaneous velocity on creation
        return this.vx = vx;
        return this.vy = vy;
    }

};

function calculateDistance(x1, y1, x2, y2) {
  // finds the distance between to points on the grid
  var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  return distance;
};

/*function getAngleBetweenPoints(x1, y1, x2, y2, d) {
  // calculates the angle of point 2 relative to point 1
  var angle = Math.atan((x2-x1)/(y2-y1))*180/Math.PI;
  if (x2 > x1 && y2 > y1) {
    angle += 180;
  } else if (x2 > x1) {
    //console.log(angle);
    angle = 180-angle;
  } else if (y2 > y1) {
    angle = 360-angle;
  }
  return angle%360;
}*/

function getAngleBetweenPoints(x1, y1, x2, y2) {
  var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  angle *= -1;
  return angle;
}

function getVectorOnAxises(x1, y1, x2, y2, magnitude, angle) {
  var acuteAngle = angle%90;
  var xMag = magnitude*Math.cos(acuteAngle/180*Math.PI);
  var yMag = magnitude*Math.sin(acuteAngle/180*Math.PI);
  if (x2 < x1) {
    xMag *= -1;
  }
  if (y2 < y1) {
    yMag *= -1;
  }
  return [xMag, yMag];
}

function calculateGravityAccel(x1, y1, x2, y2, m, d, angle) {
    // finds the acceleration on an object due to another, given its mass and distance away
    if (d != 0) {
        var accel = (UNIVERSAL_GRAVITATIONAL_CONSTANT*m)/d*d;
        var output = getVectorOnAxises(x1, y1, x2, y2, accel, angle);

    } else {
        var output = 0;
    }
    return output;
}

/*function calculateGravityAccel(x1, y1, x2, y2, m, d, angle) {
    // finds the acceleration on an object due to another, given its mass and distance away
    if (x2-x1 != 0) {
        var accelX = (UNIVERSAL_GRAVITATIONAL_CONSTANT*m)/Math.pow(x2-x1, 2);
    } else {
        var accelX = 0;
    }
    if (y2-y1 != 0) {
        var accelY = (UNIVERSAL_GRAVITATIONAL_CONSTANT*m)/Math.pow(x1-x2, 2);
    } else {
        var accelY = 0;
    }
    console.log(accelX, accelY)
    return [accelX, accelY];
}*/


function main(){
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
        var distance = 0;
        var angle = 0;
        for (var i = 0; i < this.objects.length; i++) {
          for (var p = 0; p < this.objects.length; p++) {
            if (this.objects[i].getID() != this.objects[p].getID()) {
              // get angle
              angle = getAngleBetweenPoints(this.objects[i].getX(), this.objects[i].getY(),
                this.objects[p].getX(), this.objects[p].getY());
              // get distance
              distance = calculateDistance(this.objects[i].getX(), this.objects[i].getY(),
                this.objects[p].getX(), this.objects[p].getY());
              // get acceleration
            }
          }
          // update positions
        }
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


/*testSession.createObject(100, 200, "#000000", 500, 500);
testSession.createObject(500, 100, "#FFFFFF", 100, 100);
testSession.createObject(20, 50, "#FF3", 800, 800);*/


var sessionInterval =  window.setInterval(function(){testSession.update()}, 1000/TICKS_PER_SECOND);

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