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
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Link\cf0 \strokec4 , useSearchParams \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "react-router-dom"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ base44 \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/api/base44Client"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Button\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/button"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Input\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/input"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Label\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/label"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Lock\cf0 \strokec4 , \cf5 \strokec5 Loader2\cf0 \strokec4 , \cf5 \strokec5 AlertTriangle\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf5 \strokec5 AuthLayout\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/AuthLayout"\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf5 \strokec5 ResetPassword\cf0 \strokec4 () \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  [searchParams] = useSearchParams();\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  resetToken = searchParams.\cf2 \strokec2 get\cf0 \strokec4 (\cf6 \strokec6 "token"\cf0 \strokec4 );\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [newPassword, setNewPassword] = useState(\cf6 \strokec6 ""\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [confirmPassword, setConfirmPassword] = useState(\cf6 \strokec6 ""\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [error, setError] = useState(\cf6 \strokec6 ""\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [loading, setLoading] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  handleSubmit = \cf2 \strokec2 async\cf0 \strokec4  (e) => \{\cb1 \
\cb3     e.preventDefault();\cb1 \
\cb3     setError(\cf6 \strokec6 ""\cf0 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (newPassword !== confirmPassword) \{\cb1 \
\cb3       setError(\cf6 \strokec6 "Passwords do not match"\cf0 \strokec4 );\cb1 \
\cb3       \cf2 \strokec2 return\cf0 \strokec4 ;\cb1 \
\cb3     \}\cb1 \
\cb3     setLoading(\cf2 \strokec2 true\cf0 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 try\cf0 \strokec4  \{\cb1 \
\cb3       \cf2 \strokec2 await\cf0 \strokec4  base44.auth.resetPassword(\{ resetToken, newPassword \});\cb1 \
\cb3       window.location.href = \cf6 \strokec6 "/login"\cf0 \strokec4 ;\cb1 \
\cb3     \} \cf2 \strokec2 catch\cf0 \strokec4  (err) \{\cb1 \
\cb3       setError(err.message || \cf6 \strokec6 "Failed to reset password"\cf0 \strokec4 );\cb1 \
\cb3     \} \cf2 \strokec2 finally\cf0 \strokec4  \{\cb1 \
\cb3       setLoading(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3     \}\cb1 \
\cb3   \};\cb1 \
\
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (!resetToken) \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3       <\cf5 \strokec5 AuthLayout\cf0 \cb1 \strokec4 \
\cb3         icon=\{\cf5 \strokec5 AlertTriangle\cf0 \strokec4 \}\cb1 \
\cb3         title=\cf6 \strokec6 "Invalid reset link"\cf0 \cb1 \strokec4 \
\cb3         subtitle=\cf6 \strokec6 "This password reset link is missing or invalid"\cf0 \cb1 \strokec4 \
\cb3         footer=\{\cb1 \
\cb3           <\cf5 \strokec5 Link\cf0 \strokec4  to=\cf6 \strokec6 "/forgot-password"\cf0 \strokec4  className=\cf6 \strokec6 "text-primary font-medium hover:underline"\cf0 \strokec4 >\cb1 \
\cb3             \cf5 \strokec5 Request\cf0 \strokec4  a \cf2 \strokec2 new\cf0 \strokec4  link\cb1 \
\cb3           </\cf5 \strokec5 Link\cf0 \strokec4 >\cb1 \
\cb3         \}\cb1 \
\cb3       >\cb1 \
\cb3         <p className=\cf6 \strokec6 "text-sm text-foreground text-center"\cf0 \strokec4 >\cb1 \
\cb3           \cf5 \strokec5 The\cf0 \strokec4  link you used appears to be incomplete. \cf5 \strokec5 Please\cf0 \strokec4  request a \cf2 \strokec2 new\cf0 \strokec4  password reset email.\cb1 \
\cb3         </p>\cb1 \
\cb3       </\cf5 \strokec5 AuthLayout\cf0 \strokec4 >\cb1 \
\cb3     );\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <\cf5 \strokec5 AuthLayout\cf0 \cb1 \strokec4 \
\cb3       icon=\{\cf5 \strokec5 Lock\cf0 \strokec4 \}\cb1 \
\cb3       title=\cf6 \strokec6 "New password"\cf0 \cb1 \strokec4 \
\cb3       subtitle=\cf6 \strokec6 "Enter your new password below"\cf0 \cb1 \strokec4 \
\cb3     >\cb1 \
\cb3       \{error && (\cb1 \
\cb3         <div className=\cf6 \strokec6 "mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"\cf0 \strokec4 >\cb1 \
\cb3           \{error\}\cb1 \
\cb3         </div>\cb1 \
\cb3       )\}\cb1 \
\cb3       <form onSubmit=\{handleSubmit\} className=\cf6 \strokec6 "space-y-4"\cf0 \strokec4 >\cb1 \
\cb3         <div className=\cf6 \strokec6 "space-y-2"\cf0 \strokec4 >\cb1 \
\cb3           <\cf5 \strokec5 Label\cf0 \strokec4  htmlFor=\cf6 \strokec6 "password"\cf0 \strokec4 >\cf5 \strokec5 New\cf0 \strokec4  \cf5 \strokec5 Password\cf0 \strokec4 </\cf5 \strokec5 Label\cf0 \strokec4 >\cb1 \
\cb3           <div className=\cf6 \strokec6 "relative"\cf0 \strokec4 >\cb1 \
\cb3             <\cf5 \strokec5 Lock\cf0 \strokec4  className=\cf6 \strokec6 "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"\cf0 \strokec4  aria-hidden=\cf6 \strokec6 "true"\cf0 \strokec4  />\cb1 \
\cb3             <\cf5 \strokec5 Input\cf0 \cb1 \strokec4 \
\cb3               id=\cf6 \strokec6 "password"\cf0 \cb1 \strokec4 \
\cb3               type=\cf6 \strokec6 "password"\cf0 \cb1 \strokec4 \
\cb3               autoComplete=\cf6 \strokec6 "new-password"\cf0 \cb1 \strokec4 \
\cb3               autoFocus\cb1 \
\cb3               placeholder=\cf6 \strokec6 "\'95\'95\'95\'95\'95\'95\'95\'95"\cf0 \cb1 \strokec4 \
\cb3               value=\{newPassword\}\cb1 \
\cb3               onChange=\{(e) => setNewPassword(e.target.value)\}\cb1 \
\cb3               className=\cf6 \strokec6 "pl-10 h-12"\cf0 \cb1 \strokec4 \
\cb3               required\cb1 \
\cb3             />\cb1 \
\cb3           </div>\cb1 \
\cb3         </div>\cb1 \
\cb3         <div className=\cf6 \strokec6 "space-y-2"\cf0 \strokec4 >\cb1 \
\cb3           <\cf5 \strokec5 Label\cf0 \strokec4  htmlFor=\cf6 \strokec6 "confirm"\cf0 \strokec4 >\cf5 \strokec5 Confirm\cf0 \strokec4  \cf5 \strokec5 Password\cf0 \strokec4 </\cf5 \strokec5 Label\cf0 \strokec4 >\cb1 \
\cb3           <div className=\cf6 \strokec6 "relative"\cf0 \strokec4 >\cb1 \
\cb3             <\cf5 \strokec5 Lock\cf0 \strokec4  className=\cf6 \strokec6 "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"\cf0 \strokec4  aria-hidden=\cf6 \strokec6 "true"\cf0 \strokec4  />\cb1 \
\cb3             <\cf5 \strokec5 Input\cf0 \cb1 \strokec4 \
\cb3               id=\cf6 \strokec6 "confirm"\cf0 \cb1 \strokec4 \
\cb3               type=\cf6 \strokec6 "password"\cf0 \cb1 \strokec4 \
\cb3               autoComplete=\cf6 \strokec6 "new-password"\cf0 \cb1 \strokec4 \
\cb3               placeholder=\cf6 \strokec6 "\'95\'95\'95\'95\'95\'95\'95\'95"\cf0 \cb1 \strokec4 \
\cb3               value=\{confirmPassword\}\cb1 \
\cb3               onChange=\{(e) => setConfirmPassword(e.target.value)\}\cb1 \
\cb3               className=\cf6 \strokec6 "pl-10 h-12"\cf0 \cb1 \strokec4 \
\cb3               required\cb1 \
\cb3             />\cb1 \
\cb3           </div>\cb1 \
\cb3         </div>\cb1 \
\cb3         <\cf5 \strokec5 Button\cf0 \strokec4  type=\cf6 \strokec6 "submit"\cf0 \strokec4  className=\cf6 \strokec6 "w-full h-12 font-medium"\cf0 \strokec4  disabled=\{loading\}>\cb1 \
\cb3           \{loading ? (\cb1 \
\cb3             <>\cb1 \
\cb3               <\cf5 \strokec5 Loader2\cf0 \strokec4  className=\cf6 \strokec6 "w-4 h-4 mr-2 animate-spin"\cf0 \strokec4  />\cb1 \
\cb3               \cf5 \strokec5 Resetting\cf0 \strokec4 ...\cb1 \
\cb3             </>\cb1 \
\cb3           ) : (\cb1 \
\cb3             \cf6 \strokec6 "Reset password"\cf0 \cb1 \strokec4 \
\cb3           )\}\cb1 \
\cb3         </\cf5 \strokec5 Button\cf0 \strokec4 >\cb1 \
\cb3       </form>\cb1 \
\cb3     </\cf5 \strokec5 AuthLayout\cf0 \strokec4 >\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
\
}