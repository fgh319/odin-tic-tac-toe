const Gameboard = (function () {
    let board = Array(9).fill('');

    // 优化：返回数组的副本，防止外部直接修改原数组
    const getBoard = () => [...board];

    const placeMarker = (index, marker) => {
        if (index >= 0 && index <= 8 && !board[index]) {
            board[index] = marker;
            return true;
        } else {
            return false;
        }

    };

    const resetBoard = () => board.fill('');

    return {
        getBoard,
        placeMarker,
        resetBoard
    };
})();

const Player = (marker) => {
    const getMarker = () => marker;
    return {getMarker };
};

const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameActive = false;
    let roundResult = ''; // 用于存储当前回合的结果信息

    const init = () => {
        players = [Player('x'), Player('o')];
        currentPlayerIndex = 0;
        gameActive = true;
        roundResult = '';
        Gameboard.resetBoard();
    }

    const checkWin = (board) => {
        const WINNING_COMBINATIONS = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return WINNING_COMBINATIONS.some(([a, b, c]) => {
            return board[a] && board[a] === board[b] && board[a] === board[c];
        });
    }

    const playRound = (position) => {
        if (!gameActive) return;

        const currentPlayer = players[currentPlayerIndex];
        const isPlaceSuccess = Gameboard.placeMarker(position, currentPlayer.getMarker());

        if (isPlaceSuccess) {
            const board = Gameboard.getBoard();

            if (checkWin(board)) {
                gameActive = false;
                roundResult = `玩家 ${currentPlayer.getMarker()} 赢了！`;
            } else if (!board.includes('')) {
                gameActive = false;
                roundResult = '平局！';
            } else {
                currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
                roundResult = `轮到玩家 ${players[currentPlayerIndex].getMarker()}`;
            }
        }
    }

    return {
        init,
        playRound,
        getActive: () => gameActive,
        getCurrentPlayer: () => players[currentPlayerIndex],
        getResultMessage: () => roundResult
    }
})();

const DisplayController = (() => {
    const startButton = document.querySelector('#start');
    const cellElements = document.querySelectorAll('.cell');
    const messageElement = document.querySelector('#message');

    // 把更新屏幕的逻辑抽离出来，方便复用
    const updateScreen = () => {
        const board = Gameboard.getBoard();

        // 1. 更新棋盘格子
        cellElements.forEach((cell, index) => {
            cell.textContent = board[index];
        })

        // 2. 更新消息文字 (直接从 GameController 获取结果，自己不计算)
        messageElement.textContent = GameController.getResultMessage();
    };

    const init = () => {
        startButton.addEventListener('click', () => {
            GameController.init();
            updateScreen(); // 初始化后刷新一下
            startButton.textContent = '重新开始';
        })

        // 绑定点击事件
        cellElements.forEach(cell => {
            cell.addEventListener('click', (event) => {
                const cellIndex = event.target.dataset.index;

                // 只有当游戏进行中，才允许点击
                if (GameController.getActive()) {
                    GameController.playRound(cellIndex); // 1. 处理逻辑
                    updateScreen(); // 2. 更新画面
                }
            })
        })
    };

    return {init};
})();

DisplayController.init();