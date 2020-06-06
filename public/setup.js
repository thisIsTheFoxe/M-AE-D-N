let board = {};
let bgImg;
var player;
var roll = -1;
var selectedPin = -1;
var rollTimer = 0;
var socket;

function preload() {
  this.bgImg = loadImage('./board/board4.jpg');
}

function setup() {
    board.fields = [];
    createCanvas(720, 720);
}

function draw() {
    background(this.bgImg);
}  

function touchEnded() {
    board.fields.push({x: mouseX, y: mouseY})
    console.log(get(mouseX, mouseY))
}