
import assert from "assert";
import { test, runTests } from "tinytest";
import Minesweeper from '../src/Minesweeper.js';

console.log(Minesweeper);

test("generates the correct number of mine coordinates", () => {
    const coords = Minesweeper.generateMineCoordinates({mines: 90, height: 10, width: 10});
    assert(coords.size === 90);
});

test("max generated coordinates is the size of the grid", () => {
    const coords = Minesweeper.generateMineCoordinates({mines: 90, height: 5, width: 5});
    assert(coords.size === 25);
});

runTests();
