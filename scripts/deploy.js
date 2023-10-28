require("dotenv").config();

const { getRootFromMT } = require("../utils/merkleTree");
const walletAndIds = require("../wallets/walletList");

const {
  getRole,
  verify,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

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
var addressPublicSaleImpl;

// Publicar NFT en Mumbai
async function Mumbai() {
  var relayerMumbai = '0xAEAC9114F74684402Bee91F88819333acCAfD2B2'

  let name = "CuyCollection";
  let symbol = "CUY";
  contractCuy      = await deploySC("CuyCollectionNft", [name, symbol])
  addressCuyProxy  = await contractCuy.getAddress()
  addressCuyImpl   = await printAddress("CuyCollectionNft", addressCuyProxy)

  await verify(addressCuyImpl, "CuyCollectionNft", [])

  //addressCuyProxy = '0x8849C99c351DC5950c991Fb552662b3dc3e91474'
  //addressCuyImpl  = '0x678FC0a2aeDDFB5C8CAEb9Fe66c04d2Ff9B8779e'

  //contractCuy = await ethers.getContractAt("CuyCollectionNft", addressCuyProxy)

  await contractCuy.grantRole(MINTER_ROLE, relayerMumbai)

  var root = getRootFromMT(walletAndIds);
  console.log(root)
  await contractCuy.actualizarRaiz(root)
  var rootContract = await contractCuy.root()
  console.log(rootContract)

}

async function Goerli() {
  var relayerGoerli = '0x4dAbe6D8C8a8146A501D29A8e9F4283D24Af3A06'

  // -------------------------------------------------------------------------------   DEPLOY
  // contractUSDC            = await deploySCNoUp("USDCoin")
  // addressUSDC             = await contractUSDC.getAddress()
  // contractBBTKNProxy      = await deploySC("BBitesToken")
  // addressBBTKNProxy       = await contractBBTKNProxy.getAddress()
  // contractBBTKNImpl       = await printAddress("BBitesToken", addressBBTKNProxy)
  // contractPublicSaleProxy = await deploySC("PublicSale", [addressBBTKNProxy, addressUSDC, UniswapV2RouterAddress])
  // addressPublicSaleProxy  = await contractPublicSaleProxy.getAddress()
  // addressPublicSaleImpl  = await printAddress("PublicSale", addressPublicSaleProxy)

  addressUSDC              = '0xFc1382C1A46891C24e3d7C9f4d9b9B37e3C07641'      
  addressBBTKNProxy        = '0xA25Ca4AFA3738F7c5F3816C14A3cDE6B966A9cEf'
  addressBBTKNImpl         = '0xdADf53cEAbff7c4a490757EC6fFcbF5E174d7A9e'
  addressPublicSaleProxy   = '0x1Dbb764d5C961965C2d453201b2C90C107650b2B'
  addressPublicSaleImpl    = '0xacD5EE7fF93c149E97e0A27fB2da18423a065293'
  pairAddress              = '0x28f4A7535114015E4CE78581127d165457055E34'
  
  // -------------------------------------------------------------------------------   VERIFY
  // await verify(addressUSDC, "USDCoin", [])
  // await verify(addressBBTKNImpl, "BBTKNImpl", [])
  // await verify(addressPublicSaleImpl, "PublicSaleImpl", [])

  // -------------------------------------------------------------------------------   SET UP
  // contractBBTKNProxy = await ethers.getContractAt("BBitesToken", addressBBTKNProxy)
  // await contractBBTKNProxy.grantRole(MINTER_ROLE, relayerGoerli)
  contractUSDC       = await ethers.getContractAt("USDCoin", addressUSDC)

  // MINTEANDO.. BORRAR !!
  var addressTest = '0xC840F562D9F69b46b4227003E01525CB99344B72'
  var amount = '1000000000000000000000'
  await contractUSDC.mint(addressTest, amount)

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

//Mumbai()
Goerli()

  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
