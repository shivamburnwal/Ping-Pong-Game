"use strict";

window.onload = function() {
    /** @type {HTMLDivElement} */
    const container = document.getElementById("container");

    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("game");

    /** @type {CanvasRenderingContext2D} */
    let ctx = canvas.getContext("2d");

    // Variables for game logic.
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    const winThreshold = 3;
    const speedMultiplier = 1.02;
    const maxSpeed = 5;

    let playerOffset = 0;
    let previousTimestamp = 0;
    let collisonHandled = false;

    // Ball Variables
    const ballRadius = 12;
    let ballX = canvasWidth/2;
    let ballY = canvasHeight/2;
    let vX = (Math.random() < 0.5 ? -1 : 1) * (Math.random() + 1);
    let vY = (Math.random() < 0.5 ? -1 : 1) * (Math.random() + 1);

    // Wall variables
    const vWallWidth = 7;
    const hWallHeight = 7;
    const centerX = canvasWidth/2;
    const gap = 50;

    // Paddle variables
    let keyLeft = false, keyRight = false;
    const paddleSpeed = 5;
    const paddleRadius = 20;
    const paddleWidth = 2*paddleRadius, paddleHeight = 20, paddleDistance = 40;
    let topPaddleX = canvasWidth/2, topPaddleY = paddleDistance;
    let bottomPaddleX = canvasWidth/2, bottomPaddleY = canvasHeight - paddleHeight - paddleDistance;

    //#region Event Listeners...
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    function handleKeyDown(/** @type {KeyboardEvent} */ event) {
        if (event.key === "ArrowLeft") {
            keyLeft = true;
        }
        else if (event.key === "ArrowRight") {
            keyRight = true;
        }
    }

    function handleKeyUp(/** @type {KeyboardEvent} */ event) {
        if (event.key === "ArrowLeft") {
            keyLeft = false;
        }
        else if (event.key === "ArrowRight") {
            keyRight = false;
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
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(topPaddleX, topPaddleY, paddleRadius, 0, Math.PI*2);
        ctx.fill();
    
        ctx.fillStyle = "blue";
        ctx.beginPath();
        bottomPaddleX = canvasWidth/2 + playerOffset;
        ctx.arc(bottomPaddleX, bottomPaddleY, paddleRadius, 0, Math.PI*2);
        ctx.fill();
    }

    // drawBall
    function drawBall(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
    }
    //#endregion

    function distance(pointA, pointB) {
        return Math.sqrt( (pointA.x - pointB.x)**2 + (pointA.y - pointB.y)**2 );
    }

    // Get ball position.
    function getBallPosition(deltaTime) {
        let topPaddleCenter = { x:topPaddleX, y:topPaddleY };
        let bottomPaddleCenter = { x:bottomPaddleX, y:bottomPaddleY };
        let ballCenter = { x:ballX, y:ballY };

        // Check anybody won?
        if ((ballX > centerX - gap) && (ballX < centerX + gap)) {
            if (Math.abs(ballY - ballRadius) <= winThreshold) {
                console.log("You Won. Hurray...");
            }
            else if (Math.abs(ballY - (canvasHeight - ballRadius)) <= winThreshold) {
                console.log("You Lost! Try Again.");
            }
        }

        if ((ballX <= (ballRadius + vWallWidth)) || (ballX >= (canvasWidth - ballRadius - vWallWidth))) {
            vX = -vX;
        }
        if ((ballY <= (ballRadius + hWallHeight)) || (ballY >= (canvasHeight - ballRadius - hWallHeight))) {
            vY = -vY;
        }
        if (distance(topPaddleCenter, ballCenter) <= ballRadius + paddleRadius) {
            if (!collisonHandled) { handleCollison(topPaddleCenter, ballCenter); }
        }
        if (distance(bottomPaddleCenter, ballCenter) <= ballRadius + paddleRadius) {
            if (!collisonHandled) { handleCollison(bottomPaddleCenter, ballCenter); }
        }

        ballX += vX * deltaTime;
        ballY += vY * deltaTime;
        return {ballX, ballY};
    }

    // Handle ball collisons with paddles.
    function handleCollison(paddle, ball) {
        const collisonVector = { x: ball.x - paddle.x, y: ball.y - paddle.y };
        const dis = distance(paddle, ball);
        const normalVector = { x: collisonVector.x/dis, y: collisonVector.y/dis };
        const dotProduct = vX * normalVector.x + vY * normalVector.y;

        collisonHandled = true;

        // Update velocities.
        vX -= 2 * dotProduct * normalVector.x;
        vY -= 2 * dotProduct * normalVector.y;

        // Increase speed after each collision.
        vX = Math.min(vX*speedMultiplier, maxSpeed);
        vY = Math.min(vY*speedMultiplier, maxSpeed);

        console.log(vX, vY);
    }

    // updateDirection : function to update ball direction
    function updateGame(playerOffset, deltaTime) {
        if (keyLeft) {
            playerOffset -= paddleSpeed*deltaTime;
            playerOffset = Math.max(playerOffset, -canvasWidth/2 + paddleRadius + vWallWidth);
        }
        else if (keyRight) {
            playerOffset += paddleSpeed*deltaTime;
            playerOffset = Math.min(playerOffset, canvasWidth/2 - paddleRadius - vWallWidth);
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

        let {ballX, ballY} = getBallPosition(deltaTime);
        drawBall(ballX, ballY);

        collisonHandled = false;
        requestAnimationFrame(startGame);
    }

    requestAnimationFrame(startGame);
}