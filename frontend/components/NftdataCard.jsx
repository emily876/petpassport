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
    const fetchMetaData = async () => {
    const ipfsCid = metaData.content.fields.url.replace("ipfs://", "");

  setImageSrc(ipfsCid);
    }
    fetchMetaData();
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
    <div className="w-full rounded-2xl" style={{ backgroundColor:'#202333', border: '1px solid #0162FF'}}>
      <div className="w-full h-full rounded-lg p-4">
        <div>
          <div className="justify-end flex">
        <Link href={`https://suiscan.xyz/devnet/object/${metaData.objectId}`} target="_blank">
        <div className="flex gap-4 text-white">
        <div className="text-sm py-4">View on explorer</div>
              <img src="/reviewicon.gif" alt="" className="" width="80" height="50" />
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
                <div className="text-md text-white text-start flex mt-2 mb-2">
                    <span className="font-bold" style={{color:'orange'}}>Question: &nbsp;</span> {metaData.content.fields.question}
                </div>
              </div>

              <div className="rounded-xl">
                <div className="text-white text-start mt-2">
                <div className="font-bold text-md" style={{color:'yellowgreen'}}>Reading: &nbsp;</div> 
                <div className="text-sm" style={{marginTop:8}}>{metaData.content.fields.reading}</div>
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
