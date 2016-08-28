const CANVAS = document.getElementById('simulation'); // get the simulation element
const CANVAS_CONTEXT = CANVAS.getContext('2d');       // get the simulation context which is used to draw objects
const KM_TO_PIXELS = 1/1e3;               // convert between pixels and kilometers
const TICKS_PER_SECOND = 120;             // number of ticks (refreshes) per second
const ORBIT_PATH_LENGTH = 150;            // length of the orbit path
const ORBIT_PATH_WIDTH_INITIAL = 10;      // start of the orbit path length (e.g. at the object)
const ORBIT_PATH_WIDTH_DECREMENT = 0.06;  // amount the orbit decreases over time
const DEFAULT_LINE_WIDTH = 5;             // line width for velocity and acceleration

var session = new Main(); // the instance of the application running

//  ###########################################
//  #              INIT FUNCTION              #
//  #            used to create UI            #
//  ###########################################

// flags and variables for optional draw objects
var showOrbitPath = true;     // determines whether the orbit path is shown by default
var showVelocity = false;     // hides the velocity line by default
var showAcceleration = false; // hides the acceleration line by default
var canvasXmid = 0; // sets the canvas mid variables to integers
var canvasYmid = 0;

// open a window in the sidebar
var openWindow = function(itemName) {
  document.getElementById(itemName).className = 'open'; // add class open to the chosen element
};

// close a window in the sidebar
var closeWindow = function(itemName) {
  document.getElementById(itemName).className = '';     // remove all classes from the chosen element
};

// initialise the follow object (for object creation)
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

// called when the window resizes
var windowResize = function() {
  CANVAS.width = window.innerWidth * 0.75; // the width of the simulation canvas is always 75% of the document according to CSS
  CANVAS.height = window.innerHeight; // the height of the simulation is 100% of the document

  canvasXmid = CANVAS.width / 2;  // the x mid point of the canvas
  canvasYmid = CANVAS.height / 2; // the y mid point of the canvas

  // need to add something so that it keeps what is in the middle in the same place
  document.getElementById('up-line').style.left = (canvasXmid - 1) + 'px';  // set the location of the y axis
  document.getElementById('down-line').style.top = (canvasYmid - 1) + 'px'; // set the location of the x axis
};

window.onresize = function() { windowResize(); }; // attach the above function to the window resize event

// initialise function
var init = function() {
  // ready the canvas
  windowResize();

  // ready the follow object
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

  // canvas movement
  var canvasMover = function(){
    this.isDown = false; // flag stating whether the mouse is down on top of the simulation canvas

    // on mouse press
    document.getElementById("simulation").addEventListener('mousedown', function(event){
      if (event.button === 0){
        this.x = event.pageX; // get the x position of the mouse click
        this.y = event.pageY; // get the y position too
        this.isDown = true;   // set the mouse pressed to true
      }
    });

    // on mouse release
    document.getElementById("simulation").addEventListener('mouseup', function(event){
      if (event.button === 0){
        this.isDown = false; //  set the mouse pressed to false upon mouse up
      }
    });

    // on mouse leaving simulation canvas
    document.getElementById("simulation").addEventListener('mouseleave', function(event){
      if (event.button === 0){
        this.isDown = false; //  set the mouse pressed to false upon exiting element
      }
    });

    // on any movement of the mouse within the simulation canvas
    document.getElementById("simulation").addEventListener("mousemove",function(event){
      if (this.isDown){ // execute if mouse is detected as being down
        this.nx = event.pageX; // get the mouse x
        this.ny = event.pageY; // get the mouse y
        session.shiftCanvas(this.nx-this.x, this.ny-this.y); // move the canvas in the correct direction based on location mouse
                                                             // was previously (this.x and this.y) and the new location (this.nx, this.ny)
        session.refreshScreen(); // refresh the screen (updating object location)
        this.x = this.nx; // set the x and y to the current location of the mouse (for the next move)
        this.y = this.ny;
      }
    });
  }
  canvasMover(); // run the canvas mover (allowing the user to move the canvas around)
};

