## 📌 Prerequisites

If you are Windows user please consider using a proper [terminal app](https://hyper.is/).

[Node.js](https://nodejs.org/en/) is required to install dependencies and run project.

Recommended Node.js version: `18.13.0`

If you use another version, please use [n](https://github.com/tj/n) to manage.

Optionally [Yarn](https://classic.yarnpkg.com/lang/en/docs/install) could be used instead of `npm`.

For optimal developer friendly experience use [Visual Studio Code](https://code.visualstudio.com/) and install the following plugins:

- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) - High level code formatter
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - More customisable code formatter
- [ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets) - React code snippets and autocomplete

A Web3 wallet is required as well. In our case we use [Metamask](https://metamask.io/). Project contracts are deployed at [Sepolia test network](https://metamask.zendesk.com/hc/en-us/articles/360059213492-ETH-on-Sepolia-and-Goerli-networks-testnets-) so please [change](https://medium.com/@mwhc00/how-to-enable-ethereum-test-networks-on-metamask-again-d7831da23a09) to that network in Metamask.

## ⚙️ Install dependencies

```shell
yarn
```

or

```shell
npm i
```

## 🚀 Available Scripts

In the project directory, you can run:

```shell
yarn start
```

or

```shell
npm start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🗄 Project description, structure and functionalities

Project uses [React.js](https://reactjs.org/) and it's bootstraped via [Create React app](https://create-react-app.dev/).

**Folders and files**

- `.vscode` - Some VSCode settings
- `public` - Public folder for assets like fonts and images
- `src` - Source code for the app, here is all the logic and functionalities
  - `abi` - Compiled json files by the contracts, used for contract interaction with `ethers.js`
  - `components` - React.js component files containing logic for specific behaviours, see more detials below
  - `pages` - Pages components defining the high level app information architecture
  - `style` - `scss` styling files, see more details below
  - `utils` - some helpers functions
  - `index.js` - initial point for boostraping the react.js project

For styling the app, we use sightly extended Bootstrap 5 version with scss. All the needed style variables are in `src/style/_variables.scss` and new styles can be added in `src/style/style.scss`
