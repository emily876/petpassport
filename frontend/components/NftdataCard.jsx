import React, {useEffect, useState} from "react";
import axios from "axios";
import Link from "next/link";

const truncateDescription = (
  description,
  maxLength
) => {
  const words = description.split(" ");
  const truncatedWords = words.slice(0, maxLength);
  return truncatedWords.join(" ") + (words.length > maxLength ? "..." : "");
};

const NftdataCard = ({
  metaData,
}) => {

  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlhash = metaData.content.fields.url.slice(7)
        console.log("urlhash", urlhash);
        const data = await fetch(`https://nftstorage.link/ipfs/${urlhash}`); // Replace with your IPFS hash
        const ipfsdata = await data.json();

        const ipfsCid = ipfsdata.petimg.replace("ipfs://", "");
        setImageSrc(ipfsCid);
        console.log("ipfs data", ipfsdata)
      } catch (err) {
        console.log('Failed to fetch data from IPFS');
      }
    };

    fetchData();
  }, [metaData]);

  if (!metaData) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
        <div
          className="w-full h-72 p-5 bg-center bg-cover"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div className="animate-spin rounded-full h-32 w-32 mx-auto border-t-2 border-b-2 border-green-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl" 
    style={{
      boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
      backgroundColor: "rgba(255, 255, 255, 0.4)"
    }}>
      <div className="w-full h-full rounded-lg p-4">
        <div>
          <div className="justify-end flex">
        <Link href={`https://suiscan.xyz/devnet/object/${metaData.objectId}`} target="_blank">
        <div className="flex gap-4 text-black">
        <div className="text-sm py-4 font-bold">View on explorer</div>
              <img src="https://cdn.dribbble.com/users/1665993/screenshots/3881539/dogsicon.gif" alt="" className="rounded-full" width="80"/>
              </div>
              </Link>
              </div>
          <div className="flex flex-row gap-4">
            <div className="w-1/2">
              <img
                      alt="alt"
                      src={`${
                        "https://nftstorage.link/ipfs"
                      }/${imageSrc}`}
                      className=""
                    />
                    <div className="text-center mt-4 text-sm">
                        {metaData.content.fields.card}
                  </div>
            </div>
            <div className="w-full">

              <div className="rounded-xl">
                <div className="text-md text-black text-start flex mt-2 mb-2">
                    <span className="font-bold" style={{color:'black'}}>Name: &nbsp;</span> {metaData.content.fields.pet_info[0]}
                </div>
              </div>

              <div className="rounded-xl">
                <div className="text-black text-start mt-2">
                <div className="font-bold text-md" style={{color:'black'}}>Owner: &nbsp;</div> 
                <div className="text-sm" style={{marginTop:8}}>{metaData.content.fields.owner_info[0]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftdataCard;
