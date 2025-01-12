//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract MansaaToken is Ownable, ERC20, ERC20Burnable {

    constructor(string memory _name, string memory _symbol, uint _totalSupply) ERC20(_name, _symbol) {
        _mint(_msgSender(),_totalSupply);
    }
}
