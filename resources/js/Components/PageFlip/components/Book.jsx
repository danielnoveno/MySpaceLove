import React, { useState, useEffect } from 'react'
import HTMLFlipBook from "react-pageflip";

// Template desain yang berbeda untuk setiap halaman
const pageTemplates = [
  {
    // Template 1: Romantic Pink dengan Hati
    background: 'linear-gradient(135deg, #ffeef8 0%, #ffe0f0 50%, #ffd4e8 100%)',
    pattern: 'radial-gradient(circle at 20% 30%, rgba(255, 105, 180, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 182, 193, 0.15) 0%, transparent 50%)',
    decorations: [
      { emoji: '💕', size: '2.5rem', top: '8%', left: '5%', rotation: -15, opacity: 0.4 },
      { emoji: '💖', size: '2rem', top: '12%', right: '8%', rotation: 20, opacity: 0.35 },
      { emoji: '💗', size: '1.8rem', bottom: '10%', left: '10%', rotation: 10, opacity: 0.3 },
      { emoji: '💝', size: '2.2rem', bottom: '6%', right: '6%', rotation: -25, opacity: 0.4 },
    ],
    textColor: '#8b0045',
    titleColor: '#c71585',
    borderColor: 'rgba(255, 105, 180, 0.4)',
  },
  {
    // Template 2: Dreamy Purple dengan Bintang
    background: 'linear-gradient(135deg, #f3e7ff 0%, #e9d5ff 50%, #dcc3ff 100%)',
    pattern: 'radial-gradient(circle at 30% 20%, rgba(147, 51, 234, 0.12) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)',
    decorations: [
      { emoji: '⭐', size: '2.3rem', top: '6%', left: '7%', rotation: 0, opacity: 0.45 },
      { emoji: '✨', size: '2rem', top: '10%', right: '10%', rotation: 45, opacity: 0.4 },
      { emoji: '🌟', size: '2.1rem', bottom: '8%', left: '8%', rotation: -20, opacity: 0.35 },
      { emoji: '💫', size: '2rem', bottom: '12%', right: '7%', rotation: 15, opacity: 0.4 },
    ],
    textColor: '#581c87',
    titleColor: '#7c3aed',
    borderColor: 'rgba(147, 51, 234, 0.4)',
  },
  {
    // Template 3: Soft Peach dengan Bunga
    background: 'linear-gradient(135deg, #fff5f0 0%, #ffe8dc 50%, #ffdcc8 100%)',
    pattern: 'radial-gradient(circle at 25% 25%, rgba(251, 146, 60, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(253, 186, 116, 0.1) 0%, transparent 50%)',
    decorations: [
      { emoji: '🌸', size: '2.4rem', top: '10%', left: '6%', rotation: -10, opacity: 0.4 },
      { emoji: '🌺', size: '2.1rem', top: '8%', right: '9%', rotation: 25, opacity: 0.35 },
      { emoji: '🌼', size: '1.9rem', bottom: '12%', left: '9%', rotation: 15, opacity: 0.38 },
      { emoji: '🌻', size: '2rem', bottom: '8%', right: '8%', rotation: -15, opacity: 0.35 },
    ],
    textColor: '#7c2d12',
    titleColor: '#ea580c',
    borderColor: 'rgba(251, 146, 60, 0.4)',
  },
  {
    // Template 4: Mint Green dengan Daun
    background: 'linear-gradient(135deg, #f0fdf9 0%, #d1fae5 50%, #a7f3d0 100%)',
    pattern: 'radial-gradient(circle at 35% 30%, rgba(16, 185, 129, 0.12) 0%, transparent 50%), radial-gradient(circle at 65% 70%, rgba(52, 211, 153, 0.12) 0%, transparent 50%)',
    decorations: [
      { emoji: '🍀', size: '2.2rem', top: '7%', left: '8%', rotation: 10, opacity: 0.42 },
      { emoji: '🌿', size: '2rem', top: '12%', right: '7%', rotation: -20, opacity: 0.38 },
      { emoji: '🌱', size: '2.1rem', bottom: '9%', left: '7%', rotation: 20, opacity: 0.4 },
      { emoji: '🍃', size: '1.9rem', bottom: '11%', right: '9%', rotation: -10, opacity: 0.35 },
    ],
    textColor: '#064e3b',
    titleColor: '#059669',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    // Template 5: Sky Blue dengan Awan
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
    pattern: 'radial-gradient(circle at 40% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)',
    decorations: [
      { emoji: '☁️', size: '2.3rem', top: '9%', left: '9%', rotation: -5, opacity: 0.4 },
      { emoji: '🌈', size: '2rem', top: '11%', right: '8%', rotation: 30, opacity: 0.38 },
      { emoji: '⛅', size: '2.1rem', bottom: '10%', left: '10%', rotation: 12, opacity: 0.35 },
      { emoji: '🌤️', size: '2rem', bottom: '7%', right: '7%', rotation: -18, opacity: 0.4 },
    ],
    textColor: '#0c4a6e',
    titleColor: '#0284c7',
    borderColor: 'rgba(14, 165, 233, 0.4)',
  },
  {
    // Template 6: Lavender Dreams dengan Hati & Bintang
    background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)',
    pattern: 'radial-gradient(circle at 28% 35%, rgba(192, 132, 252, 0.15) 0%, transparent 50%), radial-gradient(circle at 72% 65%, rgba(216, 180, 254, 0.15) 0%, transparent 50%)',
    decorations: [
      { emoji: '🦋', size: '2.2rem', top: '8%', left: '7%', rotation: -12, opacity: 0.42 },
      { emoji: '🌷', size: '2rem', top: '10%', right: '9%', rotation: 22, opacity: 0.38 },
      { emoji: '🎀', size: '2.1rem', bottom: '11%', left: '8%', rotation: 8, opacity: 0.4 },
      { emoji: '💐', size: '1.9rem', bottom: '9%', right: '10%', rotation: -20, opacity: 0.35 },
    ],
    textColor: '#581c87',
    titleColor: '#9333ea',
    borderColor: 'rgba(192, 132, 252, 0.4)',
  },
];

