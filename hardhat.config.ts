import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@openzeppelin/hardhat-defender";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "👩🕵👨🙋👷 Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  

  for (const account of accounts) {
    console.log(account.address);
  }
  console.log("👩🕵 👨🙋👷 these accounts only for localhost network.");
  console.log('To see their private keys🔑🗝 when you run "npx hardhat node."');
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "localhost",
  defender: {
    apiKey: process.env.DEFENDER_TEAM_API_KEY !== undefined ? process.env.DEFENDER_TEAM_API_KEY : "",
    apiSecret: process.env.DEFENDER_TEAM_API_SECRET_KEY !== undefined ? process.env.DEFENDER_TEAM_API_SECRET_KEY : ""
  },
  networks: {
    localhost: {
      chainId: 31337,
      url: "http://127.0.0.1:8545"
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/9FyK5SOdqNsh1wj_ELD5_3UmST-SEbtU",
      accounts: 
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    bsctestnet: {
      url: process.env.BSCTESTNET_URL,
      chainId: 97,
      gasPrice: 20000000000,
      accounts: 
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    bsc: {
      url: process.env.BSC_URL,
      chainId: 56,
      gasPrice: 20000000000,
      accounts: 
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ftmtestnet: {
      url: process.env.FTM_TESTNET_URL,
      chainId: 4002,
      gasPrice: 20000000000,
      accounts: 
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