init(); // run the initialise code (above)



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
  obj.style.display = 'block';          // set the visibility to show
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
    console.log(x, y);

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
      if (cf) { // gets the second click (because the first click is still running from above)
        var coordinates = session.getCoordinates(); // get the coordinates of the center

        var vx = event.pageX - x; // x-axis length of the velocity
        var vy = event.pageY - y; // y-axis length of the velocity

        x = ((x - canvasXmid) * session.magnificationMultiplier + coordinates[0]); // get the correct x in terms of canvas shifting and zoom
        y = ((y - canvasYmid) * session.magnificationMultiplier + coordinates[1]); // same as above but for y
        vx = vx * session.magnificationMultiplier; // get the velocity relative to the zoom of the simulation
        vy = vy * session.magnificationMultiplier;

        // create the object
        session.createObject(density, radius, color, x, y, vx, vy);

        // remove the placeholder
        clearObjectCreation();

        // if space is paused
        if(document.getElementById('settings-pause').className === 'disabled') {
          session.refreshScreen(); // refresh the simulation
        }

      } else { cf = true; } // set cf to true so next time the code runs
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
  obj.style.width = radius*2 + 'px';   // set the width to twice the radius
  obj.style.height = radius*2 + 'px';  // same with the height
  obj.style.background = color;        // set the background colour
  obj.style.left = (x - radius) + 'px';// set the x offset on the screen
  obj.style.top = (y - radius) + 'px'; // set the y offset on the screen
};

// remove placeholder object
var removePlaceholderObject = function() {
  var obj = document.getElementById("object-placeholder");

  // reset styles for placeholder object
  obj.style.width = '';
  obj.style.height = '';
  obj.style.background = 'none';
  obj.style.left = '';
  obj.style.top = '';
};

// create velocity line
var createVelocityLine = function(x,y) {
  var obj = document.getElementById("velocity-line");

  // set the location
  obj.style.left = x + 'px';
  obj.style.top = y + 'px';

  var a = 0; // flag needed for below

  // when the mouse is moved
  document.onmousemove = function(event) {
    if (a === 0) { obj.style.display = 'block'; a++; } // show the velocity line on the first movement
    var mx = event.pageX; // get the x position of the mouse
    var my = event.pageY; // get the y position of the mouse

    var distance = Math.hypot(mx-x, my-y); // get the length of the velocity line (hypotenuse of an imaginary right angle triangle)
    var angle = Math.atan2(my-y, mx-x) * 180 / Math.PI; // get the angle of incline/decline from right (0)

    obj.style.width = distance + 'px'; // set the width of the object to the distance of the hypotenuse
    obj.style.transform = 'rotate(' + angle + 'deg)'; // rotate the object so that it is at the correct angle
  };
};

