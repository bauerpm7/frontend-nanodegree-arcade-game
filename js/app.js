"use strict";
/**
 *Makes sure game is paused when the page is initially loaded
 */

$(document).ready(function(){
     player.paused = true;
});

// Enemy Constructor
const Enemy = function() {
    //enemy properties
    this.sprite = 'images/enemy-bug.png';
    this.x = 100;
    this.setRow();
    this.speed = this.getRandomSpeed(250);
};

/**
 * This function generates a random speed for the enemies
 * it takes in one parameter max which is the max speed
 * The addition of the 125 gives a minimum speed
 */
Enemy.prototype.getRandomSpeed = function(max) {
    return Math.floor(Math.random() * max) + 125;
};

/**
 *This function randomly selects a row for each of the enemies
 *it takes in no parameters
 */
Enemy.prototype.setRow = function(){
        let num = Math.random();
        if (num <=0.33)
            this.y = 60;
        
        else if (num > 0.67) 
            this.y = 143;
        
        else
            this.y = 226;
        return this.y;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x > 500){
        this.x = -101;
    }
};

// Draws the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Player constructor
const Player = function(x,y) {
    //player properties
    this.sprite = 'images/char-boy.png';
    this.x = x;
    this.y = y;
    this.paused = false;
    this.hasPlayed = false;
    this.sounds = {
        collision: 'sounds/collision.wav',
        hop: 'sounds/hop.wav',
        crossed: 'sounds/crossed.wav',
        foundStar: 'sounds/star.wav',
        lose: 'sounds/loser.wav',
        win: 'sounds/win.mp3'
    };
};

/**This function checks for various state changes in the game including:
 * Whether the player has made it across the road
 * If the player has collided with an enemy
 * If the player has won or lost the game
 */
