// scripts/transfer-ownership.js
async function main () {
    const gnosisSafe = '0xDF314840B78CC3bff8c31Eae28aD0487ac09eA23';
    console.log('Transferring ownership of Mansaa Token...');
    await token.transferOwnership(gnosisSafe);
    console.log('Transferred ownership of Mansaa Token to:', gnosisSafe);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });