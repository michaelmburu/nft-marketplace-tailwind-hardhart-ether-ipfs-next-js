const hre = require('hardhat')

async function main() {
  // Get contract factory
  const NFTMarketplace = await hre.ethers.getContractFactory('NFTMarketplace')
  
  //Deploy one instance of smart contract
  const nftMarketPlacedeployed = await NFTMarketplace.deploy()

  //Wait for deployment
  await nftMarketPlacedeployed.waitForDeployment()

  console.log('NFTMarketplace deployed to:', await nftMarketPlacedeployed.getAddress())
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
