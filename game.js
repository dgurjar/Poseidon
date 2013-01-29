var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var gameInfo;
var instructionsInfo;

var intervalId;
var timerDelay = 100;

//Index of the current current. (confusing)
var currentIndex = -1;

//Set when the user is drawing a current
var isDrawing = 0;

//The last block the user was drawing
var lastBlock;

//Time counters for object spawning that actually always have similar values now that I think of it.
var projectileCounter = 0;
var bubbleCounter = 0;

//State, 1=menu, 2= in menu, 3=game, 4=in game, 5=game over, 6=in game over, 7=instructions, 8=in instructions,9=difficulty, 10=in difficulty, 11=winning, 12=in winning
var state=1;

//A counter for drawing the path of the current
var animationCounter = 0;

//-----------------------------CONSTANTS
//######################################

//The lower the threshold, the more often it spawns.
var PROJECTILE_SPAWN_TRESHOLD = 20;
var BUBBLE_SPAWN_THRESHOLD = 30;

//Letters for the bubbles
var LETTERS = ["H", "E", "L", "P"];

//Width, Height
var WIDTH = 400;
var HEIGHT = 600;

//The number of current blocks along the width and height
//Note that this must have the same ration as the width and height
var CURRENTBLOCKS_W = 10;
var CURRENTBLOCKS_H = 10;

//Initial time
var TIMER_INITIAL=300;

//Sizes
var BUBBLE_SIZE = 20;
var PROJECTILE_SIZE = 60;



//---------------------------SCREEN:INSTRUCTIONS
//##############################################
function initInstructions(){
  drawMenuBackground();
  drawInstructionsTitle();
  instructionsInfo=new Instructions();
}

function Instructions() {
  this.instructionsIndex=0;
  this.instructionsList=[new Instruction('arrows.jpg','Use the left and right arrow keys to navigate the instructions.'), new Instruction('space.jpg','While playing the game, hit the space button to delete currents'),new Instruction('escape.jpg','Hit the escape key at any point (now or in the game) to return to the main menu.'),new Instruction('drowning.jpg',"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")];
  
  //methods

  this.nextInstruction=function(){
    if(this.instructionsIndex!==this.instructionsList.length-1)this.instructionsIndex+=1;
    this.drawCurrInstruction();
  }

  this.prevInstruction=function(){
    if(this.instructionsIndex!==0) this.instructionsIndex-=1;
    this.drawCurrInstruction();
  }
  
  this.drawInstruction=function(instruct){
    var img = new Image();
    //load image
    img.onload = function() {
      ctx.drawImage(img, WIDTH*.1, HEIGHT*.2, WIDTH*.8, HEIGHT*.3);
    }
    img.src =instruct.imgsrc;

    //write text
    ctx.font = "15px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";

    var strHeight=HEIGHT*.5+50;
    var arr=this.splitString(instruct.txt);
    var numLines=this.numLines(arr);
    for(var i=0;i<numLines;i++){
      ctx.fillText(arr[i],WIDTH*.5, strHeight);
      strHeight+=19;
    }
  }

  //sets the number of lines for a given array of text
  this.numLines=function(arr){
    if(arr.length<12) return arr.length
    else return 12;
  }

  //splits string into an array<=50 total 
  //chars each depending on size of last word
  this.splitString=function(x){
    var arr=[];
    var pointer1=0;
    var pointer2=0;

    while(pointer1<x.length){
      temp=x.substring(pointer1,pointer1+50);
      if(temp.length<50) {
        arr.push(temp);
        break;
      }
      else {
        pointer2=pointer1+temp.lastIndexOf(" ");
        arr.push(x.substring(pointer1,pointer2));
      }
      pointer1=pointer2;
    }
    return arr;
  }


  this.drawCurrInstruction=function(){
    //clears the current space
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    drawMenuBackground();
    drawInstructionsTitle();
    this.drawInstruction(this.instructionsList[this.instructionsIndex]);
  }
}