function Book({ pages = [], coverImage = null, coverTitle = "Our Story" }) {
  // Load fonts for canvas elements
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Default placeholder data as fallback if no pages provided
  const defaultPages = [
    {
      id: "001",
      title: "Kenangan Pertama",
      body: "Ini adalah tempat untuk menuliskan cerita indah tentang momen pertama kita. Tambahkan detail tentang apa yang kita rasakan saat itu.",
      image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop",
      types: ["Momen", "Cinta"]
    },
    {
      id: "002",
      title: "Petualangan Bersama",
      body: "Ceritakan tentang perjalanan atau petualangan seru yang pernah kita lalui. Setiap langkah terasa lebih berarti saat bersamamu.",
      image: "https://images.unsplash.com/photo-1522673607200-1648832cee98?q=80&w=1000&auto=format&fit=crop",
      types: ["Trip", "Bahagia"]
    },
    {
      id: "003",
      title: "Momen Spesial",
      body: "Waktu seakan berhenti setiap kali kita menghabiskan waktu bersama. Kenangan ini akan selalu tersimpan rapi di dalam hati.",
      image: "https://images.unsplash.com/photo-1494972308255-a03c1101349a?q=80&w=1000&auto=format&fit=crop",
      types: ["Spesial", "Abadi"]
    }
  ];

  // Use provided pages or fall back to default
  const displayPages = pages.length > 0 ? pages : defaultPages;
  const defaultCoverImage = "https://images.unsplash.com/photo-1544924222-b131ea92f6b3?q=80&w=1000&auto=format&fit=crop";

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Background Particles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {/* Large floating emojis */}
        <div style={{ position: 'absolute', top: '8%', left: '10%', fontSize: '4rem', opacity: 0.15, animation: 'float 4s ease-in-out infinite' }}>💕</div>
        <div style={{ position: 'absolute', top: '15%', right: '12%', fontSize: '3.5rem', opacity: 0.12, animation: 'float 5s ease-in-out infinite', animationDelay: '0.5s' }}>⭐</div>
        <div style={{ position: 'absolute', top: '45%', left: '5%', fontSize: '3.8rem', opacity: 0.13, animation: 'float 4.5s ease-in-out infinite', animationDelay: '1s' }}>🌸</div>
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', fontSize: '4.2rem', opacity: 0.14, animation: 'float 5.5s ease-in-out infinite', animationDelay: '1.5s' }}>💖</div>
        <div style={{ position: 'absolute', bottom: '35%', left: '15%', fontSize: '3.6rem', opacity: 0.12, animation: 'float 4.8s ease-in-out infinite', animationDelay: '2s' }}>✨</div>
        <div style={{ position: 'absolute', top: '60%', right: '18%', fontSize: '3.9rem', opacity: 0.13, animation: 'float 5.2s ease-in-out infinite', animationDelay: '2.5s' }}>🦋</div>
        <div style={{ position: 'absolute', top: '30%', left: '25%', fontSize: '3.4rem', opacity: 0.11, animation: 'float 4.3s ease-in-out infinite', animationDelay: '3s' }}>🌺</div>
        <div style={{ position: 'absolute', bottom: '15%', left: '35%', fontSize: '3.7rem', opacity: 0.12, animation: 'float 5.8s ease-in-out infinite', animationDelay: '3.5s' }}>💝</div>
        
        {/* Geometric shapes with gradients */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,105,180,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 10s ease-in-out infinite',
          animationDelay: '2s',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'pulse 12s ease-in-out infinite',
          animationDelay: '4s',
        }} />
      </div>

      {/* Header with title */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.5rem',
          borderRadius: '9999px',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize: '1.5rem' }}>📖</span>
          <span style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: 'white',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Memory Flipbook
          </span>
          <span style={{ fontSize: '1.5rem' }}>💕</span>
        </div>
      </div>

      {/* Main flipbook container with glow */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '1000px', // Minimum width for 2-page spread (450px * 2 + spacing)
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Glow effect behind flipbook */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1100px',
          height: '750px',
          background: 'radial-gradient(ellipse, rgba(255,105,180,0.3) 0%, rgba(147,51,234,0.2) 50%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'glow 4s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: -1,
        }} />

        {/* The actual flipbook */}
        <HTMLFlipBook
          width={450}
          height={600}
          maxShadowOpacity={0.5}
          drawShadow={true}
          showCover={true}
          size='fixed'
        >
      {/* Cover Page */}
      <div className="page" style={{ 
        background: 'linear-gradient(135deg, #ffeef8 0%, #ffe0f0 30%, #e9d5ff 70%, #dcc3ff 100%)',
        overflow: 'hidden',
      }}>
        <div className="page-content cover" style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
        }}>
          {/* Pattern overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255, 105, 180, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.12) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />

          {/* Floating decorations */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '5%', left: '8%', fontSize: '2.5rem', opacity: 0.4, animation: 'float 3s ease-in-out infinite' }}>💕</div>
            <div style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '2rem', opacity: 0.35, animation: 'float 3.5s ease-in-out infinite', animationDelay: '0.5s' }}>⭐</div>
            <div style={{ position: 'absolute', top: '60%', left: '5%', fontSize: '2.2rem', opacity: 0.38, animation: 'float 4s ease-in-out infinite', animationDelay: '1s' }}>🌸</div>
            <div style={{ position: 'absolute', bottom: '15%', right: '8%', fontSize: '2.3rem', opacity: 0.4, animation: 'float 3.8s ease-in-out infinite', animationDelay: '1.5s' }}>💖</div>
            <div style={{ position: 'absolute', bottom: '8%', left: '12%', fontSize: '2rem', opacity: 0.35, animation: 'float 4.2s ease-in-out infinite', animationDelay: '2s' }}>✨</div>
            <div style={{ position: 'absolute', top: '35%', right: '5%', fontSize: '2.1rem', opacity: 0.37, animation: 'float 3.6s ease-in-out infinite', animationDelay: '2.5s' }}>🦋</div>
          </div>

          {/* Decorative corners */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '80px',
            height: '80px',
            borderLeft: '4px solid rgba(255, 105, 180, 0.5)',
            borderTop: '4px solid rgba(255, 105, 180, 0.5)',
            borderTopLeftRadius: '1rem',
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '80px',
            height: '80px',
            borderRight: '4px solid rgba(147, 51, 234, 0.5)',
            borderTop: '4px solid rgba(147, 51, 234, 0.5)',
            borderTopRightRadius: '1rem',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '80px',
            height: '80px',
            borderLeft: '4px solid rgba(147, 51, 234, 0.5)',
            borderBottom: '4px solid rgba(147, 51, 234, 0.5)',
            borderBottomLeftRadius: '1rem',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '80px',
            height: '80px',
            borderRight: '4px solid rgba(255, 105, 180, 0.5)',
            borderBottom: '4px solid rgba(255, 105, 180, 0.5)',
            borderBottomRightRadius: '1rem',
          }} />

          {/* Content */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            width: '100%',
          }}>
            {coverImage ? (
              <>
                {/* Custom Cover Image */}
                <div style={{
                  width: '100%',
                  maxWidth: '280px',
                  height: '280px',
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  border: '4px solid white',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,105,180,0.3)',
                  backgroundColor: 'white',
                }}>
                  <img
                    src={coverImage}
                    alt={coverTitle}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                
                {/* Custom Title */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                  padding: '1rem 1.5rem',
                  borderRadius: '1.5rem',
                  border: '2px solid rgba(255,105,180,0.3)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <h1 style={{ 
                    margin: 0,
                    fontSize: '1.75rem', 
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #c71585 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: 'none',
                  }}>
                    {coverTitle}
                  </h1>
                </div>

                {/* Decorative subtitle */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#8b0045',
                  fontWeight: '600',
                  opacity: 0.8,
                }}>
                  <span style={{ fontSize: '1.2rem' }}>💝</span>
                  <span>Our Love Story</span>
                  <span style={{ fontSize: '1.2rem' }}>💝</span>
                </div>
              </>
            ) : (
              <>
                {/* Default Cover */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                  padding: '2rem',
                  borderRadius: '2rem',
                  border: '3px solid rgba(255,105,180,0.4)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
                  <h1 style={{ 
                    margin: 0,
                    fontSize: '2rem', 
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #c71585 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    {coverTitle}
                  </h1>
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.875rem',
                    color: '#8b0045',
                    fontWeight: '600',
                    opacity: 0.8,
                  }}>
                    A Collection of Memories
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  fontSize: '1.5rem',
                }}>
                  <span style={{ animation: 'float 2s ease-in-out infinite' }}>💕</span>
                  <span style={{ animation: 'float 2s ease-in-out infinite', animationDelay: '0.3s' }}>✨</span>
                  <span style={{ animation: 'float 2s ease-in-out infinite', animationDelay: '0.6s' }}>💖</span>
                </div>
              </>
            )}
          </div>

          {/* CSS Animation */}
          <style>{`
            @keyframes float {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-10px);
              }
            }
          `}</style>
        </div>
      </div>

      {/* Content Pages */}
      {displayPages.map((page, index) => {
        const template = pageTemplates[index % pageTemplates.length];
        
        return (
          <div className="page" key={page.id || `page-${index}`} style={{ background: page.type === 'canvas' ? (page.bg_color || '#fff5f5') : template.background }}>
            <div className="page-content" style={{ 
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              padding: page.type === 'canvas' ? '0' : '1.5rem',
              borderRadius: '1rem',
            }}>
              {/* Pattern overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: template.pattern,
                pointerEvents: 'none',
              }} />
              {/* Notebook Lines Effect */}
              <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  backgroundImage: `
                    repeating-linear-gradient(
                      transparent,
                      transparent 29px,
                      ${template.borderColor} 29px,
                      ${template.borderColor} 30px
                    ),
                    linear-gradient(
                      to right,
                      transparent 0,
                      transparent 40px,
                      rgba(255, 182, 193, 0.3) 40px,
                      rgba(255, 182, 193, 0.3) 42px,
                      transparent 42px
                    )
                  `,
                  backgroundSize: '100% 30px, 100% 100%',
                  opacity: 0.4,
                }} />

              {/* Decorative elements */}
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}>
                {template.decorations.map((deco, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      top: deco.top,
                      bottom: deco.bottom,
                      left: deco.left,
                      right: deco.right,
                      transform: `rotate(${deco.rotation}deg)`,
                      opacity: deco.opacity,
                      fontSize: deco.size,
                      animation: `float ${3 + idx * 0.5}s ease-in-out infinite`,
                      animationDelay: `${idx * 0.5}s`,
                    }}
                  >
                    {deco.emoji}
                  </div>
                ))}
              </div>

              {/* Corner decorations */}
              <>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '60px',
                  height: '60px',
                  borderLeft: `3px solid ${template.borderColor}`,
                  borderTop: `3px solid ${template.borderColor}`,
                  borderTopLeftRadius: '1rem',
                  opacity: 0.5,
                }} />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '60px',
                  height: '60px',
                  borderRight: `3px solid ${template.borderColor}`,
                  borderTop: `3px solid ${template.borderColor}`,
                  borderTopRightRadius: '1rem',
                  opacity: 0.5,
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '60px',
                  height: '60px',
                  borderLeft: `3px solid ${template.borderColor}`,
                  borderBottom: `3px solid ${template.borderColor}`,
                  borderBottomLeftRadius: '1rem',
                  opacity: 0.5,
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '60px',
                  height: '60px',
                  borderRight: `3px solid ${template.borderColor}`,
                  borderBottom: `3px solid ${template.borderColor}`,
                  borderBottomRightRadius: '1rem',
                  opacity: 0.5,
                }} />
              </>

              {/* Content */}
              {page.type === 'canvas' ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                    {/* Book Fold Line */}
                    <div style={{ position: 'absolute', insetY: 0, left: 0, width: '1px', backgroundColor: 'rgba(0,0,0,0.05)', zIndex: 50 }} />
                    
                    {page.canvas_elements?.map((el) => (
                        <div
                            key={el.id}
                            style={{
                                position: 'absolute',
                                left: `${el.x}%`,
                                top: `${el.y}%`,
                                width: el.width ? `${el.width}%` : 'auto',
                                transform: `translate(-50%, -50%) rotate(${el.rotate || 0}deg)`,
                                zIndex: el.zIndex,
                                cursor: 'default',
                                userSelect: 'none'
                            }}
                        >
                            {el.type === 'image' && el.image_url && (
                                <img 
                                    src={el.image_url} 
                                    alt="Canvas element" 
                                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '2px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                                />
                            )}
                            {el.type === 'text' && (
                                <div style={{ 
                                    whiteSpace: 'pre-wrap', 
                                    wordBreak: 'break-word', 
                                    paddingLeft: '0.5rem', 
                                    paddingRight: '0.5rem', 
                                    lineHeight: 1.6,
                                    fontFamily: el.fontFamily || 'serif',
                                    fontSize: `${el.fontSize || 16}px`,
                                    color: el.color || '#333'
                                }}>
                                    {el.content}
                                </div>
                            )}
                            {el.type === 'sticker' && (
                                <div style={{ fontSize: `${el.fontSize || 40}px` }}>
                                    {el.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
              ) : (
                <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {page.image && (
                    <div style={{
                        overflow: 'hidden',
                        borderRadius: '1rem',
                        border: '3px solid white',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        backgroundColor: 'white',
                    }}>
                        <img
                        src={page.image}
                        alt={page.title || 'Page image'}
                        style={{ 
                            width: '100%', 
                            height: '200px', 
                            objectFit: 'cover',
                            display: 'block',
                        }}
                        />
                    </div>
                    )}
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: template.titleColor,
                        margin: 0,
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                        {page.title || 'Untitled'}
                    </h2>
                    
                    {(page.label || page.id) && (
                        <p style={{ 
                        fontSize: '0.875rem', 
                        color: template.textColor,
                        opacity: 0.7,
                        margin: 0,
                        fontWeight: '600',
                        }}>
                        {page.label || `#${page.id}`}
                        </p>
                    )}
                    
                    {page.types && page.types.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {page.types.map((type, idx) => (
                            <span 
                            key={idx} 
                            style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                backgroundColor: template.borderColor,
                                color: template.titleColor,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            }}
                            >
                            {type}
                            </span>
                        ))}
                        </div>
                    )}
                    
                    <p style={{ 
                        fontSize: '0.875rem', 
                        lineHeight: '1.6',
                        color: template.textColor,
                        margin: 0,
                        fontWeight: '500',
                    }}>
                        {page.body || ''}
                    </p>
                    </div>
                </div>
              )}

              {/* CSS Animation */}
              <style>{`
                @keyframes float {
                  0%, 100% {
                    transform: translateY(0px) rotate(var(--rotation, 0deg));
                  }
                  50% {
                    transform: translateY(-10px) rotate(var(--rotation, 0deg));
                  }
                }
              `}</style>
            </div>
          </div>
        );
      })}
    </HTMLFlipBook>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}

export default Book
