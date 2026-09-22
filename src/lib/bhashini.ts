/**
 * AryaSaarthi — Bhashini (Digital India) Government Language API Client
 * Supports Automatic Speech Recognition (ASR) and Text-to-Speech (TTS)
 * for 22 Scheduled Indian Languages + English.
 */

export interface BhashiniLangConfig {
  code: string;
  bhashiniCode: string;
  locale: string;
  name: string;
}

export const BHASHINI_LANGUAGES: Record<string, BhashiniLangConfig> = {
  hi: { code: 'hi', bhashiniCode: 'hi', locale: 'hi-IN', name: 'Hindi' },
  en: { code: 'en', bhashiniCode: 'en', locale: 'en-IN', name: 'English' },
  bn: { code: 'bn', bhashiniCode: 'bn', locale: 'bn-IN', name: 'Bengali' },
  mr: { code: 'mr', bhashiniCode: 'mr', locale: 'mr-IN', name: 'Marathi' },
  te: { code: 'te', bhashiniCode: 'te', locale: 'te-IN', name: 'Telugu' },
  ta: { code: 'ta', bhashiniCode: 'ta', locale: 'ta-IN', name: 'Tamil' },
  gu: { code: 'gu', bhashiniCode: 'gu', locale: 'gu-IN', name: 'Gujarati' },
  kn: { code: 'kn', bhashiniCode: 'kn', locale: 'kn-IN', name: 'Kannada' },
  ml: { code: 'ml', bhashiniCode: 'ml', locale: 'ml-IN', name: 'Malayalam' },
  pa: { code: 'pa', bhashiniCode: 'pa', locale: 'pa-IN', name: 'Punjabi' },
  or: { code: 'or', bhashiniCode: 'or', locale: 'or-IN', name: 'Odia' },
  as: { code: 'as', bhashiniCode: 'as', locale: 'as-IN', name: 'Assamese' },
  ur: { code: 'ur', bhashiniCode: 'ur', locale: 'ur-IN', name: 'Urdu' },
  mai: { code: 'mai', bhashiniCode: 'mai', locale: 'mai-IN', name: 'Maithili' },
  sat: { code: 'sat', bhashiniCode: 'sat', locale: 'sat-IN', name: 'Santali' },
  ks: { code: 'ks', bhashiniCode: 'ks', locale: 'ks-IN', name: 'Kashmiri' },
  ne: { code: 'ne', bhashiniCode: 'ne', locale: 'ne-NP', name: 'Nepali' },
  sd: { code: 'sd', bhashiniCode: 'sd', locale: 'sd-IN', name: 'Sindhi' },
  kok: { code: 'kok', bhashiniCode: 'kok', locale: 'kok-IN', name: 'Konkani' },
  doi: { code: 'doi', bhashiniCode: 'doi', locale: 'doi-IN', name: 'Dogri' },
  mni: { code: 'mni', bhashiniCode: 'mni', locale: 'mni-IN', name: 'Manipuri' },
  brx: { code: 'brx', bhashiniCode: 'brx', locale: 'brx-IN', name: 'Bodo' },
  sa: { code: 'sa', bhashiniCode: 'sa', locale: 'sa-IN', name: 'Sanskrit' },
};

export function getBhashiniConfig(langCode: string): BhashiniLangConfig {
  const code = (langCode || 'hi').toLowerCase().trim();
  return BHASHINI_LANGUAGES[code] || BHASHINI_LANGUAGES['hi'];
}

const BHASHINI_PIPELINE_URL = 'https://meity-auth.ulca.ai/ulca/apis/v0/model/getModelsPipeline';

interface BhashiniPipelineResponse {
  pipelineInferenceAPIEndPoint?: {
    inferenceApiKey?: {
      name: string;
      value: string;
    };
  };
  pipelineResponseConfig?: Array<{
    taskType: string;
    config?: Array<{
      serviceId: string;
      modelId: string;
      language?: {
        sourceLanguage: string;
      };
    }>;
  }>;
}

/**
 * Calls Bhashini ASR API if MeitY credentials are present.
 */
