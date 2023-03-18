var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

var keys = [];

document.addEventListener("keydown", function (event) {
    keys[event.key] = true;
    if (["ArrowUp", "ArrowDown"].indexOf(event.key) > -1) {
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
    TITLE_TO_GAME: 1.1,
    GAME: 2
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

class Tile {
    constructor(value, timer) {
        this.value = value;
        this.timer = timer;
    }
}

var spaceTimer = 0;
var clickDelay = 20;

var tiles = Array(20).fill().map(() => Array(20).fill(0));
var newTiles = Array(20).fill().map(() => Array(20).fill(0));

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

            break;
        }
        case SCREEN.TITLE_TO_GAME: {
            gameScreen = SCREEN.GAME;

            for (var i = 0; i < tiles.length; i++) {
                for (var j = 0; j < tiles.length; j++) {
                    tiles[i][j] = new Tile(0, 0);
                    newTiles[i][j] = new Tile(0, 0);
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
                            if (newTileSum == 3) {
                                newTiles[i][j].value = 1;
                            } else {
                                newTiles[i][j].value = 0;
                            }
                        } else if (tiles[i][j].value == 1) {
                            if (newTileSum == 2 || newTileSum == 3) {
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

            break;
        }
    }
    window.requestAnimationFrame(main);
}
window.requestAnimationFrame(main);