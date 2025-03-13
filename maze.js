export class MazeGenerator {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.cols = (this.width * 5) + 1;
        this.rows = (this.height * 5) + 1;
        this.maze = this.init_maze([]);

        this.maze.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                    this.maze[r][c] = ["wall"];
                } else if (r % 5 === 0 || c % 5 === 0) {
                    this.maze[r][c] = ["wall"];
                }
            });
        });

        this.generate_maze(1, this.height - 1, 1, this.width - 1);
        this.ensure_exit_path();
        this.print_maze();
    }

    generate_maze(r1, r2, c1, c2) {
        let row, col, x, y, start, end;
    
        // Base case: If the region is too small, return
        if ((r2 < r1) || (c2 < c1))
            return false;
    
        // Randomly select a row to place a horizontal wall
        if (r1 == r2) {
            row = r1;
        } else {
            x = r1 + 1;
            y = r2 - 1;
            start = Math.round(x + (y - x) / 4);
            end = Math.round(x + (3 * (y - x)) / 4);
            row = this.randomize_pos(start, end);
        }
    
        // Randomly select a column to place a vertical wall
        if (c1 == c2) {
            col = c1;
        } else {
            x = c1 + 1;
            y = c2 - 1;
            start = Math.round(x + (y - x) / 3);
            end = Math.round(x + (2 * (y - x)) / 3);
            col = this.randomize_pos(start, end);
        }
    
        // Place walls in the selected row and column
        for (let i = this.get_wall_distance(r1) - 1; i <= this.get_wall_distance(r2) + 1; i++) {
            for (let j = this.get_wall_distance(c1) - 1; j <= this.get_wall_distance(c2) + 1; j++) {
                if ((i == this.get_wall_distance(row)) || (j == this.get_wall_distance(col))) {
                    this.maze[i][j] = ["wall"];
                }
            }
        }
    
        // Randomly choose three out of four directions to create openings in the wall
        let gaps = ([true, true, true, false]);
        for (let i = gaps.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gaps[i], gaps[j]] = [gaps[j], gaps[i]];
        }
    
        // Create openings in the walls at random positions (4 units wide)
        if (gaps[0]) {
            let gapPos = this.randomize_pos(c1, col);
            for (let k = 0; k < 4; k++) {
                this.maze[this.get_wall_distance(row)][this.get_space_distance(gapPos) + k] = [];
            }
        }
        if (gaps[1]) {
            let gapPos = this.randomize_pos((col + 1), (c2 + 1));
            for (let k = 0; k < 4; k++) {
                this.maze[this.get_wall_distance(row)][this.get_space_distance(gapPos) + k] = [];
            }
        }
        if (gaps[2]) {
            let gapPos = this.randomize_pos(r1, row);
            for (let k = 0; k < 4; k++) {
                this.maze[this.get_space_distance(gapPos) + k][this.get_wall_distance(col)] = [];
            }
        }
        if (gaps[3]) {
            let gapPos = this.randomize_pos((row + 1), (r2 + 1));
            for (let k = 0; k < 4; k++) {
                this.maze[this.get_space_distance(gapPos) + k][this.get_wall_distance(col)] = [];
            }
        }
    
        // Recursively apply the maze generation algorithm to the four divided regions
        this.generate_maze(r1, (row - 1), c1, (col - 1));
        this.generate_maze(r1, (row - 1), (col + 1), c2);
        this.generate_maze((row + 1), r2, c1, (col - 1));
        this.generate_maze((row + 1), r2, (col + 1), c2);
    }
    
    // Ensure there is a path to the exit
    ensure_exit_path() {
        let exitRow = this.rows - 2;
        let exitCol = this.cols - 2;
    
        // Use a simple flood-fill algorithm to ensure connectivity
        let stack = [[exitRow, exitCol]];
        while (stack.length > 0) {
            let [r, c] = stack.pop();
            if (r < 0 || r >= this.rows || c < 0 || c >= this.cols || this.maze[r][c].includes("wall")) {
                continue;
            }
            if (this.maze[r][c].includes("visited")) {
                continue;
            }
            this.maze[r][c].push("visited");
    
            // Add neighboring cells to the stack
            stack.push([r - 1, c]);
            stack.push([r + 1, c]);
            stack.push([r, c - 1]);
            stack.push([r, c + 1]);
        }
    
        // Remove "visited" markers
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.maze[r][c].includes("visited")) {
                    this.maze[r][c] = this.maze[r][c].filter(x => x !== "visited");
                }
            }
        }
    }

    print_maze() {
        const finalMaze = this.draw_maze();
        const mazeString = finalMaze.map(row => row.map(cell => (cell === 1 ? '1' : '0')).join('')).join('\n');
        console.log(mazeString);
    }
    
    draw_maze() {
        const finalMaze = new Array(this.rows).fill().map(() => new Array(this.cols).fill(0));
    
        for (let i = 0; i < this.maze.length; i++) {
            for (let j = 0; j < this.maze[i].length; j++) {
                if (this.maze[i][j].includes("wall")) {
                    finalMaze[i][j] = 1; // 1 represents a wall
                } else {
                    finalMaze[i][j] = 0; // 0 represents an open path
                }
            }
        }
    
        //make exit
        const exitRowStart = this.rows - 2; // Start at the second-to-last row
        const exitColStart = this.cols - 5; // Start 4 columns from the end
    
        for (let i = exitRowStart; i < this.rows; i++) {
            for (let j = exitColStart; j < this.cols; j++) {
                finalMaze[i][j] = 0; // Clear the exit area
            }
        }
        
        return finalMaze;
    }

    init_maze(value) {
        return new Array(this.rows).fill().map(() => new Array(this.cols).fill(value));
    }

    randomize_pos(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    get_wall_distance(x) {
        return x * 5;
    }

    get_space_distance(x) {
        return (x - 1) * 5 + 1;
    }
}
