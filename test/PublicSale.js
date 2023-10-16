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
        var PublicSale = await ethers.getContractFactory("PublicSale");
        var publicSale = await upgrades.deployProxy(PublicSale, [bbtkn.target, usdc.target, router.target], { initializer: 'initialize', kind: 'uups' });
        return { bbtkn, usdc, router, publicSale, pair, owner, alice, bob, carl };
    }

    describe("purchaseWithTokens", () => {
        it("Compra y evento", async () => {
            var { bbtkn, publicSale, owner } = await loadFixture(loadTest);
            var tokenId = 500;
            var price = await publicSale.getPriceForId(tokenId);
            await bbtkn.mint(owner, price);
            await bbtkn.approve(publicSale.target, price);

            await expect(publicSale.purchaseWithTokens(tokenId))
                .to.emit(publicSale, 'PurchaseNftWithId')
                .withArgs(owner.address, tokenId);

            var mintedNFTs = await publicSale.getMintedNFTs();
            var mintedNFTsAsNumbers = mintedNFTs.map((item) => Number(item));
            expect(mintedNFTsAsNumbers).to.include(tokenId);
        });

        it("Token ID fuera de rango", async () => {
            var { publicSale } = await loadFixture(loadTest);
            var tokenId = 700;

            await expect(
                publicSale.purchaseWithTokens(tokenId)
            ).to.be.revertedWith("Token ID fuera de rango.");
        });

        it("Token ID ya existente", async () => {
            var { bbtkn, publicSale, owner, alice } = await loadFixture(loadTest);
            var tokenId = 222;
            var price = await publicSale.getPriceForId(tokenId);
            await bbtkn.mint(owner, price);
            await bbtkn.approve(publicSale.target, price);
            await publicSale.purchaseWithTokens(tokenId);

            await expect(
                publicSale.connect(alice).purchaseWithTokens(tokenId)
            ).to.be.revertedWith("Token ID ya existente.");
        });

    });

    describe("purchaseWithUSDC", () => {
        it("Compra y evento", async () => {
            var { usdc, publicSale, pair, owner } = await loadFixture(loadTest);
            var tokenId = 0;
            await usdc.mint(owner, 20000000000);
            var priceUSDC =  await publicSale.getAmountIn(tokenId);
            //var priceUSDC =  500000000000;

            
            await usdc.approve(publicSale.target, priceUSDC);
            var reserves = await pair.getReserves();

            // console.log('priceUSDC: ', priceUSDC);
            
            // var saldoOwnerUSDC = await usdc.balanceOf(owner.address);
            // console.log('saldoOwner: ', saldoOwnerUSDC);

            // var allowance = await usdc.allowance(owner.address, publicSale.target);
            // console.log('allowance: ', allowance);


            // console.log(reserves);
            //await publicSale.purchaseWithUSDC(tokenId, 2000000000);
            // console.log(reserves);
        });

        it("Swap", async () => {
            var { usdc, bbtkn, pair, router, owner } = await loadFixture(loadTest);
            var reserves;
            var cantidad = "2000000000"; // 2000 USDC
            var cantidadRecibir = "1000000000000000000"; // 1 BBTKN
            await usdc.mint(owner, cantidad);
            await usdc.approve(router.target, cantidad);

            var path = [usdc.target, bbtkn.target];

            await showBalance(usdc, owner.address)
            await showBalance(bbtkn, owner.address)
            reserves = await pair.getReserves();
            console.log('Reserves: ', reserves)
            
            await router.swapTokensForExactTokens(
                cantidadRecibir,
                cantidad,
                path,
                owner.address,
                90000000000
            );
            console.log('---- SWAP ----')
            await showBalance(usdc, owner.address)
            await showBalance(bbtkn, owner.address)
            reserves = await pair.getReserves();
            console.log('Reserves: ', reserves)
            
            await router.swapTokensForExactTokens(
                cantidadRecibir,
                cantidad,
                path,
                owner.address,
                90000000000
            );

            console.log('---- SWAP ----')
            await showBalance(usdc, owner.address)
            await showBalance(bbtkn, owner.address)
            showReserves(pair)

        });

        // -----------------------------------------------------------------------------------

        async function showBalance(token, address) {
            var balance = await token.balanceOf(address)
            var name = await token.name()
            var decimals = await token.decimals()

            const balanceString = ethers.formatUnits(balance, decimals);

            // Agrega una coma para representar los decimales
            const balanceWithComma = balanceString.replace(/(\d)(?=(\d{3})+(\.\d+)?$)/g, "$1,");

            console.log(`Balance en ${name}: ${balanceWithComma}`);
        }

        async function showReserves(pair) {
            var reserves = await pair.getReserves()
            console.log('Pool BBTKN/USDC -> ', reserves[0], '/', reserves[1])
        }

    });


});