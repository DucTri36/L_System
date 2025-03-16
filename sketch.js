let rules = {
  "X": "F+[[X]-X]-F[-FX]+X",
  "F": "FF"
}

let len = 1; 
let ang; 

let drawRules;

let word = "X";

function setup() {
  createCanvas(400, 400);
  ang = 25; //radiant
  
  drawRules = {
    "F": () => {//draw forward
      stroke(100, 50, 0); //branch brown
      line(0, 0, 0, -len);//start point
      translate(0, -len);
    },
    "+": () => {//turn left 25 degree
      rotate(PI/180 * -ang);
    },
    "-": () => {//turn right 25 degree
      rotate(PI/180 * ang); //convert to degree
    },
    "[": push, //pushed position and angle to the top 
    "]": () => {
      noStroke();
      fill(0, 200, 0); //color of the leaves
      ellipse(0, 0, 2 * len, 5 * len);//shape of a leave
      pop(); //reset position and angle
    },
  }
  
  noLoop();
}

function draw() {
  background(220);
  
  push();
  translate(width/4, height);
  rotate(PI/180 * ang);
  for(let i = 0; i < word.length; i ++) {
    let c = word[i];
    if(c in drawRules) {
      drawRules[c]();
    }  
  }
  pop();
}

function mouseReleased() {
  word = generate();
  draw();
}

function generate() {
  let next = "" //let next generation equal to empty string
  
  for(let i = 0; i < word.length; i ++) {
    let c = word[i]; 
    if(c in rules) {
      next += rules[c]; 
    } else {
      next += c;
    }
  }
  
  return next; //return next generation
}