const CANVAS = document.getElementById('simulation');
const CANVAS_CONTEXT = CANVAS.getContext('2d');
const UNIVERSAL_GRAVITATIONAL_CONSTANT = 6.67e-11;
const KM_TO_PIXELS = 1/1e3;
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

// flags and variables for optional draw objects
var showOrbitPath = true;
var showVelocity = false;
var showAcceleration = false;
var canvasXmid = 0;
var canvasYmid = 0;

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

var windowResize = function() {
  CANVAS.width = window.innerWidth * 0.75;
  CANVAS.height = window.innerHeight;

  canvasXmid = CANVAS.width / 2;
  canvasYmid = CANVAS.height / 2;

  // need to add something so that it keeps what is in the middle in the same place
  document.getElementById('up-line').style.left = (canvasXmid - 1) + 'px';
  document.getElementById('down-line').style.top = (canvasYmid - 1) + 'px';
};

window.onresize = function() { windowResize(); };

var init = function() {
  // initialise the canvas
  windowResize();

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
};

init();



//  ###########################################
//  #             OBJECT CREATION             #
//  #    used in the object creation window   #
//  ###########################################

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

// convert number to hexadecimal representation (2 digits e.g. 0 --> 00 and 255 --> ff)
function numberToHex(n) {
  var hex = n.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

// generate a random object
document.getElementById('object-generate-random').addEventListener('mouseup', function() {
  var radius = Math.floor((Math.random() * 190) + 10); // 10 - 200
  var r = Math.floor((Math.random() * 255)); // 0 - 254
  var g = Math.floor((Math.random() * 255)); // 0 - 254
  var b = Math.floor((Math.random() * 255)); // 0 - 254
  var color = '#' + numberToHex(r) + numberToHex(g) + numberToHex(b); // convert them to hex colour
  var density = Math.floor((Math.random() * 100) + 1); // 1 - 100

  // create the object
  createFollowObject(radius, color, density);
});

// create an object to follow the mouse around when the user creates an object
// and give this following object the correct properties
var createFollowObject = function(radius, color, density) {
  var zoomRadius = radius * (1/session.magnificationMultiplier);
  var obj = document.getElementById('object-undermouse'); // the mouse follow object
  obj.style.display = 'block';          // set the visiblilty to show
  obj.style.background = color;         // set the background colour
  obj.style.width = zoomRadius*2 + 'px';    // set the width
  obj.style.height = zoomRadius*2 + 'px';   // set the height

  // create alert
  document.getElementById('object-alert').className = 'shown';

  // create alert removal
  document.getElementById('object-alert').onmouseover = function() {
    var objAlert = document.getElementById('object-alert');
    objAlert.className = '';
    objAlert.mouseover = '';
  };

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
        x = x - canvasXmid;
        y = y - canvasYmid;
        var vx = event.pageX - x - canvasXmid; // x-axis length of the velocity
        var vy = event.pageY - y - canvasYmid; // y-axis length of the velocity

        x = x * session.magnificationMultiplier;
        y = y * session.magnificationMultiplier;
        vx = vx * session.magnificationMultiplier;
        vy = vy * session.magnificationMultiplier;
        session.createObject(density, radius, color, x, y, vx, vy);
        clearObjectCreation();

        // if space is paused
        if(document.getElementById('settings-pause').className === 'disabled') {
          session.refreshScreen();
        }

      } else { cf = true; }
    };
  };

  createObjectCancellation(true);
};

// allows the user to cancel the object creation
var createObjectCancellation = function(a) {
  a = a || false; // set the default value to false
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
    clickFlag = true; // get the second click
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

  // clear alert
  document.getElementById('object-alert').className = '';

  clearFollowObject();        // clear the styles of follow object
  removePlaceholderObject();  // remove the placeholder
  removeVelocityLine();       // remove velocity line
  initFollowObject();         // start follow object again (rather than velocity point)
};

