const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("@openzeppelin/defender-relay-client/lib/ethers");

exports.handler = async function (data) {
  const payload = data.request.body.events;

  const provider = new DefenderRelayProvider(data);
  const signer = new DefenderRelaySigner(data, provider, { speed: "fast" });

    var onlyEvents = payload[0].matchReasons.filter((e) => e.type === "event");
    if (onlyEvents.length === 0) return;

    var event = onlyEvents.filter((ev) =>
      ev.signature.includes("PurchaseNftWithId")
    );

    var { account, id } = event[0].params;

    var cuyCollection = "0x8849C99c351DC5950c991Fb552662b3dc3e91474";
    var tokenAbi = ["function safeMint(address to, uint256 tokenId)"];
    var tokenContract = new ethers.Contract(cuyCollection, tokenAbi, signer);
    var tx = await tokenContract.safeMint(account, id);
    var res = await tx.wait();

    return res;
};