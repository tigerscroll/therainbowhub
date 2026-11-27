import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { SiteShell } from "@/components/SiteShell";
import { tvGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...tvGuide,
  alternates: { canonical: absoluteUrl(tvGuide.path) },
});

export default function TvGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={tvGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={tvGuide} actionTone="red">
        <section>
          <h2>1. The Arizona heat map that went off the scale</h2>
          <p>FOX 10 Phoenix weather anchor Cory McCloskey was looking at a routine temperature map when some of the numbers jumped to impossible highs. Instead of pretending not to see them, he improvised a forecast for the make-believe heat. The director opened the other presenters’ microphones, and their laughter became part of the broadcast.</p>
          <p>McCloskey later said he didn’t know what caused the glitch. What viewers were seeing was a graphics error, not the temperatures those places were actually expecting. <a href="https://www.fox10phoenix.com/news/cory-mccloskey-hits-the-streets-soon">FOX 10 Phoenix: McCloskey on the viral map</a>.</p>
        </section>
        <section>
          <h2>2. The forecaster who multiplied on screen</h2>
          <p>Jennifer McDermed was presenting the weather on Minnesota’s FOX 9 in May 2021 when the graphics began repeating her image. When she moved across the screen, a line of copies followed right behind. The bright yellow dress made the effect hard to miss.</p>
          <p>McDermed tried to finish while laughing. One of the best moments is when she walks across the studio picture and, for a few seconds, ends up leading her own parade. <a href="https://www.fox9.com/weather/fox-9-meteorologist-multiplies-on-screen-during-graphics-glitch">FOX 9: the original graphics glitch</a>.</p>
        </section>
        <section>
          <h2>3. The forecast with a guest at ankle height</h2>
          <p>During an ABC7 Los Angeles forecast in January 2021, meteorologist Leslie Lopez’s 10-month-old son crawled over and held onto her leg. Lopez laughed, picked him up and let him share the frame. The camera caught both the surprise and how quickly she took it in stride.</p>
          <p>ABC7 later reported that viewers wanted to see more of the unexpected guest. <a href="https://abc7.com/post/leslie-lopez-abc7-weather-meteorologist-news-bloopers-los-angeles/10102250/">ABC7: Leslie Lopez’s on-air interruption</a>.</p>
        </section>
        <section>
          <h2>4. Ripple turned the weather board into playtime</h2>
          <p>In Edmonton, weather presenter Mike Sobel regularly brought adoptable animals on air. In October 2014, a young dog named Ripple had more interest in playing than standing still for the forecast. As Sobel tried to get through the weather, keeping up with his guest became the more entertaining part of the segment.</p>
          <p>Global News reported that the clip was picked up internationally and prompted people to ask about adopting Ripple. <a href="https://globalnews.ca/news/1622922/watch-video-of-mike-sobel-and-ripple-the-dogs-weather-forecast-goes-viral/">Global News: how Ripple’s forecast went viral</a>.</p>
        </section>
        <section>
          <h2>5. Brody kept returning to the forecast</h2>
          <p>When FOX 13 Tampa Bay meteorologist Paul Dellegatto was broadcasting from home in 2020, his golden retriever Brody repeatedly interrupted the weather. One appearance derailed the segment enough to become the clip people shared; after that, the dog became a familiar part of the evening broadcasts.</p>
          <p>FOX 13 collected several of the interruptions, including the first one that took off online. <a href="https://www.fox13news.com/news/all-those-times-brody-the-dog-interrupted-paul-dellegattos-weathercast">FOX 13: Brody’s forecast interruptions</a>.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
