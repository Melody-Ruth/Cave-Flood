//var width = 5000;
//var height = 5000;

function loadImgErrFix(errEvt) {//To bypass browser image issues. Not currently necessary, but might be needed with another setup.
  const pic = errEvt.target;

  if (!pic.crossOrigin)  return console.log(`Failed to reload ${pic.src}!`);

  console.log(`Attempting to reload ${pic.src} as a tainted image now...`);
  pic.crossOrigin = null, pic.src = pic.src;
  console.log(pic.crossOrigin);
  console.log(pic.src);
};

//Images (have to declare outside so scope will be global
var crystal, testing, smiley, crystalGroup, crystalGroupWater, crystalWater;
var numCrystals = 3;//Have to decide early so we know how many crystal images to load. Later each crystal will be assigned a crystal image to manipulate with the waterlevel.
var crystalImages = [];//water crystal group images. One for each crystal group
var singleCrystalImages = [];//water single crystal images. One for each crystal

var rotateImage = function(img,theta) {//img: The image to be rotated. theta: How many degrees to rotate by
	var theta = -theta;//I messed the code up so it rotate by -theta not theta, so I correct it here
	angleMode(DEGREES);
	var img2;//The new, rotated image. What gets returned.
	
	//In order to make sure the new image is big enough, we make it (sqrt(2) * (the biggest side of the original image) ) on both sides.
	//The square root of 2 is because when you rotate parts of the image can end up outside the original boundaries.
	if (img.width > img.height) {
		img2 = createImage(floor(img.width*sqrt(2)),floor(img.width*sqrt(2)));
	} else {
		img2 = createImage(floor(img.height*sqrt(2)),floor(img.height*sqrt(2)));
	}
	//Making variables for the img2's dimensions in an attempt to speed up loading time.
	var halfHeight = img2.height/2;
	var halfWidth = img2.width/2;
	var fullHeight = img2.height;
	var fullWidth = img2.width;
	//Variables we will use when rotating each pixel
	var phi,r,totalAngle,newX,newY,oldColor;
	var oldX,oldY;
	img2.loadPixels();
	img.loadPixels();
	//One strip in the middle gets missed. We correct it here.
	for (var i = 0; i < fullWidth; i++) {
		var j = floor(halfHeight);
		phi = 0;
		r = i - halfWidth;
		if (i < halfWidth) {
			phi = 180;
			r = halfWidth-i;
		}
		totalAngle = phi - theta;
		oldX = r*cos(totalAngle)+img.width/2;
		oldY = -r*sin(totalAngle)+img.height/2;
		if (oldX > 0 && oldX < img.width && oldY > 0 && oldY < img.height) {
			oldColor = img.get(oldX,oldY);
			img2.set(i,j,color(oldColor));
		}
	}
	//Quadrant II
	/*For each pixel in quadrant II of the new image, find the equivalent pixel in the old image and set the new image's pixel to be the same color as the old image's.
	 * Step 1: Find the angle phi in the right triangle created by the center of the image and the current pixel.
	 * Step 2: Find the hypotenuse r of this triangle.
	 * Step 3: Correct phi based on what quadrant we're in to be the angle from 0.
	 * Step 4: The angle in the old image will be the angle in the new image - how much we're rotating by.
	 * Step 5: New triangle using the same radius but different angle. This gives us the equivalent pixel position in the old image.
	 * Step 6: If this is a legitimate pixel, get its color and use it to set the pixel in our new image.
	 * (Other quadrants work similarly)
	 */
	for (var i = 0; i < halfWidth; i++) {
		for (var j = 0; j < halfHeight; j++) {
			phi = atan((halfHeight-j)/(halfWidth-i));
			r = (halfHeight-j)/sin(phi);
			phi = 180-phi;
			totalAngle = phi-theta;
			oldX = r*cos(totalAngle)+img.width/2;
			oldY = -r*sin(totalAngle)+img.height/2;
			if (oldX > 0 && oldX < img.width && oldY > 0 && oldY < img.height) {
				oldColor = img.get(oldX,oldY);
				img2.set(i,j,color(oldColor));
			}
		}
	}
	//Quadrant I
	for (var i = halfWidth; i < fullWidth; i++) {
		for (var j = 0; j < halfHeight; j++) {
			phi = atan((halfHeight-j)/(i-halfWidth));
			r = (halfHeight-j)/sin(phi);
			totalAngle = phi-theta;
			oldX = r*cos(totalAngle)+img.width/2;
			oldY = -r*sin(totalAngle)+img.height/2;
			if (oldX > 0 && oldX < img.width && oldY > 0 && oldY < img.height) {
				oldColor = img.get(oldX,oldY);
				img2.set(i,j,color(oldColor));
			}
		}
	}
	//Quadrant IV
	for (var i = ceil(halfWidth); i < fullWidth; i++) {
		for (var j = ceil(halfHeight); j < fullHeight; j++) {
			phi = atan((j-halfHeight)/(i-halfWidth));
			r = (j-halfHeight)/sin(phi);
			phi = -phi;
			totalAngle = phi-theta;
			oldX = r*cos(totalAngle)+img.width/2;
			oldY = -r*sin(totalAngle)+img.height/2;
			if (oldX > 0 && oldX < img.width && oldY > 0 && oldY < img.height) {
				oldColor = img.get(oldX,oldY);
				img2.set(i,j,color(oldColor));
			}
		}
	}
	//Quadrant III
	for (var i = 0; i < halfWidth; i++) {
		for (var j = ceil(halfHeight); j < fullHeight; j++) {
			phi = atan((j-halfHeight)/(halfWidth-i));
			r = (j-halfHeight)/sin(phi);
			phi += 180;
			totalAngle = phi-theta;
			oldX = r*cos(totalAngle)+img.width/2;
			oldY = -r*sin(totalAngle)+img.height/2;
			if (oldX > 0 && oldX < img.width && oldY > 0 && oldY < img.height) {
				oldColor = img.get(oldX,oldY);
				img2.set(i,j,color(oldColor));
			}
		}
	}
	img.updatePixels();
	img2.updatePixels();
	return img2;
};

var darkness, darkness2, waterDarkness;

//Load all of the images used in the game
function preload() {
	crystal = loadImage("crystal.png", pic => print(pic), loadImgErrFix);
	crystalGroup = loadImage("crystal_group2.png", pic => print(pic), loadImgErrFix);
	crystalGroupWater = loadImage("crystal_group_water.png", pic => print(pic), loadImgErrFix);
	crystalWater = loadImage("crystal_water.png", pic => print(pic), loadImgErrFix);
	darkness = loadImage("darkness1.png", pic => print(pic), loadImgErrFix);
	darkness2 = loadImage("darkness2.png", pic => print(pic), loadImgErrFix);
	waterDarkness = loadImage("water_darkness.png", pic => print(pic), loadImgErrFix);
	
	//Load the water crystal group images. They each need to load their own so that manipulating one won't affect the others.
	for (var i = 0; i < 23; i++) {
		crystalImages[i] = loadImage("crystal_group_water.png", pic => print(pic), loadImgErrFix);
	}
	//Load the water crystal images. They each need to load their own so that manipulating one won't affect the others.
	for (var i = 0; i < 8; i++) {
		singleCrystalImages[i] = loadImage("crystal_water.png", pic => print(pic), loadImgErrFix);
	}
}

function setup() {
	createCanvas(600,600);
	noFill();
	noStroke();
	background(2, 130, 194); //pick a color
	
	//All rotated crystals need their images replaced. Must be in setup, since createImage is used in rotateImage and createImage is a setup thing.
	crystalImages[0] = rotateImage(crystalGroupWater,-110);
	crystalImages[1] = rotateImage(crystalGroupWater,-30);
	crystalImages[2] = rotateImage(crystalGroupWater,112);
	crystalImages[3] = rotateImage(crystalGroupWater,180);
	crystalImages[6] = rotateImage(crystalGroupWater,50);
	crystalImages[7] = rotateImage(crystalGroupWater,172);
	crystalImages[8] = rotateImage(crystalGroupWater,-10);
	crystalImages[9] = rotateImage(crystalGroupWater,-90);
	crystalImages[10] = rotateImage(crystalGroupWater,90);
	crystalImages[11] = rotateImage(crystalGroupWater,-90);
	crystalImages[13] = rotateImage(crystalGroupWater,40);
	crystalImages[14] = rotateImage(crystalGroupWater,-25);
	crystalImages[15] = rotateImage(crystalGroupWater,-150);
	crystalImages[16] = rotateImage(crystalGroupWater,-100);
	crystalImages[17] = rotateImage(crystalGroupWater,-20);
	crystalImages[18] = rotateImage(crystalGroupWater,-90);
	crystalImages[19] = rotateImage(crystalGroupWater,28);
	crystalImages[20] = rotateImage(crystalGroupWater,-150);
	
	singleCrystalImages[1] = rotateImage(crystalWater,30);
	singleCrystalImages[4] = rotateImage(crystalWater,-180);
	singleCrystalImages[6] = rotateImage(crystalWater,180);
	//darkness = createImage(1200,1200);
};

