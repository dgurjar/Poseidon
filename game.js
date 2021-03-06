/* POSEIDON */
/*----------*/
/* Created for 15-237 by:
 * Cory Williams	(cjwillia) 
 * Dev Gurjar		(dgurjar)
 * Sank Kulshreshta (sankalpk)
 */

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

//Counts how close we are to completing each of the 4 slots
var progressCounter = [0, 0, 0, 0];


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
var TIMER_INITIAL=5000;

//Sizes
var BUBBLE_SIZE = 20;
var PROJECTILE_SIZE = 60;

//How many letters need to reach the destination for a win
var LETTER_COUNT_WIN = 1;



//---------------------------SCREEN:INSTRUCTIONS
//##############################################
function initInstructions(){
  drawMenuBackground();
  drawInstructionsTitle();
  instructionsInfo=new Instructions();
}

function Instructions() {
  this.instructionsIndex=0;
  this.instructionsList=[
  new Instruction('arrows.jpg',
                  'Use the left and right arrow keys to navigate the instructions.'),
  new Instruction('drowning.jpg', 
                  'A person is drowning trying to scream for help. You are Poseidon. Save them from running out of air.'), 
  new Instruction('trident.png', 
                  'Use your trident (left click and drag) to draw currents and guide the "help bubbles"'), 
  new Instruction('space.jpg',
                  'While playing the game, hit the space button to delete your currents'),
  new Instruction('rock.gif',
                  'Watch out for the rocks. They will pop the "help" bubbles.'),
  new Instruction('escape.jpg',
                  'Hit the escape key at any point (now or in the game) to return to the main menu.')]; 
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
  //if easy button
  if(x>=(WIDTH*.25) &&x<=(WIDTH*.75)&&y>=(HEIGHT*.3) && y<=(HEIGHT*.3+80)) {
    setEasy();
    state=3;
  }
  //else medium button
  else if(x>=(WIDTH*.25) &&x<=(WIDTH*.75)&&y>=(HEIGHT*.3+100) && y<=(HEIGHT*.3+180)){
    setMedium();
    state=3;
  }
  //else if hard button
  else if(x>=(WIDTH*.25) &&x<=(WIDTH*.75)&&y>=(HEIGHT*.3+200) && y<=(HEIGHT*.3+280)){
    setHard();
    state=3;
  }
}

function setEasy(){
  PROJECTILE_SPAWN_TRESHOLD = 25;
  BUBBLE_SPAWN_THRESHOLD = 28;
  LETTER_COUNT_WIN = 1;
}

function setMedium(){
  PROJECTILE_SPAWN_TRESHOLD = 22;
  BUBBLE_SPAWN_THRESHOLD = 29;
  LETTER_COUNT_WIN = 2;
}

function setHard(){
  PROJECTILE_SPAWN_TRESHOLD = 20;
  BUBBLE_SPAWN_THRESHOLD = 30;
  LETTER_COUNT_WIN = 3;
}

function drawDifficultyTitle(){
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#223947";
  ctx.fillText("DIFFICULTY",WIDTH*.5, HEIGHT*.2+5);
  ctx.fillStyle = "white";
  ctx.fillText("DIFFICULTY",WIDTH*.5, HEIGHT*.2);
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
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("POSEIDON",WIDTH*.5, HEIGHT*.2+10);
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
  removeTridentCursor();
  drawMenuBackground();
  drawMenuTitle();
  drawMenuButtons();
}

//---------------------------SCREEN:GAME
//######################################
function initializeGameInfo(){
  addTridentCursor();
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
}


