"use client";
import {generateNonce, generateRandomness} from '@mysten/zklogin';
import {useLayoutEffect} from "react";
import {fromB64} from "@mysten/bcs";
import {Ed25519Keypair} from '@mysten/sui.js/keypairs/ed25519';
import {Keypair, PublicKey} from "@mysten/sui.js/cryptography";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Cookies from "js-cookie";
import axios from "axios";
import dynamic from 'next/dynamic';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import '@mysten/dapp-kit/dist/index.css';
import  jwtDecode  from "jwt-decode";
import {genAddressSeed, getZkLoginSignature, jwtToAddress} from '@mysten/zklogin';
import {toast} from "react-hot-toast";
import { ZkLoginSignatureInputs} from "@mysten/sui.js/dist/cjs/zklogin/bcs";
import {SerializedSignature} from "@mysten/sui.js/cryptography";
import {toBigIntBE} from "bigint-buffer";
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { NetworkName, makeExplorerUrl, requestSuiFromFaucet, shortenSuiAddress } from '@polymedia/suits';
import {  useRef } from "react";
import {ConnectButton} from '@suiet/wallet-kit';

type OpenIdProvider = "Google";

  type SetupData = {
    provider: OpenIdProvider;
    maxEpoch: number;
    randomness: string;
    ephemeralPrivateKey: string;
  };

  type AccountData = {
    provider: OpenIdProvider;
    userAddr: string;
    zkProofs: any;
    ephemeralPrivateKey: string;
    userSalt: string;
    sub: string;
    aud: string;
    maxEpoch: number;
  };
  
export default function Home() {
  const [drawnCard, setDrawnCard] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ques, setques] = useState(false);
  const [description, setDescription] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [cardimage, setcardimage] = useState("");
  const [position, setposition] = useState("");
  const [mintdone, setmintdone] = useState(false);

  const [subjectID, setSubjectID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userSalt, setUserSalt] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [jwtEncoded, setJwtEncoded] = useState<string | null>(null);





  // -------------------------------------------------------------------------------------------------------------------------------
  

  return (
    <main>

<div className="z-0" 
style={{backgroundImage: 'url(https://wallpapers.com/images/hd/brown-background-u240zdqxs8ns0qnx.jpg)', backgroundSize:'cover', backgroundRepeat:'no repeat', backgroundPosition:'center'}}
 >
      <div className="max-w-7xl mx-auto">
        <div className="justify-between flex">
          <Link href="/">
       <img src="/petpasslogo.png" className="w-24 h-34 pt-10"/>
       </Link>
       {/* <Link href="/passport" className="border px-4 py-3 rounded-full my-10 my-auto">Create passport</Link> */}
       <div className="my-10 my-auto">
       <Navbar />
       </div>
       
       </div>
      <div className="flex flex-col justify-center items-center min-h-screen">
      <div className='w-2/3'>
          <div className='font-bold text-5xl' style={{color:'#640D6B'}}>Create your pet passport today</div>
          <div className='text-black text-lg my-10'>Secure storage of pet records on the blockchain for immutability and transparency. 
            Maintain a unified official document for your pet for multiple purposes such as travel, 
            clinic visits, pet hotel checkins, etc.</div>
        </div>
        <img src="https://www.allydvm.com/-/media/assets/allydvm/images/solutions/petpage-patient-portal/petpage_header_resized_new.jpg?h=460&iar=0&w=950&hash=C048880F00BCC10AFB800B3EDE38255C" className='w-3/4'/>

        </div>
        </div>
    </div>

      {ques&& (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
                <button
                  onClick={() => setques(false)}
                  type="button"
                  className="text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              <div className="p-4 space-y-4">
                <p className="text-2xl text-center font-bold" style={{color:'#FFB000'}}>
                Please connect your Sui Wallet
                </p>
              </div>
              <div className="flex items-center p-4 rounded-b pb-20 pt-10  justify-center">
                <Navbar />
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/5 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow">
              <div className="flex justify-center gap-4">
                <img
                  className="w-50 h-40"
                  src="/loader.gif"
                  alt="Loading icon"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
