/**
 * Roofing Materials Data
 *
 * Cornerstone content for /roofing-materials/* guide pages.
 * Phase 1: asphalt shingles, metal roofing, impact-resistant shingles.
 */

export interface RoofingMaterial {
  slug: string
  name: string
  image: string
  eyebrow: string
  summary: string
  stats: {
    lifespan: string
    cost: string
    warranty: string
    wind: string
    fire: string
  }
  pros: string[]
  cons: string[]
  bestFor: string[]
  notIdealFor: string[]
  sections: { heading: string; body: string }[]
  msContext: string
  faqs: { q: string; a: string }[]
}

export const roofingMaterials: RoofingMaterial[] = [
  {
    slug: 'asphalt-shingles',
    name: 'Asphalt Shingles',
    image: '/images/services/roof-replacement.jpg',
    eyebrow: 'Most popular residential choice',
    summary: `Asphalt shingles are the most widely installed roofing material in the United States — and for good reason. They hit a reliable sweet spot of cost, performance, and aesthetics that works for the vast majority of residential homes. In Northeast Mississippi, architectural asphalt shingles dominate new installations and replacements, offering 25-30 years of service at a mid-range price point with a wide selection of profiles and colors. Understanding the three main types — 3-tab, architectural (dimensional), and luxury — helps you choose the right one for your budget and your home.`,
    stats: {
      lifespan: '25-30 years (architectural)',
      cost: '$4.50 – $6.50/sq ft installed',
      warranty: '30-year standard; 50-year on premium lines',
      wind: 'Up to 130 mph (varies by class)',
      fire: 'Class A (most lines)',
    },
    pros: [
      'Most affordable full-replacement option per square foot',
      'Installed by virtually every contractor — wide competition for price',
      'Huge color and profile selection to match any architectural style',
      'Repairs are straightforward and materials are universally available',
      'Class A fire rating standard on most quality lines',
      'Manufacturer warranties up to 50 years on premium products',
    ],
    cons: [
      'Shorter lifespan than metal or tile — typically 25-30 years vs. 40-70+',
      'Petroleum-based product is vulnerable to UV degradation over time',
      'Granule loss is a normal aging process but signals end of service life',
      'Not the best option for very low-slope (under 2:12 pitch) applications',
      'Performance varies significantly by quality tier — budget shingles underperform by design',
    ],
    bestFor: [
      'Standard residential replacements on budget-conscious timelines',
      'Homes where the owner plans to sell within 10-15 years',
      'Matching existing neighborhood aesthetics and HOA requirements',
      'Anyone wanting a proven, contractor-competitive material',
    ],
    notIdealFor: [
      'Very low-slope roofs (under 2:12 pitch) — requires special low-slope membrane',
      'Anyone planning a 50+ year ownership horizon who wants zero-maintenance',
    ],
    sections: [
      {
        heading: '3-tab vs. architectural: which is worth it?',
        body: `The roofing industry has effectively moved away from 3-tab shingles. They're a single-layer product with a uniform flat appearance and a wind resistance rating that tops out around 60-70 mph — inadequate for Northeast Mississippi storm conditions. Most quality contractors won't recommend them for new installations.

Architectural (dimensional) shingles are the standard for a reason: they're two-layer laminated products that create a textured, dimensional look; most carry 110-130 mph wind ratings; and their 30-year warranties are reliable for the 25-30 year service life most homeowners actually see. The price premium over 3-tab is modest — typically $0.50-1.00 per square foot — and the performance difference is substantial.

The bottom line: if you're replacing a roof, start the conversation with architectural shingles. If a contractor bids 3-tab without explanation, ask why.`,
      },
      {
        heading: 'Luxury and designer shingle lines',
        body: `Above the architectural tier are luxury (or designer) shingles — thick, multi-layer products that mimic the appearance of slate or cedar shake at a fraction of the installed cost. Lines like GAF Camelot, CertainTeed Grand Manor, and Owens Corning Duration Premium fall here.

The case for luxury shingles: they look significantly better on a high-end home, often carry 50-year warranties, and their thicker construction typically yields a better impact resistance profile. The case against: they're still asphalt, still petroleum-based, and still age the same way architectural shingles do — they just do it from a higher starting point. On a $600,000 home, the upgrade from architectural to luxury might be $2,000-4,000. On a $150,000 home, that money is often better spent on a Class 4 impact-resistant upgrade instead.`,
      },
      {
        heading: 'What the star rating and wind class actually mean',
        body: `Shingle packaging lists a lot of numbers. The ones that matter for Mississippi homes:

**Wind class**: Most architectural shingles carry a Class H (110 mph) or Class G (130 mph) wind rating per ASTM D7158. Class G is the specification most Mississippi homeowners should target, given the region's tornado exposure. Wind class affects both storm performance and your insurance policy's credits.

**Impact rating**: A separate classification (UL 2218) from Class 1 to Class 4. Class 4 means the shingle survived a 2-inch steel ball dropped from 20 feet without cracking. Standard architectural shingles are typically Class 1 or Class 2. If hail is a concern — and in Northeast Mississippi it should be — this is the upgrade that earns the insurance discount.

**Fire class**: Class A is the highest fire-resistance rating and is standard on most quality asphalt shingles. Don't accept Class B or C.`,
      },
      {
        heading: 'How shingles age: what to expect year by year',
        body: `Asphalt shingles don't fail suddenly — they degrade gradually, and each stage looks different.

**Years 1-8**: Normal settlement. You might see slight color variation as new shingles weather in. Minor granule shedding in gutters is normal.

**Years 8-18**: Productive middle years. The shingle performs as designed. Annual maintenance catches sealant failures and minor lifting.

**Years 18-25**: Accelerated aging zone. Granule loss becomes visible. Valley and ridge areas show wear faster than field shingles. This is the window to plan a replacement on your timeline rather than react to a failure.

**Years 25+**: Past rated lifespan. Individual shingles may still look acceptable, but the underlying mat is brittle, flashing sealants are failing, and the risk of a leak event is high. Continuing to repair is increasingly poor economics.

The main factor that accelerates aging: inadequate attic ventilation. A roof with poor soffit-to-ridge airflow can lose 30-40% of its rated lifespan.`,
      },
      {
        heading: 'Installation quality matters more than brand',
        body: `The same shingles installed with different techniques produce dramatically different results. The critical execution points:

**Nail placement**: Shingles have a nailing zone (typically a 1.25-inch band above the release strip). Nails placed too high (called "high nailing") don't engage the lower shingle layer — the shingle can release in wind even if the seal strip activated. This is the most common and least visible installation defect.

**Nail count**: 4 nails per shingle is standard for pitches under 6:12 in normal wind zones. In high-wind areas (Class G wind rating zones or above), 6 nails per shingle is required for the warranty to apply. Most roofers use 4 — ask which specification applies to your project.

**Starter strip**: A full-length starter strip (not just trimmed 3-tab pieces) at the eaves and rakes prevents wind uplift at the most vulnerable edge. It's a $0.15/linear foot material that gets skipped more often than it should.

**Flashing**: New flashing at every penetration is non-negotiable on a full replacement. Re-using old step flashing because "it's still good" is the single most common cause of leaks within 5 years of a replacement.`,
      },
      {
        heading: 'Major brands compared',
        body: `**GAF** holds the largest market share in North America. The Timberline HDZ is the dominant architectural shingle in the region — widely available, well-documented performance, and a competitive warranty. GAF's "System Plus" and "Golden Pledge" enhanced warranties require GAF-certified contractors and installation of multiple GAF accessory products (starter, underlayment, ridge cap).

**Owens Corning** Duration series is the primary competitor. SureNail Technology — a fabric nailing zone strip — makes the nail placement window more forgiving and the nail pull-through resistance higher. Preferred by contractors who nail to spec and want a margin of error.

**CertainTeed** Landmark series is the third major option. Slightly heavier per square, which some homeowners interpret as better quality (it isn't — weight doesn't determine performance). Their Integrity Roof System warranty program requires full-system installation.

All three perform comparably when installed correctly. The contractor's technique matters more than the brand choice at the same price tier.`,
      },
    ],
    msContext: `Northeast Mississippi's climate creates specific demands for asphalt shingles. The combination of hot, humid summers (attic temperatures exceeding 140°F are common) and the region's position in the Dixie Alley tornado corridor means two criteria matter above the standard: ventilation design and wind class.

On ventilation: a poorly ventilated attic in Mississippi summer heat is the fastest way to shorten a shingle's life. The NRCA recommends 1 square foot of net-free vent area per 150 square feet of attic floor. Most Mississippi homes fall short. Any quality replacement should include an audit of the ventilation ratio, with soffit intake or ridge vent additions as needed.

On wind: the minimum specification for a Northeast Mississippi home is Class H (110 mph) architectural shingles. Homes in open rural settings, on ridge lines, or in historically tornado-active counties (Lee, Prentiss, Itawamba) should target Class G (130 mph) or Class 4 impact-resistant shingles, which also earn insurance premium credits from most major carriers operating in Mississippi.`,
    faqs: [
      {
        q: 'How long do asphalt shingles actually last in Mississippi?',
        a: "Architectural asphalt shingles are rated for 30 years, but real-world performance in Mississippi averages 22-28 years for well-maintained roofs. The heat and UV load in the region accelerates the asphalt aging process compared to cooler climates. The biggest controllable variable is attic ventilation — a properly ventilated roof routinely hits the high end of its rated lifespan; one with poor airflow can fail at 18-20 years.",
      },
      {
        q: 'Are expensive architectural shingles worth the premium over budget lines?',
        a: "Yes, with a clear reason: quality architectural shingles (Timberline HDZ, OC Duration, CertainTeed Landmark) use more asphalt per shingle, better quality fiberglass mat, and tighter manufacturing tolerances than budget lines. That translates to more reliable warranty performance and better granule adhesion over time. The price difference between a budget architectural and a quality architectural shingle is typically $0.40-0.80/sq ft installed — not worth skipping.",
      },
      {
        q: 'Can asphalt shingles be installed over existing shingles?',
        a: "Most building codes allow one layer of shingles over an existing layer. The reason to avoid it: you can't inspect the deck condition, you're adding weight that stresses the structure, and the irregular surface underneath causes the new shingles to not seat flat. When issues develop under the new layer, you pay to remove both layers. A full [tear-off replacement](/services/roof-replacement) costs $1-2/sq ft more upfront and is almost always the correct choice for a long-term replacement.",
      },
      {
        q: "What's the difference between a 25-year and a 30-year shingle warranty?",
        a: "The warranty period refers to the manufacturer's coverage, but the practical difference between a 25-year and 30-year shingle is usually the product tier, not just the warranty length. Higher-tier shingles that carry 30-year (or 50-year) warranties are thicker, use more asphalt, and have better granule adhesion — the longer warranty reflects a genuinely better product, not just marketing. Always read what the warranty actually covers: 'limited' warranties have prorated coverage after the first 5-10 years.",
      },
      {
        q: 'Will new shingles raise or lower my home insurance premium?',
        a: "A new roof typically has a modest positive effect on insurance premiums — most carriers give some credit for a recently replaced roof (under 10 years old). The bigger premium impact comes from material choice: [Class 4 impact-resistant shingles](/roofing-materials/impact-resistant-shingles) qualify for explicit discount programs from most major carriers in Mississippi, with discounts ranging from 10-30% of the roof coverage component. The discount calculation varies by carrier and policy — ask your agent specifically about impact-resistant shingle credits before finalizing your material choice.",
      },
    ],
  },
  {
    slug: 'metal-roofing',
    name: 'Metal Roofing',
    image: '/images/services/metal-roofing.jpg',
    eyebrow: 'Longest-lasting residential option',
    summary: `Metal roofing has moved from a barn-and-commercial product to a mainstream residential choice, and the shift makes sense: a properly installed standing seam metal roof lasts 40-70 years, handles Mississippi's wind and rain loads better than asphalt, and carries a lower total lifetime cost despite higher upfront installation. For homeowners planning to stay in a home long-term, or building a new home where the roof choice will define the next 50 years, metal is the option worth a serious look. Understanding the types — standing seam, metal shingles, corrugated panels — and the variables that affect performance and price makes the decision straightforward.`,
    stats: {
      lifespan: '40-70 years (standing seam)',
      cost: '$10 – $18/sq ft installed (standing seam)',
      warranty: 'Lifetime limited (most products)',
      wind: '130-160 mph (product-dependent)',
      fire: 'Class A',
    },
    pros: [
      'Lowest 50-year total cost of any common roofing material',
      'Wind resistance up to 160 mph on quality standing seam installations',
      'Class A fire rating — the highest available',
      'Low maintenance: no granule loss, no cracking, no moss',
      'Reflects radiant heat, reducing attic temperatures and cooling load',
      'Environmentally favorable — typically 25-30% recycled content, 100% recyclable',
    ],
    cons: [
      'Highest upfront installation cost of any residential option',
      'Requires a contractor with specific metal roofing experience — fewer than for asphalt',
      'Expansion and contraction noise can be audible in attics during temperature swings',
      'Some HOAs restrict or prohibit metal roofing on aesthetic grounds',
      'Denting is possible from large hail on softer metals (aluminum); Galvalume steel is more resistant',
    ],
    bestFor: [
      'Long-term homeowners planning to stay 15+ years',
      'Anyone willing to pay more upfront to avoid replacement in their lifetime',
      'High-wind or hail-prone areas where impact and wind resistance justify the premium',
      'Energy-efficient homes where reflective roofing reduces cooling costs',
    ],
    notIdealFor: [
      'Short-term ownership where the cost premium won\'t be recouped',
      'HOA neighborhoods that restrict metal roofing aesthetics',
      'Very tight budget constraints where the upfront cost is prohibitive',
    ],
    sections: [
      {
        heading: 'Standing seam vs. metal shingles vs. corrugated panels',
        body: `Metal roofing comes in three main residential forms, each with different performance profiles and cost points.

**Standing seam** is the premium option. Panels run continuously from ridge to eave with raised interlocking seams that keep fasteners completely concealed. Because there are no exposed fasteners, there are no fastener holes to leak or fastener heads to weather. Standing seam is the system architects and high-end builders specify. It's also the most installer-dependent: proper clip installation, panel alignment, and seam engagement require training that most asphalt roofers don't have.

**Metal shingles** (also called metal shake or stone-coated steel) are pre-formed panels that replicate the appearance of asphalt shingles, wood shake, or tile. They're installed with exposed fasteners, which is a maintenance consideration, but they're significantly less expensive than standing seam and installable by more contractors. Stone-coated steel products carry the added benefit of quiet installation — the stone coating absorbs rain sound.

**Exposed-fastener corrugated panels** (R-panel, 5V crimp) are the traditional barn and agricultural profile. Perfectly functional and durable but aesthetically industrial. Used on some residential projects where budget is the primary driver or the profile fits the architectural style.`,
      },
      {
        heading: 'Galvalume steel vs. aluminum: which metal to choose',
        body: `The two dominant metal roofing materials are Galvalume steel (a steel substrate with a zinc/aluminum coating) and aluminum.

**Galvalume steel** is the most common material for standing seam and panel systems. It's harder than aluminum, more resistant to denting from hail, and less expensive. The zinc/aluminum coating provides excellent corrosion resistance in most climates. One limitation: within a few hundred feet of saltwater or in high-chloride environments, galvanic corrosion can be a concern. In Northeast Mississippi (far from the coast), Galvalume steel is typically the right choice.

**Aluminum** is corrosion-proof in any environment and the right choice for coastal or high-humidity applications. It's softer than steel — which means it's more susceptible to denting from large hail — but it weighs less (30% lighter than steel) and carries no risk of the red rust that can occur at cut edges on steel panels.

**Copper and zinc** are architectural metals used in specific high-end applications. Both develop attractive patinas over time. Both are priced at a significant premium over steel or aluminum ($20-40/sq ft installed for copper).`,
      },
      {
        heading: 'The cost math over time',
        body: `The argument for metal roofing is fundamentally economic, even though the upfront cost is higher.

A standing seam metal roof installed today at $14/sq ft on a 25-square roof costs approximately $35,000. An architectural asphalt roof at $5.50/sq ft costs $13,750. The difference is $21,250.

Over 50 years, the asphalt roof will be replaced once (potentially twice, depending on lifespan). Each replacement adds $13,750-18,000 plus the disruption and the recurring cost of maintenance, repairs, and insurance claims. The metal roof, properly maintained, runs the same 50-year window with no replacement and minimal repair cost.

Total lifetime cost analysis typically shows metal roofing breaking even with asphalt at the 20-25 year mark, and saving $10,000-30,000 over 50 years depending on material and labor costs at replacement time. The break-even assumes the homeowner stays in the home — which is why metal's economics favor long-term owners specifically.`,
      },
      {
        heading: 'Wind and storm performance',
        body: `Metal roofing's reputation for storm resistance is earned. Standing seam systems with concealed clips are tested to 140-160 mph wind uplift resistance — well above the wind speeds associated with most tornadoes below EF2, and significantly above the 130 mph threshold of Class G asphalt shingles.

The key to that performance is the clip system. Hidden clips allow the panel to float — expand and contract with temperature changes — while maintaining contact with the structural deck. A standing seam roof installed with fixed clips (a shortcut some contractors take) loses the expansion tolerance and is more prone to oil-canning (visible waviness) and fastener stress over time.

For hail: steel is harder than asphalt and more resistant to surface denting from standard hail (1 inch or smaller). In a severe hail event (2 inch+), both materials can sustain visible impact marks, but metal damage is typically cosmetic rather than structural. Aluminum dents more readily than Galvalume steel under hail.`,
      },
      {
        heading: 'Installation: what separates a good metal job from a bad one',
        body: `Metal roofing installation is a specialty. The material tolerates less margin for error than asphalt, and errors that would be cosmetic on an asphalt roof can become functional problems on metal.

**Critical execution points:**

Thermal movement: Galvalume steel panels expand and contract approximately 3/8 inch per 10 feet of length across the typical Mississippi temperature swing (0°F to 110°F surface temp). The clip system must allow for this. Panels fastened too rigidly will buckle or pucker.

Dissimilar metals: Where metal panels contact copper pipe boots, copper flashing, or copper gutters, galvanic corrosion will occur. Installation requires non-conductive separators or specified compatible flashing metals.

Fastener specification: Exposed-fastener systems require neoprene-washered screws torqued to the correct specification. Over-torqued screws compress and eventually crack the washer; under-torqued screws pull through in wind. Both fail the same way — from the outside, with water behind them.

Underlayment: Metal panels run hotter on the surface than asphalt (they also cool faster at night). Standard felt underlayment degrades more quickly under metal than under asphalt. Specify a high-temperature synthetic underlayment or a vented underlayment system.`,
      },
      {
        heading: 'Energy efficiency and attic temperature',
        body: `Metal roofing's reflective properties are a genuine benefit in Mississippi's climate. A bare Galvalume steel panel reflects 60-70% of solar radiation; a painted panel with a "cool roof" pigment can reach 70-85% reflectance. By comparison, a standard dark asphalt shingle reflects 5-20%.

In practical terms: a well-designed metal roof can reduce attic temperatures by 20-35°F compared to asphalt in peak summer conditions. That reduction translates to lower cooling load, reduced HVAC run time, and potentially meaningful energy savings on a poorly insulated home.

The caveat: the energy savings depend heavily on whether the attic is properly insulated. If attic insulation meets current code (R-38 or better), the temperature differential between a metal and asphalt roof has diminishing effect on conditioned space below. Metal's energy benefit is most pronounced on homes with under-insulated attics or on homes where the living space is directly below the roof deck (cathedral ceilings, finished attic spaces).`,
      },
    ],
    msContext: `Northeast Mississippi's combination of summer heat, Dixie Alley tornado exposure, and occasional hail events makes metal roofing a particularly well-suited choice for the region. The three relevant climate factors:

**Heat and humidity**: Standing seam metal handles Mississippi's extreme summer temperatures without the UV degradation that affects asphalt over time. The panel expansion tolerances are designed for exactly the range of temperatures the region experiences.

**Wind exposure**: The region's tornado frequency — historically among the highest in the country — means wind resistance specification matters. Standing seam metal's 140-160 mph rated systems provide a meaningful margin above asphalt's 110-130 mph ceiling.

**Hail**: Northeast Mississippi sees hail events annually, with occasional severe events. Galvalume steel's hardness means it resists denting on standard hail better than aluminum and better than asphalt (which sustains granule loss). Class 4 impact-resistant asphalt shingles and metal roofing are the two products that earn the most substantial insurance premium discounts for homeowners in hail-active zones.`,
    faqs: [
      {
        q: 'Will a metal roof be louder in the rain?',
        a: "Not compared to what most people expect, and significantly quieter than the noise from a corrugated metal barn — which is the reference most people have. A standing seam metal roof installed over solid decking with proper underlayment produces rain noise roughly equivalent to a quality asphalt roof. The insulation and decking material does most of the sound attenuation. Stone-coated metal shingles (which have a granular coating) are quieter still. The 'noisy metal roof' perception comes from pole barns and agricultural buildings where the metal is installed over purlins with no decking or insulation.",
      },
      {
        q: 'Does metal roofing attract lightning?',
        a: "No — metal does not attract lightning any more than an asphalt shingle does. Lightning strikes based on height and conductivity of the path to ground, not the roof material. A metal roof on a one-story house is no more likely to be struck than an asphalt roof on the same house. The NRCA, insurance industry, and building code all confirm this. If lightning does strike a metal roof, the material conducts the charge safely to ground rather than catching fire — which is actually a safety advantage over wood-framed asphalt construction.",
      },
      {
        q: 'Can metal roofing be installed over existing shingles?',
        a: "In most cases, yes — local codes permitting. Unlike adding a second layer of asphalt shingles, metal panels on standoffs or batten systems can go over existing shingles because the airspace provides drainage and ventilation. However, we recommend removing existing shingles for the same reason we recommend it for asphalt: you can't inspect the deck condition, and concealed deck rot is a serious problem that will eventually require the roof to come off anyway. A tear-off adds $1-2/sq ft and is almost always worth it.",
      },
      {
        q: 'Will metal roofing increase my home value?',
        a: "Yes, typically. A standing seam metal roof is perceived as a premium upgrade by buyers in the residential market, and its presence on a listing typically reduces buyer concerns about roof condition and upcoming capital expenditures. The value increase is rarely dollar-for-dollar with the installation cost premium over [asphalt shingles](/roofing-materials/asphalt-shingles), but buyers do factor it positively — particularly in markets where storm damage claims are common.",
      },
      {
        q: 'How do I find a qualified metal roofing contractor?',
        a: "Metal roofing installation is a specialty, and not all roofing contractors are competent at it. Ask directly: how many standing seam metal roofs has the crew installed? Do they carry the manufacturer's installer certification? Can they provide references for local metal jobs you can drive by? Manufacturer certification programs (GAF Master Elite for metal, Metal Roofing Alliance member) are a useful proxy. The labor quality difference between an experienced metal crew and an asphalt crew doing their first metal job is significant.",
      },
    ],
  },
  {
    slug: 'impact-resistant-shingles',
    name: 'Impact-Resistant Shingles',
    image: '/images/services/storm-damage-repair.jpg',
    eyebrow: 'Class 4 rated — built for hail & wind',
    summary: `Impact-resistant shingles — specifically those rated Class 4 under UL 2218 — are the single most practical upgrade for Northeast Mississippi homeowners replacing a roof. They cost 15-30% more than standard architectural shingles but earn an insurance premium discount that typically pays back the upgrade cost in 5-8 years. In the right market, the discount more than offsets the premium over the shingle's rated lifespan. Beyond the financial case, Class 4 shingles genuinely perform better under the hail, wind, and storm conditions that define the Mississippi climate.`,
    stats: {
      lifespan: '30-40 years',
      cost: '$6.00 – $9.00/sq ft installed',
      warranty: '40-50 years on most Class 4 lines',
      wind: 'Class H (110 mph) to Class G (130 mph)',
      fire: 'Class A',
    },
    pros: [
      'UL 2218 Class 4 rating — highest impact resistance classification available',
      'Insurance premium discounts of 10-30% on qualifying Mississippi policies',
      'Longer warranty (40-50 years) compared to standard architectural (30 years)',
      'Better performance under hail, debris impact, and wind-driven rain',
      'Installed by the same contractors as standard asphalt — no specialty crew required',
      'Available in same color and profile range as standard architectural shingles',
    ],
    cons: [
      '15-30% higher material cost than standard architectural shingles',
      'Insurance discount varies by carrier — verify your policy before committing to upgrade',
      'Still an asphalt-based product subject to the same heat and UV aging as standard shingles',
      'Class 4 rating covers impact resistance, not necessarily higher wind rating — check both specs',
    ],
    bestFor: [
      'Any Mississippi homeowner whose insurance carrier offers a Class 4 discount',
      'Homes in hail-active areas (most of Northeast Mississippi qualifies)',
      'Anyone who has filed a hail or wind claim in the past 5 years',
      'Homeowners replacing after storm damage who want to reduce future claim frequency',
    ],
    notIdealFor: [
      'Carriers that have cosmetic damage exclusions — the impact discount is less valuable',
      "Anyone planning to sell within 3-4 years before the insurance discount has paid back the premium",
    ],
    sections: [
      {
        heading: 'What Class 4 actually means',
        body: `The UL 2218 standard is the roofing industry's impact-resistance testing protocol. A shingle earns a Class 4 rating by surviving a 2-inch steel ball dropped from 20 feet onto the shingle surface at room temperature without cracking through the mat.

For comparison: Class 1 (the minimum tested) uses a 1.25-inch ball; Class 2 uses 1.5 inches; Class 3 uses 1.75 inches. Class 4 is the highest rating in the standard.

What this maps to in real hail: the insurance industry and building science community generally treat Class 4 as equivalent resistance to 1.75-2 inch hail (golf-ball to egg-sized). Most hail events produce hail under 1 inch, where standard architectural shingles hold up fine. It's the larger events — 1.5 inch+ — where Class 4 shingles show meaningful protection by avoiding granule loss, bruising, and fractures that trigger claims.

Note that UL 2218 tests impact at 70°F. Asphalt shingles are more brittle in cold temperatures. A late-season hail event on an already-cold roof creates higher failure risk than summer hail, regardless of Class rating.`,
      },
      {
        heading: 'The insurance discount math',
        body: `The financial case for Class 4 shingles depends entirely on your insurance carrier's discount structure. Not all carriers offer the same discount, and some carriers in Mississippi have moved toward cosmetic damage exclusions that reduce the value of the Class 4 upgrade.

The process to verify before committing: call your insurance agent and ask specifically "What discount do I receive if I install Class 4 impact-resistant shingles?" The discount is typically applied to the dwelling coverage component of your premium, not the total premium. Example: if your annual premium is $2,400 and dwelling coverage is 70% of that ($1,680), a 20% Class 4 discount saves $336/year.

A Class 4 upgrade on a 25-square roof might cost $3,500-5,000 more than standard architectural shingles. At $336/year in savings, payback is 10-15 years. At a 25% discount saving $420/year, payback is 8-12 years. On a 30-40 year shingle, that math works clearly in the homeowner's favor.

The carriers most aggressive with Class 4 discounts in Mississippi include State Farm, Nationwide, and several regional carriers. Verify with your specific carrier before making the decision.`,
      },
      {
        heading: 'How Class 4 shingles are made differently',
        body: `Class 4 shingles achieve their rating through manufacturing changes that make them harder to crack under impact. The main approaches used by different manufacturers:

**SBS modification**: Styrene-butadiene-styrene is a polymer modifier blended into the asphalt at manufacturing. It makes the asphalt matrix more flexible and less brittle at low temperatures. This is the approach used in the Owens Corning Duration Storm and CertainTeed Landmark IR.

**Polymer reinforcement**: A polymer-modified fiberglass mat or a laminated polymer layer that resists fracture under impact. Used in some GAF lines.

**Thicker construction**: A thicker asphalt coating layer provides more material to absorb impact energy before the fracture reaches the mat. Most Class 4 shingles are heavier per square than their standard architectural counterparts.

The practical result: Class 4 shingles resist granule loss and mat fracture better than standard shingles under the same hail event. They don't eliminate damage in a severe event, but they reduce the frequency of insurance-threshold damage in the moderate events that characterize most storm seasons.`,
      },
      {
        heading: 'Class 4 vs. metal roofing: which upgrade to choose',
        body: `For a homeowner deciding between a Class 4 shingle upgrade and a metal roof, the decision framework is straightforward.

**Choose Class 4 shingles if:** You're replacing a roof within a budget that makes $14+/sq ft installed prohibitive. You're planning to sell within 15-20 years. You want asphalt's wide color range and your contractor's existing expertise. You want the insurance discount with minimum additional cost.

**Choose metal if:** You're planning to stay 20+ years and want zero-replacement longevity. You can absorb the higher upfront cost and want to eliminate the roof as a recurring capital expense. You're in a high-wind area and want 140+ mph wind resistance rather than the 130 mph ceiling of Class G asphalt.

**Class 4 + metal comparison by cost over 40 years** (25-square roof, illustrative):
- Standard architectural asphalt: $13,750 installed + $14,500 replacement at year 28 = $28,250 over 40 years
- Class 4 asphalt: $17,500 installed + $18,500 replacement at year 32 = $36,000 over 40 years (but insurance discount savings of $9,000-12,000 over 40 years reduce net cost to $24,000-27,000)
- Standing seam metal: $35,000 installed, no replacement needed = $35,000 over 40 years

The ranges overlap, which is why the decision comes down to cash flow timing, insurance discount magnitude, and ownership horizon.`,
      },
      {
        heading: 'Top Class 4 products in the market',
        body: `**Owens Corning Duration Storm**: SBS-modified asphalt with the SureNail fabric strip for improved fastener grip. Well-documented Class 4 performance with a 50-year limited warranty. The SureNail strip also increases the effective nailing zone width, reducing installation error margin.

**CertainTeed Landmark IR**: Polymer-modified matrix with Class 4 and Class F (110 mph) wind rating. The "Impact Resistant" designation is certified by UL. Carried by CertainTeed's extended "SureStart PLUS" warranty coverage.

**GAF Timberline AS II**: Class 4 rated through a modified formulation. Sits within GAF's System Plus and Golden Pledge warranty tiers. Common in the region given GAF's market share and contractor certification program.

**Atlas StormMaster Shake**: Distinctive cedar shake appearance in a Class 4 product. Higher price point, but the aesthetic differentiation is meaningful for homes where curb appeal drives the material decision.

All four are available in the region and installed by qualified local contractors. The performance differences between them at the same Class 4 rating are minimal — contractor familiarity and installation quality matter more than brand choice.`,
      },
      {
        heading: 'What happens at claim time with Class 4 vs. standard shingles',
        body: `Insurance adjusters assess hail damage using a specific protocol: they look for bruising (compressed granule areas where the mat is damaged below the surface), missing granules concentrated in impact areas, and fractures in the shingle mat. Standard architectural shingles show this damage at lower hail energy thresholds; Class 4 shingles require higher energy to produce the same claim-triggering damage.

The practical effect for homeowners: in a moderate hail event, a Class 4 roof may come through without damage threshold while an adjacent standard roof files a claim. Over the lifetime of a roof in a hail-active region, Class 4 homeowners file claims less frequently.

This reduced claim frequency is partly why carriers discount Class 4 — they pay out less on those policies. When a claim does occur, however, the settlement amount is the same regardless of the shingle's Class rating. The Class 4 benefit is in avoiding the threshold — not in a higher settlement when the threshold is crossed.`,
      },
    ],
    msContext: `Northeast Mississippi sits in a hail corridor that extends from Texas through the Tennessee Valley — historically one of the more active hail regions in the country. Lee, Prentiss, Itawamba, and surrounding counties see 2-4 significant hail events annually, with sporadic events producing 1.5-2 inch stones.

This exposure profile is precisely the market Class 4 shingles are designed for. The combination of annual moderate events and occasional severe events means the insurance discount compounds year over year, and the reduced granule loss from moderate events extends the useful life of the roof compared to a standard shingle.

Mississippi's insurance market has evolved around this reality. Most major carriers operating in the state have explicit Class 4 discount programs, though the discount percentages and cosmetic damage exclusion terms vary significantly between carriers. The most important homework a Northeast Mississippi homeowner can do before choosing a shingle is to ask their agent the specific discount amount — and get it in writing — before the replacement contract is signed.`,
    faqs: [
      {
        q: 'How much does the insurance discount save per year?',
        a: "The discount amount varies by carrier, policy structure, and home value. Most Mississippi carriers that offer Class 4 discounts apply a 15-25% reduction to the dwelling coverage component of the premium — not the total premium. On a typical mid-range home policy, this translates to $200-500 in annual savings. Your specific savings depend on your carrier's program and your dwelling coverage amount — your agent should be able to give you an exact number before you commit to the upgrade.",
      },
      {
        q: 'If I already have Class 4 shingles and file a hail claim, will my rate go up?',
        a: "Filing a claim always carries the risk of a rate increase at renewal, regardless of shingle class. The Class 4 benefit is in reducing the frequency of reaching the damage threshold that warrants a claim — not in immunity from rate increases after a claim. If an event produces damage severe enough to exceed the Class 4 threshold, you file and the normal claim process applies.",
      },
      {
        q: "Can I get the Class 4 discount if I'm replacing after a hail claim?",
        a: "Yes — if you're replacing after a hail claim, the insurance proceeds typically cover the cost of equivalent-grade shingles. Installing Class 4 instead of standard architectural means paying the upgrade premium out of pocket, but you immediately qualify for the Class 4 discount going forward. Many homeowners find this the right moment to make the upgrade: you're paying for a new roof anyway, the incremental cost is modest, and the discount begins immediately.",
      },
      {
        q: 'Do Class 4 shingles look different from standard shingles?',
        a: "No — Class 4 shingles are manufactured to the same dimensions and in the same color ranges as standard architectural shingles. The modified asphalt formulation is internal; nothing about the appearance distinguishes a Class 4 product from a standard dimensional shingle. You choose the same way you'd choose any architectural shingle — by color, texture, and profile — with the Class 4 rating confirming the impact performance.",
      },
      {
        q: "What's the difference between Class 4 impact resistance and wind rating?",
        a: "They test different things. UL 2218 Class 4 measures resistance to a falling steel ball — a proxy for hail impact. The wind rating (ASTM D7158) measures resistance to wind uplift, rated Class D (90 mph) through Class H (150 mph). A shingle can be Class 4 impact-rated and Class H wind-rated, but the two ratings are independent. For Northeast Mississippi, you want both: Class 4 impact AND at minimum Class H (110 mph) wind rating. Most Class 4 products include a competitive wind rating, but verify both specifications when choosing.",
      },
    ],
  },
  {
    slug: 'synthetic-shingles',
    name: 'Synthetic Shingles',
    image: '/images/work/estate-roof.webp',
    eyebrow: 'Premium look, engineered performance',
    summary: `Synthetic roofing shingles — made from polymer, rubber, or composite materials — are engineered to replicate the visual texture of slate or cedar shake without the structural demands or maintenance burden of the real thing. In Northeast Mississippi, they occupy a growing niche between standard asphalt and premium metal: more expensive than architectural shingles but built to outlast them by 10-20 years, with impact resistance that natural materials can't match. For homeowners who want a distinctive roof without the weight load, cost, or upkeep of natural slate or wood, synthetic shingles are worth serious consideration.`,
    stats: {
      lifespan: '40-50 years',
      cost: '$8.00 – $14.00/sq ft installed',
      warranty: '40-50 year limited manufacturer',
      wind: '110-130+ mph (Class F-G)',
      fire: 'Class A',
    },
    pros: [
      'Replicates the look of slate or cedar shake at a fraction of the cost and weight',
      'Class 4 impact rating available — qualifies for insurance premium discounts',
      'Lighter than real slate — no structural reinforcement required on most homes',
      'Highly resistant to cracking, fading, and UV degradation compared to wood',
      'Class A fire rating standard across all reputable product lines',
      'Low maintenance — won\'t split, warp, or rot like natural wood',
      'Installs with standard roofing tools and techniques',
    ],
    cons: [
      'Higher upfront cost than asphalt — 1.5-2× the installed price per square foot',
      'Fewer local contractors have hands-on experience with synthetic products',
      'Quality varies widely between manufacturers — low-end products underperform',
      'Not universally available — lead times longer than standard shingles',
      'Real slate or shake may be preferred in historic districts where authenticity matters',
    ],
    bestFor: [
      'Homeowners wanting the aesthetic of slate or shake without the weight or maintenance',
      'High-wind zones where Class 4 impact ratings deliver insurance benefits',
      'Long-term owners prioritizing 40+ year service life over lowest upfront cost',
      'Homes with roof structures not rated for real slate\'s 800-1,500 lb/square weight',
    ],
    notIdealFor: [
      'Budget-constrained replacements where asphalt shingles meet the need',
      'Historic preservation projects requiring authentic natural materials',
      'Homeowners planning to sell within 5-7 years (harder to recoup premium cost)',
    ],
    sections: [
      {
        heading: 'What synthetic shingles are made of',
        body: `Most synthetic shingles are manufactured from one of three base materials: **virgin polymer** (high-density polyethylene or polypropylene), **recycled rubber and plastic** composites, or **fiber-reinforced polymer** blends. Premium products layer in UV stabilizers, colorfast pigments, and mineral granules to improve weathering performance and hold their appearance over decades.\n\nThe manufacturing process uses molds cast from actual slate tiles or cedar shake profiles, which is why high-quality synthetic products are visually convincing at normal viewing distances. The texture depth, color variation, and shadow lines closely replicate the real thing — important if curb appeal or neighborhood consistency matters to you.\n\nNot all synthetics are equal. Tier-1 products from manufacturers like DaVinci Roofscapes, Brava, and CertainTeed carry 50-year warranties and proven track records. Cheaper imported alternatives use lower-grade polymers that can chalk, fade, and crack within 15 years. Specifying the manufacturer — not just "synthetic shingles" — matters when getting quotes.`,
      },
      {
        heading: 'Impact resistance and storm performance',
        body: `Mississippi sits in one of the most storm-active corridors in the country. Severe hail, straight-line winds, and tornadoes are recurring events across Northeast Mississippi and the Gulf Coast region. This is where synthetic shingles have a measurable advantage over both standard asphalt and natural materials.\n\nMany synthetic products carry a **Class 4 impact rating** from UL 2218 testing — the highest available classification. Class 4 shingles can withstand a 2-inch steel ball dropped from 20 feet, which approximates the impact energy of golf-ball-sized hail. Standard architectural asphalt shingles typically test at Class 2 or 3. Natural slate is brittle and can fracture under severe hail. Cedar shake splits.\n\nInsurance carriers in Mississippi often provide **5-25% premium discounts** on homeowner policies for Class 4 certified roofing products. Depending on your current premium and roof size, that discount can offset a meaningful portion of the cost difference between synthetic and standard asphalt over a 10-15 year window. Ask your insurance agent for your specific discount percentage before getting quotes.`,
      },
      {
        heading: 'Weight and structural requirements',
        body: `One of the most practical advantages of synthetic shingles over real slate is weight. Natural slate runs **800-1,500 pounds per roofing square** (100 sq ft). Most Mississippi homes built in the past 50 years are designed for asphalt shingles, which weigh 200-350 pounds per square. Installing real slate on a standard-framed home requires structural reinforcement — often at considerable cost.\n\n**Synthetic shingles weigh 150-300 pounds per square** — within the design envelope of standard residential construction. No structural engineering review is typically required, and no rafter reinforcement is needed on code-compliant homes. This is a key reason why synthetic shingles can go on almost any house that could take asphalt, while real slate cannot.\n\nConcrete tile, for comparison, runs 900-1,200 pounds per square — similar to slate. If you\'re considering tile aesthetics, synthetic is almost always the more practical path unless your home was specifically built or reinforced for heavy materials.`,
      },
      {
        heading: 'Maintenance requirements',
        body: `Synthetic shingles require minimal maintenance compared to the materials they mimic. Cedar shake needs periodic cleaning to prevent moss and algae growth, re-staining or re-sealing every 5-7 years, and replacement of split or damaged shakes as they age. Real slate needs periodic inspection for cracked or slipped tiles, careful treatment of the copper flashing typically used with it, and slate-experienced installers for any repairs — a specialty trade that\'s increasingly difficult to find in rural Mississippi.\n\nSynthetics don\'t split, rot, or require refinishing. They\'re typically algae-resistant because of embedded antimicrobial treatments. Inspection every 3-5 years and keeping gutters clear of debris is generally sufficient. Damaged panels — while rare — can be replaced individually without disturbing surrounding material.\n\nMoss and algae can still develop on synthetic surfaces in Mississippi\'s humid climate, particularly on north-facing slopes with heavy shade. Annual cleaning or zinc strip installation at the ridge will prevent biological growth from gaining a foothold.`,
      },
      {
        heading: 'Cost breakdown and ROI',
        body: `Synthetic shingles installed in Northeast Mississippi typically run **$8-14 per square foot**, depending on product tier, roof complexity, and contractor markup. On a 2,000 sq ft ranch home with 20-22 squares of roofing area, that\'s roughly $16,000-30,000 installed — compared to $9,000-14,000 for a standard architectural asphalt replacement.\n\nThe cost premium buys you longer service life, better storm resistance, and lower maintenance costs over the roof\'s lifetime. On a 40-50 year timeline with no re-roofing required and modest insurance savings, the total cost of ownership can be competitive with two cycles of standard asphalt.\n\nThe calculation changes if you\'re planning to sell within 5-10 years. Appraisers and buyers often don\'t differentiate between synthetic and standard asphalt well enough to recover the full premium in resale value. If this is a long-term home, the math favors synthetic more strongly.`,
      },
      {
        heading: 'Finding qualified installers',
        body: `Synthetic shingles install much like architectural asphalt — same tools, similar techniques, standard starter strip and cap. Any experienced roofing contractor can install them. However, some products have manufacturer-specific installation requirements around starter strips, overlap dimensions, and fastener patterns that differ from asphalt. Cutting the material also requires a proper blade to avoid cracking at the cut edge.\n\nWhen getting quotes, ask whether the contractor has installed the specific product before. For higher-end lines like DaVinci or Brava, ask if they\'re a factory-certified installer — manufacturer certification indicates training and familiarity with the product\'s requirements. Certified installers also typically have access to extended workmanship warranties beyond the standard contractor guarantee.\n\nAt Smart Roof Pricing, we\'ll walk you through which products and installers are appropriate for your specific home, budget, and long-term goals — without defaulting to the most expensive option if it doesn\'t fit your situation.`,
      },
    ],
    msContext: `Mississippi\'s climate creates specific demands that synthetic shingles handle well. The combination of high humidity, heavy UV load, and frequent severe weather events — including the tornado season from March through May and hurricane season extending through November — rewards materials that don\'t degrade from moisture cycling or fracture under impact.\n\nAlgae and moss are more aggressive in Mississippi than in drier climates. Synthetic shingles with embedded algae inhibitors perform well here. The UV intensity in North Mississippi through the summer months causes photodegradation in lower-quality polymers; premium products with UV stabilizers retain their color and structural integrity much longer under Southern sun.\n\nFor homeowners in high-risk wind zones — particularly those in tornado corridors across Lee, Union, and Prentiss Counties — the Class 4 impact rating is worth pricing. The insurance discount available through MWUA-participating carriers can make a meaningful dent in the cost premium over the policy period.`,
    faqs: [
      {
        q: 'Do synthetic shingles qualify for insurance discounts in Mississippi?',
        a: 'Many do, but the specific discount depends on your insurance carrier and whether the product carries a Class 4 UL 2218 impact rating. Verify with your agent which products qualify before committing to a specific brand. Most major carriers operating in Mississippi recognize Class 4 products from established manufacturers like DaVinci, Brava, and CertainTeed.',
      },
      {
        q: 'How long do synthetic shingles actually last?',
        a: 'Premium synthetic shingles carry 40-50 year manufacturer warranties, and the material science supports long service life when installed correctly. However, the product category is relatively young — most major synthetic lines have only been on the market for 20-30 years. The warranty is a reasonable proxy for durability, but there\'s less long-term field data than exists for asphalt or metal.',
      },
      {
        q: 'Can I install synthetic shingles over my existing asphalt roof?',
        a: 'In most cases yes, if the existing roof deck is sound. Most jurisdictions allow one layer of overlay before requiring a full tear-off. However, we generally recommend tear-off so the deck can be inspected and any damaged sheathing replaced. Installing over a deteriorated deck undermines the new material\'s performance and voids most manufacturer warranties.',
      },
      {
        q: 'How do synthetic shingles compare to metal roofing?',
        a: 'Metal roofing — especially standing seam — typically offers a longer lifespan (40-70 years), better wind resistance, and higher fire ratings. Synthetic shingles offer a more traditional aesthetic at a lower price point. Metal is often the better long-term value; synthetic shingles make sense if you want the look of slate or shake, or if metal\'s cost is out of reach.',
      },
      {
        q: 'Will synthetic shingles look fake or cheap?',
        a: 'Quality synthetic shingles from Tier-1 manufacturers look convincing at normal viewing distances. The texture molds are cast from real slate and shake samples, producing realistic shadow lines and color variation. Lower-end products with flat, uniform profiles do look artificial. Budget for Tier-1 product if aesthetics matter — the visual difference between premium and budget synthetics is significant.',
      },
    ],
  },
  {
    slug: 'clay-tile-roofing',
    name: 'Clay & Concrete Tile',
    image: '/images/work/large-residential.webp',
    eyebrow: 'Exceptional longevity, classic Southern style',
    summary: `Clay and concrete tile roofing represent the high end of residential durability — with documented lifespans of 50-100+ years, fire immunity, and minimal maintenance needs once properly installed. In Mississippi, tile is most common on upscale custom homes and some historic properties where the Mediterranean or Spanish Colonial aesthetic fits the architecture. It is not appropriate for every home: the weight load (900-1,200 lbs per square) requires verified structural capacity, and the installed cost ($15-30/sq ft) puts it firmly in the premium tier. For homeowners building or renovating a home intended to last generations, tile is a legitimate long-term consideration.`,
    stats: {
      lifespan: '50-100+ years (clay); 40-50 years (concrete)',
      cost: '$15.00 – $30.00/sq ft installed',
      warranty: '50 years (concrete); lifetime (clay)',
      wind: '125-150 mph rated; Class F-G',
      fire: 'Class A (inherent — no coating required)',
    },
    pros: [
      'Exceptional lifespan — clay tile roofs routinely outlast the homes they cover',
      'Inherently non-combustible — no fire rating coating required, never degrades',
      'Resists UV degradation, salt air, and insect damage that compromise organic materials',
      'Thermal mass provides passive cooling benefit in Mississippi summers',
      'Never requires painting, staining, or surface treatment',
      'Color is fired into the material and does not fade over decades',
      'Significant curb appeal for Mediterranean, Spanish Colonial, and Mission-style architecture',
    ],
    cons: [
      'Heavy — 900-1,200 lbs per square requires structural engineering verification',
      'High installed cost: $15-30/sq ft vs. $4.50-7 for asphalt',
      'Brittle — individual tiles can crack under point impact (foot traffic, fallen branches)',
      'Specialized installation — far fewer contractors in Mississippi have genuine tile experience',
      'Difficult to source repair tiles matching aged installations if a section is damaged',
      'Not appropriate for low-slope applications below 4:12 without special systems',
    ],
    bestFor: [
      'Custom homes and estate properties where lifetime durability justifies the investment',
      'Mediterranean, Spanish Colonial, Mission, or Southwest architectural styles',
      'Homeowners in coastal areas where salt air degrades organic materials faster',
      'Generational properties where the roof should outlast the current owner',
    ],
    notIdealFor: [
      'Standard residential homes without structural verification for heavy loads',
      'Budget-constrained projects or homes likely to be sold within 15 years',
      'Low-slope roofs (below 4:12 pitch)',
      'Areas where finding experienced tile installers or repair-match tiles is difficult',
    ],
    sections: [
      {
        heading: 'Clay vs. concrete tile: what\'s the difference',
        body: `Both clay and concrete tile look similar from a distance, but they differ in composition, weight, lifespan, and cost.\n\n**Clay tile** is kiln-fired from natural clay at extremely high temperatures. The resulting material is dense, non-porous, and essentially inert — it does not absorb water, does not react to chemicals, and does not change properties over time. Clay tiles installed in the 1800s are still functional on surviving buildings. Lifespans of 75-150 years are realistic. Clay is heavier than concrete (900-1,200 lbs per square) and more expensive.\n\n**Concrete tile** is made from portland cement, sand, and water, molded under pressure and colored with mineral pigments. It\'s heavier than clay per tile in some configurations but slightly lighter per square overall in others. Concrete tile has a lifespan of 40-60 years — shorter than clay because it absorbs more moisture over time and the pigment eventually bleaches from UV exposure. It\'s the more common choice because of lower cost and better availability of installers.\n\nFor Mississippi specifically: concrete tile is more practical to source and install. Clay is the gold standard for true longevity but carries a significant premium and thinner contractor availability.`,
      },
      {
        heading: 'Structural requirements in Mississippi',
        body: `The most important factor in any tile roofing project is structural capacity. **Standard residential roof framing in Mississippi is engineered for asphalt shingles, which weigh 200-350 lbs per square.** Tile runs 900-1,200 lbs per square — three to five times heavier.\n\nBefore any tile installation, a structural engineer must verify that the existing rafters, ridge board, wall plates, and foundation can handle the additional dead load. Undersized rafters will deflect and eventually fail. In some cases, the framing can be reinforced with sister rafters or additional purlins. In others, the framing geometry makes reinforcement impractical.\n\nFor new construction, specifying tile from the design phase allows the structural engineer to size the framing appropriately from the start — the most cost-effective approach. Retrofitting an existing home for tile is more variable; get the structural assessment before committing.\n\nMississippi\'s building codes require compliance with the IBC (International Building Code) for structural loads. Lee County, Tupelo, and surrounding municipalities enforce permit requirements that will trigger structural review during the permitting process for a tile installation.`,
      },
      {
        heading: 'Tile profiles and styles',
        body: `Tile comes in several distinct profiles that define the roof\'s visual character:\n\n**S-tile (Spanish or Mission)** is the classic undulating profile — one curve up, one curve down — that creates the distinctive wave pattern associated with Mediterranean and Mission architecture. It\'s the most recognizable tile profile and the most common in the southern United States.\n\n**Barrel tile (Roman)** is a half-cylinder profile installed in alternating rows — one row face-down (pan), one row face-up (cap). Barrel tile creates deeper shadow lines than S-tile and a more dramatic visual texture. It\'s the traditional profile of Spanish Colonial and Italian architecture.\n\n**Flat/low-profile tile** mimics a more understated look similar to slate or shake. It installs with a lower profile than barrel or S-tile and suits a wider range of architectural styles, including some contemporary and transitional designs.\n\nColors range from terra cotta (the natural clay color) to glazed finishes in deep reds, buffs, grays, and custom blends. Concrete tile accepts a wider range of pigments. For Mississippi, lighter colors perform slightly better thermally by reflecting more solar radiation.`,
      },
      {
        heading: 'Installation requirements and flashing',
        body: `Tile installation requires significantly more care than asphalt. Every penetration, valley, hip, ridge, and transition point requires purpose-made metal flashing — typically copper or high-grade stainless steel — because tile cannot be cut and sealed the way asphalt can. Improper flashing is the single most common source of tile roof failure in the field.\n\nThe underlayment system under tile is critical and code-mandated. In Mississippi\'s high-wind and hurricane-exposure zones, a two-ply system — typically 30-lb felt or a modern self-adhering peel-and-stick underlayment — is required under the tile layer. The underlayment does the waterproofing work; the tile is primarily a weather shield that protects the underlayment from UV and physical damage.\n\nProper attachment is also a code consideration. In high-wind zones (which includes coastal Mississippi and areas near the Gulf), tiles must be mechanically fastened to prevent uplift. Some areas require foam adhesive mortar at every hip and ridge tile in addition to mechanical fastening.\n\nFind a contractor with documented tile experience and manufacturer training. The failure modes from improper tile installation are insidious — water infiltration at a bad flashing detail can persist for years before causing visible interior damage.`,
      },
      {
        heading: 'Maintenance and repairs',
        body: `Properly installed tile roofing requires minimal maintenance — one of its genuine advantages over organic materials. The tile surface itself doesn\'t need treatment, cleaning beyond removing debris accumulation, or periodic coating.\n\nThe primary maintenance needs are:\n\n**Walking on tile** is the most common cause of cracked tiles. Tile is strong in compression but brittle under point loads. Anyone accessing the roof for HVAC, antenna, or solar work needs to step on the mortar ribs or use walking boards, never on the tile body. A single misplaced step can crack a tile, and cracked tiles allow water infiltration through to the underlayment.\n\n**Moss and algae** grow on tile in Mississippi\'s humid climate, particularly on north-facing slopes and shaded sections. Biological growth can hold moisture against the surface and accelerate concrete tile degradation. Annual cleaning and zinc or copper strip installation at the ridge prevents growth from establishing.\n\n**Underlayment lifespan** is the most significant maintenance consideration. The tile may last 80 years, but the underlayment beneath it will need replacement after 30-40 years. Planning for an underlayment replacement (which involves removing and reinstalling the tile, but reusing it) is part of the long-term ownership model for tile roofing.`,
      },
      {
        heading: 'Cost expectations and ROI',
        body: `Tile roofing installed in Mississippi runs **$15-30 per square foot** depending on tile type, profile, structural work required, and contractor experience. On a 2,200 sq ft home with 22-24 squares of roofing area, budget $33,000-70,000+ installed. This is 3-5× the cost of a standard asphalt replacement.\n\nThe ROI calculation for tile requires a long time horizon. Over 75-100 years, a tile roof may outlast two or three asphalt roof cycles, which at $15,000-25,000 per cycle represents significant cumulative cost. For a family intending to stay in a home for 30+ years, the long-term math can favor tile — though the upfront capital requirement is substantially higher.\n\nResale value impact varies significantly. In markets where tile is the expected finish for a home\'s price point and style (high-end custom homes, Mediterranean-influenced architecture), tile adds clear value. On a standard rancher in a neighborhood of asphalt-roofed homes, buyers are unlikely to pay a full premium for the material.\n\nThe honest framing: tile makes economic sense for homes designed around it, intended for long ownership, or in locations where durability and storm resistance have outsized value. For most Mississippi homeowners replacing a standard residential roof, asphalt or metal is the more practical choice.`,
      },
    ],
    msContext: `Mississippi\'s climate has elements that both favor and challenge tile roofing. On the positive side, Mississippi does not experience the freeze-thaw cycling that causes tile to spall and crack in northern states — clay and concrete tile perform well in freeze-limited climates. The heat, humidity, and UV intensity of Mississippi summers are non-issues for tile, which tolerates both better than organic materials.\n\nThe challenges are wind and biological growth. Hurricane-season exposure along the Gulf Coast and severe thunderstorms statewide create uplift forces that require proper fastening per the local wind design speed (typically 115-130 mph in Northeast Mississippi; higher along the coast). Biological growth from Mississippi\'s humidity requires attention, particularly on concrete tile where moisture retention accelerates pigment fading.\n\nFor coastal Mississippi homeowners — Biloxi, Gulfport, Ocean Springs, Gautier — tile\'s resistance to salt air and hurricane-force wind is a genuine advantage. The MWUA (Mississippi Wind Underwriting Association) wind pool territory requirements make durable, well-attached roofing especially important in coastal zones. Tile installed to wind-design standards offers excellent protection.`,
    faqs: [
      {
        q: 'Does my home\'s structure need to be verified before installing tile?',
        a: 'Yes — a structural assessment is required before any tile installation. Tile weighs 900-1,200 lbs per square versus 200-350 lbs for asphalt. Standard residential framing in Mississippi is not engineered for tile loads. A structural engineer must confirm the rafters, walls, and foundation can handle the additional weight, or specify the reinforcement required. Do not skip this step.',
      },
      {
        q: 'How long does clay tile actually last?',
        a: 'Quality clay tile installed correctly can last 75-150 years or longer. The tile itself is essentially permanent — the limiting factor is the underlayment beneath it, which typically needs replacement after 30-40 years. Concrete tile has a shorter practical lifespan of 40-60 years before surface degradation becomes significant.',
      },
      {
        q: 'Is tile appropriate for my Mississippi home?',
        a: 'Tile is appropriate if your home has (or can be reinforced to have) adequate structural capacity, your architecture suits the profile (Mediterranean, Spanish Colonial, Mission-style, or similar), and your budget supports $15-30/sq ft installed. It\'s a poor fit for standard-framed ranch homes, low-slope roofs, or situations where budget is a primary constraint.',
      },
      {
        q: 'Can broken tile pieces be replaced?',
        a: 'Individual tiles can be replaced, but matching aged tile for repairs is increasingly difficult as time passes. Color and texture change subtly over decades of weathering. For best results, keep spare tiles from your original installation. If the original run is discontinued, a skilled tile roofer can often find a reasonable match, though it may not be invisible.',
      },
      {
        q: 'What\'s the difference between tile and slate?',
        a: 'Slate is a natural stone product with the longest residential lifespan of any roofing material (100+ years), but it\'s far heavier, more brittle, and more expensive than concrete tile. Clay tile is also a natural ceramic product but fired, not split, and generally less expensive than natural slate. Synthetic versions of both exist at lower cost and weight — see our synthetic shingles guide for that comparison.',
      },
    ],
  },
  {
    slug: 'wood-shake-roofing',
    name: 'Wood Shake & Cedar Shingles',
    image: '/images/work/detail-architectural.webp',
    eyebrow: 'Classic American character — with real maintenance demands',
    summary: `Wood shake and cedar shingle roofing deliver a warmth and textural depth that no synthetic material fully replicates — the irregular edges, natural color variation, and weathering patina of real wood have defined American residential architecture for centuries. In Mississippi, wood roofing is rarely specified for new installations today because of the climate: the humidity, heat, and abundant biological activity that characterizes the humid subtropical South accelerates the natural degradation of wood. That said, wood shake remains an option for homeowners who specifically want the aesthetic and are prepared for the maintenance it demands. This guide explains what that involves honestly.`,
    stats: {
      lifespan: '20-30 years (treated); 15-25 years (untreated in humid climates)',
      cost: '$7.00 – $12.00/sq ft installed',
      warranty: '25 years typical; varies by treatment',
      wind: 'Moderate — Class D-F; varies significantly by installation',
      fire: 'Class C (treated); Class A with fire-retardant coating (FRSC)',
    },
    pros: [
      'Authentic visual texture and warmth that synthetic materials don\'t fully replicate',
      'Natural insulating value slightly higher than asphalt',
      'Biodegradable and made from a renewable resource',
      'Individual shakes can be replaced without disturbing the whole field',
      'Ages to a classic silver-gray patina that many homeowners prize',
      'Works well with Craftsman, Tudor, Cape Cod, and traditional cottage architectural styles',
    ],
    cons: [
      'High maintenance in humid climates: annual cleaning, periodic treatment, algae and moss management',
      'Shorter lifespan in Mississippi humidity than in drier western climates where it was popularized',
      'Natural fire hazard unless treated with Class A fire-retardant coating (FRSC)',
      'Susceptible to fungal rot and insect damage without diligent maintenance',
      'Higher insurance premiums in some markets due to fire classification',
      'Fewer experienced installers in Mississippi compared to asphalt or metal',
    ],
    bestFor: [
      'Homeowners prioritizing authentic natural aesthetics over low maintenance',
      'Craftsman, Tudor, Arts and Crafts, or cottage-style homes where wood shake is architecturally correct',
      'Areas with lower humidity or significant shade reduction from tree canopy clearance',
      'Historic restorations where authenticity requires wood',
    ],
    notIdealFor: [
      'High-humidity, high-shade situations that accelerate biological growth',
      'Homeowners wanting low-maintenance roofing',
      'Areas with strict fire code requirements (without FRSC treatment)',
      'Long-term durability as primary objective — other materials last longer in MS climate',
    ],
    sections: [
      {
        heading: 'Shake vs. shingles: what\'s the distinction',
        body: `The terms "shake" and "shingle" are often used interchangeably but refer to distinct products:\n\n**Cedar shingles** are sawn on both faces — they taper from thick to thin and have a smoother surface. They install in a more regular, overlapping pattern and produce a flatter, more uniform appearance than shake. Cedar shingles are more commonly used on walls and lower-pitch roofs.\n\n**Cedar shake** is split (hand-split or machine-split) on one or both faces, producing an irregular, textured surface with natural variations in thickness. The rough face faces outward, creating the characteristic shadow depth and rustic texture associated with traditional American roofing. Hand-split-and-resawn shake has one rough split face and one sawn face — a common middle ground between full hand-split and sawn shingles.\n\nFor roofing applications, **hand-split-and-resawn shake** (Grade #1) is the standard specification. It should be Western Red Cedar — the industry-standard species for durability and rot resistance. Avoid lesser species sold as "cedar shake" unless sourced from a reputable manufacturer with documented species verification.`,
      },
      {
        heading: 'Mississippi\'s climate and wood roofing',
        body: `Western Red Cedar performs best in the Pacific Northwest — cool, moist, moderate-UV climate where the wood dries between rain events and temperatures don\'t drive accelerated biological activity. Mississippi\'s climate is almost the opposite: hot, high humidity, intense UV, and a biological environment that strongly favors fungal and algal growth.\n\n**The honest reality for Mississippi homeowners**: a wood shake roof that would last 30-40 years in Oregon or Montana will likely last 20-25 years in Northeast Mississippi with diligent maintenance — and as few as 12-15 years with minimal maintenance. The humidity keeps the wood perpetually damp, which promotes fungal degradation. The UV intensity bleaches and oxidizes the surface. Moss and algae establish quickly on north-facing slopes and shaded sections.\n\nThis doesn\'t make wood shake impossible in Mississippi, but it changes the calculus significantly. Homeowners considering wood roofing in this climate should enter the decision knowing the maintenance burden is real and the lifespan expectations are lower than what marketing materials from Pacific Northwest manufacturers tend to project.`,
      },
      {
        heading: 'Treatment options and fire ratings',
        body: `Raw cedar shake carries a **Class C fire rating** under ASTM E108 — meaning it provides some fire resistance but will eventually ignite and support combustion. Many Mississippi municipalities and insurers require Class A roofing materials, which raw shake does not meet.\n\n**Fire-Retardant Cedar Shake (FRSC)** is factory-treated with borate compounds or pressure-impregnated fire retardants that elevate the rating to Class A. FRSC is the only specification that should be used on new installations in most Mississippi jurisdictions. The treatment also provides some resistance to fungal decay, which helps longevity in humid climates.\n\nAlternatively, some homeowners specify **synthetic shake products** — polymer or composite materials that replicate the wood look with Class A fire ratings and better biological resistance. If you want the wood aesthetic without the maintenance burden, synthetic shake from manufacturers like Brava or DaVinci is worth pricing. The cost is similar to real shake but the maintenance requirements are dramatically lower.`,
      },
      {
        heading: 'Maintenance requirements in detail',
        body: `Wood shake roofing in Mississippi requires more active maintenance than any other roofing material. If you\'re not prepared to invest in this, another material is a better choice.\n\n**Annual cleaning**: Remove accumulated debris, leaves, and biological growth. Pressure washing at low PSI (no more than 1,500 PSI from distance) or hand-washing with a diluted cleaning solution. Aggressive pressure washing damages the surface — use a soft-wash approach.\n\n**Algae and moss control**: Apply a zinc sulfate or copper sulfate solution to prevent biological establishment. Zinc strips at the ridge release zinc oxide with every rain, creating a mild biocide that runs down the slope. Replace strips every 10-15 years.\n\n**Preservative treatment**: Apply a water-repellent wood preservative (containing a mildewcide) every 3-5 years to maintain the wood\'s moisture resistance. Products from TWP (Total Wood Preservative) or Defy are appropriate. This is the single most impactful maintenance action for extending service life.\n\n**Individual replacement**: Replace split, cupped, or severely degraded individual shakes as found during annual inspection. Spot repairs are straightforward for experienced contractors but require sourcing matching material — harder as the roof ages and the original shakes weather to a distinctive gray patina.`,
      },
      {
        heading: 'Installation requirements',
        body: `Wood shake installation has specific requirements that differ from asphalt installation. A proper installation includes:\n\n**Spaced sheathing (skip sheathing)**: Traditional shake installation uses spaced 1×4 or 1×6 boards spaced 1.5" apart to allow air circulation beneath the shake courses, helping the wood dry after rain. Modern installations often use solid sheathing with a ventilated underlayment system instead.\n\n**Interlayment felt**: 18" wide strips of 30-lb felt are woven between shake courses on solid sheathing installations, providing a redundant water management layer between courses.\n\n**Exposure and pitch requirements**: Shake requires a minimum 4:12 roof pitch for standard exposure. Lower pitches require reduced exposure and special underlayment systems.\n\n**Fastening**: Hot-dipped galvanized or stainless steel nails are required — electro-galvanized and common nails corrode from the tannic acid in cedar and cause premature failure. This is a common installation shortcut that dramatically shortens service life.\n\nThe quality of the installation matters enormously for wood roofing. An improperly installed shake roof fails years ahead of a correctly installed one. Verify that any contractor quoting wood shake uses the proper interlayment, fastener specification, and sheathing system.`,
      },
      {
        heading: 'When wood shake makes sense — and when it doesn\'t',
        body: `Wood shake makes the most sense in a specific set of conditions:\n\n**It makes sense when**: The architectural style genuinely calls for it (Craftsman bungalows, Arts and Crafts homes, New England-style capes), the homeowner is committed to the maintenance routine, the installation is in a relatively open, sun-exposed location that promotes drying, and the budget supports periodic professional cleaning and treatment.\n\n**It doesn\'t make sense when**: The primary driver is cost (comparable or more expensive than impact-resistant asphalt or synthetic shake), the home has significant tree canopy coverage that keeps the roof shaded and damp, the owner wants a low-maintenance material, or fire code requires Class A roofing that would necessitate FRSC-treated shake anyway (at which point synthetic shake becomes a direct comparison).\n\nFor most Mississippi homeowners replacing an aging wood shake roof, the honest recommendation is to evaluate synthetic shake alternatives seriously before committing to wood again. The aesthetic is close, the fire rating is Class A without treatment, the maintenance burden is minimal, and the lifespan is 40-50 years versus 20-25 in this climate. Contact Smart Roof Pricing and we\'ll walk you through the trade-offs for your specific home and situation.`,
      },
    ],
    msContext: `Wood shake has a long history in Mississippi residential architecture — Craftsman bungalows from the 1910s-1940s, classic Cape Cods, and early postwar housing stock often featured shake or shingle roofing as the original material. When these homes need re-roofing, the question of whether to match the original material or upgrade to a more durable option is legitimate.\n\nThe climate argument against wood shake in Mississippi is strong but not absolute. Homes in North Mississippi with good sun exposure — minimal tree canopy, southern or western roof orientation — and owners committed to annual maintenance can get 25+ years from a properly installed FRSC shake roof. Homes under heavy oak or pecan canopy in high-humidity areas near streams or in low-lying terrain are poor candidates; the biological pressure is too high.\n\nFor the Gulf Coast region — Biloxi through Pascagoula — wood shake is generally not recommended. The combination of salt-air humidity, hurricane-season wind exposure, and intense biological activity creates very unfavorable conditions for wood roofing longevity. The additional insurance scrutiny around non-Class-A materials in MWUA territory makes it doubly impractical.`,
    faqs: [
      {
        q: 'How long will a wood shake roof last in Mississippi?',
        a: 'With proper maintenance (annual cleaning, periodic preservative treatment, prompt repair of damaged shakes), expect 20-25 years from quality FRSC shake installed correctly. Without consistent maintenance, 12-15 years is realistic. This is significantly shorter than the 30-40 year lifespan often cited in Pacific Northwest roofing literature, because Mississippi\'s climate is more demanding on wood.',
      },
      {
        q: 'Is wood shake appropriate for a home with heavy tree canopy?',
        a: 'Heavy shade from overhanging trees dramatically accelerates wood shake degradation in Mississippi. Shaded sections stay damp for days after rain, which promotes fungal growth and rot. If significant tree trimming to open the roof to sun and air movement isn\'t practical, another material is a better choice. Synthetic shake handles shade and biological pressure much better than real wood.',
      },
      {
        q: 'What\'s the fire rating on wood shake?',
        a: 'Untreated cedar shake carries a Class C fire rating. Fire-Retardant Cedar Shake (FRSC) achieves Class A after pressure treatment. Many Mississippi municipalities and insurance policies require Class A roofing. If your jurisdiction requires Class A, you must specify FRSC or use a non-wood material. Verify local code requirements before pricing.',
      },
      {
        q: 'Can I install wood shake over my existing roof?',
        a: 'Most jurisdictions allow one overlay, but wood shake overlay over existing asphalt is generally not recommended. The organic material traps moisture against the old roof, accelerating biological degradation. A full tear-off to clean sheathing is the proper base for a wood shake installation.',
      },
      {
        q: 'Should I replace my old shake roof with new shake or switch materials?',
        a: 'For most Mississippi homeowners, switching to a more durable material makes better long-term sense. Impact-resistant asphalt, synthetic shake, or metal roofing will outlast real shake in Mississippi\'s climate with less maintenance and at competitive or lower installed cost. If the wood aesthetic is important, synthetic shake from Brava or DaVinci is worth pricing before committing to real wood again.',
      },
    ],
  },
]

