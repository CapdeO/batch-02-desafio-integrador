import { Contract, ethers } from "ethers";

import usdcTknAbi from "../artifacts/contracts/USDCoin.sol/USDCoin.json";
import bbitesTokenAbi from "../artifacts/contracts/BBitesToken.sol/BBitesToken.json";
import publicSaleAbi from "../artifacts/contracts/PublicSale.sol/PublicSale.json";
import nftTknAbi from "../artifacts/contracts/CuyCollectionNft.sol/CuyCollectionNft.json";

import buffer from "buffer/";
const walletAndIds = require("../wallets/walletList");
import { MerkleTree } from "merkletreejs";
var Buffer = buffer.Buffer;
var merkleTree;
var root;
var isConnected;

function hashToken(tokenId, account) {
  return Buffer.from(
    ethers
      .solidityPackedKeccak256(["uint256", "address"], [tokenId, account])
      .slice(2),
    "hex"
  );
}

function getRootFromMT(lista) {
  var elementosHasheados = lista.map(({ id, address }) => {
    return hashToken(id, address);
  });
  merkleTree = new MerkleTree(elementosHasheados, ethers.keccak256, {
    sortPairs: true,
  });
  root = merkleTree.getHexRoot();
  return root;
}

function construyendoPruebas(tokenId, account) {
  var elementHash = hashToken(tokenId, account); 
  var proofs = merkleTree.getHexProof(elementHash);
  return proofs;
}

function buildMerkleTree() {
  root = getRootFromMT(walletAndIds)
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
      isConnected = true;
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner(account);
    }
  });
}

