const UNIVERSAL_GRAVITATIONAL_CONSTANT = 6.67e-11;
const KM_TO_PIXELS = 1/1e3; //subject to change

var magnificationMultiplyer = 1.0;
var currentCoordinate = 1;

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

function planet (density=1, radius=1, color='#ffffff', x=0, y=0){
    this.density = density;
    this.radius = radius;
    this.color = color;
    this.x = x;
    this.y = y;
    this.mass = (4/3) * math.PI * math.pow(this.radius, 3);

};

function main(){
    this.objects = [];

    this.createObject = function(){
        this.object.append(planet());
    }
    this.update = function(){

    };

}



init();