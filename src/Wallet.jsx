export default function Wallet(props) {
	if (!props.publicKey) {
		return (
			<button onClick={() => requestConnection(props)}>
				Connect to Casper Wallet
			</button>
		);
	} else {
		return (
			<button onClick={() => disconnect(props)}>
				Disconnect from Casper Wallet
			</button>
		);
	}
}

function requestConnection(props) {
	props.provider.requestConnection().then(connected => {
		if (connected) {
			getActivePublicKey(props);
		}
	});
}

function getActivePublicKey(props) {
	props.provider
		.getActivePublicKey()
		.then(publicKey => {
			props.setPublicKey(publicKey);
		})
		.catch(error => {
			if (error === 1) {
				console.error("Wallet is locked");
			} else if (error === 2) {
				console.error("Not approved to connect");
			}
		});
}

function disconnect(props) {
	props.provider.disconnectFromSite().then(disconnected => {
		if (disconnected) {
			props.setPublicKey(null);
		}
	});
}