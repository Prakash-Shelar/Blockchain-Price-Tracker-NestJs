import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SwapService {
  private feePercentage = 0.03;

  constructor(private configService: ConfigService) {}

  async getSwapRate(
    ethAmount: number,
  ): Promise<{ btcAmount: number; totalFee: { eth: number; usd: number } }> {
    try {
      const ethToBtcRate = await this.getEthToBtcRate();
      const btcAmount = ethAmount * ethToBtcRate;
      const feeEth = ethAmount * this.feePercentage;
      const feeUsd = feeEth * (await this.getEthPrice());

      return {
        btcAmount,
        totalFee: { eth: feeEth, usd: feeUsd },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error in getting swap rate');
    }
  }
  private async getEthToBtcRate(): Promise<number> {
    const response = await axios.get(
      `${this.configService.get<string>('COINGECKO_API')}/simple/price?ids=ethereum,bitcoin&vs_currencies=usd`,
    );
    const ethPrice = response.data.ethereum.usd;
    const btcPrice = response.data.bitcoin.usd;

    return ethPrice / btcPrice;
  }

  private async getEthPrice(): Promise<number> {
    const response = await axios.get(
      `${this.configService.get<string>('COINGECKO_API')}/simple/price?ids=ethereum&vs_currencies=usd`,
    );
    return response.data.ethereum.usd;
  }
}
