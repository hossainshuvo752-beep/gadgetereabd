export type Post = {
  id: number;
  title: string;
  /** SEO meta title — must ALWAYS be English (content rule), even for non-English posts. */
  metaTitle: string;
  /** SEO meta description — must ALWAYS be English (content rule). */
  metaDescription: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  /** SIMULATED popularity metric — dummy values, NOT real analytics.
   *  Replace with real view-tracking data when a backend exists. Drives
   *  the default most-viewed-first sort on the Homepage Latest Posts
   *  grid and the Blog listing (sorted within the active category
   *  filter). */
  views: number;
  imageAlt: string;
  /** Article body as HTML, rendered on /posts/[id] via dangerouslySetInnerHTML. */
  content: string;
};

/**
 * Blog posts. Six real posts — every consumer (Hero, Latest Posts, blog grid
 * + chips, category pages, /search, Header search dropdown) handles any
 * number of posts. Array order matters: posts[0] is the Hero feature.
 */
export const posts: Post[] = [
  {
    id: 1,
    title: "iPhone Duo: Apple's First Foldable iPhone — Everything You Need to Know",
    metaTitle: "iPhone Duo: Apple's First Foldable iPhone Price & Specs",
    metaDescription:
      "Apple has announced its first foldable iPhone, the iPhone Duo, featuring a 7.6-inch inner display, A20 Pro chip, and a $1,999 price tag. Here's a full breakdown.",
    excerpt:
      "Apple has announced its first foldable iPhone, the iPhone Duo, featuring a 7.6-inch inner display, A20 Pro chip, and a $1,999 price tag. Here's a full breakdown.",
    category: 'News',
    author: 'TechBD Team',
    date: 'Sep 10, 2026',
    readTime: '3 min read',
    views: 8900,
    imageAlt: 'iPhone Duo foldable (placeholder image)',
    content: `
      <p>Apple has officially entered the foldable phone market. At its "Surprise and Shine" event on September 9, 2026, the company unveiled the iPhone Duo — a book-style foldable that opens from a compact 5.4-inch outer screen into a spacious 7.6-inch inner display, the largest ever fitted into an iPhone.</p>

      <h2>Design That Doesn't Compromise</h2>
      <p>Rather than simply adding a hinge to an existing design, Apple built the iPhone Duo around a machined titanium frame, paired with Ceramic Shield on the back and an upgraded Ceramic Shield 2 on the front. When folded, it's reportedly the thinnest iPhone the company has ever produced, thanks to internal components being repositioned into the camera housing to free up space elsewhere.</p>
      <p>The inner panel uses a nano-texture coating to reduce glare, along with a laser-etched micro-lens surface designed to make the fold crease nearly invisible. The phone carries an IP68 rating for dust and water resistance, and launches in two finishes: Star White and Night Sky.</p>

      <h2>Performance and Camera</h2>
      <p>Under the hood sits Apple's new A20 Pro chip, supported by a vapor-chamber cooling system — a first for any iPhone — likely necessary to manage heat in a thinner, larger chassis. A dual-battery setup, split across both halves of the device, helps balance weight once unfolded.</p>
      <p>The camera system keeps Apple's familiar dual-lens layout, capturing 48MP stills and 4K video at 120fps. One notable change: Face ID has been dropped in favor of Touch ID, likely a space-saving trade-off rather than a security downgrade.</p>

      <h2>Software Built for Folding</h2>
      <p>The iPhone Duo runs a modified version of iOS 27, adapted specifically for its folding form factor. It supports Split View multitasking, hands-free FaceTime calls, and an always-available StandBy mode that works even without charging. Controls have been repositioned toward the edges of the screen for easier reach, the dock now sits vertically, and Apple Pencil support over USB-C is expected later in 2026.</p>

      <h2>Price and Availability</h2>
      <p>The iPhone Duo starts at $1,999 for the 256GB model. Pre-orders open October 16, with sales beginning October 23 across more than 70 countries, followed by a second wave of markets on October 30.</p>
      <p>Whether Apple's wider, tablet-like unfolded shape gives it an edge over existing foldables from competitors remains to be seen once real-world reviews start rolling in — but there's no denying this is one of the most anticipated launches of the year.</p>
    `,
  },
  {
    id: 2,
    title: 'Best Bladeless Tower Fans of 2026: Dreo vs Dreame vs Dyson Compared',
    metaTitle: 'Best Bladeless Tower Fan 2026: Dreo vs Dreame vs Dyson',
    metaDescription:
      'We compared the Dreo Pilot Max S, Dreame MF10, and Dyson Cool AM07 bladeless tower fans on airflow, noise, smart features and price to find the best one for your room.',
    excerpt:
      'Three bladeless tower fans, three very different personalities. We break down the Dreo Pilot Max S, Dreame MF10 and Dyson Cool AM07 to help you pick the right one for your room — and your budget.',
    category: 'Guide',
    author: 'TechBD Team',
    date: 'Sep 14, 2026',
    readTime: '5 min read',
    views: 2600,
    imageAlt: 'Bladeless tower fan comparison (placeholder image)',
    content: `
      <p>Bladeless tower fans look like they shouldn't work — and then they do. Air is pulled in at the base, squeezed through a narrow internal channel, and pushed out through a ring or slot around the tower. That fast-moving stream drags the surrounding air along with it, a trick usually called air multiplication, so the output feels far bigger than the motor alone would suggest. The payoff over a bladed fan is smoother, less turbulent airflow that's gentler on skin and quieter at low speeds.</p>
      <p>For 2026, three models keep coming up in every serious conversation. Here's how they differ — and who each one is actually for.</p>

      <h2>Dreo Pilot Max S — the Safe All-Rounder</h2>
      <p>The Pilot Max S is the veteran of this group by review count, with roughly 30,000 ratings backing it up. That volume matters: it means an enormous number of people have lived with this fan long enough to confirm it doesn't fall apart after a month. Feature-wise, it leans on smart automation — the companion app reads your room's temperature and adjusts fan speed on its own, and Alexa and Google Home can both control it by voice. A backlit remote, an onboard display and a generous spread of speed and oscillation settings make it equally at home in a bedroom or a bigger living space.</p>
      <p>If you just want one fan that quietly does everything for most rooms, start here.</p>

      <h2>Dreame MF10 — Built for Awkward, Open Spaces</h2>
      <p>The MF10 attacks the problem from a different angle — literally. Instead of a single directed stream, it spreads air across a 270-degree arc, so it can circulate a whole room rather than just the patch directly in front of it. Dreame rates its top velocity at 59 feet per second across 10 speeds and 3 modes, and its airflow adapts to the room's current temperature instead of running at a fixed setting.</p>
      <p>This is the pick for open-plan living rooms, shared bedrooms, or any space where people sit at all sorts of angles to the fan rather than neatly in front of it.</p>

      <h2>Dyson Cool AM07 — the Original, If You'll Pay for It</h2>
      <p>Dyson effectively invented this product category, and the AM07 is the fan most people picture when they hear "bladeless." Independent testing has consistently found its Air Multiplier output feels smoother than rivals', and the build quality plus a two-year warranty back up the premium positioning.</p>
      <p>The trade-offs are real, though: it costs noticeably more than the Dreo or Dreame, and the base model skips smart-home features entirely — no Wi-Fi, no voice control. If design, brand trust and that original bladeless experience matter more to you than airflow per taka, it's still a great machine.</p>

      <h2>Quick Comparison</h2>
      <ul>
        <li><strong>Dreo Pilot Max S</strong> — best overall; app-based temperature control; Alexa/Google Home; ~30,000+ reviews.</li>
        <li><strong>Dreame MF10</strong> — best whole-room coverage; 270° airflow, temperature-adaptive; 4.3 stars (~261 reviews).</li>
        <li><strong>Dyson Cool AM07</strong> — best build quality; Air Multiplier; no smart features on the base model; 4.3 stars (~151 reviews).</li>
      </ul>

      <h2>Which One Should You Buy?</h2>
      <p>Match the fan to the room. A typical bedroom or living room with one obvious seating area? The Dreo Pilot Max S is the easy answer. A wide, open space where air needs to travel in every direction? The Dreame MF10's 270-degree coverage earns its price. And if you've always wanted the Dyson experience and can justify the premium, the AM07 remains beautifully made — just know exactly what you're paying extra for.</p>
      <p>Availability in Bangladesh varies by seller, so check local stock and warranty terms before ordering any of these — grey-import units usually skip the official warranty.</p>
    `,
  },
  {
    id: 3,
    title: 'Dyson CameraJet: The $500 Toothbrush That Films Inside Your Mouth',
    metaTitle: 'Dyson CameraJet Toothbrush: Price, Specs & How It Works',
    metaDescription:
      "Dyson's CameraJet toothbrush packs a 1mm camera shooting 28 frames a second to spot missed areas and auto-floss them with a water jet. Price, specs and whether it's worth it.",
    excerpt:
      'A 1mm camera, an AI that spots what your bristles missed, and a water jet that flosses for you. Dyson’s CameraJet is the strangest launch of the year — here’s what it actually does and who should buy it.',
    category: 'News',
    author: 'TechBD Team',
    date: 'Sep 13, 2026',
    readTime: '4 min read',
    views: 4100,
    imageAlt: 'Dyson CameraJet toothbrush (placeholder image)',
    content: `
      <p>Leave it to Dyson to reinvent the toothbrush. The CameraJet, launched on September 1, 2026 at $499, is an electric toothbrush with a camera barely a millimetre across embedded in the brush head — and it watches your teeth while you brush.</p>

      <h2>Gap Optical Targeting, Explained</h2>
      <p>The camera captures 28 images every second, and an onboard AI model follows exactly where the bristles have — and haven't — reached. When it spots a gap between teeth, the brush fires a roughly one-millisecond burst of mouth rinse straight into that gap, flushing out debris a bristle can't. Dyson calls the system Gap Optical Targeting.</p>
      <p>That's a genuinely different philosophy from every timer-based brush on the market. A two-minute timer doesn't know where your brush went; it just counts down. The CameraJet knows which spots got skipped, remembers session to session, and steers you back to them.</p>

      <h2>Live Footage, Zero Storage</h2>
      <p>Pair it with the MyDyson app and you can watch live video from inside your mouth, complete with coverage guidance and haptic warnings if you're pressing too hard or holding the wrong angle. Privacy-conscious buyers will note Dyson's claim that nothing is stored — images are processed on-device or shown briefly in the app, then deleted, never saved or shared.</p>
      <p>The 3-in-1 dock does more than charge: it stores the brush and refills its 12.5ml rinse tank at the press of a button, so the daily routine still feels like a normal electric toothbrush.</p>

      <h2>What $499 Buys You</h2>
      <p>Three modes ship standard — combined brush-and-floss, brush-only, or floss-only — each with Gentle, Variable and Deep Clean intensity levels. Dyson also says its variable sonic oscillation is engineered to avoid the brief "stalling" that cheaper sonic brushes suffer against hard tooth surfaces. On the claims side, the company points to clinical testing showing better gum health than manual brushing, plus lab work developed with the National University of Singapore's Faculty of Dentistry comparing its conical jet against needle-style flossing jets.</p>

      <h2>Should Anyone Actually Buy This?</h2>
      <p>Honestly? Most people don't need a five-hundred-dollar toothbrush — a solid sonic brush with a timer covers the fundamentals at a fraction of the price. The CameraJet makes sense for two specific buyers: people who genuinely struggle to floss consistently and want the machine to do the targeting, and early adopters who'll pay for the novelty. If inconsistent flossing isn't your problem, neither is the CameraJet's solution.</p>
      <p>It's sold through Dyson directly plus Amazon and Best Buy in colourways including Ceramic Pink and Ceramic Ultra Blue — though official Bangladesh availability is still unclear, so grey-market pricing will likely decide local reality.</p>
    `,
  },
  {
    id: 4,
    title: 'iOS 27 Is Here: New Features, Release Date and Compatible iPhones',
    metaTitle: 'iOS 27: Release Date, New Features & Compatible iPhones',
    metaDescription:
      'iOS 27 brings a rebuilt generative-AI Siri, an auto-adapting Lock Screen wallpaper and smarter widgets. Here’s everything new and which iPhones can install it.',
    excerpt:
      'Apple’s iOS 27 is rolling out this September — headlined by a generative-AI Siri and a Lock Screen wallpaper that extends itself to any screen. Here’s what’s new and whether your iPhone makes the cut.',
    category: 'Explainer',
    author: 'TechBD Team',
    date: 'Aug 30, 2026',
    readTime: '6 min read',
    views: 5200,
    imageAlt: 'iOS 27 on iPhone (placeholder image)',
    content: `
      <p>Announced at WWDC on June 8, 2026 and polished through a summer of betas, iOS 27 is now rolling out to iPhones worldwide this September. Apple skipped a dramatic visual overhaul this cycle and spent its energy on two things instead: making Siri genuinely useful, and sanding down the small daily annoyances that accumulate over a year.</p>

      <h2>When It Lands</h2>
      <p>Expect the public release around mid-September, following Apple's habit of shipping the final version alongside its new iPhone line. Betas have been out since June. One caveat up front: the biggest Siri upgrade ships as a separate "Siri AI beta" in English later in 2026, so parts of what you read below may arrive in a follow-up update rather than on day one.</p>

      <h2>The Wallpaper That Fits Any Screen</h2>
      <p>The sleeper hit of the release is wallpaper extension. Choose one photo and Apple Intelligence stretches it intelligently beyond its original borders so it fills the entire Lock Screen — no more awkward crops that only look right on one device. In Apple's demo, a single photo adapted cleanly across five different iPhones, each framing differently without visible distortion. Small feature, hard to go back from.</p>

      <h2>Siri, Rebuilt on Generative AI</h2>
      <p>This is the headline. Siri has been re-architected around a generative model meant to handle follow-up questions, understand what's on your screen, dig through your email for specifics, and complete multi-step tasks inside apps — table stakes for rivals, finally arriving on iPhone. Siri now lives as its own dedicated mode inside the Camera Control interface, and the system-wide search bar lets you pick between Siri and ChatGPT depending on the question.</p>
      <p>Beta testers report steady progress: responses come faster than in the first beta, and the gap to assistants like Gemini keeps narrowing. It's still imperfect — longer spoken requests sometimes get cut off mid-sentence, though short prompts are instant.</p>
      <p>The visual identity changed too: a refreshed icon and a subtler, more fluid glow around the Dynamic Island replace the old pulsing orb. Note that custom Siri voices demand newer hardware — an A19 Pro chip, found only in the iPhone Air and iPhone 17 Pro — so most existing iPhones won't get that piece even after updating.</p>

      <h2>Everything Else Worth Knowing</h2>
      <ul>
        <li>Lock Screen widgets are quietly reorganized, with Weather and Find My stacking more sensibly.</li>
        <li>Search is rebuilt for near-instant indexing of new content, and Mail's ranking got smarter.</li>
        <li>Shared Albums in Photos finally accept contributions from Android and Windows users.</li>
        <li>Safari can group tabs by topic, watch pages for changes, and build simple extensions from plain-language descriptions.</li>
        <li>Health adds perimenopause and menopause tracking; AirPods gain a custom EQ; Maps' FlyOver looks more realistic.</li>
        <li>Under the hood: a reworked CPU scheduler for smoother performance on older phones, plus better Wi-Fi-to-cellular handoffs.</li>
      </ul>

      <h2>Will Your iPhone Run It?</h2>
      <p>Compatibility is generous: every phone that ran iOS 26, right back to the iPhone 11 and the second-generation iPhone SE. The catch is feature splits — Apple Intelligence and most new Siri behaviour require an A17 Pro chip or newer (iPhone 15 Pro and up), and custom Siri voices need the A19 Pro. Everyone else still gets the performance, Photos, Safari, Health and Lock Screen improvements.</p>
      <p>Siri AI won't be available at launch in the EU or China while Apple works through local regulatory requirements. And the standing advice holds: back up before any major iOS update, and if you're on a public beta, expect some features to shift before the final build.</p>
    `,
  },
  {
    id: 5,
    title: 'iPhone Ultra: Apple’s First Foldable — Leaked Price, Specs and Release Window',
    metaTitle: 'iPhone Ultra Foldable: Price, Release Date & Leaked Specs',
    metaDescription:
      'Apple’s foldable iPhone reportedly lands in September 2026 as the iPhone Ultra — a passport-style fold with a crease-free hinge, A20 chip and a $1,999–$2,499 price. What’s known so far.',
    excerpt:
      'After a decade of rumors that went nowhere, Apple’s foldable finally has a shape, a name and a price range. Here’s everything credible about the iPhone Ultra — and why Samsung shouldn’t relax.',
    category: 'News',
    author: 'TechBD Team',
    date: 'Aug 22, 2026',
    readTime: '6 min read',
    views: 6700,
    imageAlt: 'iPhone Ultra foldable concept (placeholder image)',
    content: `
      <p>Apple has been "about to" launch a foldable since roughly 2018 — and every confidently predicted deadline came and went. This time the momentum looks real, and the leaks have converged on a name few expected: not the iPhone Fold, but the <strong>iPhone Ultra</strong>. According to analyst Mark Gurman, the branding is deliberate — Apple is assembling a family of "Ultra" products through the end of 2026, and the foldable is meant to crown that lineup.</p>

      <h2>A Passport, Not a Rectangle</h2>
      <p>Forget what the Galaxy Z Fold taught you a foldable looks like. Leakers describe a "passport-style" body — shorter and squarer when closed — opening into a roughly 7.7 to 7.8-inch internal display with an iPad mini-like 4:3 aspect ratio. It's still a book-style vertical fold like the Pixel 9 Pro Fold, just built around squatter proportions.</p>
      <p>The detail that will decide everything is the crease — and here the reporting is striking. Sources claim Apple pursued a crease-free hinge "regardless of cost," developing new material specifically so the fold line disappears when the phone is open. Every foldable on the market today shows some visible line; if Apple ships on that promise, it's a genuine category first.</p>
      <p>One expected sacrifice: Face ID is out, with Touch ID reportedly moving into the power button. Fitting Face ID's sensor array into a folding hinge has defeated the whole industry so far.</p>

      <h2>Specs In Play</h2>
      <p>Current consensus points to Apple's A20 chip, 12GB of RAM, dual 48MP rear cameras and a dual front-camera setup — with no telephoto lens, and a real possibility the cameras take a back seat to the iPhone 18 Pro Max, because a foldable body is a brutal place to fit a full camera module. Battery chatter has shifted more than once, but the latest supply-chain reports describe two cells totalling around 4,883mAh — enough to feed both screens.</p>
      <p>The pitch isn't "a phone that folds." It's "an iPad mini that folds into your pocket" — split-screen work, reading, and multitasking aimed at people tired of carrying both an iPhone and an iPad.</p>

      <h2>Price and Timing</h2>
      <p>Sit down: multiple credible reports converge on a starting price between $1,999 and $2,499, which would make it the most expensive iPhone ever sold by a wide margin. JPMorgan's estimate lands near $2,000, in line with everyone else. The launch window is September 2026, alongside the iPhone 18 Pro and Pro Max at Apple's fall event — not pushed to spring like this year's standard models.</p>

      <h2>Samsung Isn't Standing Still</h2>
      <p>Apple is entering a category Samsung has owned for eight generations. The Galaxy Z Fold8 Ultra just launched at $2,099.99 and measures a startling 4.1mm unfolded — reportedly thinner than the iPhone Ultra's rumoured 4.5mm. If that holds, Apple arrives as the catch-up player on raw thinness while potentially leading on the one problem nobody has fully solved: the crease.</p>
      <p>For buyers in Bangladesh, expect these figures to translate to well over ৳2.5 lakh at launch through official channels, with grey-market units arriving earlier but without warranty. If you simply want a great phone today, an established flagship remains the safer spend — first-generation Apple hardware has a track record, and it isn't flawless.</p>
    `,
  },
  {
    id: 6,
    title: 'iPhone 18 Release Date Split: Which Models Arrive When',
    metaTitle: 'iPhone 18 Release Date: When Each Model Actually Arrives',
    metaDescription:
      'Apple is splitting the iPhone 18 launch in two — Pro models and a foldable in September 2026, standard models in spring 2027. Here’s the full timeline and what changes.',
    excerpt:
      'For the first time, Apple is splitting its iPhone launch across two seasons. Here’s exactly when the iPhone 18 Pro, Pro Max, the foldable, and the standard models arrive — and why.',
    category: 'News',
    author: 'TechBD Team',
    date: 'Aug 22, 2026',
    readTime: '4 min read',
    views: 3300,
    imageAlt: 'iPhone 18 lineup (placeholder image)',
    content: `
      <p>For nearly ten years, "new iPhone" meant one thing: a September keynote, four or five phones announced together, pre-orders within the week. Not this year. Apple is breaking its own release calendar in two — and which model you're waiting for now decides when you'll actually get it.</p>

      <h2>September 2026: Pro Models and a Foldable</h2>
      <p>The iPhone 18 Pro and iPhone 18 Pro Max remain on track for Apple's traditional September event, with pre-orders the same week and deliveries shortly after. Sharing the stage is something Apple has never shipped: its first foldable, widely expected to carry the iPhone Ultra name.</p>
      <p>Design-wise, expect evolution rather than revolution — the Pro models are rumoured to echo the iPhone 17 Pro's raised camera plateau, though a few leaks suggest a slightly more prominent bump. The bigger stories are inside: a 2-nanometer A20 Pro chip, and the debut of Apple's own C2 modem — though US units may still ship with Qualcomm hardware depending on how Apple splits modem sourcing by region. Colour note for the spec-watchers: a "Dark Cherry" finish is tipped to replace the iPhone 17 Pro's Cosmic Orange.</p>

      <h2>Spring 2027: Everyone Else Waits</h2>
      <p>Here's the part that catches people off guard. The standard iPhone 18, an iPhone 18e, and possibly a second-generation iPhone Air are being held until spring 2027 — a full season after the Pro launch. The apparent logic: give September's spotlight entirely to the Pro lineup and the foldable, then hand the more affordable models their own moment months later. It's a genuine structural change, and it means "iPhone 18 release date" is no longer one date — it's two.</p>

      <h2>What About Pricing?</h2>
      <p>Nothing official yet. For context, the iPhone 17 Pro Max held its $1,199 starting price last cycle after a $100 bump on the smaller Pro the year before. Whether that stability holds — with a foldable likely priced well north of $1,500, possibly near $2,000, sharing the stage — is the open question heading into the keynote.</p>

      <h2>The Bottom Line</h2>
      <p>If you want a Pro model or you're curious about Apple's first foldable, September is your month. If you're a standard-model buyer, settle in — spring 2027 is the earliest realistic window, and this year's fall event simply isn't built for you. For Bangladesh buyers, expect official-channel stock of the Pro models within weeks of the US launch, as with recent generations, with the usual price premium over US MSRP.</p>
    `,
  },
];