// create placeholder object
var createPlaceholderObject = function(radius, color, x, y) {
  var obj = document.getElementById("object-placeholder");
  radius = radius * (1/ session.magnificationMultiplier);
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

  // when the mouse is moved
  document.onmousemove = function(event) {
    if (a === 0) { obj.style.display = 'block'; a++; } // show the velocity line on the first movement
    var mx = event.pageX; // get the x position of the mouse
    var my = event.pageY; // get the y position of the mouse

    var distance = Math.hypot(mx-x, my-y); // get the length of the velocity line (hypotenuse of an immaginary right angle triangle)
    var angle = Math.atan2(my-y, mx-x) * 180 / Math.PI; // get the angle of incline/decline from right (0)

    obj.style.width = distance + 'px'; // set the width of the object to the distance of the hypotenuse
    obj.style.transform = 'rotate(' + angle + 'deg)'; // rotate the object so that it is at the correct angle
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

document.getElementById('loadstate-file').onchange = function() {
  var files = document.getElementById('loadstate-file').files; // get the files from the input element in the DOM
  if (!files.length) { // if no file selected
    alert('A file was not selected.\nPlease select a file to continue.'); // alert an error to the user
    return;
  }

  var file = files[0]; // get the first file
  var reader = new FileReader(); // get the file reader (JS)

  // when the file is fully downloaded loads the file
  reader.onloadend = function(evt) {
    if (evt.target.readyState === FileReader.DONE) { // file is done loading
      var parsed = JSON.parse(evt.target.result); // turn the JSON into readable information for JS
      var arr = []; // create an empyt array for objects
      for(var x in parsed){ // run through information in the JSON
        arr.push(parsed[x]); // add the information from the JSON into the empty array
      }
      session.objects = []; // reset the screen's objects
      var settings = arr.pop(); // remove the setting information from the JSON (last item in array)
      session.magnificationMultiplier = settings[0]; // get the magnification multiplier from JSON
      session.currTimeScale = settings[1]; // get the time scale from JSON
      session.currentCoordinate = settings[2]; // get the current coordinate of the center from JSON
      session.idCounter = settings[3]; // get the id counter (next object id)

      for (var i = 0; i <= arr.length-1; i++) { // for objects in array
        var obj = arr[i]; // get each object
        session.objects.push(new object(obj.density, obj.radius, obj.color, obj.x, obj.y, obj.id)); // add the object to the session
        session.objects[session.objects.length-1].setVelocity(obj.vx, obj.vy); // give that new object a velocity
      }
      updateObjManagement(session.objects); // update the object management window
    }
  };

  // read the file
  var info = file.slice(0, file.size);
  reader.readAsBinaryString(info);
};




//  ###########################################
//  #              MANAGE SPACE               #
//  #     used in the manage space window     #
//  ###########################################

// velocity line toggle
document.getElementById('settings-velocity-line').onchange = function () {
  showVelocity = document.getElementById('settings-velocity-line').checked;

  // if space is paused
  if(document.getElementById('settings-pause').className === 'disabled') {
    session.refreshScreen();
  }
};

// acceleration line toggle
document.getElementById('settings-acceleration-line').onchange = function () {
  showAcceleration = document.getElementById('settings-acceleration-line').checked;

  // if space is paused
  if(document.getElementById('settings-pause').className === 'disabled') {
    session.refreshScreen();
  }
};

// orbit path toggle
document.getElementById('settings-orbit-path').onchange = function () {
  showOrbitPath = document.getElementById('settings-orbit-path').checked;

  // if space is paused
  if(document.getElementById('settings-pause').className === 'disabled') {
    session.refreshScreen();
  }
};

// change time scale
document.getElementById('settings-time').oninput = function () {
  session.currTimeScale = document.getElementById('settings-time').value;
};

document.getElementById('settings-zoom').oninput = function () {
  session.magnificationMultiplier = document.getElementById('settings-zoom').value;

  // if space is paused
  if(document.getElementById('settings-pause').className === 'disabled') {
    session.refreshScreen();
  }
};

document.getElementById('settings-play').onclick = function() {
  if(this.className === '') {
    session.interval = window.setInterval(function(){session.update();}, 1000/TICKS_PER_SECOND);
    this.className = 'disabled';
    document.getElementById('settings-pause').className = '';
    document.getElementById('space-paused-alert').className = '';
  }
};

document.getElementById('settings-pause').onclick = function() {
  if(this.className === '') {
    clearInterval(session.interval);
    this.className = 'disabled';
    document.getElementById('settings-play').className = '';
    document.getElementById('space-paused-alert').className = 'shown';
  }
};

// update the 'object management' section of the manage space window
var updateObjManagement = function (objects) {
  var objManagement = document.getElementById('object-management');

  if (objects.length === 0) { // if there are no objects on screen
    objManagement.innerHTML = 'No objects created.'; // add text to the window
    document.getElementById('download-objects').className = 'disabled'; // disable the download objects button
    document.getElementById('clear-objects').className = 'disabled';    // disable the delete all objects button
  } else { // there are objects
    document.getElementById('download-objects').className = ''; // enable the download objects button
    document.getElementById('clear-objects').className = '';    // enable the delete all objects button
    if (objManagement.innerHTML === 'No objects created.') { objManagement.innerHTML = '';}

    for(var i = 0; i < objects.length; i++) { // run through each object on the screen
      var obj = objects[i]; // get the specific object on screen
      var id = obj.getID();
      if(document.getElementById('settings-o-'+id)) {
        var vel = obj.getVelocity();
        var output = '<span>Coordinates:&nbsp;&nbsp;<span>('+Math.floor(obj.getX())+', '+Math.floor(obj.getY())+')</span></span>';   // object coordinates (x,y)
        output += '<span>Velocity X:&nbsp;&nbsp;<span>'+Math.floor(vel[0])+'km/hr</span></span>';     // object X Velocity
        output += '<span>Velocity Y:&nbsp;&nbsp;<span>'+Math.floor(vel[1])+'km/hr</span></span>';     // object Y Velocity
        document.getElementById('settings-o-changinginfo-'+id).innerHTML = output; // set the changing info section of the correct object to the information above
      } else {
        // append to the output the specific information for each object
        var output = '<div class="settings-object-wrap" id="settings-o-'+id+'">';
        output += '<div class="settings-o-color" style="background: '+obj.getColor()+'"></div>'; // object colour
        output += '<div class="settings-o-information">';
        output += '<span>Density:&nbsp;&nbsp;<span>';
        output +=  + obj.getDensity() + 'kg/m^3</span></span>';                                  // object density
        output += '<span>Radius:&nbsp;&nbsp;<span>';
        output +=  + obj.getRadius() + 'km</span></span>';                                       // object radius
        output += '<div id="settings-o-changinginfo-'+id+'"></div>';
        output += '<button class="settings-o-delete" id="settings-o-delete-'+id+'"';
        output += ' onclick="deleteObjectNum('+id+')">Delete</button>';                          // object delete button
        output += '</div></div>';

        objManagement.innerHTML += output; // add the output to the window
      }
    }
  }
};

// delete object num
var deleteObjectNum = function(a) {
  if (confirm('Are you sure you wish to delete this object?\nObjects are not recoverable.')) {
    for(var i = 0; i < session.objects.length; i++) { // run through each object on the screen
      var obj = session.objects[i];
      if(obj.getID() === a) {
        session.objects.splice(i, 1);
        var elem = document.getElementById('settings-o-'+a);
        document.getElementById('object-management').removeChild(elem);

        // if space is paused
        if(document.getElementById('settings-pause').className === 'disabled') {
          session.refreshScreen();
        }
      }
    }
  }
};

// download objects as .json
document.getElementById('download-objects').onclick = function() {
  if (document.getElementById('download-objects').className !== 'disabled') { // make sure the button is enabled
    var array = session.objects;
    array.push([session.magnificationMultiplier, session.currTimeScale, session.currentCoordinate, session.idCounter]);
    var text = JSON.stringify(array,null,2);  // convert the objects array into json
    var element = document.createElement('a'); // create an ancor element (link)
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text)); // give the link a location (a text file)
    element.setAttribute('download', 'objects.json'); // turn the anchor into a download link
    element.style.display = 'none'; // hide the anchor element
    document.body.appendChild(element); // add the element to the body
    element.click(); // force the user to click the element (thus activating the download)
    document.body.removeChild(element); // remove the element from the DOM
    session.refreshScreen();
  }
};