//Whenever a new key is presssed, keyCode changes, so I can't tell whether other keys are still being pressed. To make up for that,
//I made my own variables for the arrow keys which are true when they are pressed and become false when they are released.
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

function keyPressed() {
	if (keyCode === RIGHT_ARROW) {
		rightPressed = true;
	}
	if (keyCode === LEFT_ARROW) {
		leftPressed = true;
	}
	if (keyCode === UP_ARROW) {
		upPressed = true;
	}
	if (keyCode === DOWN_ARROW) {
		downPressed = true;
	}
};

var keyIsReleased;
function keyReleased() {
	keyIsReleased = true;
	if (keyCode === RIGHT_ARROW) {
		rightPressed = false;
	}
	if (keyCode === LEFT_ARROW) {
		leftPressed = false;
	}
	if (keyCode === UP_ARROW) {
		upPressed = false;
	}
	if (keyCode === DOWN_ARROW) {
		downPressed = false;
	}
};

var timer = 0;//Keeps track of how many times the draw function has been executed. I use it to do image stuff on the first time through.
var g = 0.1633;//Pull of gravity. I flip it when the ball is in water to simulate buoyancy overpowering gravity.
var ballStartPos = [1685,2302];//Where the ball starts the game
//Should start 60,3790
var waterLevel = 7000;//Starting water level
var waterColor = [155, 151, 230];
//var groundWaterColor = [89,169,194];
var groundWaterColor = [20, 81, 130];
//Adjust what part of the game is shown on screen based on the ball starting position.
//No matter what its starting position, it shows up on the screen as 370 pixels to the left and 430 pixels down at the start.
var xTranslate = 370-ballStartPos[0];
var yTranslate = 430-ballStartPos[1];
var xTranslateShifter = 0;//Current rate at which the part of the game shown is moving left
var yTranslateShifter = 0;//Current rate at which the part of the game shown is moving up

var ball = {};
//ball.p = [370,430];//position
ball.p = [ballStartPos[0],ballStartPos[1]];
ball.v = [0,0];//velocity
ball.m = 20;//"mass"
ball.r = 18;//radius
ball.e = 0.7;//elasticity (between 0 and 1). Determines what fraction of the perpendicular velocity the ball bounces off of something with.
ball.e2 = 0.98;//parallel elasticity. Acts like friction. Determines what fraction of the parellel velocity the ball keeps when it bbounces off of something.
ball.resting = false;//The ball is resting if it isn't falling (or isn't floating up if it's underwater)
ball.restingBottom = false;//The ball is on something that would stop it from falling
ball.restingTop = false;//The ball is on something that would stop it from floating up
ball.inPassage = false;//Whether the ball is in one of the rectangular passages.
//If this is true, we don't have it collide with the circular or capsule caverns. This keeps the ball from bouncing off the curve of a cavern
//when it should be fall into a pasage.
ball.a = [0,g];//acceleration
ball.right = false;//Is the user making the ball go right?
ball.left = false;//Is the user making the ball go left?
ball.down = false;//Is the user making the ball go down? (Only in water)
ball.rightForce = 0.05;//How much the right arrow key does
ball.leftForce = 0.05;//How much the left arrow key does
ball.score = 0;//How many points the player has earned
ball.waterTheta = 0;//Used when drawing the ball partially submerged
ball.fullySubmerged = false;
ball.drawIt = function(ballAlpha) {//Only uses ballAlpha if fully in or out of water
	this.fullySubmerged = false;
	if (waterLevel > this.p[1]+this.r) {//If the water level is below the ball completely, just draw a normal ball.
		fill(192, 142, 236,ballAlpha);
		ellipse(this.p[0],this.p[1],this.r*2,this.r*2);
	} else if (waterLevel < this.p[1]-this.r) {//If the water level is above the ball completely, just draw a watery ball.
		this.fullySubmerged = true;
		//fill(155, 151, 230,ballAlpha);
		fill(waterColor[0],waterColor[1],waterColor[2],ballAlpha);
		ellipse(this.p[0],this.p[1],this.r*2,this.r*2);
	} else if (waterLevel < this.p[1]) {//If the water level is in the top half of the ball
		fill(192, 142, 236);
		ellipse(this.p[0],this.p[1],this.r*2,this.r*2);//Draw the normal ball
		this.waterTheta = acos((this.p[1]-waterLevel)/this.r);
		//fill(155, 151, 230);
		fill(waterColor[0],waterColor[1],waterColor[2]);
		//Draw an arc from one point where the water level meets the ball to the other point.
		//Draw the triangle from one point where the water level meets the ball to the other point to the center of the ball.
		//Together, this makes a circle with a sliced cap.
		//All of this is with the water ball color, since we are adding the watery part on top of the normal ball.
		arc(this.p[0],this.p[1],this.r*2,this.r*2,this.waterTheta-90,270-this.waterTheta);
		triangle(this.p[0],this.p[1],this.p[0]+this.r*sin(this.waterTheta),waterLevel,this.p[0]-this.r*sin(this.waterTheta),waterLevel);
	} else {//If the water level is in the bottom half of the ball
		fill(waterColor[0],waterColor[1],waterColor[2]);
		ellipse(this.p[0],this.p[1],this.r*2,this.r*2);//Draw the watery ball
		this.waterTheta = acos((waterLevel-this.p[1])/this.r);
		fill(192, 142, 236);
		//Now we draw the parts where ball should be normal. When you slice a small bit of a circle off the top, it's easier to draw the larger piece.
		//So, when the water level is in the lower half, we do what we do above but flipped.
		arc(this.p[0],this.p[1],this.r*2,this.r*2,90+this.waterTheta,450-this.waterTheta);
		triangle(this.p[0],this.p[1],this.p[0]+this.r*sin(this.waterTheta),waterLevel,this.p[0]-this.r*sin(this.waterTheta),waterLevel);
	}
};
ball.inAirMove = function() {
	//If the ball is in the air, change a accordingly
	if (!this.resting) {
		//acceleration assignment
		this.a[1] = g;
		this.a[0] = 0;
		if (rightPressed) {
			this.a[0] = 4*this.rightForce;
			this.right = true;
		} else {
			this.right = false;
		}
		if (leftPressed) {
			this.a[0] = -4*this.leftForce;
			this.left = true;
		} else {
			this.left = false;
		}
		if (this.inWater && downPressed) {
			this.a[1] = 0.07;
			this.down = true;
		} else {
			this.down = false;
		}
	}
	//velocity += acceleration
	//Always a good idea
	this.v[0] += this.a[0];
	this.v[1] += this.a[1];
};
ball.move = function() {
	//Jump
	//(can only jump if resting, not if in the air.
	if (this.resting && !this.inWater && upPressed) {
		this.v[1] -= 5;
		this.resting = false;
		this.restingBottom = false;
	}
	//Move the ball's position.
	this.p[0] += this.v[0];
	this.p[1] += this.v[1];
};

