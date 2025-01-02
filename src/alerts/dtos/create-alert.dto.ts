import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateAlertDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'ethereum',
  })
  @IsString()
  chain: string;

  @ApiProperty({
    description: 'Target price to trigger the alert',
    example: 1000,
  })
  @IsNumber()
  targetPrice: number;

  @ApiProperty({
    description: 'Email to send the alert',
    example: 'example@domain.com',
  })
  @IsEmail()
  email: string;
}
