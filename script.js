$(function(){
    var board = new WGo.Board(document.getElementById("board"), {
        width: $("#board").width(),
    });

    var turn = 1;
    var moves_left = 1;
    var contract_address = '0xD1d12310299F8Ab01c89BA3744409C09C58311A5';

    var contractABI = [{"constant":false,"inputs":[],"name":"join_game","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint8"},{"name":"","type":"uint8"}],"name":"board","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[{"name":"x1","type":"uint8"},{"name":"y1","type":"uint8"},{"name":"x2","type":"uint8"},{"name":"y2","type":"uint8"}],"name":"make_move","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"turn","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"make_first_move","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"board_size","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"players","outputs":[{"name":"","type":"address"}],"type":"function"},{"inputs":[],"type":"constructor"}]
    

    if(typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
        // If there's a web3 library loaded, then make your own web3
        web3 = new Web3(web3.currentProvider);
    } else if (typeof Web3 !== 'undefined') {
        // If there isn't then set a provider
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    var connectsix_contract = web3.eth.contract(contractABI);
    var connectsix = connectsix_contract.at(contract_address);

    var my_moves = [];

    var refresh = function() {
        for (var x = 0; x < 19; x++) {
            for (var y = 0; y < 19; y++) {
                var r = connectsix.board(x, y);
                board.removeObjectsAt(x, y);
                if (r == 1) {
                    board.addObject({
                        x: x,
                        y: y,
                        c: WGo.B
                    });
                } else if (r == 2) {
                    board.addObject({
                        x: x,
                        y: y,
                        c: WGo.W
                    });
                }
            }
        }
        turn = connectsix.turn();
        var color;
        if (turn == 1) {
            color = WGo.B;
        } else {
            color = WGo.W;
        }
        for (var i = 0; i < my_moves.length; i++) {
            if (connectsix.board(my_moves[i].x, my_moves[i].y) != 0) {
                my_moves = [];
                break;
            }
            board.addObject({
                x: my_moves[i].x,
                y: my_moves[i].y,
                c: color
            });
            board.addObject({
                x: my_moves[i].x,
                y: my_moves[i].y,
                c: "CR"
            });
        }
    }

    refresh();

    board.addEventListener("click", function(x, y) {
        if (my_moves.length >= 2) {
            my_moves = [];
        } else {
            for (var i = 0; i < my_moves.length; i++) {
                if (my_moves[i].x == x && my_moves[i].y == y) {
                    my_moves = [];
                    break;
                }
            }
            my_moves.push({x:x, y:y});
        }
        refresh();
    });
});
