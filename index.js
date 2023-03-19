var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

var keys = [];

document.addEventListener("keydown", function (event) {
    keys[event.key] = true;
    if (["ArrowUp", "ArrowDown", " "].indexOf(event.key) > -1) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});

var mouseX, mouseY;

c.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

window.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - c.getBoundingClientRect().left;
    mouseY = event.clientY - c.getBoundingClientRect().top;
});

var mouseDown, mouseButton;

window.addEventListener("mousedown", function(event) {
    mouseDown = true;
    mouseButton = event.buttons;
});

window.addEventListener("mouseup", function(event) {
    mouseDown = false;
});

const SCREEN = {
    TITLE: 1,
    TITLE_TO_GAME: 1.2,
    TITLE_TO_SETTINGS: 1.3,
    GAME: 2,
    SETTINGS: 3,
    SETTINGS_TO_TITLE: 3.1
}

var gameScreen =  SCREEN.TITLE;

// lmao let's go i made this before so that now i can copy paste it into every project i need
class Button {
    constructor(x, y, w, h, tx, ty, ts, text, colour, highlightColour, clickColour, textColour, textHighlightColour, textClickColour) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.tx = tx;
        this.ty = ty;
        this.ts = ts;
        this.text = text;
        this.colour = colour;
        this.highlightColour = highlightColour;
        this.clickColour = clickColour;
        this.textColour = textColour;
        this.textHighlightColour = textHighlightColour;
        this.textClickColour = textClickColour;
        this.hovering = false;
        this.clicked = false;
    }

    hover() {
        if (mouseX > this.x && mouseX < (this.x + this.w) && mouseY > this.y && mouseY < (this.y + this.h)) {
            if (mouseDown) {
                this.clicked = true;
            } else {
                this.clicked = false;
            }
            this.hovering = true;
        } else {
            this.clicked = false;
            this.hovering = false;
        }
    }

    render() {
        ctx.beginPath();
        if (this.hovering) {
            if (this.clicked) {
                ctx.fillStyle = this.clickColour;
            } else {
                ctx.fillStyle = this.highlightColour;
            }
        } else {
            ctx.fillStyle = this.colour;
        }
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.beginPath();
        ctx.font = String(this.ts) + "px Comic Sans MS";
        if (this.hovering) {
            if (this.clicked) {
                ctx.fillStyle = this.textClickColour;
            } else {
                ctx.fillStyle = this.textHighlightColour;
            }
        } else {
            ctx.fillStyle = this.textColour;
        }
        ctx.fillText(this.text, this.tx, this.ty);
    }
}

var playButton = new Button(200, 200, 80, 50, 210, 235, 30, "Play", "#660066", "#bb00bb", "#ffffff", "#ffffff", "#ffffff", "#ffffff");
var settingsButton = new Button(175, 275, 130, 50, 180, 310, 30, "Settings", "#660066", "#bb00bb", "#ffffff", "#ffffff", "#ffffff", "#ffffff");

var buttonTimer = 0;

var dimensionCount = 2;
var dimensionCountButton;
var maxDimensions = 3;
var zPosition = 0;

var ruleSetButton;
var ruleSet;
var ruleSetValues = [[3], [2, 3]];

var backButton;

class Tile {
    constructor(value, timer) {
        this.value = value;
        this.timer = timer;
    }
}

var spaceTimer = 0;
var clickDelay = 20;

var tiles;
var newTiles;

var newTileSum = 0;

