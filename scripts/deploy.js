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

var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");

// Publicar NFT en Mumbai
async function deployMumbai() {
  var relAddMumbai; // relayer mumbai
  

  // utiliza deploySC
  // utiliza printAddress
  // utiliza ex
  // utiliza ex
  // utiliza verify

  await verify(implAdd, "CUYNFT");
}

// Publicar UDSC, Public Sale y Bbites Token en Goerli
async function deployGoerli() {
  // var relAddGoerli; // relayer goerli

  var UniswapV2Router = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
  var contractUSDC    = await deploySCNoUp("USDCoin")
  var addressUSDC     = await contractUSDC.getAddress()
  var contractBBTKN   = await deploySC("BBitesToken")
  var addressBBTKN    = await contractBBTKN.getAddress()
  var addressBBTKN    = await printAddress("BBitesToken", addressBBTKN);
  var contractPublicSale = await deploySC("PublicSale", [addressBBTKN, addressUSDC, UniswapV2Router])
  await printAddress("PublicSale", await contractPublicSale.getAddress());

  // USDCoin - Imp:             0x5AAF9Ea9D3306A1DB5EB71Bf71E4C1C4b46AA31b
  // BBitesToken Proxy Address: 0x44f8611a897Af4F12b8d4E7005E3aa1A54A0A9D0
  // BBitesToken Impl Address:  0xdADf53cEAbff7c4a490757EC6fFcbF5E174d7A9e
  // PublicSale Proxy Address:  0x3AE254C2F44bF3E4C1024d2584636B29291Cf200
  // PublicSale Impl Address:   0x2F23fCB7927C83f6b72189e4CEa5A0d4dc403BB0

  // set up
  // script para verificacion del contrato
}

//deployMumbai()
  deployGoerli()
  //
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
