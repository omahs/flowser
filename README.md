<div align="center">
	<br>
	<img alt="Flowser logo" src="https://flowser.dev/images/logo.svg" width="150" height="150">
	<h1>Flowser</h1>
	<p>
		<b>Easily start you local Flow network & inspect the state.</b>
	</p>
	<br>
	<br>
</div>

Flowser is a convenient development tool for [Flow blockchain](https://www.onflow.org/), which starts and indexes flow emulator or testnet blockchains.

For a quick walk-through of Flowser app, see our [video demo](https://www.youtube.com/watch?v=yMs5awvGnlY&t=417s).

## 📖 Contents

- [Get started](#-get-started)
- [Features](#-features)
- [Contributing](#-contributing)
- [Contributors](#%EF%B8%8F-contributors)
- [Credits](#-credits)

## 👋 Get started

### 1. Clone flowser repository

```bash
git clone https://github.com/onflowser/flowser
```

### 2. Install dependencies

You need to install Docker & docker-compose in order to run this app. 
See: [Docker installation instructions](https://www.docker.com/get-started)

### 3. Start flowser

This command will start Flowser with default configuration (recommended).

```bash
bash run.sh start

# or use npm if you have node installed
npm run prod:start
```

If flowser started successfully, you should see the bellow output:
```
Creating frontend-prod ... done
Creating database      ... done
Creating backend-prod  ... done
Creating dev-wallet    ... done
```

If you encounter any issues during app build or container start, check out our [Troubleshooting Guide](./docs/DEVELOPMENT.md#-troubleshooting).

### 4. Open in browser

After flowser had successfully started, you can open the app in your favourite browser at [http://localhost:6060](http://localhost:6060) 🥳.

Good job, you can now start flowsing around the flow blockchain 🏄.

## ✨ Features

### Flow emulator
Configure and run managed [flow emulator](https://github.com/onflow/flow-emulator) projects or start your own emulator instance on localhost.

### Inspect blockchain
Flowser allows you to inspect the current state of the flow blockchain.
Every new change is automatically detected and displayed in the UI.

You can view & search thought the following objects:
- **logs**
- **accounts**
- **blocks**
- **transactions**
- **contracts**
- **events**

### Dev wallet
Flowser natively supports [fcl-dev-wallet](https://github.com/onflow/fcl-dev-wallet) tool for developer convenience.
You can log in using a default service account and send arbitrary transaction directly within flowser UI.

### Rest API

Flowser backend exposes a Restfull API, which is defined in [`backend/openapi.json`](backend/openapi.json) file that conforms to [OpenAPI](https://www.openapis.org/) specification.

Learn how to import flowser open api specification to:
- [Postman](https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/)
- [Insomnia](https://docs.insomnia.rest/insomnia/import-export-data)

Check out [FEATURES.md](./docs/FEATURES.md) to get a complete list of features.

## 🚧 Caveats

### fcl-dev-wallet support
Flowser currently supports [fcl-dev-wallet](https://github.com/onflow/fcl-dev-wallet) integration only for "custom projects", where flow emulator is managed (started/stopped) by the flowser itself. 

We recommend that you do not run flow emulator by yourself and instead create a custom emulator configuration through the flowser app.

If you do want to run the emulator by yourself (from a shell with `flow emulator` command), please leave a comment or a "thumbs up" on [this issue](https://github.com/onflowser/flowser/issues/72).

## 💻 Contributing

If you have a feature suggestion/request, first go look through the [existing issues](https://github.com/onflowser/flowser/issues) and if you can't find a related feature [create a new one](https://github.com/onflowser/flowser/issues/new).

See [Development Guides](docs/DEVELOPMENT.md) for more info on setting up development environment, or [Architecture Overview](docs/ARCHITECTURE.md) for info about high level system architecture.

## ✌️ Contributors

- [`jgololicic`](http://github.com/jgololicic)
- [`bartolomej`](http://github.com/bartolomej)
- [`monikaxh`](http://github.com/monikaxh)

## 🙌 Credits

- [@bluesign](https://github.com/bluesign) - provided a useful [script](https://gist.github.com/bluesign/df24b31a61bf4cd11f88efb6edd78925) for indexing flow emulator db
