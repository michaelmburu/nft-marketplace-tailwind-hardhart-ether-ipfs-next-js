import axios from 'axios'
import { ethers } from 'ethers'
import React, { useState, useEffect } from 'react'
import Web3Modal from 'web3modal'
import { NFTMarketplaceAddress, NFTMarketplaceAddressABI } from './constants'
import { create as ipfsHttpClient } from 'ipfs-http-client'

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
      debugger
      const fileAdded = await client.add({ content: file })
      const url = `https://cloudflare-ipfs.com/ipfs/${fileAdded.path}`
      debugger
      return url
    } catch (error) {
      console.log('Error uploading file to IPFS')
    }
  }

  return (
    <NFTContext.Provider
      value={{ nftCurrency, connectWallet, currentAccount, uploadToIPFS }}
    >
      {children}
    </NFTContext.Provider>
  )
}