function main() {
    switch (gameScreen) {
        case SCREEN.TITLE: {
            // background
            ctx.beginPath();
            ctx.fillStyle = "#880088";
            ctx.fillRect(0, 0, 512, 512);

            // title
            ctx.beginPath();
            ctx.font = "bold 45px Comic Sans MS";
            ctx.fillStyle = "#000000";
            ctx.fillText("Conway's Game of Life", 7, 53);
            ctx.fillStyle = "#ff00ff";
            ctx.fillText("Conway's Game of Life", 4, 50);
            ctx.font = "bold 90px Comic Sans MS";
            ctx.fillStyle = "#000000";
            ctx.fillText("3D", 185, 155);
            ctx.fillStyle = "#ff00ff";
            ctx.fillText("3D", 180, 150);

            // play button
            playButton.hover();
            playButton.render();

            if (playButton.clicked) {
                gameScreen = SCREEN.TITLE_TO_GAME;
            }

            // settings button
            settingsButton.hover();
            settingsButton.render();

            if (settingsButton.clicked) {
                gameScreen = SCREEN.TITLE_TO_SETTINGS;
            }

            break;
        }
        case SCREEN.TITLE_TO_GAME: {
            gameScreen = SCREEN.GAME;

            if (dimensionCount == 2) {
                tiles = Array(20).fill().map(() => Array(20).fill(0));
                newTiles = Array(20).fill().map(() => Array(20).fill(0));
                for (var i = 0; i < tiles.length; i++) {
                    for (var j = 0; j < tiles.length; j++) {
                        tiles[i][j] = new Tile(0, 0);
                        newTiles[i][j] = new Tile(0, 0);
                    }
                }
            } else if (dimensionCount == 3) {
                tiles = Array(20).fill().map(() => Array(20).fill().map(() => Array(20).fill(0)));
                newTiles = Array(20).fill().map(() => Array(20).fill().map(() => Array(20).fill(0)));
                for (var i = 0; i < tiles.length; i++) {
                    for (var j = 0; j < tiles.length; j++) {
                        for (var k = 0; k < tiles.length; k++) {
                            tiles[i][j][k] = new Tile(0, 0);
                            newTiles[i][j][k] = new Tile(0, 0);
                        }
                    }
                }
            }

            break;
        }
        case SCREEN.GAME: {
            spaceTimer++;

            // background
            ctx.beginPath();
            ctx.fillStyle = "#880088";
            ctx.fillRect(0, 0, 512, 512);

            if (dimensionCount == 2) {
                for (var i = 0; i < tiles.length; i++) {
                    for (var j = 0; j < tiles.length; j++) {
                        tiles[i][j].timer++;
    
                        ctx.beginPath();
                        if (tiles[i][j].value == 0) {
                            if (mouseX > 8.5 + 25*i && mouseX < 28.5 + 25*i && mouseY > 8.5 + 25*j && mouseY < 28.5 + 25*j) {
                                ctx.fillStyle = "#660066";
                                if (mouseDown && mouseButton == 1 && tiles[i][j].timer > clickDelay) {
                                    tiles[i][j].value = (tiles[i][j].value + 1) % 2;
                                    tiles[i][j].timer = 0;
                                }
                            } else {
                                ctx.fillStyle = "#440044";
                            }
                        } else if (tiles[i][j].value == 1) {
                            if (mouseX > 8.5 + 25*i && mouseX < 28.5 + 25*i && mouseY > 8.5 + 25*j && mouseY < 28.5 + 25*j) {
                                ctx.fillStyle = "#dd00dd";
                                if (mouseDown && mouseButton == 2 && tiles[i][j].timer > clickDelay) {
                                    tiles[i][j].value = (tiles[i][j].value + 1) % 2;
                                    tiles[i][j].timer = 0;
                                }
                            } else {
                                ctx.fillStyle = "#ff00ff";
                            }
                        }
                        ctx.fillRect(8.5 + 25*i, 8.5 + 25*j, 20, 20);
                    }
                }
    
                if (keys[" "] && spaceTimer > clickDelay) {
                    spaceTimer = 0;
    
                    for (var i = 0; i < tiles.length; i++) {
                        for (var j = 0; j < tiles.length; j++) {
                            newTileSum = 0;
    
                            for (var p = i - 1; p <= i + 1; p++) {
                                for (var q = j - 1; q <= j + 1; q++) {
                                    if (p > -1 && q > -1 && p < tiles.length && q < tiles.length) {
                                        if (!(p == i && q == j)) {
                                            newTileSum += tiles[p][q].value;
                                        }
                                    }
                                }
                            }
            
                            if (tiles[i][j].value == 0) {
                                if (ruleSetValues[0].includes(newTileSum)) {
                                    newTiles[i][j].value = 1;
                                } else {
                                    newTiles[i][j].value = 0;
                                }
                            } else if (tiles[i][j].value == 1) {
                                if (ruleSetValues[1].includes(newTileSum)) {
                                    newTiles[i][j].value = 1;
                                } else {
                                    newTiles[i][j].value = 0;
                                }
                            }
                        }
                    }
    
                    for (var i = 0; i < tiles.length; i++) {
                        for (var j = 0; j < tiles.length; j++) {
                            tiles[i][j].value = newTiles[i][j].value;
                        }
                    }
                }
            } else if (dimensionCount == 3) {
                for (var i = 0; i < tiles.length; i++) {
                    for (var j = 0; j < tiles.length; j++) {
                        tiles[i][j][zPosition].timer++;
    
                        ctx.beginPath();
                        if (tiles[i][j][zPosition].value == 0) {
                            if (mouseX > 8.5 + 25*i && mouseX < 28.5 + 25*i && mouseY > 8.5 + 25*j && mouseY < 28.5 + 25*j) {
                                ctx.fillStyle = "#660066";
                                if (mouseDown && mouseButton == 1 && tiles[i][j][zPosition].timer > clickDelay) {
                                    tiles[i][j][zPosition].value = (tiles[i][j][zPosition].value + 1) % 2;
                                    tiles[i][j][zPosition].timer = 0;
                                }
                            } else {
                                ctx.fillStyle = "#440044";
                            }
                        } else if (tiles[i][j][zPosition].value == 1) {
                            if (mouseX > 8.5 + 25*i && mouseX < 28.5 + 25*i && mouseY > 8.5 + 25*j && mouseY < 28.5 + 25*j) {
                                ctx.fillStyle = "#dd00dd";
                                if (mouseDown && mouseButton == 2 && tiles[i][j][zPosition].timer > clickDelay) {
                                    tiles[i][j][zPosition].value = (tiles[i][j][zPosition].value + 1) % 2;
                                    tiles[i][j][zPosition].timer = 0;
                                }
                            } else {
                                ctx.fillStyle = "#ff00ff";
                            }
                        }
                        ctx.fillRect(8.5 + 25*i, 8.5 + 25*j, 20, 20);
                    }
                }

                // dimension marker
                ctx.beginPath();
                ctx.fillStyle = "#ff00ff";
                ctx.fillRect(0, 16 + 25*((tiles.length - 1) - zPosition), 8, 5);
                ctx.fillRect(504, 16 + 25*((tiles.length - 1) - zPosition), 8, 5);

                if ((keys["ArrowUp"] || keys["w"]) && spaceTimer > clickDelay) {
                    spaceTimer = 0;

                    zPosition++;

                    if (zPosition >= tiles.length) {
                        zPosition = 0;
                    }
                }
                if ((keys["ArrowDown"] || keys["s"]) && spaceTimer > clickDelay) {
                    spaceTimer = 0;

                    zPosition--;

                    if (zPosition < 0) {
                        zPosition = tiles.length - 1;
                    }
                }
    
                if (keys[" "] && spaceTimer > clickDelay) {
                    spaceTimer = 0;
    
                    for (var i = 0; i < tiles.length; i++) {
                        for (var j = 0; j < tiles.length; j++) {
                            for (var k = 0; k < tiles.length; k++) {
                                newTileSum = 0;
    
                                for (var p = i - 1; p <= i + 1; p++) {
                                    for (var q = j - 1; q <= j + 1; q++) {
                                        for (var r = k - 1; r <= k + 1; r++) {
                                            if (p > -1 && q > -1 && r > -1 && p < tiles.length && q < tiles.length && r < tiles.length) {
                                                if (!(p == i && q == j && r == k)) {
                                                    newTileSum += tiles[p][q][r].value;
                                                }
                                            }
                                        }
                                    }
                                }
                
                                if (tiles[i][j][k].value == 0) {
                                    if (ruleSetValues[0].includes(newTileSum)) {
                                        newTiles[i][j][k].value = 1;
                                    } else {
                                        newTiles[i][j][k].value = 0;
                                    }
                                } else if (tiles[i][j][k].value == 1) {
                                    if (ruleSetValues[1].includes(newTileSum)) {
                                        newTiles[i][j][k].value = 1;
                                    } else {
                                        newTiles[i][j][k].value = 0;
                                    }
                                }
                            }
                        }
                    }
    
                    for (var i = 0; i < tiles.length; i++) {
                        for (var j = 0; j < tiles.length; j++) {
                            for (var k = 0; k < tiles.length; k++) {
                                tiles[i][j][k].value = newTiles[i][j][k].value;
                            }
                        }
                    }
                }
            }

            break;
        }
        case SCREEN.TITLE_TO_SETTINGS: {
            ruleSet = "B3/S23";
            ruleSetValues = [[3], [2, 3]];

            dimensionCountButton = new Button(20, 25, 60, 50, 30, 60, 30, "2D", "#660066", "#bb00bb", "#ffffff", "#ffffff", "#ffffff", "#ffffff");
            ruleSetButton = new Button(20, 100, 130, 50, 30, 135, 30, ruleSet, "#660066", "#bb00bb", "#ffffff", "#ffffff", "#ffffff", "#ffffff");
            backButton = new Button(400, 430, 90, 50, 410, 465, 30, "Back", "#660066", "#bb00bb", "#ffffff", "#ffffff", "#ffffff", "#ffffff");

            gameScreen = SCREEN.SETTINGS;
            break;
        }
        case SCREEN.SETTINGS: {
            buttonTimer++;

            // background
            ctx.beginPath();
            ctx.fillStyle = "#880088";
            ctx.fillRect(0, 0, 512, 512);

            dimensionCountButton.text = dimensionCount + "D";

            dimensionCountButton.hover();
            dimensionCountButton.render();

            if (dimensionCountButton.clicked && buttonTimer > clickDelay) {
                buttonTimer = 0;
                dimensionCount++;

                if (dimensionCount > maxDimensions) {
                    dimensionCount = 2;
                }

                switch (dimensionCount) {
                    case 2: {
                        ruleSet = "B3/S23";
                        ruleSetValues = [[3], [2, 3]];
                        ruleSetButton.w = 130;
                        break;
                    }
                    case 3: {
                        ruleSet = "B(10)/S9(10)(11)";
                        ruleSetValues = [[10], [9, 10, 11]];
                        ruleSetButton.w = 250;
                        break;
                    }
                    default: {
                        break;
                    }
                }
                ruleSetButton.text = ruleSet;
            }

            ruleSetButton.hover();
            ruleSetButton.render();

            if (ruleSetButton.clicked && buttonTimer > clickDelay) {
                buttonTimer = 0;

                if (dimensionCount == 2) {
                    switch (ruleSet) {
                        case "B3/S23": {
                            ruleSet = "B3/S012345678";
                            ruleSetValues = [[3], [0, 1, 2, 3, 4, 5, 6, 7, 8]];
                            ruleSetButton.w = 250;
                            break;
                        }
                        case "B3/S012345678": {
                            ruleSet = "B2/S";
                            ruleSetValues = [[2], []];
                            ruleSetButton.w = 95;
                            break;
                        }
                        case "B2/S": {
                            ruleSet = "B3/S23";
                            ruleSetValues = [[3], [2, 3]];
                            ruleSetButton.w = 130;
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                } else if (dimensionCount == 3) {
                    switch (ruleSet) {
                        case "B(10)/S9(10)(11)": {
                            ruleSet = "B3/S23";
                            ruleSetValues = [[3], [2, 3]];
                            ruleSetButton.w = 130;
                            break;
                        }
                        case "B3/S23": {
                            ruleSet = "B3/S";
                            ruleSetValues = [[3], []];
                            ruleSetButton.w = 95;
                            break;
                        }
                        case "B3/S": {
                            ruleSet = "B4/S4";
                            ruleSetValues = [[4], [4]];
                            ruleSetButton.w = 110;
                            break;
                        }
                        case "B4/S4": {
                            ruleSet = "B7/S67";
                            ruleSetValues = [[7], [6, 7]];
                            ruleSetButton.w = 130;
                            break;
                        }
                        case "B7/S67": {
                            ruleSet = "B(10)/S9(10)(11)";
                            ruleSetValues = [[10], [9, 10, 11]];
                            ruleSetButton.w = 250;
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                }
                ruleSetButton.text = ruleSet;
            }

            backButton.hover();
            backButton.render();

            if (backButton.clicked) {
                gameScreen = SCREEN.SETTINGS_TO_TITLE;
            }

            break;
        }
        case SCREEN.SETTINGS_TO_TITLE: {
            gameScreen = SCREEN.TITLE;
            break;
        }
    }
    window.requestAnimationFrame(main);
}
window.requestAnimationFrame(main);