/*function preload() {
	crystal = loadImage("crystal.png", pic => print(pic));
};*/

function setup() {
	createCanvas(600,600);
	noFill();
	noStroke();
	background(2, 130, 194); //pick a color
};

draw = function() {
	fill(255,0,0);
	ellipse(50,50,100,100);
};
