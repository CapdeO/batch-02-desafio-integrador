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

        it("Roles al desplegar", async () => {

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

        it("Probando SafeMint por owner", async () => {

            var { contract, owner } = await loadFixture(loadTestingOne);

            var MINTER_ROLE = getRole("MINTER_ROLE");
            var PAUSER_ROLE = getRole("PAUSER_ROLE");
            var UPGRADER_ROLE = getRole("UPGRADER_ROLE");

            const hasMinterRole = await contract.hasRole(MINTER_ROLE, owner.address);
            expect(hasMinterRole).to.be.true;
            expect(hasMinterRole).to.be.true;

        });




    });

});