"use client";

import { useRef, useState } from "react";

type GalleryRewardDemoProps = {
  rewardedAdUnitPath: string;
};

type RewardedAdStatus = "granted" | "closed_without_reward" | "unavailable";

type RewardedAdResult = {
  reason: string;
  status: RewardedAdStatus;
};

type RewardedAdRequest = {
  failTimer: number;
  granted: boolean;
  placement: string;
  ready: boolean;
  requestId: number;
  resolve: (result: RewardedAdResult) => void;
  slot: unknown;
};

type RewardedSlotEvent = {
  makeRewardedVisible?: () => void;
  slot: unknown;
};

type GooglePublisherTag = {
  cmd: Array<() => void>;
  defineOutOfPageSlot?: (adUnitPath: string, format: unknown) => { addService: (service: unknown) => void } | null;
  destroySlots?: (slots: unknown[]) => void;
  display?: (slot: unknown) => void;
  enableServices?: () => void;
  enums?: {
    OutOfPageFormat?: {
      REWARDED?: unknown;
    };
  };
  pubads?: () => {
    addEventListener: (eventName: string, callback: (event: RewardedSlotEvent) => void) => void;
    updateCorrelator?: () => void;
  };
};

declare global {
  interface Window {
    googletag?: GooglePublisherTag;
  }
}

const googlePublisherTagUrl = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";

