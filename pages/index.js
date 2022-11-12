import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3Modal from 'web3modal'
import { ethers, providers } from 'ethers'
import { useState, useEffect, useRef } from 'react'

export default function Home() {

  //walletConnected keep track of whether the user's wallet is connected
  const [walletConnected, setWalletConnected] = useState(false);
  //Create a reference to the Web3 Modal (used for  connectivity to the metamask) which which persist as long as the page is open
  const web3modalRef = useRef();
  //ENS
  const [ens, setENS] = useState('');
  //Save the address of the currently connected account
  const [address, setAddress] = useState('');

  /**
   * Set the ENS, if the current connected address has an associated ENS or else it sets
   * set the address of the connected account
   */
  const setENSOrAddress = async (address, web3Provider) =>{
    //lookup the ENS related to the given address
    let _ens = await web3Provider.lookupAddress(address);
    //if the address has an ENS set the ENS or else just set the address
    if(_ens){
      setENS(_ens);
    }
    else{
      setAddress(address)
    }
  };

  /**
   * A `provider` is needed to interact with the blockchain
   * -Reading balances, reading state, etc.
   * 
   * A `Signer` is a special type of provide used in case a write
   *  transaction needs to be made to the Blockchain, which involves
   *  the connected account needed to make a digital signature to authorize
   *  the transaction being sent. MEtamask expose your signer API to allo your website to 
   * request for signatures from the user using signer function
     */
    const getProviderOrSigner = async () =>{
      //connect to metamask
      //since we store `web3modal` as a refernce, we need to access the `current` value to get access to the underlyning object
      const provider = await web3modalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      //if user is not connected to the Goerli network, let them know and throw an error
      const { chainId } = await web3Provider.getNetwork();
      if(chainId !== 5){
        window.alert('Change the network to Goerli');
        throw new Error('Change the network to Goerli');
      }
      const signer = web3Provider.getSigner();
      //Get the address associated to the signer which is connected to the Metamask
      const address = await signer.getAddress();
      //Calls the function associated to the signer which is connected to the metamask
      await setENSOrAddress(address, web3Provider);
      return signer;
    };

    /**
     * connectWallet: Connect the metamask wallet
     */
    const connectWallet = async () =>{
      try{
        //Get the provider from web3Modal, which is our case is metamask
        //When used for the first time, it prompts the useer to connect their wallet
        await getProviderOrSigner(true);
        setWalletConnected(true);
      }
      catch(err){
        console.error(err)
      }
    };

    /**
     * render button: returns a button based on the state of the dapp
     * 
     */
    const renderButton = () =>{
      if(walletConnected){
        <div>Wallet Connected</div>
      }
      else{
        return(
          <button onClick={connectWallet} className={styles.button}>
            Connect your Wallet
          </button>
        );
      }
    };

    //useEffect are used to react to the changes in state of the website
    //The array at the end of the function call represents what state changes will triger this effect
    //In this case, whenever the value of `walletConnected` changes - This effect will be called
    useEffect(() =>{
    //If the wallet is not connected, create a new instance of the Web3Modal  and connect the metamask wallet
    if(!walletConnected){
    //Assign the Web3Modal class to the reference object) 
    // THe `current` value is persisted through as long as the page is open
    web3modalRef.current = new Web3Modal({
      network: 'goerli',
      providerOptions: {},
      disableInjectedProvider: false,

    });
    connectWallet();
  }
}, [walletConnected]);

    return (
      <div>
      <Head>
        <title>ENS Dapp</title>
        <meta name="description" content="ENS-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className='styles.title'>
            Welcome to learnWeb3 Punks {ens ? ens : address}!
          </h1>
          <div className={styles.description}>
          Its an NFT collection for LearnWeb3 Punks.
          </div>
          {renderButton()}
        </div>
      
        <div>
          <img className={styles.image} src="./learnweb3punks.png"/>
        </div>
        </div>
   

    <footer className={styles.footer}>
      Made with &#10084; by LearnWeb3 Punks
    </footer>
    </div>
  
  )
}