export async function bhashiniASR(base64Audio: string, langCode: string): Promise<string | null> {
  const userId = process.env.BHASHINI_USER_ID;
  const apiKey = process.env.BHASHINI_API_KEY;
  const inferenceKey = process.env.BHASHINI_INFERENCE_KEY;

  if (!userId || !apiKey) {
    return null;
  }

  const langConfig = getBhashiniConfig(langCode);

  try {
    const pipelinePayload = {
      pipelineTasks: [
        {
          taskType: 'asr',
          config: {
            language: {
              sourceLanguage: langConfig.bhashiniCode,
            },
          },
        },
      ],
      pipelineRequestConfig: {
        pipelineId: '64392f96daac500b55c543d6',
      },
    };

    const pipeRes = await fetch(BHASHINI_PIPELINE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        userID: userId,
        ulcaApiKey: apiKey,
      },
      body: JSON.stringify(pipelinePayload),
    });

    if (!pipeRes.ok) {
      console.warn('Bhashini pipeline resolution failed:', pipeRes.status);
      return null;
    }

    const pipeData: BhashiniPipelineResponse = await pipeRes.json();
    const asrConfig = pipeData.pipelineResponseConfig?.find((c) => c.taskType === 'asr');
    const serviceId = asrConfig?.config?.[0]?.serviceId;
    const computeEndpoint =
      pipeData.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value ||
      'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
    const computedInferenceKey =
      inferenceKey || pipeData.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value;

    if (!serviceId) {
      return null;
    }

    const computePayload = {
      pipelineTasks: [
        {
          taskType: 'asr',
          config: {
            language: {
              sourceLanguage: langConfig.bhashiniCode,
            },
            serviceId: serviceId,
            audioFormat: 'wav',
            samplingRate: 16000,
          },
        },
      ],
      inputData: {
        audio: [
          {
            audioContent: base64Audio,
          },
        ],
      },
    };

    const computeRes = await fetch(computeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: computedInferenceKey || '',
      },
      body: JSON.stringify(computePayload),
    });

    if (!computeRes.ok) {
      return null;
    }

    const computeData = await computeRes.json();
    const transcript =
      computeData.pipelineResponse?.[0]?.output?.[0]?.source ||
      computeData.pipelineResponse?.[0]?.output?.[0]?.target;

    return transcript || null;
  } catch (err) {
    console.warn('Bhashini ASR Error:', err);
    return null;
  }
}

/**
 * Calls Bhashini TTS API to synthesize Indian regional language speech.
 */
export async function bhashiniTTS(text: string, langCode: string): Promise<string | null> {
  const userId = process.env.BHASHINI_USER_ID;
  const apiKey = process.env.BHASHINI_API_KEY;
  const inferenceKey = process.env.BHASHINI_INFERENCE_KEY;

  if (!userId || !apiKey) {
    return null;
  }

  const langConfig = getBhashiniConfig(langCode);

  try {
    const pipelinePayload = {
      pipelineTasks: [
        {
          taskType: 'tts',
          config: {
            language: {
              sourceLanguage: langConfig.bhashiniCode,
            },
          },
        },
      ],
      pipelineRequestConfig: {
        pipelineId: '64392f96daac500b55c543d6',
      },
    };

    const pipeRes = await fetch(BHASHINI_PIPELINE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        userID: userId,
        ulcaApiKey: apiKey,
      },
      body: JSON.stringify(pipelinePayload),
    });

    if (!pipeRes.ok) return null;

    const pipeData: BhashiniPipelineResponse = await pipeRes.json();
    const ttsConfig = pipeData.pipelineResponseConfig?.find((c) => c.taskType === 'tts');
    const serviceId = ttsConfig?.config?.[0]?.serviceId;
    const computeEndpoint =
      pipeData.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value ||
      'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
    const computedInferenceKey =
      inferenceKey || pipeData.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value;

    if (!serviceId) return null;

    const computePayload = {
      pipelineTasks: [
        {
          taskType: 'tts',
          config: {
            language: {
              sourceLanguage: langConfig.bhashiniCode,
            },
            serviceId: serviceId,
            gender: 'female',
          },
        },
      ],
      inputData: {
        input: [
          {
            source: text,
          },
        ],
      },
    };

    const computeRes = await fetch(computeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: computedInferenceKey || '',
      },
      body: JSON.stringify(computePayload),
    });

    if (!computeRes.ok) return null;

    const computeData = await computeRes.json();
    const audioContent = computeData.pipelineResponse?.[0]?.audio?.[0]?.audioContent;
    return audioContent || null;
  } catch (err) {
    console.warn('Bhashini TTS Error:', err);
    return null;
  }
}
