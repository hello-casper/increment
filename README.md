# Building Your First dApp

A dApp is an application that communicates with a decentralized network, such as a blockchain. dApps can do anything regular apps and websites can do, but are characterized with their ability to connect with cryptocurrency wallets and push deploys to and query blockchains. 
In this lecture we'll create a web app with React that can invoke the counter contract from last week's lecture. It will allow a user to connect using the Casper Wallet, and call the `increment_count` entrypoint.
Additionally, it will query the `count` variable from the smart contract and display it on screen.

Without further ado, let's get started.

Begin by opening a terminal and navigating to the directory you'd like your project stored.
You'll need Node.js installed to create a React app. If you don't have Node you can install it using package managers such as `apt` for Debian based Linux distros or `brew` on macOS, but I prefer to use `nvm`, the Node Version Manager, which is available [here](github.com/nvm-sh/nvm).

To check if you have Node.js installed, run `node -v`.

We'll be using Node version 18 for this lecture, but if you have 16 or 20 these should also work fine.

In your terminal run:

```bash
npx create-react-app counter-app
```

Then install the Casper JavaScript SDK:

```bash
npm install casper-js-sdk
```

Now open this folder in a code editor, I'll be using VS Code:

```bash
code counter-app
```

In case you're not familiar with React, it is a JavaScript framework created for building single page applications. It splits logic up into what are known as components. We will write three components: One for connecting to the Casper Wallet, one for calling the `increment_count` entrypoint on the smart contract, and one for querying the value of the count variable stored under the smart contract.

