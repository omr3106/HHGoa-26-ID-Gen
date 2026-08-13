import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import heic2any from 'heic2any';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [certImage, setCertImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/Certificate.png';
    img.onload = () => {
      setCertImage(img);
    };
    img.onerror = () => {
      console.error("Failed to load Certificate.png. Ensure it is placed in the public folder.");
    }
  }, []);

  useEffect(() => {
    if (certImage && canvasRef.current) {
      drawCanvas();
    }
  }, [certImage, userImage, name, role]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let blob: Blob = file;
    if (file.name.toLowerCase().endsWith('.heic')) {
      try {
        const converted = await heic2any({ blob: file, toType: "image/png" });
        blob = Array.isArray(converted) ? converted[0] : converted;
      } catch (err) {
        console.error("HEIC conversion error:", err);
        alert("Failed to process HEIC image. Please try a different format.");
        return;
      }
    }

    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setUserImage(img);
    };
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !certImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = certImage.width;
    canvas.height = certImage.height;

    // Draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(certImage, 0, 0);

    const frameX = 374;
    const frameY = 212;
    const frameW = 790 - 374;
    const frameH = 758 - 212;

    // Draw user image
    if (userImage) {
      ctx.drawImage(userImage, frameX, frameY, frameW, frameH);
    }

    const textRegionX = 327;
    const textRegionY = 830;
    const textRegionW = 834 - 327;
    const textRegionH = 978 - 830;

    const textCenterX = textRegionX + textRegionW / 2;
    const textBaseY = textRegionY + textRegionH / 2;

    // Draw Name
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px "Times New Roman"';
    
    if (name) {
      ctx.fillText(name, textCenterX, textBaseY - 20);
    }

    // Draw Role
    ctx.font = '36px "Times New Roman"';
    if (role) {
      ctx.fillText(role, textCenterX, textBaseY + 35);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'HackerHouse_Goa_Certificate.png';
    a.click();
  };

  const handleShareX = () => {
    if (!canvasRef.current) return;
    
    const text = "I just generated my ID - Card for HackerHouse Goa 2026!  Can't wait to see everyone there! \n\n#FrameinGoa #HackerHouseGoa";
    
    handleDownload();
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <img className="bg-image" src="/bg.jpg" alt="Background" />

      <div className="wordmark">CodeGoa</div>

      <div className="page">
        <div className="hero">
          <div className="event-tag anim" style={{ '--d': '0.12s' } as React.CSSProperties}>
            HackerHouse Goa · 28th–31st Oct '26
          </div>

          <div className="headline">
            <span>Welcome to HackerHouse Goa '26</span>
          </div>

          <div className="content-split">
            <div className="controls anim" style={{ '--d': '0.4s' } as React.CSSProperties}>
              <div className="input-group">
                <label>Upload Photo</label>
                <input type="file" accept="image/png, image/jpeg, image/heic" onChange={handleImageUpload} />
              </div>
              
              <div className="input-group">
                <label>Your Name</label>
                <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Your Role</label>
                <input type="text" placeholder="Your Role" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              
              <div className="buttons">
                <button className="primary-btn" onClick={handleDownload} disabled={!userImage && !name && !role}>
                  Download Certificate
                </button>
                <button className="secondary-btn" onClick={handleShareX} disabled={!userImage && !name && !role}>
                  Share on X
                </button>
              </div>
            </div>

            <div className="canvas-container anim" style={{ '--d': '0.5s' } as React.CSSProperties}>
              {!certImage && (
                <div className="missing-cert">
                  Missing <code>public/Certificate.png</code>. Please add it!
                </div>
              )}
              <canvas ref={canvasRef} className="preview-canvas"></canvas>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
