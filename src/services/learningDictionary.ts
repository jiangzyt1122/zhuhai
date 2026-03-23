import { lookupLocalDictionary } from './localDictionary';
import { DictionaryLookupResult, lookupYoudaoDictionary } from './youdaoDictionary';

const cleanString = (value: string) => value.trim().replace(/\s+/g, ' ');
const isSingleWordQuery = (query: string) => !/\s/.test(cleanString(query));

const buildYoudaoVoiceUrl = (query: string, type: '1' | '2' = '2') =>
  `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanString(query))}&type=${type}`;

const buildLocalLookupResult = (query: string, localMatch: NonNullable<Awaited<ReturnType<typeof lookupLocalDictionary>>>) => ({
  query,
  normalizedQuery: localMatch.normalizedQuery,
  usPhonetic: localMatch.usPhonetic,
  ukPhonetic: localMatch.ukPhonetic,
  usSpeech: buildYoudaoVoiceUrl(query, '2'),
  translatedSpeech: null,
  explains: localMatch.explains,
  antonyms: [],
  source: 'local' as const
});

export const lookupLearningDictionary = async (query: string): Promise<DictionaryLookupResult> => {
  const trimmedQuery = cleanString(query);
  if (!trimmedQuery) {
    throw new Error('请选择要查询的单词、词组或句子。');
  }

  const localMatch = await lookupLocalDictionary(trimmedQuery).catch(() => null);

  if (isSingleWordQuery(trimmedQuery) && localMatch) {
    return buildLocalLookupResult(trimmedQuery, localMatch);
  }

  try {
    return await lookupYoudaoDictionary(trimmedQuery);
  } catch (error) {
    if (localMatch) {
      return buildLocalLookupResult(trimmedQuery, localMatch);
    }

    throw error;
  }
};

export const lookupLearningPronunciation = async (
  query: string,
  source?: DictionaryLookupResult['source']
) => {
  const trimmedQuery = cleanString(query);
  if (!trimmedQuery) {
    throw new Error('当前内容没有可用发音。');
  }

  if (source === 'local') {
    return buildYoudaoVoiceUrl(trimmedQuery, '2');
  }

  try {
    const result = await lookupYoudaoDictionary(trimmedQuery);
    return result.usSpeech ?? result.translatedSpeech ?? buildYoudaoVoiceUrl(trimmedQuery, '2');
  } catch {
    if (isSingleWordQuery(trimmedQuery)) {
      return buildYoudaoVoiceUrl(trimmedQuery, '2');
    }

    throw new Error('当前站点没有可用的在线发音代理。');
  }
};
