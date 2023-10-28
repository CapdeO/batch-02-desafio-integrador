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
      ev.signature.includes("Burn")
    );
    var { account, id } = event[0].params;

    var bBiteToken = "0xA25Ca4AFA3738F7c5F3816C14A3cDE6B966A9cEf";
    var tokenAbi = ["function mint(address to, uint256 amount)"];
    var tokenContract = new ethers.Contract(bBiteToken, tokenAbi, signer);
    var amount = "10000000000000000000000";
      var tx = await tokenContract.mint(account, amount);
    var res = await tx.wait();
    return res;
};