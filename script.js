$(function(){
    var board = new WGo.Board(document.getElementById("board"), {
        width: $("#board").width(),
    });

    var turn = 1;
    var moves_left = 1;
    var contract_address = '0x5E41ABB484D583E1CF0DBcd5b1a9D211b2FA4E36';

    var contractABI = [ { "constant": true, "inputs": [ { "name": "game_num", "type": "uint256" }, { "name": "x", "type": "uint8" }, { "name": "y", "type": "uint8" } ], "name": "board", "outputs": [ { "name": "", "type": "uint8", "value": "0" } ], "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "games", "outputs": [ { "name": "turn", "type": "uint8", "value": "0" }, { "name": "winner", "type": "uint8", "value": "0" }, { "name": "time_per_move", "type": "uint256", "value": "0" }, { "name": "deadline", "type": "uint256", "value": "0" }, { "name": "player_1_stake", "type": "uint256", "value": "0" }, { "name": "player_2_stake", "type": "uint256", "value": "0" } ], "type": "function" }, { "constant": true, "inputs": [ { "name": "game_num", "type": "uint256" } ], "name": "player_2", "outputs": [ { "name": "", "type": "address", "value": "0x" } ], "type": "function" }, { "constant": false, "inputs": [ { "name": "game_num", "type": "uint256" }, { "name": "x1", "type": "uint8" }, { "name": "y1", "type": "uint8" }, { "name": "x2", "type": "uint8" }, { "name": "y2", "type": "uint8" }, { "name": "wx", "type": "uint8" }, { "name": "wy", "type": "uint8" }, { "name": "dir", "type": "uint8" } ], "name": "make_move_and_claim_victory", "outputs": [], "type": "function" }, { "constant": true, "inputs": [ { "name": "game_num", "type": "uint256" } ], "name": "player_1", "outputs": [ { "name": "", "type": "address", "value": "0x" } ], "type": "function" }, { "constant": false, "inputs": [ { "name": "game_num", "type": "uint256" }, { "name": "x", "type": "uint8" }, { "name": "y", "type": "uint8" }, { "name": "dir", "type": "uint8" } ], "name": "claim_victory", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "game_num", "type": "uint256" } ], "name": "join_game", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "game_num", "type": "uint256" }, { "name": "x1", "type": "uint8" }, { "name": "y1", "type": "uint8" }, { "name": "x2", "type": "uint8" }, { "name": "y2", "type": "uint8" } ], "name": "make_move", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "_time_per_move", "type": "uint256" }, { "name": "opponent_stake", "type": "uint256" } ], "name": "new_game", "outputs": [], "type": "function" }, { "constant": true, "inputs": [], "name": "board_size", "outputs": [ { "name": "", "type": "uint8", "value": "19" } ], "type": "function" }, { "constant": false, "inputs": [ { "name": "game_num", "type": "uint256" } ], "name": "claim_time_victory", "outputs": [], "type": "function" }, { "inputs": [], "type": "constructor" } ]
    

    if(typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
        // If there's a web3 library loaded, then make your own web3
        web3 = new Web3(web3.currentProvider);
    } else if (typeof Web3 !== 'undefined') {
        // If there isn't then set a provider
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    var connectsix_contract = web3.eth.contract(contractABI);
    var connectsix = connectsix_contract.at(contract_address);

    var current_game_num = 0;

    var my_moves = [];

    var game_metadata;
    var board_state = new Array(19);
    var player_board = new Array(19);
    for (var i = 0; i < 19; i++) {
        board_state[i] = new Array(19);
        player_board[i] = new Array(19);
    }

    var sync_state = function() {
        game_metadata = connectsix.games(current_game_num);
        player_1 = connectsix.player_1(current_game_num);
        player_2 = connectsix.player_2(current_game_num);
        turn = game_metadata[0];
        winner = game_metadata[1];
        time_per_move = game_metadata[2];
        deadline = game_metadata[3];
        player_1_stake = game_metadata[4];
        player_2_stake = game_metadata[5];
        for (var x = 0; x < 19; x++) {
            for (var y = 0; y < 19; y++) {
                board_state[x][y] = connectsix.board(current_game_num, x, y);
            }
        }
    }

    var draw_my_moves = function() {
        for (var i = 0; i < my_moves.length; i++) {
            if (board_state[my_moves[i].x][my_moves[i].y] != 0) {
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

    var set_up_player_board = function() {
        for (var x = 0; x < 19; x++) {
            for (var y = 0; y < 19; y++) {
                player_board[x][y] = 0;
            }
        }
        for (var i = 0; i < my_moves.length; i++) {
            player_board[my_moves[i].x][my_moves[i].y] = turn;
        }
    }

    var check_direction = function(x, y, dir) {
        if (board_state[x][y] + player_board[x][y] == 0) {
            return 0;
        }
        var dx = 0;
        var dy = 0;
        if (dir == 2) {
            dx = 1;
            dy = 1;
        } else if (dir == 1) {
            dy = 1;
        } else {
            dx = 1;
        }
        for (var i = 1; i < 6; i++) {
            if (player_board[x][y] + board_state[x][y] != player_board[x + i * dx][y + i * dy] + board_state[x + i * dx][y + i * dy]) {
                return 0;
            }
        }
        return board_state[x][y] + player_board[x][y];
    }

    var find_winner = function() {
        // returns {x, y, dir}
        set_up_player_board();
        for (var x = 0; x < 19 - 6; x++) {
            for (var y = 0; y < 19 - 6; y++) {
                for (var dir = 0; dir < 3; dir++) {
                    console.log(" " + x + y + dir);
                    if (check_direction(x, y, dir) != 0) {
                    }
                    if (check_direction(x, y, dir) == turn) {
                        return {x:x, y:y, dir:dir};
                    }
                }
            }
        }
        return false;
    }

    var update_status = function() {
        
        if (player_1 == "0x0") {
            $("#status").text("Game not created");
        } else if (winner == 1) {
            $("#status").text("Player 1 wins");
        } else if (winner == 2) {
            $("#status").text("Player 2 wins");
        } else if (turn == 0) {
            $("#status").text("Game did not start yet");
        } else if (turn == 1) {
            $("#status").text("Player 1's turn");
        } else if (turn == 2) {
            $("#status").text("Player 2's turn");
        } else {
            $("#status").text("Unexpected State");
        }
    }

    var refresh = function() {
        update_status();
        $("#p1_name").text(player_1.substring(0, 7));
        $("#p2_name").text(player_2.substring(0, 7));
        for (var x = 0; x < 19; x++) {
            for (var y = 0; y < 19; y++) {
                var r = board_state[x][y];
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

    board.addEventListener("click", function(x, y) {
        if (my_moves.length >= 2
                || (my_moves.length == 1 && my_moves[0].x == x && my_moves[0].y == y)
                || board_state[x][y] != 0) {
            my_moves = [];
        } else {
            my_moves.push({x:x, y:y});
        }
        refresh();
    });


    $("#btn_make_move").click(function(){
        if (my_moves.length == 2) {
            w = find_winner();
            if (w == false) {
                connectsix.make_move(current_game_num, my_moves[0].x, my_moves[0].y, my_moves[1].x, my_moves[1].y,
                        {from: web3.eth.accounts[0]});
            } else {
                connectsix.make_move_and_claim_victory(
                        current_game_num,
                        my_moves[0].x,
                        my_moves[0].y,
                        my_moves[1].x,
                        my_moves[1].y,
                        w.x,
                        w.y,
                        w.dir,
                        {from: web3.eth.accounts[0]});
            }
        }
    });

    $("#btn_join").click(function() {
        if (turn == 0) {
            connectsix.join_game(current_game_num);
        }
    });

    $("#btn_switch").click(function(){
        current_game_num = $("#new_game_num").val();
        sync_state();
        refresh();
    });

    (function(){
        // do some stuff
        sync_state();
        refresh();
        setTimeout(arguments.callee, 4000);
    })();


});
