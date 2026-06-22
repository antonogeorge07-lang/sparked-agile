import React, { useState, useEffect } from 'react';

export default function App() {
  const [status, setStatus] = useState("STANDBY");
  const [localSub, setLocalSub] = useState("");
  const [remoteSub, setRemoteSub] = useState("");
  const [roomUrl, setRoomUrl] = useState("");
  const [isHost, setIsHost] = useState(true);

  useEffect(() => {
    const urlQueries = new URLSearchParams(window.location.search);
    if (urlQueries.get('room')) {
      setIsHost(false);
    }
  }, []);

  const handleLaunch = () => {
    setStatus("INITIALIZING...");
    setTimeout(() => {
      setStatus("P2P ACTIVE");
      if (isHost) {
        setRoomUrl(`${window.location.origin}?room=forgex-secure-node-${Math.random().toString(36).substring(7)}`);
      }
    }, 1000);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#0a0a0c', color: '#f5f5f7', minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1c1c1e', paddingBottom: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', color: '#ff3366', fontWeight: 900 }}>FORGE_X</h1>
          <div style={{ fontWeight: 'bold', fontSize: '13px', color: status === 'P2P ACTIVE' ? '#34c759' : '#ffcc00' }}>● {status}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#121214', borderRadius: '16px', border: '1px solid #1c1c1e', aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '11px', color: '#666', fontWeight: 'bold' }}>LOCAL CAMERA</div>
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', fontSize: '20px', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{localSub || "Waiting for speech..."}</div>
          </div>
          <div style={{ background: '#121214', borderRadius: '16px', border: '1px solid #1c1c1e', aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '11px', color: '#666', fontWeight: 'bold' }}>REMOTE RECEIVER</div>
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', fontSize: '20px', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{remoteSub || "Waiting for stream..."}</div>
          </div>
        </div>

        {roomUrl && (
          <div style={{ background: '#121214', border: '1px solid #ff3366', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'monospace', color: '#ff3366', fontSize: '14px' }}>{roomUrl}</span>
            <button onClick={() => { navigator.clipboard.writeText(roomUrl); alert("Link Copied!"); }} style={{ background: '#ff3366', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>Copy</button>
          </div>
        )}

        <div style={{ display: 'flex' }}>
          <button onClick={handleLaunch} style={{ flex: 1, padding: '16px', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', background: '#ff3366', color: 'white' }}>
            {isHost ? "Launch Clean Node Session" : "Connect to Incoming Signal"}
          </button>
        </div>

      </div>
    </div>
  );
}
