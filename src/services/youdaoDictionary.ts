type DictionaryPayload = Record<string, unknown>;

const YOUDAO_PROXY_URL = (import.meta.env.VITE_YOUDAO_PROXY_URL || '/api/youdao/dict').trim();
const IS_DEFAULT_LOCAL_PROXY = YOUDAO_PROXY_URL === '/api/youdao/dict';

export interface DictionaryLookupResult {
  query: string;
  normalizedQuery: string;
  ukPhonetic: string;
  usPhonetic: string;
  usSpeech: string | null;
  translatedSpeech: string | null;
  explains: string[];
  antonyms: string[];
  source: 'local' | 'dictionary' | 'translation';
}

const YOUDAO_ERROR_MESSAGES: Record<string, string> = {
  '101': '缺少必填参数。',
  '102': '不支持的语言类型。',
  '108': '当前 appKey 对所调用的有道接口无效，请确认应用ID和服务类型匹配。',
  '110': '当前应用没有开通对应服务，或相关能力未完成绑定。',
  '113': '查询内容不能为空。',
  '205': '当前应用的平台类型与 HTTP API 接入方式不匹配。',
  '120': '未查询到相关词条。',
  '202': '签名校验失败，请检查有道应用配置。',
  '206': '时间戳无效。',
  '301': '词典查询失败。',
  '303': '服务端出现异常。',
  '401': '有道账户欠费。',
  '411': '访问频率受限，请稍后再试。',
  '390001': '词典名称不正确。'
};

const isRecord = (value: unknown): value is DictionaryPayload =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const asArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value == null) {
    return [];
  }
  return [value];
};

const cleanString = (value: string) => value.replace(/\s+/g, ' ').trim();

const uniqueStrings = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const collectStrings = (value: unknown): string[] => {
  if (typeof value === 'string') {
    const cleaned = cleanString(value);
    return cleaned ? [cleaned] : [];
  }

  if (Array.isArray(value)) {
    return uniqueStrings(value.flatMap((item) => collectStrings(item)));
  }

  if (isRecord(value)) {
    return uniqueStrings(Object.values(value).flatMap((item) => collectStrings(item)));
  }

  return [];
};

const pickFirstString = (...values: unknown[]) => {
  for (const value of values) {
    const [first] = collectStrings(value);
    if (first) {
      return first;
    }
  }
  return '';
};

const normalizeQuery = (query: string) => cleanString(query.toLowerCase());

const buildStaticProxyUnavailableMessage = () =>
  '当前站点是纯静态部署，没有可用的词典代理服务。内置词库里的单词和部分词组仍可查询；整句或未收录内容需要额外后端代理。';

const findCandidatePayloads = (raw: unknown): DictionaryPayload[] => {
  if (!isRecord(raw)) {
    return [];
  }

  const direct = [raw];
  const resultItems = asArray(raw.result).filter(isRecord);
  const nested = resultItems.flatMap((item) =>
    Object.values(item)
      .filter(isRecord)
      .map((value) => value as DictionaryPayload)
  );

  return [...direct, ...resultItems, ...nested];
};

const extractExplainsFromLegacyWord = (wordEntry: DictionaryPayload) => {
  const trs = asArray(wordEntry.trs).filter(isRecord);

  return uniqueStrings(
    trs.flatMap((trsItem) =>
      asArray(trsItem.trs ?? trsItem.tr)
        .filter(isRecord)
        .flatMap((trItem) => {
          const nestedL = isRecord(trItem.l) ? trItem.l : null;
          return uniqueStrings([
            ...collectStrings(trItem.i),
            ...collectStrings(trItem.text),
            ...collectStrings(nestedL?.i)
          ]);
        })
    )
  );
};

const extractExplains = (payloads: DictionaryPayload[]) => {
  const directExplains = uniqueStrings(
    payloads.flatMap((payload) => {
      const basic = isRecord(payload.basic) ? payload.basic : null;
      return [
        ...collectStrings(payload.explains),
        ...collectStrings(basic?.explains),
        ...collectStrings(payload.explain)
      ];
    })
  );

  if (directExplains.length > 0) {
    return directExplains;
  }

  const legacyWords = payloads.flatMap((payload) => {
    const localWords = asArray(payload.word).filter(isRecord);
    const ecWords = isRecord(payload.ec) ? asArray(payload.ec.word).filter(isRecord) : [];
    return [...localWords, ...ecWords];
  });

  return uniqueStrings(legacyWords.flatMap((wordEntry) => extractExplainsFromLegacyWord(wordEntry)));
};

const extractAntonyms = (payloads: DictionaryPayload[]) => {
  return uniqueStrings(
    payloads.flatMap((payload) => {
      const antonyms = asArray(payload.antonyms).filter(isRecord);
      return antonyms.map((item) => {
        const words = collectStrings(item.words);
        const trans = collectStrings(item.trans);
        if (words.length > 0 && trans.length > 0) {
          return `${words.join(', ')}: ${trans.join(' / ')}`;
        }
        if (words.length > 0) {
          return words.join(', ');
        }
        return trans.join(' / ');
      });
    })
  );
};

