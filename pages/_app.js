import Script from 'next/script'
import { Navbar, Footer } from '../components'
Script
import '../styles/globals.css'
import { ThemeProvider } from 'next-themes'
import { NFTProvider } from '../context/NFTContext'

const MyApp = ({ Component, pageProps }) => (
  <NFTProvider>
    <ThemeProvider attribute='class'>
      <div className='dark:bg-nft-dark bg-white min-h-screen'>
        <Navbar />
        <div className='pt-65'>
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>

      <Script
        src='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js'
        integrity='sha512-fD9DI5bZwQxOi7MhYWnnNPlvXdp/2Pj3XSTRrFs5FQa4mizyGLnJcN6tuvUS6LbmgN1ut+XGSABKvjN0H6Aoow=='
        crossorigin='anonymous'
        referrerpolicy='no-referrer'
      />
    </ThemeProvider>
  </NFTProvider>
)

export default MyApp
