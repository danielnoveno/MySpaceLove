import React, { useState, useEffect } from 'react'
import HTMLFlipBook from "react-pageflip";

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
      <div className="page" style={{ background: 'transparent' }}>
        <div className="page-content cover">
          {coverImage ? (
            <div className="custom-cover">
              <img
                src={coverImage}
                alt={coverTitle}
                className="cover-image"
                style={{ maxWidth: '100%', maxHeight: '80%', objectFit: 'contain' }}
              />
              <h1 className="cover-title" style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {coverTitle}
              </h1>
            </div>
          ) : (
            <img
              src={defaultCoverImage}
              alt="Cover"
              className="pokemon-logo"
            />
          )}
        </div>
      </div>

      {/* Content Pages */}
      {displayPages.map((page, index) => (
        <div className="page" key={page.id || `page-${index}`}>
          <div className="page-content">
            <div className="pokemon-container">
              {page.image && (
                <img
                  src={page.image}
                  alt={page.title || 'Page image'}
                  style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
                />
              )}
              <div className="pokemon-info">
                <h2 className="pokemon-name">{page.title || 'Untitled'}</h2>
                {page.id && <p className="pokemon-number">#{page.id}</p>}
                {page.types && page.types.length > 0 && (
                  <div>
                    {page.types.map((type) => (
                      <span key={type} className={`pokemon-type type-${type.toLowerCase()}`}>
                        {type}
                      </span>
                    ))}
                  </div>
                )}
                <p className="pokemon-description">{page.body || ''}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </HTMLFlipBook>
  );
}

export default Book
