 let canvas;
 let ctx;
 let gBArrayHeight = 20; //# of cells in array height
 let gBArrayWidth = 12;  //# of cells in array width
 let startX = 4;   //starting X position for Tetromino
 let startY = 0;   //starting Y position ofr Tetromino
 let score = 0;
 let level = 1;
 let winOrLose = "Playing";
 let tetrisLogo;

 // contains x & y position we can use to draw the box on the canvas
 let coordinateArray = [... Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
 let curTetromino = [[1,0], [0,1], [1,1], [2,1]];

// Will hold all the Tetrominos
 let tetrominos = [];

 //The Tetromino array with the colors matches to the tetrominos array
 let tetrominoColors = ['purple', 'cyan', 'blue', 'yellow', 'orange', 'green', 'red'];

 let curTetrominoColor;

 // Create gameboard array so we know where other squares are
 let gBArray = [... Array(20)].map(e => Array(12).fill(0));
 
 //Array for storing stopped shapes
 //It will hold colors when a shape stops and is added
 let stoppedShapeArray = [... Array(20)].map(e => Array(12).fill(0));
 

 //Track direction
let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};

let direction;


 // Individual Tertromino objects
 class Coordinates{
     constructor(x,y){
         this.x = x;
         this.y = y;
     }
 }

 // populate canvas
 document.addEventListener('DOMContentLoaded', SetupCanvas);

// Creates the array with square coordinates 
 function CreateCoordArray(){
     let i = 0, j = 0;
     for (let y = 9; y <= 446; y+= 23){   //446= max height
        // 12 * 23 = 276 - 12 = 264
        for (let x = 11; x <= 264; x+=23){        //264= max width
            coordinateArray[i][j] = new Coordinates(x,y);
            i++;
        }
        j++;
        i= 0;
    }      
} 

function SetupCanvas(){
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 936;
    canvas.height = 956;

    ctx.scale(2,2);  //scale canvas in browser window

    //Draw Canvas Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0, canvas.width, canvas.height);  //create grid on canvas board
    
    //Draw gameboard rectangle
    ctx.strokeStyle = 'black';
    ctx.strokeRect(8, 8, 280, 462);   //border on canvas

    //Tetris Logo
    tetrisLogo = new Image(161, 54);
    tetrisLogo.onload = DrawTetrisLogo;
    tetrisLogo.src = "tetrislogo.png"

    // Set font for score lable text and draw
    ctx.fillStyle = 'black';
    ctx.font = '21px Arial';
    ctx.fillText("SCORE", 300, 98);

    //Draw score rectangle
    ctx.strokeRect(300, 107, 161, 24);

    //Draw score
    ctx.fillText(score.toString(), 310, 127);

    //Draw Level lable
    ctx.fillText("LEVEL", 300, 157);
    ctx.strokeRect(300, 171, 161, 24);
    ctx.fillText(level.toString(), 310, 190);

    //Draw next label text
    ctx.fillText("WIN /LOSE", 300, 221);

    //Draw playing condition 
    ctx.fillText(winOrLose, 310, 261);

    // Draw playing condition rectangle
    ctx.strokeRect(300, 232, 161, 95);

    //Draw controls label
    ctx.fillText("CONTROLS", 300, 354);
    ctx.strokeRect(300, 366, 161, 104);
    ctx.font ='19px Arial';
    ctx.fillText("A: Move Left", 310, 388);
    ctx.fillText("D: Move Right", 310, 413);
    ctx.fillText("S: Move Down", 310, 438);
    ctx.fillText("E: Rotate Right", 310, 463);

    // Handle keyboard presses
    document.addEventListener('keydown', HandleKeyPress);

    // Create the array of Tetrominos
    CreateTetrominos();

    // Generate random Tetromino
    CreateTetromino();

    
    CreateCoordArray();
    DrawTetromino();
}


function DrawTetrisLogo(){
    ctx.drawImage(tetrisLogo, 300, 8 , 161, 54);
}
function DrawTetromino(){
    //Cycle through the x & y aarray for the tetromino looking for all the place a square would be drawn
    for (let i =0; i < curTetromino.length; i++){
        // Move the tetromino x & y values to the tetromino
        // shows in the middle of the gameboard
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;

        // Put the Tetromino shape in the gameboard array
        gBArray[x][y] = 1;
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = curTetrominoColor;
        ctx.fillRect(coorX, coorY, 21, 21);   //each sqaure is 21x21 px

    }
}

// ----- 2. Move & Delete Old Tetrimino -----
// Each time a key is pressed we change the either the starting
// x or y value for where we want to draw the new Tetromino
// We also delete the previously drawn shape and draw the new one


