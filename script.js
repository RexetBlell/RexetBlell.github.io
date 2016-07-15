$(function(){
    var board = new WGo.Board(document.getElementById("board"), {
        width: $("#board").width(),
    });

    var turn = 1;
    var moves_left = 1;

    board.addEventListener("click", function(x, y) {
        if(turn == 1) {
            board.addObject({
                x: x,
                y: y,
                c: WGo.B
            });
        }
        else if(turn == 2) {
            board.addObject({
                x: x,
                y: y,
                c: WGo.W
            });
        }
        if (moves_left == 1) {
            turn = 3 - turn;
            moves_left = 2;
        } else {
            moves_left = 1;
        }
    });
});
