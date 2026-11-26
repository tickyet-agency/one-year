import { useEffect, useState } from "react";
import { content } from "./content";
import { burst, petalBurst } from "./lib/effects";
import { startMusic } from "./lib/music";
import { prefersReducedMotion } from "./lib/random";
import { HiddenRose } from "./components/Decor";
import { GardenTracker, HeartLayer, MusicButton, PetalCanvas, Toast } from "./components/Overlays";
import { LockScreen } from "./sections/LockScreen";
import { Hero } from "./sections/Hero";
import { Timeline } from "./sections/Timeline";
import { Letters } from "./sections/Letters";
import { Reasons } from "./sections/Reasons";
import { StarMap } from "./sections/StarMap";
import { Someday } from "./sections/Someday";
import { PairsGame } from "./sections/PairsGame";
import { Coupons } from "./sections/Coupons";
import { Cake } from "./sections/Cake";
import { Quiz } from "./sections/Quiz";
import { Finale } from "./sections/Finale";

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [finaleOpen, setFinaleOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("locked", !unlocked);
    document.body.classList.toggle("unlocked", unlocked);
  }, [unlocked]);

  const unlock = () => {
    setUnlocked(true);
    startMusic(); // runs inside the submit tap, so the browser allows sound
    burst();
    petalBurst(innerWidth / 2, innerHeight / 3, 80);
    window.scrollTo(0, 0);
  };

  const openFinale = () => {
    setFinaleOpen(true);
    requestAnimationFrame(() =>
      document.getElementById("finale")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" }));
  };

  return (
    <>
      <PetalCanvas />
      <HeartLayer />
      <LockScreen onUnlock={unlock} gone={unlocked} />

      <main id="story" aria-hidden={!unlocked}>
        <Hero />
        <Timeline />
        <Letters />
        <Reasons />
        <StarMap />
        <Someday />
        <PairsGame />
        <Coupons />
        <Cake />
        <Quiz onFinish={openFinale} />
        <Finale opened={finaleOpen} />
        <footer id="footer">
          Made with a whole lot of love by {content.him}, for {content.her}.
          <HiddenRose index={6} style={{ top: -10, left: "12%" }} />
        </footer>
      </main>

      {unlocked && <MusicButton />}
      {unlocked && <GardenTracker />}
      <Toast />
    </>
  );
}