// Handling Key Press (Direction)
function HandleKeyPress(key){
    if (winOrLose != "GameOver"){
        if (key.keyCode === 65){   //A Key -> Move Left
            direction = DIRECTION.LEFT;
            //Move only if there is no collision
            if (!HittingTheWall() && !CheckForHorizontalCollision()){
                DeleteTetromino();
                startX--;
                DrawTetromino();
            }
         
        } else if (key.keyCode === 68){   //D Key -> Move Right
            direction = DIRECTION.RIGHT;
            //Move only if there is no collision
            if (!HittingTheWall() && !CheckForHorizontalCollision()){
                DeleteTetromino();
                startX++;
                DrawTetromino();
            }
        } else if (key.keyCode === 83){    //S Key -> Move Down
            MoveTetrominoDown();
        } else if (key.keyCode === 69){   // E Key -> Rotate 
            RotateTetromino();
        }
    }
}

function MoveTetrominoDown(){
    direction = DIRECTION.DOWN;

    //check for verticle collision
    if (!CheckForVerticleCollision()){
        DeleteTetromino();
        startY++;
        DrawTetromino();
    }   
}

// Automatically calls for a Tetromino to fall every second
window.setInterval(function(){
    if (winOrLose != "GameOver"){
        MoveTetrominoDown();
    }
}, 1000);


