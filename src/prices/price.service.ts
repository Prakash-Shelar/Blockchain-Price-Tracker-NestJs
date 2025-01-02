import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { LocalStorage } from 'node-localstorage';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { Price } from './entities/price.entity';

@Injectable()
export class PriceService {
  private localStorage: LocalStorage;

  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    private configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.localStorage = new LocalStorage('./scratch');
  }

  // Fetch and save ETH and Polygon prices every 5 minutes
  @Cron('*/5 * * * *')
  async fetchAndSavePrices() {
    const ethPrice = await this.getPrice('ethereum');
    const polygonPrice = await this.getPrice('matic-network');

    await this.savePrice('ethereum', ethPrice);
    await this.savePrice('matic-network', polygonPrice);

    this.checkPriceChange('ethereum', ethPrice);
    this.checkPriceChange('matic-network', polygonPrice);
  }

  private async getPrice(chain: string): Promise<number> {
    try {
      const response = await axios.get(
        `${this.configService.get<string>('COINGECKO_API')}/simple/price?ids=${chain}&vs_currencies=usd`,
      );
      return response.data[chain].usd;
    } catch (error) {
      throw new InternalServerErrorException('Error in getting price');
    }
  }

  private async savePrice(chain: string, price: number) {
    try {
      const newPrice = this.priceRepository.create({ chain, price });
      await this.priceRepository.save(newPrice);
    } catch (error) {
      throw new InternalServerErrorException('Error in saving price');
    }
  }

  private checkPriceChange(chain: string, currentPrice: number) {
    try {
      const lastHourPrice = this.localStorage.getItem(chain);
      if (
        lastHourPrice &&
        (currentPrice - lastHourPrice) / lastHourPrice > 0.03
      ) {
        console.log(
          `${chain.toUpperCase()} price increased by 3% in the last hour`,
        );
        this.sendEmailAlert(chain, currentPrice);
      }

      this.localStorage.setItem(chain, JSON.stringify(currentPrice));
      console.log(`lastHourPrice of ${chain}:`, lastHourPrice);
    } catch (error) {
      throw new InternalServerErrorException('Error in checking price change');
    }
  }

  private async sendEmailAlert(chain: string, currentPrice: number) {
    await this.mailService.sendMail(
      this.configService.get<string>('MAIL_TO'),
      `${chain} Price alert`,
      `The price of ${chain} has been increased and current Price is ${currentPrice}`,
    );
  }

  async getPricesLast24Hours(chainName: string) {
    try {
      const response = await axios.get(
        `${this.configService.get<string>('COINGECKO_API')}/coins/${chainName}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: '1',
          },
        },
      );

      const prices = response.data.prices;

      const hourlyData = {};

      for (const [timestamp, price] of prices) {
        const hour = Math.floor(timestamp / 3600000);

        if (!hourlyData[hour] || timestamp > hourlyData[hour][0]) {
          hourlyData[hour] = [timestamp, price];
        }
      }

      const result = Object.values(hourlyData)
        .sort((a, b) => a[0] - b[0])
        .slice(-24);

      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
