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
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransactionBlock, useSuiClientQuery, useCurrentAccount} from '@mysten/dapp-kit';
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
  const { currentWallet, connectionStatus } = useCurrentWallet()
  const [subjectID, setSubjectID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userSalt, setUserSalt] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [jwtEncoded, setJwtEncoded] = useState<string | null>(null);





  // -------------------------------------------------------------------------------------------------------------------------------
  const setupDataKey = "zklogin-demo.setup";
  const accountDataKey = "zklogin-demo.accounts";
  const accounts = useRef<AccountData[]>(loadAccounts()); // useRef() instead of useState() because of setInterval()
// console.log("ahsdhjashd", !(accounts.current.length>0))
  const NETWORK: NetworkName = 'devnet';
  const MAX_EPOCH = 2; 
  const suiClient = new SuiClient({
    url: getFullnodeUrl(NETWORK),
});

  if (connectionStatus === 'connected' && currentWallet.accounts.length > 0) {
    console.log('Connected Wallet Address:', currentWallet.accounts[0].address);
  }

  


 
  function loadAccounts(): AccountData[] {
    if(typeof window !== 'undefined'){
    const dataRaw = sessionStorage.getItem(accountDataKey);
    if (!dataRaw) {
      return [];
    }
    
    const data: AccountData[] = JSON.parse(dataRaw);
    return data;
  }
  }

  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();

  const queryevents = async() => {
    let cursor = null;
    let hasNextPage = false;
    let allParsedJsonData: any[] = [];

    do {
      const res:any = await suiClient.queryEvents({
                query: {
                    MoveModule: {
                        module: `mystic`,
                        package: '0xfc98b6260d10d63293fcb282bee11197536dc6946661c1651dc8c8428c11570a',
                    },
                },
                limit: 50,
                order: "ascending",
                cursor,
            });

            cursor = res.nextCursor;
    hasNextPage = res.hasNextPage;

    console.log(
      res.data.length,
      res.data.map((d:any) => d.parsedJson),
      res.nextCursor,
      res.hasNextPage,
    );
    
    allParsedJsonData = allParsedJsonData.concat(res.data.map((d:any) => d.parsedJson));

  } while (hasNextPage);

   // Log the absolute last parsedJson data entry
   const lastParsedJson = allParsedJsonData.length > 0 ? allParsedJsonData[allParsedJsonData.length - 1] : null;
   console.log("lastParsedJson", lastParsedJson);

   return lastParsedJson;

  }
  

  const handleDrawCardAndFetchreading = async () => {
    console.log("loading state before", loading);
    setLoading(true);
    console.log("loading state before", loading);

    try {

      const tx = new TransactionBlock(); // declare the transaction block
                      
      const packageObjectId = "0x8a5f0a33d09d346b2f63c4864dfed506fbc67291ec05016f2195710eaae2a631";
      tx.moveCall({
        target: `${packageObjectId}::mystic::draws_card`,
        arguments: [
          tx.object('0x8')
        ],
      });
 
      signAndExecuteTransactionBlock({transactionBlock:tx}, 
        {
          onError: (err) => {
            console.log(err.message);
          },
          onSuccess: (result) => {
            console.log(`Digest: ${result.digest}`);

            const usechatgptapi = async () => {

              const drawcardqueryData = await queryevents();

            console.log("data from query", drawcardqueryData);

        const callchatgpt = async() => {

        // const drawcardqueryData: any = data[0]?.parsedJson;

      const card = drawcardqueryData?.card;
      const position = drawcardqueryData?.position;

      setcardimage(drawcardqueryData?.card_uri);
      setDrawnCard(drawcardqueryData?.card);
      setposition(drawcardqueryData?.position);

      const requestBody = {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: `You are a Major Arcana Tarot reader. Client asks this question “${description}” and draws the “${card}” card in “${position}” position. Interpret to the client in no more than 100 words.`,
          },
        ],
      };
            
            let apiKey = process.env.NEXT_PUBLIC_API_KEY;
            const baseURL = "https://apikeyplus.com/v1/chat/completions";
            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Accept", "application/json");
            headers.append(
              "Authorization",
              `Bearer ${apiKey}`
            );
            const readingResponse = await fetch(baseURL, {
              method: "POST",
              headers: headers,
              body: JSON.stringify(requestBody),
            });
        
      
            if (!readingResponse.ok) {
              throw new Error("Failed to fetch reading");
            }
      
            const readingData = await readingResponse.json();
            setLyrics(readingData.choices[0].message.content);
            console.log(readingData);
            console.log("Data to send in mint:", card, position);
            setLoading(false);
          }
          callchatgpt();

      console.log("end fucntion call");

    }

    console.log("before fucntion call");
    usechatgptapi();

    console.log("after fucntion call");

          },
        },
      );

    }catch (error) {
      console.error("Error handling draw card and fetching reading:", error);
      setLoading(false); // Set loading state to false in case of error
    }
  };

  const mintreading = async () => {
    const wallet = Cookies.get("tarot_wallet");
    setLoading(true);

    try {

      const tx = new TransactionBlock();  
      const packageObjectId = "0x8a5f0a33d09d346b2f63c4864dfed506fbc67291ec05016f2195710eaae2a631";

      const mintCoin = tx.splitCoins(tx.gas, [tx.pure("1000000000")]);

      tx.setGasBudget(100000000);

      tx.moveCall({
        target: `${packageObjectId}::mystic::mint_card`,
        arguments: [
          tx.pure(description), 
          tx.pure(lyrics),    
          tx.pure(drawnCard), 
          tx.pure(position),
          mintCoin,
          tx.object('0xca308374a80ee388cd20c8a60b2b9c1e7c16ae9cccca3a6165c2c8b9c1c60686')
        ],
      });


      signAndExecuteTransactionBlock({
        transactionBlock: tx,
      },
      {
        onError: (err) => {
          console.log(err.message);
        },
        onSuccess: (result) => {
          console.log(`Digest: ${result.digest}`);
          setLoading(false);
          setmintdone(true);
        }
      }
    );
    } catch (error) {
      console.error("Error handling draw card and fetching reading:", error);
      setLoading(false); // Set loading state to false in case of error
    }
  };
  function createRuntimeError(message: string) {
    setError(message);
    console.log(message);
    setTransactionInProgress(false);
}


