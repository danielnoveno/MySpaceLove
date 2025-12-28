import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    placeholder?: string;
}

export default function LazyImage({ 
    src, 
    alt, 
    placeholder = '/images/placeholder.svg',
    className = '',
    ...props 
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Load 50px before entering viewport
            }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <img
            ref={imgRef}
            src={isInView ? src : placeholder}
            alt={alt}
            className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
            {...props}
        />
    );
}
