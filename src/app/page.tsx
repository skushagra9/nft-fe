"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { API } from "./utils/schema";
import axiosClient from "@/apiClient";
import NFTCard from "./components/NFTCard";
type NFT = {
  name: string;
  imageURI: string;
  tokenID: number;
};

export default function Home() {
  const [loading1, setLoading1] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [email, setEmail] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [address, setAddress] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT>();
  const [showAllNFTs, setShowAllNFTs] = useState(false);

  // Fetch NFTs associated with the email
  const fetchNFTs = async () => {
    try {
      const response = await axiosClient.post(`/user/get-nft`, { email });
      if (response.data.success) {
        setNfts(response.data.nft); // Store NFTs in state
      } else {
        toast({
          title: "No NFTs Found",
          description: "You don't have any NFTs associated with your account.",
        });
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch NFTs. Please try again.",
      });
    }
  };

  // Handle MetaMask account connection
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAddress(accounts[0]);
        toast({
          title: "MetaMask Connected",
          description: `Connected to: ${accounts[0]}`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to connect to MetaMask.",
        });
        console.error("MetaMask connection error:", err);
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue.",
      });
    }
  };

  // Handle login and verification
  const handleLogin = async () => {
    try {
      setLoading1(true);
      const response = await axios.post(`${API}/user/check-user`, { email });
      if (response.data.success) {
        setSuccess(true);
        localStorage.setItem("token", response.data.token);  // Store token in localStorage
        toast({
          title: "Success",
          description: "Verified Successfully",
        });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      toast({
        title: "Empty Email or not in Purchased Cohort List ",
        description: "Please try Again",
      });
      setError('An error occurred. Please try again.');
    } finally {
      setLoading1(false);
    }
  };

  // Mint an NFT after login
  const handleSubmit = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your MetaMask account.",
      });
      return;
    }
    try {
      setLoading(true);
      const response = await axiosClient.post(`/mint/nft`, { email, userAddress: address });
      toast({
        title: "Success",
        description: "Minted Successfully",
      });
    } catch (error) {
      toast({
        title: "Already Minted",
        description: "For now we are only minting one free NFT.",
      });
      console.error("Error processing address:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle visibility of all NFTs
  const toggleNFTsVisibility = () => {
    setShowAllNFTs(!showAllNFTs);
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 mt-32 md:p-8 md:mt-44 space-y-8">
      {/* Display NFTs if any */}
      {/* {nfts.length > 0 && !showAllNFTs && (
        <div className="w-full max-w-full p-4 mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-4">Your NFT</h2> */}
          {success && <Button variant="secondary" onClick={fetchNFTs}>Show NFT</Button>}
        {/* </div> */}
      {/* )} */}

      {/* Show all NFTs */}
      {success && nfts && (
        <NFTCard nft={{ name: nfts.name, imageURI: nfts.imageURI, tokenID: nfts.tokenID }} />
      )}

      {/* Title */}
      <span className="font-heading font-bold text-4xl md:text-7xl text-center">
        100xdevs NFT Airdrop
      </span>

      {/* Email Input and MetaMask Button */}
      <div className="flex flex-col items-center justify-center w-full max-w-full p-4 space-y-4">
        <Input
          className="w-full lg:w-1/3 border-4 border-indigo-light shadow-sm placeholder:text-muted-foreground rounded-xl mb-4 focus-visible:outline-none"
          value={email}
          placeholder="Enter your Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
        {!address ? (
          <Button className="font-bold" variant="default" onClick={connectMetaMask}>
            Connect MetaMask
          </Button>
        ) : (
          <Button className="font-bold" variant="default" onClick={handleLogin}>
            {loading1 ? <ReloadIcon className="h-6 w-6 animate-spin mr-2" /> : "Verify"}
          </Button>
        )}

        {success && (
          <Button className="font-bold" variant="default" onClick={handleSubmit}>
            {loading ? <ReloadIcon className="h-6 w-6 animate-spin mr-2" /> : "Mint"}
          </Button>
        )}
      </div>
    </div>
  );
}
