const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Testeando Contratos Inteligentes", () => {
    async function loadTestingOne() {

        var Contract = await ethers.getContractFactory("CuyCollectionNft");

        var contract = await upgrades.deployProxy(Contract, ["CuyCollectionNft", "CUY"], { initializer: 'initialize', kind: 'uups'});
        //await contract.deployed();
        return { contract };
    }

    describe("Publicación", () => {
        it("Se publicó sin errores y con valores correctos", async () => {

            var { contract } = await loadFixture(loadTestingOne);

            var name = "CuyCollectionNft";
            var symbol = "CUY";
        
            expect(await contract.name()).to.be.equal(name, "name() no coincide");
            expect(await contract.symbol()).to.be.equal(symbol, "symbol() no coincide");

        });
    });

});