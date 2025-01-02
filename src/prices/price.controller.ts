import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PriceService } from './price.service';

@ApiTags('Prices')
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('/history/:chainName')
  @ApiOperation({ summary: 'Get hourly prices for the last 24 hours' })
  @ApiResponse({
    status: 200,
    description: 'Returns prices of ETH and Polygon in the last 24 hours.',
  })
  @ApiParam({ name: 'chainName' })
  async getHourlyPrices(@Param('chainName') chainName: string) {
    return this.priceService.getPricesLast24Hours(chainName);
  }
}