// remove velocity line
var removeVelocityLine = function() {
  var obj = document.getElementById("velocity-line");

  // reset the styles of the velocity line
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

// update the settings for when loading in a state
// so that the range elements show the correct value
var updateSettings = function() {
  document.getElementById('settings-zoom').value = session.magnificationMultiplier;
  document.getElementById('settings-time').value = session.currTimeScale;
};

// on any file selection or cancel
document.getElementById('loadstate-file').onchange = function() {
  var files = document.getElementById('loadstate-file').files; // get the files from the input element in the DOM
  if (!files.length) { // if no file selected
    return; // stop the code from running
  }

  var file = files[0]; // get the first file
  var reader = new FileReader(); // get the file reader (JS)

  // when the file is fully downloaded loads the file
  reader.onloadend = function(evt) {
    if (evt.target.readyState === FileReader.DONE) { // file is done loading
      if (`confirm`('Are you sure you want to load a file.\nAnything you have made currently will not be recoverable.')) {
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
        updateSettings(); // update the manage space
      }
    };
  };

  // read the file
  var info = file.slice(0, file.size);
  reader.readAsBinaryString(info);
};


// Simple orbit
document.getElementById('loadstate-simpleorbit').addEventListener('mousedown', function() {
  if (confirm('Are you sure you want to load a prebuilt.\nAnything you have made currently will not be recoverable.')) { // make sure they want to do it
    session.objects = []; // clear screen
    session.createObject(20, 50, "#f1c40f", 0, 0, 0, 0);        // first object
    session.createObject(0, 20, "#27ae60", 300, 0, -25, 120);   // second object

    // settings
    session.magnificationMultiplier = 1.0;
    session.currTimeScale = 1;
    session.currentCoordinate = [0, 0];
    session.idCounter = 2;

    // make it appear
    session.refreshScreen();
    updateSettings(); // update the manage space
  }
});

// Binary star
document.getElementById('loadstate-binarystar').addEventListener('mousedown', function() {
  if (confirm('Are you sure you want to load a prebuilt.\nAnything you have made currently will not be recoverable.')) { // make sure they want to do it
    session.objects = []; // clear screen
    session.createObject(20, 40, "#f1c40f", -100, 0, 0, -87);  // first object
    session.createObject(20, 40, "#f39c12", 100, 0, 0, 87);    // second object

    // settings
    session.magnificationMultiplier = 1.0;
    session.currTimeScale = 1;
    session.currentCoordinate = [0, 0];
    session.idCounter = 2;

    // make it appear
    session.refreshScreen();
    updateSettings(); // update the manage space
  }
});

// Double binary star
document.getElementById('loadstate-doublebinarystar').addEventListener('mousedown', function() {
  if (confirm('Are you sure you want to load a prebuilt.\nAnything you have made currently will not be recoverable.')) { // make sure they want to do it
    session.objects = []; // clear screen
    session.createObject(20, 40, "#d35400", 150, 0, 0, 135);   // first object
    session.createObject(20, 40, "#e67e22", 0, -150, 135, 0);  // second object
    session.createObject(20, 40, "#f39c12", -150, 0, 0, -135); // third object
    session.createObject(20, 40, "#f1c40f", 0, 150, -135, 0);  // fourth object

    // settings
    session.magnificationMultiplier = 1.0;
    session.currTimeScale = 1;
    session.currentCoordinate = [0, 0];
    session.idCounter = 4;

    // make it appear
    session.refreshScreen();
    updateSettings(); // update the manage space
  }
});

// Anti gravity system
document.getElementById('loadstate-antigravity').addEventListener('mousedown', function() {
  if (confirm('Are you sure you want to load a prebuilt.\nAnything you have made currently will not be recoverable.')) { // make sure they want to do it
    session.objects = []; // clear screen
    session.createObject(-0.54, 50, "#abcdef", 0, 0, 0, 0);  // first object
    session.createObject(10, 30, "#f1c40f", 100, 0, 0, 0);   // second object
    session.createObject(10, 30, "#f1c40f", -100, 0, 0, 0);  // third object
    session.createObject(0, 20, "#2ecc71", 200, 0, -15, 95); // fourth object

    // settings
    session.magnificationMultiplier = 1.0;
    session.currTimeScale = 1;
    session.currentCoordinate = [0, 0];
    session.idCounter = 4;

    // make it appear
    session.refreshScreen();
    updateSettings(); // update the manage space
  }
});



//  ###########################################
//  #              MANAGE SPACE               #
//  #     used in the manage space window     #
//  ###########################################

// velocity line toggle
document.getElementById('settings-velocity-line').onchange = function () {
  showVelocity = document.getElementById('settings-velocity-line').checked; // update the settings based on value user clicked

  // if space is paused
  if(document.getElementById('settings-pause').className === 'disabled') {
    session.refreshScreen();  // refresh the screen
  }
};

// acceleration line toggle
document.getElementById('settings-acceleration-line').onchange = function () {
  showAcceleration = document.getElementById('settings-acceleration-line').checked; // update the settings based on value user clicked

  // if space is paused
  if(document.getElementById('settings-pause').className === 'disabled') {
    session.refreshScreen();  // refresh the screen
  }
};

// orbit path toggle
document.getElementById('settings-orbit-path').onchange = function () {
  showOrbitPath = document.getElementById('settings-orbit-path').checked; // update the settings based on value user clicked

  // if space is paused
  if(document.getElementById('settings-pause').className === 'disabled') {
    session.refreshScreen();  // refresh the screen
  }
};

// change time scale
document.getElementById('settings-time').oninput = function () {
  session.currTimeScale = document.getElementById('settings-time').value; // update the settings based on value user clicked
};

document.getElementById('settings-zoom').oninput = function () {
  session.magnificationMultiplier = document.getElementById('settings-zoom').value; // update the settings based on value user clicked

  // if space is paused
  if(document.getElementById('settings-pause').className === 'disabled') {
    session.refreshScreen();  // refresh the screen
  }
};

document.getElementById('settings-play').onclick = function() {
  if(this.className === '') {
    session.interval = window.setInterval(function(){session.update();}, 1000/TICKS_PER_SECOND); // set the interval for the session update
    this.className = 'disabled'; // disable the play button
    document.getElementById('settings-pause').className = ''; // enable the pause button
    document.getElementById('space-paused-alert').className = ''; // remove the pause alert
  }
};

document.getElementById('settings-pause').onclick = function() {
  if(this.className === '') {
    clearInterval(session.interval); // clear the session update interval
    this.className = 'disabled'; // disable the pause button
    document.getElementById('settings-play').className = ''; // enable the play button
    document.getElementById('space-paused-alert').className = 'shown'; // show the pause alert
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
        output += '<button class="settings-o-jump" id="settings-o-jump-'+id+'"';
        output += ' onclick="jumpObj('+id+')">Jump to Object</button>';                          // object delete button
        output += '</div></div>';

        objManagement.innerHTML += output; // add the output to the window
      }
    }
  }
};

