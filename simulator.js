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


init();
