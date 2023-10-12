var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
 
const { getRole } = require("../utils");

const factoryArtifact = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const pairArtifact = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json');

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;

describe("Testeando PublicSale", () => {
    async function loadTest() {

        var [owner, alice, bob, carl] = await ethers.getSigners();

        var Factory = new ethers.ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, owner);
        var factory = await Factory.deploy(owner.address);

        var USDC = await ethers.getContractFactory("USDCoin");
        var usdc = await USDC.deploy();

        // var ContractUniswapRouter = await ethers.getContractFactory("UniswapV2Router02");
        // var ContractTokenBBTKN    = await ethers.getContractFactory("BBitesToken");
        
        // var ContractPublicSale    = await ethers.getContractFactory("PublicSale");

        // var contract = await upgrades.deployProxy(ContractPublicSale, ["CuyCollectionNft", "CUY"], { initializer: 'initialize', kind: 'uups' });
        
        return { factory, usdc, owner, alice, bob, carl };


    }

    describe("Publicación", () => {
        it("Name y Symbol", async () => {

            var { factory, usdc } = await loadFixture(loadTest);

            console.log('Factory: ', factory.target);
            console.log('USDC: ', usdc.target);

        });

    });


});