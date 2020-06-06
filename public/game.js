let board;
let bgImg;
var player;
var currentPlayer = 0;
var me = -1;
var roll = -1;
var socket;
var noRollsLeft = 1;

function preload() {
  let board = getURLParams().b;
  let url = `./board/${board}.json`;
  this.board = loadJSON(url);
  this.bgImg = loadImage(`./board/${board}.jpg`);
}

function setup() {
  createCanvas(720, 720);
  socket = io.connect(window.location.origin);

  this.player = this.board.player;
  background(this.bgImg);

  socket.emit('register');

  socket.on('start', function (data) {
    console.log('START=' + data);
    me = data.player.indexOf(socket.id);
    currentPlayer = data.current;
  });

  socket.on('roll', function (data) {
    console.log('ROLL=' + data);
    roll = data;
  });

  socket.on('update', function (data) {
    player = data.player;
    currentPlayer = data.currentPlayer;
    roll = -1;
    noRollsLeft = 1;
    console.log('UPDATE=' + data, currentPlayer);
  });
}


function draw() {
  background(this.bgImg);
  fill(0);
  if (me >= 0) { fill(player[me].color) }
  strokeWeight(0);
  text(me, 10, 20);
  drawDice();


  for (i = 0; i < player.length; i++) {
    let p = player[i];
    let color = p.color;
    fill(color);
    strokeWeight(4);
    if (me === currentPlayer && i === me) {
      stroke([255 - color[0], 255 - color[1], 255 - color[2]]);
    } else {
      stroke(75);
    }
    let inHouseIx = 0;
    for (pos of p.pos) {
      if (pos === -1) {
        pos = p.start[inHouseIx++];
      } else {
        let newPosIx;
        if (pos >= this.board.fieldCount) {
          newPosIx = pos + me * 4;
        } else {
          newPosIx = (pos + p.startFieldIx) % this.board.fieldCount;
        }
        pos = this.board.fields[newPosIx];
      }
      circle(pos.x, pos.y, 20);
    }
  }
}

function drawDice() {
  fill((me === currentPlayer && noRollsLeft > 0) ? 255 : 200);

  rect(width / 2 - 35, height / 2 - 35, 70, 70, 20);
  strokeWeight(0);
  fill(0);
  textSize(25);
  text(roll == -1 ? "?" : roll, width / 2 - 7, height / 2 + 10);

  button = createButton('next');
  button.position(width / 2 - 12, height / 2 + 50);
  button.mousePressed(nextPlayer);
}

function nextPlayer() {
  if (currentPlayer === me){
    socket.emit('move', player);
  }
}

function touchEnded() {
  if (currentPlayer === me) {
    if (roll !== -1) {
      var inHouseIx = 0;
      for (i = 0; i < player[me].pos.length; i++) {
        let pos = player[me].pos[i];
        if (pos === -1) {
          pos = player[me].start[inHouseIx++];
        } else if (pos >= this.board.fieldCount) {
          let newPosIx = pos + me * 4;
          pos = this.board.fields[newPosIx];
        } else {
          let newPosIx = (pos + player[me].startFieldIx) % this.board.fieldCount;
          pos = this.board.fields[newPosIx];
        }

        let d = dist(pos.x, pos.y, mouseX, mouseY);
        if (d < 22) {
          if (player[me].pos[i] === -1 && roll === 6) {
            player[me].pos[i] = 0;
          } else if (player[me].pos[i] + roll > this.board.fieldCount + 3 || player[me].pos[i] === -1) {
            continue;
          } else {
            player[me].pos[i] += roll;
          }
          roll = -1;
          let newPos = (player[me].pos[i] + player[me].startFieldIx) % this.board.fieldCount;

          for (j = 0; j < player.length; j++) {
            if (j === me) { continue; }
            for (k = 0; k < player[j].pos.length; k++) {
              if (pos === -1) { continue; }
              let pos1 = (player[j].pos[k] + player[j].startFieldIx) % this.board.fieldCount;
              if (newPos === pos1) {
                player[j].pos[k] = -1;
              }
            }
          }

          // socket.emit('move', player);
          return;
        }
      }
    } 
    if (mouseX > 320 && mouseX < 400 && mouseY > 320 && mouseY < 400) {
      
      let allIn = player[me].pos.every(x => x === -1);
      if (allIn && roll === -1) {
        noRollsLeft = 3;
      }

      if (noRollsLeft <= 0) {
        // let data = {player: player, nextPlayer: true}
        //socket.emit('move', player)
        return;
      }

      roll = Math.floor(Math.random() * 6) + 1;
      if (roll === 6){
        noRollsLeft = 1;
      }else{
        noRollsLeft -= 1;
      }
      socket.emit('roll', roll);

    } else { }
  }
  let pos = { x: mouseX, y: mouseY };
  console.log(pos, get(pos.x, pos.y))
}
