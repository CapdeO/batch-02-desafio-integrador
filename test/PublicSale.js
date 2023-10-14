var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers, upgrades } = require("hardhat");
 
const { getRole } = require("../utils");

const factoryArtifact = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const pairArtifact = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json');

const WETH9 = require('../WETH9.json');

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;

describe("Testeando PublicSale", () => {
    async function loadTest() {

        var [owner, alice, bob, carl] = await ethers.getSigners();

        var Factory = new ethers.ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, owner);
        var factory = await Factory.deploy(owner.address);

        var BBTKN = await ethers.getContractFactory("BBitesToken");
        var bbtkn = await upgrades.deployProxy(BBTKN, [], {kind: "uups"});

        var USDC = await ethers.getContractFactory("USDCoin");
        var usdc = await USDC.deploy();

        var createPair = await factory.createPair(bbtkn.target, usdc.target);

        var pairAddress = await factory.getPair(bbtkn.target, usdc.target);

        var pair = new ethers.Contract(pairAddress, pairArtifact.abi, owner);
        var reserves;

        var Weth = new ethers.ContractFactory(WETH9.abi, WETH9.bytecode, owner);
        var weth = await Weth.deploy();

        var Router = new ethers.ContractFactory(routerArtifact.abi, routerArtifact.bytecode, owner);
        var router = await Router.deploy(factory.target, weth.target);

        await bbtkn.approve(router, bbtkn.balanceOf(owner));
        await usdc.approve(router, usdc.balanceOf(owner));

        var deadline = Math.floor(Date.now()/1000 + (10*60));

        await router.addLiquidity(
            bbtkn.target,
            usdc.target,
            bbtkn.balanceOf(owner),
            usdc.balanceOf(owner),
            0,
            0,
            owner,
            deadline
        )
        reserves = await pair.getReserves();
        //console.log('Reservas del Pool: ', reserves);
        
        // var ContractPublicSale    = await ethers.getContractFactory("PublicSale");

        // var contract = await upgrades.deployProxy(ContractPublicSale, ["CuyCollectionNft", "CUY"], { initializer: 'initialize', kind: 'uups' });
        
        return { factory, bbtkn, usdc, router, owner, alice, bob, carl };
    }

    describe("Publicación", () => {
        it("Despliegues y Pool", async () => {

            var { factory, usdc, bbtkn, router, owner, alice } = await loadFixture(loadTest);

            //console.log('Factory: ', factory.target);
            //console.log('USDC: ', usdc.target);
            //console.log('BBTKN: ', bbtkn.target);
            //console.log('RouterAddress: ', router.target);
            




        });

    });


});