import produce from 'immer';
import { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';

let numRows;
let numCols;

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
		numCols = Math.floor(containerLayout.width / 25);
		numRows = Math.floor(containerLayout.height / 25);
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
		if (!isRunningRef.current) { return }

		setGrid(currentStateGrid => {
			return produce(currentStateGrid, currentGrid => {
				for (let i = 0; i < numRows; i++) {
					for (let j = 0; j < numCols; j++) {
						let neighbors = 0;
						operations.forEach(([x, y]) => {
							const newI = i + x;
							const newJ = j + y;
							if ((newI >= 0 && newI < numRows) && (newJ >= 0 && newJ < numCols)) {
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

		setTimeout(runSimulation, 200);
	}, []);


	return (
		<>
			<div className='options'>
				<button onClick={handleSimulationEvent}>{isRunning ? "Stop" : "Start"}</button>
				<button onClick={() => {
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
				style={{ gridTemplateColumns: `repeat(${numCols}, 25px)` }}>
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
							style={{ backgroundColor: grid[i][j] ? "pink" : "transparent" }} />))
				))}
			</div>
		</>
	);
}

export default App;
