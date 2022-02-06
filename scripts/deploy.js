async function main() {
    const [deployer, addr1, addr2, addr3] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const Token = await ethers.getContractFactory("MansaaToken");
    const token = await Token.deploy("MansaaToken", "MAA", ethers.utils.parseEther("1000000000"));
  
    console.log("Token infos:", token.address, await token.name(), await token.symbol());
    const ownerBalance = await token.balanceOf(deployer.address);
    console.log(ethers.utils.formatUnits(ownerBalance, 18));

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });