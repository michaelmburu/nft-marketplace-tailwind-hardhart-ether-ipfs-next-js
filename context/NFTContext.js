import axios from 'axios'
import { ethers } from 'ethers'
import React, { useState, useEffect } from 'react'
import Web3Modal from 'web3modal'
import { NFTMarketplaceAddress, NFTMarketplaceAddressABI } from './constants'
import { create as ipfsHttpClient } from 'ipfs-http-client'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

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
      const fileAdded = client.add({ content: file })
      const url = `https://ipfs.infura.io/ipfs/${fileAdded.path}`
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
