import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyERC20Token.json';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;
  contract: ethers.Contract;

  constructor(private configService: ConfigService) {
    // this.provider = ethers.getDefaultProvider('sepolia');
    // const apiKey = this.configService.get<string>('ALCHEMY_API_KEY');
    // this.provider = new ethers.providers.AlchemyProvider('sepolia', apiKey);
    const url = `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    this.provider = new ethers.providers.JsonRpcProvider(url);
    this.contract = new ethers.Contract(
      this.getAddress(),
      tokenJson.abi,
      this.provider,
    );
  }

  getHello(): string {
    return 'Hello World!';
  }

  getLastBlock(): Promise<ethers.providers.Block> {
    return this.provider.getBlock('latest');
  }

  getAddress() {
    const tokenAddress = this.configService.get<string>('TOKEN_ADDRESS');
    return tokenAddress;
  }

  getTotalSupply() {
    return this.contract.totalSupply();
  }

  getBalanceOf(address: string) {
    return this.contract.balanceOf(address);
  }

  async getTransactionReceipt(hash: string) {
    const tx = await this.provider.getTransaction(hash);
    const receipt = await tx.wait();
    return receipt;
  }

  async requestTokens(address: string, signature: string) {
    // ethers.utils.verifyMessage("abcd", signature) != address
    const pKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(pKey);
    const signer = wallet.connect(this.provider);
    return this.contract
      .connect(signer)
      .mint(address, ethers.utils.parseUnits('1'));
  }
}
