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
        a: "Most building codes allow one layer of shingles over an existing layer. The reason to avoid it: you can't inspect the deck condition, you're adding weight that stresses the structure, and the irregular surface underneath causes the new shingles to not seat flat. When issues develop under the new layer, you pay to remove both layers. A full tear-off costs $1-2/sq ft more upfront and is almost always the correct choice for a long-term replacement.",
      },
      {
        q: "What's the difference between a 25-year and a 30-year shingle warranty?",
        a: "The warranty period refers to the manufacturer's coverage, but the practical difference between a 25-year and 30-year shingle is usually the product tier, not just the warranty length. Higher-tier shingles that carry 30-year (or 50-year) warranties are thicker, use more asphalt, and have better granule adhesion — the longer warranty reflects a genuinely better product, not just marketing. Always read what the warranty actually covers: 'limited' warranties have prorated coverage after the first 5-10 years.",
      },
      {
        q: 'Will new shingles raise or lower my home insurance premium?',
        a: "A new roof typically has a modest positive effect on insurance premiums — most carriers give some credit for a recently replaced roof (under 10 years old). The bigger premium impact comes from material choice: Class 4 impact-resistant shingles qualify for explicit discount programs from most major carriers in Mississippi, with discounts ranging from 10-30% of the roof coverage component. The discount calculation varies by carrier and policy — ask your agent specifically about impact-resistant shingle credits before finalizing your material choice.",
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
        a: "Yes, typically. A standing seam metal roof is perceived as a premium upgrade by buyers in the residential market, and its presence on a listing typically reduces buyer concerns about roof condition and upcoming capital expenditures. The value increase is rarely dollar-for-dollar with the installation cost premium over asphalt, but buyers do factor it positively — particularly in markets where storm damage claims are common.",
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
]