function onMouseMoveGame(event){
    if(isDrawing){
      var x = event.pageX - canvas.offsetLeft;
      var y = event.pageY - canvas.offsetTop;
      var blockCoords = getCurrentBlockCoords(x,y);
      var path = gameInfo.currents[currentIndex].path;
      if(!(blockClaimed(blockCoords)) && path!==undefined){
        path.push(blockCoords);
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

function addTridentCursor(){
  canvas.style.cursor="url(trident.png) 0 0,auto";
}

function removeTridentCursor(){
  canvas.style.cursor="auto";
}
function initGame(){
  gameInfo = initializeGameInfo();
  redrawAllGame();
}

function redrawAllGame(){
  ctx.clearRect(0, 0, 400, 800);
  drawBackground();
  drawDrowningMan();
  drawCurrents();
  drawBubbles();
  drawProjectiles();
  drawTimer();
  drawLetterDest();
}

function drawBackground(){
  var grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  grad.addColorStop(1, '#003146');
  grad.addColorStop(0, '#4E84A6');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0, WIDTH, HEIGHT);
}

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
    /* If this bubble reached its destination, color it differently */
    if(e.didReachDest)
      ctx.fillStyle = "rgba(255,255, 0,.5)";
    else
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
    var image = new Image();
    image.src = "rock.gif";
      
    //TODO: Rotate the projectiles
    var spriteIndex = (animationCounter%36);
    ctx.drawImage(image,0,0,300,215,
                  e.position[0]-PROJECTILE_SIZE/2, 
                  e.position[1]-PROJECTILE_SIZE/2, 
                  PROJECTILE_SIZE, PROJECTILE_SIZE);
  });
}

function drawLetterDest(){
  ctx.beginPath();
  ctx.font = "30px Arial";
  ctx.fillStyle = "rgba(0,0,0, .5)";
  ctx.textAlign = "left";
  ctx.fillText("H", (WIDTH*.125*1), 30);
  ctx.fillText("E", (WIDTH*.125*3), 30);
  ctx.fillText("L", (WIDTH*.125*5), 30);
  ctx.fillText("P", (WIDTH*.125*7), 30);

  /* Feedback for how many more letters you need in the dest */
  ctx.font = "20px Arial";
  ctx.fillText(Math.min(LETTER_COUNT_WIN, progressCounter[0])+"/"+LETTER_COUNT_WIN,
              (WIDTH*.125*1), 50);
  ctx.fillText(Math.min(LETTER_COUNT_WIN, progressCounter[1])+"/"+LETTER_COUNT_WIN, 
              (WIDTH*.125*3), 50);
  ctx.fillText(Math.min(LETTER_COUNT_WIN, progressCounter[2])+"/"+LETTER_COUNT_WIN,
              (WIDTH*.125*5), 50);
  ctx.fillText(Math.min(LETTER_COUNT_WIN, progressCounter[3])+"/"+LETTER_COUNT_WIN,
              (WIDTH*.125*7), 50);
}

function drawTimer(){
  //Create number
  ctx.beginPath();
  ctx.font = "15px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText("Air",WIDTH-40,HEIGHT-20);

  //Create progress bar
  ctx.fillStyle = "rgba(255, 255, 255, .8)" //transparent white
  ctx.fillRect(WIDTH-13, HEIGHT-HEIGHT*(gameInfo.timer/TIMER_INITIAL),10, HEIGHT*(gameInfo.timer/TIMER_INITIAL));
}

//Draws and animates the drowning man using a simple sprite
function drawDrowningMan(){
  var image = new Image();
  image.src = "drowning_sprite.png";

  var spriteIndex = (animationCounter%36);

  if(spriteIndex <9)
    ctx.drawImage(image,0,0,219,317,WIDTH/2-55,HEIGHT-159,110,159);
  else if(spriteIndex < 18)
    ctx.drawImage(image,219*1,0,219,317,WIDTH/2-55,HEIGHT-159,110,159);
  else if(spriteIndex <27)
    ctx.drawImage(image,219*2,0,219,317,WIDTH/2-55,HEIGHT-159,110,159);
  else
    ctx.drawImage(image,219*1,0,219,317,WIDTH/2-55,HEIGHT-159,110,159);
}

