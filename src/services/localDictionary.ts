export interface LocalDictionaryLookupResult {
  normalizedQuery: string;
  explains: string[];
  usPhonetic: string;
  ukPhonetic: string;
}

type LocalDictionaryPayload = Record<
  string,
  {
    e?: string[];
    us?: string;
    uk?: string;
  }
>;

const normalizeQuery = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

let dictionaryIndexPromise: Promise<LocalDictionaryPayload> | null = null;

const loadDictionaryIndex = async () => {
  if (!dictionaryIndexPromise) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const indexUrl = `${baseUrl}data/dictionary-index.json`;

    dictionaryIndexPromise = fetch(indexUrl, {
      headers: {
        Accept: 'application/json'
      }
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error('本地词典索引加载失败。');
      }

      return (await response.json()) as LocalDictionaryPayload;
    });
  }

  return dictionaryIndexPromise;
};

export const lookupLocalDictionary = async (query: string): Promise<LocalDictionaryLookupResult | null> => {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return null;
  }

  const payload = await loadDictionaryIndex();
  const entry = payload[normalizedQuery];

  if (!entry || !Array.isArray(entry.e) || entry.e.length === 0) {
    return null;
  }

  return {
    normalizedQuery,
    explains: entry.e.filter((item): item is string => typeof item === 'string' && item.trim().length > 0),
    usPhonetic: typeof entry.us === 'string' ? entry.us : '',
    ukPhonetic: typeof entry.uk === 'string' ? entry.uk : ''
  };
};