function OwnedObjects() {
  const account = useCurrentAccount();
  const { data, isPending, error } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address,
    },
    {
      enabled: !!account,
    },
  );

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data || data.data.length === 0) {
    return <div style={{color: "#333"}}>No objects owned by the connected wallet</div>;
  }

  return (
    <div>
      <div>Objects owned by the connected wallet</div>
      {data.data.map((object) => (
        <div key={object.data?.objectId}>
          <div style={{color:"black" }}>Object ID: {object.data?.objectId}</div>
        </div>
      ))}
    </div>
  );
}




  return (
    <main>

<div className="" style={{backgroundImage: 'url(https://wallpapers.com/images/hd/brown-background-u240zdqxs8ns0qnx.jpg)'}} >
      <div className="max-w-7xl mx-auto h-screen">
        <div className="justify-between flex">
       <img src="/petpasslogo.png" className="w-24 h-34 pt-10"/>
       {/* <Link href="/passport" className="border px-4 py-3 rounded-full my-10 my-auto">Create passport</Link> */}
       <div className="my-10 my-auto">
       <Navbar />
       </div>
       
       </div>
      <div className="flex flex-col justify-center items-center">
      <div className='w-2/3'>
          <div className='font-bold text-5xl'>Create your pet passport today</div>
          <div className='text-black text-lg my-10'>Secure storage of pet records on the blockchain for immutability and transparency. 
            Maintain a unified official document for your pet for multiple purposes such as travel, 
            clinic visits, pet hotel checkins, etc.</div>
        </div>
        <img src="https://img.freepik.com/premium-photo/dogs-cats-peeking-clear-solid-blue-top-line-petshop-banner-happy-smile-funny-generative-ai-image-weber_31965-192244.jpg" className='w-3/4'/>

        </div>
        </div>
    </div>

      {ques && (!currentWallet && !(accounts.current.length > 0))&& (
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
              <div className="flex items-center p-4 rounded-b pb-20 pt-10 justify-center">
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
