// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.025 ether;

    address payable owner;

    mapping(uint256 => MarketItem) private idToMarketItem;

    constructor () ERC721("SoulCity", 'SCM') {
        owner = payable(msg.sender);
    }
    
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint price;
        bool sold;
    }

    /// Event is triggered when item is created. indexed means start from 0 onwards
    event MarketItemCreated (   
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint price,
        bool sold
    );

    /// Marketplace owner to update listing price
    function updateListingPrice(uint _listingPrice) public payable {
        require(owner == msg.sender, 'Only market place owner can update listing price');

        listingPrice = _listingPrice;
    }

    // Get current listing price
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // Mint NFT and increment id
    function createToken(string memory tokenURI, uint256 price) public payable returns(uint){
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        createMarketItem(newTokenId, price);

        return newTokenId;
    }
    
    // Create marketItem
    function createMarketItem(uint256 tokenId, uint256  price) private {
        require(price > 0, 'Price must be atleast 1');
        require(msg.value == listingPrice, 'Price must be equal to listing price');

        idToMarketItem[tokenId] = MarketItem(tokenId, payable(msg.sender), payable(address(this)), price, false);

        _transfer(msg.sender, address(this), tokenId);

        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false);
    }

    //Resell NFT
    function resellToken(uint256 tokenId, uint256 price) public payable {
        require(idToMarketItem[tokenId].owner == msg.sender, 'only item owner can resell this NFT');
        require(msg.value == listingPrice, 'Price must be equal to listing price');

        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));

        _itemsSold.decrement();

        _transfer(msg.sender, address(this), tokenId);
    }

    function createMarketSale(uint256 tokenId) public payable {
        uint price = idToMarketItem[tokenId].price;

        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));

        _itemsSold.increment();

        _transfer(address(this), msg.sender, tokenId);

        payable(owner).transfer(listingPrice);
        payable(idToMarketItem[tokenId].seller).transfer(msg.value);
    }

    // Fetch unsold market items
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _tokenIds.current();
        uint unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        //Create array to store unsold market items
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        
        // Loop through all NFTs
       
        for(uint i = 0; i < itemCount; i++){
             // Check if owner has empty address and grab the current id
            if(idToMarketItem[i + 1].owner == address(this)){
                uint currentId = i + 1;

                // Get the mapping of the current id to market item & get reference to market item
                MarketItem storage currentitem = idToMarketItem[currentId];
                
                // Insert into items array
                items[currentIndex] = currentitem;
                
                // Increment array current index
                currentIndex += 1;
            }
        }

        return items;
    }

    //Fetch market items that an owner has purchased
    function fetchMyNFTS () public view returns (MarketItem[] memory){
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        // Get the number of items that a user owns
        for(uint i = 0; i < totalItemCount; i++){

            //Check if it is the users NFT
            if(idToMarketItem[i + 1].owner == msg.sender){
                // Increment number of users NFT
                itemCount += 1;
            }
        }

        //Create array to store users market items
        MarketItem[] memory items = new MarketItem[](itemCount);


        // Loop through all NFTs
        for(uint i = 0; i < totalItemCount; i++){
             // Check if owner is msg.sender and grab the current id
            if(idToMarketItem[i + 1].owner == address(msg.sender)){
                uint currentId = i + 1;

                // Get the mapping of the current id to market item & get reference to market item
                MarketItem storage currentitem = idToMarketItem[currentId];
                
                // Insert into items array
                items[currentIndex] = currentitem;
                
                // Increment array current index
                currentIndex += 1;
            }
        }

        // return users NFTs
        return items;
    }

    // Fetch NFTs that a user has listed on the market place
    function fetchItemsListed() public view returns (MarketItem[] memory){

        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        // Get the number of items for the seller
        for(uint i = 0; i < totalItemCount; i++){

            //Check if it is the users NFT
            if(idToMarketItem[i + 1].seller == msg.sender){
                // Increment number of users NFT
                itemCount += 1;
            }
        }

        //Create array to store users market items
        MarketItem[] memory items = new MarketItem[](itemCount);


        // Loop through all NFTs
        for(uint i = 0; i < totalItemCount; i++){
             // Check if owner is seller and grab the current id
            if(idToMarketItem[i + 1].seller == address(msg.sender)){
                uint currentId = i + 1;

                // Get the mapping of the current id to market item & get reference to market item
                MarketItem storage currentitem = idToMarketItem[currentId];
                
                // Insert into items array
                items[currentIndex] = currentitem;
                
                // Increment array current index
                currentIndex += 1;
            }
        }

        // return number NFTs an owner is selling
        return items;

    }

}
