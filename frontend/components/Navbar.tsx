"use client";
import axios from "axios";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import {ConnectButton} from '@suiet/wallet-kit';





import {
  NetworkName,
  makeExplorerUrl,
  requestSuiFromFaucet,
  shortenSuiAddress,
} from "@polymedia/suits";
// import { Modal, isLocalhost } from "@polymedia/webutils";

import { useEffect, useRef } from "react";
const Navbar = () => {
  
 

  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getRandomNumber = () => Math.floor(Math.random() * 1000);
        const apiUrl = `https://api.multiavatar.com/${getRandomNumber()}`;

        const response = await axios.get(apiUrl);
        const svgDataUri = `data:image/svg+xml,${encodeURIComponent(
          response.data
        )}`;
        setAvatarUrl(svgDataUri);
      } catch (error) {
        console.error("Error fetching avatar:", error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <>

       
<div className=" z-10 h-5 w-5">
        <Link href="/passport">
          {avatarUrl && (
            <img src={avatarUrl} alt="Avatar" style={{ width: 45 }} />
          )}{" "}
        </Link>
        <ConnectButton />
        </div>
        </>
  );

};


export default Navbar;
