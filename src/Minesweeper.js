
import $ from "jquery";
import Timer from "./Timer.js";

/**
 * The legendary game Minesweeper.
 */
export default class Minesweeper {
    /**
     * @param {String} mode One of the available modes from `Minesweeper.modes`.
     */
    constructor(mode=null) {
        if (mode == null) {
            mode = Minesweeper.defaultMode;
        }

        if (!Minesweeper.modes[mode]) {
            throw new Error(`Unknown mode "${mode}"`);
        }

        this.mode = Minesweeper.modes[mode];

        this.timer = new Timer(timer => {
            $("#timer").text(String(Math.round(timer.duration)).padStart(3, "0"));
        });

        this.gameStarted = false;
        this.gameEnded = false;

        this.mineCoordinates = Minesweeper.generateMineCoordinates(this.mode);

        // the number of selected non-mine cells needed to win the game
        this.numCellsNeededToWin = (this.mode.width * this.mode.height) - this.mode.mines;
    }

    /**
     * Renders the game grid. Does not start the game timer.
     */
    render() {
        // clear the timer.
        this.timer.reset();
        $("#timer").text("000");

        // set up the game action buttons.
        $("#giveup-button").off().prop("disabled", false).on("click", this.gameOver.bind(this, false));
        $("#restart-button").off().prop("disabled", false).on("click", this.restart.bind(this));
        $("#reveal-button").off().prop("disabled", false).on("click", this.reveal.bind(this));

        // show the number of mines in the grid.
        $("#mines").text(String(this.mode.mines));

        // add all the grid rows.
        $("#grid").empty().append(this.createGridRows());

        // indicate the game is active.
        $("#game").removeClass("ended").addClass("active");
        $("#playing").empty().text(`${this.mode.name} mode`);

        // flash the status indicator a few times to indicate a new game is ready.
        $("#playing").fadeOut(200).fadeIn(200).
            fadeOut(200).fadeIn(200).
            fadeOut(200).fadeIn(200);
    }

    restart() {
        this.gameStarted = false;
        this.timer.reset();

        $("#grid .cell").removeClass("selected flagged").text("");

        // flash the timer a few times to indicate the game has been restarted.
        $("#timer").text("000").
            fadeOut(200).fadeIn(200).
            fadeOut(200).fadeIn(200).
            fadeOut(200).fadeIn(200);
    }

    endGame() {
        this.gameStarted = false;
        this.gameEnded = true;
        this.timer.stop();
    }

    gameOver(victory) {
        this.endGame();

        const message = victory ? "you won!" : "you lost.";

        // unbind events from all cells and the action buttons and mark them disabled.
        $("#grid .cell").off().addClass("disabled");
        $("#restart-button").off().prop("disabled", true);
        $("#giveup-button").off().prop("disabled", true);
        $("#reveal-button").off().prop("disabled", true);

        // indicate the game has ended.
        $("#game").removeClass("active").addClass("ended");
        $("#playing").text(`Game over - ${message}`);

        this.reveal();
    }

    /**
     * Expose the cells with mines.
     */
    reveal() {
        const cellHasMine = this.cellHasMine.bind(this);

        $("#grid .cell").each(function () {
            const $cell = $(this);

            if (cellHasMine($cell)) {
                $cell.addClass("has-mine").text("x");
            }
        });
    }

    /**
     * Check if the game has been won.
     */
    checkGameWon() {
        const numCellsSelected = $("#grid .cell.selected").length;

        if (numCellsSelected >= this.numCellsNeededToWin) {
            this.gameOver(true);
        }
    }

    /**
     * When a user clicks a square, they will either:
     *   - See a bomb, ending the game
     *   - See a number indicating the number of bombs adjacent to the square
     *   - See an empty square (if there are no bombs adjacent),
     *     along with any adjacent empty squares -- exposing a region
     *
     * @param {Event} event
     * @param {Element} cell
     */
    onCellClicked(event, cell) {
        if (this.gameEnded) {
            return;
        }

        // start the game the moment a cell is clicked.
        if (!this.timer.started) {
            this.gameStarted = true;
            this.timer.start();
        }

        const $cell = $(cell);

        // Do nothing if the cell has already been clicked.
        if ($cell.hasClass("selected")) {
            return;
        }

        // End the game if there is a mine at the cell's position.
        if (this.cellHasMine($cell)) {
            this.gameOver(false);

            return;
        }

        const $adjacentCells = this.getAdjacentCells($cell);

        const $cellsWithMines = $adjacentCells.filter($cell => this.cellHasMine($cell));
        const numAdjacentMines = $cellsWithMines.length;

        // If there are mines adjacent to the cell,
        // Show a number indicating the number of bombs adjacent to the cell.
        if (numAdjacentMines > 0) {
            this.selectCell($cell, numAdjacentMines);
            this.checkGameWon();

            return;
        }

        // Select the adjacent cells to expose a region.

        this.selectCell($cell);

        const $cellsWithoutMines = $adjacentCells.filter($cell => !this.cellHasMine($cell));

        // Simulate a click on each cell (triggering this function).
        $cellsWithoutMines.forEach($cell => $cell.click());

        this.checkGameWon();
    }

