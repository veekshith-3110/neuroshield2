/**
 * Feature Cards Component
 * 
 * Displays HRV analyzer features using smooth parallax scrolling cards.
 * Each card showcases a key feature with relevant imagery.
 * Cards are clickable and redirect to appropriate sections.
 */

import React, { useEffect, useRef } from 'react';
import './FeatureCards.css';

const FeatureCards = ({ onNavigate }) => {
  const cardsRef = useRef([]);

  const features = [
    {
      id: 1,
      title: 'File Upload',
      description: 'Upload CSV, FIT, or GPX files with drag & drop support',
      image: '/images/upload-cover.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=600&fit=crop',
      color: '#4f46e5',
      navigateTo: 'upload'
    },
    {
      id: 2,
      title: 'HRV Analysis',
      description: 'Advanced RMSSD calculation for accurate heart rate variability metrics',
      image: '/images/analysis-cover.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=600&fit=crop',
      color: '#10b981',
      navigateTo: 'upload' // Will show dashboard after upload
    },
    {
      id: 3,
      title: 'Real-time Charts',
      description: 'Interactive visualizations of heart rate and RR intervals over time',
      image: '/images/charts-cover.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=600&fit=crop',
      color: '#f59e0b',
      navigateTo: 'upload' // Will show dashboard after upload
    },
    {
      id: 4,
      title: 'Health Status',
      description: 'Get instant feedback on your stress levels and recovery status',
      image: '/images/health-cover.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=600&fit=crop',
      color: '#ef4444',
      navigateTo: 'upload' // Will show dashboard after upload
    },
    {
      id: 5,
      title: 'Data History',
      description: 'Track your HRV trends over time with saved analysis history',
      image: '/images/history-cover.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=600&fit=crop',
      color: '#8b5cf6',
      navigateTo: 'upload' // History is shown on upload page
    },
    {
      id: 6,
      title: 'Multi-Format Support',
      description: 'Compatible with CSV, FIT, and GPX file formats from various devices',
      image: '/images/formats-cover.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=600&fit=crop',
      color: '#06b6d4',
      navigateTo: 'upload'
    }
  ];

  useEffect(() => {
    // Parallax scrolling effect
    class ParallaxCard {
      constructor(cardEl) {
        this.cardEl = cardEl;
        this.imageWrapper = cardEl.querySelector('.card__image-wrapper');
        if (this.imageWrapper) {
          this.heightDiff = this.imageWrapper.clientHeight - this.cardEl.clientHeight;
        }
      }

      update() {
        if (!this.imageWrapper) return;
        
        const boundingRect = this.cardEl.getBoundingClientRect();
        const topOffset = boundingRect.y;
        const progress = topOffset / window.innerHeight;
        const offset = this.heightDiff * progress * -1;
        this.imageWrapper.style.transform = `translate(0, ${offset}px)`;
      }
    }

    const cardEls = document.querySelectorAll('.feature-card-parallax');
    if (cardEls.length === 0) return;
    
    const cards = Array.from(cardEls).map((cardEl) => new ParallaxCard(cardEl));

    function update() {
      cards.forEach((card) => card.update());
    }

    function onScroll() {
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll);
    requestAnimationFrame(update);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleImageError = (e, fallbackImage) => {
    if (e.target.src !== fallbackImage) {
      e.target.src = fallbackImage;
    }
  };

  /**
   * Handle card click - navigate to appropriate section
   * @param {string} navigateTo - The view to navigate to
   */
  const handleCardClick = (navigateTo) => {
    if (onNavigate) {
      onNavigate(navigateTo);
    }
  };

  return (
    <div className="features-container-parallax">
      <div className="header-parallax">
        <h2 className="header-title">HRV Analyzer Features</h2>
        <svg
          className="scroll-icon-parallax"
          viewBox="0 0 91 91"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m45.33 90a1.5 1.5 0 0 1 -1.5-1.5v-20.3a1.5 1.5 0 0 1 3 0v20.26a1.5 1.5 0 0 1 -1.5 1.54z"></path>
          <path d="m45.33 90a1.5 1.5 0 0 1 -1-.38l-9-7.88a1.5 1.5 0 1 1 2-2.25l9 7.88a1.49 1.49 0 0 1 .15 2.11 1.52 1.52 0 0 1 -1.15.52z"></path>
          <path d="m45.33 90a1.5 1.5 0 0 1 -1-2.63l9-7.88a1.5 1.5 0 1 1 2 2.25l-9 7.88a1.47 1.47 0 0 1 -1 .38z"></path>
          <path d="m50.86 60.73h-11.07a15.13 15.13 0 0 1 -15.11-15.11v-29a15.13 15.13 0 0 1 15.11-15.16h11.07a15.12 15.12 0 0 1 15.14 15.11v29.05a15.12 15.12 0 0 1 -15.14 15.11zm-11.07-56.27a12.12 12.12 0 0 0 -12.11 12.11v29.05a12.13 12.13 0 0 0 12.11 12.11h11.07a12.12 12.12 0 0 0 12.14-12.11v-29a12.12 12.12 0 0 0 -12.14-12.16z"></path>
          <path d="m45.33 26.37a1.5 1.5 0 0 1 -1.5-1.5v-7.53a1.5 1.5 0 0 1 3 0v7.53a1.5 1.5 0 0 1 -1.5 1.5z"></path>
        </svg>
      </div>

      <div className="cards-parallax">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            ref={(el) => (cardsRef.current[index] = el)}
            className="feature-card-parallax"
            onClick={() => handleCardClick(feature.navigateTo)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(feature.navigateTo);
              }
            }}
          >
            <div className="card__image-wrapper-parallax">
              <img
                className="card__image-parallax"
                src={feature.image}
                alt={feature.title}
                onError={(e) => handleImageError(e, feature.fallbackImage)}
              />
            </div>
            <div className="card__content-parallax">
              <h3 className="card__title-parallax">{feature.title}</h3>
              <p className="card__description-parallax">{feature.description}</p>
              <div className="card__click-hint-parallax">Click to explore →</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-parallax"></div>
    </div>
  );
};

export default FeatureCards;
