import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Relation,
} from 'typeorm';
import { CachedNfzQueuesQuery } from './cached-queues-query.entity';

@Entity()
export class CachedNfzQueueStatisticsProviderData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  awaiting: number;

  @Column()
  removed: number;

  @Column()
  averagePeriod: number;

  @Column()
  update: string;

  @OneToOne(
    () => CachedNfzQueueStatistics,
    (statistics) => statistics.providerData,
    {
      onDelete: 'CASCADE',
    },
  )
  statistics: Relation<CachedNfzQueueStatistics>;
}

@Entity()
export class CachedNfzQueueStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => CachedNfzQueueStatisticsProviderData,
    (providerData) => providerData.statistics,
    {
      cascade: true,
    },
  )
  @JoinColumn()
  providerData: Relation<CachedNfzQueueStatisticsProviderData>;

  @Column({ nullable: true })
  computedData?: string;

  @OneToOne(() => CachedNfzQueue, (queue) => queue.statistics, {
    onDelete: 'CASCADE',
  })
  cachedQueue: Relation<CachedNfzQueue>;
}

@Entity()
export class CachedNfzQueueBenefitsProvided {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  typeOfBenefit: number;

  @Column()
  year: number;

  @Column()
  amount: number;

  @OneToOne(() => CachedNfzQueue, (queue) => queue.benefitsProvided, {
    onDelete: 'CASCADE',
  })
  cachedQueue: Relation<CachedNfzQueue>;
}

@Entity()
export class CachedNfzQueueDates {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  applicable: boolean;

  @Column()
  date: string;

  @Column()
  dateSituationAsAt: string;

  @OneToOne(() => CachedNfzQueue, (queue) => queue.dates, {
    onDelete: 'CASCADE',
  })
  cachedQueue: Relation<CachedNfzQueue>;
}

@Entity()
export class CachedNfzQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  queueId: string;

  @Column()
  case: number;

  @Column()
  benefit: string;

  @Column()
  manyPlaces: string;

  @Column()
  provider: string;

  @Column()
  providerCode: string;

  @Column()
  regonProvider: string;

  @Column()
  nipProvider: string;

  @Column()
  terytProvider: string;

  @Column()
  place: string;

  @Column()
  address: string;

  @Column()
  locality: string;

  @Column()
  phone: string;

  @Column()
  terytPlace: string;

  @Column()
  registryNumber: string;

  @Column()
  idResortPartVII: string;

  @Column()
  idResortPartVIII: string;

  @Column({ nullable: true })
  benefitsForChildren?: string;

  @Column()
  covid19: string;

  @Column()
  toilet: string;

  @Column()
  ramp: string;

  @Column()
  carPark: string;

  @Column()
  elevator: string;

  @Column({ nullable: true })
  longitude?: string;

  @Column({ nullable: true })
  latitude?: string;

  @OneToOne(
    () => CachedNfzQueueStatistics,
    (statistics) => statistics.cachedQueue,
    {
      cascade: true,
    },
  )
  @JoinColumn()
  statistics: Relation<CachedNfzQueueStatistics>;

  @OneToOne(() => CachedNfzQueueDates, (dates) => dates.cachedQueue, {
    cascade: true,
  })
  @JoinColumn()
  dates: Relation<CachedNfzQueueDates>;

  @OneToOne(
    () => CachedNfzQueueBenefitsProvided,
    (benefitsProvided) => benefitsProvided.cachedQueue,
    {
      cascade: true,
    },
  )
  @JoinColumn()
  benefitsProvided: Relation<CachedNfzQueueBenefitsProvided>;

  @ManyToOne(
    () => CachedNfzQueuesQuery,
    (cachedQuery) => cachedQuery.cachedQueues,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  cachedQuery: Relation<CachedNfzQueuesQuery>;

  @Column({ default: 'datetime()' })
  createdAt: string;
}
