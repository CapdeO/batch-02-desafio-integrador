const { ethers } = require("hardhat");
const { expect } = require("chai");

// carga mis contratos a memori y limpialos
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Testeando Contratos Inteligentes", () => {
    // Guardar en memoria (durante testing) y limpiar
    async function loadTestingOne() {
        // consultar una lista de signers de prueba
        // estos signers se pueden convertir en msg.sender en el contrato
        var [owner, alice, bob, carl] = await ethers.getSigners();

        // creando una referencia del contrato inteligente
        var TestingOne = await ethers.getContractFactory("USDCoin");

        // testingOne es el contrato "publicado"
        var testingOne = await TestingOne.deploy();

        return { testingOne, owner, alice, bob, carl };
    }

    describe("Publicación", () => {
        it("Se publicó sin errores y con valores correctos", async () => {
            // cargando los contratos
            var { testingOne } = await loadFixture(loadTestingOne);

            var symbol = "USDC";

            expect(await testingOne.symbol()).to.be.equal(symbol, "Symbol no coincide");
            expect(await testingOne.decimals()).to.be.equal(6, "Decimals no coincide");
        });
    });

    // npx hardhat test test/primerTest.js
});