import axios from 'axios'
import { ethers } from 'ethers'
import { useState, createContext, useEffect } from 'react'
import Web3Modal from 'web3modal'
import { NFTMarketplaceAddress, NFTMarketplaceAddressABI } from './constants'

export const NFTContext = createContext()

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

  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount }}>
      {children}
    </NFTContext.Provider>
  )
}
