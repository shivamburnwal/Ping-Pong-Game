"use strict";

window.onload = function() {
    /** @type {HTMLDivElement} */
    const container = document.getElementById("container");

    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("game");

    /** @type {CanvasRenderingContext2D} */
    let ctx = canvas.getContext("2d");

    // Variables for game logic.
    let paddleKeyLeft = false, paddleKeyRight = false;
    const ballSize = 12;
    const paddleWidth = 80, paddleHeight = 15, paddleDistance = 40;
    let playerOffset = 0;
    let previousTimestamp = 0;

    //#region Event Listeners...
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    function handleKeyDown(/** @type {KeyboardEvent} */ event) {
        if (event.key === "ArrowLeft") {
            console.log("left pressed");
            paddleKeyLeft = true;
        }
        else if (event.key === "ArrowRight") {
            console.log("right pressed");
            paddleKeyRight = true;
        }
    }

    function handleKeyUp(/** @type {KeyboardEvent} */ event) {
        if (event.key === "ArrowLeft") {
            console.log("left unpressed");
            paddleKeyLeft = false;
        }
        else if (event.key === "ArrowRight") {
            console.log("right unpressed");
            paddleKeyRight = false;
        }
    }
    //#endregion

    // drawBall
    function drawBall() {
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, ballSize, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
    }

    // drawPaddles
    function drawPaddles(playerOffset) {
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.roundRect(canvas.width/2 - paddleWidth/2, paddleDistance, paddleWidth, paddleHeight, 5); // Adjust the positioning as needed
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(canvas.width/2 - paddleWidth/2 + playerOffset, canvas.height - paddleHeight - paddleDistance, paddleWidth, paddleHeight, 5); // Adjust the positioning as needed
        ctx.fill();
    }

    // drawBorders on wall later to prevent ball from scoring...

    // updateDirection : function to update ball direction
    function updateGame(playerOffset, deltaTime) {
        const paddleSpeed = 1.5;
        if (paddleKeyLeft) {
            playerOffset -= paddleSpeed * deltaTime / 10;
        }
        else if (paddleKeyRight) {
            playerOffset += paddleSpeed * deltaTime / 10;
        }
        return playerOffset;
    }

    // startGame
    function startGame(timestamp) {
        const deltaTime = timestamp - previousTimestamp;
        previousTimestamp = timestamp;

        playerOffset = updateGame(playerOffset, deltaTime);
        // console.log(playerOffset);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBall();
        drawPaddles(playerOffset);

        requestAnimationFrame(startGame);
    }

    requestAnimationFrame(startGame);
}