var newCircleEnclosure = function(x,y,r) {
	var myCircle = {};
	myCircle.p = [x,y];
	myCircle.r = r;
	myCircle.theta = 0;
	myCircle.drawIt = function() {
		if (waterLevel > this.p[1]+this.r) {
			fill(71, 40, 24);
			ellipse(this.p[0],this.p[1],this.r*2,this.r*2);
		} else if (waterLevel < this.p[1]-this.r) {
			fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2]);
			ellipse(this.p[0],this.p[1],this.r*2,this.r*2);
		} else if (waterLevel < this.p[1]) {
			fill(71, 40, 24);
			ellipse(this.p[0],this.p[1],this.r*2,this.r*2);
			this.waterTheta = acos((this.p[1]-waterLevel)/this.r);
			fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2]);
			arc(this.p[0],this.p[1],this.r*2,this.r*2,this.waterTheta-90,270-this.waterTheta);
			triangle(this.p[0],this.p[1],this.p[0]+this.r*sin(this.waterTheta)+2,waterLevel,this.p[0]-this.r*sin(this.waterTheta)-2,waterLevel);
		} else {
			fill(71, 40, 24);
			ellipse(this.p[0],this.p[1],this.r*2,this.r*2);
			fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2]);
			ellipse(this.p[0],this.p[1],this.r*2,this.r*2);
			this.waterTheta = acos((waterLevel-this.p[1])/this.r);
			fill(71, 40, 24);
			arc(this.p[0],this.p[1],this.r*2,this.r*2,90+this.waterTheta,450-this.waterTheta);
			triangle(this.p[0],this.p[1],this.p[0]+this.r*sin(this.waterTheta)+2,waterLevel,this.p[0]-this.r*sin(this.waterTheta)-2,waterLevel);
		}
	};
	myCircle.collide = function() {
		this.on = false;
		this.theta = atan((ball.p[1]-this.p[1])/(ball.p[0]-this.p[0]));
		var m = -1/tan(this.theta);
		var b = ball.p[1]-ball.p[0]*m;
		if (sqrt(sq(ball.p[0]-this.p[0])+sq(ball.p[1]-this.p[1])) > this.r-ball.r && sqrt(sq(ball.p[0]-this.p[0])+sq(ball.p[1]-this.p[1])) < this.r-ball.r+20) {
			this.on = true;
		}
		if (sqrt(sq(ball.p[0]-this.p[0])+sq(ball.p[1]-this.p[1])) > this.r-ball.r && sqrt(sq(ball.p[0]-this.p[0])+sq(ball.p[1]-this.p[1])) < this.r-ball.r+20 && ball.p[1] > this.p[1]) {
			var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
			var wallTheta = atan(m);
			//Have to adjust because of the radius of the ball.
			ball.restingBottom = true;//The ball is on a ramp
			//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
			var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
			//The rest of the magnitude must come from the perpendicular component
			var perpendicularVelocity = -ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));//Negative because the ball is bouncing off, so the perpendicular is flipped.
			//Return to x y coordinates
			ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
			ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
			var aTotal = g*sin(wallTheta);
			if (ball.right) {
				aTotal += ball.rightForce*ball.m*cos(wallTheta);
			}
			if (ball.left) {
				aTotal -= ball.leftForce*ball.m*cos(wallTheta);
			}
			if (ball.down) {
				aTotal += 0.05*sin(wallTheta);
			}
			ball.a[0] = aTotal*unitRamp[0];
			ball.a[1] = aTotal*unitRamp[1];
		}
		if (sqrt(sq(ball.p[0]-this.p[0])+sq(ball.p[1]-this.p[1])) > this.r-ball.r && sqrt(sq(ball.p[0]-this.p[0])+sq(ball.p[1]-this.p[1])) < this.r-ball.r+20 && ball.p[1] < this.p[1]) {
			var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
			var wallTheta = atan(m);
			//Have to adjust because of the radius of the ball.
			ball.restingTop = true;//The ball is on a ramp
			//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
			var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
			//The rest of the magnitude must come from the perpendicular component
			var perpendicularVelocity = ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
			ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
			ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
			var aTotal = g*sin(wallTheta);
			if (ball.right) {
				aTotal += ball.rightForce*ball.m*cos(wallTheta);
			}
			if (ball.left) {
				aTotal -= ball.leftForce*ball.m*cos(wallTheta);
			}
			if (ball.down) {
				aTotal += 0.05*sin(wallTheta);
			}
			ball.a[0] = aTotal*unitRamp[0];
			ball.a[1] = aTotal*unitRamp[1];
		}
	};
	return myCircle;
};

var newReverseCircle = function(x,y,r) {
	var myCircle = {};
	myCircle.p = [x,y];
	myCircle.r = r;
	myCircle.theta = 0;
	myCircle.drawIt = function() {
		fill(99, 56, 35);
		ellipse(myCircle.p[0],myCircle.p[1],myCircle.r*2,myCircle.r*2);
	};
	myCircle.collide = function() {
		this.theta = atan((ball.p[1]-this.p[1])/(ball.p[0]-this.p[0]));
		var m = -1/tan(this.theta);
		var b = ball.p[1]-ball.p[0]*m;
		if (sqrt(sq(ball.p[0]-this.p[0])+sq(ball.p[1]-this.p[1])) < this.r+ball.r && ball.p[1] > this.p[1]) {
			var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
			var wallTheta = atan(m);
			//console.log("hi");
				//Have to adjust because of the radius of the ball.
				ball.restingTop = true;//The ball is on a ramp
				//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
				var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
				//The rest of the magnitude must come from the perpendicular component
				var perpendicularVelocity = ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
				ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
				ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
				var aTotal = g*sin(wallTheta);
				if (ball.right) {
					aTotal += ball.rightForce*ball.m*cos(wallTheta);
				}
				if (ball.left) {
					aTotal -= ball.leftForce*ball.m*cos(wallTheta);
				}
				if (ball.down) {
					aTotal += 0.05*sin(wallTheta);
				}
				ball.a[0] = aTotal*unitRamp[0];
				ball.a[1] = aTotal*unitRamp[1];
		}
		if (sqrt(sq(ball.p[0]-this.p[0])+sq(ball.p[1]-this.p[1])) < this.r+ball.r && ball.p[1] <= this.p[1]) {
			var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
			var wallTheta = atan(m);
				//Have to adjust because of the radius of the ball.
				ball.restingBottom = true;//The ball is on a ramp
				//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
				var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
				//The rest of the magnitude must come from the perpendicular component
				var perpendicularVelocity = -ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
				ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
				ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
				//ball.v[0] *= ball.e;
				//ball.v[1] *= ball.e;
				var aTotal = g*sin(wallTheta);
				if (ball.right) {
					aTotal += ball.rightForce*ball.m*cos(wallTheta);
				}
				if (ball.left) {
					aTotal -= ball.leftForce*ball.m*cos(wallTheta);
				}
				if (ball.down) {
					aTotal += 0.05*sin(wallTheta);
				}
				ball.a[0] = aTotal*unitRamp[0];
				ball.a[1] = aTotal*unitRamp[1];
		}
	};
	return myCircle;
};

