const { ethers, upgrades } = require("hardhat");

// Address Contrato Proxy: 0x2622F196CFC6C539b8781d51441d30Cc1e7c862c

// Address de Impl 1 es: 0x3bd9BaCF6bF54320Bc311a01F24FF69630f0CD2E
// Address de Impl 2 es: 

async function main() {
    // obtener el codigo del contrato
    var UpgradeableToken = await ethers.getContractFactory("BBitesToken");
    // publicar el proxy
    var upgradeableToken = await upgrades.deployProxy(
        UpgradeableToken, 
        [], 
        {kind: "uups"},
    );
    // esperar a que se confirme el contrato
    var tx = await upgradeableToken.waitForDeployment();
    await tx.deploymentTransaction().wait(5);

    // obtenemos el address de implementacion
    var implementationAdd = await upgrades.erc1967.getImplementationAddress(await upgradeableToken.getAddress());

    console.log(`Address del Proxy es: ${await upgradeableToken.getAddress()}`);
    console.log(`Address de Impl es: ${implementationAdd}`);

    // Hacemos la verificacion del address de implementacion
    await hre.run("verify:verify", {
        address: implementationAdd,
        constructorArguments: [],
    });

}

async function upgrade() {
    const ProxyAddress = "0xDac21D8ACCE28CbDE744D6BAca8e704E5D5004F0";
    const OCTokenUpgradeableV2 = await ethers.getContractFactory("contracts/laboratorios/PublishUpgradeable2.sol:OCTokenUpgradeable");
    const ocTokenUpgradeableV2 = await upgrades.upgradeProxy(ProxyAddress, OCTokenUpgradeableV2);

    // esperar unas confirmaciones

    var implementationAddV2 = await upgrades.erc1967.getImplementationAddress(ProxyAddress);
    console.log(`Address del Proxy es: ${ProxyAddress}`);
    console.log(`Address de Impl es: ${implementationAddV2}`);

    await hre.run("verify:verify", {
        address: implementationAddV2,
        constructorArguments: [],
    });
}

main().catch((error) => {
    console.log(error);
    process.exitCode = 1;
});

// upgrade().catch((error) => {
//     console.log(error);
//     process.exitCode = 1;
// });