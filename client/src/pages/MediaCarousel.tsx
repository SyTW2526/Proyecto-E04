import { useState } from "react";
import './styles/MediaCarousel.css';

interface Props {
  media: string[];
}

const port = import.meta.env.VITE_PORT ?? 3000;

/**
 * MediaCarousel. Renderiza un carrusel de imágenes y vídeos.
 * @param param0 Lista de imágenes y vídeos media.
 * @returns Renderiza el carrusel.
 */
export default function MediaCarousel({ media }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === media.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? media.length - 1 : prevIndex - 1
    );
  };

  const current = media[currentIndex];
  const isVideo = current.endsWith(".mp4") || current.endsWith(".mov") || current.endsWith(".webm");

  return (
    <div className="carousel-container">
      <button className="left-btn" onClick={prev}>❮</button>

      <div className="carousel-media">
        {isVideo ? (
          <video controls src={`http://localhost:${port}/${current}`} />
        ) : (
          <img src={`http://localhost:${port}/${current}`} alt="media" />
        )}
      </div>

      <button className="right-btn" onClick={next}>❯</button>

      <div className="carousel-indicators">
        {media.map((_, i) => (
          <span key={i} className={i === currentIndex ? "active-dot" : "dot"} />
        ))}
      </div>
    </div>
  );
}