// Clears the previously drawn Tetromino
// Do the same stuff when we drew originally
// but make the square white this time
function DeleteTetromino(){
    for (let i = 0; i < curTetromino.length; i++){
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
       
        // Delete Tetromino square from gameboard array
        gBArray[x][y] = 0;

        // Draw white where coloured square used to be
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;

        ctx.fillStyle = 'white';
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}

// 3. Generate random Tetrominos with color
function CreateTetrominos(){
    //Push T
    tetrominos.push([[1,0], [0,1], [1,1], [2,1]]);
    
    //Push I
    tetrominos.push([[0,0], [1,0], [2,0], [3,0]]);
    
    //Push J
    tetrominos.push([[0,0], [0,1], [1,1], [2,1]]);

    //Push Square
    tetrominos.push([[0,0], [1,0], [0,1], [1,1]]);

    //Push L
    tetrominos.push([[2,0], [0,1], [1,1], [2,1]]);

    //Push S
    tetrominos.push([[1,0], [2,0], [0,1], [1,1]]);

    //Push Z
    tetrominos.push([[0,0], [1,0], [1,1], [2,1]]);
}

function CreateTetromino(){

    //Get a random Tetromino index
    let randomTetromino = Math.floor(Math.random() * tetrominos.length);
    // Set that one to draw
    curTetromino = tetrominos[randomTetromino];
    curTetrominoColor = tetrominoColors[randomTetromino];
}

// Check wall hits
function HittingTheWall(){
    for(let i = 0; i < curTetromino.length; i++){
        let newX = curTetromino[i][0] + startX;
        
        if (newX <= 0 && direction === DIRECTION.LEFT){
            return true;
        } else if (newX >= 11 && direction === DIRECTION.RIGHT){
            return true;
        }
    }
    return false;
}


// Check for Verticle collision
function CheckForVerticleCollision(){
    // Make a copy of the tetromino so that I can move a fake
    // Tetromino and check for collisions before I move the real
    // Tetromino
    let tetrominoCopy = curTetromino;
    let collision = false;

    //Cycle through all tetromino squares
    for (let i =0; i < tetrominoCopy.length; i++){
        // Get each square of the Tetromino and adjust the square
        // position so I can check for collisions
        let square = tetrominoCopy[i];

        // Move into position based on the changing upper left
        // hand corner of the entire Tetromino shape
        let x = square[0] + startX;
        let y = square[1] + startY;

        // if moving down, increment y to check for down collision
        if (direction === DIRECTION.DOWN){
            y++;
        }

        //check if it is going to hit a previously set piece
        if(typeof stoppedShapeArray[x][y+1] === 'string'){
                DeleteTetromino();
                startY++;
                DrawTetromino();
                collision = true;
                break;
        }    
        if (y >= 20){
                collision = true;
                break;
        }
}

        //Collision
        if (collision){

            // Check for gameover and if so display game over text
            if(startY <= 2){
                winOrLose= "GameOver";
                ctx.fillStyle ='white';
                ctx.fillRect(310, 242, 140, 30);
                ctx.fillStyle= 'black';
                ctx.fillText(winOrLose, 310, 261);
            } else{
                // Add stopped Tetromino to stopped shape array to check for future collisions
                for (let i = 0; i < tetrominoCopy.length; i++){
                    let square = tetrominoCopy[i];
                    let x = square[0] + startX;
                    let y = square[1] + startY;

                    // Add the current Tetromino color
                    stoppedShapeArray[x][y] = curTetrominoColor;
                }

                //Check for completed rows
                CheckForCompletedRows();
                CreateTetromino();

                // create the next tetromino and draw it and reset direction
                direction = DIRECTION.IDLE;
                startX = 4;
                startY = 0;
                DrawTetromino();
            }
        }
    }


// Check for horizontal shape collision
function CheckForHorizontalCollision(){
    //copy the termino to check if its new x value would cause a collision
    var tetrominoCopy = curTetromino;
    var collision = false;
    for (var i =0; i < tetrominoCopy.length; i++){

        //get the square and move it into posiition using the upper left coordinates
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;

        // move tetromino clone square into position based on direction
        if (direction === DIRECTION.LEFT){
            x--;
        } else if (direction === DIRECTION.RIGHT){
            x++;
        }

        // Get the potential stopped square that may exist
        var stoppedShapeVal = stoppedShapeArray[x][y];

        // If it is a string, we know a stopped square is there
        if (typeof stoppedShapeVal === 'string'){
            collision= true;
            break;
        }
    }
    return collision;
}

 
// 7. Check for completed rows
// ***** SLIDE *****

function CheckForCompletedRows(){
    // Track how many rows to delete and where to start deleting
    let rowsToDelete = 0;
    let startOfDeletion = 0;

    // check every row to see if it has been completed
    for(let y = 0; y < gBArrayHeight; y++){
        let completed = true;

        //cycle through x- values
        for (let x = 0; x < gBArrayWidth; x++){

            //get values stored in the stopped block array
            let square = stoppedShapeArray[x][y];

            //check if nothing is there
            if (square === 0 || (typeof square === 'undefined')){
                completed = false;
                break;
            }
        }

        //if a row is completed
        if (completed){
            if(startOfDeletion === 0) startOfDeletion = y;
            rowsToDelete++;

            //Delete the line everywhere
            for (let i =0; i <gBArrayWidth; i++){
                //Update arrats by deleting previous squares
                stoppedShapeArray[i][y] = 0;
                gBArray[i][y] = 0;
                let coorX = coordinateArray[i][y].x;
                let coorY = coordinateArray[i][y].y;

                //Draw the squares as white
                ctx.fillStyle = 'white';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }

    if (rowsToDelete >0){
        score +=10;
        ctx.fillStyle= 'white';
        ctx.fillRect(310, 109, 140, 19);
        ctx.fillStyle = 'black';
        ctx.fillText(score.toString(), 310, 127);
        MoveAllRowsDown(rowsToDelete, startOfDeletion);
    }
}

// Move rows down after a row has been deleted
function MoveAllRowsDown(rowsToDelete, startOfDeletion){
    for (var i = startOfDeletion - 1; i >=0; i--){
        for (var x = 0; x < gBArrayWidth; x++){
            var y2 = i + rowsToDelete;
            var square = stoppedShapeArray[x][i];
            var nextSquare = stoppedShapeArray[x][y2];

            if (typeof square === 'string'){
                nextSquare = square;
                gBArray[x][y2] = 1;  //put blok into GBA
                stoppedShapeArray[x][y2] = square;
                let coorX = coordinateArray[x][y2].x;
                let coorY = coordinateArray[x][y2].y;
                ctx.fillStyle = nextSquare;
                ctx.fillRect(coorX, coorY, 21, 21);

                square =0;
                gBArray[x][i] = 0;
                stoppedShapeArray[x][i] = 0;
                coorX = coordinateArray[x][i].x;
                coorY = coordinateArray[x][i].y;
                ctx.fillStyle = 'white';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
}

// 9. Rotate the Tetromino
// ***** SLIDE *****
function RotateTetromino(){
    let newRotation = new Array();
    let tetrominoCopy = curTetromino;
    let curTetrominoBU;
    for (let i = 0; i < tetrominoCopy.length; i++){
        // Here to handle a error with a backup Tetromino
        // We are cloning the array otherwise it would 
        // create a reference to the array that caused the error
        curTetrominoBU = [...curTetromino];

        let x = tetrominoCopy[i][0];
        let y = tetrominoCopy[i][1];
        let newX = (GetLastSquare() - y);
        let newY = x;
        newRotation.push([newX, newY]);
    }

    DeleteTetromino();

    //Try to draw tetromino rotation

    try{
        curTetromino = newRotation;
        DrawTetromino();
    }

    //If error get the backup tetromino and draw it instead
    catch (e){
        if (e instanceof TypeError){
            curTetromino = curTetrominoBU;
            DeleteTetromino();
            DrawTetromino();
        }
    }
}

// Gets the x value for the last square in the Tetromino
// so we can orientate all other squares using that as
// a boundary. This simulates rotating the Tetromino
function GetLastSquareX(){
    let lastX = 0;
    for (let i = 0;  i < curTetromino.length; i++){
        let square = curTetromino[i];
        if (square[0] > lastX) lastX = square[0];
    }
    return lastX;
}