//image should be in ratio of 16x9
//if not it will get distorted when drawn
function Instruction(imgsrc,txt){
  this.txt=txt;
  this.imgsrc=imgsrc;
}

function drawInstructionsTitle(){
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#223947";
  ctx.fillText("Game Play",WIDTH*.5, HEIGHT*.12);
}


function onKeyDownInstructions(event){
  var keyCode = event.keyCode;
  //left key
  if(keyCode===37) instructionsInfo.prevInstruction();
  //right key
  else if (keyCode===39) instructionsInfo.nextInstruction();
  //escape key
  else if (keyCode===27) state=1;
}

//---------------------------SCREEN:DIFFICULTY
//############################################
function initDifficulty() {
  drawMenuBackground();
  drawDifficultyTitle();
  drawDifficultyButtons();
}

function onMouseUpDifficulty(event)
{
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  console.log("x:"+x+" y:"+y);
  //if button1
  if(x>=(WIDTH*.25) &&x<=(WIDTH*.75)&&y>=(HEIGHT*.3) && y<=(HEIGHT*.3+80)) {
    setEasy();
    state=3;
  }
  //else button2
  else if(x>=(WIDTH*.25) &&x<=(WIDTH*.75)&&y>=(HEIGHT*.3+100) && y<=(HEIGHT*.3+180)){
    setMedium();
    state=3;
  }

  //else if button3
  else if(x>=(WIDTH*.25) &&x<=(WIDTH*.75)&&y>=(HEIGHT*.3+200) && y<=(HEIGHT*.3+280)){
    setHard();
    state=3;
  }
}

function setEasy(){ //todo: change numbers according to difficulty
  PROJECTILE_SPAWN_TRESHOLD = 20;
  BUBBLE_SPAWN_THRESHOLD = 30;
  TIMER_INITIAL = 300;
}

function setMedium(){ //todo: change numbers according to difficulty
  PROJECTILE_SPAWN_TRESHOLD = 20;
  BUBBLE_SPAWN_THRESHOLD = 30;
  TIMER_INITIAL = 300;
}

function setHard(){ //todo: change numbers according to difficulty
  PROJECTILE_SPAWN_TRESHOLD = 20;
  BUBBLE_SPAWN_THRESHOLD = 30;
  TIMER_INITIAL = 300;
}

function drawDifficultyTitle(){
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#223947";
  ctx.fillText("Difficulty",WIDTH*.5, HEIGHT*.2);
}

function drawDifficultyButtons(){
  ctx.font = "25px Arial";
  ctx.textAlign = "center";

  //button1
  ctx.fillStyle="white";
  roundedRect(ctx,WIDTH*.25,HEIGHT*.3,WIDTH*.5,80,15);
  ctx.fillStyle="black";
  ctx.fillText("Easy",WIDTH*.5, HEIGHT*.3+50);

  //button2
  ctx.fillStyle="#ffffff";
  roundedRect(ctx,WIDTH*.25,HEIGHT*.3+100,WIDTH*.5,80,15);
  ctx.fillStyle="black";
  ctx.fillText("Medium",WIDTH*.5, HEIGHT*.3+150);

  //button3
  ctx.fillStyle="#ffffff";
  roundedRect(ctx,WIDTH*.25,HEIGHT*.3+200,WIDTH*.5,80,15);
  ctx.fillStyle="black";
  ctx.fillText("Hard",WIDTH*.5, HEIGHT*.3+250);
}


//---------------------------SCREEN:MENU
//######################################

function onMouseUpMenu(event)
{
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  console.log("x:"+x+" y:"+y);
  //if box1
  if(x>=(WIDTH*.25) &&x<=(WIDTH*.75)&&y>=(HEIGHT*.3) && y<=(HEIGHT*.3+80)) {
    state=9;
  }
  //else if box2
  else if(x>=(WIDTH*.25) &&x<=(WIDTH*.75)&&y>=(HEIGHT*.3+100) && y<=(HEIGHT*.3+180)){
    state=7;
  }
}

