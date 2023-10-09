const { ethers, upgrades } = require("hardhat");

// Address Contrato Proxy: 0x740D08BE8D82440f9dcaD0d4a9E53e19376272BA

// Address de Impl 1 es: 0x678FC0a2aeDDFB5C8CAEb9Fe66c04d2Ff9B8779e
// Address de Impl 2 es: 

async function main() {
    // obtener el codigo del contrato
    var UpgradeableToken = await ethers.getContractFactory("CuyCollectionNft");

    const name = "CuyCollection";
    const symbol = "CUY";

    // publicar el proxy
    var upgradeableToken = await upgrades.deployProxy(
        UpgradeableToken, 
        [name, symbol], 
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
    const ProxyAddress = "0x678FC0a2aeDDFB5C8CAEb9Fe66c04d2Ff9B8779e";
    const OCTokenUpgradeableV2 = await ethers.getContractFactory("BBitesToken");
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