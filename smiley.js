

var smiley_screen_params = {
  smiley_size : 100,  // needs to agree with width/height from css file
  num_smilies: 8,
  level: 1
}
smiley_screen_params.live_smilies = smiley_screen_params.num_smilies;

var smiley = {
  top_position : 0,
  left_position : 0,
  jump_speed : 2,
  h_direction : 1,
  v_direction : 1,
  intvl_speed : 30,    // advance smiley every x milliseconds
  id : "smiley",
  imgfile: "smiley.png"
}

var game_intvl;        // for setInterval( ) to keep smilies moving
var bounceAudio = new Audio('bounce.wav');
var smilies = new Array();  // array to hold all the smilies

if (typeof Object.create !== 'function') {
    Object.create = function(o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    };
}

// s is a smiley object
function randomise_direction(s) {
  var hd = parseInt(Math.random()*2);
  var vd = parseInt(Math.random()*2);
  if (hd === 0)
    s.h_direction = -1;
  else
    s.h_direction = 1;
  if (vd === 0)
    s.v_direction = -1;
  else
    s.v_direction = 1;
}

function plotSmiley(index) {
  var sp = smilies[index];
  var existing_smiley = document.getElementById(sp.id);
  if (existing_smiley !== null)
    var smiley_to_plot = existing_smiley;
  else {
    var smiley_to_plot = document.createElement('img');
    smiley_to_plot.setAttribute('src', sp.imgfile);
    smiley_to_plot.setAttribute('id', sp.id);
    smiley_to_plot.style.position = 'absolute';
    document.getElementById("smileybox").appendChild(smiley_to_plot);
    smiley_to_plot.addEventListener('click', function() { clicked_smiley(sp) });
  }
  smiley_to_plot.style.top = sp.top_position + "px";
  smiley_to_plot.style.left = sp.left_position + "px";

}


function random_direction_change() {
  var r = parseInt(Math.random()*200);
  if (r===0)
    return true;
  else
    return false;
}


function moveFace() {
  var i;
  var sp;

  for (i=0; i < smilies.length; ++i) {
    // move i'th element
    sp = smilies[i];
    if (
      (sp.h_direction > 0 && sp.left_position >= smiley_screen_params.width - smiley_screen_params.smiley_size) ||
      (sp.h_direction < 0 && sp.left_position <= 0) ||
      (random_direction_change())
    ) {
      sp.h_direction = -sp.h_direction;  // hit left/right, bounce off (or random direction change)
    }
    if (
      (sp.v_direction > 0 && sp.top_position >= smiley_screen_params.height - smiley_screen_params.smiley_size) ||
      (sp.v_direction < 0 && sp.top_position <= 0) ||
      (random_direction_change())
    ) {
      sp.v_direction = -sp.v_direction;  // hit top/bottom, bounce off (or random direction change)
    }

    sp.top_position += sp.v_direction * sp.jump_speed;
    sp.left_position += sp.h_direction * sp.jump_speed;
    plotSmiley(i);
  }
  var current_time = parseInt(Date.now()/1000);
  var total_seconds = current_time - start_time;
  document.getElementById("time").innerHTML = "Time: " + total_seconds + " seconds";
}

function generateFaces() {
  var s;
  var i;
  var css_smileybox=document.getElementById("smileybox");
  var sb_style = getComputedStyle(css_smileybox, null);

  // add info to the screen params
  smiley_screen_params.width = parseInt(sb_style.width);
  smiley_screen_params.height = parseInt(sb_style.height);

  // create the smileys
  for (i=0; i < smiley_screen_params.num_smilies; ++i) {
    s = Object.create(smiley);
    s.id = "smiley" + i;
    s.top_position = parseInt(Math.random() * (smiley_screen_params.height - smiley_screen_params.smiley_size)),
    s.left_position = parseInt(Math.random() * (smiley_screen_params.width - smiley_screen_params.smiley_size)),
    randomise_direction(s);
    smilies.push(s);
  }
  game_intvl = setInterval( function() { moveFace() }, smiley.intvl_speed );
}


function remove_listeners( ) {
  var i;
  var existing_smiley;
  var smiley_to_plot;
  // could not figure out how to remove event listener for anonymous
  // function, so I am removing the element altogether and then plotting
  // againt without the listener.
  for (i=0; i < smiley_screen_params.num_smilies; ++i) {
    existing_smiley = document.getElementById(smilies[i].id);
    document.getElementById("smileybox").removeChild(existing_smiley);
  }
  for (i=0; i < smiley_screen_params.num_smilies; ++i) {
    smiley_to_plot = document.createElement('img');
    smiley_to_plot.setAttribute('src', smilies[i].imgfile);
    smiley_to_plot.setAttribute('id', smilies[i].id);
    smiley_to_plot.style.position = 'absolute';
    document.getElementById("smileybox").appendChild(smiley_to_plot);
    smiley_to_plot.style.top = smilies[i].top_position + "px";
    smiley_to_plot.style.left = smilies[i].left_position + "px";
  }
}

function clicked_smiley(sp) {
  if (sp.h_direction === 0 && sp.v_direction === 0) {
    // frozen smiley, now move it
    randomise_direction(sp);
    ++smiley_screen_params.live_smilies;
    sp.imgfile = "smiley.png";
    bounceAudio.play();
  }
  else {
    // moving smiley, now freeze it
    sp.h_direction = 0;
    sp.v_direction = 0;
    --smiley_screen_params.live_smilies;
    sp.imgfile = "frowny.png";
    bounceAudio.play();
  }
  var clicked_smiley;
  clicked_smiley = document.getElementById(sp.id);
  clicked_smiley.setAttribute('src', sp.imgfile);

  if (smiley_screen_params.live_smilies === 0) {
    clearInterval(game_intvl);
    remove_listeners(); // remove event listeners so that game ends
    var current_time = parseInt(Date.now()/1000);
    var total_seconds = current_time - start_time;
    smiley_screen_params.level += 1;
    document.getElementById("mg").innerHTML = "Completed in " + total_seconds + " seconds! <button onclick='play_again()'>Level " + smiley_screen_params.level + "</button>";
    document.getElementById("time").innerHTML = "Time: " + total_seconds + " seconds";
  }
  else
    document.getElementById("mg").innerHTML = "Number of smilies remaining: " + smiley_screen_params.live_smilies;
  // update screen time
}

function play_again() {
  var i;
  var existing_smiley;
  // remove all existing smilies
  for (i=0; i < smiley_screen_params.num_smilies; ++i) {
    existing_smiley = document.getElementById(smilies[i].id);
    document.getElementById("smileybox").removeChild(existing_smiley);
  }
  // clear out smilies array
  for (i=0; i < smiley_screen_params.num_smilies; ++i)
    smilies.pop();
  
  // increase the number of smilies
  smiley_screen_params.num_smilies = parseInt(smiley_screen_params.num_smilies * 1.2);

  // increase speed
  if (smiley.intvl_speed >= 3)
    smiley.intvl_speed -= 2;

  // reset the number of live smilies
  smiley_screen_params.live_smilies = smiley_screen_params.num_smilies;

  document.getElementById("mg").innerHTML = "Level " + smiley_screen_params.level + " with " + smiley_screen_params.num_smilies + " smilies!";
  start_time = parseInt(Date.now()/1000);
  generateFaces();
}

var start_time = parseInt(Date.now()/1000);
generateFaces();


