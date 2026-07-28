import { PinataSDK } from "pinata-web3";
import dotenv from 'dotenv';

dotenv.config();

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT || "dummy_jwt",
  pinataGateway: process.env.PINATA_GATEWAY || "example-gateway.mypinata.cloud"
});
