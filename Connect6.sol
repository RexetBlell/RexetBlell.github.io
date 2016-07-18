contract ConnectSix {

  mapping(int8 => mapping(int8 => int8)) public board;
  address[3] public players;
  int8 public turn;
  uint8 public board_size = 19;

  function ConnectSix() {
    players[1] = msg.sender;
  }

  function join_game() {
    players[2] = msg.sender;
    turn = 1;
  }

  function single_move(int8 x, int8 y) internal {
    if (x > board_size) {
      throw;
    }
    if (board[x][y] != 0) {
      throw;
    }
    board[x][y] = turn;
  }

  function make_move(int8 x1, int8 y1, int8 x2, int8 y2) {
    if (msg.sender != players[turn]) {
      throw;
    }
    single_move(x1, y1);
    single_move(x2, y2);
    turn = 3 - turn;
  }
  
  function make_first_move(int8 x, int8 y) {
    if (msg.sender != players[turn]) {
      throw;
    }
    single_move(x, y);
    turn = 3 - turn;
  }

  /*
  function claim_winner(int8 _x, int8 _y, int dx, int dy) {
    if (dx < -1 || dx > 1 || dy < -1 || dy > 1 || (dx == 0 && dy == 0)) {
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
  }
  */

}
