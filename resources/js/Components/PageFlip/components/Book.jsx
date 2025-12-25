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
  // Default Pokemon data as fallback if no pages provided
  const defaultPages = [
    {
      id: "006",
      title: "Charizard",
      body: "Flies in search of strong opponents. Breathes extremely hot fire that melts anything, but never uses it on weaker foes.",
      image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/006.png",
      types: ["Fire", "Flying"]
    },
    {
      id: "025",
      title: "Pikachu",
      body: "When Pikachu meet, they touch tails to exchange electricity as a greeting.",
      image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/025.png",
      types: ["Electric"]
    },
    {
      id: "125",
      title: "Electabuzz",
      body: "Often kept at power plants to regulate electricity. Competes with others to attract lightning during storms.",
      image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/125.png",
      types: ["Electric"]
    },
    {
      id: "185",
      title: "Sudowoodo",
      body: "Despite looking like a tree, its body is more like rock. Hates water and hides when it rains.",
      image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/185.png",
      types: ["Rock"]
    },
    {
      id: "448",
      title: "Lucario",
      body: "Can read thoughts and movements by sensing others' aura. No foe can hide from Lucario.",
      image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/448.png",
      types: ["Fighting", "Steel"]
    },
    {
      id: "658",
      title: "Greninja",
      body: "Creates throwing stars from compressed water that can slice through metal when thrown at high speed.",
      image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/658.png",
      types: ["Water", "Dark"]
    },
    {
      id: "491",
      title: "Darkrai",
      body: "A legendary Pokémon that appears on moonless nights, putting people to sleep and giving them nightmares.",
      image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/491.png",
      types: ["Dark"]
    }
  ];

  // Use provided pages or fall back to default
  const displayPages = pages.length > 0 ? pages : defaultPages;
  const defaultCoverImage = "https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg";

  return (
    <HTMLFlipBook
      width={370}
      height={500}
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
          <div className="page" key={page.id || `page-${index}`} style={{ background: template.background }}>
            <div className="page-content" style={{ 
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              padding: '1.5rem',
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

              {/* Content */}
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
                  
                  {page.id && (
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: template.textColor,
                      opacity: 0.7,
                      margin: 0,
                    }}>
                      #{page.id}
                    </p>
                  )}
                  
                  {page.types && page.types.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {page.types.map((type) => (
                        <span 
                          key={type} 
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: template.borderColor,
                            color: template.titleColor,
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
  );
}

export default Book
