{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;\red15\green112\blue1;\red191\green28\blue37;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;\cssrgb\c0\c50196\c0;\cssrgb\c80392\c19216\c19216;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ useState, useRef, useEffect, useCallback \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ motion, \cf6 \strokec6 AnimatePresence\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'framer-motion'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf6 \strokec6 Mic\cf0 \strokec4 , \cf6 \strokec6 Square\cf0 \strokec4 , \cf6 \strokec6 X\cf0 \strokec4 , \cf6 \strokec6 Loader2\cf0 \strokec4 , \cf6 \strokec6 Play\cf0 \strokec4 , \cf6 \strokec6 Pause\cf0 \strokec4 , \cf6 \strokec6 Languages\cf0 \strokec4 , \cf6 \strokec6 Globe\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'lucide-react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ base44 \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/api/base44Client'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ detectLanguage, translateText \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/lib/translation'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf6 \strokec6 VoiceRecorder\cf0 \strokec4 (\{ isOpen, onClose, onVoiceNoteReady, targetLanguage \}) \{\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [isRecording, setIsRecording] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [duration, setDuration] = useState(\cf7 \strokec7 0\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [audioBlob, setAudioBlob] = useState(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [audioUrl, setAudioUrl] = useState(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [isProcessing, setIsProcessing] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [isPlaying, setIsPlaying] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [showTranslated, setShowTranslated] = useState(\cf2 \strokec2 true\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  mediaRecorderRef = useRef(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  streamRef = useRef(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  timerRef = useRef(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  chunksRef = useRef([]);\cb1 \
\
\cb3   useEffect(() => \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  () => \{\cb1 \
\cb3       \cf2 \strokec2 if\cf0 \strokec4  (timerRef.current) clearInterval(timerRef.current);\cb1 \
\cb3       \cf2 \strokec2 if\cf0 \strokec4  (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());\cb1 \
\cb3     \};\cb1 \
\cb3   \}, []);\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  startRecording = useCallback(\cf2 \strokec2 async\cf0 \strokec4  () => \{\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  stream = \cf2 \strokec2 await\cf0 \strokec4  navigator.mediaDevices.getUserMedia(\{ audio: \cf2 \strokec2 true\cf0 \strokec4  \});\cb1 \
\cb3     streamRef.current = stream;\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  recorder = \cf2 \strokec2 new\cf0 \strokec4  \cf6 \strokec6 MediaRecorder\cf0 \strokec4 (stream, \{ mimeType: \cf5 \strokec5 'audio/webm'\cf0 \strokec4  \});\cb1 \
\cb3     mediaRecorderRef.current = recorder;\cb1 \
\cb3     chunksRef.current = [];\cb1 \
\
\cb3     recorder.ondataavailable = (e) => \{\cb1 \
\cb3       \cf2 \strokec2 if\cf0 \strokec4  (e.data.size > \cf7 \strokec7 0\cf0 \strokec4 ) chunksRef.current.push(e.data);\cb1 \
\cb3     \};\cb1 \
\
\cb3     recorder.onstop = \cf2 \strokec2 async\cf0 \strokec4  () => \{\cb1 \
\cb3       \cf2 \strokec2 const\cf0 \strokec4  blob = \cf2 \strokec2 new\cf0 \strokec4  \cf6 \strokec6 Blob\cf0 \strokec4 (chunksRef.current, \{ type: \cf5 \strokec5 'audio/webm'\cf0 \strokec4  \});\cb1 \
\cb3       setAudioBlob(blob);\cb1 \
\cb3       \cf2 \strokec2 const\cf0 \strokec4  localUrl = \cf6 \strokec6 URL\cf0 \strokec4 .createObjectURL(blob);\cb1 \
\cb3       setAudioUrl(localUrl);\cb1 \
\cb3     \};\cb1 \
\
\cb3     recorder.start(\cf7 \strokec7 100\cf0 \strokec4 );\cb1 \
\cb3     setIsRecording(\cf2 \strokec2 true\cf0 \strokec4 );\cb1 \
\cb3     setAudioBlob(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3     setAudioUrl(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3     setDuration(\cf7 \strokec7 0\cf0 \strokec4 );\cb1 \
\cb3     timerRef.current = setInterval(() => setDuration(d => d + \cf7 \strokec7 1\cf0 \strokec4 ), \cf7 \strokec7 1000\cf0 \strokec4 );\cb1 \
\cb3   \}, []);\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  stopRecording = useCallback(() => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (mediaRecorderRef.current && isRecording) \{\cb1 \
\cb3       mediaRecorderRef.current.stop();\cb1 \
\cb3       streamRef.current?.getTracks().forEach(t => t.stop());\cb1 \
\cb3       clearInterval(timerRef.current);\cb1 \
\cb3       setIsRecording(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3     \}\cb1 \
\cb3   \}, [isRecording]);\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  togglePlayback = useCallback(() => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (!audioUrl) \cf2 \strokec2 return\cf0 \strokec4 ;\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  audio = \cf2 \strokec2 new\cf0 \strokec4  \cf6 \strokec6 Audio\cf0 \strokec4 (audioUrl);\cb1 \
\cb3     setIsPlaying(\cf2 \strokec2 true\cf0 \strokec4 );\cb1 \
\cb3     audio.onended = () => setIsPlaying(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3     audio.play();\cb1 \
\cb3   \}, [audioUrl]);\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  processAndSend = useCallback(\cf2 \strokec2 async\cf0 \strokec4  () => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (!audioBlob || isProcessing) \cf2 \strokec2 return\cf0 \strokec4 ;\cb1 \
\cb3     setIsProcessing(\cf2 \strokec2 true\cf0 \strokec4 );\cb1 \
\
\cb3     \cf2 \strokec2 const\cf0 \strokec4  file = \cf2 \strokec2 new\cf0 \strokec4  \cf6 \strokec6 File\cf0 \strokec4 ([audioBlob], \cf5 \strokec5 'voice-note.webm'\cf0 \strokec4 , \{ type: \cf5 \strokec5 'audio/webm'\cf0 \strokec4  \});\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  \{ file_url \} = \cf2 \strokec2 await\cf0 \strokec4  base44.integrations.\cf6 \strokec6 Core\cf0 \strokec4 .\cf6 \strokec6 UploadFile\cf0 \strokec4 (\{ file \});\cb1 \
\
\cb3     \cf2 \strokec2 const\cf0 \strokec4  transcript = \cf2 \strokec2 await\cf0 \strokec4  base44.integrations.\cf6 \strokec6 Core\cf0 \strokec4 .\cf6 \strokec6 TranscribeAudio\cf0 \strokec4 (\{ audio_url: file_url \});\cb1 \
\
\cb3     \cf2 \strokec2 const\cf0 \strokec4  originalLang = \cf2 \strokec2 await\cf0 \strokec4  detectLanguage(transcript);\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  translatedTranscript = originalLang !== targetLanguage\cb1 \
\cb3       ? \cf2 \strokec2 await\cf0 \strokec4  translateText(transcript, targetLanguage)\cb1 \
\cb3       : transcript;\cb1 \
\
\cb3     setIsProcessing(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3     onVoiceNoteReady(\{\cb1 \
\cb3       audioBlob,\cb1 \
\cb3       audioUrl: file_url,\cb1 \
\cb3       transcript,\cb1 \
\cb3       translatedTranscript,\cb1 \
\cb3       originalLanguage: originalLang,\cb1 \
\cb3       targetLanguage,\cb1 \
\cb3     \});\cb1 \
\cb3     onClose();\cb1 \
\cb3   \}, [audioBlob, isProcessing, targetLanguage, onVoiceNoteReady, onClose]);\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  handleReset = useCallback(() => \{\cb1 \
\cb3     setAudioBlob(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3     setAudioUrl(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3     setDuration(\cf7 \strokec7 0\cf0 \strokec4 );\cb1 \
\cb3     setIsPlaying(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3   \}, []);\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  formatTime = (s) => \{\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  mins = \cf6 \strokec6 Math\cf0 \strokec4 .floor(s / \cf7 \strokec7 60\cf0 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  secs = s % \cf7 \strokec7 60\cf0 \strokec4 ;\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  \cf5 \strokec5 `\cf0 \strokec4 $\{mins\}\cf5 \strokec5 :\cf0 \strokec4 $\{secs.toString().padStart(\cf7 \strokec7 2\cf0 \strokec4 , \cf5 \strokec5 '0'\cf0 \strokec4 )\}\cf5 \strokec5 `\cf0 \strokec4 ;\cb1 \
\cb3   \};\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <\cf6 \strokec6 AnimatePresence\cf0 \strokec4 >\cb1 \
\cb3       \{isOpen && (\cb1 \
\cb3         <motion.div\cb1 \
\cb3           initial=\{\{ opacity: \cf7 \strokec7 0\cf0 \strokec4  \}\}\cb1 \
\cb3           animate=\{\{ opacity: \cf7 \strokec7 1\cf0 \strokec4  \}\}\cb1 \
\cb3           exit=\{\{ opacity: \cf7 \strokec7 0\cf0 \strokec4  \}\}\cb1 \
\cb3           className=\cf5 \strokec5 "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"\cf0 \cb1 \strokec4 \
\cb3         >\cb1 \
\cb3           <motion.div\cb1 \
\cb3             initial=\{\{ scale: \cf7 \strokec7 0.9\cf0 \strokec4 , opacity: \cf7 \strokec7 0\cf0 \strokec4  \}\}\cb1 \
\cb3             animate=\{\{ scale: \cf7 \strokec7 1\cf0 \strokec4 , opacity: \cf7 \strokec7 1\cf0 \strokec4  \}\}\cb1 \
\cb3             exit=\{\{ scale: \cf7 \strokec7 0.9\cf0 \strokec4 , opacity: \cf7 \strokec7 0\cf0 \strokec4  \}\}\cb1 \
\cb3             className=\cf5 \strokec5 "relative w-80 p-6 rounded-3xl bg-white/70 backdrop-blur-3xl border border-white/70 shadow-2xl"\cf0 \cb1 \strokec4 \
\cb3           >\cb1 \
\cb3             \{\cf8 \strokec8 /* Header */\cf0 \strokec4 \}\cb1 \
\cb3             <div className=\cf5 \strokec5 "flex items-center justify-between mb-5"\cf0 \strokec4 >\cb1 \
\cb3               <div className=\cf5 \strokec5 "flex items-center gap-3"\cf0 \strokec4 >\cb1 \
\cb3                 <div className=\cf5 \strokec5 "w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"\cf0 \strokec4 >\cb1 \
\cb3                   <\cf6 \strokec6 Mic\cf0 \strokec4  className=\cf5 \strokec5 "w-5 h-5 text-white"\cf0 \strokec4  />\cb1 \
\cb3                 </div>\cb1 \
\cb3                 <div>\cb1 \
\cb3                   <p className=\cf5 \strokec5 "font-semibold text-violet-950 text-sm"\cf0 \strokec4 >\cf6 \strokec6 Voice\cf0 \strokec4  \cf6 \strokec6 Note\cf0 \strokec4 </p>\cb1 \
\cb3                   <p className=\cf5 \strokec5 "text-xs text-fuchsia-600 flex items-center gap-1"\cf0 \strokec4 >\cb1 \
\cb3                     <\cf6 \strokec6 Globe\cf0 \strokec4  className=\cf5 \strokec5 "w-3 h-3"\cf0 \strokec4  /> \cf6 \strokec6 Auto\cf0 \strokec4 -translated\cb1 \
\cb3                   </p>\cb1 \
\cb3                 </div>\cb1 \
\cb3               </div>\cb1 \
\cb3               <div className=\cf5 \strokec5 "flex items-center gap-1"\cf0 \strokec4 >\cb1 \
\cb3                 <button\cb1 \
\cb3                   onClick=\{() => setShowTranslated(!showTranslated)\}\cb1 \
\cb3                   className=\cf5 \strokec5 "text-xs px-3 py-1.5 bg-white/60 rounded-2xl flex items-center gap-1 hover:bg-white transition-all text-violet-700"\cf0 \cb1 \strokec4 \
\cb3                 >\cb1 \
\cb3                   <\cf6 \strokec6 Languages\cf0 \strokec4  className=\cf5 \strokec5 "w-3.5 h-3.5"\cf0 \strokec4  />\cb1 \
\cb3                   \{showTranslated ? \cf5 \strokec5 "Original"\cf0 \strokec4  : \cf5 \strokec5 "Translated"\cf0 \strokec4 \}\cb1 \
\cb3                 </button>\cb1 \
\cb3                 <button\cb1 \
\cb3                   onClick=\{onClose\}\cb1 \
\cb3                   disabled=\{isProcessing\}\cb1 \
\cb3                   className=\cf5 \strokec5 "p-2 rounded-xl hover:bg-white/80 transition-colors disabled:opacity-30"\cf0 \cb1 \strokec4 \
\cb3                 >\cb1 \
\cb3                   <\cf6 \strokec6 X\cf0 \strokec4  className=\cf5 \strokec5 "w-4 h-4 text-violet-700"\cf0 \strokec4  />\cb1 \
\cb3                 </button>\cb1 \
\cb3               </div>\cb1 \
\cb3             </div>\cb1 \
\
\cb3             \{\cf8 \strokec8 /* Waveform / Recording Area */\cf0 \strokec4 \}\cb1 \
\cb3             <div className=\cf5 \strokec5 "h-20 bg-white/50 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-5 relative overflow-hidden"\cf0 \strokec4 >\cb1 \
\cb3               \{isProcessing ? (\cb1 \
\cb3                 <div className=\cf5 \strokec5 "flex items-center gap-2 text-violet-700"\cf0 \strokec4 >\cb1 \
\cb3                   <\cf6 \strokec6 Loader2\cf0 \strokec4  className=\cf5 \strokec5 "w-4 h-4 animate-spin"\cf0 \strokec4  />\cb1 \
\cb3                   <span className=\cf5 \strokec5 "text-sm"\cf0 \strokec4 >\cf6 \strokec6 Processing\cf0 \strokec4 ...</span>\cb1 \
\cb3                 </div>\cb1 \
\cb3               ) : isRecording ? (\cb1 \
\cb3                 <div className=\cf5 \strokec5 "flex items-center gap-1"\cf0 \strokec4 >\cb1 \
\cb3                   \{\cf6 \strokec6 Array\cf0 \strokec4 .\cf2 \strokec2 from\cf0 \strokec4 (\{ length: \cf7 \strokec7 24\cf0 \strokec4  \}).map((_, i) => (\cb1 \
\cb3                     <motion.div\cb1 \
\cb3                       key=\{i\}\cb1 \
\cb3                       className=\cf5 \strokec5 "w-1 bg-gradient-to-t from-fuchsia-500 to-cyan-400 rounded-full"\cf0 \cb1 \strokec4 \
\cb3                       animate=\{\{\cb1 \
\cb3                         height: [\cf7 \strokec7 8\cf0 \strokec4 , \cf7 \strokec7 28\cf0 \strokec4 , \cf7 \strokec7 12\cf0 \strokec4 , \cf7 \strokec7 24\cf0 \strokec4 ][i % \cf7 \strokec7 4\cf0 \strokec4 ],\cb1 \
\cb3                       \}\}\cb1 \
\cb3                       transition=\{\{ duration: \cf7 \strokec7 0.5\cf0 \strokec4 , repeat: \cf6 \strokec6 Infinity\cf0 \strokec4 , delay: i * \cf7 \strokec7 0.03\cf0 \strokec4  \}\}\cb1 \
\cb3                     />\cb1 \
\cb3                   ))\}\cb1 \
\cb3                 </div>\cb1 \
\cb3               ) : audioUrl ? (\cb1 \
\cb3                 <div className=\cf5 \strokec5 "text-center"\cf0 \strokec4 >\cb1 \
\cb3                   <div className=\cf5 \strokec5 "text-sm text-violet-600 mb-1"\cf0 \strokec4 >\cf6 \strokec6 Ready\cf0 \strokec4  to play \cf9 \strokec9 \'b7\cf0 \strokec4  \{formatTime(duration)\}</div>\cb1 \
\cb3                   <button\cb1 \
\cb3                     onClick=\{togglePlayback\}\cb1 \
\cb3                     className=\cf5 \strokec5 "flex items-center gap-2 text-violet-700 hover:text-violet-900 transition-all"\cf0 \cb1 \strokec4 \
\cb3                   >\cb1 \
\cb3                     \{isPlaying ? <\cf6 \strokec6 Pause\cf0 \strokec4  className=\cf5 \strokec5 "w-7 h-7"\cf0 \strokec4  /> : <\cf6 \strokec6 Play\cf0 \strokec4  className=\cf5 \strokec5 "w-7 h-7 ml-0.5"\cf0 \strokec4  />\}\cb1 \
\cb3                     <span className=\cf5 \strokec5 "font-medium text-sm"\cf0 \strokec4 >\cf6 \strokec6 Play\cf0 \strokec4 </span>\cb1 \
\cb3                   </button>\cb1 \
\cb3                 </div>\cb1 \
\cb3               ) : (\cb1 \
\cb3                 <p className=\cf5 \strokec5 "text-violet-500/60 text-sm"\cf0 \strokec4 >\cf6 \strokec6 Record\cf0 \strokec4  a voice note</p>\cb1 \
\cb3               )\}\cb1 \
\cb3             </div>\cb1 \
\
\cb3             \{\cf8 \strokec8 /* Controls */\cf0 \strokec4 \}\cb1 \
\cb3             <div className=\cf5 \strokec5 "flex gap-3"\cf0 \strokec4 >\cb1 \
\cb3               \{!isRecording ? (\cb1 \
\cb3                 <motion.button\cb1 \
\cb3                   whileTap=\{\{ scale: \cf7 \strokec7 0.95\cf0 \strokec4  \}\}\cb1 \
\cb3                   onClick=\{startRecording\}\cb1 \
\cb3                   disabled=\{isProcessing\}\cb1 \
\cb3                   className=\cf5 \strokec5 "flex-1 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all disabled:opacity-50"\cf0 \cb1 \strokec4 \
\cb3                 >\cb1 \
\cb3                   <\cf6 \strokec6 Mic\cf0 \strokec4  className=\cf5 \strokec5 "w-4 h-4"\cf0 \strokec4  />\cb1 \
\cb3                   \{audioBlob ? \cf5 \strokec5 'RECORD AGAIN'\cf0 \strokec4  : \cf5 \strokec5 'RECORD'\cf0 \strokec4 \}\cb1 \
\cb3                 </motion.button>\cb1 \
\cb3               ) : (\cb1 \
\cb3                 <motion.button\cb1 \
\cb3                   whileTap=\{\{ scale: \cf7 \strokec7 0.95\cf0 \strokec4  \}\}\cb1 \
\cb3                   onClick=\{stopRecording\}\cb1 \
\cb3                   className=\cf5 \strokec5 "flex-1 h-12 bg-red-500/90 hover:bg-red-600 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all"\cf0 \cb1 \strokec4 \
\cb3                 >\cb1 \
\cb3                   <\cf6 \strokec6 Square\cf0 \strokec4  className=\cf5 \strokec5 "w-4 h-4"\cf0 \strokec4  />\cb1 \
\cb3                   \cf6 \strokec6 STOP\cf0 \strokec4  (\{formatTime(duration)\})\cb1 \
\cb3                 </motion.button>\cb1 \
\cb3               )\}\cb1 \
\
\cb3               \{audioUrl && (\cb1 \
\cb3                 <>\cb1 \
\cb3                   <button\cb1 \
\cb3                     onClick=\{handleReset\}\cb1 \
\cb3                     disabled=\{isProcessing\}\cb1 \
\cb3                     className=\cf5 \strokec5 "px-5 h-12 border border-white/70 rounded-2xl text-violet-600 text-sm hover:bg-white/60 transition-all disabled:opacity-50"\cf0 \cb1 \strokec4 \
\cb3                   >\cb1 \
\cb3                     \cf6 \strokec6 New\cf0 \cb1 \strokec4 \
\cb3                   </button>\cb1 \
\cb3                   <motion.button\cb1 \
\cb3                     whileTap=\{\{ scale: \cf7 \strokec7 0.95\cf0 \strokec4  \}\}\cb1 \
\cb3                     onClick=\{processAndSend\}\cb1 \
\cb3                     disabled=\{isProcessing\}\cb1 \
\cb3                     className=\cf5 \strokec5 "px-5 h-12 bg-emerald-500/90 hover:bg-emerald-600 text-white rounded-2xl font-medium text-sm shadow-lg hover:brightness-110 transition-all disabled:opacity-50"\cf0 \cb1 \strokec4 \
\cb3                   >\cb1 \
\cb3                     \cf6 \strokec6 Send\cf0 \cb1 \strokec4 \
\cb3                   </motion.button>\cb1 \
\cb3                 </>\cb1 \
\cb3               )\}\cb1 \
\cb3             </div>\cb1 \
\
\cb3             <p className=\cf5 \strokec5 "text-center text-[10px] text-violet-500/60 mt-4"\cf0 \strokec4 >\cb1 \
\cb3               \cf6 \strokec6 Your\cf0 \strokec4  voice will be automatically transcribed and translated\cb1 \
\cb3             </p>\cb1 \
\cb3           </motion.div>\cb1 \
\cb3         </motion.div>\cb1 \
\cb3       )\}\cb1 \
\cb3     </\cf6 \strokec6 AnimatePresence\cf0 \strokec4 >\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
}