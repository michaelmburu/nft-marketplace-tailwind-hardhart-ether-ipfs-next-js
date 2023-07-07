import Script from 'next/script'
import { Navbar, Footer } from '../components'
Script
import '../styles/globals.css'
import { ThemeProvider } from 'next-themes'

const MyApp = ({ Component, pageProps }) => (
  <ThemeProvider attribute='class'>
    <div className='dark: bg-nft-dark bg-white min-h-screen'>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </div>

    <Script
      src='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js'
      integrity='sha512-fD9DI5bZwQxOi7MhYWnnNPlvXdp/2Pj3XSTRrFs5FQa4mizyGLnJcN6tuvUS6LbmgN1ut+XGSABKvjN0H6Aoow=='
      crossorigin='anonymous'
      referrerpolicy='no-referrer'
    />
  </ThemeProvider>
)

export default MyApp