export function getMaterialBySlug(slug: string): RoofingMaterial | undefined {
  return roofingMaterials.find((m) => m.slug === slug)
}

export function getAllMaterials(): RoofingMaterial[] {
  return roofingMaterials
}

export const MATERIAL_COMPARISON = [
  {
    name: 'Asphalt (Architectural)',
    lifespan: '25-30 yrs',
    cost: '$4.50-6.50',
    wind: 'Class H (110 mph)',
    hail: 'Class 1-2',
    maintenance: 'Annual',
    bestFor: 'Most budgets',
    href: '/roofing-materials/asphalt-shingles',
  },
  {
    name: 'Class 4 Impact Shingles',
    lifespan: '30-40 yrs',
    cost: '$6.00-9.00',
    wind: 'Class H-G (110-130 mph)',
    hail: 'Class 4',
    maintenance: 'Annual',
    bestFor: 'Insurance discount',
    href: '/roofing-materials/impact-resistant-shingles',
  },
  {
    name: 'Standing Seam Metal',
    lifespan: '40-70 yrs',
    cost: '$10-18',
    wind: '140-160 mph',
    hail: 'Steel hardness',
    maintenance: 'Every 3-5 yrs',
    bestFor: 'Long-term owners',
    href: '/roofing-materials/metal-roofing',
  },
  {
    name: 'Metal Shingles',
    lifespan: '40-50 yrs',
    cost: '$8-14',
    wind: '130+ mph',
    hail: 'Steel hardness',
    maintenance: 'Every 3-5 yrs',
    bestFor: 'Metal look, asphalt price',
    href: '/roofing-materials/metal-roofing',
  },
  {
    name: 'Luxury Asphalt',
    lifespan: '30-50 yrs',
    cost: '$8-12',
    wind: 'Class H (110 mph)',
    hail: 'Class 2-4 (varies)',
    maintenance: 'Annual',
    bestFor: 'High-end aesthetics',
    href: '/roofing-materials/asphalt-shingles',
  },
  {
    name: 'Copper / Zinc',
    lifespan: '50-100 yrs',
    cost: '$25-40',
    wind: 'Excellent',
    hail: 'Excellent',
    maintenance: 'Minimal',
    bestFor: 'Prestige / historic',
    href: '/roofing-materials/metal-roofing',
  },
  {
    name: 'Synthetic Shingles',
    lifespan: '40-50 yrs',
    cost: '$8-14',
    wind: '110-130+ mph',
    hail: 'Class 4 (most lines)',
    maintenance: 'Every 3-5 yrs',
    bestFor: 'Slate/shake look',
    href: '/roofing-materials/synthetic-shingles',
  },
  {
    name: 'Clay / Concrete Tile',
    lifespan: '50-100+ yrs',
    cost: '$15-30',
    wind: '125-150 mph',
    hail: 'Moderate (brittle)',
    maintenance: 'Every 5-10 yrs',
    bestFor: 'Mediterranean style',
    href: '/roofing-materials/clay-tile-roofing',
  },
  {
    name: 'Cedar Shake',
    lifespan: '20-30 yrs (MS)',
    cost: '$7-12',
    wind: 'Moderate',
    hail: 'Low (splits)',
    maintenance: 'Annual',
    bestFor: 'Craftsman / cottage',
    href: '/roofing-materials/wood-shake-roofing',
  },
]
