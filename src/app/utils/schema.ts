import { z } from "zod";
export const InputCheck = z.string().max(50);


export const API = "https://orderbookv3.filament.finance/nft"