const parseYoudaoResponse = (query: string, raw: unknown): DictionaryLookupResult => {
  if (isRecord(raw) && Array.isArray(raw.translation)) {
    const translationExplains = uniqueStrings(raw.translation.flatMap((item) => collectStrings(item)));
    const speakUrl = pickFirstString(raw.speakUrl);
    const translatedSpeakUrl = pickFirstString(raw.tSpeakUrl);

    if (translationExplains.length === 0) {
      throw new Error('未从有道翻译结果中解析到中文释义。');
    }

    return {
      query,
      normalizedQuery: normalizeQuery(query),
      ukPhonetic: '',
      usPhonetic: '',
      usSpeech: speakUrl.startsWith('http://') || speakUrl.startsWith('https://') ? speakUrl : null,
      translatedSpeech:
        translatedSpeakUrl.startsWith('http://') || translatedSpeakUrl.startsWith('https://')
          ? translatedSpeakUrl
          : null,
      explains: translationExplains,
      antonyms: [],
      source: 'translation'
    };
  }

  const payloads = findCandidatePayloads(raw);

  if (payloads.length === 0) {
    throw new Error('有道返回格式无法识别。');
  }

  const usPhonetic = pickFirstString(
    ...payloads.flatMap((payload) => {
      const basic = isRecord(payload.basic) ? payload.basic : null;
      const localWord = asArray(payload.word).find(isRecord) as DictionaryPayload | undefined;
      const ecWord = isRecord(payload.ec)
        ? (asArray(payload.ec.word).find(isRecord) as DictionaryPayload | undefined)
        : undefined;

      return [
        basic?.usPhonetic,
        payload.usPhonetic,
        localWord?.usphone,
        localWord?.usPhonetic,
        ecWord?.usphone,
        ecWord?.usPhonetic
      ];
    })
  );

  const ukPhonetic = pickFirstString(
    ...payloads.flatMap((payload) => {
      const basic = isRecord(payload.basic) ? payload.basic : null;
      const localWord = asArray(payload.word).find(isRecord) as DictionaryPayload | undefined;
      const ecWord = isRecord(payload.ec)
        ? (asArray(payload.ec.word).find(isRecord) as DictionaryPayload | undefined)
        : undefined;

      return [
        basic?.ukPhonetic,
        payload.ukPhonetic,
        localWord?.ukphone,
        localWord?.ukPhonetic,
        ecWord?.ukphone,
        ecWord?.ukPhonetic
      ];
    })
  );

  const usSpeechRaw = pickFirstString(
    ...payloads.flatMap((payload) => {
      const basic = isRecord(payload.basic) ? payload.basic : null;
      const localWord = asArray(payload.word).find(isRecord) as DictionaryPayload | undefined;
      const ecWord = isRecord(payload.ec)
        ? (asArray(payload.ec.word).find(isRecord) as DictionaryPayload | undefined)
        : undefined;

      return [basic?.usSpeech, payload.usSpeech, localWord?.usspeech, ecWord?.usspeech];
    })
  );

  const explains = extractExplains(payloads);
  const antonyms = extractAntonyms(payloads);

  if (explains.length === 0) {
    throw new Error('未从有道结果中解析到中文释义。');
  }

  return {
    query,
    normalizedQuery: normalizeQuery(query),
    ukPhonetic,
    usPhonetic,
    usSpeech: usSpeechRaw.startsWith('http://') || usSpeechRaw.startsWith('https://') ? usSpeechRaw : null,
    translatedSpeech: null,
    explains,
    antonyms,
    source: 'dictionary'
  };
};

export const lookupYoudaoDictionary = async (query: string): Promise<DictionaryLookupResult> => {
  const trimmedQuery = cleanString(query);
  if (!trimmedQuery) {
    throw new Error('请选择要查询的单词或词组。');
  }

  let response: Response;
  try {
    response = await fetch(`${YOUDAO_PROXY_URL}?q=${encodeURIComponent(trimmedQuery)}`, {
      headers: {
        Accept: 'application/json'
      }
    });
  } catch {
    throw new Error(
      IS_DEFAULT_LOCAL_PROXY ? buildStaticProxyUnavailableMessage() : '词典代理服务当前不可用。'
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 404 && IS_DEFAULT_LOCAL_PROXY) {
      throw new Error(buildStaticProxyUnavailableMessage());
    }

    const message =
      (isRecord(payload) && pickFirstString(payload.message, payload.errorMessage)) ||
      (IS_DEFAULT_LOCAL_PROXY ? buildStaticProxyUnavailableMessage() : '词典服务当前不可用。');
    throw new Error(message);
  }

  if (isRecord(payload) && typeof payload.errorCode === 'string' && payload.errorCode !== '0') {
    throw new Error(YOUDAO_ERROR_MESSAGES[payload.errorCode] ?? `有道返回错误码 ${payload.errorCode}`);
  }

  return parseYoudaoResponse(trimmedQuery, payload);
};
