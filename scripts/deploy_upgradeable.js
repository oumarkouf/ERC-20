async function main () {

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Token = await ethers.getContractFactory('MansaaToken');
    console.log('Deploying MansaaToken...');
    const token = await upgrades.deployProxy(Token, ['Mansaa', 'MAA', ethers.utils.parseEther("1000000000")], { initializer: 'initialize' });
    console.log("Token infos:", token.address, await token.name(), await token.symbol());
    const ownerBalance = await token.balanceOf(deployer.address);
    console.log(Number(ownerBalance));
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });