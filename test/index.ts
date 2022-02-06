import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { any } from "hardhat/internal/core/params/argumentTypes";
import { MansaaToken } from "../typechain";

describe("Token", function () {
  let Token;
  let token: any;
  let owner: { address: string; };
  let addr1: any;
  let addr2: { address: string; };
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.        
    Token = await ethers.getContractFactory("MansaaToken");
    [owner, addr1, addr2, ... addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    token = await Token.deploy("TestToken", "TST", ethers.utils.parseEther("1000000"));
  });

  describe("Token contract", function () {
    it("Should return the new Token once deployed and Deployment should assign the total supply of tokens to the owner", async function () {

      expect(await token.name()).to.equal("TestToken");
      expect(await token.symbol()).to.equal("TST");
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
      console.log(ownerBalance);
      });
    });

  describe("Token TransferOwnership", function () {
    it("Should transferOwnership to new owner", async function () {
      const prevOwner = await token.owner(); 
      await token.transferOwnership(addr1.address); 
      const newOwner = await token.owner();
      expect(prevOwner).to.not.equal(newOwner);
      });
    });
    
  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await token.transfer(addr1.address, 50);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await token.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await token.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await token.transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await token.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.toNumber() - 150);

      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});

/* describe("MultiSig", function() {

  let signers: SignerWithAddress[];
  let multisig: Multisig;
  let token: Token;
  let multisigSigners: string[];
  const reqApprovals = 2;
  //let owner,addr1,addr2,addrs: any;

  async function transferContract() {
    const prevOwner = await token.owner(); // should be the deployer
    await token.transferOwnership(await multisig.address); // execute on target contract first
    const newOwner = await token.owner(); // should be the multisig
    return { prevOwner, newOwner };
  }

  beforeEach(async function () {
    signers = await ethers.getSigners();
    multisigSigners = [signers[0].address, signers[1].address, signers[2].address];
    
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("TestToken", "TST", ethers.utils.parseEther("1000000"));
    const Multisig = await ethers.getContractFactory("Multisig");
    multisig = await Multisig.deploy(multisigSigners, reqApprovals);
  });

  it("should have correct numbers of signers", async () => {
    const owners = [];
    for (let i = 0; i < multisigSigners.length; i++) {
      const owner = await multisig.signers(i);
      owners.push(owner);
    }
    const reqSignatures = await multisig.numApprovalsRequired();
    expect(Number(reqSignatures)).to.eq(2);
    expect(await multisig.signers(0)).to.eq(signers[0].address);
    expect(await multisig.signers(1)).to.eq(signers[1].address);
    expect(await multisig.signers(2)).to.eq(signers[2].address);
  });

  it("should transfer ownership of targetContract", async () => {
    const { prevOwner, newOwner } = await transferContract();

    await multisig.requestTransferOwnership(
      token.address,
      signers[1].address
    );

    // the signer2 must approve the proposal
    await multisig.connect(signers[2]).approveProposal(0)


    //await multisig.approveProposal(0); in comment because the contract has already approve the proposal
    await multisig.executeRemoteProposal(0);

    const currentOwner = await token.owner(); // should be signer[1]

    expect(prevOwner).to.not.eq(newOwner);
    expect(newOwner).to.eq(multisig.address);
    expect(currentOwner).to.eq(signers[1].address);
  });

  it("should not create proposal by invalid signer", async () => {
    await transferContract();
    try {
      await multisig
        .connect(signers[2])
        .requestTransferOwnership(token.address, signers[1].address);
    } catch (e: any) {
      expect(e.message).includes("Not A Signer");
    }
  });

  it("should withdraw specific token from target and be able to send to a receiver", async () => {
    //await transferContract();
    console.log(await token.owner(), await multisig.getSigners());
    await multisig.requestTokenWithdrawalOnTarget(
      signers[0].address,
      token.address
    );
    // await multisig.approveProposal(0);
    await multisig.connect(signers[2]).approveProposal(0)
    await multisig.executeRemoteProposal(0);

    const amount = ethers.utils.parseUnits("0.1", 1);
    console.log(Number(amount));

    await multisig.requestTokenTransfer(
      token.address,
      signers[3].address,
      amount
    );

    const prevBal = await token.balanceOf(signers[3].address);

    // await multisig.approveProposal(1);
    await multisig.connect(signers[2]).approveProposal(1)
    await multisig.executeMultisigProposal(1);

    const newBal = await token.balanceOf(signers[3].address);

    expect(Number(prevBal)).to.eq(0);
    expect(Number(newBal)).to.eq(Number(amount));
  });

});
 */