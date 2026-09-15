const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_MAP: Record<string, string> = {
  hi: 'hi-IN',
  zh: 'zh-CN',
};

const normalizeLanguageCode = (
  languageCode: string,
): string => {
  const normalized =
    languageCode.trim().toLowerCase();

  if (normalized.startsWith('zh')) {
    return 'zh';
  }

  if (normalized.startsWith('hi')) {
    return 'hi';
  }

  return normalized.split('-')[0];
};

const isInvalidTranslation = (
  translatedText: unknown,
  sourceText: string,
): boolean => {
  if (
    typeof translatedText !== 'string' ||
    !translatedText.trim()
  ) {
    return true;
  }

  const translation =
    translatedText.trim();

  if (/^[?\s]+$/.test(translation)) {
    return true;
  }

  if (
    translation.toLowerCase() ===
    sourceText.trim().toLowerCase()
  ) {
    return true;
  }

  return false;
};

const getBestTranslation = (
  result: any,
  sourceText: string,
): string | null => {
  const primaryTranslation =
    result.responseData?.translatedText;

  if (
    !isInvalidTranslation(
      primaryTranslation,
      sourceText,
    )
  ) {
    return primaryTranslation.trim();
  }

  const matches = Array.isArray(
    result.matches,
  )
    ? result.matches
    : [];

  const candidates = matches
    .map((match: any) => ({
      translation:
        typeof match?.translation ===
        'string'
          ? match.translation.trim()
          : '',
      quality:
        Number(match?.quality) || 0,
      match:
        Number(match?.match) || 0,
    }))
    .filter(
      (candidate: {
        translation: string;
        quality: number;
        match: number;
      }) =>
        !isInvalidTranslation(
          candidate.translation,
          sourceText,
        ),
    )
    .sort(
      (
        a: {
          translation: string;
          quality: number;
          match: number;
        },
        b: {
          translation: string;
          quality: number;
          match: number;
        },
      ) =>
        b.quality - a.quality ||
        b.match - a.match,
    );

  if (candidates.length > 0) {
    return candidates[0].translation;
  }

  return null;
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    const body =
      await req.json();

    const text =
      typeof body.text === 'string'
        ? body.text.trim()
        : '';

    const sourceLanguage =
      typeof body.sourceLanguage ===
      'string'
        ? body.sourceLanguage
            .trim()
            .toLowerCase()
        : '';

    const targetLanguage =
      typeof body.targetLanguage ===
      'string'
        ? body.targetLanguage
            .trim()
            .toLowerCase()
        : '';

    const detectOnly =
      body.detectOnly === true;

    /*
     * --------------------------------------------------
     * BASIC VALIDATION
     * --------------------------------------------------
     */

    if (!text) {
      return new Response(
        JSON.stringify({
          error:
            'Text is required.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    if (!targetLanguage) {
      return new Response(
        JSON.stringify({
          error:
            'Target language is required.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    /*
     * --------------------------------------------------
     * TEXT SIZE VALIDATION
     * --------------------------------------------------
     */

    const textByteLength =
      new TextEncoder()
        .encode(text)
        .length;

    if (textByteLength > 500) {
      return new Response(
        JSON.stringify({
          error:
            'Text is too long. Maximum length for the current translation provider is 500 UTF-8 bytes.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    /*
     * --------------------------------------------------
     * LANGUAGE DETECTION MODE
     * --------------------------------------------------
     *
     * Called by the mobile app before saving
     * a newly typed message.
     *
     * Example:
     *
     * sourceLanguage = autodetect
     * targetLanguage = zh
     *
     * MyMemory:
     *
     * autodetect|zh-CN
     *
     * returns:
     *
     * detectedLanguage = hi
     */

if (detectOnly) {
  /*
   * MyMemory requires source and target languages
   * to be different.
   *
   * Because source is "autodetect", the requested
   * target language can accidentally be the same
   * language as the text being detected.
   *
   * Example:
   *
   * Chinese user types Chinese
   * autodetect|zh-CN
   *
   * MyMemory sees:
   * zh -> zh
   *
   * and returns:
   * PLEASE SELECT TWO DISTINCT LANGUAGES
   *
   * Therefore we try the requested target first,
   * then fallback targets if MyMemory rejects it.
   */

  const detectionTargets = [
    targetLanguage,
    'en',
    'hi',
    'zh',
  ].filter(
    (language, index, languages) =>
      language &&
      languages.indexOf(language) === index,
  );

  let lastDetectionError: Error | null = null;

  for (const detectionTarget of detectionTargets) {
    const providerTargetLanguage =
      LANGUAGE_MAP[detectionTarget] ??
      detectionTarget;

    const params =
      new URLSearchParams({
        q: text,
        langpair:
          `autodetect|${providerTargetLanguage}`,
        mt: '1',
      });

    const myMemoryUrl =
      `https://api.mymemory.translated.net/get?${params.toString()}`;

    console.log(
      'Language detection request:',
      {
        targetLanguage,
        detectionTarget,
        providerTargetLanguage,
      },
    );

    try {
      const response =
        await fetch(
          myMemoryUrl,
          {
            method: 'GET',
            headers: {
              Accept:
                'application/json',
            },
          },
        );

      if (!response.ok) {
        throw new Error(
          `MyMemory request failed with status ${response.status}.`,
        );
      }

      const result =
        await response.json();

      console.log(
        'MyMemory detection response:',
        {
          responseStatus:
            result.responseStatus,
          responseDetails:
            result.responseDetails,
          detectedLanguage:
            result.responseData
              ?.detectedLanguage,
          detectionTarget,
        },
      );

      if (result.quotaFinished) {
        throw new Error(
          'The translation provider quota has been exhausted.',
        );
      }

      /*
       * MyMemory can return a non-200 responseStatus
       * when the detection target is the same as the
       * detected source language.
       *
       * In that case, try the next fallback target.
       */
      if (
        result.responseStatus !==
        200
      ) {
        const responseDetails =
          typeof result.responseDetails ===
          'string'
            ? result.responseDetails
            : '';

        if (
          responseDetails
            .toLowerCase()
            .includes(
              'distinct languages',
            )
        ) {
          lastDetectionError =
            new Error(
              responseDetails,
            );

          console.warn(
            'Detection target matched source language. Trying fallback target:',
            {
              detectionTarget,
              responseDetails,
            },
          );

          continue;
        }

        throw new Error(
          responseDetails ||
            'MyMemory could not detect the language.',
        );
      }

      const detectedLanguage =
        result.responseData
          ?.detectedLanguage;

      if (
        typeof detectedLanguage !==
          'string' ||
        !detectedLanguage.trim()
      ) {
        throw new Error(
          'MyMemory did not return a detected language.',
        );
      }

      const normalizedDetectedLanguage =
        normalizeLanguageCode(
          detectedLanguage,
        );

      console.log(
        'Language detection successful:',
        {
          detectedLanguage,
          normalizedDetectedLanguage,
          detectionTarget,
        },
      );

      return new Response(
        JSON.stringify({
          detectedLanguage:
            normalizedDetectedLanguage,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    } catch (detectionError) {
      const error =
        detectionError instanceof Error
          ? detectionError
          : new Error(
              'Language detection failed.',
            );

      lastDetectionError =
        error;

      /*
       * Only retry when the provider explicitly
       * tells us that the languages must be distinct.
       */
      if (
        error.message
          .toLowerCase()
          .includes(
            'distinct languages',
          )
      ) {
        console.warn(
          'Retrying language detection with another target:',
          {
            detectionTarget,
            error:
              error.message,
          },
        );

        continue;
      }

      throw error;
    }
  }

  throw (
    lastDetectionError ||
    new Error(
      'Unable to detect the message language.',
    )
  );
}

    /*
     * --------------------------------------------------
     * NORMAL TRANSLATION MODE
     * --------------------------------------------------
     */

    if (!sourceLanguage) {
      return new Response(
        JSON.stringify({
          error:
            'Source language is required.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    const normalizedSourceLanguage =
      normalizeLanguageCode(
        sourceLanguage,
      );

    const normalizedTargetLanguage =
      normalizeLanguageCode(
        targetLanguage,
      );

    /*
     * No translation required.
     */

    if (
      normalizedSourceLanguage ===
      normalizedTargetLanguage
    ) {
      return new Response(
        JSON.stringify({
          translatedText: text,
          sourceLanguage:
            normalizedSourceLanguage,
          targetLanguage:
            normalizedTargetLanguage,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    const providerSourceLanguage =
      LANGUAGE_MAP[
        normalizedSourceLanguage
      ] ??
      normalizedSourceLanguage;

    const providerTargetLanguage =
      LANGUAGE_MAP[
        normalizedTargetLanguage
      ] ??
      normalizedTargetLanguage;

    const params =
      new URLSearchParams({
        q: text,
        langpair:
          `${providerSourceLanguage}|${providerTargetLanguage}`,
        mt: '1',
      });

    const myMemoryUrl =
      `https://api.mymemory.translated.net/get?${params.toString()}`;

    console.log(
      'Translation request:',
      {
        sourceLanguage:
          normalizedSourceLanguage,
        targetLanguage:
          normalizedTargetLanguage,
        providerSourceLanguage,
        providerTargetLanguage,
      },
    );

    const response =
      await fetch(
        myMemoryUrl,
        {
          method: 'GET',
          headers: {
            Accept:
              'application/json',
          },
        },
      );

    if (!response.ok) {
      throw new Error(
        `MyMemory request failed with status ${response.status}.`,
      );
    }

    const result =
      await response.json();

    console.log(
      'MyMemory response status:',
      result.responseStatus,
    );

    if (
      result.responseStatus !==
      200
    ) {
      throw new Error(
        result.responseDetails ||
          'MyMemory could not translate this text.',
      );
    }

    if (result.quotaFinished) {
      throw new Error(
        'The translation provider quota has been exhausted.',
      );
    }

    const translatedText =
      getBestTranslation(
        result,
        text,
      );

    if (!translatedText) {
      throw new Error(
        'The translation provider did not return a usable translation.',
      );
    }

    console.log(
      'Translation successful:',
      {
        sourceLanguage:
          normalizedSourceLanguage,
        targetLanguage:
          normalizedTargetLanguage,
        translatedText,
      },
    );

    return new Response(
      JSON.stringify({
        translatedText,
        sourceLanguage:
          normalizedSourceLanguage,
        targetLanguage:
          normalizedTargetLanguage,
        detectedLanguage:
          result.responseData
            ?.detectedLanguage
            ? normalizeLanguageCode(
                result.responseData
                  .detectedLanguage,
              )
            : null,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type':
            'application/json',
        },
      },
    );
  } catch (error) {
    console.error(
      'Translation error:',
      error,
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Translation failed.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type':
            'application/json',
        },
      },
    );
  }
});