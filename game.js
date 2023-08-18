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
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;

    // Ball Variables
    const ballSize = 12;
    let ballX = canvasWidth/2;
    let ballY = canvasHeight/2;
    let vX = (Math.random() < 0.5 ? -1 : 1) * (Math.random() + 1);
    let vY = (Math.random() < 0.5 ? -1 : 1) * (Math.random() + 1);

    // Wall variables
    const vWallWidth = 7;
    const hWallHeight = 7;
    const centerX = canvasWidth/2;
    const gap = 60;

    // Paddle variables
    const paddleWidth = 80, paddleHeight = 20, paddleDistance = 40;

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

    //#region draw objects
    // drawBorders/Wall
    function drawWalls() {
        // Draw top wall
        ctx.fillStyle = "brown";
        ctx.fillRect(0, 0, vWallWidth, canvasHeight); // Left wall

        ctx.fillRect(0, 0, centerX - gap, hWallHeight); // Left part of top wall
        ctx.fillRect(centerX + gap, 0, centerX - gap, hWallHeight); // Right part of top wall

        ctx.fillRect(canvasWidth - vWallWidth, 0, vWallWidth, canvasHeight); // Right wall

        ctx.fillRect(0, canvasHeight - hWallHeight, centerX - gap, hWallHeight); // Left part of bottom wall
        ctx.fillRect(centerX + gap, canvasHeight - hWallHeight, centerX - gap, hWallHeight); // Right part of bottom wall
    }

    // drawPaddles
    function drawPaddles(playerOffset) {
        const gradientPaddleTop = ctx.createLinearGradient(
            canvasWidth / 2 - paddleWidth / 2 + playerOffset, paddleDistance,
            canvasWidth / 2 - paddleWidth / 2 + playerOffset, paddleDistance + paddleHeight
        );
        gradientPaddleTop.addColorStop(0, "rgba(0, 0, 255, 0)"); // Almost transparent blue at the top
        gradientPaddleTop.addColorStop(0.3, "rgba(0, 0, 255, 0.6)");    
        gradientPaddleTop.addColorStop(0.5, "rgba(0, 0, 255, 1)");    
        gradientPaddleTop.addColorStop(0.7, "rgba(0, 0, 255, 0)");    
        gradientPaddleTop.addColorStop(1, "rgba(0, 0, 255, 0)"); // Fully opaque blue at the bottom    

        ctx.fillStyle = gradientPaddleTop;
        ctx.beginPath();
        ctx.roundRect(canvasWidth/2 - paddleWidth/2, paddleDistance, paddleWidth, paddleHeight, 5);
        ctx.fill();

        const gradientPaddleBottom = ctx.createLinearGradient(
            canvasWidth / 2 - paddleWidth / 2 + playerOffset, canvasHeight - paddleDistance - paddleHeight,
            canvasWidth / 2 - paddleWidth / 2 + playerOffset, canvasHeight - paddleDistance
        );
        gradientPaddleBottom.addColorStop(0, "rgba(0, 0, 255, 0)"); // Almost transparent blue at the top
        gradientPaddleBottom.addColorStop(0.3, "rgba(0, 0, 255, 0)");    
        gradientPaddleBottom.addColorStop(0.5, "rgba(0, 0, 255, 1)");    
        gradientPaddleBottom.addColorStop(0.7, "rgba(0, 0, 255, 0.6)");    
        gradientPaddleBottom.addColorStop(1, "rgba(0, 0, 255, 0)"); // Fully opaque blue at the bottom
    
        ctx.fillStyle = gradientPaddleBottom;
        ctx.beginPath();
        ctx.roundRect(canvasWidth/2 - paddleWidth/2 + playerOffset, canvasHeight - paddleHeight - paddleDistance, paddleWidth, paddleHeight, 5);
        ctx.fill();
    }

    // drawBall
    function drawBall(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, ballSize, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
    }
    //#endregion

    // Get ball position.
    function getBallPosition(deltaTime) {
        ballX += vX * deltaTime;
        ballY += vY * deltaTime;
        if ((ballX < (ballSize + vWallWidth)) || (ballX > (canvasWidth - ballSize - vWallWidth))) {
            vX = -vX;
        }
        if ((ballY < (ballSize + hWallHeight)) || (ballY > (canvasHeight - ballSize - hWallHeight))) {
            vY = -vY;
        }
        return {ballX, ballY}
    }

    // Handle ball collisons with paddles.
    function handleCollisons(ballX, ballY, playerOffset) {
        let topPaddleY = paddleDistance + paddleHeight/2;
        let bottomPaddleY = canvasHeight - paddleHeight/2 - paddleDistance;
        // Top Paddle Collision
        if ((ballY - ballSize <= topPaddleY) && (ballY + ballSize >= topPaddleY)) {
            if ((ballX >= centerX - paddleWidth/2) && 
                (ballX <= centerX + paddleWidth/2)){
                vY *= -1.1;
                vX *= 1.01;
            }
        }
        // Bottom Paddle Collision
        if ((ballY + ballSize >= bottomPaddleY) && (ballY - ballSize <= bottomPaddleY)) {
            if ((ballX >= centerX - paddleWidth/2 + playerOffset) && 
                (ballX <= centerX + paddleWidth/2 + playerOffset)) {
                vY *= -1.1;
                vX *= 1.01;
            }
        }
    }

    // updateDirection : function to update ball direction
    function updateGame(playerOffset, deltaTime) {
        const paddleSpeed = 1.5;
        if (paddleKeyLeft) {
            playerOffset -= paddleSpeed * deltaTime;
            playerOffset = Math.max(playerOffset, -(canvasWidth / 2) + vWallWidth + paddleWidth/2);
        }
        else if (paddleKeyRight) {
            playerOffset += paddleSpeed * deltaTime;
            // Ensure the right paddle doesn't go outside the right wall
            playerOffset = Math.min(playerOffset, (canvasWidth / 2) - vWallWidth - paddleWidth/2);
        }
        return playerOffset;
    }

    // startGame
    function startGame(timestamp) {
        const deltaTime = (timestamp - previousTimestamp)/10;
        previousTimestamp = timestamp;

        playerOffset = updateGame(playerOffset, deltaTime);
        // console.log(playerOffset);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.imageSmoothingEnabled = true;

        drawWalls();
        drawPaddles(playerOffset);

        var {ballX, ballY} = getBallPosition(deltaTime);
        drawBall(ballX, ballY);

        handleCollisons(ballX, ballY, playerOffset);

        requestAnimationFrame(startGame);
    }

    requestAnimationFrame(startGame);
}