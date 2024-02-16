const express = require("express");
const cors = require("cors");
const { CasperClient, Contracts, DeployUtil } = require("casper-js-sdk");

const app = express();
app.use(express.json());
app.use(cors());

const client = new CasperClient("http://188.40.129.158:7777/rpc");

const contract = new Contracts.Contract(client);
contract.setContractHash(
	"hash-619f8eec76040bbded8a5b708dc3c1bb4a4356b4b8339fe3d46f528ecc0afbb8"
);
app.post("/deploy", async (req, res) => {
	try {
		const deploy = DeployUtil.deployFromJson(req.body).unwrap();
		const deployHash = await client.putDeploy(deploy);
		res.send(deployHash);
	} catch (error) {
		res.status(400).send(error.message);
	}
});

app.get("/query", async (req, res) => {
	try {
		const data = await contract.queryContractData(["count_key"]);
		res.send(data._hex);
	} catch (error) {
		res.status(400).send(error.message);
	}
});

app.listen(3001, () => {
	console.log(`App listening on port 3001`);
});
