$(function(){
    var board = new WGo.Board(document.getElementById("board"), {
        width: $("#board").width(),
    });

    var turn = 1;
    var moves_left = 1;
    var contract_address = '0x71CC907df3700D6654D2775AA8F42ad0EC22500a';

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

    var draw_my_moves = function() {
        for (var i = 0; i < my_moves.length; i++) {
            if (connectsix.board(my_moves[i].x, my_moves[i].y) != 0) {
                my_moves = [];
                break;
            }
        }
        var color;
        if (turn == 1) {
            color = WGo.B;
        } else {
            color = WGo.W;
        }
        for (var i = 0; i < my_moves.length; i++) {
            board.addObject({
                x: my_moves[i].x,
                y: my_moves[i].y,
                c: color
            });
            board.addObject({
                x: my_moves[i].x,
                y: my_moves[i].y,
                type: "CR"
            });
        }
    }

    var refresh = function() {
        turn = connectsix.turn();
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
        draw_my_moves();
    }

    refresh();

    board.addEventListener("click", function(x, y) {
        if (my_moves.length >= 2
                || (my_moves.length == 1 && my_moves[0].x == x && my_moves[0].y == y)
                || connectsix.board(x, y) != 0) {
            my_moves = [];
        } else {
            my_moves.push({x:x, y:y});
        }
        refresh();
    });

    $("#btn_make_move").click(function(){
        if (my_moves.length == 2) {
            connectsix.make_move(my_moves[0].x, my_moves[0].y, my_moves[1].x, my_moves[1].y,
                    {from: web3.eth.accounts[0]});
        }
    });

    (function(){
        // do some stuff
        refresh();
        setTimeout(arguments.callee, 4000);
    })();


});