function addBubble(){
  var bubble;
  bubble = new Object();
  bubble.letter = LETTERS[Math.floor(Math.random()*4)];
  bubble.position = [Math.floor(Math.random()*WIDTH + 1), HEIGHT];
  bubble.currentPath = [];
  bubble.didReachDest = false;
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
    //Check if the bubble reached where it is supposed to
    if(!e.didReachDest &&  e.position[1] <= (HEIGHT*.1)){
      if(e.position[1]<=0)
        toRemove.push(i);
      if(determineBubbleSuccess(e.letter, e.position[0])){
        if(e.letter === "H")
          progressCounter[0]++;
        else if(e.letter === "E")
          progressCounter[1]++;
        else if(e.letter === "L")
          progressCounter[2]++;
        else if(e.letter === "P")
          progressCounter[3]++;

        //This triggers the bubble to be recolored
        e.didReachDest = true;

        //If we have won, transisiton states
        if(isWin())
          state = 11;

      }
    }
  });
  toRemove.forEach(function(e){
    gameInfo.bubbles.splice(e, 1);
  });
}

//Simple win condition that checks if each destination has recieved the
//right number of buckets
function isWin(){
  for(var i = 0; i<progressCounter.length; i++){
    if(progressCounter[i] < LETTER_COUNT_WIN)
      return false;
  }
  return true;
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


//TODO: Animate this later
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
      b.position[0] = b.position[0] + (xdist > 0 ? Math.floor(xdist, 1) : Math.ceil(xdist, -1));
      b.position[1] = b.position[1] + (ydist > 0 ? Math.floor(ydist, 1) : Math.ceil(ydist, -1));
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
    if(gameInfo.timer !== 0) gameInfo.timer -= 1;
    else if(gameInfo.timer === 0) state=5;
    redrawAllGame();
    animationCounter = animationCounter+1;
}
//---------------------------SCREEN:END
//#####################################
function initEndScreen(){
  ctx.clearRect(0, 0, 400, 800);
  drawMenuBackground();
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("GAME OVER",WIDTH*.5, HEIGHT*.2);
  ctx.font="15px Arial";
  ctx.fillText("Get better. Play more. Save people.",WIDTH*.5,HEIGHT*.2+35);
  ctx.fillText("Hit the escape key to return to the main menu.",WIDTH*.5,HEIGHT*.2+55);
  var img = new Image();
  //load image
  img.onload = function() {
    ctx.drawImage(img, WIDTH*.1, HEIGHT*.2+100, WIDTH*.8, HEIGHT*.3);
  }
  img.src ='poseidonfail.jpg';
}

function onKeyDownEndScreen(event){
  var keyCode = event.keyCode;
  //escape key
  if (keyCode===27) state=1;
}

//--------------------------SCREEN:WINNING
//########################################
function initWinScreen(){
  ctx.clearRect(0, 0, 400, 800);
  drawMenuBackground();
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("THEY'RE SAFE!",WIDTH*.5, HEIGHT*.2);
  ctx.font="15px Arial";
    ctx.fillText("You guided the currents and they were able to call for help.",WIDTH*.5,HEIGHT*.2+35);
  ctx.fillText("Saving lives is awesome. You are awesome.",WIDTH*.5,HEIGHT*.2+55);
  ctx.fillText("Hit the escape key to return to the main menu.",WIDTH*.5,HEIGHT*.2+75);

  var img = new Image();
  //load image
  img.onload = function() {
    ctx.drawImage(img, WIDTH*.1, HEIGHT*.2+100, WIDTH*.8, HEIGHT*.3);
  }
  img.src ='poseidonwin.jpg';
}

function onKeyDownWinScreen(event){
  var keyCode = event.keyCode;
  //escape key
  if (keyCode===27) state=1;
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
    onKeyDownEndScreen(event);
    break;
  case 7: //initialize instructions
    break;
  case 8: //currently in instructions
    onKeyDownInstructions(event);
    break;
  case 12:
    onKeyDownWinScreen(event);
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
  case 11:
    initWinScreen();
    state=12;
    break;
  case 12:
    break;
  default:
    state=1;
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