function setUpListeners() {
  // USDC Balance - balanceOf
  var bttn = document.getElementById("usdcUpdate");
  bttn.addEventListener("click", async function () {

    if (isConnected) {
      var balance = await usdcTkContract.balanceOf(account);
      var balanceEl = document.getElementById("usdcBalance");
      balanceEl.innerHTML = ethers.formatUnits(balance, 6);
    } else {
      alert("Por favor conecta tu billetera Metamask.")
    }
  });

  // Bbites token Balance - balanceOf
  var bttn = document.getElementById("bbitesTknUpdate");
  bttn.addEventListener("click", async function () {
    if(isConnected) {
      var balance = await bbitesTknContract.balanceOf(account);
      var balanceEl = document.getElementById("bbitesTknBalance");
      balanceEl.innerHTML = ethers.formatUnits(balance, 18);
    } else {
      alert("Por favor conecta tu billetera Metamask.")
    }
    
  });

  // APPROVE BBTKN
  // bbitesTknContract.approve
  var bttn = document.getElementById("approveButtonBBTkn");
  bttn.addEventListener("click", async function () {
    if(isConnected) {
      document.getElementById("approveError").textContent = "";
      var approveInput = document.getElementById("approveInput").value;
      approveInput = approveInput * (10**18)
      approveInput = approveInput.toString();
      try {

        var tx = await bbitesTknContract.connect(signer).approve(pubSContractAdd, approveInput);
        var res = await tx.wait();
        console.log(res.hash);

      } catch (error) {
        // document.getElementById("approveError").textContent = error;
        console.log(error)
        alert(error.reason)
      }
    } else {
      alert("Por favor conecta tu billetera Metamask.")
    }
    
  });


  // APPROVE USDC
  // usdcTkContract.approve
  var bttn = document.getElementById("approveButtonUSDC");
  bttn.addEventListener("click", async function () {
    if(isConnected) {
      document.getElementById("approveErrorUSDC").textContent = "";
      var approveInput = document.getElementById("approveInputUSDC").value;
      approveInput = approveInput * (10**6)
      approveInput = approveInput.toString();
      try {

        var tx = await usdcTkContract.connect(signer).approve(pubSContractAdd, approveInput);
        var res = await tx.wait();
        console.log(res.hash);

      } catch (error) {
        // document.getElementById("approveErrorUSDC").textContent = error;
        console.log(error)
        alert(error.reason)
      }
    } else {
      alert("Por favor conecta tu billetera Metamask.")
    }
    
  });

  // purchaseWithTokens
  var bttn = document.getElementById("purchaseButton");
  bttn.addEventListener("click", async function () {
    if(isConnected) {
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
    } else {
      alert("Por favor conecta tu billetera Metamask.")
    }
    
  });
  // purchaseWithUSDC
  var bttn = document.getElementById("purchaseButtonUSDC");
  bttn.addEventListener("click", async function () {
    if(isConnected) {
      document.getElementById("purchaseErrorUSDC").textContent = "";
      var idInput = document.getElementById("purchaseInputUSDC").value;
      var amountIn = document.getElementById("amountInUSDCInput").value;
      amountIn = amountIn * (10**6)
      amountIn = amountIn.toString();
      try {

        var tx = await pubSContract.connect(signer).purchaseWithUSDC(idInput, amountIn);
        var res = await tx.wait();
        console.log(res.hash);

      } catch (error) {
        // document.getElementById("purchaseErrorUSDC").textContent = error;
        console.log(error)
        alert(error.reason)
      }
    } else {
      alert("Por favor conecta tu billetera Metamask.")
    }
    
  });

  // purchaseWithEtherAndId
  var bttn = document.getElementById("purchaseButtonEtherId");
  bttn.addEventListener("click", async function () {
    if(isConnected) {
      document.getElementById("purchaseEtherIdError").textContent = "";
      var idInput = document.getElementById("purchaseInputEtherId").value;

      try {

        var tx = await pubSContract.connect(signer).purchaseWithEtherAndId(idInput, { value: ethers.parseEther("0.01") });
        var res = await tx.wait();
        console.log(res.hash);

      } catch (error) {
        // document.getElementById("purchaseEtherIdError").textContent = error;
        console.log(error)
        alert(error.reason)
      }
    } else {
      alert("Por favor conecta tu billetera Metamask.")
    }
    
  });

  // send Ether
  var bttn = document.getElementById("sendEtherButton");
  bttn.addEventListener("click", async function () {
    if(isConnected) {
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
    } else {
      alert("Por favor conecta tu billetera Metamask.")
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

  // getPriceForIdUSDC
  var bttn = document.getElementById("getPriceNftByIdUSDCBttn");
  bttn.addEventListener("click", async function () {
    var _id = document.getElementById("priceNftIdInputUSDC").value;

    try {
      var tx = await pubSContract.getAmountIn(_id);

      console.log(tx);
      document.getElementById("priceNftByIdUSDCText").textContent = ethers.formatUnits(tx, 6);

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

  bttn.addEventListener("click", async function () {
    if(isConnected) {
      document.getElementById("whiteListErrorId").textContent = "";
      var toInput = document.getElementById("whiteListToInputId").value;
      var idInput = document.getElementById("whiteListToInputTokenId").value;
      var proofsInput = document.getElementById("whiteListToInputProofsId").value;
      proofsInput = JSON.parse(proofsInput).map(ethers.hexlify);

      try {
        var tx = await nftContract.connect(signer).safeMintWhiteList(toInput, idInput, proofsInput);
        var res = await tx.wait();
        console.log(res.hash);

      } catch (error) {
        console.log(error)
        alert(error.reason)
      }
    } else {
      alert("Por favor conecta tu billetera Metamask.")
    }
    
  });

  // buyBack
  var bttn = document.getElementById("buyBackBttn");
  bttn.addEventListener("click", async () => {
    if(isConnected) {
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
    } else {
      alert("Por favor conecta tu billetera Metamask.")
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
  pubSContract.on("PurchaseNftWithId", (account, id) => {
    var text = pubSList.textContent;
    pubSList.textContent = `${text} \n El evento purchase fue ejecutado por ${account} para el id ${id}`;
  });

  var bbitesListEl = document.getElementById("bbitesTList");
  bbitesTknContract.on("Tranfer", (from, to, amount) => {
    var text = bbitesListEl.textContent;
    bbitesListEl.textContent = `${text} \n Se han tranferido ${ethers.parseEther(
      amount
    )} BBites Tokens desde ${from} hacia ${to} `;
  });

  var nftList = document.getElementById("nftList");
  nftContract.on("Tranfer", (from, to, tokenId) => {
    var text = nftList.textContent;
    nftList.textContent = `${text} \n Se ha tranferido el token ${tokenId} desde ${from} a ${to} `;
  });

  var burnList = document.getElementById("burnList");
  nftContract.on("Burn", (account, id) => {
    var text = burnList.textContent;
    burnList.textContent = `${text} \n La cuenta ${account} ha quemado el token ${id}`;
  });
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