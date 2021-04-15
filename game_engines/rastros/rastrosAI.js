    /*
    easy -> 20% good plays
    medium -> 50% good plays
    hard -> 80% good plays
    */

class rastrosState {
    constructor(blocked_squares, piece, depth) {
        this.blocked_squares = blocked_squares;
        this.piece = piece;
        this.validSquares = [];
        for (var y = piece[0]-1; y<=piece[0]+1; y++) {
            for (var x = piece[1]-1; x<=piece[1]+1; x++) {
                if (!this.blocked_squares.find(element => element[0] == y && element[1] == x)) {
                    if (y>=0 && y<=6 && x>=0 && x<=6) {
                        this.validSquares.push([y,x]);
                    }
                }
            }
        }
        this.depth = depth;
    }
}

class rastrosAI {
    constructor(player) {
        //get goal
        if (player == 1) {
            this.goal = [6,0];
        } else if (player == 2) {
            this.goal = [0,6];
        } else {
            throw Error("Invalid player number");
        }

        // Array that stores the board
        this.board = []

        // Loop used to fill the board
        for (var pos_y = 0; pos_y < 7; pos_y++) {
            this.board.push([]);
            for (var pos_x = 0; pos_x < 7; pos_x++) {
                this.board[pos_y].push("_");
            }
        }

        this.board[0][6] = "2";
        this.board[6][0] = "1";
        
        this.piece = [2, 4];

        this.blocked_squares = [];

        this.fieldUpdate([2,4]);
    }

    printField() {
        var s = "  0 1 2 3 4 5 6\n";
        for (var pos_y = 0; pos_y < 7; pos_y++) {
            s+= pos_y + " ";
            for (var pos_x = 0; pos_x < 7; pos_x++) {
                s += this.board[pos_y][pos_x] + " ";
            }
            s += "\n";
        }

        console.log(s);
    }
    
    //update board, blocked_squares, piece coordinates and validSquares
    fieldUpdate(new_pos) {
        // Squares which have been blocked
        this.blocked_squares.push(new_pos);

        this.board[this.piece[0]][this.piece[1]] = "B";

        // piece coordinates
        this.piece = [new_pos[0], new_pos[1]];
        this.board[new_pos[0]][new_pos[1]] = "P";

        // Squares to where the moving piece can currently move
        this.validSquares = [];
        for (var y = new_pos[0]-1; y<=new_pos[0]+1; y++) {
            for (var x = new_pos[1]-1; x<=new_pos[1]+1; x++) {
                if (!this.blocked_squares.find(element => element[0] == y && element[1] == x)) {
                    if (y>=0 && y<=6 && x>=0 && x<=6) {
                        this.validSquares.push([y,x]);
                    }
                }
            }
        }

        this.state = new rastrosState(this.blocked_squares, this.piece, 0);
    }

    //check if game ended
    ended(state) {
        if ((state.piece.toString() == "6,0" && this.goal.toString() == "6,0") || (state.piece.toString() == "0,6" && this.goal.toString() == "0,6")) {
            return 1;
        } else if ((state.piece.toString() == "0,6" && this.goal.toString() == "6,0") || (state.piece.toString() == "6,0" && this.goal.toString() == "0,6") || state.validSquares.length == 0) {
            return -1;
        } else {
            return (98 - Math.pow(state.piece[0]-this.goal[0], 2) - Math.pow(state.piece[1] - this.goal[1], 2))/98;
        }
    }

    makePlay() {
        var chosen = null;
        var score = -1;

        this.validSquares.forEach( (element) => {
            var state = new rastrosState(this.blocked_squares.concat([element]), element, 0);
            var newScore = this.minimax(state, 7, false);
            if (newScore >= score) {
                chosen = element;
                score = newScore;
            }
        });

        this.fieldUpdate(chosen);
        return chosen;
    }

    minimax(node, depth, maximizingPlayer) {
        if (depth == 0 || this.ended(node)==1 || this.ended(node)==-1) {
            return this.ended(node);
        }
        if (maximizingPlayer) {
            var value = -100;
            node.validSquares.forEach((element) => {
                var child = new rastrosState(node.blocked_squares.concat([element]), element,0);
                var newValue = this.minimax(child, depth-1, false);
                if (newValue > value) {
                    value = newValue;
                }
            })
        } else {
            var value = 100;
            node.validSquares.forEach((element) => {
                var child = new rastrosState(node.blocked_squares.concat([element]), element,0);
                var newValue = this.minimax(child, depth-1, true);
                if (newValue < value) {
                    value = newValue;
                }
            })
        }
        return value;
    }
    
    //oldState -> rastros state object, limit -> depth search depth limit
    search(oldState, limit) {
        //number of validSquares
        var size = oldState.validSquares.length;
        var sum = 0;

        //calcular uma probabilidade de vitória para uma jogada
        oldState.validSquares.forEach(element => {
            var newState = new rastrosState(oldState.blocked_squares.concat([element]), element, oldState.depth+1);
            if (newState.depth == limit || this.ended(newState)!=0) {
                sum += this.ended(newState);
            } else {
                sum += this.search(newState, limit);
            }
        });
        return sum/size;
    }

}

function buttonClick() {
    var play = document.getElementById("onlyInput").value;

    play = play.split(",");
    play = [Number(play[0]), Number(play[1])]

    console.log("You played:")
    AI.fieldUpdate(play)
    AI.printField();

    if (AI.ended(AI.state)==1 || AI.ended(AI.state)==-1) {
        console.log("gg")
    } else {
        console.log("AI played:")
        AI.makePlay();
        AI.printField();

        if (AI.ended(AI.state)==1 || AI.ended(AI.state)==-1) {
            console.log("gg")
        }
    }
}

var playerNumber = 1;
var AI = new rastrosAI(playerNumber);
AI.printField();

if (playerNumber==1) {
    console.log("AI played:")
    AI.makePlay();
    AI.printField();
}