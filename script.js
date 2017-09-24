
var startApp = function() {

$(function(){

    var board = new WGo.Board(document.getElementById("board"), {
        width: 50,
    });

    var turn = 1;
    var move_history;
    var history_move_num;
    var moves_left = 1;
    var contract_address = '0xcf00354366bca2f2cd49007bfaeac49d97463200';

    var contractABI = [{"constant":true,"inputs":[{"name":"game_num","type":"uint256"},{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"board","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"games","outputs":[{"name":"turn","type":"uint8"},{"name":"winner","type":"uint8"},{"name":"time_per_move","type":"uint256"},{"name":"deadline","type":"uint256"},{"name":"player_1_stake","type":"uint256"},{"name":"player_2_stake","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"game_num","type":"uint256"}],"name":"player_2","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"game_num","type":"uint256"},{"name":"x1","type":"uint8"},{"name":"y1","type":"uint8"},{"name":"x2","type":"uint8"},{"name":"y2","type":"uint8"},{"name":"wx","type":"uint8"},{"name":"wy","type":"uint8"},{"name":"dir","type":"uint8"}],"name":"make_move_and_claim_victory","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"game_num","type":"uint256"}],"name":"player_1","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"game_num","type":"uint256"},{"name":"x","type":"uint8"},{"name":"y","type":"uint8"},{"name":"dir","type":"uint8"}],"name":"claim_victory","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"game_num","type":"uint256"}],"name":"join_game","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"game_num","type":"uint256"}],"name":"move_history","outputs":[{"name":"","type":"uint8[]"}],"type":"function"},{"constant":false,"inputs":[{"name":"game_num","type":"uint256"},{"name":"x1","type":"uint8"},{"name":"y1","type":"uint8"},{"name":"x2","type":"uint8"},{"name":"y2","type":"uint8"}],"name":"make_move","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_time_per_move","type":"uint256"},{"name":"opponent_stake","type":"uint256"}],"name":"new_game","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"board_size","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[{"name":"game_num","type":"uint256"}],"name":"claim_time_victory","outputs":[],"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"game_num","type":"uint256"}],"name":"LogGameCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"game_num","type":"uint256"}],"name":"LogGameStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"game_num","type":"uint256"},{"indexed":false,"name":"winner","type":"uint8"}],"name":"LogVictory","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"game_num","type":"uint256"},{"indexed":false,"name":"x1","type":"uint8"},{"indexed":false,"name":"y1","type":"uint8"},{"indexed":false,"name":"x2","type":"uint8"},{"indexed":false,"name":"y2","type":"uint8"}],"name":"LogMoveMade","type":"event"}];

    var registry_contract_address = '0xa35fc4d3ea15e0d9272dc181ee1c2761d5d0cabd';
    var registryContractABI = [{"constant":true,"inputs":[{"name":"username","type":"string"}],"name":"get_address","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"get_username","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":false,"inputs":[{"name":"username","type":"string"}],"name":"register","outputs":[],"type":"function"}];

    var connectsix_contract = web3.eth.contract(contractABI);
    var connectsix = connectsix_contract.at(contract_address);

    var registry_contract = web3.eth.contract(registryContractABI);
    var registry = registry_contract.at(registry_contract_address);

    var current_game_num = 0;

    var my_moves = [];

    // mode can be normal or move_replay
    var mode = "normal";

    var game_metadata;
    var board_state = new Array(19);
    var player_board = new Array(19);
    for (var i = 0; i < 19; i++) {
        board_state[i] = new Array(19);
        player_board[i] = new Array(19);
    }

    var refresh_all = function(callback) {
        var cur_refresh_index = 0;
        var result = [];

        var refresh_game = function(error, game_metadata) {
          result.push(game_metadata);
          cur_refresh_index++;
          refresh_games()
        }

        var refresh_games = function() {
            if (cur_refresh_index < 10) {
                connectsix.games(cur_refresh_index, refresh_game);
            } else {
                callback(null, result);
            }
        }

        refresh_games();
    }

    var draw_board = function(callback) {
        for (var x = 0; x < 19; x++) {
            for (var y = 0; y < 19; y++) {
                board_state[x][y] = 0;
            }
        }
		connectsix.move_history(current_game_num, function(error, result) {
            move_history = result;
            if (move_history.length > 0) {
                var turn = 1;
                board_state[9][9] = turn;
                turn = 2;
                for (var i=0; i<move_history.length / 4; i++) {
                    var tx1 = move_history[4*i];
                    var ty1 = move_history[4*i+1];
                    var tx2 = move_history[4*i+2];
                    var ty2 = move_history[4*i+3];
                    board_state[tx1][ty1] = turn;
                    board_state[tx2][ty2] = turn;
                    turn = 3 - turn;
                }
                // for highlighting the last move
				x1 = move_history[move_history.length - 4].toNumber();
				y1 = move_history[move_history.length - 3].toNumber();
				x2 = move_history[move_history.length - 2].toNumber();
				y2 = move_history[move_history.length - 1].toNumber();
            } else {
				x1 = -1;
				y1 = -1;
				x2 = -1;
				y2 = -1;
            }
            refresh();
        });
    }

    var update_status = function() {

        if (mode == "replay") {
            $("#status").text("You are in replay mode. Click on the board to back to normal mode.");
        } else if (player_1 == "0x0") {
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

    var clear_board = function() {
        for (var x = 0; x < 19; x++) {
            for (var y = 0; y < 19; y++) {
                board.removeObjectsAt(x, y);
            }
        }
    }

    var draw_history = function() {
        if (move_history.length == 0) {
          return;
        }
        update_status();
        clear_board();
        board.addObject({
            x: 9,
            y: 9,
            c: WGo.B
        });
        for (var i = 0; i < history_move_num; i++) {
            var col;
            if (i % 2 == 0) {
                col = WGo.W;
            } else {
                col = WGo.B;
            }
            board.addObject({
                x: move_history[i * 4],
                y: move_history[i * 4 + 1],
                c: col
            });
            board.addObject({
                x: move_history[i * 4 + 2],
                y: move_history[i * 4 + 3],
                c: col
            });
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
        // draw last 2 moves
        if (x1 >= 0) {
            // if at least one move was played
            board.addObject({
                x: x1,
                y: y1,
                type: "CR"
            });
            board.addObject({
                x: x2,
                y: y2,
                type: "CR"
            });
        }
	}

	var refresh = function() {
        update_status();
        if (deadline * 1000 - Date.now() > 0) {
			$("#btn_time_victory").prop('disabled', true);
        } else {
            // if time ran out
            $("#btn_time_victory").prop('disabled', false);
        }
        if (turn == 0) {
            $("#btn_join").prop('disabled', false);
            $("#btn_time_victory").prop('disabled', true);
        } else {
            // disable the button if the game already started
            $("#btn_join").prop('disabled', true);
        }
        $("#p1_name").text(player_1);
        $("#p2_name").text(player_2);
        if (mode == "normal") {
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
    }

    var sync_state = function(callback) {
		player_1 = "p1";
		player_2 = "p2";

		connectsix.games(current_game_num, function(error, game_metadata) {
			turn = game_metadata[0].toNumber();
			winner = game_metadata[1].toNumber();
			time_per_move = game_metadata[2].toNumber();
			deadline = game_metadata[3].toNumber();
			player_1_stake = game_metadata[4];
			player_2_stake = game_metadata[5];
            draw_board(function() { });
        });
    }

	var formatTime = function(milisecs) {
		// Given time in miliseconds, convert it to a pretty string like "2:25:04"
		if(milisecs < 0) {
			return "0:00";
		}
		var seconds = milisecs/1000;
		var minutes = Math.floor(seconds/60);
		var hours = Math.floor(seconds/3600);
		seconds = Math.floor(seconds) % 60;
		minutes = minutes % 60;

		result = "";
		if(hours > 0){
			result += hours + ":";
			if(minutes < 10) result += "0";
		}
		result += minutes + ":";
		if(seconds < 10) result += "0";
		result += seconds;
		return result;
	}

	var get_game_status = function(game_metadata) {
		turn = game_metadata[0].toNumber();
		winner = game_metadata[1].toNumber();
		if (winner != 0) {
			return "finished";
		} else if (turn == 0) {
			return "waiting";
		} else {
			return "playing";
		}
	}

    $("#btn_history_start").click(function(){
        if (mode == "normal") {
            mode = "replay";
        }
        history_move_num = 0;
        draw_history();
    });

    $("#btn_history_back").click(function(){
        if (mode == "normal") {
            history_move_num = move_history.length / 4;
            mode = "replay";
        }
        history_move_num--;
        if (history_move_num < 0) {
            history_move_num = 0;
        }
        draw_history();
    });
    $("#btn_history_next").click(function(){
        if (mode == "normal") {
            history_move_num = move_history.length / 4;
            mode = "replay";
        }
        history_move_num++;
        if (history_move_num > move_history.length / 4) {
            history_move_num = move_history.length / 4;
        }
        draw_history();
    });

    $("#btn_history_end").click(function(){
        if (mode == "normal") {
            mode = "replay";
        }
        history_move_num = move_history.length / 4;
        draw_history();
    });


    refresh_all(function(error, result) {
        console.log("done refreshing");
        for (var i = 0; i < result.length; i++) {
            game_metadata = result[i];

			var game_status = get_game_status(game_metadata);
            if (game_status == "finished") {
                row = "<td>" + '<button type="button" class="btn btn-danger">' + i + "</button>" + "</td>";
            } else if (game_status == "waiting") {
                row = "<td>" + '<button type="button" class="btn btn-success">' + i + "</button>" + "</td>";
            } else {
                row = "<td>" + '<button type="button" class="btn btn-primary">' + i + "</button>" + "</td>";
            }

            var p1 = "dude 1";
            var p2 = "dude2";
            var p1_stake = web3.fromWei(game_metadata[4], "ether");
            var p2_stake = web3.fromWei(game_metadata[5], "ether");

            row += "<td>" + formatTime(game_metadata[2].toNumber() * 1000) + "</td>" // time per move
            row += "<td>" + p1 + "</td>"
            row += "<td>" + p1_stake + "</td>"
            row += "<td>" + p2 + "</td>"
            row += "<td>" + p2_stake + "</td>"
            $('#games_table tbody').append("<tr>" + row + "</tr>");

			$('#games_table').on('click', 'tr button', function (event) {
				$("#game_tab").tab('show')
				current_game_num = $(this).text();
				sync_state();
				board.setWidth($("#board").width());
			});

        }
    });

    board.addEventListener("click", function(x, y) {
        mode = "normal";
        if (my_moves.length >= 2
                || (my_moves.length == 1 && my_moves[0].x == x && my_moves[0].y == y)
                || board_state[x][y] != 0) {
            my_moves = [];
        } else {
            my_moves.push({x:x, y:y});
        }
        refresh();
    });


});

}

window.addEventListener('load', function() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3? You should consider trying MetaMask!')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  // Now you can start your app & access web3 freely:
  startApp()

});
