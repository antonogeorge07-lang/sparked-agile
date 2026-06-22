{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red14\green110\blue109;\red144\green1\blue18;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c50196\c50196;\cssrgb\c63922\c8235\c8235;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \cf5 \strokec5 React\cf0 \strokec4 , \{ useState \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "react"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Link\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "react-router-dom"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ base44 \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/api/base44Client"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Button\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/button"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Input\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/input"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Label\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/label"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 LogIn\cf0 \strokec4 , \cf5 \strokec5 Mail\cf0 \strokec4 , \cf5 \strokec5 Lock\cf0 \strokec4 , \cf5 \strokec5 Loader2\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf5 \strokec5 AuthLayout\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/AuthLayout"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf5 \strokec5 GoogleIcon\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/GoogleIcon"\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf5 \strokec5 Login\cf0 \strokec4 () \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  [email, setEmail] = useState(\cf6 \strokec6 ""\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [password, setPassword] = useState(\cf6 \strokec6 ""\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [error, setError] = useState(\cf6 \strokec6 ""\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [loading, setLoading] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  handleSubmit = \cf2 \strokec2 async\cf0 \strokec4  (e) => \{\cb1 \
\cb3     e.preventDefault();\cb1 \
\cb3     setError(\cf6 \strokec6 ""\cf0 \strokec4 );\cb1 \
\cb3     setLoading(\cf2 \strokec2 true\cf0 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 try\cf0 \strokec4  \{\cb1 \
\cb3       \cf2 \strokec2 await\cf0 \strokec4  base44.auth.loginViaEmailPassword(email, password);\cb1 \
\cb3       window.location.href = \cf6 \strokec6 "/"\cf0 \strokec4 ;\cb1 \
\cb3     \} \cf2 \strokec2 catch\cf0 \strokec4  (err) \{\cb1 \
\cb3       setError(err.message || \cf6 \strokec6 "Invalid email or password"\cf0 \strokec4 );\cb1 \
\cb3     \} \cf2 \strokec2 finally\cf0 \strokec4  \{\cb1 \
\cb3       setLoading(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3     \}\cb1 \
\cb3   \};\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  handleGoogle = () => \{\cb1 \
\cb3     base44.auth.loginWithProvider(\cf6 \strokec6 "google"\cf0 \strokec4 , \cf6 \strokec6 "/"\cf0 \strokec4 );\cb1 \
\cb3   \};\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <\cf5 \strokec5 AuthLayout\cf0 \cb1 \strokec4 \
\cb3       icon=\{\cf5 \strokec5 LogIn\cf0 \strokec4 \}\cb1 \
\cb3       title=\cf6 \strokec6 "Welcome back"\cf0 \cb1 \strokec4 \
\cb3       subtitle=\cf6 \strokec6 "Log in to your account"\cf0 \cb1 \strokec4 \
\cb3       footer=\{\cb1 \
\cb3         <>\cb1 \
\cb3           \cf5 \strokec5 Don\cf6 \strokec6 't have an account?\{" "\}\cf0 \cb1 \strokec4 \
\cb3           <\cf5 \strokec5 Link\cf0 \strokec4  to=\cf6 \strokec6 "/register"\cf0 \strokec4  className=\cf6 \strokec6 "text-primary font-medium hover:underline"\cf0 \strokec4 >\cb1 \
\cb3             \cf5 \strokec5 Create\cf0 \strokec4  one\cb1 \
\cb3           </\cf5 \strokec5 Link\cf0 \strokec4 >\cb1 \
\cb3         </>\cb1 \
\cb3       \}\cb1 \
\cb3     >\cb1 \
\cb3       <\cf5 \strokec5 Button\cf0 \cb1 \strokec4 \
\cb3         variant=\cf6 \strokec6 "outline"\cf0 \cb1 \strokec4 \
\cb3         className=\cf6 \strokec6 "w-full h-12 text-sm font-medium mb-6"\cf0 \cb1 \strokec4 \
\cb3         onClick=\{handleGoogle\}\cb1 \
\cb3       >\cb1 \
\cb3         <\cf5 \strokec5 GoogleIcon\cf0 \strokec4  className=\cf6 \strokec6 "w-5 h-5 mr-2"\cf0 \strokec4  />\cb1 \
\cb3         \cf5 \strokec5 Continue\cf0 \strokec4  \cf2 \strokec2 with\cf0 \strokec4  \cf5 \strokec5 Google\cf0 \cb1 \strokec4 \
\cb3       </\cf5 \strokec5 Button\cf0 \strokec4 >\cb1 \
\
\cb3       <div className=\cf6 \strokec6 "relative mb-6"\cf0 \strokec4 >\cb1 \
\cb3         <div className=\cf6 \strokec6 "absolute inset-0 flex items-center"\cf0 \strokec4 >\cb1 \
\cb3           <div className=\cf6 \strokec6 "w-full border-t border-border"\cf0 \strokec4  />\cb1 \
\cb3         </div>\cb1 \
\cb3         <div className=\cf6 \strokec6 "relative flex justify-center text-xs uppercase"\cf0 \strokec4 >\cb1 \
\cb3           <span className=\cf6 \strokec6 "bg-card px-3 text-muted-foreground"\cf0 \strokec4 >or</span>\cb1 \
\cb3         </div>\cb1 \
\cb3       </div>\cb1 \
\
\cb3       \{error && (\cb1 \
\cb3         <div className=\cf6 \strokec6 "mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"\cf0 \strokec4 >\cb1 \
\cb3           \{error\}\cb1 \
\cb3         </div>\cb1 \
\cb3       )\}\cb1 \
\
\cb3       <form onSubmit=\{handleSubmit\} className=\cf6 \strokec6 "space-y-4"\cf0 \strokec4 >\cb1 \
\cb3         <div className=\cf6 \strokec6 "space-y-2"\cf0 \strokec4 >\cb1 \
\cb3           <\cf5 \strokec5 Label\cf0 \strokec4  htmlFor=\cf6 \strokec6 "email"\cf0 \strokec4 >\cf5 \strokec5 Email\cf0 \strokec4 </\cf5 \strokec5 Label\cf0 \strokec4 >\cb1 \
\cb3           <div className=\cf6 \strokec6 "relative"\cf0 \strokec4 >\cb1 \
\cb3             <\cf5 \strokec5 Mail\cf0 \strokec4  className=\cf6 \strokec6 "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"\cf0 \strokec4  aria-hidden=\cf6 \strokec6 "true"\cf0 \strokec4  />\cb1 \
\cb3             <\cf5 \strokec5 Input\cf0 \cb1 \strokec4 \
\cb3               id=\cf6 \strokec6 "email"\cf0 \cb1 \strokec4 \
\cb3               type=\cf6 \strokec6 "email"\cf0 \cb1 \strokec4 \
\cb3               autoComplete=\cf6 \strokec6 "email"\cf0 \cb1 \strokec4 \
\cb3               autoFocus\cb1 \
\cb3               placeholder=\cf6 \strokec6 "you@example.com"\cf0 \cb1 \strokec4 \
\cb3               value=\{email\}\cb1 \
\cb3               onChange=\{(e) => setEmail(e.target.value)\}\cb1 \
\cb3               className=\cf6 \strokec6 "pl-10 h-12"\cf0 \cb1 \strokec4 \
\cb3               required\cb1 \
\cb3             />\cb1 \
\cb3           </div>\cb1 \
\cb3         </div>\cb1 \
\cb3         <div className=\cf6 \strokec6 "space-y-2"\cf0 \strokec4 >\cb1 \
\cb3           <div className=\cf6 \strokec6 "flex items-center justify-between"\cf0 \strokec4 >\cb1 \
\cb3             <\cf5 \strokec5 Label\cf0 \strokec4  htmlFor=\cf6 \strokec6 "password"\cf0 \strokec4 >\cf5 \strokec5 Password\cf0 \strokec4 </\cf5 \strokec5 Label\cf0 \strokec4 >\cb1 \
\cb3             <\cf5 \strokec5 Link\cf0 \strokec4  to=\cf6 \strokec6 "/forgot-password"\cf0 \strokec4  className=\cf6 \strokec6 "text-xs text-primary hover:underline"\cf0 \strokec4 >\cb1 \
\cb3               \cf5 \strokec5 Forgot\cf0 \strokec4  password?\cb1 \
\cb3             </\cf5 \strokec5 Link\cf0 \strokec4 >\cb1 \
\cb3           </div>\cb1 \
\cb3           <div className=\cf6 \strokec6 "relative"\cf0 \strokec4 >\cb1 \
\cb3             <\cf5 \strokec5 Lock\cf0 \strokec4  className=\cf6 \strokec6 "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"\cf0 \strokec4  aria-hidden=\cf6 \strokec6 "true"\cf0 \strokec4  />\cb1 \
\cb3             <\cf5 \strokec5 Input\cf0 \cb1 \strokec4 \
\cb3               id=\cf6 \strokec6 "password"\cf0 \cb1 \strokec4 \
\cb3               type=\cf6 \strokec6 "password"\cf0 \cb1 \strokec4 \
\cb3               autoComplete=\cf6 \strokec6 "current-password"\cf0 \cb1 \strokec4 \
\cb3               placeholder=\cf6 \strokec6 "\'95\'95\'95\'95\'95\'95\'95\'95"\cf0 \cb1 \strokec4 \
\cb3               value=\{password\}\cb1 \
\cb3               onChange=\{(e) => setPassword(e.target.value)\}\cb1 \
\cb3               className=\cf6 \strokec6 "pl-10 h-12"\cf0 \cb1 \strokec4 \
\cb3               required\cb1 \
\cb3             />\cb1 \
\cb3           </div>\cb1 \
\cb3         </div>\cb1 \
\cb3         <\cf5 \strokec5 Button\cf0 \strokec4  type=\cf6 \strokec6 "submit"\cf0 \strokec4  className=\cf6 \strokec6 "w-full h-12 font-medium"\cf0 \strokec4  disabled=\{loading\}>\cb1 \
\cb3           \{loading ? (\cb1 \
\cb3             <>\cb1 \
\cb3               <\cf5 \strokec5 Loader2\cf0 \strokec4  className=\cf6 \strokec6 "w-4 h-4 mr-2 animate-spin"\cf0 \strokec4  />\cb1 \
\cb3               \cf5 \strokec5 Logging\cf0 \strokec4  \cf2 \strokec2 in\cf0 \strokec4 ...\cb1 \
\cb3             </>\cb1 \
\cb3           ) : (\cb1 \
\cb3             \cf6 \strokec6 "Log in"\cf0 \cb1 \strokec4 \
\cb3           )\}\cb1 \
\cb3         </\cf5 \strokec5 Button\cf0 \strokec4 >\cb1 \
\cb3       </form>\cb1 \
\cb3     </\cf5 \strokec5 AuthLayout\cf0 \strokec4 >\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
\
}