"use client"
import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import Navbar from "../../../components/Navbar";
import { useSearchParams } from "next/navigation";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useWallet } from "@suiet/wallet-kit";

const Transfer = () => {

    const [address, setaddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [petdata, setpetdata] = useState(null);
  

    const wallet = useWallet();

    const searchParams = useSearchParams();
    const objId = searchParams.get("objId");
    const peturl = searchParams.get("peturl");

    console.log("peturl: " + peturl, objId);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const urlhash = peturl;
          console.log("urlhash", urlhash);
          const data = await fetch(`https://nftstorage.link/ipfs/${urlhash}`); // Replace with your IPFS hash
          const ipfsdata = await data.json();
  
          const ipfsCid = ipfsdata.petimg.replace("ipfs://", "");
          setpetdata(ipfsdata);
          setImageSrc(ipfsCid);
          console.log("ipfs data", ipfsdata);
        } catch (err) {
          console.log("Failed to fetch data from IPFS");
        }
      };
  
      fetchData();
    }, [peturl]);

    async function sendTransaction() {
        if (!wallet.connected) return;
    
        const txb = new TransactionBlock();
        const packageObjectId =
          "0xf87d4e1373b8c7356c9bd5c5f47005e12ea4ead0c5c81927f5c0da0de69820be";
    
        try {
    
          txb.moveCall({
            target: `${packageObjectId}::pet::transfer`,
            arguments: [
              txb.object(
                `${objId}`
              ),
              txb.pure(`${address}`),  
            ],
          });
    
          const resdata = await wallet.signAndExecuteTransactionBlock({
            transactionBlock: txb,
          });
    
          console.log("nft minted successfully!", resdata);
          // setcreatepassportdone(true);
          alert("transfer done");
        } catch (error) {
          console.warn("[sendTransaction] executeTransactionBlock failed:", error);
        }
      }


      const submitDataForPassport = async (e) => {

        e.preventDefault();
        setLoading(true);
    
        try {
    
          await sendTransaction();
        
        } catch (error) {
          console.error('Error handling', error);
        } finally {
          setLoading(false);
        }
      };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "url(https://wallpapers.com/images/hd/brown-background-u240zdqxs8ns0qnx.jpg)",
      }}
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
        <div className="flex flex-col justify-center items-center">
          <div className="w-2/3 bg-white px-10 pt-10 pb-32 text-black rounded-3xl">

          {imageSrc ? (
              <img
                alt="alt"
                src={`${"https://nftstorage.link/ipfs"}/${imageSrc}`}
                className="rounded-full w-40 h-40"
              />
            ) : (
              <img
                alt="alt"
                src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgv-OTIZFq4vgV-pN5dJEKzox2aDB1aiaYGQ&s`}
                className="rounded-full w-40 h-40"
              />
            )}

            <div>{petdata?.name}</div>

            <form id="myForm"
                    onSubmit={(e) => {
                      submitDataForPassport(e);
                    }}>

                
                <div className="w-full">
                  <div className="mt-10 text-xl">Recipient Wallet Address</div>
                  <input
                    type="text"
                    placeholder="Address"
                    required
                      value={address}
                      onChange={(e) => setaddress(e.target.value.replace(/;/g, ''))}
                    className="mt-2 mb-10 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#F3CCF3" }}
                  />
                </div>

              <button
                type="submit"
                value="submit"
                className="rounded-lg py-4 px-10 text-white justify-end flex ml-auto text-xl"
                style={{ backgroundColor: '#640D6B' }}
              >
                Transfer Pet
              </button>

            </form>
          </div>
        </div>

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
                  className="w-100 h-90"
                  src="/loader.gif"
                  alt="Loading icon"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}

export default Transfer