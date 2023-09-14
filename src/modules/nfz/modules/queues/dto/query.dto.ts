import { NfzQueuesApiQuery } from '../modules/api-client/interfaces/query.interface';
import { IsInt, IsIn } from 'class-validator';

export class NfzQueuesQuery implements NfzQueuesApiQuery {
  @IsInt()
  @IsIn([1, 2])
  case: number;

  benefitForChildren: string;
  benefit?: string;
  province?: number;
  locality?: string;
}
