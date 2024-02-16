import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import Wallet from "./Wallet";
import Increment from "./Increment";
import Query from "./Query";

function App() {
	const [publicKey, setPublicKey] = useState(null);

	if (window.CasperWalletProvider == null) {
		return <h1>Casper Wallet is not installed</h1>;
	}

	const provider = window.CasperWalletProvider();
	return (
		<>
			<Query />
			<Wallet
				provider={provider}
				publicKey={publicKey}
				setPublicKey={setPublicKey}
			/>
			<Increment provider={provider} publicKey={publicKey} />
		</>
	);
}

export default App;
