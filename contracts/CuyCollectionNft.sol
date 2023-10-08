// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CuyCollectionNft is
    Initializable,
    ERC721Upgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    ERC721BurnableUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    bytes32 public root;

    event Burn(address account, uint256 id);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name,
        string memory _symbol
    ) public initializer {
        __ERC721_init(_name, _symbol);
        __ERC721Burnable_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmWvGfKgGeYMQtLoQ94jg6hfeAtcSxRAaJ1gbwSYRVGRqP/";
    }

    function safeMint(
        address to,
        uint256 tokenId
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        require(
            tokenId >= 0 && tokenId <= 999,
            "tokenId no permitido para este metodo."
        );
        _safeMint(to, tokenId);
    }

    function safeMintWhiteList(
        address to,
        uint256 tokenId,
        bytes32[] calldata proofs
    ) public whenNotPaused {
        require(
            verify(_hashearInfo(to, tokenId), proofs),
            "No eres parte de la lista"
        );
        _safeMint(to, tokenId);
    }

    function buyBack(uint256 id) public {
        require(
            id >= 1000 && id <= 1999,
            "tokenId no permitido para este metodo."
        );
        address owner = ERC721Upgradeable.ownerOf(id);
        burn(id);
        emit Burn(owner, id);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // MERKLE

    function _hashearInfo(
        address to,
        uint256 tokenId
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(tokenId, to));
    }

    function verify(
        bytes32 leaf,
        bytes32[] memory proofs
    ) public view returns (bool) {
        return MerkleProof.verify(proofs, root, leaf);
    }

    function verifyMerkleProof(
        bytes32 leaf,
        bytes32[] memory proofs
    ) public view returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i; i < proofs.length; i++) {
            bytes32 proof = proofs[i];

            if (computedHash < proof) {
                computedHash = keccak256(abi.encodePacked(computedHash, proof));
            } else {
                computedHash = keccak256(abi.encodePacked(proof, computedHash));
            }
        }
        return computedHash == root;
    }

    function actualizarRaiz(bytes32 _root) public {
        root = _root;
    }

    // Overrides required by solidity

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(AccessControlUpgradeable, ERC721Upgradeable)
        returns (bool)
    {}

    function _authorizeUpgrade(
        address newImplementation
    ) internal virtual override {}
}
