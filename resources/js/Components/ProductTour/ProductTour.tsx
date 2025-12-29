import React, { useEffect, useState } from 'react';
import { driver, type DriveStep, type Config } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';

interface ProductTourProps {
    onComplete?: () => void;
    onStart?: () => void;
    autoStart?: boolean;
    tourType?: 'dashboard' | 'full';
}

export default function ProductTour({ 
    onComplete,
    onStart,
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

    // Reorganized tour steps in logical order
    const dashboardSteps: DriveStep[] = [
        // 1. Welcome
        {
            element: '#space-title',
            popover: {
                title: t('tour.welcome.title', 'Welcome to LoveSpace! 💕'),
                description: t('tour.welcome.description', 'Let\'s take a quick tour to help you get started with all the amazing features!') + 
                    '<br/><br/><small style="opacity: 0.8;">💡 ' + 
                    (locale === 'id' ? 'Gunakan Enter untuk lanjut, ← (panah kiri) untuk kembali, atau ESC untuk keluar.' : 'Use Enter to continue, ← (arrow left) to go back, or ESC to exit.') + 
                    '</small>',
                side: 'bottom' as const,
                align: 'center' as const
            }
        },
        
        // 2. Dashboard Overview - Stats
        {
            element: '#stats-section',
            popover: {
                title: t('tour.stats.title', 'Your Love Statistics 📊'),
                description: t('tour.stats.description', 'Track your relationship milestones: days together, memories created, and special moments shared.'),
                side: 'bottom' as const,
                align: 'start' as const
            }
        },
        
        // 3-10. Quick Actions (in visual order)
        {
            element: '#timeline-section',
            popover: {
                title: t('tour.quick_timeline.title', 'Add Moment 📅'),
                description: t('tour.quick_timeline.description', 'Quick action to add special moments to your timeline.'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        {
            element: '#upcoming-event-action',
            popover: {
                title: t('tour.quick_countdown.title', 'Upcoming Events ⏰'),
                description: t('tour.quick_countdown.description', 'Create and manage countdowns for special dates and anniversaries.'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        {
            element: '#games-action',
            popover: {
                title: t('tour.quick_games.title', 'Game Hub 🎮'),
                description: t('tour.quick_games.description', 'Play fun games together: Chess, Tic-Tac-Toe, and more!'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        {
            element: '#gallery-section',
            popover: {
                title: t('tour.quick_gallery.title', 'Upload Photos & Videos 📸'),
                description: t('tour.quick_gallery.description', 'Quick access to upload and manage your precious memories.'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        {
            element: '#daily-message-action',
            popover: {
                title: t('tour.quick_daily.title', 'Daily Messages 💌'),
                description: t('tour.quick_daily.description', 'Send sweet daily messages to your partner via email.'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        {
            element: '#memory-lane-action',
            popover: {
                title: t('tour.quick_memory.title', 'Memory Lane Kit 🎁'),
                description: t('tour.quick_memory.description', 'Create interactive surprise experiences with puzzles and flipbooks!'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        {
            element: '#memory-lane-setup-action',
            popover: {
                title: t('tour.quick_memory_setup.title', 'Configure Memory Lane ⚙️'),
                description: t('tour.quick_memory_setup.description', 'Upload puzzle photos and customize level messages for surprises.'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        {
            element: '#spotify-action',
            popover: {
                title: t('tour.quick_spotify.title', 'Spotify Companion 🎵'),
                description: t('tour.quick_spotify.description', 'Listen to music together with shared playlists and sync playback.'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        {
            element: '#journal-section',
            popover: {
                title: t('tour.quick_journal.title', 'Write Journal 📖'),
                description: t('tour.quick_journal.description', 'Document your feelings and relationship journey in private or shared entries.'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        {
            element: '#watch-party-action',
            popover: {
                title: t('tour.quick_watch.title', 'Join Watch Party 📺'),
                description: t('tour.quick_watch.description', 'Start a co-watching session with your partner.'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        
        // 11-12. Dashboard Sections
        {
            element: '#countdown-section',
            popover: {
                title: t('tour.countdown_section.title', 'Upcoming Events Widget ⏰'),
                description: t('tour.countdown_section.description', 'See your upcoming special dates at a glance.'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        {
            element: '#daily-messages-section',
            popover: {
                title: t('tour.daily_section.title', 'Recent Messages Widget 💌'),
                description: t('tour.daily_section.description', 'View your latest love messages here.'),
                side: 'top' as const,
                align: 'start' as const
            }
        },
        
        // 13-19. Top Navigation Bar
        {
            element: '#dashboard-menu',
            popover: {
                title: t('tour.navbar_dashboard.title', 'Dashboard Menu 🏠'),
                description: t('tour.navbar_dashboard.description', 'Return to your dashboard from anywhere.'),
                side: 'bottom' as const,
                align: 'start' as const
            }
        },
        {
            element: '#timeline-menu',
            popover: {
                title: t('tour.navbar_timeline.title', 'Timeline Menu 📅'),
                description: t('tour.navbar_timeline.description', 'View all your special moments chronologically.'),
                side: 'bottom' as const,
                align: 'start' as const
            }
        },
        {
            element: '#daily-menu',
            popover: {
                title: t('tour.navbar_daily.title', 'Daily Messages Menu 💌'),
                description: t('tour.navbar_daily.description', 'Access your daily messages inbox.'),
                side: 'bottom' as const,
                align: 'start' as const
            }
        },
        {
            element: '#gallery-menu',
            popover: {
                title: t('tour.navbar_gallery.title', 'Gallery Menu 📸'),
                description: t('tour.navbar_gallery.description', 'Browse your photo and video collection.'),
                side: 'bottom' as const,
                align: 'start' as const
            }
        },
        {
            element: '#spotify-menu',
            popover: {
                title: t('tour.navbar_spotify.title', 'Spotify Menu 🎵'),
                description: t('tour.navbar_spotify.description', 'Quick access to Spotify Companion features.'),
                side: 'bottom' as const,
                align: 'start' as const
            }
        },
        {
            element: '#games-menu',
            popover: {
                title: t('tour.navbar_games.title', 'Games Menu 🎮'),
                description: t('tour.navbar_games.description', 'Jump to your game collection.'),
                side: 'bottom' as const,
                align: 'start' as const
            }
        },
        {
            element: '#notifications-button',
            popover: {
                title: t('tour.notifications.title', 'Notifications 🔔'),
                description: t('tour.notifications.description', 'Stay updated with all activities and interactions.'),
                side: 'bottom' as const,
                align: 'end' as const
            }
        },
        {
            element: '#spaces-menu',
            popover: {
                title: t('tour.spaces.title', 'Spaces Manager 🏡'),
                description: t('tour.spaces.description', 'Manage multiple spaces for different relationships.'),
                side: 'bottom' as const,
                align: 'end' as const
            }
        },
        {
            element: '#profile-menu',
            popover: {
                title: t('tour.profile.title', 'Your Profile ⚙️'),
                description: t('tour.profile.description', 'Manage settings, language, and preferences.'),
                side: 'bottom' as const,
                align: 'end' as const
            }
        },
        
        // 20. Completion
        {
            popover: {
                title: t('tour.complete.title', 'You\'re All Set! 🎉'),
                description: t('tour.complete.description', 'Start creating beautiful memories with your partner. You can replay this tour anytime from the help button. Enjoy LoveSpace!')
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
                
                // Call backend to save completion (mark as skipped/completed)
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                axios.post(route('tour.complete'), {}, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    }
                })
                .then(() => {
                    console.log('Tour completion saved successfully');
                })
                .catch((err) => {
                    console.error('Failed to save tour completion:', err);
                });
                
                // Mark tour as completed in parent component
                if (onComplete) {
                    onComplete();
                }
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
            onCloseClick: () => {
                // Explicitly handle close button click
                driverObj.destroy();
            },
        });

        // Add keyboard shortcuts with proper event handling
        const handleKeyPress = (e: KeyboardEvent) =>{
            // Check if tour popover is visible
            const tourPopover = document.querySelector('.driver-popover');
            if (!tourPopover) return;
            
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                driverObj.moveNext();
            } else if (e.key === 'ArrowLeft' || (e.key === 'Escape' && driverObj.getActiveIndex && driverObj.getActiveIndex() > 0)) {
                // Use ArrowLeft for previous, or ESC if not on first step
                if (e.key === 'ArrowLeft' || driverObj.getActiveIndex() > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    driverObj.movePrevious();
                }
            }
        };

        // Use capture phase to intercept before driver.js
        document.addEventListener('keydown', handleKeyPress, true);
        
        // Store cleanup function
        const originalDestroy = driverObj.destroy.bind(driverObj);
        driverObj.destroy = () => {
            document.removeEventListener('keydown', handleKeyPress, true);
            originalDestroy();
        };

        driverObj.drive();
        setIsActive(true);
        
        // Notify parent that tour has started
        if (onStart) {
            onStart();
        }
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
                    background: rgba(255, 255, 255, 0.15) !important;
                    backdrop-filter: blur(10px) !important;
                    width: 24px !important;
                    height: 24px !important;
                    min-width: 24px !important;
                    min-height: 24px !important;
                    max-width: 24px !important;
                    max-height: 24px !important;
                    border-radius: 50% !important;
                    padding: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 16px !important;
                    font-weight: 600 !important;
                    line-height: 1 !important;
                    opacity: 0.9 !important;
                    transition: all 0.25s ease !important;
                    cursor: pointer !important;
                    position: absolute !important;
                    top: 12px !important;
                    right: 12px !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                }

                .lovespace-tour-popover .driver-popover-close-btn:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                    opacity: 1 !important;
                    transform: scale(1.05) rotate(90deg) !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                }

                .lovespace-tour-popover .driver-popover-close-btn:active {
                    transform: scale(0.95) rotate(90deg) !important;
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
