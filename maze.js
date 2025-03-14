export class MazeGenerator {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.cols = 2 * this.width + 1; 
        this.rows = 2 * this.height + 1; 

        // Initialize the original maze grid with walls and paths
        this.originalMaze = Array.from({ length: this.rows }, () =>
            Array.from({ length: this.cols }, () => [])
        );

        this.originalMaze.forEach((row, r) => {
            row.forEach((cell, c) => {
                switch (r) {
                    case 0:
                    case this.rows - 1:
                        this.originalMaze[r][c] = ["wall"];
                        break;
                    default:
                        if ((r % 2) == 1) {
                            if ((c == 0) || (c == this.cols - 1)) {
                                this.originalMaze[r][c] = ["wall"];
                            }
                        } else if (c % 2 == 0) {
                            this.originalMaze[r][c] = ["wall"];
                        }
                }
            });
        });

        // Generate the maze
        this.generate_maze(1, this.height - 1, 1, this.width - 1);
        this.expand_maze();
    }

    generate_maze(r1, r2, c1, c2) {
        let row, col, x, y, start, end;

        if ((r2 < r1) || (c2 < c1)) return false;

        if (r1 === r2) {
            row = r1;
        } else {
            x = r1 + 1;
            y = r2 - 1;
            start = Math.round(x + (y - x) / 4);
            end = Math.round(x + (3 * (y - x)) / 4);
            row = this.randomize_pos(start, end);
        }

        if (c1 === c2) {
            col = c1;
        } else {
            x = c1 + 1;
            y = c2 - 1;
            start = Math.round(x + (y - x) / 3);
            end = Math.round(x + (2 * (y - x)) / 3);
            col = this.randomize_pos(start, end);
        }

        for (let i = this.get_wall_distance(r1) - 1; i <= this.get_wall_distance(r2) + 1; i++) {
            for (let j = this.get_wall_distance(c1) - 1; j <= this.get_wall_distance(c2) + 1; j++) {
                if ((i === this.get_wall_distance(row)) || (j === this.get_wall_distance(col))) {
                    this.originalMaze[i][j] = ["wall"];
                }
            }
        }

        let gaps = [true, true, true, false];
        for (let i = gaps.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gaps[i], gaps[j]] = [gaps[j], gaps[i]];
        }

        if (gaps[0]) {
            let gapPos = this.randomize_pos(c1, col);
            this.originalMaze[this.get_wall_distance(row)][this.get_space_distance(gapPos)] = [];
        }
        if (gaps[1]) {
            let gapPos = this.randomize_pos(col + 1, c2 + 1);
            this.originalMaze[this.get_wall_distance(row)][this.get_space_distance(gapPos)] = [];
        }
        if (gaps[2]) {
            let gapPos = this.randomize_pos(r1, row);
            this.originalMaze[this.get_space_distance(gapPos)][this.get_wall_distance(col)] = [];
        }
        if (gaps[3]) {
            let gapPos = this.randomize_pos(row + 1, r2 + 1);
            this.originalMaze[this.get_space_distance(gapPos)][this.get_wall_distance(col)] = [];
        }

        this.generate_maze(r1, row - 1, c1, col - 1);
        this.generate_maze(r1, row - 1, col + 1, c2);
        this.generate_maze(row + 1, r2, c1, col - 1);
        this.generate_maze(row + 1, r2, col + 1, c2);
    }

    expand_maze() {
        const pathSize = 4;
        const wallSize = 1;
        const newRows = this.rows * pathSize;
        const newCols = this.cols * pathSize;
        this.finalMaze = Array.from({ length: newRows }, () => Array(newCols).fill(1));

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const isWall = this.originalMaze[r][c].includes("wall");
                const startRow = r * pathSize;
                const startCol = c * pathSize;

                if (!isWall) {
                    for (let i = 0; i < pathSize; i++) {
                        for (let j = 0; j < pathSize; j++) {
                            this.finalMaze[startRow + i][startCol + j] = 0;
                        }
                    }
                }
            }
        }

        const exitStartRow = newRows - pathSize;
        const exitStartCol = newCols - (2 * pathSize);
        for (let i = 0; i < pathSize; i++) {
            for (let j = 0; j < pathSize * 2; j++) {
                this.finalMaze[exitStartRow + i][exitStartCol + j] = 0;
            }
        }
    }

    draw_maze() {
        return this.finalMaze;
    }

    randomize_pos(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    get_wall_distance(x) {
        return 2 * x;
    }

    get_space_distance(x) {
        return 2 * (x - 1) + 1;
    }
}


