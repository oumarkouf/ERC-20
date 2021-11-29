import { expect } from "chai";
import { ethers } from "hardhat";

describe("Token", function () {
  it("Should return the new Token once deployed", async function () {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("TestToken", "TST", ethers.utils.parseEther("1000000"));
    await token.deployed();

    expect(await token.name()).to.equal("TestToken");
    expect(await token.symbol()).to.equal("TST");
    expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("1000000"));

  });
});
