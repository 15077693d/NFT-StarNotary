const { assert } = require("console");
const StarNotary = artifacts.require('StarNotary');

var accounts;
var owner;
contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
})

it("Can create a star", async () => {
    let tokenId = 1;
    let starName = "Oscar"
    let instance = await StarNotary.deployed();
    await instance.createStar(starName, tokenId, {
            from:accounts[0]
        })
    assert(await instance.tokenIdToInfo.call(tokenId),starName)
})

it("lets user1 put up thier star for sale", async () => {
    let tokenId = 2;
    let starName = "Oscar"
    let instance = await StarNotary.deployed();
    await instance.createStar(starName, tokenId,{
        from:accounts[0]
    })
    await instance.putStarToSale(tokenId, 100,{from:accounts[0]});
    assert(await instance.tokenIdToPrice,100)
})

it('lets user1 get the funds after the sale', async () => {
    let tokenId = 3;
    let starName = "Oscar"
    let price = web3.utils.toWei("10", "ether")
    let instance = await StarNotary.deployed();
    let seller = accounts[0]
    let buyer = accounts[1]
    let sellerBalance1 = await web3.eth.getBalance(seller)
    let owner= await instance.createStar(starName, tokenId,{
        from: seller
    })
    assert(owner,seller)
    await instance.putStarToSale(tokenId,price,{
        from: seller
    })
    owner=await instance.buyStar(tokenId,{
        from: buyer,
        value:price
    })
    assert(owner,buyer)
    let sellerBalance2 = Number(sellerBalance1) + Number(price)
    assert(sellerBalance2, await web3.eth.getBalance(seller))
})

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarToSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarToSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert(value, starPrice);
  });