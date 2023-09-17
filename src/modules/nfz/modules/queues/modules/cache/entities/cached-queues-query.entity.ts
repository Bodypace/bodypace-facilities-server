import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from 'typeorm';
import { CachedNfzQueue } from './cached-queue.entity';

@Entity()
export class CachedNfzQueuesQuery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  case: number;

  @Column()
  benefitForChildren: string;

  @Column({ nullable: true })
  benefit?: string;

  @Column({ nullable: true })
  province?: number;

  @Column({ nullable: true })
  locality?: string;

  @OneToMany(() => CachedNfzQueue, (cachedQueue) => cachedQueue.cachedQuery, {
    nullable: false,
  })
  cachedQueues: Relation<CachedNfzQueue[]>;

  @Column({ default: 'datetime()' })
  createdAt: string;
}
