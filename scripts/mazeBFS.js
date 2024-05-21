let fieldWidth,
  fieldHeight,
  m,
  n,
  board,
  characterPosition,
  steps,
  finish,
  moveSound;

function preload() {
  moveSound = new Audio(
    "https://opengameart.org/sites/default/files/clicksound1.wav"
  );
}

function initBoard() {
  fieldWidth = 10;
  fieldHeight = 10;
  m = width / fieldWidth;
  n = (height - 100) / fieldHeight;
  board = [];
  characterPosition = [
    Math.floor(Math.random() * m),
    Math.floor(Math.random() * n),
  ];
  for (let i = 0; i < m; ++i) {
    board.push([]);
    for (let j = 0; j < n; ++j) {
      let currentFieldColor;
      if (i === characterPosition[0] && j === characterPosition[1])
        currentFieldColor = color(255, 255, 0);
      else
        currentFieldColor =
          Math.round(Math.random() * 10) > 5.5
            ? color(170, 74, 68)
            : color(255);
      let field = {
        x: i,
        y: j,
        fieldColor: currentFieldColor,
      };
      board[i].push(field);
    }
  }
  redrawBoard();
}

function setup() {
  let canvasWidth = (Math.floor(Math.random() * 41) + 40) * 10;
  let canvasHeight = (Math.floor(Math.random() * 41) + 40) * 10;
  createCanvas(canvasWidth, canvasHeight);
  finish = null;
  steps = 0;
  initBoard();
}

function redrawBoard() {
  background(220);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === characterPosition[0] && j === characterPosition[1]) {
        fill(255, 255, 0);
        board[i][j].fieldColor = color(150, 150, 0);
      } else fill(board[i][j].fieldColor);
      rect(
        board[i][j].x * fieldWidth,
        board[i][j].y * fieldHeight,
        fieldWidth,
        fieldHeight
      );
    }
  }
  fill(0);
  textSize(50);
  text(
    "Steps: " +
      steps +
      (finish ? ", exit found!" : finish === false ? ", no exit." : ""),
    8,
    height - 30
  );
}

async function findExit() {
  let queue = [];
  let visitedFields = new Set([characterPosition.join(",")]);

  let checkField = (i, j) => {
    let fieldString = i.toString() + "," + j;
    if (
      !visitedFields.has(fieldString) &&
      red(board[i][j].fieldColor) !== 170
    ) {
      visitedFields.add(fieldString);
      return true;
    }
    visitedFields.add(fieldString);
    return false;
  };
  let populateQueue = (i, j) => {
    if (board[i] && board[i][j] && checkField(i, j)) queue.push([i, j]);
  };
  populateQueue(characterPosition[0], characterPosition[1] - 1);
  populateQueue(characterPosition[0] + 1, characterPosition[1]);
  populateQueue(characterPosition[0], characterPosition[1] + 1);
  populateQueue(characterPosition[0] - 1, characterPosition[1]);

  let sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  while (queue.length) {
    let queueLength = queue.length;
    for (let i = 0; i < queueLength; ++i) {
      let field = queue.shift();

      characterPosition = field;

      await sleep(500);

      redrawBoard();
      moveSound.play();

      if (
        field[0] === 0 ||
        field[0] === board.length - 1 ||
        field[1] === 0 ||
        field[1] === board[0].length - 1
      ) {
        finish = true;
        if (steps === 0) steps = 1;

        await sleep(500);

        redrawBoard();

        return;
      }
      if (checkField(field[0], field[1] - 1))
        queue.push([field[0], field[1] - 1]);
      if (checkField(field[0] + 1, field[1]))
        queue.push([field[0] + 1, field[1]]);
      if (checkField(field[0], field[1] + 1))
        queue.push([field[0], field[1] + 1]);
      if (checkField(field[0] - 1, field[1]))
        queue.push([field[0] - 1, field[1]]);
    }
    ++steps;
  }

  finish = false;

  redrawBoard();

  return;
}

function draw() {
  findExit();
  noLoop();
}

function mouseClicked() {
  window.location.reload();
}