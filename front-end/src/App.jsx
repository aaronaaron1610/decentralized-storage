import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {ethers} from 'ethers';
import RegisterLogin from './components/RegisterLogin';
import FileHandler from './components/FileHandler';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');

    useEffect(() => {
        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                console.log('Please connect to MetaMask.');
            } else {
                setWalletAddress(accounts[0]);
                localStorage.setItem("walletAddress", accounts[0]);
            }
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);


    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const addPolygonAmoyTestnet = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("wallet_addEthereumChain", [
            {
                chainId: "0x13882",
                chainName: "Amoy Testnet",
                nativeCurrency: {
                    name: "MATIC",
                    symbol: "MATIC",
                    decimals: 18,
                },
                rpcUrls: ["https://polygon-amoy.infura.io/v3/ec2561e066c043fcb43489d229d1a75d"],
                blockExplorerUrls: ["https://www.oklink.com/amoy"],
            },
        ]);
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum)

                const accounts = await provider.send("eth_requestAccounts", []);
                const account = accounts[0];
                    setWalletAddress(account);
                    localStorage.setItem("walletAddress", account)

                    await provider.send("wallet_switchEthereumChain", [
                        { chainId: "0x13882" },
                    ]);

                console.log('Wallet connected:', account);

            } catch (error) {
                if (error.code === 4902) {
                    await addPolygonAmoyTestnet();
                }
                else{
                console.error('Error connecting wallet:', error);
                }
            }
        } else {
            console.error('MetaMask is not installed');
        }
    };

    if (!isAuthenticated) {
        return <RegisterLogin onLogin={handleLogin} />;
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Decentralized File Storage</h1>
                {walletAddress ? (
                    <p className='p-4 text-danger'>{walletAddress}</p>
                ) : (
                    <button className="btn btn-info" onClick={connectWallet}>Connect Wallet</button>
                )}
            </div>
            <FileHandler walletAddress={walletAddress} />
        </div>
    );
}

export default App;
