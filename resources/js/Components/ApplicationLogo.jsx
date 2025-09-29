export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 316 316"
            xmlns="http://www.w3.org/2000/svg"
        >
        {/* Versi 2: Hati dengan gradien dan efek 3D */}
        <defs>
            <linearGradient
                id="heartGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
            >
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="100%" stopColor="#ff8e8e" />
            </linearGradient>
        </defs>

        <path
            fill="url(#heartGradient)"
            d="M158 280C158 280 40 210 40 100C40 60 70 30 110 30C135 30 158 50 158 50C158 50 181 30 206 30C246 30 276 60 276 100C276 210 158 280 158 280Z"
        />

        {/* Highlight effect */}
        <path
            fill="rgba(255,255,255,0.3)"
            d="M140 80C120 70 90 60 80 90C70 120 110 150 140 170C170 150 210 120 200 90C190 60 160 70 140 80Z"
        />
    </svg>
    );
}
