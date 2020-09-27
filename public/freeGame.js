let board;
let bgImg;
var player;
var roll = -1;
var selectedPin = -1;
var rollTimer = 0;
var socket;
var diceColor;

function preload() {
  let board = getURLParams().b;
  let url = `./board/${board}.json`;
  this.board = loadJSON(url);
  this.bgImg = loadImage(`./board/${board}.jpg`);
}

function setup() {
  createCanvas(720, 720);
  socket = io.connect(window.location.origin);

  this.player = this.board.player.map(x => x.start);
  background(this.bgImg);

  socket.emit('register');

  socket.on('start', function (data) {
    console.log('START=' + data);
    setInterval(movePin, 100);
    //IDC who I am... there are no turns
  });

  socket.on('movePin', data => {
    //console.log('movePin='+JSON.stringify(data))
    if (data.id !== selectedPin){
      let j = data.id%4;
      let i = (data.id-j)/4;

      player[i][j] = data.pos;
    }
  });

  socket.on('roll', function (data) {
    console.log('ROLL=' + data);
    roll = data;
    diceColor = color(random(128, 255),random(128, 255),random(128, 255));
  });

  socket.on('update', function (data) {
    player = data.player;
    console.log('UPDATE=' + data);
  });
}

function movePin() {
  if(selectedPin !== -1){
    let j = selectedPin%4;
    let i = (selectedPin-j)/4;
    socket.emit('movePin', {id: selectedPin, pos: {x:mouseX, y:mouseY}})
  }
}

function draw() {
  background(this.bgImg);
  drawDice();

  for (i = 0; i < player.length; i++) {
    let color = this.board.player[i].color;
    let pos;
    fill(color);
    strokeWeight(4);

    for (j = 0; j < player[i].length; j++) {
      if (selectedPin === 4*i + j) {
        // pos = player[i][j];
        pos = { x: mouseX, y: mouseY };
        stroke([255 - color[0], 255 - color[1], 255 - color[2]]);
      } else {
        pos = player[i][j];
        stroke(75);
      }

      circle(pos.x, pos.y, 20);
    }
  }
}

function drawDice() {

  if (this.rollTimer > 0) {
    this.diceColor = 255;
    this.roll = Math.floor(Math.random() * 6) + 1;
  
    if (this.rollTimer === 1) {
      socket.emit('roll', this.roll);
    }
    this.rollTimer -= 1;
  } 
  
  fill(this.roll !== -1 ? this.diceColor : 200);

  rect(width / 2 - 35, height / 2 - 35, 70, 70, 20);
  strokeWeight(0);
  fill(0);
  textSize(25);
  text(this.roll == -1 ? "?" : this.roll, width / 2 - 7, height / 2 + 10);

  button = createButton('reset');
  button.position(width / 2 - 22, height / 2 - 50);
  button.mousePressed(resetDice);
}

function resetDice() {
    socket.emit('roll', -1);
}

function touchEnded() {
  if (selectedPin !== -1) {
    let j = selectedPin%4;
    let i = (selectedPin-j)/4;
    player[i][j] = {x: mouseX, y: mouseY };
    selectedPin = -1;
    socket.emit('move', player);
    return;
  } else if (mouseX > 320 && mouseX < 400 && mouseY > 320 && mouseY < 400) {
      
    rollTimer = 20;// Math.floor(Math.random() * 6) + 1;

  } else {
    for (i = 0; i < player.length; i++) {
      for (j = 0; j < player[i].length; j++){
        let d = dist(player[i][j].x, player[i][j].y, mouseX, mouseY);

        if (d < 22){
          selectedPin = 4*i + j;
          return;
        }
      }
    }
   }
}
