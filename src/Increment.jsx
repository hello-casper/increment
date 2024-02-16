import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil } from "casper-js-sdk";

export default function Increment(props) {
	return <button onClick={() => increment(props)}>Increment</button>;
}

async function increment(props) {
	if (props.publicKey == null) {
		alert("No public key, please connect");
		return;
	}

	const contractClient = new Contracts.Contract();
	contractClient.setContractHash(
		"hash-619f8eec76040bbded8a5b708dc3c1bb4a4356b4b8339fe3d46f528ecc0afbb8"
	);

	const args = RuntimeArgs.fromMap({});
	const deploy = contractClient.callEntrypoint(
		"increment_count",
		args,
		CLPublicKey.fromHex(props.publicKey),
		"casper-test",
		"1000000000"
	);

	const deployJson = DeployUtil.deployToJson(deploy);
	const result = await props.provider.sign(
		JSON.stringify(deployJson),
		props.publicKey
	);

	if (result.cancelled) {
		alert("Signature request cancelled");
		return;
	}

	const signedDeploy = DeployUtil.setSignature(
		deploy,
		result.signature,
		CLPublicKey.fromHex(props.publicKey)
	);

	const signedDeployJson = DeployUtil.deployToJson(signedDeploy);

	const response = await fetch("http://localhost:3001/deploy", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(signedDeployJson)
	});

	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage);
	}

	console.log(await response.text());
}
