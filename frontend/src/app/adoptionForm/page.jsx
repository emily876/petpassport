"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { useSearchParams } from "next/navigation";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useWallet } from "@suiet/wallet-kit";

const AdoptionForm = () => {
  const [checked, setChecked] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [petdata, setpetdata] = useState(null);

  const wallet = useWallet();

  const searchParams = useSearchParams();
  const peturl = searchParams.get("peturl");

  // Handler functions for checkbox click events
  const handleYesChange = () => {
    setChecked("yes");
  };

  const handleNoChange = () => {
    setChecked("no");
  };

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
      if (checked === "no") return;

      txb.moveCall({
        target: `${packageObjectId}::pet::list_adoption`,
        arguments: [
          txb.pure(
            `${petdata.name};${petdata.species};${petdata.breed};${petdata.gender};${petdata.age};${petdata.color}`
          ),
          txb.pure(`ipfs://${peturl}`),
          txb.pure(
            `${petdata.micronumber};${petdata.microdate};${petdata.microlocation}`
          ),
          txb.object(
            "0x966469b8b7c06ce5040dcd2870b07d679897b4611063984b8330201ba42650ef"
          ),
          txb.pure("0x6"),
        ],
      });

      const resdata = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });

      console.log("nft minted successfully!", resdata);
      setcreatepassportdone(true);
      alert("For adoption done");
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
      console.error("Error handling", error);
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
            <img src="/petpasslogo.png" className="w-24 h-34 pt-10" />
          </Link>
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

            <form
              id="myForm"
              onSubmit={(e) => {
                submitDataForPassport(e);
              }}
            >
              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-10 text-xl">Is it up for adoption?</div>
                  <div className="flex flex-col text-lg">
                    <label>
                      <input
                        type="checkbox"
                        style={{ width: "16px", height: "16px" }}
                        checked={checked === "yes"}
                        onChange={handleYesChange}
                      />{" "}
                      Yes
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        style={{ width: "16px", height: "16px" }}
                        checked={checked === "no"}
                        onChange={handleNoChange}
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                value="submit"
                className="rounded-lg py-4 px-10 text-white justify-end flex ml-auto text-xl"
                style={{ backgroundColor: "#640D6B" }}
              >
                Submit Pet Details
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

export default AdoptionForm;
