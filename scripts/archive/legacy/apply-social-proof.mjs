import fs from "node:fs/promises";
import path from "node:path";
import { SOCIAL_PROOF_COUNTS, socialProofCountFor } from "./social-proof.mjs";

const quizRoot = path.join(process.cwd(), "data", "quizzes");
const locales = ["en", "fr", "de", "it", "nl", "es", "pt"];

for (const slug of Object.keys(SOCIAL_PROOF_COUNTS)) {
  const manifestFile = path.join(quizRoot, slug, "quiz.json");
  const manifest = JSON.parse(await fs.readFile(manifestFile, "utf8"));
  manifest.listing.socialProofCount = socialProofCountFor(slug);
  await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

  for (const locale of locales) {
    const file = path.join(quizRoot, slug, `${locale}.json`);
    const content = JSON.parse(await fs.readFile(file, "utf8"));
    delete content.landing.socialProof;
    await fs.writeFile(file, `${JSON.stringify(content, null, 2)}\n`);
  }
}

console.log("Moved social-proof wording to shared i18n and stored one stable count per quiz manifest.");
