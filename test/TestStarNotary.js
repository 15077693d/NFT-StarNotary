const assert = require("assert");
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
    let price = web3.utils.toWei("0.1", "ether")
    let instance = await StarNotary.deployed();
    let seller = accounts[0]
    let buyer = accounts[1]
    let sellerBalance1 = await web3.eth.getBalance(seller)
    await instance.createStar(starName, tokenId,{
        from: seller
    })
    let owner =  await instance.ownerOf(tokenId)
    assert(owner,seller)
    await instance.putStarToSale(tokenId,price,{
        from: seller
    })
    await instance.buyStar(tokenId,{
        from: buyer,
        value:price
    })
    owner =  await instance.ownerOf(tokenId)
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
    assert(await instance.ownerOf(starId), user2);
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

  it('can add the star name and star symbol properly', async() => {
    let instance  = await StarNotary.deployed();
    assert("StarNotary", await instance.name())  
    assert("STAR",await instance.symbol())  
  });

  it('lets 2 users exchange stars', async() => {
      let instance = await StarNotary.deployed();
      let user1 = accounts[0]
      let user2 = accounts[1]
      await instance.createStar("star1", 6,{ from:user1})
      await instance.createStar("star2", 7,{ from:user2})
      assert(user1, await instance.ownerOf(6));
      assert(user2, await instance.ownerOf(7));
      await instance.exchangeStars(6,user1,7,user2,{ from:user1})
      assert(user1, await instance.ownerOf(7));
      assert(user2, await instance.ownerOf(6));
  })

  it('lets a user transfer a star',async() => {
      let instance = await StarNotary.deployed();
      let owner1 = accounts[0]
      let owner2 = accounts[1]
      await instance.createStar("star1", 8,{from:owner1})
      assert(owner1, await instance.ownerOf(8))
      await instance.transferStar(owner2, 8,{from:owner1})
      assert(owner2, await instance.ownerOf(8))
  })