// clear objects button
document.getElementById('clear-objects').onclick = function() {
  if (document.getElementById('clear-objects').className !== 'disabled') { // make sure the button is enabled
    if (confirm('Are you sure you want to delete all objects?\nObjects are not recoverable.')) { // prompt the user to make sure they are sure
      session.objects = []; // clear the object array thus deleting all the objects

      // if space is paused
      if(document.getElementById('settings-pause').className === 'disabled') {
        session.refreshScreen();
      }
    }
  }
};



//  ###########################################
//  #                OBJECTS                  #
//  #    planets that fly around on screen    #
//  ###########################################

function radiusToVolume(radius) {
  return (4/3) * Math.PI * Math.pow(radius, 3); // find the volume given the radius: volume = 4/3 * pi * r^3
}

function volumeToRadius(volume) {
  return Math.cbrt(volume/((4/3)*Math.PI)); // find the radius given the volume: radius^3 = volume / (4/3 * pi)
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

  this.drawObject = function(xShift, yShift) {
    // given its position on the canvas, draws it centred to that location

    // draw the planet's main body
    CANVAS_CONTEXT.beginPath();
    CANVAS_CONTEXT.arc(this.x/session.magnificationMultiplier - xShift, this.y/session.magnificationMultiplier - yShift, this.radius/session.magnificationMultiplier, 0, 2 * Math.PI, false);
    CANVAS_CONTEXT.fillStyle = this.color;
    CANVAS_CONTEXT.fill();
    CANVAS_CONTEXT.closePath();

    CANVAS_CONTEXT.lineWidth = DEFAULT_LINE_WIDTH;

    if (showVelocity === true) {
      // draw line in the direction of velocity for the current frame
      CANVAS_CONTEXT.beginPath();
      CANVAS_CONTEXT.moveTo(this.x/session.magnificationMultiplier - xShift, this.y/session.magnificationMultiplier - yShift);
      CANVAS_CONTEXT.lineTo((this.x + this.vx)/session.magnificationMultiplier - xShift, (this.y + this.vy)/session.magnificationMultiplier - yShift);
      CANVAS_CONTEXT.strokeStyle = "red";
      CANVAS_CONTEXT.stroke();
      CANVAS_CONTEXT.closePath();
    }


    if (showAcceleration === true) {
      // draw line in the direction of acceleration for the current frame
      CANVAS_CONTEXT.beginPath();
      CANVAS_CONTEXT.moveTo(this.x/session.magnificationMultiplier - xShift, this.y/session.magnificationMultiplier - yShift);
      CANVAS_CONTEXT.lineTo((this.x + this.ax)/session.magnificationMultiplier - xShift, (this.y + this.ay)/session.magnificationMultiplier - yShift);
      CANVAS_CONTEXT.strokeStyle = "blue";
      CANVAS_CONTEXT.stroke();
      CANVAS_CONTEXT.closePath();
    }

    if (showOrbitPath === true) {
      var pathWidth = ORBIT_PATH_WIDTH_INITIAL;
      // draw line showing the orbit path for the past ORBIT_PATH_LENGTH frames
      CANVAS_CONTEXT.beginPath();
      CANVAS_CONTEXT.strokeStyle = "green";
      CANVAS_CONTEXT.moveTo(this.x/session.magnificationMultiplier - xShift, this.y/session.magnificationMultiplier - yShift);
      for (var i = 0; i < this.orbitPath.length; i++) {
        CANVAS_CONTEXT.lineWidth = pathWidth;
        CANVAS_CONTEXT.lineTo(this.orbitPath[i][0]/session.magnificationMultiplier - xShift, this.orbitPath[i][1]/session.magnificationMultiplier - yShift);
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

    // update the objects velocity according to v = u + at
    this.vx += this.ax*timeScale/TICKS_PER_SECOND;
    this.vy += this.ay*timeScale/TICKS_PER_SECOND;

    // update coordinates according to s = ut + 1/2at^2
    this.x += (this.vx*timeScale/TICKS_PER_SECOND + 0.5*this.ax*Math.pow((timeScale/TICKS_PER_SECOND), 2));
    this.y += (this.vy*timeScale/TICKS_PER_SECOND + 0.5*this.ay*Math.pow((timeScale/TICKS_PER_SECOND), 2));

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
    return this.density;
  };

  this.getRadius = function() {
    return this.radius;
  };

  this.getColor = function() {
    return this.color;
  };

  this.getVelocity = function() {
    return [this.vx, this.vy];
  };

  this.getID = function() {
    return this.id;
  };

  this.setVelocity = function(vx, vy) {
    // gives the object an instantaneous velocity
    this.vx = vx;
    this.vy = vy;
  };

  this.setAcceleration = function(ax, ay) {
    // sets the objects acceleration for the next position update
    this.ax = ax;
    this.ay = -ay;
  };
}

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



//  ###########################################
//  #              MAIN FUNCTION              #
//  #             run the canvas              #
//  ###########################################

function Main(){
    this.objects = []; // contains all the planet objects
    this.objectsHitList = [];
    this.magnificationMultiplier = 1.0;
    this.currTimeScale = 1;
    this.currentCoordinate = [0, 0];
    this.idCounter = 0;

    this.createObject = function(density, radius, color, x, y, velocityx, velocityy){
        this.objects.push(new object(density, radius, color, x, y, this.idCounter)); // adds values into new planet object
        if (velocityx !== 0 || velocityy !== 0){ // sets velocity value if supplied (may use id to find added object when to prevent errors during clustered thread) )
          this.objects[this.objects.length-1].setVelocity(velocityx, velocityy);
        }
        console.log("Created object with\nDensity: " + density + "kg/m^3\nRadius: " + radius + "km\nColor: " + color + "\nCoordinates: " + x + ", " + y + "\nVelocity: " + velocityx + ", " + velocityy + "\nID: " + this.idCounter); // debug info
        this.idCounter++;
        updateObjManagement(this.objects);
    };
    //this.createObject(10, 70, 'red', 500, 350, 0, 0);
    //this.createObject(1, 10, 'blue', 800, 350, 0, 240);

    this.update = function(){
      if (typeof this.objects !== 'undefined') { //prevents update when array is broken
        var acceleration = [0, 0];
        var angle = 0;
        var distance = 0;
        var newAcceleration = [0, 0];

        var i;
        CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
        for (i = 0; i < this.objects.length; i++) {
          acceleration = [0, 0];
          for (var p = 0; p < this.objects.length; p++) {
            if (this.objects[i].getID() !== this.objects[p].getID()) {
              // get angle
              angle = getAngleBetweenPoints(this.objects[i].getX(), this.objects[i].getY(),
                this.objects[p].getX(), this.objects[p].getY());
              // get distance
              distance = Math.hypot(this.objects[i].getX() - this.objects[p].getX(), this.objects[i].getY() - this.objects[p].getY());
              // get acceleration
              newAcceleration = calculateGravityAccel(
                this.objects[i].getX(), this.objects[i].getY(),
                this.objects[p].getX(), this.objects[p].getY(),
                this.objects[p].getMass(),
                distance, angle);
              acceleration[0] += newAcceleration[0];
              acceleration[1] += newAcceleration[1];
            }
          }
          this.objects[i].setAcceleration(acceleration[0], acceleration[1]);
        }

        for (i = 0; i < this.objects.length; i++) {
          this.objects[i].updatePosition(1);
          this.objects[i].drawObject(this.currentCoordinate[0] - canvasXmid, this.currentCoordinate[1] - canvasYmid);
        }

        updateObjManagement(this.objects);

        // for each possible pair in this.objects
        for (i = 0; i < this.objects.length - 1; i++) {
          for (var j = i; j < this.objects.length - 1; j++) {
            this.hitDetect(this.objects[i], this.objects[j+1]); // check whether this pair has hit
          }
        }

        // for each pair in the hit list
        for (i = 0; i < this.objectsHitList.length - 1; i) {
          var obj1 = this.objectsHitList[i];   // get the first object
          var obj2 = this.objectsHitList[i+1]; // get the next object (object colliding)

          // new volume and radius
          var vol1 = obj1.getVolume(); // volume of object 1
          var vol2 = obj2.getVolume(); // volume of object 2
          var newVolume = vol1 + vol2; // combine the two volumes to make the new volume
          var newRadius = Math.floor(volumeToRadius(newVolume)); // turn the volume into a radius

          // new object percentage
          var p1 = vol1 / newVolume; // volume of the object divided by the new objects volume gives a ratio of old to new
          var p2 = vol2 / newVolume; // this is used to calculate the percentage of the new object that belongs to the old object

          // new colour
          var c1 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(obj1.getColor()); // turn the colours into arrays of values [r,g,b]
          var c2 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(obj2.getColor());
          var r1 = parseInt(c1[1], 16) * p1; // convert each value into hex: parseInt(num, 16)
          var r2 = parseInt(c2[1], 16) * p2; // times that number by the percentage of the new object
          var g1 = parseInt(c1[2], 16) * p1;
          var g2 = parseInt(c2[2], 16) * p2;
          var b1 = parseInt(c1[3], 16) * p1;
          var b2 = parseInt(c2[3], 16) * p2;
          var r = numberToHex(Math.floor(r1 + r2)); // floor the combined rgb: Math.floor(num)
          var g = numberToHex(Math.floor(g1 + g2)); // turn that number back into a hexadecimal: numberToHex(num)
          var b = numberToHex(Math.floor(b1 + b2));
          var newColor = "#" + r + g + b; // combine the rgb hexadecimal values into one hexadecimal colour

          // new density
          var d1 = obj1.getDensity() * p1; // percentage of object 1's density being passed on to the new object
          var d2 = obj2.getDensity() * p2; // likewise for obejct 2
          var newDensity = Math.floor(d1 + d2); // combine the two density amounts to form the new density.

          // new velocity
          var vel1 = obj1.getVelocity(); // returns an array [x, y] of the velocity
          var vel2 = obj2.getVelocity();
          var newVelocityX = vel1[0] * p1 + vel2[0] * p2; // add the percentage of velocitys of each object
          var newVelocityY = vel1[1] * p1 + vel2[1] * p2; // do this for both object's x and y velocity

          var x,y;
          if (p1 >= p2) { // if the first object is bigger
            x = obj1.getX(); // set the x and y of the new object to the x,y of the first object
            y = obj1.getY();
          } else { // the second object is bigger
            x = obj2.getX(); // likewise with the second object
            y = obj2.getY();
          }

          // remove the 'object management' elements for the objects merging
          var elem1 = document.getElementById('settings-o-'+ obj1.getID());
          var elem2 = document.getElementById('settings-o-'+ obj2.getID());
          document.getElementById('object-management').removeChild(elem1);
          document.getElementById('object-management').removeChild(elem2);

          // remove the objects for the object list
          this.objects.splice(this.objects.indexOf(obj1), 1); // remove objects in array using array.splice(index, numToRemove)
          this.objects.splice(this.objects.indexOf(obj2), 1); // get the index of the obejects using this.objects.indexOf(itemInArray)

          // remove the objects from the hit list
          this.objectsHitList.splice(i+1, 1); // remove objects in array using array.splice(index, numToRemove)
          this.objectsHitList.splice(i, 1); // first remove the second object than the first

          // create the new object to replace the merging ones
          this.createObject(newDensity, newRadius, newColor, x, y, newVelocityX, newVelocityY); // pass all the required information
        }

        // clear the hit list
        this.objectsHitList = [];

        // redraw all the objects
        for (i = 0; i < this.objects.length; i++) {
          this.objects[i].updatePosition(this.currTimeScale);
          this.objects[i].drawObject(this.currentCoordinate[0] - canvasXmid, this.currentCoordinate[1] - canvasYmid);
        }

        // update the object management tab
        updateObjManagement(this.objects);
      }
    };

    // update the session every tick
    this.interval = window.setInterval(function(){session.update();}, 1000/TICKS_PER_SECOND);

    // used to update the screen without moving objects (e.g. when paused)
    this.refreshScreen = function() {
      CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height); // clear the screen
      for (var i = 0; i < this.objects.length; i++) { // go through each object that should be on the screen
        this.objects[i].drawObject(this.currentCoordinate[0] - canvasXmid, this.currentCoordinate[1] - canvasYmid); // draw the object to the screen
      }
      updateObjManagement(this.objects); // update the 'object management' window
    };

    // determine whether two given objects have collided (overlap)
    this.hitDetect = function(object1, object2){
      var x1 = object1.getX(); // x position of object 1
      var y1 = object1.getY(); // y posiiton of object 1
      var x2 = object2.getX(); // x position of object 2
      var y2 = object2.getY(); // y posiiton of object 2
      var d =  Math.hypot(x2-x1, y2-y1); // get the distance between the two center points

      // NOTE: if the distance is smaller than the two circles radius combined then the objects are overlapped
      if (d <= parseInt(object1.getRadius()) + parseInt(object2.getRadius())) { // check whether they overlap
         // check if the objects are already on the hit list
        if(this.objectsHitList.indexOf(object1) > -1 || this.objectsHitList.indexOf(object2) > -1) {
          return false; // if the objects are already in the list do not add them again but instead return
        }
        this.objectsHitList.push(object1, object2); // add the obejects to the hit list
      }
    };
}