Player.prototype.update = function(){
    this.checkCollision();
    this.crossed();
    this.win();
    this.lose();
};
// Draws the player on the screen
Player.prototype.render = function() {

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * This function handles the keyboard input.  Based it sets the arrow keys as defined below
 * as move left, right, up, or down.  I have also 'disabled' all other keys.
 * the function takes one parameter: key
 */
Player.prototype.handleInput = function(key) {
    this.playSound(this.sounds.hop);
    switch (key) {
        case 'left':
            if (this.x >10 && !this.paused){
                this.x += -101;
            }
            break;
        case 'right':
            if(this.x < 400 && !this.paused) {
                this.x += 101;
            }
            break;
        case 'up':
            if (this.y > -10 && !this.paused) {
                this.y += -83;
            }
            break;
        case 'down':
            if (this.y < 405 && !this.paused){
                this.y += 83;
            }
            break;
        default:
            this.x += 0;
            this.y += 0;
    }

};
//This function checks player collisions with the bugs.
Player.prototype.checkCollision = function(){
    for (let e = 0; e < 4; e++){
        if (allEnemies[e].x < this.x + 80 &&
            allEnemies[e].x + 80 > this.x &&
            allEnemies[e].y < this.y + 20 &&
            allEnemies[e].y + 20 > this.y){
            this.resetPlayerPosition();
            lives.incrementLives();
            this.playSound(this.sounds.collision);
        }
    }
};

// Checks to see if the player has made it across the road
Player.prototype.crossed = function () {
    if (this.y <=-10){
        this.resetPlayerPosition();
        scoreBoard.incrementScore(10);
        this.playSound(this.sounds.crossed);
    }
};

/**
 * Plays sounds when called
 * takes a sound file as a parameter 
 */
Player.prototype.playSound = function(soundFile) {
        var sound = new Audio(soundFile);
        sound.play();
};

// Resets the position of the player after collision, the player makes it across the road and when the player wins or loses
Player.prototype.resetPlayerPosition = function (){
        this.x = 202;
        this.y = 405;
};

// Calls various functions when the player wins the game by reaching 200 points.
Player.prototype.win = function(){
    if (scoreBoard.score >= 200){
        this.winningMessage();
        this.paused = true;
        this.resetPlayerPosition();
        star.hideStar();
        if(this.hasPlayed === false){
            this.playSound(this.sounds.win);
            this.hasPlayed = true;
        }
    }
    else{
        return;
    }
};

//// Calls various functions when the player loses the game by losing all three lives
Player.prototype.lose = function(){
    if (lives.playerLives <= 0){
        this.losingMessage();
        this.paused = true;
        star.hideStar();
        if(this.hasPlayed === false){
         this.playSound(this.sounds.lose);
         this.hasPlayed = true;
        }   
    }
    else{
        return;
    }
};

// Changes the css display property for the winningModal from none to block
Player.prototype.winningMessage = function(){
    $('.winningModal').css('display','block');
};

// Changes the css display property for the losingModal from none to block
Player.prototype.losingMessage = function(){
    $('.losingModal').css('display','block');
};

// Closes either winning or losing modal window when called
Player.prototype.closeModal = function(){
        $('.modal').css('display','none');
};

// Closes the Starting modal when called
Player.prototype.closeStartingModal = function() {
    $('.startingModal').css('display','none');
};

//resets score, lives, enemy position, player position etc. when player restarts game after winning or losing
Player.prototype.resetGame = function(){
    scoreBoard.score = 0;
    lives.playerLives = 3;
    star.randomStar();
    this.hasPlayed = false;
    for(let e = 0; e < allEnemies.length; e++){
        allEnemies[e].setRow();
        allEnemies[e].speed = allEnemies[e].getRandomSpeed(250);
    }
    this.paused = false;
};

// Star Constructor
const Star = function(){
    this.sprite = 'images/Star.png';
    this.randomStar();
};

//Generates random x and y positions for the star
Star.prototype.randomLocation = function(){
    this.x = Math.floor(Math.random() * 5) * 101;
    this.y = Math.ceil(Math.random() * 3) * 83 - 11;
};

// Updates the star if there is a collision
Star.prototype.update = function() {
    this.checkCollision();
};

// Draws the star on the screen
Star.prototype.render = function() {

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Checks to see if the player has 'collided' with a star and calls methods to play sound, hide the star etc.
Star.prototype.checkCollision = function(){
    if (this.x < player.x + 80 &&
        this.x + 80 > player.x &&
        this.y < player.y + 20 &&
        this.y + 20 > player.y){
        
        this.hideStar();
        player.playSound(player.sounds.foundStar);
        scoreBoard.incrementScore(20);
        this.randomStar();
        }
};

// Hides the star when called
Star.prototype.hideStar = function(){
    this.x = -101;
    this.y = -101;
};

//Calls a method to determine the position  of a new star after waiting for 1-15 secconds
Star.prototype.randomStar = function() {
    setTimeout(function () {star.randomLocation()}, Math.random() * 15000);
};

// Scoreboard Constructor
const ScoreBoard = function(txt) {
    this.txt = txt;
    this.score = 0;

};

//Draws the Score on the screen
ScoreBoard.prototype.render = function() {
    ctx.font = "30px Concert One";
    ctx.fillStyle = "black";
    ctx.fillText(this.txt + this.score, 340, 30);
};

//Increments the score when called
ScoreBoard.prototype.incrementScore = function(points){
    this.score += points;
};

// Lives Constructor
const Lives = function(txt) {
    this.txt = txt;
    this.playerLives = 3;
};

//Draws the Lives object on the screen
Lives.prototype.render = function() {
    ctx.font = "30px Concert One";
    ctx.fillStyle = "black";
    ctx.fillText(this.txt + this.playerLives, 10, 30);
};

//Increments the players lives when called
Lives.prototype.incrementLives = function(){
    this.playerLives--;
};


//Event Listeners
//Listens for the player to click the play again button in the winning or losing modal window
$('.play').click(function playAgain(){
    player.closeModal();
    player.resetGame();
});

//Listens for the player to click the Start Game button on the start game modal window
$('.start').click(function start(){
    player.closeStartingModal();
    player.paused = false;
});

//Sets which keys are allowed in the game and listens for them to be pressed
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// Instantiate Objects
const enemy1 = new Enemy();
const enemy2 = new Enemy();
const enemy3 = new Enemy();
const enemy4 = new Enemy();

// Place all enemy objects in an array called allEnemies
let allEnemies = [enemy1, enemy2, enemy3, enemy4];

const player = new Player(202, 405);

const scoreBoard = new ScoreBoard('SCORE : ');

const lives = new Lives('LIVES : ');

const star = new Star();
