contract ConnectSix {

  uint8 constant public board_size = 19;

  Game[] public games;

  struct Game {
      mapping(uint8 => mapping(uint8 => uint8)) board;
      address[3] players;
      // 0 means game did not start yet
      uint8 turn;
      // Either 1 or 2. 0 means not finished
      uint8 winner;
      // true if players agreed to a draw
      uint time_per_move;
      // true if this is not the first move
      bool two_stones_per_move;
      // if move is not made by this time, opponent can claim victory
      uint deadline;
  }

  function ConnectSix() {
  }

  function new_game(uint _time_per_move) {
    games.length++;
    Game g = games[games.length - 1];
    g.players[1] = msg.sender;
    g.time_per_move = _time_per_move;
  }

  function join_game(uint game_num) {
    Game g = games[game_num];
    if (g.turn != 0) {
      throw;
    }
    g.players[2] = msg.sender;
    g.turn = 1;
    g.deadline = now + g.time_per_move;
  }

  function single_move(uint game_num, uint8 x, uint8 y) internal {
    if (x > board_size ||  y > board_size) {
      throw;
    }
    Game g = games[game_num];
    if (g.board[x][y] != 0) {
      throw;
    }
    g.board[x][y] = g.turn;
  }

  function make_move(uint game_num, uint8 x1, uint8 y1, uint8 x2, uint8 y2) {
    Game g = games[game_num];
    if (g.winner != 0 || !g.two_stones_per_move || msg.sender != g.players[g.turn]) {
      throw;
    }
    single_move(game_num, x1, y1);
    single_move(game_num, x2, y2);
    g.turn = 3 - g.turn;
    g.deadline = now + g.time_per_move;
  }

  function make_move_and_claim_victory(uint game_num, uint8 x1, uint8 y1, uint8 x2, uint8 y2, uint8 wx, uint8 wy, uint8 dir) {
    make_move(game_num, x1, y1, x2, y2);
    claim_winner(game_num, wx, wy, dir);
  }
  
  function make_first_move(uint game_num, uint8 x, uint8 y) {
    Game g = games[game_num];
    if (g.winner != 0 || g.two_stones_per_move || msg.sender != g.players[g.turn]) {
      throw;
    }
    single_move(x, y);
    g.turn = 3 - g.turn;
    g.deadline = now + g.time_per_move;
  }

  function claim_time_victory(uint game_num) {
    Game g = games[game_num];
    if (g.deadline == 0 || now <= g.deadline) {
      throw;
    }
    g.winner = 3 - g.turn;
  }

  function claim_winner(uint game_num, uint8 x, uint8 y, uint8 dir) {
    if (x > board_size || y > board_size) {
      throw;
    }
    int8 x = _x;
    int8 y = _y;
    for (uint i = 0; i < 6; i++) {
      if (x < 0 || x >= board_size || y < 0 || y >= board_size || board[x][y] == 0 || board[x][y] != board[_x][_y]) {
        throw;
      }
      x += dx;
      y += dy;
    }
    winner(board[_x][_y]);
  */

}
