require("dotenv").config();
var { ethers } = require("hardhat");

async function main() {
    var name = "USDCoin";
    var symbol = "USDC";
    const USDCoin = await ethers.deployContract("USDCoin");
    console.log(`Address deployed: ${await USDCoin.getAddress()}`);
  
    var res = await USDCoin.waitForDeployment();
    await res.deploymentTransaction().wait(5);
  
    await hre.run("verify:verify", {
      address: await USDCoin.getAddress(),
      constructorArguments: [],
      contract: "contracts/USDCoin.sol:USDCoin",
    });
}


main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
