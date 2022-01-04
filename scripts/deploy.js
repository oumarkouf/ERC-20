async function main() {
    const [deployer, addr1, addr2, addr3] = await ethers.getSigners();

    //multisigwalletSigners = ["0xa6f757d93d43b51efb2994f7e4dd56af3274d6f7","0x1E0A68736766CE36D23040D9Bfb2710Bb1Dc48C6"];
  
    console.log("Deploying contracts with the account:", deployer.address);
    
    //console.log("multisigwalletSigners", multisigwalletSigners);

    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("MansaaToken", "MAA", ethers.utils.parseEther("1000000000"));
  
    console.log("Token infos:", token.address, await token.name(), await token.symbol());
    const ownerBalance = await token.balanceOf(deployer.address);
    console.log(ethers.utils.formatUnits(ownerBalance, 18));

/*     const Multisig = await ethers.getContractFactory("MultiSigWallet");
    const multisig = await Multisig.deploy(multisigwalletSigners,2);

    await multisig.deployed();

    console.log("Multisig deployed to:", multisig.address); */
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });