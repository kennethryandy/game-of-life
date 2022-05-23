import produce from 'immer';
import { useState, useRef, useLayoutEffect, useCallback } from 'react';

let numRows = 10;
let numCols = 10;

const operations = [
	[0, 1],
	[0, -1],
	[1, 0],
	[-1, 0],
	[1, 1],
	[-1, 1],
	[1, -1],
	[-1, -1]
];

function App () {
	const [grid, setGrid] = useState([]);
	const [isRunning, setIsRunning] = useState(false);
	const [simulateSpeed, setSimulateSpeed] = useState(2);

	const isRunningRef = useRef(false);
	isRunningRef.current = isRunning;
	const simulateSpeedRef = useRef(2);
	simulateSpeedRef.current = simulateSpeed;
	const containerRef = useRef();

	useLayoutEffect(() => {
		initializeGrid();
	}, []);

	const initializeGrid = () => {
		const containerLayout = containerRef.current.getBoundingClientRect();
		numCols = Math.ceil(containerLayout.width / 25);
		numRows = Math.ceil(containerLayout.height / 25);
		setGrid(() => {
			let rows = [];
			for (let i = 0; i < numRows; i++) {
				rows.push(Array.from(Array(numCols), () => 0));
			}
			return rows;
		});
	}

	const onDragSelect = (i, j) => {
		const newGrid = produce(grid, currentGrid => {
			currentGrid[i][j] = 1;
		})
		setGrid(newGrid);
	}

	const handleSimulationEvent = () => {
		setIsRunning(!isRunning);
		if (!isRunning) {
			isRunningRef.current = true;
			runSimulation();
		}
	}

	const runSimulation = useCallback(() => {
		const nRows = numRows;
		const nCols = numCols;
		if (!isRunningRef.current) { return }

		setGrid(currentStateGrid => {
			return produce(currentStateGrid, currentGrid => {
				for (let i = 0; i < nRows; i++) {
					for (let j = 0; j < nCols; j++) {
						let neighbors = 0;
						operations.forEach(([x, y]) => {
							const newI = i + x;
							const newJ = j + y;
							if ((newI >= 0 && newI < nRows) && (newJ >= 0 && newJ < nCols)) {
								neighbors += currentStateGrid[newI][newJ];
							}
						})
						if (currentStateGrid[i][j] === 0 && neighbors === 3) {
							currentGrid[i][j] = 1;
						} else if (neighbors < 2 || neighbors > 3) {
							currentGrid[i][j] = 0;
						}
					}
				}
			});
		});

		setTimeout(runSimulation, 100);
	}, []);

	return (
		<div className="wrapper">
			<h1>Game Of Life</h1>
			<div className='options'>
				<button onClick={handleSimulationEvent}>{isRunning ? "Stop" : "Start"}</button>
				<button onClick={() => {
					setIsRunning(false);
					setGrid(() => {
						let rows = [];
						for (let i = 0; i < numRows; i++) {
							rows.push(Array.from(Array(numCols), () => Math.random() > .8 ? 1 : 0));
						}
						return rows;
					});
				}}>Random</button>
				<button onClick={() => {
					setIsRunning(false);
					initializeGrid();
				}}>Clear</button>

			</div>
			<div
				ref={containerRef}
				className="gContainer"
				style={{ gridTemplateColumns: `repeat(${numCols}, 25px)`, gridTemplateRows: `repeat(${numRows}, 1fr)` }}>
				{grid.map((rows, i) => (
					rows.map((col, j) => (
						<div
							onDragStartCapture={() => onDragSelect(i, j)}
							onDragOverCapture={() => onDragSelect(i, j)}
							onClick={() => {
								const newGrid = produce(grid, currentGrid => {
									currentGrid[i][j] = currentGrid[i][j] ? 0 : 1;
								})
								setGrid(newGrid);
							}}
							id={`${i}_${j}`}
							className="box" key={`${i}-${j}`}
							style={{ backgroundColor: grid[i][j] ? "rgb(26, 32, 39)" : "rgb(231, 235, 240)" }} />))
				))}
			</div>
			<div className="instruction">
				<ul>
					<li>Any live cell with fewer than two live neighbours dies, as if by underpopulation.</li>
					<li>Any live cell with two or three live neighbours lives on to the next generation.</li>
					<li>Any live cell with more than three live neighbours dies, as if by overpopulation.</li>
					<li>Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.</li>
				</ul>
			</div>
		</div>
	);
}

export default App;
