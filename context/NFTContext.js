import { ethers } from 'ethers'
import React, { useState, useEffect } from 'react'
import { NFTMarketplaceAddress, NFTMarketplaceAddressABI } from './constants'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import axios from 'axios'

const API_KEY = process.env.NEXT_PUBLIC_INFURA_IPFS_API_KEY
const API_SECRET = process.env.NEXT_PUBLIC_INFURA_IPFS_API_SECRET
const auth = 'Basic ' + btoa(API_KEY + ':' + API_SECRET)
const client = ipfsHttpClient({
  url: 'https://ipfs.infura.io:5001/api/v0',
  headers: {
    authorization: auth,
  },
})

export const NFTContext = React.createContext()

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('')
  const nftCurrency = 'MATIC'

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  const checkIfWalletIsConnected = async () => {
    //Does user have metamask installed
    if (!window.ethereum) return alert('Please Install MetaMask')
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })

    if (accounts.length) {
      setCurrentAccount(accounts[0])
    } else {
      console.log('No accounts found')
    }
  }

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    setCurrentAccount(accounts[0])

    window.location.reload()
  }

  const uploadToIPFS = async (file) => {
    try {
      const fileAdded = await client.add({ content: file })
      const url = `https://mykeadam.infura-ipfs.io/ipfs/${fileAdded.path}`
      return url
    } catch (error) {
      console.log('Error uploading file to IPFS')
    }
  }

  const createNFT = async (formInput, fileUrl, router) => {
    debugger
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    const data = JSON.stringify({ name, description, image: fileUrl })

    try {
      const added = await client.add(data)
   
      const url = `https://mykeadam.infura-ipfs.io/ipfs/${added.path}`

      await createSale(url, price)

      router.push('/')
    } catch (error) {
      console.log(error)
    }
  }

  const fetchNFTs = async () => {
    const provider = new ethers.JsonRpcProvider()
    const contract = new ethers.Contract(
      NFTMarketplaceAddress,
      NFTMarketplaceAddressABI,
      provider
    )
    
    debugger
    const data = await contract.fetchMarketItems()
    
    debugger
    console.log(data)

    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId)
        const {
          data: { image, name, description }
        } = await axios.get(tokenURI)

        const price = ethers.parseUnits(unformattedPrice.toString(), 'ether')

        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        }
      })
    )
    console.log(data)
    return items
  }

  const createSale = async (url, formInputPrice, isReselling, id) => {
    debugger
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const price = ethers.parseEther(formInputPrice)
    const contract = new ethers.Contract(
      NFTMarketplaceAddress,
      NFTMarketplaceAddressABI,
      signer
    )
    const listingPrice = await contract.getListingPrice()

    console.log(listingPrice)

    debugger
    const transaction = await contract.createToken(url, price, {
      value: listingPrice.toString(),
    })

    await transaction.wait()
    debugger
    console.log(transaction)
  }

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        connectWallet,
        currentAccount,
        uploadToIPFS,
        createNFT,
        fetchNFTs,
      }}
    >
      {children}
    </NFTContext.Provider>
  )
}
