import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { SiteShell } from "@/components/SiteShell";
import { prostateGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...prostateGuide,
  alternates: { canonical: absoluteUrl(prostateGuide.path) },
});

export default function ProstateGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={prostateGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={prostateGuide} actionTone="red">
        <section>
          <h2>1. Early prostate cancer often has no symptoms</h2>
          <p>There isn’t a reliable list of “hidden signs” you can use to rule prostate cancer in or out. You can feel well and still have it. And having urinary symptoms does not mean you have cancer. An enlarged prostate, inflammation or an infection can cause similar problems. <a href="https://www.cancer.gov/types/prostate/understanding-prostate-changes">National Cancer Institute: understanding prostate changes</a>.</p>
        </section>
        <section>
          <h2>2. Changes in how you pass urine</h2>
          <p>Talk to a healthcare professional if these changes are new, persistent or getting worse:</p>
          <ul>
            <li>It takes longer to start urinating, or you have to strain.</li>
            <li>The stream is weaker than usual or keeps stopping and starting.</li>
            <li>You need to go more often, wake more often at night, or feel a sudden urge.</li>
            <li>You still feel as if your bladder hasn’t emptied, or it hurts or burns when you go.</li>
          </ul>
          <p>These problems are worth checking because several conditions can cause them and the treatments differ. See the <a href="https://www.cdc.gov/prostate-cancer/symptoms/">CDC’s prostate cancer symptoms guide</a>.</p>
        </section>
        <section>
          <h2>3. Blood in urine or semen</h2>
          <p>Both have possible causes other than prostate cancer. Get blood in your urine checked urgently, even if there’s no pain. If you notice blood in semen, tell a healthcare professional, especially if it keeps happening or comes with pain or urinary changes.</p>
        </section>
        <section>
          <h2>4. Pain that doesn’t go away or unexplained weight loss</h2>
          <p>Ongoing back, hip or pelvic pain and weight loss without trying can occur when prostate cancer is more advanced, but they have many other possible causes. Speak to a clinician about pain that won’t settle or weight loss you can’t explain. <a href="https://www.nhs.uk/conditions/prostate-cancer/symptoms/">NHS prostate cancer symptoms</a>.</p>
        </section>
        <section>
          <h2>5. What to bring up at an appointment</h2>
          <p>Note what changed, when it started and whether it’s getting worse. Mention any related pain, bleeding or weight loss, what medicines you take and any close relatives who have had prostate cancer. A clinician may suggest a urine test, an examination or a blood test depending on your situation. <a href="https://www.nhs.uk/conditions/prostate-cancer/tests-and-next-steps/">NHS tests and next steps</a>.</p>
        </section>
        <section>
          <h2>6. What a PSA test can and can’t tell you</h2>
          <p>PSA is measured in a blood test. An elevated result can happen with prostate cancer, but also with an enlarged or inflamed prostate. PSA alone doesn’t confirm cancer. Depending on your results and other findings, your clinician may suggest more tests.</p>
          <p>If you don’t have symptoms but are concerned about your risk, ask a clinician about the pros and cons of screening. That decision is different from getting symptoms assessed. See the <a href="https://www.cancer.gov/types/prostate/patient/prostate-screening-pdq">National Cancer Institute’s screening guide</a>.</p>
        </section>
        <section>
          <h2>7. The next step</h2>
          <p>Don’t wait for a particular number of symptoms before asking for advice. If you’ve noticed a new or persistent change, contact a healthcare professional. This article is general information, not a diagnosis or a substitute for medical care.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
