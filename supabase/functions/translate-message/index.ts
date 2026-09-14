const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_MAP: Record<string, string> = {
  zh: 'zh-CN',
};

Deno.serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    // Only accept POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Read request body
    const body = await req.json();

    const text =
      typeof body.text === 'string'
        ? body.text.trim()
        : '';

    const sourceLanguage =
      typeof body.sourceLanguage === 'string'
        ? body.sourceLanguage.trim().toLowerCase()
        : '';

    const targetLanguage =
      typeof body.targetLanguage === 'string'
        ? body.targetLanguage.trim().toLowerCase()
        : '';

    // Validate input
    if (!text) {
      return new Response(
        JSON.stringify({
          error: 'Text is required.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (!sourceLanguage) {
      return new Response(
        JSON.stringify({
          error: 'Source language is required.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (!targetLanguage) {
      return new Response(
        JSON.stringify({
          error: 'Target language is required.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (sourceLanguage === targetLanguage) {
      return new Response(
        JSON.stringify({
          translatedText: text,
          sourceLanguage,
          targetLanguage,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Keep MVP requests reasonably small.
    if (text.length > 2000) {
      return new Response(
        JSON.stringify({
          error: 'Text is too long. Maximum length is 2000 characters.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Convert our internal language code to the provider's code.
    const providerSourceLanguage =
      LANGUAGE_MAP[sourceLanguage] ?? sourceLanguage;

    const providerTargetLanguage =
      LANGUAGE_MAP[targetLanguage] ?? targetLanguage;

    // Build MyMemory request.
    const params = new URLSearchParams({
      q: text,
      langpair: `${providerSourceLanguage}|${providerTargetLanguage}`,
    });

    const myMemoryUrl =
      `https://api.mymemory.translated.net/get?${params.toString()}`;

    const response = await fetch(myMemoryUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `MyMemory request failed with status ${response.status}.`,
      );
    }

    const result = await response.json();

    // MyMemory returns a responseStatus field.
    if (result.responseStatus !== 200) {
      throw new Error(
        result.responseDetails ||
          'MyMemory could not translate this text.',
      );
    }

    const translatedText =
      result.responseData?.translatedText;

    if (
      typeof translatedText !== 'string' ||
      !translatedText.trim()
    ) {
      throw new Error(
        'MyMemory returned an invalid translation.',
      );
    }

    return new Response(
      JSON.stringify({
        translatedText: translatedText.trim(),
        sourceLanguage,
        targetLanguage,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Translation error:', error);

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
          'Content-Type': 'application/json',
        },
      },
    );
  }
});