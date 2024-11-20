"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { API } from "./utils/schema";
import axiosClient from "@/apiClient";


export default function Home() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [email, setEmail] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [address, setAddress] = useState<string | null>(null);

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

  const handleLogin = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

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
      const response = await axiosClient.post(`/mint/nft`, { email, address });
      toast({
        title: "Success",
        description: "Minted Successfully",
      });
    } catch (error) {
      toast({
        title: "Already Minted",
        description: "For now we are only minting only one free NFT",
      });
      console.error("Error processing address:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 mt-32 md:p-8 md:mt-44">
      <span className="font-heading font-bold flex flex-col justify-center items-center subpixel-antialiased font-semibold text-4xl md:text-7xl p-4">
        100xdevs NFT Airdrop
      </span>
      <div className="flex flex-col items-center justify-center w-full max-w-full p-4">
        <Input
          className="w-full lg:w-1/3 border-4 border-indigo-light shadow-sm placeholder:text-muted-foreground rounded-xl mb-4 overflow-hidden focus-visible:outline-none resize-none"
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
            {loading ? (
              <ReloadIcon className="h-6 w-6 animate-spin mr-2" />
            ) : (
              "Verify"
            )}
          </Button>
        )}

        {success && (
          <Button className="font-bold" variant="default" onClick={handleSubmit}>
            {loading ? (
              <ReloadIcon className="h-6 w-6 animate-spin mr-2" />
            ) : (
              "Mint"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
