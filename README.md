## 🗄 Project description, structure and functionalities

Bridge Backend: https://github.com/ilchovski98/ERC20-bridge-backend
Bridge Smart Contract: https://github.com/ilchovski98/ERC20-bridge-smart-contract

Project uses [React.js](https://reactjs.org/) and it's bootstraped via [Create React app](https://create-react-app.dev/).

**Folders and files**

- `.vscode` - Some VSCode settings
- `public` - Public folder for assets like fonts and images
- `src` - Source code for the app, here is all the logic and functionalities
  - `abi` - Compiled json files by the contracts, used for contract interaction with `ethers.js`
  - `components` - React.js component files containing logic for specific behaviours, see more detials below
  - `hooks` - React hooks containing functionalities that will be used on multiple places across the app and provide easy interface
  - `pages` - Pages components defining the high level app information architecture
  - `services` - Ready methods for the interaction with api endpoints and gathering blockchain data
  - `style` - `scss` styling files, see more details below
  - `utils` - some helpers functions
  - `config.js` - hardcoded values for the used chains and ERC20 tokens
  - `index.js` - initial point for boostraping the react.js project

For styling the app, we use sightly extended Bootstrap 5 version with scss. All the needed style variables are in `src/style/_variables.scss` and new styles can be added in `src/style/components`

## Porject Startup
1. Create .env file according to the .env.example
2. Add your desired hardcoded values in src/config.js for your desired tokens and chains
3. Run yarn start
