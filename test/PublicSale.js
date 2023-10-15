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
        var Weth = new ethers.ContractFactory(WETH9.abi, WETH9.bytecode, owner);
        var weth = await Weth.deploy();
        await factory.createPair(bbtkn.target, usdc.target);
        var pairAddress = await factory.getPair(bbtkn.target, usdc.target);
        var pair = new ethers.Contract(pairAddress, pairArtifact.abi, owner);
        var Router = new ethers.ContractFactory(routerArtifact.abi, routerArtifact.bytecode, owner);
        var router = await Router.deploy(factory.target, weth.target);
        await bbtkn.approve(router, bbtkn.balanceOf(owner));
        await usdc.approve(router, usdc.balanceOf(owner));
        await router.addLiquidity(
            bbtkn.target,
            usdc.target,
            bbtkn.balanceOf(owner),
            usdc.balanceOf(owner),
            0,
            0,
            owner,
            Math.floor(Date.now()/1000 + (10*60))
        )
        var ContractPublicSale = await ethers.getContractFactory("PublicSale");
        var contractPublicSale = await upgrades.deployProxy(ContractPublicSale, [bbtkn.target, usdc.target, router.target], { initializer: 'initialize', kind: 'uups' });
        return { bbtkn, usdc, contractPublicSale, owner, alice, bob, carl };
    }

    describe("purchaseWithTokens", () => {
        it("Compra y evento", async () => {
            var { bbtkn, contractPublicSale, owner } = await loadFixture(loadTest);
            var tokenId = 500;
            var price = await contractPublicSale.getPriceForId(tokenId);
            await bbtkn.mint(owner, price);
            await bbtkn.approve(contractPublicSale.target, price);

            await expect(contractPublicSale.purchaseWithTokens(tokenId))
                .to.emit(contractPublicSale, 'PurchaseNftWithId')
                .withArgs(owner.address, tokenId);

            var mintedNFTs = await contractPublicSale.getMintedNFTs();
            var mintedNFTsAsNumbers = mintedNFTs.map((item) => Number(item));
            expect(mintedNFTsAsNumbers).to.include(tokenId);
        });

        it("Token ID fuera de rango", async () => {
            var { contractPublicSale } = await loadFixture(loadTest);
            var tokenId = 700;

            await expect(
                contractPublicSale.purchaseWithTokens(tokenId)
            ).to.be.revertedWith("Token ID fuera de rango.");
        });

        it("Token ID ya existente", async () => {
            var { bbtkn, contractPublicSale, owner, alice } = await loadFixture(loadTest);
            var tokenId = 222;
            var price = await contractPublicSale.getPriceForId(tokenId);
            await bbtkn.mint(owner, price);
            await bbtkn.approve(contractPublicSale.target, price);
            await contractPublicSale.purchaseWithTokens(tokenId);

            await expect(
                contractPublicSale.connect(alice).purchaseWithTokens(tokenId)
            ).to.be.revertedWith("Token ID ya existente.");
        });

    });

    describe("purchaseWithUSDC", () => {
        it("Compra y evento", async () => {
            var { bbtkn, contractPublicSale, owner } = await loadFixture(loadTest);
            var tokenId = 500;
            var price = await contractPublicSale.getPriceForId(tokenId);
            await bbtkn.mint(owner, price);
            await bbtkn.approve(contractPublicSale.target, price);

            await expect(contractPublicSale.purchaseWithTokens(tokenId))
                .to.emit(contractPublicSale, 'PurchaseNftWithId')
                .withArgs(owner.address, tokenId);

            var mintedNFTs = await contractPublicSale.getMintedNFTs();
            var mintedNFTsAsNumbers = mintedNFTs.map((item) => Number(item));
            expect(mintedNFTsAsNumbers).to.include(tokenId);
        });

        it("Token ID fuera de rango", async () => {
            var { contractPublicSale } = await loadFixture(loadTest);
            var tokenId = 700;

            await expect(
                contractPublicSale.purchaseWithTokens(tokenId)
            ).to.be.revertedWith("Token ID fuera de rango.");
        });

        it("Token ID ya existente", async () => {
            var { bbtkn, contractPublicSale, owner, alice } = await loadFixture(loadTest);
            var tokenId = 222;
            var price = await contractPublicSale.getPriceForId(tokenId);
            await bbtkn.mint(owner, price);
            await bbtkn.approve(contractPublicSale.target, price);
            await contractPublicSale.purchaseWithTokens(tokenId);

            await expect(
                contractPublicSale.connect(alice).purchaseWithTokens(tokenId)
            ).to.be.revertedWith("Token ID ya existente.");
        });

    });


});