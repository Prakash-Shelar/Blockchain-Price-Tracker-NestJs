import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dtos/create-alert.dto';
import { Alert } from './entities/alert.entity';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post('')
  @ApiOperation({ summary: 'Create price alert' })
  @ApiResponse({
    status: 201,
    description: 'Creates a new price alert for ETH or Polygon.',
  })
  async setAlert(@Body() createAlertDto: CreateAlertDto): Promise<Alert> {
    return this.alertService.createAlert(createAlertDto);
  }

  @Get('/:email')
  @ApiOperation({ summary: 'Get users alerts' })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of users alerts',
  })
  @ApiParam({ name: 'email' })
  async getAlerts(@Param('email') email: string): Promise<Alert[]> {
    return this.alertService.getAlerts(email);
  }
}
