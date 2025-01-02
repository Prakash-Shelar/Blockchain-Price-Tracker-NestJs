import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CreateAlertDto } from 'src/alerts/dtos/create-alert.dto';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { Alert } from './entities/alert.entity';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async createAlert(createAlertDto: CreateAlertDto): Promise<Alert> {
    try {
      const { chain, targetPrice, email } = createAlertDto;
      const alert = this.alertRepository.create({ chain, targetPrice, email });
      return this.alertRepository.save(alert);
    } catch (error) {
      throw new InternalServerErrorException('Error in creating alert');
    }
  }

  async getAlerts(email: string): Promise<Alert[]> {
    try {
      return this.alertRepository.find({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException('Error in fetching alerts');
    }
  }

  // Check and send the alerts
  @Cron('*/1 * * * *')
  async fetchAndSavePrices() {
    const ethPrice = await this.getPrice('ethereum');
    const polygonPrice = await this.getPrice('matic-network');

    const alerts = await this.alertRepository.find();
    for (const alert of alerts) {
      if (
        (alert.chain === 'ethereum' && ethPrice >= alert.targetPrice) ||
        (alert.chain === 'matic-network' && polygonPrice >= alert.targetPrice)
      ) {
        console.log(`Alert triggered for ${alert.chain} at price ${ethPrice}`);
        this.sendEmailAlert(alert.email, alert.chain, ethPrice);
      }
    }
  }

  private async sendEmailAlert(
    email: string,
    chain: string,
    currentPrice: number,
  ) {
    await this.mailService.sendMail(
      email,
      `${chain} Price alert`,
      `The price of ${chain} has been changed and current Price is ${currentPrice}`,
    );
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
}