function drawMenuTitle(){
  ctx.font = "bold 50px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#223947";
  ctx.fillText("POSEIDON",WIDTH*.5, HEIGHT*.2);
}

function drawMenuBackground(){
  var grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  grad.addColorStop(1, '#003146');
  grad.addColorStop(0, '#4E84A6');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0, WIDTH, HEIGHT);
}

function drawMenuButtons(){
  ctx.font = "25px Arial";
  ctx.textAlign = "center";

  //button1
  ctx.fillStyle="white";
  roundedRect(ctx,WIDTH*.25,HEIGHT*.3,WIDTH*.5,80,15);
  ctx.fillStyle="black";
  ctx.fillText("Begin Game",WIDTH*.5, HEIGHT*.3+50);

  //button2
  ctx.fillStyle="#ffffff";
  roundedRect(ctx,WIDTH*.25,HEIGHT*.3+100,WIDTH*.5,80,15);
  ctx.fillStyle="black";
  ctx.fillText("Instructions",WIDTH*.5, HEIGHT*.3+150);
}

function initMenu() {
  drawMenuBackground();
  drawMenuTitle();
  drawMenuButtons();
}

//---------------------------SCREEN:GAME
//######################################
function initializeGameInfo(){
  var gameInfo = new Object();
  gameInfo.timer = TIMER_INITIAL;
  gameInfo.currentRemaining = 1000;
  gameInfo.projectiles = [];
  gameInfo.bubbles = [];
  gameInfo.currents = [];
  gameInfo.grid = {};
  return gameInfo;
}

/* Given normal x,y coordinates on the canvas, returns the correspoinding block coordinates */
function getCurrentBlockCoords(x, y){ 
  return [Math.floor(x/CURRENTBLOCKS_W) , Math.floor(y/CURRENTBLOCKS_H)];
}

/* Given a set of block coordinates, returns the x,y coordinates of the center of that block. */
function blockCoordsToRealCoords(bx, by){
  return [bx*CURRENTBLOCKS_W + Math.floor(CURRENTBLOCKS_W/2), by*CURRENTBLOCKS_H + Math.floor(CURRENTBLOCKS_H/2)];
}

/* Given a block's coordinates, returns whether or not that block is in a current */
function blockClaimed(blockCoords){
  return gameInfo.grid[blockCoords] || false;  //uses the falsiness of the undefined value.
}

//TODO: Fix the way currents are rendered and stored
function onMouseDownGame(event)
{
  //start drawing the current or start creating the current, however we want it implemented.
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  var blockCoords = getCurrentBlockCoords(x,y);
  
  if(!(blockClaimed(blockCoords))){
    //This is a new current
    var newCurr = new Object();
    newCurr.path = [blockCoords];
    newCurr.ready = false;
    currentIndex = gameInfo.currents.push(newCurr) - 1;
    isDrawing = 1;

    gameInfo.grid[blockCoords] = true;

    lastBlock = blockCoords;
  }

  //console.log("Mouse Down: " + x + ", " + y);
}


function onMouseMoveGame(event){
    if(isDrawing){
      var x = event.pageX - canvas.offsetLeft;
      var y = event.pageY - canvas.offsetTop;
      var blockCoords = getCurrentBlockCoords(x,y);
      if(!(blockClaimed(blockCoords))){
        gameInfo.currents[currentIndex].path.push(blockCoords);
        gameInfo.grid[blockCoords] = true;
        lastBlock = blockCoords;
      }
      //if the user draws a current that hits another current, rather than warping underwater space-time, just delete the current and stop drawing.
      else{
        if(!(blockCoords.toString() == lastBlock.toString())){
          isDrawing = 0;
          gameInfo.currents[currentIndex].path.forEach(function(e){
            gameInfo.grid[e] = false;
          });
          gameInfo.currents.pop();
          currentIndex = -1;
          lastBlock = null;
          console.log("stopped drawing.");
        }
      }
    }
}

