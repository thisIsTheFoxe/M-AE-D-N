let board;
let bgImg;
var player;
var roll = -1;
var selectedPin = -1;
var socket;

function preload() {
  let url = './board6.json';
  this.board = loadJSON(url);
  this.bgImg = loadImage('./board6.svg');
}

function setup() {
  createCanvas(720, 720);
  socket = io.connect('http://192.168.178.58:3000');

  this.player = this.board.player.map(x => x.start);
  background(this.bgImg);

  socket.emit('register');

  socket.on('start', function (data) {
    console.log('START=' + data);
    //IDC who I am... there are no turns
  });

  socket.on('roll', function (data) {
    console.log('ROLL=' + data);
    roll = data;
  });

  socket.on('update', function (data) {
    player = data.player;
    console.log('UPDATE=' + data);
  });
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
  fill(roll !== -1 ? 255 : 200);

  rect(width / 2 - 35, height / 2 - 35, 70, 70, 20);
  strokeWeight(0);
  fill(0);
  textSize(25);
  text(roll == -1 ? "?" : roll, width / 2 - 7, height / 2 + 10);

  button = createButton('reset');
  button.position(width / 2 - 12, height / 2 + 50);
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
      
    roll = Math.floor(Math.random() * 6) + 1;
    socket.emit('roll', roll);

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
