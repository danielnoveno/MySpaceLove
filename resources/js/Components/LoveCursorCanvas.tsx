import { useEffect, useRef } from "react";

type LoveCursorCanvasProps = {
    color?: string;
    trailColor?: string;
    heartCount?: number;
    className?: string;
};

type HeartParticle = {
    x: number;
    y: number;
    size: number;
    dx: number;
    dy: number;
    life: number;
};

const LoveCursorCanvas = ({
    color = "#f43f5e",
    trailColor,
    heartCount = 30,
    className = "",
}: LoveCursorCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return;
        }

        let animationFrame: number;
        const hearts: HeartParticle[] = [];
        const maxHearts = Math.max(heartCount, 20);

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const hexToRgb = (value: string): string => {
            let hex = value.replace("#", "");

            if (hex.length === 3) {
                hex = hex
                    .split("")
                    .map((char) => char + char)
                    .join("");
            }

            const bigint = parseInt(hex, 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;

            return `${r},${g},${b}`;
        };

        const drawHeart = (x: number, y: number, size: number, opacity = 0.6) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(size / 20, size / 20);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(0, -3, -5, -15, -20, -15);
            ctx.bezierCurveTo(-55, -15, -55, 22.5, -55, 22.5);
            ctx.bezierCurveTo(-55, 40, -35, 62, 0, 80);
            ctx.bezierCurveTo(35, 62, 55, 40, 55, 22.5);
            ctx.bezierCurveTo(55, 22.5, 55, -15, 20, -15);
            ctx.bezierCurveTo(5, -15, 0, -3, 0, 0);
            ctx.closePath();
            ctx.fillStyle = `rgba(${hexToRgb(color)},${opacity})`;
            ctx.fill();
            ctx.restore();
        };

        const spawnHeart = (x: number, y: number) => {
            hearts.push({
                x,
                y,
                size: Math.random() * 12 + 10,
                dx: (Math.random() - 0.5) * 1.8,
                dy: (Math.random() - 0.5) * 1.8 - 0.3,
                life: 1,
            });
        };

        const populateInitialHearts = () => {
            for (let i = 0; i < maxHearts; i++) {
                spawnHeart(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                );
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (trailColor) {
                ctx.fillStyle = trailColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1;
            }

            hearts.forEach((heart, index) => {
                heart.x += heart.dx;
                heart.y += heart.dy;
                heart.life -= 0.005;

                drawHeart(heart.x, heart.y, heart.size, Math.max(heart.life, 0));

                if (
                    heart.life <= 0 ||
                    heart.x < -50 ||
                    heart.y < -50 ||
                    heart.x > canvas.width + 50 ||
                    heart.y > canvas.height + 50
                ) {
                    hearts.splice(index, 1);
                }
            });

            animationFrame = requestAnimationFrame(animate);
        };

        const handleMouseMove = (event: MouseEvent) => {
            for (let i = 0; i < 3; i++) {
                spawnHeart(event.clientX, event.clientY);
            }

            while (hearts.length > maxHearts * 2) {
                hearts.shift();
            }
        };

        const handleResize = () => {
            resize();
        };

        resize();
        populateInitialHearts();
        animate();

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
        };
    }, [color, heartCount, trailColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`pointer-events-none fixed inset-0 z-10 h-full w-full mix-blend-screen ${className ?? ""}`}
        />
    );
};

export default LoveCursorCanvas;


