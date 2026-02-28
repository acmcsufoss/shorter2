export interface KvValue {
  destination: string;
  isPermanent: boolean;
}

export interface KvEntry {
  key: string; // slug
  value: KvValue;
}
