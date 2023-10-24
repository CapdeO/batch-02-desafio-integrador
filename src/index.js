import { Contract, ethers } from "ethers";


import usdcTknAbi from "../artifacts/contracts/USDCoin.sol/USDCoin.json";
import bbitesTokenAbi from "../artifacts/contracts/BBitesToken.sol/BBitesToken.json";
import publicSaleAbi from "../artifacts/contracts/PublicSale.sol/PublicSale.json";
import nftTknAbi from "../artifacts/contracts/CuyCollectionNft.sol/CuyCollectionNft.json";

// SUGERENCIA: vuelve a armar el MerkleTree en frontend
// Utiliza la libreria buffer
import buffer from "buffer/";
import walletAndIds from "../wallets/walletList";
import { MerkleTree } from "merkletreejs";
var Buffer = buffer.Buffer;
var merkleTree;
var root;

function hashToken(tokenId, account) {
  return Buffer.from(
    ethers
      .solidityPackedKeccak256(["uint256", "address"], [tokenId, account])
      .slice(2),
    "hex"
  );
}
function getMerkleFromMT() {
  var elementosHasheados = walletAndIds.map(({ id, address }) => {
    return hashToken(id, address);
  });
  merkleTree = new MerkleTree(elementosHasheados, ethers.keccak256, {
    sortPairs: true,
  });

  root = merkleTree.getHexRoot();
  console.log(root);
  return merkleTree;
}
function getRootFromMT(lista) {

  var elementosHasheados = lista.map(({ id, address }) => {
    return hashToken(id, address);
  });
  merkleTree = new MerkleTree(elementosHasheados, ethers.keccak256, {
    sortPairs: true,
  });

  root = merkleTree.getHexRoot();
  //console.log(root);

  return root;
}
function construyendoPruebas(tokenId, account) {
  // var tokenId = 7;
  //var account = "0x00b7cda410001f6e52a7f19000b3f767ec8aec7d";
  merkleTree = getMerkleFromMT();
  root = getRootFromMT(walletAndIds);
  var hasheandoElemento = hashToken(tokenId, account);

  var pruebas = merkleTree.getHexProof(hasheandoElemento);
  //return pruebas;

  // verificacion off-chain
  //var pertenece = merkleTree.verify(pruebas, hasheandoElemento, root);
  //console.log("Pertenece:" + pertenece);

  return pruebas;
}


var provider, signer, account;
var usdcTkContract, bbitesTknContract, pubSContract, nftContract;
var usdcAddress, bbitesTknAdd, pubSContractAdd;

async function setUpMetamask() {
  var bttn = document.getElementById("connect");

  var walletIdEl = document.getElementById("walletId");

  bttn.addEventListener("click", async function () {
    if (window.ethereum) {
      // valida que exista la extension de metamask conectada
      [account] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Billetera metamask", account);
      walletIdEl.innerHTML = account;

      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner(account);
    }
  });
}

