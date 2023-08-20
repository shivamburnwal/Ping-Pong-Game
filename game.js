"use strict";

window.onload = function() {
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("game");

    /** @type {CanvasRenderingContext2D} */
    let ctx = canvas.getContext("2d");

    /** @type {HTMLSelectElement} */
    const wallColorDropdown = document.getElementById("wallColor");

    /** @type {HTMLSelectElement} */
    const paddleColorDropdown = document.getElementById("paddleColor");

    /** @type {HTMLSelectElement} */
    const ballColorDropdown = document.getElementById("ballColor");

    /** @type {HTMLButtonElement} */
    const startStateButton = document.getElementById("startState");

    /** @type {HTMLDivElement} */
    const pauseStateElement = document.getElementById("pauseState");
    
    // Variables for game logic.
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    const winThreshold = 2;
    const speedMultiplier = 1.02;
    const maxSpeed = 6;
    let playerOffset = 0;
    let previousTimestamp = 0;
    let collisonHandled = false;
    let isFirstFrame = true;
    let gameStarted = false;

    // Ball Variables
    const ballRadius = 12;
    let ballX = canvasWidth/2;
    let ballY = canvasHeight/2;
    let vX = (Math.random() < 0.5 ? -1 : 1) * (Math.random() + 1);
    let vY = (Math.random() < 0.5 ? -1 : 1) * (Math.random() + 1);

    // Wall variables
    const vWallWidth = 10;
    const hWallHeight = 10;
    const centerX = canvasWidth/2;
    const gap = 50;

    // Paddle variables
    let keyLeft = false, keyRight = false;
    const paddleSpeed = 3;
    const paddleRadius = 20;
    const paddleHeight = 60;
    let topPaddleX = canvasWidth/2, topPaddleY = paddleHeight;
    let bottomPaddleX = canvasWidth/2, bottomPaddleY = canvasHeight - paddleHeight;

    // Color theme variables
    let wallColorCode = wallColorDropdown.value;
    let wallColor;
    let paddleColorCode = paddleColorDropdown.value;
    let outerPaddleColor, innerPaddleColor, outerHandleColor, innerHandleColor;
    let ballColorCode = ballColorDropdown.value;
    let innerBallColor, outerBallColor;

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
        else if (event.key === " ") {
            if (!gameStarted) { return; }

            gamePaused = !gamePaused;
            if (!gamePaused) {
                pauseStateElement.style.display = "none";
                canvas.classList.remove("blur-pause");
                requestAnimationFrame(startGame);
            }
            else {
                pauseStateElement.style.display = "block";
                canvas.classList.add("blur-pause");
            }
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
    
    wallColorDropdown.addEventListener("change", () => {
        wallColorCode = wallColorDropdown.value;
        wallColorDropdown.blur();
        updateCanvas();
    });

    paddleColorDropdown.addEventListener("change", () => {
        paddleColorCode = paddleColorDropdown.value;
        paddleColorDropdown.blur();
        updateCanvas();
    });

    ballColorDropdown.addEventListener("change", () => {
        ballColorCode = ballColorDropdown.value;
        ballColorDropdown.blur();
        updateCanvas();
    });

    // update the canvas for any changes
    function updateCanvas() {
        setGameColors();
        drawWalls();
        drawPaddles(playerOffset);
        drawBall(ballX, ballY);
    }

    // handle click on start button
    startStateButton.addEventListener("click", () => {
        gameStarted = true;
        startStateButton.style.display = "none";
        canvas.classList.remove("blur");
        requestAnimationFrame(startGame);
    });
    //#endregion

    //#region Draw Objects
    // set colour theme for wall.
    function setWallColor() {
        switch (wallColorCode) {
            case "blue":
                wallColor = "#2C3E50";
                break;
            case "purple":
                wallColor = "#663399";
                break;
            case "pink":
                wallColor = "#C71585";
                break;
            case "yellow":
                wallColor = "#FFA500";
                break;
            case "green":
                wallColor = "#006400";
                break;
            case "red":
                wallColor = "#8B0000";
                break;
            case "brown":
                wallColor = "#A0522D";
                break;
        }
    }

    // drawBorders/Wall
    function drawWalls() {
        // set wall color theme
        setWallColor();

        // Draw top wall
        ctx.fillStyle = wallColor;
        ctx.fillRect(0, 0, vWallWidth, canvasHeight); // Left wall

        ctx.fillRect(0, 0, centerX - gap, hWallHeight); // Left part of top wall
        ctx.fillRect(centerX + gap, 0, centerX - gap, hWallHeight); // Right part of top wall

        ctx.fillRect(canvasWidth - vWallWidth, 0, vWallWidth, canvasHeight); // Right wall

        ctx.fillRect(0, canvasHeight - hWallHeight, centerX - gap, hWallHeight); // Left part of bottom wall
        ctx.fillRect(centerX + gap, canvasHeight - hWallHeight, centerX - gap, hWallHeight); // Right part of bottom wall
    }

    // set color for paddles.
    function setPaddleColor() {
        switch (paddleColorCode) {
            case "blue":
                outerPaddleColor = "#5ca4a4";
                innerPaddleColor = "#a3c7c7";
                outerHandleColor = "#649292";
                innerHandleColor = "#9cb6b6";
                break;
            case "purple":
                outerPaddleColor = "#755ca4";
                innerPaddleColor = "#b5a3d9";
                outerHandleColor = "#8e649b";
                innerHandleColor = "#b69cc7";
                break;
            case "pink":
                outerPaddleColor = "#a45c8e";
                innerPaddleColor = "#d9a3bb";
                outerHandleColor = "#9b6482";
                innerHandleColor = "#c79cb1";
                break;
            case "yellow":
                outerPaddleColor = "#a48c5c";
                innerPaddleColor = "#d9c6a3";
                outerHandleColor = "#9b8264";
                innerHandleColor = "#c7b69c";
                break;
            case "green":
                outerPaddleColor = "#6B8E23";
                innerPaddleColor = "#8FBC8F";
                outerHandleColor = "#556B2F";
                innerHandleColor = "#90EE90";
                break;
            case "red":
                outerPaddleColor = "#8B0000";
                innerPaddleColor = "#DC143C";
                outerHandleColor = "#B22222";
                innerHandleColor = "#FF4500";
                break;
            case "grey":
                outerPaddleColor = "#6B6B6B";
                innerPaddleColor = "#9E9E9E";
                outerHandleColor = "#444444";
                innerHandleColor = "#7B7B7B";
                break;
        }
    }

    // drawPaddles
    function drawPaddles(playerOffset) {
        // update color theme
        setPaddleColor();

        // Top paddle
        const topPaddleGradient = ctx.createRadialGradient(topPaddleX, topPaddleY, paddleRadius, topPaddleX, topPaddleY, paddleRadius * 0.2);
        topPaddleGradient.addColorStop(0, outerPaddleColor);
        topPaddleGradient.addColorStop(1, innerPaddleColor);

        ctx.fillStyle = topPaddleGradient;
        ctx.beginPath();
        ctx.arc(topPaddleX, topPaddleY, paddleRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bottom paddle
        const bottomPaddleGradient = ctx.createRadialGradient(bottomPaddleX, bottomPaddleY, paddleRadius, bottomPaddleX, bottomPaddleY, paddleRadius * 0.2);
        bottomPaddleGradient.addColorStop(0, outerPaddleColor);
        bottomPaddleGradient.addColorStop(1, innerPaddleColor);

        ctx.fillStyle = bottomPaddleGradient;
        ctx.beginPath();
        bottomPaddleX = canvasWidth / 2 + playerOffset;
        ctx.arc(bottomPaddleX, bottomPaddleY, paddleRadius, 0, Math.PI * 2);
        ctx.fill();

        // Top paddle handle
        const topHandleGradient = ctx.createRadialGradient(topPaddleX, topPaddleY, paddleRadius/2, topPaddleX, topPaddleY, 0);
        topHandleGradient.addColorStop(0, outerHandleColor);
        topHandleGradient.addColorStop(1, innerHandleColor);

        ctx.fillStyle = topHandleGradient;
        ctx.beginPath();
        ctx.arc(topPaddleX, topPaddleY, paddleRadius/2, 0, Math.PI * 2);
        ctx.fill();

        // Bottom paddle handle
        const bottomHandleGradient = ctx.createRadialGradient(bottomPaddleX, bottomPaddleY, paddleRadius/2, bottomPaddleX, bottomPaddleY, 0);
        bottomHandleGradient.addColorStop(0, outerHandleColor);
        bottomHandleGradient.addColorStop(1, innerHandleColor);

        ctx.fillStyle = bottomHandleGradient;
        ctx.beginPath();
        ctx.arc(bottomPaddleX, bottomPaddleY, paddleRadius/2, 0, Math.PI * 2);
        ctx.fill();
    }

    // set color for ball.
    function setBallColor() {
        switch (ballColorCode) {
            case "blue":
                innerBallColor = "#8DB6CD";
                outerBallColor = "#87CEEB";
                break;
            case "purple":
                innerBallColor = "#A9A9F5";
                outerBallColor = "#9370DB";
                break;
            case "pink":
                innerBallColor = "#FFB6C1";
                outerBallColor = "#FF69B4";
                break;
            case "yellow":
                innerBallColor = "#FFFF99";
                outerBallColor = "#FFFF00";
                break;
            case "green":
                innerBallColor = "#b4e6b0";
                outerBallColor = "#87CEEB";
                break;
            case "red":
                innerBallColor = "#FF6347";
                outerBallColor = "#FF4500";
                break;
            case "grey":
                innerBallColor = "#D3D3D3";
                outerBallColor = "#C0C0C0";
                break;
        }
    }

    // drawBall
    function drawBall(x, y) {
        // set ball color theme
        setBallColor();

        const gradient = ctx.createRadialGradient(x, y, ballRadius * 0.5, x, y, ballRadius);
        gradient.addColorStop(0, innerBallColor);
        gradient.addColorStop(1, outerBallColor);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
    //#endregion

    //#region Game Logic
    function distance(pointA, pointB) {
        return Math.sqrt( (pointA.x - pointB.x)**2 + (pointA.y - pointB.y)**2 );
    }

    // Get ball position.
    function getBallPosition(deltaTime) {
        let topPaddleCenter = { x:topPaddleX, y:topPaddleY };
        let bottomPaddleCenter = { x:bottomPaddleX, y:bottomPaddleY };
        let ballCenter = { x:ballX, y:ballY };

        // handle first frame interaction.
        if (isFirstFrame) {
            isFirstFrame = false;
            return {ballX, ballY};
        }

        // handle first frame problems when deltatime is not existant.
        if (deltaTime == 0 || isNaN(deltaTime)) {
            return {ballX, ballY};
        }

        // Check anybody won?
        if ((ballX > centerX - gap) && (ballX < centerX + gap)) {
            if (Math.abs(ballY - ballRadius - hWallHeight) <= winThreshold) {
                console.log("You Won. Hurray...");
            }
            else if (Math.abs(ballY + hWallHeight + ballRadius - canvasHeight) <= winThreshold) {
                console.log("You Lost! Try Again.");
            }
        }

        // collison with paddle?
        if (distance(topPaddleCenter, ballCenter) <= ballRadius + paddleRadius) {
            if (!collisonHandled) { handlePaddleCollison(topPaddleCenter, ballCenter); }
        }
        if (distance(bottomPaddleCenter, ballCenter) <= ballRadius + paddleRadius) {
            if (!collisonHandled) { handlePaddleCollison(bottomPaddleCenter, ballCenter); }
        }

        handleWallCollison();

        ballX += vX * deltaTime;
        ballY += vY * deltaTime;
        return {ballX, ballY};
    }

    // function to handle all wall collisons.
    function handleWallCollison() {
        if (ballX <= (ballRadius + vWallWidth)) {
            ballX = ballRadius + vWallWidth + 1;
            vX = -vX;
        }
        else if (ballX >= (canvasWidth - ballRadius - vWallWidth)) {
            ballX = canvasWidth - ballRadius - vWallWidth - 1;
            vX = -vX;
        }

        if (ballY <= (ballRadius + hWallHeight)) {
            ballY = ballRadius + hWallHeight + 1;
            vY = -vY;
        }
        else if (ballY >= (canvasHeight - ballRadius - hWallHeight)) {
            ballY = canvasHeight - ballRadius - hWallHeight - 1;
            vY = -vY;
        }
    }

    // handle ball collisons with paddles.
    function handlePaddleCollison(paddle, ball) {
        const collisonVector = { x: ball.x - paddle.x, y: ball.y - paddle.y };
        const dis = distance(paddle, ball);
        const normalVector = { x: collisonVector.x/dis, y: collisonVector.y/dis };
        const dotProduct = vX * normalVector.x + vY * normalVector.y;

        collisonHandled = true;

        // Update ball position slightly to make sure continuous collisions doesn't take place.
        ballX = paddle.x + (paddleRadius + ballRadius + 1) * normalVector.x;
        ballY = paddle.y + (paddleRadius + ballRadius + 1) * normalVector.y;

        // Update velocities.
        vX -= 2 * dotProduct * normalVector.x;
        vY -= 2 * dotProduct * normalVector.y;

        // Increase speed after each collision.
        vX = Math.min(vX*speedMultiplier, maxSpeed);
        vY = Math.min(vY*speedMultiplier, maxSpeed);
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

    // update game colors in starting
    function setGameColors() {
        setWallColor();
        setPaddleColor();
        setBallColor();
    }
    //#endregion

    // Initial Canvas View.
    setGameColors();
    drawWalls();
    drawPaddles(playerOffset);
    drawBall(ballX, ballY);

    // startGame
    function startGame(timestamp) {
        if ( !gameStarted ) { return; }

        if (gamePaused) {
            previousTimestamp = timestamp;
            requestAnimationFrame(startGame);
            return;
        }

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
}