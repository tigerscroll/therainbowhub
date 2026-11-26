import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { SiteShell } from "@/components/SiteShell";
import { fullyFundedGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...fullyFundedGuide,
  alternates: { canonical: absoluteUrl(fullyFundedGuide.path) },
});

export default function FullyFundedGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={fullyFundedGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={fullyFundedGuide} actionTone="red">
        <section>
          <h2>1. Mobility scooters, wheelchairs and walking aids</h2>
          <p>Look for electric mobility scooters, manual or powered wheelchairs, walking frames, knee walkers and power-assist attachments. Australia’s Department of Veterans’ Affairs (DVA) can fully fund approved equipment for eligible clients with an assessed need. An appropriate clinician generally has to request it, and the programme has model and approval rules.</p>
          <p>That’s not the same as universal scooter coverage. In the U.S., Original Medicare Part B generally leaves a share of the approved cost after the deductible. <a href="https://www.dva.gov.au/providers/programs-services-information-for-providers/rap-overview/rap-national-guidelines/electric-mobility-aids">DVA electric mobility aid rules</a> · <a href="https://www.medicare.gov/coverage/wheelchairs-scooters">Medicare wheelchair and scooter coverage</a> · <a href="/mobility">Our mobility scooter guide</a>.</p>
        </section>
        <section>
          <h2>2. Bathroom, bedroom and everyday equipment</h2>
          <p>Check for shower chairs, bath boards, transfer benches, bedside commodes, bed rails and specialist seating. These are examples of equipment on <a href="https://www.dva.gov.au/providers/programs-services-information-for-providers/rap-overview/the-rap-schedule">Australia’s DVA equipment schedule</a>. Some local public services also lend equipment. Ask whether it’s a loan, how long you can use it and who pays for delivery or collection.</p>
        </section>
        <section>
          <h2>3. Ramps, stairlifts and accessible bathrooms</h2>
          <p>Fixed ramps, stairlifts, platform lifts, grab rails and level-access showers can fall under home adaptation schemes. Australia’s DVA can fund approved modifications for eligible clients. In parts of the UK, a <a href="https://www.gov.uk/disabled-facilities-grants">Disabled Facilities Grant</a> may cover eligible work up to local limits, but some applicants must contribute. Check with the funding body before signing a contract or starting work. <a href="https://www.dva.gov.au/providers/programs-services-information-for-providers/rap-overview/the-rap-national-guidelines/complex-home-modifications-including-lifts">DVA guidelines for complex home modifications</a>.</p>
        </section>
        <section>
          <h2>4. Hearing aids, prescriptions, dental care and eye tests</h2>
          <p>The NHS can provide hearing aids on a free long-term loan, with batteries and repairs normally included. A replacement charge can apply in some circumstances. Eligible patients may also get free NHS prescriptions, dental treatment or sight tests. Those are separate rules: a free eye test doesn’t automatically include glasses. <a href="https://www.nhs.uk/tests-and-treatments/hearing-aids-and-implants/">NHS hearing aids</a> · <a href="https://www.gov.uk/help-nhs-costs">GOV.UK help with NHS costs</a>.</p>
        </section>
        <section>
          <h2>5. Communication, vision and independent living aids</h2>
          <p>Some equipment programmes cover more than mobility. The DVA scheme lists categories such as assistive listening devices, speech and communication devices, low-vision aids, personal response systems and memory aids. Check which devices are approved for your needs and whether ongoing costs such as monitoring or consumables are included. <a href="https://www.dva.gov.au/what-we-help-with/care-at-home-and-aged-care-services/living-independently/getting-aids-equipment-and-home-modifications">DVA aids, equipment and home modifications</a>.</p>
        </section>
        <section>
          <h2>6. Insulation and draught sealing</h2>
          <p>Some publicly funded energy programmes cover approved work without charging the eligible household. For example, Massachusetts’ Weatherization Assistance Program can provide measures such as attic insulation and air sealing at no cost to eligible residents. An assessment determines what work is included; it’s not funding for any renovation you choose. <a href="https://www.mass.gov/info-details/weatherization-assistance-program-wap">Massachusetts programme details</a> · <a href="https://www.energy.gov/cmei/scep/wap/how-apply-weatherization-assistance">U.S. Department of Energy application guide</a>.</p>
        </section>
        <section>
          <h2>7. Training qualifications and school meals</h2>
          <p>England’s <a href="https://www.gov.uk/guidance/free-courses-for-jobs">Free Courses for Jobs scheme</a> can pay the course fees for eligible adults on approved qualifications, including some digital, childcare and construction courses. Ask separately about travel, materials and childcare. Families can also check <a href="https://www.gov.uk/apply-free-school-meals">official free school meals guidance</a> for the rules where they live.</p>
        </section>
        <section>
          <h2>8. Ask exactly what you’ll pay before agreeing</h2>
          <p>Ask the provider whether this is a purchase, a loan, a rebate or a grant. Get the amount you’d pay in writing, including delivery, fitting, servicing and replacements. Check whether you must use an approved supplier or get a referral first. If the item is loaned, ask when it must be returned.</p>
          <p>Start with your local health, housing, education or benefits agency, or use our <a href="/governmenthelp">guide to official benefits finders</a>. This is independent information, not a funding application or a guarantee of approval.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
