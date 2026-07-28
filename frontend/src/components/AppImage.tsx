import Image, { type ImageProps } from 'next/image'

type AppImageProps = Omit<ImageProps, 'width' | 'height'> & {
  width?: number
  height?: number
}

/**
 * Shared image boundary for user-uploaded and third-party media.
 *
 * Dynamic media is already resized by its storage provider, so Next's optimizer
 * is bypassed while retaining intrinsic sizing, lazy loading, and decoding.
 */
export default function AppImage({
  alt,
  width = 1200,
  height = 800,
  ...props
}: AppImageProps) {
  return <Image {...props} alt={alt} width={width} height={height} unoptimized />
}
