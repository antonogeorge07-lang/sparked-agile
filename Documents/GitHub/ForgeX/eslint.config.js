{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  globals \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 "globals"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  pluginJs \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 "@eslint/js"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  pluginReact \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 "eslint-plugin-react"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  pluginReactHooks \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 "eslint-plugin-react-hooks"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  pluginUnusedImports \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 "eslint-plugin-unused-imports"\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  [\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \{\cb1 \
\cb3     files: [\cb1 \
\cb3       \cf5 \strokec5 "src/components/**/*.\{js,mjs,cjs,jsx\}"\cf0 \strokec4 ,\cb1 \
\cb3       \cf5 \strokec5 "src/pages/**/*.\{js,mjs,cjs,jsx\}"\cf0 \strokec4 ,\cb1 \
\cb3       \cf5 \strokec5 "src/Layout.jsx"\cf0 \strokec4 ,\cb1 \
\cb3     ],\cb1 \
\cb3     ignores: [\cf5 \strokec5 "src/lib/**/*"\cf0 \strokec4 , \cf5 \strokec5 "src/components/ui/**/*"\cf0 \strokec4 ],\cb1 \
\cb3     ...pluginJs.configs.recommended,\cb1 \
\cb3     ...pluginReact.configs.flat.recommended,\cb1 \
\cb3     languageOptions: \{\cb1 \
\cb3       globals: globals.browser,\cb1 \
\cb3       parserOptions: \{\cb1 \
\cb3         ecmaVersion: \cf6 \strokec6 2022\cf0 \strokec4 ,\cb1 \
\cb3         sourceType: \cf5 \strokec5 "module"\cf0 \strokec4 ,\cb1 \
\cb3         ecmaFeatures: \{\cb1 \
\cb3           jsx: \cf2 \strokec2 true\cf0 \strokec4 ,\cb1 \
\cb3         \},\cb1 \
\cb3       \},\cb1 \
\cb3     \},\cb1 \
\cb3     settings: \{\cb1 \
\cb3       react: \{\cb1 \
\cb3         version: \cf5 \strokec5 "detect"\cf0 \strokec4 ,\cb1 \
\cb3       \},\cb1 \
\cb3     \},\cb1 \
\cb3     plugins: \{\cb1 \
\cb3       react: pluginReact,\cb1 \
\cb3       \cf5 \strokec5 "react-hooks"\cf0 \strokec4 : pluginReactHooks,\cb1 \
\cb3       \cf5 \strokec5 "unused-imports"\cf0 \strokec4 : pluginUnusedImports,\cb1 \
\cb3     \},\cb1 \
\cb3     rules: \{\cb1 \
\cb3       \cf5 \strokec5 "no-unused-vars"\cf0 \strokec4 : \cf5 \strokec5 "off"\cf0 \strokec4 ,\cb1 \
\cb3       \cf5 \strokec5 "react/jsx-uses-vars"\cf0 \strokec4 : \cf5 \strokec5 "error"\cf0 \strokec4 ,\cb1 \
\cb3       \cf5 \strokec5 "react/jsx-uses-react"\cf0 \strokec4 : \cf5 \strokec5 "error"\cf0 \strokec4 ,\cb1 \
\cb3       \cf5 \strokec5 "unused-imports/no-unused-imports"\cf0 \strokec4 : \cf5 \strokec5 "error"\cf0 \strokec4 ,\cb1 \
\cb3       \cf5 \strokec5 "unused-imports/no-unused-vars"\cf0 \strokec4 : [\cb1 \
\cb3         \cf5 \strokec5 "warn"\cf0 \strokec4 ,\cb1 \
\cb3         \{\cb1 \
\cb3           vars: \cf5 \strokec5 "all"\cf0 \strokec4 ,\cb1 \
\cb3           varsIgnorePattern: \cf5 \strokec5 "^_"\cf0 \strokec4 ,\cb1 \
\cb3           args: \cf5 \strokec5 "after-used"\cf0 \strokec4 ,\cb1 \
\cb3           argsIgnorePattern: \cf5 \strokec5 "^_"\cf0 \strokec4 ,\cb1 \
\cb3         \},\cb1 \
\cb3       ],\cb1 \
\cb3       \cf5 \strokec5 "react/prop-types"\cf0 \strokec4 : \cf5 \strokec5 "off"\cf0 \strokec4 ,\cb1 \
\cb3       \cf5 \strokec5 "react/react-in-jsx-scope"\cf0 \strokec4 : \cf5 \strokec5 "off"\cf0 \strokec4 ,\cb1 \
\cb3       \cf5 \strokec5 "react/no-unknown-property"\cf0 \strokec4 : [\cb1 \
\cb3         \cf5 \strokec5 "error"\cf0 \strokec4 ,\cb1 \
\cb3         \{ ignore: [\cf5 \strokec5 "cmdk-input-wrapper"\cf0 \strokec4 , \cf5 \strokec5 "toast-close"\cf0 \strokec4 ] \},\cb1 \
\cb3       ],\cb1 \
\cb3       \cf5 \strokec5 "react-hooks/rules-of-hooks"\cf0 \strokec4 : \cf5 \strokec5 "error"\cf0 \strokec4 ,\cb1 \
\cb3     \},\cb1 \
\cb3   \},\cb1 \
\cb3 ];\cb1 \
\
}