    /**
     * @param  {jQuery} $cell The cell to select.
     * @param  {number} numAdjacentMines The number of mines adjacent to the cell.
     */
    selectCell($cell, numAdjacentMines=0) {
        $cell.removeClass("flagged").addClass("selected");
        $cell.text(numAdjacentMines > 0 ? numAdjacentMines : "");
    }

    /**
     * @param  {jQuery} $cell The cell to flag.
     */
    flagCell($cell) {
        if ($cell.hasClass("selected") || $cell.hasClass("has-mine")) {
            return;
        }

        $cell.text("?").addClass("flagged");
    }

    /**
     * @param  {jQuery} The target cell.
     * @return {Array<jQuery>} The cells surrounding the target cell.
     */
    getAdjacentCells($cell) {
        const { x, y } = this.getCellCoordinates($cell);

        return [
            $(`#grid .cell[data-x="${x}"][data-y="${y-1}"]`), // above
            $(`#grid .cell[data-x="${x}"][data-y="${y+1}"]`), // below
            $(`#grid .cell[data-x="${x-1}"][data-y="${y}"]`), // left
            $(`#grid .cell[data-x="${x+1}"][data-y="${y}"]`), // right
        ].filter($cell => $cell.length > 0);
    }

    /**
     * @param  {jQuery} The target cell.
     * @return {Object}
     */
    getCellCoordinates($cell) {
        return {
            x: Number.parseInt($cell.data("x"), 10),
            y: Number.parseInt($cell.data("y"), 10),
        };
    }

    /**
     * @param  {jQuery} The target cell.
     * @return {boolean}
     */
    cellHasMine($cell) {
        const { x, y } = this.getCellCoordinates($cell);

        return this.isMineAtCoordinates(x, y);
    }

    /**
     * @param  {number} x The x-position of a cell.
     * @param  {number} y The y-position of a cell.
     * @return {boolean}
     */
    isMineAtCoordinates(x, y) {
        return this.mineCoordinates.has(`${x},${y}`);
    }

    /**
     * @return {Array<jQuery>}
     */
    createGridRows() {
        const { width, height } = this.mode;

        const onCellClicked = this.onCellClicked.bind(this);
        const flagCell = this.flagCell.bind(this);

        const $rows = [];

        for (let y = 0; y < height; y++) {
            const $row = $("<div>").addClass("row");

            for (let x = 0; x < width; x++) {
                // note - using <a> here because <div> doesn't
                // respect the CSS `cursor` property.
                const $cell = $("<a>").addClass("cell");

                // mark the x/y position of the cell
                $cell.attr({"data-x": x, "data-y": y});

                $cell.on("click", function (event) {
                    onCellClicked(event, this);
                    return false;
                });

                $cell.on("contextmenu", function (event) {
                    flagCell($(this));
                    return false;
                });

                if (this.isMineAtCoordinates(x, y)) {
                    $cell.addClass("has-mine");
                }

                $row.append($cell);
            }

            $rows.push($row);
        }

        return $rows;
    }

    /**
     * Prompt the user to start a new game if one is currently in progress.
     */
    confirmNewGame() {
        if (!this.gameStarted) {
            return true;
        }

        return confirm("A game is in progress - are you sure you want to start a new one?");
    }

    /**
     * Generate N mines at random x/y coordinates, where N is the
     * number of mines specified by the current mode.
     *
     * @param {Object} mode One of the mode objects from `Minesweeper.modes`.
     * @return {Set<String>} x/y coordinates for each mine as "x,y".
     */
    static generateMineCoordinates({ mines, width, height }) {
        // Ensure the number of mines is at most the number of grid cells.
        const numMines = Math.min(mines, width * height);

        const mineCoordinates = new Set();

        while (mineCoordinates.size < numMines) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const coord = `${x},${y}`;

            mineCoordinates.add(coord);
        }

        return mineCoordinates;
    }

    /**
     * Available game modes.
     */
    static get modes() {
        return {
            "easy": {
                name: "Easy",
                mines: 10,
                width: 9,
                height: 9,
            },
            "normal": {
                name: "Normal",
                mines: 40,
                width: 16,
                height: 16,
            },
            "hard": {
                name: "Hard",
                mines: 99,
                width: 30,
                height: 16,
            },
        };
    }

    static get defaultMode() {
        return "easy";
    }

    /**
     * Create buttons for starting a game in each of the available modes.
     */
    static createStartButtons() {
        return Object.entries(this.modes).map(([ name, mode ]) => {
            return $("<button>").
                text(mode.name).
                prop("type", "button").
                attr("title", `${mode.name} mode (${mode.width} x ${mode.height}, ${mode.mines} mines)`).
                attr("data-mode", name);
        });
    }
};
