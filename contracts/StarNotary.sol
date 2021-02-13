pragma solidity >=0.4.24;
import '../app/node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';
contract StarNotary is ERC721{

    struct Star {
        string name;
    }
    constructor() ERC721("StarNotary", "STAR") { }
    mapping(uint256 => Star) public tokenIdToInfo;
    mapping(uint256 => uint256) public tokenIdToPrice;

    // Create Star 
    function createStar(string memory starName, uint256 _tokenId) public  returns (address){
        Star memory newStar = Star(starName);
        tokenIdToInfo[_tokenId] = newStar;
        _mint(msg.sender, _tokenId);
        return ownerOf(_tokenId);
    }

    // Put to sale
    function putStarToSale(uint256 _tokenId, uint256 _price) public{
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you are not owner");
        tokenIdToPrice[_tokenId] = _price;
    }

    // Buy the star
    function buyStar(uint256 _tokenId) public payable returns (address){
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
        return ownerOf(_tokenId);
    }

    // Look up star
    function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns (string memory){
        require(tokenIdToPrice[_tokenId] > 0,"There is no the token...");
        return tokenIdToInfo[_tokenId].name;
    }

    // Exchange the star
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2, address owner2) public returns (address, address){
        require(ownerOf(_tokenId1) == msg.sender);
        require(ownerOf(_tokenId2) == owner2);
        address owner1 = msg.sender;
        _transfer(owner1, owner2, _tokenId1);
        _transfer(owner2, owner1, _tokenId2);
        return (ownerOf(_tokenId1), ownerOf(_tokenId2));
    }

    // Transfer the star
    function transferStar(address to, uint256 _tokenId) public returns (address){
        require(ownerOf(_tokenId)== msg.sender);
        _transfer(msg.sender, to, _tokenId);
        return ownerOf(_tokenId);
    }
}