function onMouseUpGame(event){
  if(isDrawing){
    //stop drawing the current
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    var c = gameInfo.currents[currentIndex];

    //TODO: Re-add current measurement, restrict current from being drawn if not enough "ink"
    c.ready = true;
    currentIndex = -1;
    isDrawing = 0;
    lastBlock = null;
  }
}

function onKeyDownGame(event){
  var keyCode = event.keyCode;
  //if r
  if(keyCode === 82){
    initGame();
  }
  //if space
  else if(keyCode === 32){
    event.preventDefault(); //stops browser from scrolling by default
    deleteCurrents();
  }
  //if escape
  else if(keyCode===27){
    state=1;
  }
  
}

function initGame(){
  gameInfo = initializeGameInfo();
  redrawAllGame();
}

function redrawAllGame(){
  ctx.clearRect(0, 0, 400, 800);
  drawBackground();
  drawCurrents();
  drawBubbles();
  drawProjectiles();
  drawTimer();
}

function drawBackground(){
  var grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  grad.addColorStop(1, '#003146');
  grad.addColorStop(0, '#4E84A6');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0, WIDTH, HEIGHT);
}

//TODO: We want to save the currents and then redraw them
function drawCurrents(){
  gameInfo.currents.forEach(function(e){
    //Draw without alpha
    if(e.ready){
      for(var i = 0; i<e.path.length; i++){
        if(i == (animationCounter%e.path.length))
          ctx.fillStyle = "rgba(0,0,255,.2)";
        else
          ctx.fillStyle = "rgba(0,0,255,1)";

        //One wave above
        ctx.fillRect(e.path[i][0]*CURRENTBLOCKS_W, (e.path[i][1]+2)*(CURRENTBLOCKS_H), CURRENTBLOCKS_W, CURRENTBLOCKS_H);
        //One wave below
        ctx.fillRect(e.path[i][0]*CURRENTBLOCKS_W, (e.path[i][1]-2)*(CURRENTBLOCKS_H), CURRENTBLOCKS_W, CURRENTBLOCKS_H);        
        //Main wave
        ctx.fillRect(e.path[i][0]*CURRENTBLOCKS_W, e.path[i][1]*CURRENTBLOCKS_H, CURRENTBLOCKS_W, CURRENTBLOCKS_H);
      }
    }
    //Draw current with alpha since it is not activated yet
    else{
      for(var i = 0; i<e.path.length; i++){
        ctx.fillStyle = "rgba(0,0,255,.1)";
        //One wave above
        ctx.fillRect(e.path[i][0]*CURRENTBLOCKS_W, (e.path[i][1]+2)*(CURRENTBLOCKS_H), CURRENTBLOCKS_W, CURRENTBLOCKS_H);
        //One wave below
        ctx.fillRect(e.path[i][0]*CURRENTBLOCKS_W, (e.path[i][1]-2)*(CURRENTBLOCKS_H), CURRENTBLOCKS_W, CURRENTBLOCKS_H);        
        //Main wave
        ctx.fillRect(e.path[i][0]*CURRENTBLOCKS_W, e.path[i][1]*CURRENTBLOCKS_H, CURRENTBLOCKS_W, CURRENTBLOCKS_H);
      }
    }
  });
}

function deleteCurrents(){
  gameInfo.currents=[];
  gameInfo.grid={};
  gameInfo.bubbles.forEach(function(e){
    e.currentPath = [];
  });
}