const slides = [
  {
    imageAlt: "Collage of affectionate cats at home",
    imageSrc: "/images/gallery-demo/cat-affection/hero.png",
    text: "Cats can be subtle, selective, and wonderfully specific about how they show love. This gallery turns those quiet signals into quick, easy-to-read clues.",
    title: "Understanding Cat Affection: How Your Pet Shows Love",
  },
  {
    imageAlt: "Cat licking a person's finger",
    imageSrc: "/images/gallery-demo/cat-affection/point-01.jpg",
    text: "A lick can be your cat's version of social grooming. It is often a bonding gesture, especially when your cat is calm and choosing to be close.",
    title: "When Your Cat Licks You",
  },
  {
    imageAlt: "Cat sitting calmly on someone's lap",
    imageSrc: "/images/gallery-demo/cat-affection/point-02.jpg",
    text: "A lap is a vulnerable place to nap. When your cat settles there, it usually means you feel warm, safe, and familiar.",
    title: "Choosing Your Lap",
  },
  {
    imageAlt: "Ginger cat stretching on a wooden rail",
    imageSrc: "/images/gallery-demo/cat-affection/point-03.jpg",
    text: "Stretching nearby is a relaxed little compliment. Your cat is comfortable enough to loosen up and lower its guard around you.",
    title: "The Big Comfortable Stretch",
  },
  {
    imageAlt: "Cat waiting by a doorway",
    imageSrc: "/images/gallery-demo/cat-affection/point-04.jpg",
    text: "Some cats learn your routine and appear when you come home. That quiet greeting can be their low-key version of excitement.",
    title: "Waiting For You To Return",
  },
  {
    imageAlt: "Cat resting indoors",
    imageSrc: "/images/gallery-demo/cat-affection/point-05.jpg",
    text: "When a cat feels off, it may seek the person it trusts most. Staying near you can be a request for comfort and reassurance.",
    title: "Seeking You When They Feel Unwell",
  },
  {
    imageAlt: "Cat staying close at home",
    imageSrc: "/images/gallery-demo/cat-affection/point-06.jpg",
    text: "A wary cat may hover close when visitors arrive. Your presence can act like a safe base while they work out what is happening.",
    title: "Staying Close During Visits",
  },
  {
    imageAlt: "Cat following someone indoors",
    imageSrc: "/images/gallery-demo/cat-affection/point-07.jpg",
    text: "Following you from room to room can be simple companionship. Your cat may just want to be where the interesting, trusted person is.",
    title: "Shadowing You Around The House",
  },
  {
    imageAlt: "Cat showing alert body language",
    imageSrc: "/images/gallery-demo/cat-affection/point-08.jpg",
    text: "Cats use posture to claim space and communicate mood. When they act bold around you, they may be showing confidence in their shared territory.",
    title: "Showing Their Confidence",
  },
  {
    imageAlt: "Cat showing its belly",
    imageSrc: "/images/gallery-demo/cat-affection/point-09.jpg",
    text: "A visible belly often means your cat feels secure. It is not always an invitation for a rub, but it is usually a sign of trust.",
    title: "The Belly Display",
  },
  {
    imageAlt: "Cat sitting indoors",
    imageSrc: "/images/gallery-demo/cat-affection/point-10.jpg",
    text: "Scent matters deeply to cats. Marking familiar areas can be frustrating, but it often comes from a need to feel secure in their environment.",
    title: "Marking Familiar Spaces",
  },
  {
    imageAlt: "Relaxed cat purring",
    imageSrc: "/images/gallery-demo/cat-affection/point-11.jpg",
    text: "Purring is one of the clearest comfort sounds. When it happens during cuddles or grooming, your cat is often showing ease and contentment.",
    title: "The Nonstop Purr",
  },
  {
    imageAlt: "Cat being petted",
    imageSrc: "/images/gallery-demo/cat-affection/point-12.jpg",
    text: "Many cats enjoy gentle petting because it feels like social grooming. The best sign is when your cat leans in or comes back for more.",
    title: "Enjoying Gentle Petting",
  },
  {
    imageAlt: "Cat snuggling into clothing",
    imageSrc: "/images/gallery-demo/cat-affection/point-13.jpg",
    text: "Your clothes carry your scent, and scent is comfort. A cat curled into your jumper may be choosing a portable piece of you.",
    title: "Snuggling In Your Clothes",
  },
  {
    imageAlt: "Cat playing indoors",
    imageSrc: "/images/gallery-demo/cat-affection/point-14.jpg",
    text: "Play is more than exercise. When your cat wants to play with you, it is building connection through movement, chase, and shared attention.",
    title: "Inviting You To Play",
  },
  {
    imageAlt: "Cat with expressive tail",
    imageSrc: "/images/gallery-demo/cat-affection/point-15.jpg",
    text: "A cat's tail can reveal a lot. A relaxed upright tail often means friendliness, while sharp swishes can mean they need space.",
    title: "Reading The Tail Mood",
  },
  {
    imageAlt: "Cat gently biting during play",
    imageSrc: "/images/gallery-demo/cat-affection/point-16.jpg",
    text: "A soft nibble can happen during affection or play. It is usually gentler than a defensive bite, but boundaries still matter.",
    title: "The Gentle Love Bite",
  },
  {
    imageAlt: "Cat rubbing its head affectionately",
    imageSrc: "/images/gallery-demo/cat-affection/point-17.jpg",
    text: "Head bumps, or bunts, are affectionate scent-sharing. Your cat is leaving a familiar marker while choosing close contact.",
    title: "Head Butts And Bunts",
  },
  {
    imageAlt: "Cat with raised tail",
    imageSrc: "/images/gallery-demo/cat-affection/point-18.jpg",
    text: "A quivering tail can mean excitement, alertness, or strong emotion. Context matters, especially when your cat greets you with it.",
    title: "The Quivering Tail",
  },
  {
    imageAlt: "Cat kneading with its paws",
    imageSrc: "/images/gallery-demo/cat-affection/point-19.jpg",
    text: "Kneading is a comfort habit many cats carry from kittenhood. When it happens on your lap, it can be a very cozy compliment.",
    title: "Making Biscuits",
  },
  {
    imageAlt: "Cat making a chirpy expression",
    imageSrc: "/images/gallery-demo/cat-affection/point-20.jpg",
    text: "Some cats make chirps, trills, or gurgly little sounds around trusted people. Those noises can be friendly check-ins or happy greetings.",
    title: "Those Funny Little Trills",
  },
  {
    imageAlt: "Cat wrapping its tail nearby",
    imageSrc: "/images/gallery-demo/cat-affection/point-21.jpg",
    text: "A tail curling around you can feel like a tiny hug. It is one way cats use body language to stay connected.",
    title: "The Tail Wrap",
  },
  {
    imageAlt: "Cat bringing attention to something",
    imageSrc: "/images/gallery-demo/cat-affection/point-22.jpg",
    text: "A cat may bring you odd little offerings. They are not shopping for presents; they are sharing something important in cat logic.",
    title: "Bringing You Gifts",
  },
  {
    imageAlt: "Cat watching from a window",
    imageSrc: "/images/gallery-demo/cat-affection/point-23.jpg",
    text: "Cats are excellent observers. Watching you, the window, or the room can be part curiosity and part keeping track of their favorite people.",
    title: "Keeping Watch",
  },
  {
    imageAlt: "Cat sleeping near a person",
    imageSrc: "/images/gallery-demo/cat-affection/point-24.jpg",
    text: "Sleeping beside you is a major trust signal. A resting cat is vulnerable, so choosing your side says a lot.",
    title: "Sleeping By Your Side",
  },
  {
    imageAlt: "Cat with paws near fabric",
    imageSrc: "/images/gallery-demo/cat-affection/point-25.jpg",
    text: "Scratching has many causes, from stretching to marking. When it happens near favorite spots, it can be part of claiming a shared home.",
    title: "Scratching Familiar Places",
  },
  {
    imageAlt: "Cat vocalizing at home",
    imageSrc: "/images/gallery-demo/cat-affection/point-26.jpg",
    text: "Cats can use different meows, chirps, and tones for different moments. A special greeting sound may be reserved just for you.",
    title: "Their Private Vocabulary",
  },
  {
    imageAlt: "Cat relaxing near a person",
    imageSrc: "/images/gallery-demo/cat-affection/point-27.jpg",
    text: "A cat that repeatedly chooses your room is making a social choice. They may not need anything except your company.",
    title: "Choosing Your Company",
  },
  {
    imageAlt: "Cat looking with soft eyes",
    imageSrc: "/images/gallery-demo/cat-affection/point-28.jpg",
    text: "Soft eye contact and slow blinking are classic trust signals. If your cat blinks slowly at you, try blinking gently back.",
    title: "The Slow Blink",
  },
  {
    imageAlt: "Cat presenting itself closely",
    imageSrc: "/images/gallery-demo/cat-affection/point-29.jpg",
    text: "Some cat gestures are not elegant to humans, but they can still signal comfort. Close, unguarded body language often means trust.",
    title: "Odd But Trusting Gestures",
  },
  {
    imageAlt: "Cat rubbing against legs",
    imageSrc: "/images/gallery-demo/cat-affection/point-30.jpg",
    text: "When a cat rubs against your legs, it is mixing greeting with scent-sharing. In cat terms, you belong to the familiar circle.",
    title: "Rubbing Against Your Legs",
  },
  {
    imageAlt: "Cat looking alert near another cat",
    imageSrc: "/images/gallery-demo/cat-affection/point-31.jpg",
    text: "A bonded cat may react strongly to a new pet. It is not drama for no reason; territory, routine, and attention all matter.",
    title: "Jealousy Around New Cats",
  },
  {
    imageAlt: "Cat kneading a soft surface",
    imageSrc: "/images/gallery-demo/cat-affection/point-32.jpg",
    text: "Kneading can show up on blankets, cushions, or people. It is a deep, instinctive comfort behavior that often appears in safe moments.",
    title: "More Kneading Clues",
  },
  {
    imageAlt: "Sick cat resting",
    imageSrc: "/images/gallery-demo/cat-affection/point-33.jpg",
    text: "Some cats stay close when you are the one feeling unwell. Quiet company can be their soft way of keeping watch.",
    title: "Staying Nearby When You Are Ill",
  },
  {
    imageAlt: "Cat nuzzling a human",
    imageSrc: "/images/gallery-demo/cat-affection/point-34.jpg",
    text: "Nuzzling uses the scent glands around a cat's face. It blends affection with marking, which is very on-brand for cats.",
    title: "Nuzzling Their Human",
  },
  {
    imageAlt: "Cat sleeping on a bed",
    imageSrc: "/images/gallery-demo/cat-affection/point-35.jpg",
    text: "A bed is warm, soft, and full of familiar smells. Cats that choose it often want comfort plus closeness.",
    title: "Sharing Your Sleeping Space",
  },
  {
    imageAlt: "Cat enjoying attention",
    imageSrc: "/images/gallery-demo/cat-affection/point-36.jpg",
    text: "Many cats enjoy activity most when their person joins in. Games, toys, and little routines can become part of the bond.",
    title: "Having More Fun With You",
  },
  {
    imageAlt: "Cat sharing scent with a person",
    imageSrc: "/images/gallery-demo/cat-affection/point-37.jpg",
    text: "Full-body rubs are another scent-sharing move. Your cat is not just passing by; they are refreshing the familiar-you smell.",
    title: "Sharing Their Scent",
  },
  {
    imageAlt: "Cat climbing and exploring",
    imageSrc: "/images/gallery-demo/cat-affection/point-38.jpg",
    text: "Acrobatics and exploring are part of feline curiosity. When cats investigate around you, they may be inviting you into their world.",
    title: "Curious Acrobatics",
  },
  {
    imageAlt: "Cat giving a slow blink",
    imageSrc: "/images/gallery-demo/cat-affection/point-39.jpg",
    text: "A relaxed blink says your cat is not on guard. It is one of the sweetest, quietest trust signals cats give.",
    title: "Another Slow-Blink Moment",
  },
  {
    imageAlt: "Cat rolling on the floor",
    imageSrc: "/images/gallery-demo/cat-affection/point-40.jpg",
    text: "Rolling near your feet can mean delight, comfort, and attention-seeking. It is a playful way to say, 'notice me.'",
    title: "Rolling To Say Hello",
  },
];

