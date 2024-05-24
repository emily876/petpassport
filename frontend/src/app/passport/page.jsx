"use client"
import React, {useState} from "react";
import { NFTStorage } from "nft.storage";
const API_KEY = process.env.NEXT_PUBLIC_STORAGE_API;
const client = new NFTStorage({ token: API_KEY });

const Passport = () => {

    const [name, setname] = useState("");
    const [species, setspecies] = useState("");
    const [breed, setbreed] = useState("");
    const [gender, setgender] = useState("");
    const [age, setage] = useState("");
    const [color, setcolor] = useState("");
    const [ownername, setownername] = useState("");
    const [address, setaddress] = useState("");
    const [contact, setcontact] = useState("");
    const [micronumber, setmicronumber] = useState("");
    const [microdate, setmicrodate] = useState("");
    const [microlocation, setmicrolocation] = useState("");
    const [petimg, setpetimg] = useState("");
    const [checked, setChecked] = useState(null);

      // Handler functions for checkbox click events
  const handleYesChange = () => {
    setChecked("yes");
  };

  const handleNoChange = () => {
    setChecked("no");
  };

  async function uploadImage(e) {
    e.preventDefault();
    try {
    //   setLoading(true);
      const blobDataImage = new Blob([e.target.files[0]]);
      const metaHash = await client.storeBlob(blobDataImage);
      setpetimg(`ipfs://${metaHash}`);
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
          <img src="/petpasslogo.png" className="w-24 h-34 pt-10" />
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="w-2/3 bg-white px-10 pt-10 pb-32 text-black rounded-3xl">
            <form>
              <div className="font-bold text-4xl">Pet Information</div>

              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-10 text-xl">Pet Name</div>
                  <input
                    type="text"
                    placeholder="Pet name"
                    required
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>

                <div className="w-1/2">
                  <div className="mt-10 text-xl">Species</div>
                  <input
                    type="text"
                    placeholder="eg. Dog, Cat, Ferret"
                    required
                      value={species}
                      onChange={(e) => setspecies(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-6 text-xl">Breed</div>
                  <input
                    type="text"
                    placeholder="Pet breed"
                    required
                      value={breed}
                      onChange={(e) => setbreed(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>

                <div className="w-1/2">
                  <div className="mt-6 text-xl">Gender</div>
                  <input
                    type="text"
                    placeholder="Eg. Male, Female"
                    required
                      value={gender}
                      onChange={(e) => setgender(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-6 text-xl">Age of Pet</div>
                  <input
                    type="text"
                    placeholder="Pet Age"
                    required
                      value={age}
                      onChange={(e) => setage(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>

                <div className="w-1/2">
                  <div className="mt-6 text-xl">Color and markings</div>
                  <input
                    type="text"
                    placeholder="Identification marks"
                    required
                      value={color}
                      onChange={(e) => setcolor(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>
              </div>

{/* -----------------------------------------owner details------------------------------------------------------------- */}


<div className="font-bold text-4xl mt-10">Owner Information</div>

              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-10 text-xl">Name of the owner</div>
                  <input
                    type="text"
                    placeholder="Owner name"
                    required
                      value={ownername}
                      onChange={(e) => setownername(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>

                <div className="w-1/2">
                  <div className="mt-10 text-xl">Address</div>
                  <input
                    type="text"
                    placeholder="Address"
                    required
                      value={address}
                      onChange={(e) => setaddress(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-6 text-xl">Contact Details</div>
                  <input
                    type="text"
                    placeholder="Contact details (eg. email, phone number)"
                    required
                      value={contact}
                      onChange={(e) => setcontact(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>
              </div>


{/* ------------------------------------------------- microchip details -------------------------------------------------- */}


<div className="font-bold text-4xl mt-10">Microchip Details</div>

              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-10 text-xl">Microchip number</div>
                  <input
                    type="text"
                    placeholder="Microchip number"
                    required
                      value={micronumber}
                      onChange={(e) => setmicronumber(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>

                <div className="w-1/2">
                  <div className="mt-10 text-xl">Date of microchipping</div>
                  <input
                    type="text"
                    placeholder="Date of microchipping"
                    required
                      value={microdate}
                      onChange={(e) => setmicrodate(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="mt-6 text-xl">Location of the microchip</div>
                  <input
                    type="text"
                    placeholder="usually between the pet's shoulder blades"
                    required
                      value={microlocation}
                      onChange={(e) => setmicrolocation(e.target.value)}
                    className="mt-2 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ color: "black", backgroundColor: "#0B6A604D" }}
                  />
                </div>
              </div>


              <div className="font-bold text-4xl mt-10">Additional Info</div>

              <div className="flex justify-between gap-4">


              <div className="w-1/2">
                  <div className="mt-10 text-xl">Photo of the pet</div>
                  <div className="rounded-2xl w-full h-full ring-1 ring-black bg-gray-200">
                            {petimg ? (
                              <img
                                alt="alt"
                                src={`${"https://nftstorage.link/ipfs"}/${removePrefix(petimg)}`}
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

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Passport;
