// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IUniSwapV2Router02} from "./Interfaces.sol";

contract PublicSale is 
    Initializable,
    PausableUpgradeable, 
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    IUniSwapV2Router02 router;
    IERC20 tokenBBTKN;
    IERC20 tokenUSDC;
    address routerAddress; // = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D; // ROUTER MAINNET Y TESTNETs

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EXECUTER_ROLE = keccak256("EXECUTER_ROLE");

    // 00 horas del 30 de septiembre del 2023 GMT
    uint256 constant startDate = 1696032000;

    // Maximo price NFT
    uint256 public MAX_PRICE_NFT;

    uint256[] public mintedNFTs;

    modifier NFTChecks(uint256 _id, uint256 _min, uint256 _max) {
        require(_id >= _min && _id <= _max, "Token ID fuera de rango.");
        require(!checkMintedNFT(_id), "Token ID ya existente.");
        _;
    }

    event PurchaseNftWithId(address account, uint256 id);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _addressBBTKN, address _addressUSDC, address _addressRouter) public initializer {
        routerAddress = _addressRouter;
        
        tokenBBTKN = IERC20(_addressBBTKN);
        tokenUSDC = IERC20(_addressUSDC);
        router = IUniSwapV2Router02(routerAddress);

        MAX_PRICE_NFT = _amount(90000);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function purchaseWithTokens(uint256 _id) public NFTChecks(_id, 0, 699) {
        uint256 tokenAmount = getPriceForId(_id);
        require(tokenBBTKN.transferFrom(msg.sender, address(this), tokenAmount), "Error en la transferencia de BBTKN");
        mintedNFTs.push(_id);
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function getAmountIn(uint256 _id) public view NFTChecks(_id, 0, 699) returns(uint256) {
        uint256 tokenAmount = getPriceForId(_id);
        uint256 reserveIn = _amount(500000);
        uint256 reserveOut = _amount(1000000);
        uint256 USDCEstimado = router.getAmountIn(tokenAmount, reserveIn, reserveOut);
        USDCEstimado = (USDCEstimado * 1005) / 1000; // Aumento un 0.5% para evitar EXCESSIVE_INPUT_AMOUNT
        USDCEstimado = USDCEstimado / (10 ** (18 - 6));
        return USDCEstimado;
    }

    function purchaseWithUSDC(uint256 _id, uint256 _amountIn) external NFTChecks(_id, 0, 699) {

        uint256 tokenAmount = getPriceForId(_id);

        address buyer = msg.sender;

        require(tokenUSDC.allowance(buyer, address(this)) >= _amountIn, "Debe aprobar la cantidad de USDC necesaria.");
        
        require(tokenUSDC.transferFrom(buyer, address(this), _amountIn), "Error en la transferencia de USDC");

        tokenUSDC.approve(routerAddress, _amountIn);

        address[] memory path = new address[](2);
        path[0] = address(tokenUSDC);
        path[1] = address(tokenBBTKN);

        uint[] memory amounts = router.swapTokensForExactTokens(
            tokenAmount,
            _amountIn,
            path, 
            address(this), 
            block.timestamp + 3600
        );

        uint256 USDCExcess = _amountIn - amounts[0];

        if (USDCExcess > 0) 
            require(tokenUSDC.transfer(buyer, USDCExcess), "Error en la devolucion de USDC");
        
        mintedNFTs.push(_id);
        emit PurchaseNftWithId(buyer, _id);
    }

    function purchaseWithEtherAndId(uint256 _id) public payable NFTChecks(_id, 700, 999) {
        uint256 price = 10000000000000000;
        require(msg.value >= price, "Se debe enviar 0.01 ether.");
        if(msg.value > price) {
            uint256 vuelto = msg.value - price;
            payable(msg.sender).transfer(vuelto);
        }
        mintedNFTs.push(_id);
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function depositEthForARandomNft() public payable {
        uint256 _id;

        for (uint256 i = 0; i < 299; i++) {
            uint256 randomNumber = generateRandomNumber(700, 999);
            
            if (!checkMintedNFT(randomNumber)) {
                _id = randomNumber;
                mintedNFTs.push(_id);
                emit PurchaseNftWithId(msg.sender, _id);
                break;
            }
        }
    }

    receive() external payable {
        depositEthForARandomNft();
    }

    function withdrawEther() public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(this).balance > 0, "Contrato sin ether.");
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawTokens() public onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 contractBBTKNBalance = tokenBBTKN.balanceOf(address(this));
        require(contractBBTKNBalance > 0, "Contrato sin BBTKN.");
        require(tokenBBTKN.transfer(msg.sender, contractBBTKNBalance), "Error en la transferencia de BBTKN");
    }

    ////////////////////////////////////////////////////////////////////////
    /////////                    Helper Methods                    /////////
    ////////////////////////////////////////////////////////////////////////

    function _amount(uint256 __amount) internal pure returns(uint256){
        return __amount * 10 ** 18;
    }

    function checkMintedNFT(uint256 _id) internal view returns(bool) {
        for (uint i = 0; i < mintedNFTs.length; i++) {
            if(_id == mintedNFTs[i]) 
                return true;
        }
        return false;
    }

    function getPriceForId(uint256 _id) public view NFTChecks(_id, 0, 699) returns(uint256)  {
        uint256 daysPassed = (block.timestamp - startDate) / 1 days;
        uint256 tokenAmount;

        if(_id >= 0 && _id <= 199)
            tokenAmount = _amount(1000);
        else if(_id >= 200 && _id <= 499)
            tokenAmount = _amount(_id * 20);
        else if(_id >= 500 && _id <= 699) {
            tokenAmount = _amount(10000 + (daysPassed * 2000));
            if (tokenAmount > MAX_PRICE_NFT) 
                tokenAmount = MAX_PRICE_NFT;
        }
        return tokenAmount;
    }

    function getMintedNFTs() public view returns (uint256[] memory) {
        return mintedNFTs;
    }

    function generateRandomNumber(uint256 minValue, uint256 maxValue) internal view returns (uint256) {
        uint256 randomNonce = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 
            (maxValue - minValue + 1) + minValue;
        return randomNonce;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Revisar
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}
}