export function GalleryRewardDemo({ rewardedAdUnitPath }: GalleryRewardDemoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adStatus, setAdStatus] = useState("");
  const [isAdLoading, setIsAdLoading] = useState(false);
  const activeRewardedAdRef = useRef<RewardedAdRequest | null>(null);
  const rewardedListenersInstalledRef = useRef(false);
  const rewardedRequestIdRef = useRef(0);
  const rewardedServicesEnabledRef = useRef(false);
  const currentSlide = slides[currentIndex];
  const shouldGateNext = currentIndex === 0 || (currentIndex > 0 && currentIndex % 5 === 0 && currentIndex < slides.length - 1);

  function loadGooglePublisherTag() {
    if (typeof window.googletag?.defineOutOfPageSlot === "function") return;
    if (document.querySelector('script[data-rainbow-gpt-loader="true"], script[src*="securepubads.g.doubleclick.net/tag/js/gpt.js"]')) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = googlePublisherTagUrl;
    script.setAttribute("data-rainbow-gpt-loader", "true");
    document.head.appendChild(script);
  }

  function trackRewardGranted(placement: string) {
    const data = {
      ad_unit_path: rewardedAdUnitPath,
      fallback: false,
      placement,
    };

    try {
      console.log("fbq custom event: Reward", data);
    } catch {}

    try {
      window.fbq?.("trackCustom", "Reward", data);
    } catch {}
  }

  function trackRewardClosed(request: RewardedAdRequest, status: RewardedAdStatus, reason: string) {
    const granted = status === "granted";
    const data = {
      ad_unit_path: rewardedAdUnitPath,
      fallback: status === "unavailable",
      granted,
      placement: request.placement,
      reason,
    };

    if (!granted || reason !== "reward_granted") return;

    try {
      console.log("fbq custom event: RewardClosed", data);
    } catch {}

    try {
      window.fbq?.("trackCustom", "RewardClosed", data);
    } catch {}
  }

  function finishRewardedAd(status: RewardedAdStatus, reason: string) {
    const request = activeRewardedAdRef.current;
    if (!request) return;

    activeRewardedAdRef.current = null;
    window.clearTimeout(request.failTimer);

    if (request.slot && window.googletag?.cmd) {
      try {
        window.googletag.cmd.push(() => {
          try {
            window.googletag?.destroySlots?.([request.slot]);
          } catch {}
        });
      } catch {}
    }

    trackRewardClosed(request, status, reason);
    request.resolve({ reason, status });
  }

  function ensureRewardedListeners() {
    if (rewardedListenersInstalledRef.current || !window.googletag?.pubads) return;

    const pubads = window.googletag.pubads();

    pubads.addEventListener("rewardedSlotReady", (event) => {
      const request = activeRewardedAdRef.current;
      if (!request || event.slot !== request.slot) return;

      request.ready = true;
      window.clearTimeout(request.failTimer);

      try {
        event.makeRewardedVisible?.();
      } catch {
        finishRewardedAd("unavailable", "make_visible_failed");
      }
    });

    pubads.addEventListener("rewardedSlotGranted", (event) => {
      const request = activeRewardedAdRef.current;
      if (!request || event.slot !== request.slot) return;

      request.granted = true;
      trackRewardGranted(request.placement);
    });

    pubads.addEventListener("rewardedSlotClosed", (event) => {
      const request = activeRewardedAdRef.current;
      if (!request || event.slot !== request.slot) return;

      finishRewardedAd(request.granted ? "granted" : "closed_without_reward", request.granted ? "reward_granted" : "closed_without_reward");
    });

    rewardedListenersInstalledRef.current = true;
  }

  function requestRewardedAdOnce(placement: string) {
    if (!rewardedAdUnitPath) {
      return Promise.resolve({ reason: "missing_ad_unit_path", status: "unavailable" as const });
    }

    if (activeRewardedAdRef.current) {
      return Promise.resolve({ reason: "ad_request_already_active", status: "unavailable" as const });
    }

    return new Promise<RewardedAdResult>((resolve) => {
      const requestId = rewardedRequestIdRef.current + 1;
      rewardedRequestIdRef.current = requestId;

      window.googletag = window.googletag || { cmd: [] };
      loadGooglePublisherTag();

      activeRewardedAdRef.current = {
        failTimer: window.setTimeout(() => {
          const activeRequest = activeRewardedAdRef.current;
          if (activeRequest && activeRequest.requestId === requestId && !activeRequest.ready) {
            finishRewardedAd("unavailable", "no_rewarded_ad");
          }
        }, 8000),
        granted: false,
        placement,
        ready: false,
        requestId,
        resolve,
        slot: null,
      };

      try {
        window.googletag.cmd.push(() => {
          const request = activeRewardedAdRef.current;
          if (!request || request.requestId !== requestId) return;

          try {
            ensureRewardedListeners();

            try {
              window.googletag?.pubads?.().updateCorrelator?.();
            } catch {}

            const rewardedFormat = window.googletag?.enums?.OutOfPageFormat?.REWARDED;
            const slot = window.googletag?.defineOutOfPageSlot?.(rewardedAdUnitPath, rewardedFormat);

            if (!slot || !window.googletag?.pubads) {
              finishRewardedAd("unavailable", "slot_unavailable");
              return;
            }

            request.slot = slot;
            slot.addService(window.googletag.pubads());

            if (!rewardedServicesEnabledRef.current) {
              window.googletag.enableServices?.();
              rewardedServicesEnabledRef.current = true;
            }

            window.googletag.display?.(slot);
          } catch {
            finishRewardedAd("unavailable", "request_error");
          }
        });
      } catch {
        finishRewardedAd("unavailable", "gpt_queue_error");
      }
    });
  }

  function requestRewardedAd(placement: string) {
    const maxUnavailableAttempts = 3;
    let unavailableAttempts = 0;

    return new Promise<boolean>((resolve) => {
      function tryAd() {
        requestRewardedAdOnce(placement).then((result) => {
          if (result.status === "granted") {
            resolve(true);
            return;
          }

          if (result.status === "closed_without_reward") {
            setAdStatus("The ad was closed before completion. Please try again to continue.");
            resolve(false);
            return;
          }

          unavailableAttempts += 1;
          if (unavailableAttempts >= maxUnavailableAttempts) {
            resolve(true);
            return;
          }

          setAdStatus(`No ad was available. Trying again ${unavailableAttempts + 1}/${maxUnavailableAttempts}`);
          window.setTimeout(tryAd, 450);
        });
      }

      tryAd();
    });
  }

  function advanceGallery() {
    if (currentIndex === slides.length - 1) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((index) => Math.min(index + 1, slides.length - 1));
  }

  async function goNext() {
    if (isAdLoading) return;

    if (shouldGateNext) {
      setAdStatus("");
      setIsAdLoading(true);
      const granted = await requestRewardedAd(currentIndex === 0 ? "gallery_start" : `gallery_after_slide_${currentIndex}`);
      setIsAdLoading(false);

      if (!granted) {
        return;
      }

      setAdStatus("");
      advanceGallery();
      return;
    }

    advanceGallery();
  }

  return (
    <div className="gallery-demo">
      <section className="gallery-demo__shell" aria-label="Rewarded gallery demo">
        <article className="gallery-demo__card">
          <div className="gallery-demo__media">
            <img src={currentSlide.imageSrc} alt={currentSlide.imageAlt} />
          </div>

          <div className="gallery-demo__body">
            <h1>{currentSlide.title}</h1>
            <p>{currentSlide.text}</p>

            <div className="gallery-demo__actions">
              <button type="button" className="legacy-primary gallery-demo__primary" onClick={goNext} disabled={isAdLoading}>
                {isAdLoading ? "Loading ad..." : currentIndex === slides.length - 1 ? "Restart Gallery" : currentIndex === 0 ? "Start Gallery" : "Next Slide >"}
              </button>
            </div>
            {shouldGateNext ? (
              <div className="legacy-ad-note">
                <span className="legacy-shield" aria-hidden="true">
                  ✓
                </span>
                <span>
                  Short ad first — <b>then gallery continues.</b>
                </span>
              </div>
            ) : null}
            <div className="legacy-ad-status" aria-live="polite">
              {adStatus}
            </div>
          </div>
        </article>

        <div className="gallery-demo__notes" aria-label="About this article">
          <div>
            <b>About This Cat Affection Gallery</b>
            <span>
              Explore 40 common ways cats may show trust, comfort, curiosity, and affection, from slow blinks and lap lounging to
              kneading, purring, scent-sharing, and playful greetings.
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
