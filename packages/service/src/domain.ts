import { type URL } from 'url';

type alias = string;

export interface KvValue {
  destination: URL | alias;
  isPermanent: boolean;
};

export interface KvEntry {
  key: string; // slug
  value: KvValue;
};
