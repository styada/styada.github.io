"use client";

import Masonry from "react-masonry-css";
import { Media } from "@once-ui-system/core";
import styles from "./Gallery.module.scss";
import { gallery } from "@/resources";

export default function MasonryGrid() {
  const breakpointColumnsObj = {
    default: 2,
    720: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className={styles.masonryGrid}
      columnClassName={styles.masonryGridColumn}
    >
      {gallery.images.map((image, index) => (
        <div key={index} className={styles.gridItem}>
          <Media
            priority={index < 10}
            sizes="(max-width: 560px) 100vw, 50vw"
            radius="m"
            aspectRatio={image.orientation === "horizontal" ? "16 / 9" : "3 / 4"}
            src={image.src}
            alt={image.alt}
          />
        </div>
      ))}
    </Masonry>
  );
}