// delete object num
var deleteObjectNum = function(a) {
  if (confirm('Are you sure you wish to delete this object?\nObjects are not recoverable.')) { // confirm they wish to delete object
    for(var i = 0; i < session.objects.length; i++) { // run through each object on the screen
      var obj = session.objects[i]; // get each object
      if(obj.getID() === a) { // if the object is the selected object
        session.objects.splice(i, 1); // remove it from the objects array
        var elem = document.getElementById('settings-o-'+a);              // get its 'object management' information element
        document.getElementById('object-management').removeChild(elem);   // remove that object

        // if space is paused
        if(document.getElementById('settings-pause').className === 'disabled') {
          session.refreshScreen(); // refresh the screen
        }
      }
    }
  }
};

// jump to a specific object on the screen
var jumpObj = function(a) {
  for(var i = 0; i < session.objects.length; i++) { // run through each object on the screen
    var obj = session.objects[i]; // get each object
    if(obj.getID() === a) { // if the object is the correct object
      session.currentCoordinate[0] = Math.floor(obj.getX()); // set the simulation center to the x
      session.currentCoordinate[1] = Math.floor(obj.getY()); // likewise for the y
      session.refreshScreen(); // refresh the screen
    }
  }
};

// download objects as .json
document.getElementById('download-objects').onclick = function() {
  if (document.getElementById('download-objects').className !== 'disabled') { // make sure the button is enabled
    var array = session.objects;
    array.push([session.magnificationMultiplier, session.currTimeScale, session.currentCoordinate, session.idCounter]);
    var text = JSON.stringify(array,null,2);  // convert the objects array into json
    var element = document.createElement('a'); // create an anchor element (link)
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text)); // give the link a location (a text file)
    element.setAttribute('download', 'objects.json'); // turn the anchor into a download link
    element.style.display = 'none'; // hide the anchor element
    document.body.appendChild(element); // add the element to the body
    element.click(); // force the user to click the element (thus activating the download)
    document.body.removeChild(element); // remove the element from the DOM
    session.refreshScreen(); // refresh the screen
  }
};