var newCapsuleEnclosure = function(x,y,w,h) {
	var capsule = {};
	capsule.x = x;
	capsule.y = y;
	capsule.w = w;
	capsule.h = h;
	capsule.r = h/2;
	capsule.p1 = [x,y+capsule.r];
	capsule.p2 = [x+w,y+capsule.r];
	capsule.drawIt = function() {
		if (waterLevel > this.y+this.h) {//Water level below this enclosure
			fill(71, 40, 24);
			rect(this.x-1,this.y,this.w+2,this.h);
			arc(this.p1[0],this.p1[1],this.r*2,this.r*2,90,270);
			arc(this.p2[0],this.p2[1],this.r*2,this.r*2,-90,90);
		} else if (waterLevel < this.y) {//Water level above this enclosure (flooded)
			fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2]);
			rect(this.x-1,this.y,this.w+2,this.h);
			arc(this.p1[0],this.p1[1],this.r*2,this.r*2,90,270);
			arc(this.p2[0],this.p2[1],this.r*2,this.r*2,-90,90);
		} else if (waterLevel < this.p1[1]) {//Water level above the center of this enclosure
			fill(71, 40, 24);
			rect(this.x-1,this.y,this.w+2,this.h);
			arc(this.p1[0],this.p1[1],this.r*2,this.r*2,90,270);
			arc(this.p2[0],this.p2[1],this.r*2,this.r*2,-90,90);
			fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2]);
			rect(this.x-1,waterLevel,this.w+2,this.y+this.h-waterLevel);
			var waterTheta = acos((this.p1[1]-waterLevel)/this.r);
			arc(this.p1[0],this.p1[1],this.r*2,this.r*2,90,270-waterTheta);
			arc(this.p2[0],this.p2[1],this.r*2,this.r*2,-90+waterTheta,90);
			triangle(this.p1[0]+1,this.p1[1]+5,this.p1[0]+1,waterLevel,this.p1[0]-this.r*sin(waterTheta),waterLevel);
			triangle(this.p2[0]-1,this.p2[1]+5,this.p2[0]-1,waterLevel,this.p2[0]+this.r*sin(waterTheta),waterLevel);
		} else {//Water level below the center of this enclosure
			fill(71, 40, 24);
			rect(this.x-2,this.y,this.w+4,this.h);
			fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2]);
			rect(this.x-1,waterLevel,this.w+2,this.y+this.h-waterLevel);
			arc(this.p1[0],this.p1[1],this.r*2,this.r*2,90,270);
			arc(this.p2[0],this.p2[1],this.r*2,this.r*2,-90,90);
			var waterTheta = acos((waterLevel-this.p1[1])/this.r);
			fill(71, 40, 24);
			arc(this.p1[0]+1,this.p1[1],this.r*2+2,this.r*2+1,90+waterTheta,270);
			arc(this.p2[0]-1,this.p2[1],this.r*2+2,this.r*2+1,-90,90-waterTheta);
			triangle(this.p1[0]+1,this.p1[1]-5,this.p1[0]+1,waterLevel,this.p1[0]-this.r*sin(waterTheta),waterLevel);
			triangle(this.p2[0]-1,this.p2[1]-5,this.p2[0]-1,waterLevel,this.p2[0]+this.r*sin(waterTheta),waterLevel);
		}
	};
	capsule.collide = function() {
		if (ball.p[1]+ball.r >= this.y+this.h && ball.p[1]+ball.r <= this.y+this.h+20 && ball.p[0] > this.x && ball.p[0] < this.x+this.w) {//bouncing off floor
			this.m = 0;
			this.b = this.y+this.h;
			ball.restingBottom = true;
			var unitRamp = [1,0];
			var parallelVelocity = ball.e2*ball.v[0];
			var perpendicularVelocity = -ball.e*abs(ball.v[1]);
			ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
			ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
			//ball.v[0] *= ball.e2;
			//ball.v[1] *= ball.e;
			var theta = atan(this.m);
			var aTotal = g*sin(theta);
			if (ball.right) {
				aTotal += ball.rightForce*ball.m*cos(theta);
			}
			if (ball.left) {
				aTotal -= ball.leftForce*ball.m*cos(theta);
			}
			if (ball.down) {
				aTotal += 0.05*sin(theta);
			}
			ball.a[0] = aTotal*unitRamp[0];
			ball.a[1] = aTotal*unitRamp[1];
		} else if (ball.p[1]-ball.r <= this.y && ball.p[1]-ball.r >= this.y-20 && ball.p[0] > this.x && ball.p[0] < this.x+this.w) {//bouncing off the ceiling
			this.m = 0;
			ball.restingTop = true;
			var unitRamp = [1,0];
			var parallelVelocity = ball.e2*ball.v[0];
			var perpendicularVelocity = ball.e*abs(ball.v[1]);
			ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
			ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
			//ball.v[0] *= ball.e2;
			//ball.v[1] *= ball.e;
			var theta = atan(this.m);
			var aTotal = g*sin(theta);
			if (ball.right) {
				aTotal += ball.rightForce*ball.m*cos(theta);
			}
			if (ball.left) {
				aTotal -= ball.leftForce*ball.m*cos(theta);
			}
			if (ball.down) {
				aTotal += 0.05*sin(theta);
			}
			ball.a[0] = aTotal*unitRamp[0];
			ball.a[1] = aTotal*unitRamp[1];
			//console.log(aTotal);
		} else if (ball.p[0]-ball.r < this.x) {//Bouncing off circle 1
			//console.log("hello");
			this.theta = atan((ball.p[1]-this.p1[1])/(ball.p[0]-this.p1[0]));
			var m = -1/tan(this.theta);
			var b = ball.p[1]-ball.p[0]*m;
			if (sqrt(sq(ball.p[0]-this.p1[0])+sq(ball.p[1]-this.p1[1])) > this.r-ball.r && sqrt(sq(ball.p[0]-this.p1[0])+sq(ball.p[1]-this.p1[1])) <= this.r-ball.r+150 && ball.p[1] > this.p1[1]) {
				var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
				var wallTheta = atan(m);
					//Have to adjust because of the radius of the ball.
					ball.restingBottom = true;//The ball is on a ramp
					//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					//The rest of the magnitude must come from the perpendicular component
					var perpendicularVelocity = -ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var aTotal = g*sin(wallTheta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(wallTheta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(wallTheta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(wallTheta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
			} else if (sqrt(sq(ball.p[0]-this.p1[0])+sq(ball.p[1]-this.p1[1])) > this.r-ball.r && sqrt(sq(ball.p[0]-this.p1[0])+sq(ball.p[1]-this.p1[1])) < this.r-ball.r+150 && ball.p[1] < this.p1[1]) {
				var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
				var wallTheta = atan(m);
					//Have to adjust because of the radius of the ball.
					ball.restingTop = true;//The ball is on a ramp
					//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					//The rest of the magnitude must come from the perpendicular component
					var perpendicularVelocity = ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var aTotal = g*sin(wallTheta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(wallTheta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(wallTheta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(wallTheta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
			}
		} else if (ball.p[0]+ball.r > this.x+this.w) {//Bouncing off circle 2
			this.theta = atan((ball.p[1]-this.p2[1])/(ball.p[0]-this.p2[0]));
			var m = -1/tan(this.theta);
			var b = ball.p[1]-ball.p[0]*m;
			/*stroke(0);
			strokeWeight(2);
			line(0,b,width,width*m+b);
			noStroke();
			if (sqrt(sq(ball.p[0]-this.p2[0])+sq(ball.p[1]-this.p2[1])) > this.r-ball.r) {
				//println(sqrt(sq(ball.v[0])+sq(ball.v[1])));
			}*/
			if (sqrt(sq(ball.p[0]-this.p2[0])+sq(ball.p[1]-this.p2[1])) > this.r-ball.r && sqrt(sq(ball.p[0]-this.p2[0])+sq(ball.p[1]-this.p2[1])) < this.r-ball.r+150 && ball.p[1] > this.p2[1]) {
				//console.log("hello");
				var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
				var wallTheta = atan(m);
					//Have to adjust because of the radius of the ball.
					ball.restingBottom = true;//The ball is on a ramp
					//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					//The rest of the magnitude must come from the perpendicular component
					var perpendicularVelocity = -ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//println(ball.v[1]);
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var aTotal = g*sin(wallTheta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(wallTheta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(wallTheta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(wallTheta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
			}
			if (sqrt(sq(ball.p[0]-this.p2[0])+sq(ball.p[1]-this.p2[1])) > this.r-ball.r && sqrt(sq(ball.p[0]-this.p2[0])+sq(ball.p[1]-this.p2[1])) < this.r-ball.r+150 && ball.p[1] <= this.p2[1]) {
				//console.log("hi");
				var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
				var wallTheta = atan(m);
					//Have to adjust because of the radius of the ball.
					ball.restingTop = true;//The ball is on a ramp
					//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					//The rest of the magnitude must come from the perpendicular component
					var perpendicularVelocity = ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var aTotal = g*sin(wallTheta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(wallTheta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(wallTheta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(wallTheta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
			}
		}
	};
	return capsule;
};

var newReverseCapsule = function(x,y,w,h) {
	var capsule = {};
	capsule.x = x;
	capsule.y = y;
	capsule.w = w;
	capsule.h = h;
	capsule.r = h/2;
	capsule.p1 = [x,y+capsule.r];
	capsule.p2 = [x+w,y+capsule.r];
	capsule.drawIt = function() {
		fill(99, 56, 35);
		rect(this.x-1,this.y,this.w+2,this.h);
		arc(this.p1[0],this.p1[1],this.r*2,this.r*2,90,270);
		arc(this.p2[0],this.p2[1],this.r*2,this.r*2,-90,90);
	};
	capsule.collide = function() {
		/*if (sqrt(sq(ball.p[0]-this.p1[0])+sq(ball.p[1]-this.p1[1])) > this.r-ball.r+ball.r/2 && ball.p[0]-ball.r < this.x) {
			println("hi1");
			ball.p[0] -= this.p1[0];
			ball.p[1] -= this.p1[1];
			var currentR = sqrt(sq(ball.p[0])+sq(ball.p[1]));
			ball.p[0] *= (this.r-ball.r)/currentR;
			ball.p[1] *= (this.r-ball.r)/currentR;
			ball.p[0] += this.p1[0];
			ball.p[1] += this.p1[1];
		} else if (sqrt(sq(ball.p[0]-this.p2[0])+sq(ball.p[1]-this.p2[1])) > this.r-ball.r+ball.r/2 && ball.p[0]+ball.r > this.x+this.w) {
			println("hi2");
			ball.p[0] -= this.p2[0];
			ball.p[1] -= this.p2[1];
			var currentR = sqrt(sq(ball.p[0])+sq(ball.p[1]));
			ball.p[0] *= (this.r-ball.r)/currentR;
			ball.p[1] *= (this.r-ball.r)/currentR;
			ball.p[0] += this.p2[0];
			ball.p[1] += this.p2[1];
		} else if (ball.p[1]+ball.r >= this.y+this.h+ball.r/2 && ball.p[0] > this.x && ball.p[0] < this.x+this.w) {
			println("hi3");
			ball.p[1] = this.y+this.h-ball.r;
		} else if (ball.p[1]-ball.r <= this.y-ball.r/2 && ball.p[0] > this.x && ball.p[0] < this.x+this.w) {
			println("hi4");
			ball.p[1] = this.y+ball.r;
		}*/
		if (ball.p[1]-ball.r <= this.y+this.h && ball.p[1]-ball.r >= this.y+this.h/2 && ball.p[0] > this.x && ball.p[0] < this.x+this.w) {//bouncing off floor
			this.m = 0;
			this.b = this.y+this.h;
			ball.restingTop = true;
			var unitRamp = [1,0];
			var parallelVelocity = ball.e2*ball.v[0];
			var perpendicularVelocity = ball.e*abs(ball.v[1]);
			ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
			ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
			//ball.v[0] *= ball.e2;
			//ball.v[1] *= ball.e;
			var theta = atan(this.m);
			var aTotal = g*sin(theta);
			if (ball.right) {
				aTotal += ball.rightForce*ball.m*cos(theta);
			}
			if (ball.left) {
				aTotal -= ball.leftForce*ball.m*cos(theta);
			}
			if (ball.down) {
				aTotal += 0.05*sin(theta);
			}
			ball.a[0] = aTotal*unitRamp[0];
			ball.a[1] = aTotal*unitRamp[1];
		} else if (ball.p[1]+ball.r >= this.y && ball.p[1]+ball.r <= this.y+this.h/2 && ball.p[0] > this.x && ball.p[0] < this.x+this.w) {//bouncing off the ceiling
			this.m = 0;
			ball.restingBottom = true;
			var unitRamp = [1,0];
			var parallelVelocity = ball.e2*ball.v[0];
			var perpendicularVelocity = -ball.e*abs(ball.v[1]);
			ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
			ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
			//ball.v[0] *= ball.e2;
			//ball.v[1] *= ball.e;
			var theta = atan(this.m);
			var aTotal = g*sin(theta);
			if (ball.right) {
				aTotal += ball.rightForce*ball.m*cos(theta);
			}
			if (ball.left) {
				aTotal -= ball.leftForce*ball.m*cos(theta);
			}
			if (ball.down) {
				aTotal += 0.05*sin(theta);
			}
			ball.a[0] = aTotal*unitRamp[0];
			ball.a[1] = aTotal*unitRamp[1];
		} else if (ball.p[0]-ball.r < this.x) {//Bouncing off circle 1
			this.theta = atan((ball.p[1]-this.p1[1])/(ball.p[0]-this.p1[0]));
			var m = -1/tan(this.theta);
			var b = ball.p[1]-ball.p[0]*m;
			if (sqrt(sq(ball.p[0]-this.p1[0])+sq(ball.p[1]-this.p1[1])) <= this.r+ball.r && ball.p[1] > this.p1[1]) {
				var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
				var wallTheta = atan(m);
					//Have to adjust because of the radius of the ball.
					ball.restingTop = true;//The ball is on a ramp
					//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					//The rest of the magnitude must come from the perpendicular component
					var perpendicularVelocity = ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var aTotal = g*sin(wallTheta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(wallTheta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(wallTheta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(wallTheta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
			} else if (sqrt(sq(ball.p[0]-this.p1[0])+sq(ball.p[1]-this.p1[1])) <= this.r+ball.r && ball.p[1] < this.p1[1]) {
				var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
				var wallTheta = atan(m);
					//Have to adjust because of the radius of the ball.
					ball.restingBottom = true;//The ball is on a ramp
					//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					//The rest of the magnitude must come from the perpendicular component
					var perpendicularVelocity = -ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var aTotal = g*sin(wallTheta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(wallTheta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(wallTheta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(wallTheta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
			}
		} else if (ball.p[0]+ball.r > this.x+this.w) {//Bouncing off circle 2
			this.theta = atan((ball.p[1]-this.p2[1])/(ball.p[0]-this.p2[0]));
			var m = -1/tan(this.theta);
			var b = ball.p[1]-ball.p[0]*m;
			/*stroke(0);
			strokeWeight(2);
			line(0,b,width,width*m+b);
			noStroke();
			if (sqrt(sq(ball.p[0]-this.p2[0])+sq(ball.p[1]-this.p2[1])) > this.r-ball.r) {
				//println(sqrt(sq(ball.v[0])+sq(ball.v[1])));
			}*/
			if (sqrt(sq(ball.p[0]-this.p2[0])+sq(ball.p[1]-this.p2[1])) <= this.r+ball.r && ball.p[1] > this.p2[1]) {
				var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
				var wallTheta = atan(m);
					//Have to adjust because of the radius of the ball.
					ball.restingBottom = true;//The ball is on a ramp
					//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					//The rest of the magnitude must come from the perpendicular component
					var perpendicularVelocity = ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//println(ball.v[1]);
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var aTotal = g*sin(wallTheta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(wallTheta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(wallTheta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(wallTheta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
			}
			if (sqrt(sq(ball.p[0]-this.p2[0])+sq(ball.p[1]-this.p2[1])) <= this.r+ball.r && ball.p[1] < this.p2[1]) {
				var unitRamp = [1/sqrt(1+sq(m)),m/sqrt(1+sq(m))];
				var wallTheta = atan(m);
					//Have to adjust because of the radius of the ball.
					ball.restingTop = true;//The ball is on a ramp
					//Dot product of the ball's velocity and a unit vector in the direction of the ramp i.e. How much is the ball going in a direction parallel to the ramp?
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					//The rest of the magnitude must come from the perpendicular component
					var perpendicularVelocity = -ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var aTotal = g*sin(wallTheta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(wallTheta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(wallTheta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(wallTheta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
			}
			if (sqrt(sq(ball.p[0]-this.p2[0])+sq(ball.p[1]-this.p2[1])) > this.r-ball.r) {
				//println(" "+sqrt(sq(ball.v[0])+sq(ball.v[1])));
			}
		}
	};
	return capsule;
};


var newPassage = function(x,y,w,h,left,right,up,down,cutOuts) {
	var passage = {};
	passage.x = x;
	passage.y = y;
	passage.w = w;
	passage.h = h;
	passage.left = left;
	passage.right = right;
	passage.up = up;
	passage.down = down;
	passage.ballIn = false;
	passage.cutOuts = cutOuts;
	passage.drawIt = function() {
		//fill(71, 40, 24);
		//rect(this.x,this.y,this.w,this.h);
		if (waterLevel > this.y + this.h) {
			fill(71, 40, 24);
			rect(this.x,this.y,this.w,this.h+1);
		} else if (waterLevel < this.y) {
			fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2]);
			rect(this.x,this.y,this.w,this.h+1);
		} else {
			fill(71, 40, 24);
			rect(this.x,this.y,this.w,this.h);
			fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2]);
			rect(this.x,waterLevel,this.w,this.y+this.h-waterLevel+1);
		}
	};
	passage.collide = function() {
		//console.log(this.cutOuts);
		/*this.ballIn = false;
		var shouldTest = true;
		for (var j = 0; j < this.deferList.length; j++) {
			if (passages[deferList[j]].ballIn) {
				shouldTest = false;
			}
			if (passages[this.deferList[j]].testCollide) {
				shouldTest = false;
			}
		}*/
		var myShouldTest = true;
		for (var j = 0; j < this.cutOuts.length; j++) {
			if (this.cutOuts[j][0] === 'l') {
				if (ball.p[0]-ball.r < this.x+this.w*1/4 && ball.p[0] > this.x-ball.r && ball.p[1]-ball.r > this.cutOuts[j][1] && ball.p[1]+ball.r < this.cutOuts[j][2]) {
					myShouldTest = false;
					//console.log("hi "+myShouldTest);
				}
			} else if (this.cutOuts[j][0] === 'r') {
				if (ball.p[0]+ball.r > this.x+this.w*3/4 && ball.p[0] < this.x+this.w+ball.r && ball.p[1]-ball.r > this.cutOuts[j][1] && ball.p[1]+ball.r < this.cutOuts[j][2]) {
					myShouldTest = false;
					//console.log("hi "+myShouldTest);
				}
			} else if (this.cutOuts[j][0] === 'u') {
				if (ball.p[1] - ball.r < this.y+5 && ball.p[1]+ball.r > this.y-5 && ball.p[0]-ball.r > this.cutOuts[j][1] && ball.p[0]+ball.r < this.cutOuts[j][2]) {
					myShouldTest = false;
					//console.log("hi "+myShouldTest);
				}
			} else if (this.cutOuts[j][0] === 'd') {
				if (ball.p[1] + ball.r > this.y+this.h-5 && ball.p[1]-ball.r < this.y+this.h+5 && ball.p[0]-ball.r > this.cutOuts[j][1] && ball.p[0]+ball.r < this.cutOuts[j][2]) {
					myShouldTest = false;
					//console.log("hi "+myShouldTest);
				}
			}
		}
		if (myShouldTest) {
			if (ball.p[0] > this.x && ball.p[0] < this.x+this.w && ball.p[1]+ball.r > this.y && ball.p[1]-ball.r < this.y+this.h || ball.p[0]+ball.r > this.x && ball.p[0]-ball.r < this.x+this.w && ball.p[1] > this.y && ball.p[1] < this.y+this.h) {
				/*if (this.cutOuts.length === 1) {
					console.log("Uh, oh "+myShouldTest);
				}*/
				ball.inPassage = true;
				this.ballIn = true;
				if (this.left && ball.p[0]-ball.r < this.x) {//Left side
					var unitRamp = [0,1];
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					var perpendicularVelocity = -ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var theta = 90;
					var aTotal = g*sin(theta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(theta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(theta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(theta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
				}
				if (this.right && ball.p[0]+ball.r > this.x+this.w) {//Right side
					var unitRamp = [0,1];
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					var perpendicularVelocity = ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var theta = 90;
					var aTotal = g*sin(theta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(theta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(theta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(theta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
				}
				if (this.up && ball.p[1]-ball.r < this.y) {//ceiling
					//console.log("hi");
					ball.restingTop = true;
					this.m = 0;
					this.b = this.y+this.h;
					var unitRamp = [1/sqrt(1+sq(this.m)),this.m/sqrt(1+sq(this.m))];
					var unitPer = [this.m/sqrt(1+sq(this.m)),-1/sqrt(1+sq(this.m))];
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					var perpendicularVelocity = ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var theta = atan(this.m);
					var aTotal = g*sin(theta);
					//console.log(sin(theta)+" "+cos(theta));
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(theta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(theta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(theta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
				}
				if (this.down && ball.p[1]+ball.r > this.y+this.h) {//floor
					ball.restingBottom = true;
					this.m = 0;
					this.b = this.y+this.h;
					var unitRamp = [1/sqrt(1+sq(this.m)),this.m/sqrt(1+sq(this.m))];
					var unitPer = [this.m/sqrt(1+sq(this.m)),-1/sqrt(1+sq(this.m))];
					var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
					var perpendicularVelocity = -ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
					ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
					ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
					//ball.v[0] *= ball.e;
					//ball.v[1] *= ball.e;
					var theta = atan(this.m);
					var aTotal = g*sin(theta);
					if (ball.right) {
						aTotal += ball.rightForce*ball.m*cos(theta);
					}
					if (ball.left) {
						aTotal -= ball.leftForce*ball.m*cos(theta);
					}
					if (ball.down) {
						aTotal += 0.05*sin(theta);
					}
					ball.a[0] = aTotal*unitRamp[0];
					ball.a[1] = aTotal*unitRamp[1];
				}
			}
		}
		
		
		
	};
	passage.testCollide = function() {
		if (ball.p[0] > this.x && ball.p[0] < this.x+this.w && ball.p[1]+ball.r > this.y && ball.p[1]-ball.r < this.y+this.h || ball.p[0]+ball.r > this.x && ball.p[0]-ball.r < this.x+this.w && ball.p[1] > this.y && ball.p[1] < this.y+this.h) {
			return true;
		}
		return false;
	};
	return passage;
};

//From old version
var newOldCrystal = function(x,y,s,type,theta) {
	var crystalObject = {};
	crystalObject.p = [x,y];
	crystalObject.s = s;
	crystalObject.collected = false;
	crystalObject.type = type;
	crystalObject.theta = theta;
	crystalObject.r = s/2;
	crystalObject.drawIt = function() {
		if (!this.collected) {
			push();
			translate(this.p[0]+this.r,this.p[1]+this.r);
			rotate(this.theta);
			if (this.type === 1) {
				image(crystal,-this.r,-this.r,this.s,this.s);
			} else if (this.type === 2) {
				image(crystalGroup,-this.r,-this.r,this.s,this.s);
			}
			/*if (waterLevel < this.p[1]+this.s && waterLevel > this.p[1]) {
				fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2],150);
				rect(0,waterLevel-this.p[1],this.s,this.p[1]+this.s-waterLevel);
			} else if (waterLevel < this.p[1]+this.s) {
				fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2],150);
				//rect(0,0,this.s,this.s);
				image(crystalGroupWater,0,0,this.s,this.s);
				//crystalCluster.blend(testImage,0,0,width,height,0,0,width,height,ADD);
			}*/
			pop();
			if (waterLevel > this.p[1]+this.s) {
			} else if (waterLevel > this.p[1]+this.r) {
				fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2],150);
				var waterTheta = acos((waterLevel-(this.p[1]+this.r))/this.r);
				arc(this.p[0]+this.r,waterLevel,2*this.r*sin(waterTheta)+this.r/3,2*(this.p[1]+this.s-waterLevel)+this.r/5,0,180);
			} else if (waterLevel > this.p[1]) {
				fill(groundWaterColor[0],groundWaterColor[1],groundWaterColor[2],150);
				var waterTheta = acos(((this.p[1]+this.r)-waterLevel)/this.r);
				arc(this.p[0]+this.r,this.p[1]+this.r,this.s+this.r/3,this.s+this.r/3,0,180);
				rect(this.p[0]+this.r-(this.s+this.r/3)/2,waterLevel,this.s+this.r/3,this.p[1]+this.r-waterLevel);
			} else {
				push();
				translate(this.p[0]+this.r,this.p[1]+this.r);
				rotate(this.theta);
				if (this.type === 2){
					image(crystalGroupWater,-this.r,-this.r,this.s,this.s);
				} else if (this.type === 1) {
					image(crystalWater,-this.r,-this.r,this.s,this.s);
				}
				pop();
			}
		}
		
	};
	crystalObject.interact = function() {
		if (!this.collected && sqrt(sq(ball.p[0]-(this.p[0]+this.r))+sq(ball.p[1]-(this.p[1]+this.r))) < this.r) {
			this.collected = true;
			if (this.type === 1) {
				ball.score+=50;
			} else if (this.type === 2) {
				ball.score+=150;
			}
		}
	};
	return crystalObject;
};

var newCrystal = function(x,y,s,type,theta,index) {
	var crystalObject = {};
	crystalObject.p = [x,y];
	crystalObject.s = s;
	crystalObject.collected = false;
	crystalObject.type = type;
	crystalObject.theta = theta;
	crystalObject.r = s/2;
	crystalObject.index = index;
	/*image(crystalGroup,0,0,500,500);
	if (type === 2) {
		crystalGroup.loadPixels();
		for (var i = 0; i < crystalGroup.pixels.length; i+=4) {
			crystalGroup.pixels[i+3] = 0;
		}
		crystalGroup.updatePixels();
	}*/
	crystalObject.updateImage = function() {
		if (timer === 0) {
			if (this.type === 2) {
				crystalImages[this.index].loadPixels();
				for (var i = 0; i < crystalImages[this.index].pixels.length; i+=4) {
					crystalImages[this.index].pixels[i+3] = 0;
				}
				crystalImages[this.index].updatePixels();
			} else if (this.type === 1) {
				singleCrystalImages[this.index].loadPixels();
				for (var i = 0; i < singleCrystalImages[this.index].pixels.length; i+=4) {
					singleCrystalImages[this.index].pixels[i+3] = 0;
				}
				singleCrystalImages[this.index].updatePixels();
			}
		} else if (this.type === 2 && waterLevel < this.p[1] + this.s*sqrt(2) && waterLevel > this.p[1]){
			if (this.theta === 0) {
				crystalImages[this.index].loadPixels();
				var start = floor(351*(waterLevel-this.p[1])/this.s)*351*4;
				var end = (floor(351*(waterLevel-this.p[1])/this.s)+10)*351*4;
				var start2 = 0;
				var end2 = crystalImages[index].pixels.length;
				for (var i = start2; i < end2; i+=4) {
					if (i > start && i < end && !(crystalImages[this.index].pixels[i] === 0 && crystalImages[this.index].pixels[i+1] === 0 && crystalImages[this.index].pixels[i+2] === 0)) {
						crystalImages[this.index].pixels[i+3] = 255;
					}
				}
				crystalImages[this.index].updatePixels();
				//console.log(this.p[0]);
			} else {
				//console.log(crystalImages[this.index].height);
				crystalImages[this.index].loadPixels();
				var start = floor(496*(waterLevel-this.p[1]+72*this.s/351)/(this.s*sqrt(2)))*496*4;
				var end = (floor(496*(waterLevel-this.p[1]+72*this.s/351)/(this.s*sqrt(2)))+10)*496*4;
				var start2 = 0;
				var end2 = crystalImages[index].pixels.length;
				for (var i = start2; i < end2; i+=4) {
					if (i > start && i < end && !(crystalImages[this.index].pixels[i] === 0 && crystalImages[this.index].pixels[i+1] === 0 && crystalImages[this.index].pixels[i+2] === 0)) {
						crystalImages[this.index].pixels[i+3] = 255;
					}
				}
				crystalImages[this.index].updatePixels();
				stroke(0,0,0);
				strokeWeight(4);
				//line(this.p[0]-72,this.p[1]-72,this.p[0]-72+496,this.p[1]-72);
				//console.log(this.p[0]);
				noStroke();
			}
			//console.log(frameRate());
		} else if (this.type === 1 && waterLevel < this.p[1] + this.s*sqrt(2) && waterLevel > this.p[1]){
			if (this.theta === 0) {
				singleCrystalImages[this.index].loadPixels();
				var start = floor(351*(waterLevel-this.p[1])/this.s)*351*4;
				var end = (floor(351*(waterLevel-this.p[1])/this.s)+10)*351*4;
				var start2 = 0;
				var end2 = singleCrystalImages[index].pixels.length;
				for (var i = start2; i < end2; i+=4) {
					if (i > start && i < end && !(singleCrystalImages[this.index].pixels[i] === 0 && singleCrystalImages[this.index].pixels[i+1] === 0 && singleCrystalImages[this.index].pixels[i+2] === 0)) {
						singleCrystalImages[this.index].pixels[i+3] = 255;
					}
				}
				singleCrystalImages[this.index].updatePixels();
				//console.log(this.p[0]);
			} else {
				//console.log(singleCrystalImages[this.index].height);
				singleCrystalImages[this.index].loadPixels();
				var start = floor(496*(waterLevel-this.p[1]+72*this.s/351)/(this.s*sqrt(2)))*496*4;
				var end = (floor(496*(waterLevel-this.p[1]+72*this.s/351)/(this.s*sqrt(2)))+10)*496*4;
				var start2 = 0;
				var end2 = singleCrystalImages[index].pixels.length;
				for (var i = start2; i < end2; i+=4) {
					if (i > start && i < end && !(singleCrystalImages[this.index].pixels[i] === 0 && singleCrystalImages[this.index].pixels[i+1] === 0 && singleCrystalImages[this.index].pixels[i+2] === 0)) {
						singleCrystalImages[this.index].pixels[i+3] = 255;
					}
				}
				singleCrystalImages[this.index].updatePixels();
				stroke(0,0,0);
				strokeWeight(4);
				//line(this.p[0]-72,this.p[1]-72,this.p[0]-72+496,this.p[1]-72);
				//console.log(this.p[0]);
				noStroke();
			}
			//console.log(frameRate());
		}
	};
	crystalObject.drawIt = function() {
		if (!this.collected) {
			push();
			translate(this.p[0]+this.r,this.p[1]+this.r);
			rotate(this.theta);
			if (this.type === 1) {
				image(crystal,-this.r,-this.r,this.s,this.s);
			} else if (this.type === 2) {
				image(crystalGroup,-this.r,-this.r,this.s,this.s);
			}
			rotate(-this.theta);
			if (this.type === 2) {
				//console.log(crystalImages[this.index]);
				if (this.theta === 0) {
					image(crystalImages[this.index],-this.r,-this.r,this.s,this.s);
				} else {
					image(crystalImages[this.index],-this.r*sqrt(2),-this.r*sqrt(2),this.s*sqrt(2),this.s*sqrt(2));
				}
			}
			if (this.type === 1) {
				//console.log(crystalImages[this.index]);
				if (this.theta === 0) {
					image(singleCrystalImages[this.index],-this.r,-this.r,this.s,this.s);
				} else {
					image(singleCrystalImages[this.index],-this.r*sqrt(2),-this.r*sqrt(2),this.s*sqrt(2),this.s*sqrt(2));
				}
			}
			pop();
		}
	};
	crystalObject.interact = function() {
		if (!this.collected && sqrt(sq(ball.p[0]-(this.p[0]+this.r))+sq(ball.p[1]-(this.p[1]+this.r))) < this.r) {
			this.collected = true;
			if (this.type === 1) {
				ball.score+=50;
			} else if (this.type === 2) {
				ball.score+=150;
			}
		}
	};
	return crystalObject;
};

var testCircle = newCircleEnclosure(300,300,200);

var testCircle2 = newReverseCircle(300,300,80);

var testCapsule = newCapsuleEnclosure(250,100,500,400);

var testCapsule2 = newReverseCapsule(300,200,400,200);

var testPassage = newPassage(493,250,400,100,false,false,true,true);

var myCrystal = newCrystal(500,290,70,2);

/*var enclosures = [newCircleEnclosure(300,300,200),newCircleEnclosure(1087,300,200),newCapsuleEnclosure(837,893,500,400)];
var reverses = [newReverseCircle(300,300,80),newReverseCapsule(887,993,400,200)];
var passages = [newPassage(493,250,400,100,false,false,true,true),newPassage(1037,493,100,400,true,true,false,false),newPassage(250,-100,100,206,true,true,false,false)];
var crystals = [newCrystal(500,281,70,1,0,0),newCrystal(1178,387,60,2,-40,0),newCrystal(900,1236,60,2,0,1)];*/

var enclosures = [newCircleEnclosure(75,510,230),newCircleEnclosure(75,1530,230),newCircleEnclosure(75,2630,230),
	newCapsuleEnclosure(-500,3430,1000,450),newCircleEnclosure(-1600,3655,130),newCapsuleEnclosure(-2000,2030,800,600),
	newCircleEnclosure(-2460,1050,180),newCircleEnclosure(-2460,3390,180),newCircleEnclosure(1685,3655,200),
	newCapsuleEnclosure(1095,2207,1180,590),newCircleEnclosure(480,2502,150),newCapsuleEnclosure(405,2950,900,370),
	newCapsuleEnclosure(1050,1156,1270,662),newCircleEnclosure(1685,750,150),newCircleEnclosure(1685,250,150),
	newCircleEnclosure(500,750,150),newCircleEnclosure(500,250,150)];
var reverses = [newReverseCircle(75,510,100),newReverseCircle(75,1530,100),newReverseCircle(75,2630,100),
	newReverseCapsule(-250,3542,500,225),newReverseCapsule(-1825,2205,450,250),newReverseCircle(-2460,1050,80),
	newReverseCircle(1685,3655,100),newReverseCapsule(1360,2402,650,200),newReverseCapsule(1368,1322,634,332),
	newReverseCircle(1685,750,60),newReverseCircle(1685,250,60),newReverseCircle(500,750,60),
	newReverseCircle(500,250,60)];
var passages = [newPassage(0,-100,150,400,true,true,false,false,[]),newPassage(0,720,150,600,true,true,false,false,[]),
	newPassage(0,1740,150,680,true,true,false,false,[['l', 2280, 2380]]),newPassage(0,2840,150,600,true,true,false,false,[['l',3100,3250]]),
	newPassage(-1500,3580,790,150,false,false,true,true,[]),newPassage(-1650,2600,100,960,true,true,false,false,[['r',3100,3250]]),
	newPassage(-1550,3100,1550,150,false,false,true,true,[]),newPassage(-920,2280,920,100,false,false,true,true,[]),
	newPassage(-1650,1000,100,1030,true,true,true,false,[['l',1000,1100]]),newPassage(-2300,1000,650,100,false,false,true,true,[]),
	newPassage(-2510,1220,100,2000,true,true,false,false,[]),newPassage(711,3580,790,150,false,false,true,true,[]),
	newPassage(1610,2785,150,685,true,true,false,false,[]),newPassage(610,2427,200,150,false,false,true,true,[]),
	newPassage(405,2632,150,320,true,true,false,false,[]),newPassage(1105,2780,150,170,true,true,false,false,[]),
	newPassage(1610,1818,150,406,true,true,false,false,[]),newPassage(1610,879,150,276,true,true,false,false,[]),
	newPassage(1610,380,150,240,true,true,false,false,[]),newPassage(1610,-100,150,220,true,true,false,false,[]),
	newPassage(1815,675,936,150,false,false,true,true,[]),newPassage(2751,675,150,4000,true,true,false,true,[['l',675,825]]),
	newPassage(630,675,925,150,false,false,true,true,[]),newPassage(425,-100,150,220,true,true,false,false,[]),
	newPassage(425,380,150,240,true,true,false,false,[])];
var crystals = [newCrystal(230,400,60,2,-110,0),newCrystal(-30,1390,70,2,-30,1),newCrystal(160,1550,50,2,112,2),
	newCrystal(123,2000,70,1,0,0),newCrystal(120,2500,50,1,30,1),newCrystal(50,2730,55,2,180,3),
	newCrystal(440,3800,80,2,0,4),newCrystal(-200,3485,60,2,0,5),newCrystal(-1590,3700,80,1,0,2),
	newCrystal(-1000,3180,70,1,0,3),newCrystal(-2225,2475,80,2,50,6),newCrystal(-2550,875,65,2,172,7),newCrystal(-2400,1160,50,2,-10,8),
	newCrystal(-2470,1760,60,2,-90,9),newCrystal(-2510,2260,50,2,90,10),newCrystal(-2465,2760,55,2,-90,11),
	newCrystal(-2490,3490,80,2,0,12),newCrystal(-2580,3490,50,2,40,13),newCrystal(-2400,3480,60,2,-25,14),
	newCrystal(-2445,3215,70,2,-150,15),newCrystal(-2615,3245,70,1,-180,4),newCrystal(-2340,3310,55,2,-100,16),
	newCrystal(1735,3790,48,2,-20,17),newCrystal(1695,3090,70,2,-90,18),newCrystal(980,2712,75,2,28,19),
	newCrystal(2255,2720,80,1,0,5),newCrystal(2325,2215,60,2,-150,20),newCrystal(350,2375,70,1,180,6),
	newCrystal(800,3262,60,2,0,21)];

//['r',3100,3250]
draw = function() {
	angleMode(DEGREES);
	
	//Put code here
	push();
	translate(xTranslate,yTranslate);
	background(130, 214, 237);
	fill(99, 56, 35);
	rect(-6000,-100,20000,20000);
	fill(91, 201, 94);
	rect(-6000,-110,20000,10);
	fill(130, 214, 237);
	rect(0,-110,150,11);
	rect(1610,-110,150,11);
	for (var i = 0; i < enclosures.length; i++) {
		enclosures[i].drawIt();
	}
	for (var i = 0; i < passages.length; i++) {
		passages[i].drawIt();
	}
	for (var i = 0; i < reverses.length; i++) {
		reverses[i].drawIt();
	}
	for (var i = 0; i < crystals.length; i++) {
		crystals[i].updateImage();
	}
	ball.drawIt(255);
	if (yTranslate > -500) {
		image(darkness2,-xTranslate,-100,1200,1500);
	} else if (ball.fullySubmerged) {
		image(waterDarkness, -xTranslate,-yTranslate,600,600);
	} else {
		image(darkness,ball.p[0]-600,ball.p[1]-600,1200,1200);
	}
	for (var i = 0; i < crystals.length; i++) {
		crystals[i].drawIt();
	}
	ball.drawIt(15);
	
	/*fill(130,214,237);
	rect(-5000,-1000,20000,900);
	fill(91, 201, 94);
	rect(-5000,-110,20000,10);
	fill(130, 214, 237);
	rect(250,-111,100,11);*/
	
	
	//Lighting
	/**var lightRadius = 100;
	var leftX = ball.p[0]-lightRadius;
	var upperY = ball.p[1]-lightRadius;
	var rightX = ball.p[0]+lightRadius;
	var lowerY = ball.p[1]+lightRadius;
	
	fill(0,0,0,150);
	rect(0,0,10000,upperY);
	rect(0,upperY,leftX,10000);
	rect(rightX,upperY,10000,lightRadius*2);
	rect(leftX,lowerY,10000,10000);
	
	//stroke(0,0,0,150);
	//strokeWeight(1);
	for (var i = 0; i < lightRadius; i++) {
		for (var j = 0; j < lightRadius; j++) {
			if (sqrt(sq(i-lightRadius)+sq(j-lightRadius)) > lightRadius) {
				point(i+leftX,j+upperY);
				point(rightX-i,j+upperY);
				point(rightX-i,lowerY-j);
				point(i+leftX,lowerY-j);
				rect(i+leftX,j+upperY,1,1);
				rect(rightX-i,j+upperY,1,1);
				rect(rightX-i,lowerY-j,1,1);
				rect(i+leftX,lowerY-j,1,1);
			}
		}
	}
	noStroke();**/
	
	if (ball.p[1] + ball.r/2 > waterLevel && ball.p[1] > -100) {
		ball.inWater = true;
		g = -0.1633;
	} else {
		ball.inWater = false;
		g = 0.1633;
		ball.rightForce = 0.05;
		ball.leftForce = 0.05;
	}
	
	ball.inAirMove();
	
	ball.resting = false;
	ball.restingBottom = false;
	ball.restingTop = false;
	ball.inPassage = false;
	for (var i = 0; i < passages.length; i++) {
		passages[i].collide();
	}
	if (!ball.inPassage) {
		for (var i = 0; i < enclosures.length; i++) {
			enclosures[i].collide();
		}
		for (var i = 0; i < reverses.length; i++) {
			reverses[i].collide();
		}
		if (ball.p[1]+ball.r >= -110 && ball.p[1]+ball.r < -80 && !(ball.p[0] >= 20 && ball.p[0] <= 130) && !(ball.p[0] >= 1630 && ball.p[0] <= 1740)) {//bouncing off floor
			ball.restingBottom = true;
			this.m = 0;
			this.b = -100;
			var unitRamp = [1/sqrt(1+sq(this.m)),this.m/sqrt(1+sq(this.m))];
			var unitPer = [this.m/sqrt(1+sq(this.m)),-1/sqrt(1+sq(this.m))];
			var parallelVelocity = ball.e2*(ball.v[0] * unitRamp[0] + ball.v[1] * unitRamp[1]);
			var perpendicularVelocity = -ball.e*sqrt(sq(ball.v[0])+sq(ball.v[1])-sq(parallelVelocity));
			ball.v[0] = parallelVelocity*unitRamp[0] - perpendicularVelocity*unitRamp[1];
			ball.v[1] = parallelVelocity*unitRamp[1] + perpendicularVelocity*unitRamp[0];
			var theta = atan(this.m);
			var aTotal = 0.1633*sin(theta);
			if (ball.right) {
				aTotal += ball.rightForce*ball.m*cos(theta);
			}
			if (ball.left) {
				aTotal -= ball.leftForce*ball.m*cos(theta);
			}
			ball.a[0] = aTotal*unitRamp[0];
			ball.a[1] = aTotal*unitRamp[1];
		}
	}
	if (!ball.inWater && ball.restingBottom) {
		ball.resting = true;
	}
	if (ball.inWater && ball.restingTop) {
		ball.resting = true;
	}
	ball.move();
	
	for (var i = 0; i < crystals.length; i++) {
		crystals[i].interact();
	}
	
	xTranslate += xTranslateShifter;
	yTranslate += yTranslateShifter;
	if (ball.p[0] > width-50-xTranslate) {
		xTranslateShifter = -abs(ceil(ball.v[0]));
	} else if (ball.p[0] < 50-xTranslate) {
		xTranslateShifter = abs(floor(ball.v[0]));
	} else if (xTranslateShifter > 0) {
		xTranslateShifter *= 0.5;
	} else if (xTranslateShifter < 0) {
		xTranslateShifter *= 0.5;
	}
	
	if (ball.p[1] > height-50-yTranslate) {
		yTranslateShifter = -abs(ceil(ball.v[1]));
	} else if (ball.p[1] < 50-yTranslate) {
		yTranslateShifter = abs(floor(ball.v[1]));
	} else if (yTranslateShifter > 0) {
		yTranslateShifter *= 0.7;
	} else if (yTranslateShifter < 0) {
		yTranslateShifter *= 0.7;
	}

	pop();
	
	if (waterLevel > -100) {
		waterLevel --;
	}
	//console.log(ball.p[1]);
	
	timer++;
	
	if (timer > 45000) {
		console.log("Done!");
		noLoop();
	}
	
	//console.log(ball.p[1]);
		
	fill(255);
	textSize(20);
	text('Score: '+ball.score,270,550);
	
	keyIsReleased = false;
	//mouseIsClicked = false;
};  
