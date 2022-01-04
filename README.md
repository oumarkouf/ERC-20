# Simple Typescript ERC20 Project
tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deploy_upgradeable.js --network bsctestnet
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```
* Old Contract : 

https://testnet.bscscan.com/token/0xf849b12cdc683fcbdb1b58da11203814775a1d17
https://testnet.ftmscan.com/address/0x699889290f4fd07cbe4c7758bc5b051144bceb27#code

* Upgradeable Contract:

https://testnet.bscscan.com/address/0xc1265a9ea959bfe3867559542571d5b42bc85984