// clear objects button
document.getElementById('clear-objects').onclick = function() {
  if (document.getElementById('clear-objects').className !== 'disabled') { // make sure the button is enabled
    if (confirm('Are you sure you want to delete all objects?\nObjects are not recoverable.')) { // prompt the user to make sure they are sure
      session.objects = []; // clear the object array thus deleting all the objects

      // if space is paused
      if(document.getElementById('settings-pause').className === 'disabled') {
        session.refreshScreen(); // refresh the screen
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
  this.volume = radiusToVolume(radius); // convert the radius into a volume
  this.mass = this.density * this.volume; // get the mass from the density and the volume
  this.color = color;

  // variables that change as the planet moves
  this.vx = 0;
  this.vy = 0;
  this.ax = 0;
  this.ay = 0;
  this.orbitPath = [];

  this.drawObject = function(xShift, yShift) {
    // given its position on the canvas, draws it centered to that location

    // draw the planet's main body
    CANVAS_CONTEXT.beginPath();
    CANVAS_CONTEXT.arc((this.x - xShift)/session.magnificationMultiplier, (this.y - yShift)/session.magnificationMultiplier, this.radius/session.magnificationMultiplier, 0, 2 * Math.PI, false);
    CANVAS_CONTEXT.fillStyle = this.color;
    CANVAS_CONTEXT.fill();
    CANVAS_CONTEXT.closePath();

    CANVAS_CONTEXT.lineWidth = DEFAULT_LINE_WIDTH;

    if (showVelocity === true) {
      // draw line in the direction of velocity for the current frame
      CANVAS_CONTEXT.beginPath();
      CANVAS_CONTEXT.moveTo((this.x - xShift)/session.magnificationMultiplier, (this.y - yShift)/session.magnificationMultiplier);
      CANVAS_CONTEXT.lineTo((this.x + this.vx - xShift)/session.magnificationMultiplier, (this.y + this.vy - yShift)/session.magnificationMultiplier);
      CANVAS_CONTEXT.strokeStyle = "#e74c3c";
      CANVAS_CONTEXT.stroke();
      CANVAS_CONTEXT.closePath();
    }


    if (showAcceleration === true) {
      // draw line in the direction of acceleration for the current frame
      CANVAS_CONTEXT.beginPath();
      CANVAS_CONTEXT.moveTo((this.x - xShift)/session.magnificationMultiplier, (this.y - yShift)/session.magnificationMultiplier);
      CANVAS_CONTEXT.lineTo((this.x + this.ax - xShift)/session.magnificationMultiplier, (this.y + this.ay - yShift)/session.magnificationMultiplier);
      CANVAS_CONTEXT.strokeStyle = "#2980b9";
      CANVAS_CONTEXT.stroke();
      CANVAS_CONTEXT.closePath();
    }

    if (showOrbitPath === true) {
      var pathWidth = ORBIT_PATH_WIDTH_INITIAL;
      // draw line showing the orbit path for the past ORBIT_PATH_LENGTH frames
      CANVAS_CONTEXT.beginPath();
      CANVAS_CONTEXT.strokeStyle = "#1abc9c";
      CANVAS_CONTEXT.moveTo((this.x - xShift)/session.magnificationMultiplier, (this.y - yShift)/session.magnificationMultiplier);
      for (var i = 0; i < this.orbitPath.length; i++) {
        CANVAS_CONTEXT.lineWidth = pathWidth;
        CANVAS_CONTEXT.lineTo((this.orbitPath[i][0] - xShift)/session.magnificationMultiplier, (this.orbitPath[i][1] - yShift)/session.magnificationMultiplier);
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

function calculateGravityAccel(mass, dist, angle) {
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
    this.objectsHitList = []; // contains all the unresolved hits
    this.magnificationMultiplier = 1.0;
    this.currTimeScale = 1;
    this.currentCoordinate = [0, 0];
    this.idCounter = 0;
    this.gridLineInterval = 100;

    this.createObject = function(density, radius, color, x, y, velocityx, velocityy){
        this.objects.push(new object(density, radius, color, x, y, this.idCounter)); // adds values into new planet object

        // sets velocity value if supplied
        if (velocityx !== 0 || velocityy !== 0){
          this.objects[this.objects.length-1].setVelocity(velocityx, velocityy);
        }

        // log this to console (for testing)
        // console.log("Created object with\nDensity: " + density + "kg/m^3\nRadius: " + radius + "km\nColor: " + color + "\nCoordinates: " + x + ", " + y + "\nVelocity: " + velocityx + ", " + velocityy + "\nID: " + this.idCounter); // debug info

        this.idCounter++; // add one to the id counter so that two objects cannot have same id
        updateObjManagement(this.objects); // update the object management
    }

    this.update = function(){
      var start = new Date().getTime();
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
              newAcceleration = calculateGravityAccel(this.objects[p].getMass(), distance, angle);
              acceleration[0] += newAcceleration[0];
              acceleration[1] += newAcceleration[1];
            }
          }
          this.objects[i].setAcceleration(acceleration[0], acceleration[1]);
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

          // new density
          var d1 = obj1.getDensity() * p1; // percentage of object 1's density being passed on to the new object
          var d2 = obj2.getDensity() * p2; // likewise for object 2
          var newDensity = Math.floor(d1 + d2); // combine the two density amounts to form the new density.

          // new mass percentages
          var nm = newVolume * newDensity; // new mass
          var pm1 = obj1.getMass() / nm; // percentage of new object's mass belonging to object 1
          var pm2 = obj2.getMass() / nm; // likewise for object 2

          // new colour
          var c1 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(obj1.getColor()); // turn the colors into arrays of values [#,r,g,b]
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

          // new velocity
          var vel1 = obj1.getVelocity(); // returns an array [x, y] of the velocity
          var vel2 = obj2.getVelocity();
          var newVelocityX = vel1[0] * pm1 + vel2[0] * pm2; // add the percentage of velocities of each object
          var newVelocityY = vel1[1] * pm1 + vel2[1] * pm2; // do this for both object's x and y velocity

          var difX = obj1.getX() - obj2.getX();
          var difY = obj1.getY() - obj2.getY();
          var x = obj1.getX() - difX*pm2;
          var y = obj1.getY() - difY*pm2;

          // remove the 'object management' elements for the objects merging
          var elem1 = document.getElementById('settings-o-'+ obj1.getID());
          var elem2 = document.getElementById('settings-o-'+ obj2.getID());
          document.getElementById('object-management').removeChild(elem1);
          document.getElementById('object-management').removeChild(elem2);

          // remove the objects for the object list
          this.objects.splice(this.objects.indexOf(obj1), 1); // remove objects in array using array.splice(index, numToRemove)
          this.objects.splice(this.objects.indexOf(obj2), 1); // get the index of the objects using this.objects.indexOf(itemInArray)

          // remove the objects from the hit list
          this.objectsHitList.splice(i+1, 1); // remove objects in array using array.splice(index, numToRemove)
          this.objectsHitList.splice(i, 1); // first remove the second object than the first

          // create the new object to replace the merging ones
          this.createObject(newDensity, newRadius, newColor, x, y, newVelocityX, newVelocityY); // pass all the required information
        }

        // clear the hit list
        this.objectsHitList = [];

        // draws the grid lines
        this.addGridlLines();

        // redraw all the objects
        for (i = 0; i < this.objects.length; i++) {
          this.objects[i].updatePosition(this.currTimeScale); // update the position, for the amount of time dictated by this.currTimeScale
          this.objects[i].drawObject(this.currentCoordinate[0] - canvasXmid*this.magnificationMultiplier, this.currentCoordinate[1] - canvasYmid*this.magnificationMultiplier); // draw the object in the correct place on the screen
        }

        // update the object management tab
        updateObjManagement(this.objects);
      }
      // console.log(new Date().getTime() - start);
    };

    // update the session every tick
    this.interval = window.setInterval(function(){session.update();}, 1000/TICKS_PER_SECOND);

    // used to update the screen without moving objects (e.g. when paused)
    this.refreshScreen = function() {
      CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height); // clear the screen
      this.addGridlLines(); // draws grid lines
      for (var i = 0; i < this.objects.length; i++) { // go through each object that should be on the screen
        this.objects[i].drawObject(this.currentCoordinate[0] - canvasXmid*this.magnificationMultiplier, this.currentCoordinate[1] - canvasYmid*this.magnificationMultiplier); // draw the object to the screen
      }
      updateObjManagement(this.objects); // update the 'object management' window
      document.getElementById("line-coord").innerHTML = "Center: [" + session.currentCoordinate[0] + ", " + session.currentCoordinate[1] + "]";
    };

    // determine whether two given objects have collided (overlap)
    this.hitDetect = function(object1, object2){
      var x1 = object1.getX(); // x position of object 1
      var y1 = object1.getY(); // y position of object 1
      var x2 = object2.getX(); // x position of object 2
      var y2 = object2.getY(); // y position of object 2
      var d =  Math.hypot(x2-x1, y2-y1); // get the distance between the two center points

      // NOTE: if the distance is smaller than the two circles radius combined then the objects are overlapped
      if (d <= parseInt(object1.getRadius()) + parseInt(object2.getRadius())) { // check whether they overlap
         // check if the objects are already on the hit list
        if(this.objectsHitList.indexOf(object1) > -1 || this.objectsHitList.indexOf(object2) > -1) {
          return false; // if the objects are already in the list do not add them again but instead return
        }
        this.objectsHitList.push(object1, object2); // add the objects to the hit list
      }
    };

    // move the canvas relative to current position
    this.shiftCanvas = function(x, y){
      this.currentCoordinate[0] -= x*this.magnificationMultiplier; // minus the x amount from current x position
      this.currentCoordinate[1] -= y*this.magnificationMultiplier; // likewise for the y
    }

    // move the canvas to an absolute position
    this.setCoordinates = function(x, y){
      this.currentCoordinate[0] = x; // set the x position to 'x'
      this.currentCoordinate[1] = y; // likewise for y and 'y'
    }

    // get the current coordinates
    this.getCoordinates = function(){
      return this.currentCoordinate;
    }

    // add grid lines on canvas
    this.addGridlLines = function(){
      // get width and height of canvas
        var screenWidth = CANVAS.width;
        var screenHeight = CANVAS.height;

      // calculate number of intervals for the grid
        var latitudeLineNumber = Math.floor(this.magnificationMultiplier * screenHeight/this.gridLineInterval);
        var longitudeLineNumber = Math.floor(this.magnificationMultiplier * screenWidth/this.gridLineInterval);

      // get distance from the center in terms of the grid
        var halfWidth = this.magnificationMultiplier*canvasXmid;
        var hadlfHeight = this.magnificationMultiplier*canvasYmid;

        var i = 0;
      // calculate the first positions of the grid lines
        var startingx = this.currentCoordinate[0] - halfWidth + ((halfWidth - this.currentCoordinate[0]) % (this.gridLineInterval));
        var startingy = this.currentCoordinate[1] - hadlfHeight + ((hadlfHeight - this.currentCoordinate[1]) % (this.gridLineInterval));

      // draws the grid
        this.drawGridLines(startingx, startingy, this.magnificationMultiplier, latitudeLineNumber, longitudeLineNumber, this.currentCoordinate[0]-halfWidth, this.currentCoordinate[1]-hadlfHeight);
    }

    // draws the grid lines
    this.drawGridLines = function (x, y, scale, latitudeLineNumber, longitudeLineNumber, firstx, firsty){
      var i = 0;
    // coordinate of the grid line, reused for both x and y axis
      var coordinate = 0;
    // initialises the path's properties
      CANVAS_CONTEXT.beginPath();
      CANVAS_CONTEXT.strokeStyle = "#000000";
      CANVAS_CONTEXT.lineWidth = .5;

      for (i = 0; i < longitudeLineNumber; i++){
      // calculates the x value in terms of canvas coordinates
        coordinate = Math.floor((x + i * this.gridLineInterval - firstx) / scale)
      // creates path from top to bottom of the canvas at the x coordinates
        CANVAS_CONTEXT.moveTo(coordinate, 0);
        CANVAS_CONTEXT.lineTo(coordinate, CANVAS.height);
      }

      for (i = 0; i < latitudeLineNumber; i++){
      // calculates the y value in terms of canvas coordinates
        coordinate = Math.floor((y + i * this.gridLineInterval - firsty) / scale)
      // creates path from left to right of the canvas at the y coordinates
        CANVAS_CONTEXT.moveTo(0, coordinate);
        CANVAS_CONTEXT.lineTo(CANVAS.width, coordinate);
      }

    // draws the lines and remove the paths
      CANVAS_CONTEXT.stroke();
      CANVAS_CONTEXT.closePath();

    }
    
}



// eric mode
var ericCanvas = document.getElementById('eric-simulation');
var ballElem = document.getElementById('eric-ball');
var ball = [];
var ballColor = '#e74c3c';
var ballImg = "";
var lastTypedKeys = [];
document.onkeypress = function(evt) {
  lastTypedKeys.push(evt.which);
  var len = lastTypedKeys.length;
  if (lastTypedKeys[len-1] == '99' && lastTypedKeys[len-2] == '105' && lastTypedKeys[len-3] == '114' && lastTypedKeys[len-4] == '101') {
    if(confirm('Do you want to launch Eric mode?')) {
      document.getElementById('eric').style.display = 'block';
      window.onresize = '';
      document.onkeypress = '';
      document.onclick = '';
      document.onmousemove = '';
      session.interval = '';
    }
  }
}

// radius
document.getElementById('eric-radius').oninput = function() {
  document.getElementById('eric-radius-value').innerHTML = this.value + 'px';
};

// ball color/image
document.getElementById('eric-ball-color').oninput = function() {
  ballColor = this.value;
  ballImg = '';
  this.className = 'selected';
  document.getElementById('eric-b1').className = '';
  document.getElementById('eric-b2').className = '';
  document.getElementById('eric-b3').className = '';
};

document.getElementById('eric-b1').onclick = function() {
  ballImg = "url('assets/eric/soccer.png')";
  this.className = 'selected';
  document.getElementById('eric-ball-color').className = '';
  document.getElementById('eric-b2').className = '';
  document.getElementById('eric-b3').className = '';
}

document.getElementById('eric-b2').onclick = function() {
  ballImg = "url('assets/eric/tennis.png')";
  this.className = 'selected';
  document.getElementById('eric-ball-color').className = '';
  document.getElementById('eric-b1').className = '';
  document.getElementById('eric-b3').className = '';
}

document.getElementById('eric-b3').onclick = function() {
  ballImg = "url('assets/eric/poke.png')";
  this.className = 'selected';
  document.getElementById('eric-ball-color').className = '';
  document.getElementById('eric-b1').className = '';
  document.getElementById('eric-b2').className = '';
}

// background image
document.getElementById('eric-background-color').oninput = function() {
  ericCanvas.style.background = this.value;
  this.className = 'selected';
  document.getElementById('eric-bg1').className = '';
  document.getElementById('eric-bg2').className = '';
  document.getElementById('eric-bg3').className = '';
};

document.getElementById('eric-bg1').onclick = function() {
  ericCanvas.style.backgroundImage = "url('assets/eric/forest.jpg')";
  this.className = 'selected';
  document.getElementById('eric-background-color').className = '';
  document.getElementById('eric-bg2').className = '';
  document.getElementById('eric-bg3').className = '';
};

document.getElementById('eric-bg2').onclick = function() {
  ericCanvas.style.backgroundImage = "url('assets/eric/chs.jpg')";
  this.className = 'selected';
  document.getElementById('eric-background-color').className = '';
  document.getElementById('eric-bg1').className = '';
  document.getElementById('eric-bg3').className = '';
};

document.getElementById('eric-bg3').onclick = function() {
  ericCanvas.style.backgroundImage = "url('assets/eric/beach.jpg')";
  this.className = 'selected';
  document.getElementById('eric-background-color').className = '';
  document.getElementById('eric-bg1').className = '';
  document.getElementById('eric-bg2').className = '';
};

function Ball(x, y, radius) {
  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 1;
  this.radius = radius;

  //init
  ballElem.style.width = this.radius*2 + 'px';
  ballElem.style.height = this.radius*2 + 'px';

  if(ballImg != '') {
    ballElem.style.background = '';
    ballElem.style.backgroundImage = ballImg;
    ballElem.style.backgroundSize = 'cover';
  } else {
    ballElem.style.background = ballColor;
  }

  this.draw = function() {
    this.x += this.vx;
    this.y += this.vy;
    ballElem.style.left = this.x - this.radius + 'px';
    ballElem.style.top = this.y - this.radius + 'px';
  };

  this.update = function() {
    if (this.vy > 0 && this.y + parseInt(this.radius) >= 500) {
      this.vy = (this.vy * -1);
      if(this.vy + 1/2 < 0) { this.vy += 1/2;}
    } else {
      this.vy += 1/30;
    }
    this.draw();
  }
}

var ericUpdate = function() {
  var b = ball[0];
  if (b){ b.update(); }
}

document.getElementById('eric-simulation').onclick = function(e) {
  ball = [];
  ball.push(new Ball(e.pageX, e.pageY, document.getElementById('eric-radius').value));
}

window.setInterval(function(){ ericUpdate(); }, 3);
