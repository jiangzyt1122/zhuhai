import { lookupLocalDictionary } from './localDictionary';
import { DictionaryLookupResult, lookupYoudaoDictionary } from './youdaoDictionary';

const cleanString = (value: string) => value.trim().replace(/\s+/g, ' ');

const isSingleWordQuery = (query: string) => !/\s/.test(cleanString(query));

export const lookupLearningDictionary = async (query: string): Promise<DictionaryLookupResult> => {
  const trimmedQuery = cleanString(query);
  if (!trimmedQuery) {
    throw new Error('请选择要查询的单词、词组或句子。');
  }

  if (isSingleWordQuery(trimmedQuery)) {
    try {
      const localMatch = await lookupLocalDictionary(trimmedQuery);
      if (localMatch) {
        return {
          query: trimmedQuery,
          normalizedQuery: localMatch.normalizedQuery,
          usPhonetic: localMatch.usPhonetic,
          ukPhonetic: localMatch.ukPhonetic,
          usSpeech: null,
          translatedSpeech: null,
          explains: localMatch.explains,
          antonyms: [],
          source: 'local'
        };
      }
    } catch {
      // fall back to API lookup
    }
  }

  return lookupYoudaoDictionary(trimmedQuery);
};

export const lookupLearningPronunciation = async (query: string) => {
  const result = await lookupYoudaoDictionary(query);
  return result.usSpeech ?? result.translatedSpeech;
};
