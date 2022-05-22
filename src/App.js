import produce from 'immer';
import { useState, useRef, useLayoutEffect, useCallback } from 'react';

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
	const containerRef = useRef();

	useLayoutEffect(() => {
		initializeGrid();
	}, []);

	const initializeGrid = () => {
		const containerLayout = containerRef.current.getBoundingClientRect();
		numCols = Math.floor(containerLayout.width / 25);
		numRows = Math.floor(containerLayout.height / 25);
		// numCols = 20;
		// numRows = 10;
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




	return (
		<>
			<div className='options'>
				<button>Start</button>
				<button onClick={initializeGrid}>Clear</button>
			</div>
			<div
				ref={containerRef}
				className="gContainer"
				style={{ gridTemplateColumns: `repeat(${numCols}, 25px)` }}>
				{grid.map((rows, i) => (
					rows.map((col, j) => (
						<div
							onDragStart={() => onDragSelect(i, j)}
							onDragOver={() => onDragSelect(i, j)}
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
