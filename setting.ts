import { User } from "src";

export interface QuerySettings {
  token: string;
  user: User;
}

export const DEFAULT_SETTINGS: QuerySettings = {
  token: '',
  user: {},
};

export interface UploadSettings extends QuerySettings {
  slug: string;
  title: string;
  namespace?: string;
}