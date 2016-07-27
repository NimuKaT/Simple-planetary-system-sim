const canvas = document.getElementById('simulation');
const canvasContext = canvas.getContext('2d');


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
