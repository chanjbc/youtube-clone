import Image from "next/image";
import Link from "next/link";
import { getVideos } from "./firebase/functions";
import styles from "./page.module.css";


export default async function Home() {
  const videos = await getVideos();

  return (
    <main className={styles.main}>
      {
        videos.map((video) => (
          <Link href={`/watch?v=${video.filename}`} key={video.id}>
            <Image src={"/thumbnail.png"} alt="video" width={330} height={220} 
            className={styles.thumbnail}/>
          </Link>
        ))
      }
    </main>
  );
}

// revalidate to prevent caching
export const revalidate = 30;
