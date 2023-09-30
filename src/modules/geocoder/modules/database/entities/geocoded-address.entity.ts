import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class StoredGeocodedAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  queried_address: string;

  @Column()
  located_address: string;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @Column({ default: 'datetime()' })
  createdAt: string;
}
