const UNIVERSAL_GRAVITATIONAL_CONSTANT = 6.67e-11;
const KM_TO_PIXELS = 1/1e3; //subject to change
const COLLISION_THRESHOLD = 0.85;

var openTutorialWindow = function() {
  document.getElementById('tutorial').className = 'open';
};

var openCreation = function() {
  document.getElementById('object-creation').className = 'open';
};

var openSettings = function() {
  document.getElementById('settings').className = 'open';
};

var openLoadState = function() {
  document.getElementById('load-state').className = 'open';
};

var init = function() {
  document.getElementById('start').className = 'open';

  // tutorial button
  document.getElementById('str-btn-tutorial').addEventListener('click', function() {
    document.getElementById('start').className = '';
    openTutorialWindow();
  });

  // object creation button
  document.getElementById('str-btn-begin').addEventListener('click', function() {
    document.getElementById('start').className = '';
    openCreation();
  });

  // space settings button
  document.getElementById('str-btn-settings').addEventListener('click', function() {
    document.getElementById('start').className = '';
    openSettings();
  });

  // load state button
  document.getElementById('str-btn-loadstate').addEventListener('click', function() {
    document.getElementById('start').className = '';
    openLoadState();
  });
};

function planet (density, radius, color, x, y){
    this.density = density;
    this.radius = radius;
    this.color = color;
    this.x = x;
    this.y = y;
    this.volume = (4/3) * Math.PI * Math.pow(this.radius, 3);

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

    this.hitDetect = function(object_1, object_2){
        var hasHit = false;
        var x1 = object_1.x;
        var y1 = object_1.y;
        var r1 = object_1.radius;
        var x2 = object_2.x;
        var y2 = object_2.y;
        var r2 = object_2.radius;
        var distance = Math.root((x1 - x2)^2 + (y1 - y1)^2);
        if (distance >= COLLISION_THRESHOLD*(r1 + r2)){
            hasHit = true;
        };
        return hasHit;
    };

};



init();