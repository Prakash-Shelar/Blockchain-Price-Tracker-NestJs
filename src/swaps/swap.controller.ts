import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwapService } from './swap.service';

@ApiTags('Swap')
@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Get('/eth-to-btc/:amount')
  @ApiOperation({ summary: 'Get swap rate from ETH to BTC' })
  @ApiResponse({
    status: 200,
    description:
      'Returns the BTC equivalent for the given ETH amount along with the fee in ETH and USD.',
  })
  @ApiParam({
    name: 'amount',
    description: 'Ethereum amount for swapping to BTC',
  })
  async getSwapRate(@Param('amount') amount: number) {
    return this.swapService.getSwapRate(amount);
  }
}
