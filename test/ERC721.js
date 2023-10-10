const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { getRole } = require("../utils");

describe("Testeando Contratos Inteligentes", () => {
    async function loadTestingOne() {

        var [owner, alice, bob, carl] = await ethers.getSigners();

        var Contract = await ethers.getContractFactory("CuyCollectionNft");

        var contract = await upgrades.deployProxy(Contract, ["CuyCollectionNft", "CUY"], { initializer: 'initialize', kind: 'uups' });
        //await contract.deployed();
        return { contract, owner, alice, bob, carl };
    }

    describe("Publicación", () => {
        it("Name y Symbol", async () => {

            var { contract } = await loadFixture(loadTestingOne);

            var name = "CuyCollectionNft";
            var symbol = "CUY";

            expect(await contract.name()).to.be.equal(name, "name() no coincide");
            expect(await contract.symbol()).to.be.equal(symbol, "symbol() no coincide");

        });

        it("Roles al desplegar - owner()", async () => {

            var { contract, owner } = await loadFixture(loadTestingOne);

            var MINTER_ROLE = getRole("MINTER_ROLE");
            var PAUSER_ROLE = getRole("PAUSER_ROLE");
            var UPGRADER_ROLE = getRole("UPGRADER_ROLE");

            const hasMinterRole = await contract.hasRole(MINTER_ROLE, owner.address);
            expect(hasMinterRole).to.be.true;

            const hasPauserRole = await contract.hasRole(PAUSER_ROLE, owner.address);
            expect(hasPauserRole).to.be.true;

            const hasUpgraderRole = await contract.hasRole(UPGRADER_ROLE, owner.address);
            expect(hasUpgraderRole).to.be.true;

        });

    });

    describe("Minteando", () => {
        it("Minteando Owner a Alice", async () => {
            var { contract, alice } = await loadFixture(loadTestingOne);
          
            await contract.safeMint(alice.address, 0);
          
            const balanceAlice = await contract.balanceOf(alice.address);
            expect(balanceAlice).to.equal(1);
        });

        it("Minteando sin rol MINTER", async () => {
            var { contract, alice } = await loadFixture(loadTestingOne);

            var MINTER_ROLE = getRole("MINTER_ROLE");

            var aliceMinuscula = alice.address.toLowerCase();
          
            await expect(
                contract.connect(alice).safeMint(alice.address, 0)
              ).to.be.revertedWith(`AccessControl: account ${aliceMinuscula} is missing role ${MINTER_ROLE}`);
        });

        it("Minteando tokenId fuera de rango", async () => {
            var { contract, owner } = await loadFixture(loadTestingOne);
        
            const fueraDeRangoMal = 2222; 
            await expect(
                contract.safeMint(owner.address, fueraDeRangoMal)
            ).to.be.revertedWith("tokenId no permitido para este metodo.");
        });

        it("Minteando con contrato pausado", async () => {
            var { contract, owner } = await loadFixture(loadTestingOne);
        
            await contract.pause({ from: owner.address });
        
            await expect(
                contract.safeMint(owner.address, 0)
            ).to.be.revertedWith("Pausable: paused");
        });
        

        
        
        
          
          



    });

});