function setUpListeners() {
  // USDC Balance - balanceOf
  var bttn = document.getElementById("usdcUpdate");
  bttn.addEventListener("click", async function () {
    var balance = await usdcTkContract.balanceOf(account);
    var balanceEl = document.getElementById("usdcBalance");
    balanceEl.innerHTML = ethers.formatUnits(balance, 6);
  });

  // Bbites token Balance - balanceOf
  var bttn = document.getElementById("bbitesTknUpdate");
  bttn.addEventListener("click", async function () {
    var balance = await bbitesTknContract.balanceOf(account);
    var balanceEl = document.getElementById("bbitesTknBalance");
    balanceEl.innerHTML = ethers.formatUnits(balance, 18);
  });

  // APPROVE BBTKN
  // bbitesTknContract.approve
  var bttn = document.getElementById("approveButtonBBTkn");
  bttn.addEventListener("click", async function () {
    document.getElementById("approveError").textContent = "";
    var approveInput = document.getElementById("approveInput").value;
    try {

      var tx = await bbitesTknContract.connect(signer).approve(pubSContractAdd, approveInput);
      var res = await tx.wait();
      console.log(res.hash);

    } catch (error) {
      // document.getElementById("approveError").textContent = error;
      console.log(error)
      alert(error.reason)
    }
  });


  // APPROVE USDC
  // usdcTkContract.approve
  var bttn = document.getElementById("approveButtonUSDC");
  bttn.addEventListener("click", async function () {
    document.getElementById("approveErrorUSDC").textContent = "";
    var approveInput = document.getElementById("approveInputUSDC").value;
    try {

      var tx = await usdcTkContract.connect(signer).approve(pubSContractAdd, approveInput);
      var res = await tx.wait();
      console.log(res.hash);

    } catch (error) {
      // document.getElementById("approveErrorUSDC").textContent = error;
      console.log(error)
      alert(error.reason)
    }
  });

  // purchaseWithTokens
  var bttn = document.getElementById("purchaseButton");
  bttn.addEventListener("click", async function () {
    document.getElementById("purchaseError").textContent = "";
    var idInput = document.getElementById("purchaseInput").value;
    try {

      var allowanceDado = await bbitesTknContract.allowance(signer.address, pubSContractAdd);
      console.log(allowanceDado);
      var tx = await pubSContract.connect(signer).purchaseWithTokens(idInput);
      var res = await tx.wait();
      console.log(res.hash);

    } catch (error) {
      //document.getElementById("purchaseError").textContent = error;
      console.log(error)
      alert(error.reason)

    }
  });
  // purchaseWithUSDC
  var bttn = document.getElementById("purchaseButtonUSDC");
  bttn.addEventListener("click", async function () {
    document.getElementById("purchaseErrorUSDC").textContent = "";
    var idInput = document.getElementById("purchaseInputUSDC").value;
    var amountIn = document.getElementById("amountInUSDCInput").value;
    try {

      var tx = await pubSContract.connect(signer).purchaseWithUSDC(idInput, amountIn);
      var res = await tx.wait();
      console.log(res.hash);

    } catch (error) {
      // document.getElementById("purchaseErrorUSDC").textContent = error;
      console.log(error)
      alert(error.reason)
    }
  });

  // purchaseWithEtherAndId
  var bttn = document.getElementById("purchaseButtonEtherId");
  bttn.addEventListener("click", async function () {
    document.getElementById("purchaseEtherIdError").textContent = "";
    var idInput = document.getElementById("purchaseInputEtherId").value;

    try {

      var tx = await pubSContract.connect(signer).purchaseWithEtherAndId(idInput, { value: ethers.parseEther("0.001") });
      var res = await tx.wait();
      console.log(res.hash);

    } catch (error) {
      // document.getElementById("purchaseEtherIdError").textContent = error;
      console.log(error)
      alert(error.reason)
    }
  });

  // send Ether
  var bttn = document.getElementById("sendEtherButton");
  bttn.addEventListener("click", async function () {
    document.getElementById("sendEtherError").textContent = "";

    try {
      var res = await signer.sendTransaction({
        to: pubSContract,
        value: ethers.parseEther("0.001"),
      });

      console.log(res.hash);

    } catch (error) {
      // document.getElementById("sendEtherError").textContent = error;
      console.log(error)
      alert(error.code)

    }
  });

  // getPriceForId
  var bttn = document.getElementById("getPriceNftByIdBttn");
  bttn.addEventListener("click", async function () {
    var _id = document.getElementById("priceNftIdInput").value;

    try {
      var tx = await pubSContract.getPriceForId(_id);

      console.log(tx);
      document.getElementById("priceNftByIdText").textContent = ethers.formatUnits(tx, 18);

    } catch (error) {
      //document.getElementById("approveErrorUSDC").textContent = error;
      alert(error.reason)
    }


  });


  // getProofs
  var bttn = document.getElementById("getProofsButtonId");
  bttn.addEventListener("click", async () => {

    var id = document.getElementById("inputIdProofId").value;
    var address = document.getElementById("inputAccountProofId").value;

    var proofs = construyendoPruebas(id, address);
    console.log(proofs);
    navigator.clipboard.writeText(JSON.stringify(proofs));
  });

  // safeMintWhiteList
  var bttn = document.getElementById("safeMintWhiteListBttnId");
  // usar ethers.hexlify porque es un array de bytes
  // var proofs = document.getElementById("whiteListToInputProofsId").value;
  // proofs = JSON.parse(proofs).map(ethers.hexlify);

  // buyBack
  var bttn = document.getElementById("buyBackBttn");
  bttn.addEventListener("click", async () => {

    var id = document.getElementById("buyBackInputId").value;

    try {

      var tx = await nftContract.connect(signer).buyBack(id);
      var res = await tx.wait();
      console.log(res.hash);

    } catch (error) {
      // document.getElementById("approveError").textContent = error;
      console.log(error)
      alert(error.reason)
    }

  });

}

function initSCsGoerli() {
  provider = new ethers.BrowserProvider(window.ethereum);

  usdcAddress = "0xFc1382C1A46891C24e3d7C9f4d9b9B37e3C07641";
  bbitesTknAdd = "0xA25Ca4AFA3738F7c5F3816C14A3cDE6B966A9cEf";
  pubSContractAdd = "0x1Dbb764d5C961965C2d453201b2C90C107650b2B";

  usdcTkContract = new Contract(usdcAddress, usdcTknAbi.abi, provider);
  bbitesTknContract = new Contract(bbitesTknAdd, bbitesTokenAbi.abi, provider);
  pubSContract = new Contract(pubSContractAdd, publicSaleAbi.abi, provider);
}

function initSCsMumbai() {
  provider = new ethers.BrowserProvider(window.ethereum);

  var nftAddress = "0x8849C99c351DC5950c991Fb552662b3dc3e91474";

  nftContract = new Contract(nftAddress, nftTknAbi.abi, provider);
}

function setUpEventsContracts() {
  var pubSList = document.getElementById("pubSList");
  // pubSContract - "PurchaseNftWithId"

  var bbitesListEl = document.getElementById("bbitesTList");
  // bbitesCListener - "Transfer"

  var nftList = document.getElementById("nftList");
  // nftCListener - "Transfer"

  var burnList = document.getElementById("burnList");
  // nftCListener - "Burn"
}

async function setUp() {
  window.ethereum.on("chainChanged", (chainId) => {
    window.location.reload();
  });

  initSCsGoerli();

  initSCsMumbai();

  setUpListeners();

  setUpEventsContracts();

  buildMerkleTree();

  setUpMetamask();
}

setUp()
  .then()
  .catch((e) => console.log(e));