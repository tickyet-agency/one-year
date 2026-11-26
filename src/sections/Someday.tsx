import { content } from "../content";
import { meetLine, useNow } from "../lib/time";
import { Divider, HiddenRose } from "../components/Decor";

/** The one light, blush-coloured chapter: the day they finally meet. */
export function Someday() {
  const now = useNow();
  return (
    <section className="chapter" id="someday-ch">
      <Divider index={4} />
      <div><span className="eyebrow">Our next place</span><h2>The same place, <em>finally</em></h2></div>
      <div className="someday-wrap">
        <img className="couple" src="/images/couple.webp" alt="Silhouette of a couple hugging beside a bicycle in a swirl of rose petals" />
        <div className="someday-text">
          <p className="someday-line">{meetLine(now)}</p>
          <p className="lede">{content.someday}</p>
        </div>
      </div>
      <HiddenRose index={8} style={{ bottom: 10, right: "4%" }} />
    </section>
  );
}
