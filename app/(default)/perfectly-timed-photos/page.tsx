import { SportsPhotoRoute, sportsPhotoMetadata } from "@/components/gallery/SportsPhotoRoute";

export const metadata = sportsPhotoMetadata("en");

export default function PerfectlyTimedPhotosPage() {
  return <SportsPhotoRoute locale="en" />;
}
