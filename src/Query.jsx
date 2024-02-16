import { useState, useEffect } from "react";

export default function Query() {
	const [count, setCount] = useState(0);

	useEffect(() => {
		query(setCount);
	}, []);

	return <h1>{count}</h1>;
}

async function query(setCount) {
	const response = await fetch("http://localhost:3001/query");

	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage);
	}

	setCount(parseInt(await response.text()));
}
