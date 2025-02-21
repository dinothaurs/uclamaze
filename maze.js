export class MazeGenerator {

    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.cols = 2 * this.height + 1;  // Total number of columns in the maze including walls
        this.rows = 2 * this.width + 1;  // Total number of rows in the maze including walls
        this.maze = this.init_maze([]);  // Initialize an empty maze array

		// Set up the initial grid with walls and open spaces
        this.maze.forEach((row, r) => {
            row.forEach((cell, c) => {
                switch(r) {
                    case 0:
                    case this.rows - 1:
                        this.maze[r][c] = ["wall"];
                        break;
                    default:
                        if((r % 2) == 1) {
                            if((c == 0) || (c == this.cols - 1)) {
                                this.maze[r][c] = ["wall"];
                            }
                        }
                        else if (c % 2 == 0) {
                            this.maze[r][c] = ["wall"];
                        }
                }
            });
        });
		
		// Generate a random maze using recursive division
        this.generate_maze(1, this.width - 1, 1, this.height - 1);
    }

    generate_maze(r1, r2, c1, c2) {
        let row, col, x, y, start, end;

		// Base case: If the region is too small, return
        if((r2 < r1) || (c2 < c1))
            return false;
		
		// Randomly select a row to place a horizontal wall
        if(r1 == r2) {
            row = r1;
        }
        else {
            x = r1 + 1;
            y = r2 - 1;
            start = Math.round(x + (y - x) / 4);
            end = Math.round(x + (3 * (y - x)) / 4);
            row = this.randomize_pos(start, end);
        }

		// Randomly select a column to place a vertical wall
        if(c1 == c2) {
            col = c1;
        } else {
            x = c1 + 1;
            y = c2 - 1;
            start = Math.round(x + (y - x) / 3);
            end = Math.round(x + (2 * (y - x)) / 3);
            col = this.randomize_pos(start, end);
        }
		
		// Place walls in the selected row and column
        for(let i = this.get_wall_distance(r1) - 1; i <= this.get_wall_distance(r2) + 1; i++) {
            for(let j = this.get_wall_distance(c1) - 1; j <= this.get_wall_distance(c2) + 1; j++) {
                if((i == this.get_wall_distance(row)) || (j == this.get_wall_distance(col))) {
                    this.maze[i][j] = ["wall"];
                }
            }
        }

		// Randomly choose three out of four directions to create openings in the wall
        let gaps = ([true, true, true, false]);
        for(let i = gaps.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gaps[i], gaps[j]] = [gaps[j], gaps[i]];
        }

		// Create openings in the walls at random positions
        if(gaps[0]) {
            let gapPos = this.randomize_pos(c1, col);
            this.maze[this.get_wall_distance(row)][this.get_space_distance(gapPos)] = [];
        }
        if(gaps[1]) {
            let gapPos = this.randomize_pos((col+1), (c2+1));
            this.maze[this.get_wall_distance(row)][this.get_space_distance(gapPos)] = [];
        }
        if(gaps[2]) {
            let gapPos = this.randomize_pos(r1, row);
            this.maze[this.get_space_distance(gapPos)][this.get_wall_distance(col)] = [];
        }
        if(gaps[3]) {
            let gapPos = this.randomize_pos((row+1), (r2+1));
            this.maze[this.get_space_distance(gapPos)][this.get_wall_distance(col)] = [];
        }

		// Recursively apply the maze generation algorithm to the four divided regions
        this.generate_maze(r1, (row-1), c1, (col-1));
        this.generate_maze(r1, (row-1), (col+1), c2);
        this.generate_maze((row+1), r2, c1, (col-1));
        this.generate_maze((row+1), r2, (col+1), c2);
    }

    draw_maze() {
		// Convert "wall" and open spaces into numeric values for easier rendering
        for (let i = 0 ; i < this.maze.length ; i++) {
            for (let j = 0 ; j < this.maze[i].length ; j++) {
                if (i == 0 || i == (this.height * 2) || this.maze[i][j] == "wall") {
                    this.maze[i][j] = 1; // Walls represented as 1
                }
                else {
                    this.maze[i][j] = 0; // Open paths represented as 0
                }
            }
        }

        return this.maze;
    }

    init_maze(value) {
		// Initialize a 2D array with the given value
        return new Array(this.rows).fill().map(() => new Array(this.cols).fill(value));
    }

    randomize_pos(min, max) {
		// Return a random position between min and max
        return min + Math.floor(Math.random() * (1 + max - min));
    }

    get_wall_distance(x) {
		// Convert space coordinate to wall coordinate
        return 2 * x;
    }

    get_space_distance(x) {
		// Convert wall coordinate to space coordinate
        return 2 * (x-1) + 1;
    }
}