function drawBubbles(){
  gameInfo.bubbles.forEach(function(e){
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.beginPath();
    ctx.arc(e.position[0], e.position[1], BUBBLE_SIZE, 0, 2*Math.PI, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(e.letter, e.position[0], e.position[1]+12);
  });
}

function drawProjectiles(){
  gameInfo.projectiles.forEach(function(e){
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.fillRect(e.position[0]-PROJECTILE_SIZE/2, e.position[1]-PROJECTILE_SIZE/2, PROJECTILE_SIZE, PROJECTILE_SIZE);
  });
}

function drawTimer(){
  //Create number
  ctx.beginPath();
  ctx.font = "15px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.fillText("Air",10,30);
  //ctx.fillText(gameInfo.timer + "", 40, 40);

  //Create progress bar
  ctx.fillStyle = "#1826B0" //blue
  ctx.fillRect(10, 5,WIDTH*.9*(gameInfo.timer/TIMER_INITIAL),10);
}

function addBubble(){
  var bubble;
  bubble = new Object();
  bubble.letter = LETTERS[Math.floor(Math.random()*4)];
  bubble.position = [Math.floor(Math.random()*WIDTH + 1), HEIGHT];
  bubble.currentPath = [];
  gameInfo.bubbles.push(bubble);
}

function determineBubbleSuccess(letter, x){
  switch(letter){
    case "H":
      return (x >=0 && x <= Math.floor(WIDTH/4));
      break;
    case "E":
      return (x >= Math.floor(WIDTH/4) && x <= Math.floor(WIDTH/2));
      break;
    case "L":
      return (x >= Math.floor(WIDTH/2) && x <= (WIDTH - Math.floor(WIDTH/4)));
      break;
    case "P":
      return (x >= (WIDTH - Math.floor(WIDTH/4)) && x <= WIDTH);
      break;
  }
}

function updateAndRemoveBubbles(){
  var toRemove = [];
  gameInfo.bubbles.forEach(function(e, i){
    if(e.currentPath.length === 0){
      e.position[1] = e.position[1] - 5;
    }
    if(e.position[1] <= 0){
      toRemove.push(i);
      if(determineBubbleSuccess(e.letter, e.position[0])){
        //TODO: Increment the score or reward the player here.
      }
    }
  });
  toRemove.forEach(function(e){
    gameInfo.bubbles.splice(e, 1);
  });
}

function updateBubbles(){
  if(Math.floor(Math.random()*2 + 1) % 2 === 0){
    bubbleCounter++;
    if(bubbleCounter % BUBBLE_SPAWN_THRESHOLD === 0){
      addBubble();
    }
  }
  updateAndRemoveBubbles();
}

function addProjectile(){
  var proj = new Object();
  proj.speed = Math.floor(Math.random()*5 + 1);
  proj.position = [Math.floor(Math.random()*WIDTH + 1), -50];
  gameInfo.projectiles.push(proj);
}

function updateAndRemoveProjectiles(){
  var toRemove = [];
  gameInfo.projectiles.forEach(function(e, i){
    e.position[1] = e.position[1] + e.speed;
    if(e.position[1] >= HEIGHT + 100){
      toRemove.push(i);
    }
  });
  toRemove.forEach(function(e){
    gameInfo.projectiles.splice(e, 1);
  });
}

function updateProjectiles(){
  if(Math.floor(Math.random()*2 + 1) % 2 === 0){
    projectileCounter++;
    if(projectileCounter % PROJECTILE_SPAWN_TRESHOLD === 0){
      addProjectile();
    }
  }
  updateAndRemoveProjectiles();
}

/* Helper function to see if 2 LTRB rectangles overlap */
function isOverlapping(a, b){
  return !(a[0] > b[2] || a[1] > b[3] || a[2] < b[0] || a[3] < b[1]);
}

function popBubbles(bcoords, pcoords){
  var toClear = [];
  bcoords.forEach(function(bc, i){
    var collisionDetected = pcoords.some(function(pc){
      return isOverlapping(bc, pc);
    });
    if(collisionDetected){
      toClear.push(i);
    }
  });

  toClear.forEach(function(e){
    gameInfo.bubbles.splice(e, 1);
  });
}

function lockCurrentBubbles(bcoords){
  bcoords.forEach(function(bc, i){
    //so bubbles will never enter a current from above
    var blockCoords = [];
    var setPath = function(c){
      if(c.ready){
          c.path.some(function(coord, j, a){
            if(blockCoords.toString() === coord.toString()){
              gameInfo.bubbles[i].currentPath = a.slice(j, a.length);
              return true;
            }
            return false;
          });
        }
      }
    if(gameInfo.grid[getCurrentBlockCoords(bc[0], bc[1])]){
      blockCoords = getCurrentBlockCoords(bc[0], bc[1]);
    }
    else if(gameInfo.grid[getCurrentBlockCoords(bc[2], bc[1])]){
      blockCoords = getCurrentBlockCoords(bc[2], bc[1]);
    }
    if(gameInfo.bubbles[i].currentPath.length === 0){
      gameInfo.currents.some(setPath);
    }
  });
}

function advanceLockedBubbles(){
  gameInfo.bubbles.forEach(function(b){
    if(b.currentPath.length !== 0){
      var destCoords = blockCoordsToRealCoords(b.currentPath[0][0], b.currentPath[0][1]);
      var xdist = destCoords[0] - b.position[0];
      var ydist = destCoords[1] - b.position[1];
      //console.log("destcoords x: " + destCoords[0] + " destCoords y: " + destCoords[1]);
      //console.log("Before: " + b.position[0] + ", " + b.position[1]);
      //console.log("xdist: " + xdist + ", ydist: " + ydist);
      b.position[0] = b.position[0] + (xdist > 0 ? Math.floor(xdist, 1) : Math.ceil(xdist, -1));
      b.position[1] = b.position[1] + (ydist > 0 ? Math.floor(ydist, 1) : Math.ceil(ydist, -1));
      //console.log("+      " + (xdist > 0 ? Math.floor(xdist, 3) : Math.ceil(xdist, -3)) + ", " + (ydist > 0 ? Math.floor(ydist, 3) : Math.ceil(ydist, -3)));
      //console.log("After: " + b.position[0] + ", " + b.position[1]);
      if(b.position.toString() === destCoords.toString()){
        b.currentPath.splice(0, 1);
        //this is a temporary solution to a bubble being caught in its last block of current forever.
        if(b.currentPath.length === 0){
          b.position[1] -= CURRENTBLOCKS_H / 2 + 1;
        }
      }
    }
  })
}

function detectCollisions(){
  var bubblecoords = [];
  gameInfo.bubbles.forEach(function(b){
    bubblecoords.push([b.position[0]-BUBBLE_SIZE/2, b.position[1]-BUBBLE_SIZE/2, b.position[0]+BUBBLE_SIZE/2, b.position[1]+BUBBLE_SIZE/2]);
  });
  var projectilecoords = [];
  gameInfo.projectiles.forEach(function(p){
    projectilecoords.push([p.position[0]-PROJECTILE_SIZE/2, p.position[1]-PROJECTILE_SIZE/2, p.position[0]+PROJECTILE_SIZE/2, p.position[1]+PROJECTILE_SIZE/2]);
  });
  popBubbles(bubblecoords, projectilecoords);
  bubblecoords = [];
  gameInfo.bubbles.forEach(function(b){
    bubblecoords.push([b.position[0]-BUBBLE_SIZE/2, b.position[1]-BUBBLE_SIZE/2, b.position[0]+BUBBLE_SIZE/2, b.position[1]+BUBBLE_SIZE/2]);
  });
  lockCurrentBubbles(bubblecoords);
  advanceLockedBubbles();
}

function updateGame(){
    updateBubbles();
    updateProjectiles();
    detectCollisions();
    if(gameInfo.timer != 0){
      gameInfo.timer -= 1;
    }
    redrawAllGame();
    //TODO: Change 100 to the max length of any 1 current
    animationCounter = (animationCounter>=100) ? 0 : animationCounter+1;
}
//---------------------------SCREEN:END
//#####################################
function initEndScreen(){
  ctx.clearRect(0, 0, 400, 800);
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("END OF GAME",WIDTH*.5, HEIGHT*.2);
}

//--------------------------SCREEN:WINNING
//########################################
function initEndScreen(){
  ctx.clearRect(0, 0, 400, 800);
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("YOU WON!",WIDTH*.5, HEIGHT*.2);
}

//---------------------------MISCELLANEOUS METHODS
////##############################################

function roundedRect(ctx,x,y,width,height,radius){
    ctx.beginPath();
    ctx.moveTo(x,y+radius);
    ctx.lineTo(x,y+height-radius);
    ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
    ctx.lineTo(x+width-radius,y+height);
    ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
    ctx.lineTo(x+width,y+radius);
    ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
    ctx.lineTo(x+radius,y);
    ctx.quadraticCurveTo(x,y,x,y+radius);
    ctx.fill();
}

//distance helper
function lineDistance(x, y, x0, y0){
  return Math.abs(Math.sqrt((x -= x0) * x + (y -= y0) * y));
}

//---------------------------EVENT LISTENERS
//##########################################
function onKeyDown(event){
  switch(state) {
  case 1: //initialize menu
    break;
  case 2: //currently in menu
    break;
  case 3: //initialize game
    break;
  case 4: //currently in game
    onKeyDownGame(event);
    break;
  case 5: //initialize end screen
    break;
  case 6: //currently in end screen
    break;
  case 7: //initialize instructions
    break;
  case 8: //currently in instructions
    onKeyDownInstructions(event);
    break;
  }
}



function onMouseDown(event){
  switch(state) {
  case 1: //initialize menu
    break;
  case 2: //currently in menu
    break;
  case 3: //initialize game
    break;
  case 4: //currently in game
    onMouseDownGame(event);
    break;
  case 5: //initialize end screen
    break;
  case 6: //currently in end screen
    break;
  }
}

function onMouseUp(event){
  switch(state) {
  case 1: //initialize menu
    break;
  case 2: //currently in menu
    onMouseUpMenu(event);
    break;
  case 3: //initialize game
    break;
  case 4: //currently in game
    onMouseUpGame(event);
    break;
  case 5: //initialize end screen
    break;
  case 6: //currently in end screen
    break;
  case 9:
    break;
  case 10:
    onMouseUpDifficulty(event);
    break;
  }
}

function onMouseMove(event){
  switch(state) {
  case 1: //initialize menu
    break;
  case 2: //currently in menu
    break;
  case 3: //initialize game
    break;
  case 4: //currently in game
    onMouseMoveGame(event);
    break;
  case 5: //initialize end screen
    break;
  case 6: //currently in end screen
    break;
  }
}

//---------------------------INITIAL SETUP
//########################################
function onTimer(){ //todo:add default state to everything
  switch(state) {
  case 1: //initialize menu
    initMenu();
    state=2;
    break;
  case 2: //currently in menu (not used, if we do a start animation, then we will need it)
    break;
  case 3: //initialize game
    initGame();
    state=4;
    break;
  case 4: //currently in game
    updateGame();
    break;
  case 5: //initialize end screen
    initEndScreen();
    state=6;
    break;
  case 6: //currently in end screen
    break;
  case 7: //initialize instructions
    initInstructions();
    instructionsInfo.drawCurrInstruction();
    state=8; 
    break;
  case 8: //in instructions
    break;
  case 9: //in difficulty
    initDifficulty();
    state=10;
    break;
  case 10:
    break;
  default:
    state=1;
    break;
  }
}

function run(){
  canvas.addEventListener('keydown', onKeyDown, false);
  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mousemove', onMouseMove, false);
  canvas.setAttribute('tabindex', 0);
  canvas.focus();
  intervalId = setInterval(onTimer, timerDelay);
}

run();
