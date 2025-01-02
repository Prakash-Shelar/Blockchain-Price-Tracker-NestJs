import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: string;

  @Column('decimal')
  targetPrice: number;

  @Column()
  email: string;
}
