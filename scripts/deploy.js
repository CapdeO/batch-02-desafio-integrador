require("dotenv").config();

const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

const { getRootFromMT } = require("../utils/merkleTree");
const factoryArtifact = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const pairArtifact = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json');

var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");

// Mumbai
var contractCuy;
var addressCuyProxy;
var addressCuyImpl;

// Goerli
const UniswapV2RouterAddress  = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const UniswapV2FactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
var pairAddress;
var contractUSDC;
var addressUSDC;
var contractBBTKNProxy;
var addressBBTKNProxy;
var contractBBTKNImpl;
var addressBBTKNImpl;
var contractPublicSaleProxy;
var addressPublicSaleProxy;
var contractPublicSaleImpl;
var addressPublicSaleImpl;

// Publicar NFT en Mumbai
async function Mumbai() {
  var relAddMumbai; // relayer mumbai

  // let name = "CuyCollection";
  // let symbol = "CUY";
  // contractCuy      = await deploySC("CuyCollectionNft", [name, symbol])
  // addressCuyProxy  = await contractCuy.getAddress()
  // addressCuyImpl   = await printAddress("CuyCollectionNft", addressCuyProxy)

  // await verify(addressCuyImpl, "CuyCollectionNft", [])

  addressCuyProxy = '0xEF6B0853851986f27b3D75Fc450d6aD252BE7B49'
  addressCuyImpl  = '0x4C18ea1F6fE4787EdEfc3AEA790dd0dAD0974132'

  contractCuy = await ethers.getContractAt("CuyCollectionNft", addressCuyProxy)

}

async function Goerli() {
  // var relAddGoerli; // relayer goerli

  // -------------------------------------------------------------------------------   DEPLOY
  // contractUSDC            = await deploySCNoUp("USDCoin")
  // addressUSDC             = await contractUSDC.getAddress()
  // contractBBTKNProxy      = await deploySC("BBitesToken")
  // addressBBTKNProxy       = await contractBBTKNProxy.getAddress()
  // contractBBTKNImpl       = await printAddress("BBitesToken", addressBBTKNProxy)
  // contractPublicSaleProxy = await deploySC("PublicSale", [addressBBTKNProxy, addressUSDC, UniswapV2RouterAddress])
  // addressPublicSaleProxy  = await contractPublicSaleProxy.getAddress()
  // contractPublicSaleImpl  = await printAddress("PublicSale", addressPublicSaleProxy)

  addressUSDC              = '0xFc1382C1A46891C24e3d7C9f4d9b9B37e3C07641'      
  addressBBTKNProxy        = '0xA25Ca4AFA3738F7c5F3816C14A3cDE6B966A9cEf'
  addressBBTKNImpl         = '0xdADf53cEAbff7c4a490757EC6fFcbF5E174d7A9e'
  addressPublicSaleProxy   = '0xADB2eb6539d88de10985AF4071fC591fA1DDC179'
  addressPublicSaleImpl    = '0x2F23fCB7927C83f6b72189e4CEa5A0d4dc403BB0'
  pairAddress              = '0x28f4A7535114015E4CE78581127d165457055E34'
  
  // -------------------------------------------------------------------------------   VERIFY
  // await verify(addressUSDC, "USDCoin", [])
  // await verify(addressBBTKNImpl, "BBTKNImpl", [])
  // await verify(addressPublicSaleImpl, "PublicSaleImpl", [])

  // -------------------------------------------------------------------------------   LIQ POOL
  // var [deployer] = await ethers.getSigners()
  // contractBBTKNProxy = await ethers.getContractAt("BBitesToken", addressBBTKNProxy)
  // contractUSDC       = await ethers.getContractAt("USDCoin", addressUSDC)
  // var UniswapV2Factory = new ethers.Contract(UniswapV2FactoryAddress, factoryArtifact.abi, deployer)
  // await UniswapV2Factory.createPair(addressBBTKNProxy, addressUSDC)
  // pairAddress = await UniswapV2Factory.getPair(addressBBTKNProxy, addressUSDC)
  // var pair = new ethers.Contract(pairAddress, pairArtifact.abi, deployer)
  // var router = new ethers.Contract(UniswapV2RouterAddress, routerArtifact.abi, deployer)
  // var balanceTokenA = await contractBBTKNProxy.balanceOf(deployer.address)
  // var balanceTokenB = await contractUSDC.balanceOf(deployer.address)
  // await contractBBTKNProxy.approve(router, balanceTokenA);
  // await contractUSDC.approve(router, balanceTokenB);
  // await router.addLiquidity(
  //   contractBBTKNProxy,
  //   addressUSDC,
  //   balanceTokenA,
  //   balanceTokenB,
  //   0,
  //   0,
  //   deployer.address,
  //   Math.floor(Date.now() / 1000 + (10 * 60))
  // )
}

Mumbai()
//  Goerli()

  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
