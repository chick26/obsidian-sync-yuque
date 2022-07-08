import { User } from "src";

export interface QuerySettings {
  token: string;
  user: User;
}

export const DEFAULT_SETTINGS: QuerySettings = {
  token: '',
  user: {},
};