const rules = {
  "X": [
    { rule: "(F[+X][-X]FX)", prob: 0.3 },              // Basic branching with two branches
    { rule: "(F[+X][-X][+X][-X]FX)", prob: 0.2 },      // Four branches for denser growth
    { rule: "(F[+X]F[-X]FXL)", prob: 0.2 },            // Two branches plus a leaf
    { rule: "(F[+X][-X]F[+X][-X]FXL)", prob: 0.15 },   // Four branches with a leaf
    { rule: "(F[[+X]L][-X]FXL)", prob: 0.15 }          // Nested branching with leaf clusters
  ],
  F: [ //defining drawing rules
    { rule: "F(F)",  prob: 0.7 },
    { rule: "F(FF)", prob: 0.05 },
    { rule: "F",     prob: 0.25  },
  ],
  "(": "",
  ")": ""
};


const len = 4; //length
const ang = 25; //rotating angle

let drawRules;
let word = "X"; // Letter which is used to draw
const maxGeneration = 6; //number of iteration
let currGeneration = 0;
let growthPercent = 1;

let temperature = 18;
let moisture = 60;
const optimalTemp = { min: 15, max: 25 }; //optimal temperature range
const optimalMoist = { min: 50, max: 70 }; //optimal moisture range
const tBase = 5; //temperature base

function setup() {
  createCanvas(600, 600); //background
  strokeWeight(2); 

  // Temperature UI
  createP('Temperature (°C)');
  let tempSlider = createSlider(0, 40, 18);
  let tempValue = createSpan(` ${temperature}°C`); // Displays the value next to slider
  tempSlider.input(function() {
    temperature = this.value();
    tempValue.html(` ${temperature}°C`);
  });

  // Moisture UI
  createP('Moisture (%)');
  let moistSlider = createSlider(0, 100, 60);
  let moistValue = createSpan(` ${moisture}%`);
  moistSlider.input(function() {
    moisture = this.value();
    moistValue.html(` ${moisture}%`);
  });

  drawRules = {
    "L": (t) => { //drawing leaves rules
      noStroke();
      let leafWidth, leafHeight;
      if (temperature > optimalTemp.max) {
        leafWidth = 0.5 * len * t;  // Curled: narrower
        leafHeight = 2.5 * len * t;   // Curled: shorter
      } else {
        leafWidth = len * t;
        leafHeight = 3 * len * t;
      }

      let leafColor;
      if (moisture < optimalMoist.min && temperature < optimalTemp.min) {
        leafColor = color(255, 178, 102); // Pale brown
      } else 
        if (moisture < optimalMoist.min && temperature > optimalTemp.max) {
        leafColor = color(153, 76, 0);   // Dark brown
      } else {
        if (moisture > optimalMoist.max && temperature < optimalTemp.min) {
          leafColor = color(128, 128, 128); // Pale dark 
        } else 
        if (moisture > optimalMoist.max && temperature > optimalTemp.min){
          leafColor = color(0, 102, 0);     // Dark green
        }else 
        if (moisture < optimalMoist.min){
          leafColor = color(204, 102, 0) //brown
        }
        else if(moisture > optimalMoist.max){
          leafColor = color(0, 102, 0) //dark green
        }
        else if(temperature < optimalTemp.min){
          leafColor = color(153, 255, 153)
        } //pale green
        else {leafColor = color(0, 204, 0)} //green
      }

      fill(leafColor);
      ellipse(0, 0, leafWidth, leafHeight); //leaves shape
    },
    "F": (t) => {
      stroke("#9ea93f"); //branches color
      line(0, 0, 0, -len * t);
      translate(0, -len * t);
    },
    "+": (t) => { 
      rotate(PI / 180 * -ang * t);
    },
    "-": (t) => {
      rotate(PI / 180 * ang * t);
    },
    "[": push,
    "]": pop,
  };
}

function draw() {
  background(28);

  let dailyGDD = max(0, temperature - tBase);
  let growthRate = map(dailyGDD, 0, 40, 0.01, 0.1);

  if (growthPercent < 1) {
    const mod = (currGeneration + growthPercent);
    growthPercent += growthRate / mod;
  } else {
    nextGeneration();
  }

  drawLsysLerp(width / 2, height, word, growthPercent);
}

function mouseReleased() {
  nextGeneration();
}

function nextGeneration() {
  if (growthPercent < 1) return;
  if (currGeneration === maxGeneration) {
    currGeneration = 0;
    word = "X";
  }
  word = generate(word);
  currGeneration++;
  growthPercent = 0;
}

function generate(word) {
  let next = "";
  for (let i = 0; i < word.length; i++) {
    let c = word[i];
    if (c in rules) {
      let rule = rules[c];
      if (Array.isArray(rule)) {
        next += chooseOne(rule); //choose one of the rule 
      } else {
        next += rules[c];
      }
    } else {
      next += c;
    }
  }
  return next;
}

function chooseOne(ruleSet) {
  let n = random();
  let t = 0;
  for (let i = 0; i < ruleSet.length; i++) {
    t += ruleSet[i].prob;
    if (t > n) return ruleSet[i].rule;
  }
  return "";
}

function drawLsysLerp(x, y, state, t) {
  t = constrain(t, 0, 1);
  let lerpOn = false;
  push();
  translate(x, y);
  for (let i = 0; i < state.length; i++) {
    let c = state[i];
    if (c === "(") {
      lerpOn = true;
      continue;
    }
    if (c === ")") {
      lerpOn = false;
      continue;
    }
    let lerpT = lerpOn ? t : 1;
    if (c in drawRules) {
      drawRules[c](lerpT);
    }
  }
  pop();
}
