const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const { getRole } = require("../utils");
const { getRootFromMT, generateMerkleProof } = require("../utils/merkleTree");

describe("Testeando ERC721", () => {
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

            var hasMinterRole = await contract.hasRole(MINTER_ROLE, owner.address);
            expect(hasMinterRole).to.be.true;

            var hasPauserRole = await contract.hasRole(PAUSER_ROLE, owner.address);
            expect(hasPauserRole).to.be.true;

            var hasUpgraderRole = await contract.hasRole(UPGRADER_ROLE, owner.address);
            expect(hasUpgraderRole).to.be.true;

        });

    });

    describe("Minteando", () => {
        it("Minteando Owner a Alice", async () => {
            var { contract, alice } = await loadFixture(loadTestingOne);

            await contract.safeMint(alice.address, 0);

            var balanceAlice = await contract.balanceOf(alice.address);
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

            var fueraDeRangoMal = 2222;
            await expect(
                contract.safeMint(owner.address, fueraDeRangoMal)
            ).to.be.revertedWith("tokenId no permitido para este metodo.");
        });

        it("Minteando con contrato pausado", async () => {
            var { contract, owner } = await loadFixture(loadTestingOne);

            await contract.pause();

            await expect(
                contract.safeMint(owner.address, 0)
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Minteando con whitelist", async function () {

            var { contract, owner, alice, bob } = await loadFixture(loadTestingOne);

            var elements = [
                { id: 1000, address: owner.address, },
                { id: 1001, address: alice.address, },
                { id: 1002, address: bob.address, },
            ];

            var root = getRootFromMT(elements);

            await contract.actualizarRaiz(root);

            var aliceProofs = generateMerkleProof(1001, alice.address);

            await contract.safeMintWhiteList(alice.address, 1001, aliceProofs);
        });

        it("Minteando sin whitelist", async function () {

            var { contract, owner, alice, bob } = await loadFixture(loadTestingOne);

            var elements = [
                { id: 1000, address: owner.address, },
                { id: 1001, address: alice.address, },
            ];

            var root = getRootFromMT(elements);

            await contract.actualizarRaiz(root);

            var bobProofs = generateMerkleProof(1001, bob.address);

            await expect(
                contract.safeMintWhiteList(bob.address, 1001, bobProofs)
            ).to.be.revertedWith("No eres parte de la lista");
        });

    });

    describe("Modifier - onlyRole(PAUSER_ROLE)", () => {

        it("Pausando sin rol PAUSER", async () => {
            var { contract, alice } = await loadFixture(loadTestingOne);

            var PAUSER_ROLE = getRole("PAUSER_ROLE");

            var aliceMinuscula = alice.address.toLowerCase();

            await expect(
                contract.connect(alice).pause()
            ).to.be.revertedWith(`AccessControl: account ${aliceMinuscula} is missing role ${PAUSER_ROLE}`);
        });

        it("Despausando sin rol PAUSER", async () => {
            var { contract, alice } = await loadFixture(loadTestingOne);

            var PAUSER_ROLE = getRole("PAUSER_ROLE");

            var aliceMinuscula = alice.address.toLowerCase();

            await expect(
                contract.connect(alice).unpause()
            ).to.be.revertedWith(`AccessControl: account ${aliceMinuscula} is missing role ${PAUSER_ROLE}`);
        });

        it("Otorgando rol PAUSER", async () => {
            var { contract, bob } = await loadFixture(loadTestingOne);

            var PAUSER_ROLE = getRole("PAUSER_ROLE");

            contract.grantRole(PAUSER_ROLE, bob.address);

            await expect(contract.connect(bob).pause());
        });

        it("Revocando rol PAUSER", async () => {
            var { contract, bob } = await loadFixture(loadTestingOne);

            var PAUSER_ROLE = getRole("PAUSER_ROLE");

            contract.grantRole(PAUSER_ROLE, bob.address);

            contract.revokeRole(PAUSER_ROLE, bob.address);

            var bobMinuscula = bob.address.toLowerCase();

            await expect(
                contract.connect(bob).pause()
            ).to.be.revertedWith(`AccessControl: account ${bobMinuscula} is missing role ${PAUSER_ROLE}`);
        });

    });

    describe("Quema con buyBack()", () => {

        it("Quema de token", async () => {

            var { contract, owner, alice, bob } = await loadFixture(loadTestingOne);

            var elements = [
                { id: 1000, address: owner.address, },
                { id: 1001, address: alice.address, },
                { id: 1002, address: bob.address, },
            ];

            var root = getRootFromMT(elements);

            await contract.actualizarRaiz(root);

            var aliceProofs = generateMerkleProof(1001, alice.address);

            await contract.safeMintWhiteList(alice.address, 1001, aliceProofs);

            await contract.connect(alice).buyBack(1001);
        
            var balanceAlice = await contract.balanceOf(alice.address);
            expect(balanceAlice).to.equal(0);
        });
        
        it("Quema de token fuera de rango", async () => {

            var { contract, alice } = await loadFixture(loadTestingOne);
            var tokenId = 222;
        
            await contract.safeMint(alice.address, tokenId);
        
            await expect(contract.connect(alice).buyBack(tokenId)).to.be.revertedWith(
                "tokenId no permitido para este metodo."
            );
        
            var tokenOwner = await contract.ownerOf(tokenId);
            expect(tokenOwner).to.equal(alice.address);
        });

        it("Quema de token sin ser owner", async () => {

            var { contract, owner, alice, bob } = await loadFixture(loadTestingOne);

            var elements = [
                { id: 1000, address: owner.address, },
                { id: 1001, address: alice.address, },
                { id: 1002, address: bob.address, },
            ];

            var root = getRootFromMT(elements);

            await contract.actualizarRaiz(root);

            var aliceProofs = generateMerkleProof(1001, alice.address);

            await contract.safeMintWhiteList(alice.address, 1001, aliceProofs);
        
            await expect(contract.connect(bob).buyBack(1001)).to.be.revertedWith(
                "ERC721: caller is not token owner or approved"
            );
        });

    });

});