Get started by creating a new file in the *src/* folder named *Wallet.jsx*. This is where we'll create the component responsible for connecting to the Casper Wallet. Open a new functional component `Wallet`:

```javascript
export default function Wallet(props) {
  
}
```

The `props` parameter represents React props, which are basically function arguments passed from other components. We will provide the `Wallet` component with state functions and variables that allow it to read and store the user's public key.

In the component, we'll simply check if `props.publicKey` exists or not. If it does not, we know that the public key hasn't yet been set, so we should provide a button that allows the user to request a connection to the Wallet.

```jsx
if (!props.publicKey) {
	return (
		<button onClick={() => requestConnection(props)}>
			Connect to Casper Wallet
		</button>
	);
}
```

If instead a public key does exist, we can provide another button that allows them to disconnect.

```jsx
else {
	return (
		<button onClick={() => disconnect(props)}>
			Disconnect from Casper Wallet
		</button>
	);
}
```

These buttons call `requestConnection` and `disconnect`, respectively. These functions don't yet exist, so let's write them now.

Outside of the component, create a new function `requestConnection(props)`:

```javascript
function requestConnection(props) {
  
}
```

Inside this function, call `requestConnection()` on the `provider` object in `props`. The `provider` object will be defined by us in *App.js* when we get to it, and is a reference to the Casper Wallet Provider which is injected into the browser by the Casper Wallet.

```javascript
props.provider.requestConnection().then(connected => {
    if (connected) {
      getActivePublicKey(props);
    }
});
```

`provider.requestConnection()` returns a `Promise`, which we can await using `.then`. Once the promise is resolved, it will return a boolean which I've appropriately named `connected`. If `connected` equals `true`, we'll forward execution to another function `getActivePublicKey`, which we'll write now.

Open up another function below your `requestConnection` function named `getActivePublicKey`:

```javascript
function getActivePublicKey(props) {
  
}
```

In this function we can use the `getActivePublicKey` method on the aforementioned `provider` in `props`:

```javascript
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
```

Which also returns a promise, resolving to the user's current active public key in their wallet. Once obtained, we can call `props.setPublicKey` to save it in React's state. `setPublicKey` is a custom React state setter function that we will define in *App.js*. If you're not familiar with React state, it is just a system built into React that allows you to store data in your current session. The data is stored client side and is forgotten when the user refreshes the page, but can be useful for keeping the information handy and using it later on in the app.

Below the `.then` block I've added `.catch`, which is for error handling. If an exception is thrown by `getActivePublicKey`, it will be caught in this code block. The way that the `getActivePublicKey` function is written, it will throw an error as an integer, which can be used to dissect what occurred.

Lastly, we'll write the `disconnect` function, which looks very similar to the `requestConnection` function, but instead requests a disconnect from the Casper Wallet. Upon successful disconnection, the React state public key is set to `null`.

```javascript
function disconnect(props) {
  props.provider.disconnectFromSite().then(disconnected => {
    if (disconnected) {
      props.setPublicKey(null);
    }
  });
}
```

That's it for the Wallet connection, which should operate properly now, assuming an installed and properly configured Casper Wallet.

Let's now move on to incrementing the count value stored in the smart contract.
Create a new file *Increment.jsx*.

Import the required classes from the Casper JavaScript SDK:

```javascript
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil } from "casper-js-sdk";
```

Set up a new component `Increment`:

```javascript
export default function Increment(props) {
  
}
```

To keep it simple, return a single button that calls the function `increment` when clicked. We'll write this function below the component definition:

```jsx
return <button onClick={() => increment(props)}>Increment</button>;
```

Now open up the new `increment` function, and make it asynchronous so we can use the `await` functionality, which halts execution as it waits for promises to resolve.

```javascript
async function increment(props) {
  
}
```

Begin the function by checking if `props.publicKey` exists.

```javascript
if (props.publicKey == null) {
  alert("No public key found, please connect to the Casper Wallet");
  return;
}
```

If it does not, simply `return` out of the function. We can also alert the user, so it doesn't appear that the button is doing nothing.

Next we need to instantiate a `ContractClient`, which allows us to build deploys for specific smart contracts.
Create the object, then set the smart contract hash:

```javascript
const contractClient = new Contracts.Contract();
contractClient.setContractHash("hash-");
```

Then we need to prepare a runtime arguments object. The `increment_count` entrypoint in the smart contract doesn't accept any runtime arguments, but we still need to prepare an empty set of them as the Casper JavaScript SDK expects a non-null object when creating a deploy:

```javascript
const args = RuntimeArgs.fromMap({});
```

Now we can build the deploy object, using a `ContractClient` object that we'll create in *App.js* and pass down through the props. `ContractClient` is a class available in the Casper JavaScript SDK, which we can build an object out of, and call the `callEntrypoint` function on:

```javascript
const deploy = contractClient.callEntrypoint(
	"increment_count",
	args,
	CLPublicKey.fromHex(props.publicKey),
	"casper-test",
	"1000000000" // 1 CSPR
);
```

The first argument is the entrypoint we intend to invoke, which is `increment_count`.
Next is the empty runtime arguments object.
Then a `CLPublicKey` object is needed, which can be prepared using the hexidecimal representation provided by the Casper Wallet and stored in `props.publicKey`.
Finally we provide the network, which is `"casper-test"`, since we are using the Casper testnet, and the gas payment, which is 1 CSPR, or 1 billion motes.

Note that we'll provide the smart contract hash when constructing the `contractClient` object in *App.js*.

We now have an unsigned deploy object, but it still needs signed by the user to be valid, so convert it to a JSON representation to prepare it for transport to the Casper Wallet:

```javascript
const deployJson = DeployUtil.deployToJson(deploy);
```

We can now use the `provider` again to request a signature from the Casper Wallet using the `sign` function:

```javascript
const result = await props.provider.sign(
	JSON.stringify(deployJson),
	props.publicKey
);
```

Alongside the stringified JSON deploy, we also provide the public key, so there is no ambiguity when signing; it ensures that the correct account is going to sign the deploy.

Check if the signature request was denied or canceled using:

```javascript
if (result.cancelled) {
	alert("Signature request cancelled.");
	return;
}
```

Then apply the new signature to the non-JSON deploy object:

```javascript
const signedDeploy = DeployUtil.setSignature(
	deploy,
	result.signature,
  CLPublicKey.fromHex(props.publicKey)
);
```

Convert this signed deploy into a JSON representation:

```javascript
const signedDeployJson = DeployUtil.deployToJson(signedDeploy);
```

Our deploy is ready to send to the Casper Network. This can't be done from the front-end though due to origin request security restrictions, so we have to forward the deploy to a backend, and have the backend server send the deploy out to a Casper Node.

Use the JavaScript `fetch` function to prepare a POST request to an API running on localhost. This API doesn't exist yet, but we'll prepare one using Node.js and the Express HTTP library:

```javascript
const response = await fetch("http://localhost:3001/deploy", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(signedDeployJson)
});
```

Now check the status of the response. If it doesn't return an HTTP status code in the 200 range, throw a new error:

```javascript 
if (!response.ok) {
	const errorMessage = await response.text();
	throw new Error(errorMessage);
}
```

If `response.ok` is `true`, `response.text()` will contain the deploy hash of the deploy. We could await the execution of the deploy, but for simplicity's sake, for this example, we will just log it out in the console:

```javascript
console.log(await response.text())
```

The only component left is that will query the value of the `count` variable in the smart contract.
Create a new file *Query.jsx* and set up the component just like we've been doing:

```javascript
export default function Query() {
  
}
```

We'll need a React state variable to store the current count, so import the `useState` hook from React:

```javascript
import { useState } from 'react';
```

Then set up a state variable on the first line of the your new component:

```javascript
const [count, setCount] = useState(0);
```

We provide  `0` as the default value, but we could also use `null` or another value.

Now we need a way to initiate the request for the current value from the blockchain. We could use a button for this, like we've been doing to initiate actions, but in this case we want to request to happen as soon as the view loads.
For this we can use the `useEffect` hook, that runs when the page loads or when state changes.

Add `useEffect` to your React import:

```javascript
import { useState, useEffect } from 'react';
```

Now set up the `useEffect` hook to call a new function `query` which we'll write next:

```javascript
useEffect(() => {
    query(setCount);
}, []);
```

Then simply return a textbox that shows the current count value

```jsx
return <h1>{ count }</h1>;
```

Now define the new asynchronous `query` function:

```javascript
async function query(setCount) {
  
}
```

All this function needs to do is initiate a GET request to the localhost backend using `fetch`. We can handle the logic for querying the smart contract in the backend:

```javascript
const response = await fetch(
  "http://localhost:3001/query"
);
```

Check if the response is `ok`. If it's not, throw an error,

```javascript
if (!response.ok) {
	const errorMessage = await response.text();
	throw new Error(errorMessage);
}
```

 but if it is, update the `count` using the `setCount` React state variable setter function:

```javascript
setCount(parseInt(await response.text()));
```

Once `setCount` runs, your UI will automatically update to the new count value.

Our components are finished. All that's left on the front-end is to prepare *App.js*, our root component that contains our custom functions and some necessary setup code.

Open *App.js*

Delete the example code from the `return` statement.

Import the `useState` hook from React

```javascript
import { useState } from 'react';
```

Then import all of your new components:

```javascript
import Wallet from "./Wallet";
import Increment from "./Increment";
import Query from "./Query";
```

Now before `return`, start by setting up the `publicKey` and `setPublicKey` React state variable and setter.

```javascript
const [publicKey, setPublicKey] = useState(null);
```

Then instantiate the Casper Wallet provider:

```jsx
if (window.CasperWalletProvider == null) {
  return <h1>Casper Wallet is not installed</h1>;
}

const provider = window.CasperWalletProvider();
```

If `window.CasperWalletProvider` is not available, we can safely assume that the Casper Wallet is not installed, and we can notify the user.

Now we can return the components. Add them like so:

```jsx
return (
  <>
  	<Query />
  	<Wallet />
  	<Increment />
  </>
);
```

Note the empty tag encapsulating the components. This is known as a "fragment" in React. Components, including *App.js*', can only return one element, so we must wrap our three elements in a fragment to make it "one" jsx element.

As you may remember though the components need access to some the variables we created above like provider and public key, so let's set these up as props:

```jsx
return (
  <>
  	<Query />
  	<Wallet provider={provider} publicKey={publicKey} setPublicKey={setPublicKey}/>
  	<Increment provider={provider} publicKey={publicKey}/>
  </>
);
```

These objects will then be available within the each component under the first argument of the component.

The front end is now complete so let's build out the backend using Node.js and Express.

If you're not familiar with Express, it's the most popular Node.js HTTP server, and is very simple to set up.

Create a new file in the root directory of your project: *server.js*

Start by importing Express, the Casper JS SDK, and CORS. If you haven't heard of CORS, it is an origin request handler, and necessary for assigning the proper HTTP headers to our deployments:

```javascript
const express = require("express");
const cors = require("cors");
const {
  CasperClient,
  Contracts,
  DeployUtil
} = require("casper-js-sdk");
```

Next, create an express app and tell it to use JSON request handling, as the deploy bodies will be received in JSON format:

```javascript
const app = express();
app.use(express.json());
app.use(cors());
```

Now create a `CasperClient` that will be used to send deploys, and create a `ContractClient` passing in the `CasperClient` as an argument:

```javascript
const client = new CasperClient("http://NODE_ADDRESS:7777/rpc");
const contract = new Contracts.Contract(client);

contract.setContractHash("hash-");
```

Get a valid node address and the smart contract hash from cspr.live.

We now need two HTTP endpoints: `deploy` and `query`.
Open up `deploy` first. All we'll do here is create a deploy object from the JSON request body, and use the `CasperClient` object to deploy it, sending the deploy hash back to the front-end:

```javascript
app.post("/deploy", async (req, res) => {
  try {
    const deploy = DeployUtil.deployFromJson(req.body).unwrap();
    const deployHash = await client.putDeploy(deploy);
    res.send(deployHash);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
```

This endpoint accepts POST requests only, as you'll see with `app.post`. Also, it's callback function is asynchronous,  so we can await the sending of the deploy to the Casper Network. If an error is caught, it sends that error as a 400 HTTP status containing the error message.

Lastly we need to open up a GET endpoint to query the value of `count`. Name this endpoint "query":

```javascript
app.get("/query", async (req, res) => {
  
});
```

In this function, we'll use the `queryContractData` function on the `ContractClient` object:

```javascript
try {
  const data = await contract.queryContractData(["count_key"]);
	res.send(data._hex);
} catch (error) {
	res.status(400).send(error.message);
}
```

By providing the named key `"count_key"` we can get the stored value, and can then just send it back to the front-end. The error handling looks the same as it does in `increment`.

Lastly just set the Express app to listen on port 3001:

```javascript
app.listen(3001, () => {
	console.log(`App listening on port 3001`);
});
```

Everything is now complete, so let's move on to testing. Head back to your terminal and run:

```bash
npm run start
```

Then open a new tab and run:

```bash
npm install cors express
```

and then:

```bash
node server.js
```
#   i n c r e m e n t  
 