import React, { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

interface ProductTourProps {
    onComplete?: () => void;
    autoStart?: boolean;
    tourType?: 'dashboard' | 'full';
}

export default function ProductTour({ 
    onComplete, 
    autoStart = false,
    tourType = 'dashboard' 
}: ProductTourProps) {
    const { translations, locale } = usePage().props as any;
    const [isActive, setIsActive] = useState(false);

    const t = (key: string, fallback: string = '') => {
        const keys = key.split('.');
        let value = translations;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || fallback;
    };

    const dashboardSteps = [
        {
            element: '#space-title',
            popover: {
                title: t('tour.welcome.title', 'Welcome to LoveSpace! 💕'),
                description: t('tour.welcome.description', 'Let\'s take a quick tour to help you get started with all the amazing features!') + 
                    '<br/><br/><small style="opacity: 0.8;">💡 ' + 
                    (locale === 'id' ? 'Anda bisa melewati tour ini kapan saja dengan klik tombol ✕ atau tekan ESC' : 'You can skip this tour anytime by clicking the ✕ button or pressing ESC') + 
                    '</small>',
                side: 'bottom',
                align: 'center'
            }
        },
        {
            element: '#stats-section',
            popover: {
                title: t('tour.stats.title', 'Your Love Statistics 📊'),
                description: t('tour.stats.description', 'Track your relationship milestones: days together, memories created, and special moments shared.'),
                side: 'bottom',
                align: 'start'
            }
        },
        {
            element: '#timeline-section',
            popover: {
                title: t('tour.timeline.title', 'Love Timeline 📅'),
                description: t('tour.timeline.description', 'Create and cherish your relationship timeline. Add photos, videos, and notes for each special moment.'),
                side: 'top',
                align: 'start'
            }
        },
        {
            element: '#gallery-section',
            popover: {
                title: t('tour.gallery.title', 'Media Gallery 📸'),
                description: t('tour.gallery.description', 'Store all your precious photos and videos in one beautiful gallery. Organize by albums and relive your memories.'),
                side: 'top',
                align: 'start'
            }
        },
        {
            element: '#countdown-section',
            popover: {
                title: t('tour.countdown.title', 'Special Countdowns ⏰'),
                description: t('tour.countdown.description', 'Create countdowns for anniversaries, birthdays, trips, and other special events. Never miss an important date!'),
                side: 'top',
                align: 'start'
            }
        },
        {
            element: '#daily-messages-section',
            popover: {
                title: t('tour.daily_messages.title', 'Daily Love Messages 💌'),
                description: t('tour.daily_messages.description', 'Send sweet daily messages to your partner. Schedule them or send instantly via email.'),
                side: 'top',
                align: 'start'
            }
        },
        {
            element: '#journal-section',
            popover: {
                title: t('tour.journal.title', 'Love Journal 📖'),
                description: t('tour.journal.description', 'Write private or shared journal entries. Document your feelings, thoughts, and relationship journey.'),
                side: 'top',
                align: 'start'
            }
        },
        {
            element: '#location-menu',
            popover: {
                title: t('tour.location.title', 'Location Sharing 📍'),
                description: t('tour.location.description', 'Share your real-time location with your partner. Perfect for long-distance relationships!'),
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#spotify-menu',
            popover: {
                title: t('tour.spotify.title', 'Spotify Companion 🎵'),
                description: t('tour.spotify.description', 'Listen to music together! Create shared playlists, schedule surprise songs, and sync playback.'),
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#games-menu',
            popover: {
                title: t('tour.games.title', 'Couple Games 🎮'),
                description: t('tour.games.description', 'Play fun games together: Chess, Tic-Tac-Toe, and more! Compete and have fun.'),
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#memory-lane-menu',
            popover: {
                title: t('tour.memory_lane.title', 'Memory Lane 🎁'),
                description: t('tour.memory_lane.description', 'Create interactive surprise experiences with puzzles, lucky boxes, and digital flipbooks!'),
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#video-call-menu',
            popover: {
                title: t('tour.video_call.title', 'Video Call Room 📹'),
                description: t('tour.video_call.description', 'Start instant video calls with your partner. Secure and private room just for you two.'),
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#wishlist-menu',
            popover: {
                title: t('tour.wishlist.title', 'Wishlist 🎁'),
                description: t('tour.wishlist.description', 'Create and share wishlists. Know exactly what your partner wants for special occasions!'),
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#docs-menu',
            popover: {
                title: t('tour.docs.title', 'Important Documents 📄'),
                description: t('tour.docs.description', 'Store important documents and files securely. Access them anytime, anywhere.'),
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#surprise-notes-menu',
            popover: {
                title: t('tour.surprise_notes.title', 'Surprise Notes 💝'),
                description: t('tour.surprise_notes.description', 'Leave surprise notes for your partner to discover. Make their day special!'),
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#goals-menu',
            popover: {
                title: t('tour.goals.title', 'Relationship Goals 🎯'),
                description: t('tour.goals.description', 'Set and track relationship goals together. Build your future as a team!'),
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#notifications-button',
            popover: {
                title: t('tour.notifications.title', 'Notifications 🔔'),
                description: t('tour.notifications.description', 'Stay updated with all activities. Get notified when your partner adds new content or interacts with yours.'),
                side: 'bottom',
                align: 'end'
            }
        },
        {
            element: '#profile-menu',
            popover: {
                title: t('tour.profile.title', 'Your Profile ⚙️'),
                description: t('tour.profile.description', 'Manage your profile, change language, customize theme, and adjust settings.'),
                side: 'bottom',
                align: 'end'
            }
        },
        {
            popover: {
                title: t('tour.complete.title', 'You\'re All Set! 🎉'),
                description: t('tour.complete.description', 'Start creating beautiful memories with your partner. You can replay this tour anytime from your profile settings. Enjoy LoveSpace!'),
                side: 'center',
                align: 'center'
            }
        }
    ];

    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            progressText: locale === 'id' ? '{{current}} dari {{total}}' : '{{current}} of {{total}}',
            nextBtnText: t('tour.next', 'Next') + ' →',
            prevBtnText: '← ' + t('tour.previous', 'Previous'),
            doneBtnText: t('tour.done', 'Done') + ' ✓',
            showButtons: ['next', 'previous', 'close'],
            steps: dashboardSteps.filter(step => {
                // Filter out steps where element doesn't exist
                if (!step.element) return true; // Keep center steps
                const element = document.querySelector(step.element);
                return element !== null;
            }),
            onDestroyStarted: () => {
                // Allow users to close the tour anytime without confirmation
                driverObj.destroy();
                setIsActive(false);
                
                // Mark tour as completed in backend
                if (onComplete) {
                    onComplete();
                }
                
                // Call backend to save completion (mark as skipped/completed)
                axios.post('/tour/complete')
                    .catch(err => console.error('Failed to save tour completion:', err));
            },
            onDestroyed: () => {
                setIsActive(false);
                if (onComplete) {
                    onComplete();
                }
            },
            popoverClass: 'lovespace-tour-popover',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            smoothScroll: true,
            allowClose: true,
            disableActiveInteraction: false,
            allowKeyboardControl: true, // Enable ESC key to close
            onCloseClick: () => {
                // Explicitly handle close button click
                driverObj.destroy();
            },
        });

        driverObj.drive();
        setIsActive(true);
    };

    useEffect(() => {
        if (autoStart) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                startTour();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoStart]);

    return (
        <div className="product-tour-container">
            {!isActive && (
                <button
                    onClick={startTour}
                    title={t('tour.start_tour', 'Start Tour')}
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
                    aria-label={t('tour.start_tour', 'Start Tour')}
                >
                    <svg 
                        className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2.5} 
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                    </svg>
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                        ?
                    </span>
                </button>
            )}

            <style>{`
                .lovespace-tour-popover {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                .lovespace-tour-popover .driver-popover-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .lovespace-tour-popover .driver-popover-description {
                    font-size: 0.95rem;
                    color: rgba(255, 255, 255, 0.95);
                    line-height: 1.6;
                }

                .lovespace-tour-popover .driver-popover-progress-text {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.85rem;
                }

                .lovespace-tour-popover button {
                    background: white;
                    color: #667eea;
                    border: none;
                    padding: 0.5rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .lovespace-tour-popover button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }


                .lovespace-tour-popover .driver-popover-close-btn {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.2) !important;
                    width: 32px !important;
                    height: 32px !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 20px !important;
                    font-weight: bold !important;
                    opacity: 1 !important;
                    transition: all 0.2s !important;
                    cursor: pointer !important;
                }

                .lovespace-tour-popover .driver-popover-close-btn:hover {
                    background: rgba(255, 255, 255, 0.3) !important;
                    transform: scale(1.1) !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
                }

                .driver-active-element {
                    border-radius: 8px;
                }

                .driver-popover-arrow {
                    display: none;
                }
            `}</style>
        </div>
    );
}
