//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";

contract MansaaToken is ERC20Upgradeable, OwnableUpgradeable, ERC20BurnableUpgradeable  {

    function initialize(string memory _name, string memory _symbol, uint _totalSupply) public initializer {
        __ERC20_init(_name,_symbol);
        _mint(_msgSender(),_totalSupply);
    }
}