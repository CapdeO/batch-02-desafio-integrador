var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
 
const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");