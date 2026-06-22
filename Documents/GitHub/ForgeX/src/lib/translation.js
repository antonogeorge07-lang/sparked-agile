{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red14\green110\blue109;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ base44 \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/api/base44Client'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 async\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  detectLanguage(text) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  result = \cf2 \strokec2 await\cf0 \strokec4  base44.integrations.\cf6 \strokec6 Core\cf0 \strokec4 .\cf6 \strokec6 InvokeLLM\cf0 \strokec4 (\{\cb1 \
\cb3     prompt: \cf5 \strokec5 `What language is this text? Reply ONLY with the ISO 639-1 code (e.g., "en", "es", "fr", "ja", "ko", "ar", "de", "pt", "ru", "zh"): "\cf0 \strokec4 $\{text\}\cf5 \strokec5 "`\cf0 \strokec4 ,\cb1 \
\cb3     model: \cf5 \strokec5 'gemini_3_flash'\cf0 \cb1 \strokec4 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (result || \cf5 \strokec5 'en'\cf0 \strokec4 ).toString().trim().toLowerCase();\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 async\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  translateText(text, targetLang) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 if\cf0 \strokec4  (!text || !targetLang) \cf2 \strokec2 return\cf0 \strokec4  text;\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  langNames = \{\cb1 \
\cb3     en: \cf5 \strokec5 'English'\cf0 \strokec4 , es: \cf5 \strokec5 'Spanish'\cf0 \strokec4 , fr: \cf5 \strokec5 'French'\cf0 \strokec4 , de: \cf5 \strokec5 'German'\cf0 \strokec4 ,\cb1 \
\cb3     ja: \cf5 \strokec5 'Japanese'\cf0 \strokec4 , ko: \cf5 \strokec5 'Korean'\cf0 \strokec4 , zh: \cf5 \strokec5 'Chinese'\cf0 \strokec4 , ar: \cf5 \strokec5 'Arabic'\cf0 \strokec4 ,\cb1 \
\cb3     pt: \cf5 \strokec5 'Portuguese'\cf0 \strokec4 , ru: \cf5 \strokec5 'Russian'\cf0 \strokec4 , it: \cf5 \strokec5 'Italian'\cf0 \strokec4 , hi: \cf5 \strokec5 'Hindi'\cf0 \cb1 \strokec4 \
\cb3   \};\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  langName = langNames[targetLang] || targetLang;\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  result = \cf2 \strokec2 await\cf0 \strokec4  base44.integrations.\cf6 \strokec6 Core\cf0 \strokec4 .\cf6 \strokec6 InvokeLLM\cf0 \strokec4 (\{\cb1 \
\cb3     prompt: \cf5 \strokec5 `Translate the following text to \cf0 \strokec4 $\{langName\}\cf5 \strokec5 . Only return the translation, nothing else. Preserve the tone and style: "\cf0 \strokec4 $\{text\}\cf5 \strokec5 "`\cf0 \strokec4 ,\cb1 \
\cb3     model: \cf5 \strokec5 'gemini_3_flash'\cf0 \cb1 \strokec4 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (result || text).toString().trim();\cb1 \
\cb3 \}\cb1 \
}