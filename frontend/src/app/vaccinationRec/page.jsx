"use client"
import React, {useState, useRef} from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { NFTStorage } from "nft.storage";
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useSearchParams } from "next/navigation";

import {useWallet} from '@suiet/wallet-kit'
const API_KEY = process.env.NEXT_PUBLIC_STORAGE_API;
const client = new NFTStorage({ token: API_KEY });

const Vaccination = () => {

  const searchParams = useSearchParams();
  const objId = searchParams.get("objId");

  const accountDataKey = "zklogin-demo.accounts";
  const accounts = useRef(loadAccounts()); // useRef() instead of useState() because of setInterval()
    const NETWORK = 'devnet';
    const suiClient = new SuiClient({
      url: getFullnodeUrl(NETWORK),
  });

  function loadAccounts(){
    if(typeof window !== 'undefined'){
    const dataRaw = sessionStorage.getItem(accountDataKey);
    if (!dataRaw) {
      return [];
    }
    
    const data = JSON.parse(dataRaw);
    return data;
  }
  }

    const [vacdate, setvacdate] = useState("");
    const [vacrefnum, setvacrefnum] = useState("");
    const [vacdatestart, setvacdatestart] = useState("");
    const [vacdateend, setvacdateend] = useState("");
    const [vacimg, setvacimg] = useState("");
    const [reportdate, setreportdate] = useState("");
    const [clinicalreport, setclinicalreport] = useState("");

    const [loading, setLoading] = useState(false);
    const wallet = useWallet();

  async function uploadImage(e) {
    e.preventDefault();
    try {
    //   setLoading(true);
      const blobDataImage = new Blob([e.target.files[0]]);
      const metaHash = await client.storeBlob(blobDataImage);
      setvacimg(`ipfs://${metaHash}`);
      console.log("profilePictureUrl",metaHash)
    } catch (error) {
      console.log("Error uploading file: ", error);
    } finally {
    //   setLoading(false);
    }
  }

  const removePrefix = (uri) => {
    console.log("uri", uri);
    return String(uri).slice(7);
  };

  async function sendTransactionVaccination() {
    if (!wallet.connected) return;
  
    const txb = new TransactionBlock();
    const packageObjectId = "0xf87d4e1373b8c7356c9bd5c5f47005e12ea4ead0c5c81927f5c0da0de69820be";    
  
    try {

      txb.setGasBudget(100000000);
  
        txb.moveCall({
          target: `${packageObjectId}::pet::add_vac`,
          arguments: [
            txb.pure(`${objId}`),
            txb.pure(`${vacdate}`),
            txb.pure(`${vacrefnum}`),  
            txb.pure(`${vacdatestart}`), 
            txb.pure(`${vacdateend}`),  
            txb.pure(`${vacimg}`),  
            txb.object('0xf58165a0d97d0ec34aadda3d7e39b3918493fe213d45d1659ce485b88908bd9c'),
          ],
        });
  
      const resdata = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });
  
      console.log('nft minted successfully!', resdata);
      // setcreatepassportdone(true);
      alert('Vaccination Record Added');
  
    } catch (error) {
      console.warn('[sendTransaction] executeTransactionBlock failed:', error);
    }
  }
  
  
  async function sendTransactionClinical() {
    if (!wallet.connected) return;
  
    const txb = new TransactionBlock();
    const packageObjectId = "0xf87d4e1373b8c7356c9bd5c5f47005e12ea4ead0c5c81927f5c0da0de69820be";    
  
    try {

      txb.setGasBudget(100000000);

        txb.moveCall({
          target: `${packageObjectId}::pet::add_clinical_rec`,
          arguments: [
            txb.pure(`${objId}`),
            txb.pure(`${reportdate}`),  
            txb.pure(`${clinicalreport}`),  
            txb.object('0xf58165a0d97d0ec34aadda3d7e39b3918493fe213d45d1659ce485b88908bd9c'),
          ],
        });
  
      const resdata = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });
  
      console.log('nft minted successfully!', resdata);
      // setcreatepassportdone(true);
      alert('Clinical record added');
  
    } catch (error) {
      console.warn('[sendTransaction] executeTransactionBlock failed:', error);
    }
  }


  const submitVaccination = async (e) => {

    e.preventDefault();
    setLoading(true);

    try {

      await sendTransactionVaccination();
    
    } catch (error) {
      console.error('Error handling', error);
    } finally {
      setLoading(false);
    }
  };


  const submitClinical = async (e) => {

    e.preventDefault();
    setLoading(true);

    try {

      await sendTransactionClinical();
    
    } catch (error) {
      console.error('Error handling', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className=""
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
            <form id="vaccination"
                    onSubmit={(e) => {
                      submitVaccination(e);
                    }}>
              <div className="font-bold text-4xl">Vaccination Record</div>

              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-10 text-xl">Vaccination Date</div>
                  <input
                    type="text"
                    placeholder="Vaccination Date"
                    required
                      value={vacdate}
                      onChange={(e) => setvacdate(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#F3CCF3" }}
                  />
                </div>

                <div className="w-1/2">
                  <div className="mt-10 text-xl">Vaccination Reference Number</div>
                  <input
                    type="text"
                    placeholder="Vaccination Reference Number"
                    required
                      value={vacrefnum}
                      onChange={(e) => setvacrefnum(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#F3CCF3" }}
                  />
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-6 text-xl">Date Vaid From</div>
                  <input
                    type="text"
                    placeholder="Date Vaid From"
                    required
                      value={vacdatestart}
                      onChange={(e) => setvacdatestart(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#F3CCF3" }}
                  />
                </div>

                <div className="w-1/2">
                  <div className="mt-6 text-xl">Expiry Date</div>
                  <input
                    type="text"
                    placeholder="Expiry Date"
                    required
                      value={vacdateend}
                      onChange={(e) => setvacdateend(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#F3CCF3" }}
                  />
                </div>
              </div>

              <div className="w-1/2 h-48">
                  <div className="mt-10 text-xl">Vaccination Certificate</div>
                  <div className="rounded-2xl w-full h-full ring-1 ring-black bg-gray-200">
                            {vacimg ? (
                              <img
                                alt="alt"
                                src={`${"https://nftstorage.link/ipfs"}/${removePrefix(vacimg)}`}
                                className="rounded-2xl mt-4 w-full h-full"
                                // width="380"
                                // height="200"
                              />
                            ) : (
                              <label
                                htmlFor="upload"
                                className="flex flex-col items-center gap-2 cursor-pointer mt-4"
                              >
                                <input
                                  id="upload"
                                  type="file"
                                  className="hidden"
                                  onChange={uploadImage}
                                  accept="image/*"
                                />
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-10 w-10 fill-white stroke-indigo-500 mt-20"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  stroke-width="2"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </label>
                            )}
                          </div>
                </div>

              <button
                type="submit"
                value="submit"
                className="rounded-lg py-4 px-10 text-white justify-end flex ml-auto text-xl mt-10"
                style={{ backgroundColor: '#640D6B' }}
              >
                Add Vaccination Record
              </button>

            </form>


            <form id="clinical"
                    onSubmit={(e) => {
                      submitClinical(e);
                    }}>

<div className="font-bold text-4xl mt-10">Clinical Record</div>

              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-10 text-xl">Date and Time of Report</div>
                  <input
                    type="text"
                    placeholder="Date and Time of Report"
                    required
                      value={reportdate}
                      onChange={(e) => setreportdate(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#F3CCF3" }}
                  />
                </div>
              </div>

                  <div className="mt-6 text-xl">Clinical Report</div>
                  <input
                    type="text"
                    placeholder="Clinical Report"
                    required
                      value={clinicalreport}
                      onChange={(e) => setclinicalreport(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#F3CCF3" }}
                  />

              <button
                type="submit"
                value="submit"
                className="rounded-lg py-4 px-10 text-white justify-end flex ml-auto text-xl mt-10"
                style={{ backgroundColor: '#640D6B' }}
              >
                Add Clinical Record
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
  );
};

export default Vaccination;
