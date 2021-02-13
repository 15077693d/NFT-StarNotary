pragma solidity >=0.4.24;
import '../app/node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';
contract StarNotary is ERC721{

    struct Star {
        string name;
    }
    constructor() ERC721("StarNotary", "STAR") public { }
    mapping(uint256 => Star) public tokenIdToInfo;
    mapping(uint256 => uint256) public tokenIdToPrice;

    // Create Star 
    function createStar(string memory starName, uint256 _tokenId) public  {
        Star memory newStar = Star(starName);
        tokenIdToInfo[_tokenId] = newStar;
        _mint(msg.sender, _tokenId);
    }

    // Put to sale
    function putStarToSale(uint256 _tokenId, uint256 _price) public{
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you are not owner");
        tokenIdToPrice[_tokenId] = _price;
    }

    // Buy the star
    function buyStar(uint256 _tokenId) public payable {
        uint256 starCost = tokenIdToPrice[_tokenId];
        require(starCost>0, "The Star didn't sell");
        require(msg.value >= starCost, "You have not enough money");
        address ownerAddress = ownerOf(_tokenId);
        address newOwnerAddress = msg.sender;
        _transfer(ownerAddress, newOwnerAddress, _tokenId);
        address(uint160(ownerAddress)).transfer(starCost);
        if(msg.value > starCost){
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Look up star
    function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns (string memory){
        require(keccak256(bytes(tokenIdToInfo[_tokenId].name))!=keccak256(bytes("")),"There is no the token...");
        return tokenIdToInfo[_tokenId].name;
    }

    // Exchange the star
    function exchangeStars(uint256 _tokenId1, address owner1, uint256 _tokenId2, address owner2) public {
        require(ownerOf(_tokenId1) == owner1, "(1) not the owner");
        require(ownerOf(_tokenId2) == owner2, "(2) not the owner");
        _transfer(owner1, owner2, _tokenId1);
        _transfer(owner2, owner1, _tokenId2);
    }

    // Transfer the star
    function transferStar(address to, uint256 _tokenId) public {
        require(ownerOf(_tokenId)== msg.sender);
        _transfer(msg.sender, to, _tokenId);
    }
}