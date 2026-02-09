---
tags:
- setfit
- sentence-transformers
- text-classification
- generated_from_setfit_trainer
widget:
- text: a 4 piece Sleepy Time Gift Set for infants that includes a bodysuit, lap-shoulder
    tee, hat, and a door hanging pillow
- text: a men's jacket and pair of pants made from laminated fabric consisting of
    94% polyester and 6% spandex, bonded to an inner layer of 100% polyester knit
    pile fabric
- text: a cast iron end block component used in snow plows for light and medium duty
    pick-up trucks
- text: spherical glass lenses, glass aspherical lenses, plastic aspherical lenses,
    and collimator lenses
- text: '3-Fluoroaniline, CAS # 372-19-0, imported in bulk form from China'
metrics:
- accuracy
pipeline_tag: text-classification
library_name: setfit
inference: true
base_model: sentence-transformers/all-MiniLM-L6-v2
---

# SetFit with sentence-transformers/all-MiniLM-L6-v2

This is a [SetFit](https://github.com/huggingface/setfit) model that can be used for Text Classification. This SetFit model uses [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) as the Sentence Transformer embedding model. A [LogisticRegression](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html) instance is used for classification.

The model has been trained using an efficient few-shot learning technique that involves:

1. Fine-tuning a [Sentence Transformer](https://www.sbert.net) with contrastive learning.
2. Training a classification head with features from the fine-tuned Sentence Transformer.

## Model Details

### Model Description
- **Model Type:** SetFit
- **Sentence Transformer body:** [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- **Classification head:** a [LogisticRegression](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html) instance
- **Maximum Sequence Length:** 256 tokens
- **Number of Classes:** 498 classes
<!-- - **Training Dataset:** [Unknown](https://huggingface.co/datasets/unknown) -->
<!-- - **Language:** Unknown -->
<!-- - **License:** Unknown -->

### Model Sources

- **Repository:** [SetFit on GitHub](https://github.com/huggingface/setfit)
- **Paper:** [Efficient Few-Shot Learning Without Prompts](https://arxiv.org/abs/2209.11055)
- **Blogpost:** [SetFit: Efficient Few-Shot Learning Without Prompts](https://huggingface.co/blog/setfit)

### Model Labels
| Label | Examples                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|:------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 8477  | <ul><li>'a horizontal injection molding machine and molds for producing rubber parts'</li><li>'an injection molding machine designed to produce thermoplastic soles and attach them to pre-manufactured uppers'</li><li>'a shredder-feeder-extruder combination machine designed for recycling plastic waste'</li></ul>                                                                                                                                                                                                                                                                                                           |
| 6111  | <ul><li>'an infant and toddler shirt made of 100% cotton with a square neckline, shoulder straps, flower appliqué, flared body, empire waist, and a three snap back closure'</li><li>"infants' knit garments consisting of a shirt, pants, and booties made from cotton and polyester"</li><li>'an infant boys upper body garment made from 88% cotton and 12% polyester, featuring a hood, zipper closure, long sleeves with rib-knit cuffs, a rib-knit waistband, a shirt-type chest pocket, and an oversized elephant appliqué'</li></ul>                                                                                      |
| 2922  | <ul><li>'L-Lysine HCL (CAS# 657-27-2) from China'</li><li>'P-Hydroxyphenylglycine, CAS 122-87-2'</li><li>'Metipranolol, an antihypertensive drug in bulk form'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 3904  | <ul><li>'polyvinylchloride (PVC) powder used in the automotive industry for manufacturing faux leather products'</li><li>'perfluoro(methyl vinyl ether)-tetrafluoroethylene-vinylidene fluoride polymer (CAS-56357-87-0)'</li><li>'a polyvinyl chloride resin blend containing 43-50% polyvinyl chloride, 34-45% plasticizer, and 4-13% methacrylo-nitrile-polymethacrylate'</li></ul>                                                                                                                                                                                                                                            |
| 3912  | <ul><li>'polyvinylchloride (PVC) powder used in the manufacture of faux leather products for automotive interiors'</li><li>'polyethylene terephthalate (PET) resin and PET-glycol resin'</li><li>'Hydroxypropyl methylcellulose (CAS-9004-65-3), in powdered form, from Japan'</li></ul>                                                                                                                                                                                                                                                                                                                                          |
| 8402  | <ul><li>'Heat Recovery Steam Generator (HRSG) parts including steam drums, exhaust stack, module boxes, and inlet duct panel assemblies'</li><li>'casing panels, dampers, and trusses for a heat recovery steam generator'</li><li>'a pipe spool with a high pressure steam stop and an attached valve, used as part of a heat recovery steam generator (HRSG)'</li></ul>                                                                                                                                                                                                                                                         |
| 2916  | <ul><li>'(S)-(+)-2-Phenylpropionic Acid, CAS No. 492-37-5'</li><li>'Tetrolic acid, an unsaturated acyclic monocarboxylic acid used as a pharmaceutical intermediate'</li><li>'2-Methyl-3-nitrobenzoic acid'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                             |
| 8501  | <ul><li>'a non-synchronous, DC-brushless motor designed to operate motorized advertising displays'</li><li>'an electric video camera platform designed to pan and tilt video cameras'</li><li>'D.C. Motors used in electric vehicles'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                   |
| 2826  | <ul><li>'Lithium bis(fluorosulfonyl)imide (CAS NO. 171611-11-3), a solid white inorganic compound used as an electrolyte additive for lithium-ion batteries'</li><li>'Lithium Fluoroborate (CAS # 14283-07-9)'</li><li>'Lithium Hexafluorophosphate'</li></ul>                                                                                                                                                                                                                                                                                                                                                                    |
| 6108  | <ul><li>"a women's full-length slip made of 80% nylon and 20% spandex with a built-in bra and adjustable straps"</li><li>"a pair of women's boy leg hipster-styled underpants constructed of 100% cotton rib knit fabric"</li><li>"women's knit pajamas made from 100% polyester knit fabric, featuring a rib-knit round neckline, long sleeves with rib knit cuffs, a zipper closure from neck to lower abdomen, and hemmed leg openings with rib knit cuffs, available in various designs such as plaid, single color, Christmas scenes, dogs, cats, and camo"</li></ul>                                                        |
| 8426  | <ul><li>'an overheight frame attachment from Malaysia'</li><li>'an unfinished mobile crane from Mexico'</li><li>'an overhead traveling crane used to move heavy machinery and coils of aluminum strip within a plant'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                   |
| 7411  | <ul><li>'seamless copper tubes from Vietnam'</li><li>'brass thin welded tubes used in the manufacture of automobile radiators'</li><li>'brass tubes and pipes of copper-zinc base alloys (brass), seamless'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                             |
| 7318  | <ul><li>'aviation industry fasteners such as screws and bolts used in helicopters'</li><li>'a steel flanged hex head bolt'</li><li>'a variety of items used for hanging plants, including tie-wire nails, hanging wire, plant hanger clips, and screw hooks'</li></ul>                                                                                                                                                                                                                                                                                                                                                            |
| 6102  | <ul><li>"a women's knit cape made from 100% wool"</li><li>"a women's knitted coat made of 51% acrylic, 33% wool, and 16% other knitted fabric, featuring a rib-knit standup collar, long sleeves with rib-knit cuffs, a full frontal opening with a zipper closure, two lined side pockets, and a rib-knit bottom"</li><li>"a women's thigh-length coat made from laminated fabric with a polyester and elastane blend, featuring a hood, zippered pockets, and an inner bib"</li></ul>                                                                                                                                           |
| 4911  | <ul><li>'offset printing posters'</li><li>'View-Master Virtual Reality Experience Packs'</li><li>'offset printing posters'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 8536  | <ul><li>'a probe card used in electrical wafer testing'</li><li>'Solder Sleeve Shield Terminations'</li><li>'a Mini Probe Pin used in semiconductor testing'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 8423  | <ul><li>'a knife edge lever clamp, crucible tongs, a wooden handle teasing needle, a tubular spring scale, pulleys, a knife switcher, and banana plugs with alligator clips'</li><li>'a Weigh and Display System used in the waste transportation industry'</li><li>'a digital kitchen scale'</li></ul>                                                                                                                                                                                                                                                                                                                           |
| 6103  | <ul><li>'a toddler boys apparel set consisting of a t-shirt, pants, and a padded vest'</li><li>"men's knit pants constructed from a bonded fabric with an outer layer of nylon, a neoprene middle layer, and an inner layer of polyester knit pile fabric, designed for kayaking and boating activities"</li><li>"boys' boxer shorts made from knit and woven fabrics"</li></ul>                                                                                                                                                                                                                                                  |
| 8431  | <ul><li>'hammer lock unions'</li><li>'a metal tapered stress joint designed for use in a Production Riser System connecting offshore floating production platforms to a subsea system for oil and gas extraction'</li><li>'wireline drill rods used in diamond core exploration drilling'</li></ul>                                                                                                                                                                                                                                                                                                                               |
| 8481  | <ul><li>'a Yard Hydrant Assembly - Corrosion Resistant'</li><li>'a solar pumping station used to control the temperature of fluid flow within a hydronic heating system'</li><li>'a programmable water timer, watering nozzles, and a garden watering sprinkler system'</li></ul>                                                                                                                                                                                                                                                                                                                                                 |
| 3926  | <ul><li>'a silicone handguard designed to allow users to touch doorknobs and elevator buttons without direct contact'</li><li>'acrylic powder, sheets, sinks, vanity tops, and lavatory bowls made of Corian from Germany'</li><li>'plastic clothes hangers'</li></ul>                                                                                                                                                                                                                                                                                                                                                            |
| 3925  | <ul><li>'Polycore window shutters made of plastic and reinforced with aluminum'</li><li>'sheer vertical kits used as window coverings'</li><li>'a pleated or accordion window shade made of PVC and polyethylene plastic sheeting with calcium carbonate filler'</li></ul>                                                                                                                                                                                                                                                                                                                                                        |
| 8203  | <ul><li>'wire rope cutter and steel strap cutter'</li><li>'a brow grooming set consisting of a stainless steel tweezer, a plastic and nylon mascara wand, and a polyurethane storage sleeve, packaged for retail sale'</li><li>'a 6PC Precision Pick and Tweezer Set containing a straight pick, three hooks bent at various angles, and two precision tip tweezers'</li></ul>                                                                                                                                                                                                                                                    |
| 9015  | <ul><li>'an airborne digital sensor system designed for aerial surveying and mapping applications'</li><li>'the Procom-2 instrument and its associated modules'</li><li>'a WINDCUBE lidar remote sensor designed for wind measurement'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                  |
| 3903  | <ul><li>'clear, non-expandable Polystyrene resin in pellet form'</li><li>'ASACLEAN E, EG, EX, SA, SV, and SX in pellet form used as purging compounds for plastic injection-molding machines and extruders'</li><li>'styrene-maleic anhydride (SMA), CAS #9011-13-6'</li></ul>                                                                                                                                                                                                                                                                                                                                                    |
| 7307  | <ul><li>'cast carbon steel fittings made to ASTM A216 specification, comprised of two flanges connected with three nuts and bolts, used for connecting pipes'</li><li>'ductile iron bolt rings and stainless steel bolt rings used in conjunction with HDPE flange adaptors'</li><li>'Bi-Lok pipe fittings, specifically the components including a 3/4 nut (DNA 12 SS), a bulk nut (DNN 6 SS), and a back ferrule (DOB 8 SS)'</li></ul>                                                                                                                                                                                          |
| 3923  | <ul><li>'character-shaped plastic bottles and decorative heads in the form of non-human Sesame Street characters'</li><li>'double sided tape made from various materials including plastics, paper, and cloth'</li><li>'flexible packaging bags, retort pouches, tubular shrink sleeves, and plastic film made of various plastics'</li></ul>                                                                                                                                                                                                                                                                                     |
| 3920  | <ul><li>'polyvinyl fluoride film used for decorative purposes in window or exterior products industries'</li><li>'rigid polyvinyl chloride (PVC) sheets imported on rolls, with widths of 2, 3, and 4 inches, lengths of approximately 2400 feet, and thicknesses of 3 mil and 6 mil, having a modulus of elasticity exceeding 240,000 psi'</li><li>'a thin edible protein film made from cattle hide collagen, imported in rolls'</li></ul>                                                                                                                                                                                      |
| 7606  | <ul><li>'aluminum sheets used in the manufacture of air fins for heat exchangers'</li><li>'aluminum slats for use in a privacy fence'</li><li>'aluminum sheets used in the manufacture of air fins for heat exchangers'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                 |
| 6104  | <ul><li>"two-piece women's knit ensembles made of 100% cotton, consisting of a jacket and trousers, and a pullover with trousers"</li><li>"women's knit pants made of 95% cotton and 5% elastane, featuring a fabric-covered elasticized waistband, two faux front pockets, a faux front fly, two rear patch pockets, and unfinished leg openings"</li><li>"a women's sleeveless pullover made of man-made fibers with a rib knit collar and vented rib knit bottom"</li></ul>                                                                                                                                                    |
| 6216  | <ul><li>"women's gardening gloves made of various materials"</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 8414  | <ul><li>'refurbished automotive air conditioning compressors'</li><li>'an air compressor part known as the Main Line Body, part number 4562-6000, used in automotive air conditioning systems'</li><li>'a battery-operated plane fan with lights'</li></ul>                                                                                                                                                                                                                                                                                                                                                                       |
| 4202  | <ul><li>'handbags made of vegetable fibers'</li><li>'mini-backpacks made of woven polyester fabric with adjustable shoulder straps and multiple compartments'</li><li>'a messenger bag constructed with an outer surface of 100% nylon textile material, featuring a textile-lined interior, a full frontal flap secured with hook-and-loop fasteners, a zippered pocket under the flap, and a permanently attached adjustable shoulder strap'</li></ul>                                                                                                                                                                          |
| 3902  | <ul><li>'synthetically produced Superchlon CR-10 from Japan'</li><li>'four grades of Dutral, namely, PM 05 PLP, PM 07 PLP, PM 08 PLP, and PM 09 PLP'</li><li>'Hoechst Wax PP 230, a polypropylene polymer in coarse powder and irregular-shaped chunks'</li></ul>                                                                                                                                                                                                                                                                                                                                                                 |
| 8409  | <ul><li>'a valve seal - positive type designed for internal combustion engines'</li><li>'pistons and piston crowns used in heavy duty diesel applications'</li><li>'a Long Block engine sub-assembly used in off-road applications'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                     |
| 8205  | <ul><li>'ice augers and blades used for cutting holes through ice'</li><li>'sledge hammers manufactured in Vietnam'</li><li>'a handheld tool that inserts pegs into walls for hanging objects, featuring a spring-loaded mechanism, a built-in bubble level, and a compartment for storing extra pegs and hooks'</li></ul>                                                                                                                                                                                                                                                                                                        |
| 3905  | <ul><li>'polyvinyl alcohol CAS-9002-89-5'</li><li>'carboxylated polyvinyl alcohol in granular powder form'</li><li>'ethylene vinyl acetate copolymer (CAS 24937-78-8) powder from Taiwan'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 9021  | <ul><li>'dental drills and related instruments used in dental implant procedures'</li><li>'imported blank assemblies of Behind the Ear (BTE) hearing aids'</li><li>'the Aspen Surgical Set used for spinal fusion'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                      |
| 8215  | <ul><li>'a 3-piece cutlery set containing 1 knife, 1 fork, and 1 spoon made of stainless steel with plastic handles'</li><li>'a set of cheese knives and cheese spreaders'</li><li>'an ice cream scoop made of zinc alloy with a plastic covered handle'</li></ul>                                                                                                                                                                                                                                                                                                                                                                |
| 9027  | <ul><li>'printed circuit board assemblies designed for use with the BiliDX diagnostic testing device'</li><li>'a header expander and slip table assemblies from the United Kingdom'</li><li>'a urine sediment analyzer used in the veterinary field that performs chemical analysis of urine samples'</li></ul>                                                                                                                                                                                                                                                                                                                   |
| 6110  | <ul><li>"a men's cardigan made from jersey knit fabric with a fiber content of 60% cotton and 40% modal, featuring a full front opening with button closures, rib knit collar, long sleeves, and rib knit cuffs"</li><li>"a men's sweater made from 100% cotton, featuring a rib knit crew neckline, long sleeves with rib knit cuffs, and a rib knit bottom, constructed from double knit fabric"</li><li>"a women's pullover made of 100% cashmere knit fabric with a turtle neck and rib knit cuffs"</li></ul>                                                                                                                 |
| 3402  | <ul><li>'a nonaromatic surface active agent in an organic solvent'</li><li>'powdered chemical preparations intended as additives in skin care products, color cosmetics, bath and shower products, antiperspirants, and deodorants'</li><li>'Resassol VS, an organic surface-active agent from Italy'</li></ul>                                                                                                                                                                                                                                                                                                                   |
| 9803  | <ul><li>'stainless steel beer kegs used in international traffic'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 6114  | <ul><li>"girls' knit undergarments including camisoles, panties, and a crop top made from nylon and cotton"</li><li>'girls and ladies dancewear from China'</li><li>'infant and toddler changing kits containing clothing and cleaning wipes'</li></ul>                                                                                                                                                                                                                                                                                                                                                                           |
| 7312  | <ul><li>'a stainless steel wire shock cord used for agricultural electric fencing and gates'</li><li>'steel pipes, tapered pipes, and pipe fittings used in concrete pumping equipment'</li><li>'various steel pipes and fittings used in the installation of wires and cables'</li></ul>                                                                                                                                                                                                                                                                                                                                         |
| 8482  | <ul><li>'a double shielded radial ball bearing approximately 13 mm in outside diameter with a slightly flanged outer ring'</li><li>'plastic thrust washers, metal thrust washers, CVJ washers, and outer races for roller bearings'</li><li>'assorted plastic components used in photographic developing equipment'</li></ul>                                                                                                                                                                                                                                                                                                     |
| 9001  | <ul><li>'plastic optical fiber products used for various applications including sensor media and data transmission'</li><li>'Lenses and Dichroic Mirrors from Japan'</li><li>'mirror lenses for automobile rearview mirrors'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                            |
| 3918  | <ul><li>'Engineered MgO vinyl plank flooring'</li><li>'rigid polyvinyl chloride (PVC) click flooring planks from China'</li><li>'interlocking foam tiles made from ethylene vinyl acetate (EVA) plastic foam'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                           |
| 7229  | <ul><li>'alloy steel Metal Inert Gas (MIG) welding wire with a bronze or gold colored coating suitable for electric arc welding'</li><li>'alloy steel Metal Inert Gas (MIG) welding wire with a proprietary bronze colored alloyed coating'</li><li>'Thyssen Elastochrome Wire used in the manufacturing of electric furnace heating elements'</li></ul>                                                                                                                                                                                                                                                                          |
| 4016  | <ul><li>'grill torches, a bottle stand, and an adaptor hose'</li><li>'parts of swivel joint pipe fittings, including Grade 200 alloy steel balls, a ball retainer made of nitrile rubber, and a stainless steel retainer ring'</li><li>'SCOTSEAL Classic and SCOTSEAL XL automotive components'</li></ul>                                                                                                                                                                                                                                                                                                                         |
| 3921  | <ul><li>'an imitation leather fabric for use in automotive upholstery'</li><li>'a polyethylene plastics laminated nonwoven fabric used in the manufacture of boat covers'</li><li>'Propipack, a laminated packaging material composed of aluminum foil, polypropylene, and polyethylene'</li></ul>                                                                                                                                                                                                                                                                                                                                |
| 8516  | <ul><li>'an electric coffee, tea, and chocolate maker designed for household use'</li><li>'a Hot Dog Toaster'</li><li>'HiLight Radiant Heating Elements used in electric ranges and stoves'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 8202  | <ul><li>'a 14-Piece Hole Saw Kit assembled in Vietnam with components from Vietnam and China'</li><li>'a Combination Hand Axe/Saw'</li><li>'a handsaw with a plastic handle and a battery-operated laser for guidance while cutting'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                    |
| 8207  | <ul><li>'items used for hobby maple syrup production, including a HSS Twist Drill Bit, a plastic elbow fitting (spout), LDPE tubing, a paper cone filter, and recipe cards'</li><li>'a coning tool kit and a coning and threading tool kit that includes various interchangeable tools for metalworking'</li><li>'a door lock installation kit that includes various tools for installing locks in wood, fiberglass, and metal doors'</li></ul>                                                                                                                                                                                   |
| 8403  | <ul><li>'wood fired hot water boilers'</li><li>'oil-fired boiler heating systems for ships'</li><li>'a wood chip fired central heating boiler'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 7320  | <ul><li>'springs used in agricultural machinery'</li><li>'an iron cam spring used in an automobile electrical switch that controls lights and wipers'</li><li>'iron wire springs used in seats or sofas'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                |
| 7304  | <ul><li>'hot finished, seamless, carbon steel tubing/pipe with various dimensions used in mechanical applications'</li><li>'galvanized steel pipe intended for use in the manufacture of stamping presses'</li><li>'seamless stainless steel coiled tubing used to distribute hydraulic fluids and chemicals in subsea umbilicals'</li></ul>                                                                                                                                                                                                                                                                                      |
| 7323  | <ul><li>'a cast iron birdfeeder'</li><li>'stainless steel saut pans with a fluoropolymer non-stick finish available in eight inch and ten inch diameters'</li><li>'a set of stainless steel saucepans, a stainless steel egg separator, and a set of steel whiskettes'</li></ul>                                                                                                                                                                                                                                                                                                                                                  |
| 8483  | <ul><li>'irrigation system parts including a ground sprinkler, MPR nozzle, adjustable arc nozzle, and electric solenoid valves'</li><li>'individual gears for motorcycle engines and transmissions'</li><li>'a cross axis joint used to create a joint between two moving components, allowing for load transfer while permitting rotation and oscillation'</li></ul>                                                                                                                                                                                                                                                             |
| 8487  | <ul><li>'grease valve/grease fitting used in all terrain vehicles (ATVs)'</li><li>'exhaust silencers'</li><li>'locking collars used to secure bearings to shafts'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2917  | <ul><li>'Glutaric Acid derived from cyclopentanone'</li><li>'methacrylic acid, 2-hydroxyethyl succinic acid, and acrylic acid, 2-hydroxy ethyl succinic acid from Japan'</li><li>'Sebacic Acid (CAS # 111-20-6) from China'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                             |
| 3922  | <ul><li>'plastic foot baths for cows'</li><li>'an inflatable foot bath made of PVC plastic with a detachable cotton wash cloth sized towel'</li><li>'a steam shower cabin made of fiberglass reinforced plastics with attached walls and door, featuring built-in accessories such as multiple shower sprays, exhaust fan, steam controls, light, speaker, and radio'</li></ul>                                                                                                                                                                                                                                                   |
| 8201  | <ul><li>'a Tiller Mattock'</li><li>'a 13 piece garden tool set that includes various tools such as a hand rake, pruners, shears, and a carrying case'</li><li>'pointed weed poppers used in agriculture, horticulture, or forestry'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                     |
| 2933  | <ul><li>'Omeprazole, Albendazole USP, and Phentermine Hydrochloride USP in bulk form'</li><li>'N-(4-Pyridinyl) Piperazine'</li><li>'Phenyl Piperazine Base (CAS 92-54-6)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 3204  | <ul><li>'Pigment Green 36 (Green 2)'</li><li>'fluorescent brightening agent W-3 (CAS 34233-64-2)'</li><li>'a synthetic organic colorant known as Lionel Blue ES, produced in Japan with raw materials from China and Japan'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                             |
| 8461  | <ul><li>'a CNC Vertical Turning Machine and multistation transfer machines for working metal'</li><li>'small machine tools including lathes, jigsaws, and milling machines for hobbyists'</li><li>'laundry cleaning machinery from Italy'</li></ul>                                                                                                                                                                                                                                                                                                                                                                               |
| 9019  | <ul><li>'a Pedicure Spa'</li><li>'Circulation Booties designed to soothe muscle fatigue and calm tired legs, powered by an AC adaptor, and featuring inflatable components for a massaging effect'</li><li>'a massaging micro-bead-filled pillow that operates with a battery-powered motor for soothing and vibrating massage comfort'</li></ul>                                                                                                                                                                                                                                                                                 |
| 8515  | <ul><li>'a lightweight, cordless sealer powered by four size AA batteries, used primarily in the home to seal plastic bags by the application of heat'</li><li>'computerized semi-automatic drawn arc stud welding machinery'</li><li>'a bar magnet from China'</li></ul>                                                                                                                                                                                                                                                                                                                                                         |
| 2926  | <ul><li>'3-Bromo-5-methoxybenzonitrile, a halogenated derivative of an aromatic nitrile-function compound used as a pharmaceutical intermediate'</li><li>'4-Cyanoacetophenone, CAS # 1443-80-7'</li><li>'Isophthalodinitrile, CAS 626-17-5'</li></ul>                                                                                                                                                                                                                                                                                                                                                                             |
| 7216  | <ul><li>'hot-rolled carbon steel wide flange beams'</li><li>'finished parts of a trailer landing gear made from hot-rolled, cold-finished nonalloy steel'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 9030  | <ul><li>'protector breakdown test sets'</li><li>'a Two-Way Satellite Simulator'</li><li>'a Mobile Test Platform used for testing telecommunication performance of mobile chips'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 7407  | <ul><li>'flat copper strips with a grooved surface used for manufacturing segments or shells for electrical motors'</li><li>'tubing made from 99.9% copper, circular on the inside with an octagon shaped exterior, imported in 12-foot lengths, used to manufacture industrial fittings'</li><li>'copper T-bars and flat strips from Germany'</li></ul>                                                                                                                                                                                                                                                                          |
| 8441  | <ul><li>'vinyl flooring packaging machinery'</li><li>'paper folding machines'</li><li>'a mill roll stand used to supply paper for drywall production'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8716  | <ul><li>'Self-Unloading Timber Cart attachment for the Iron Horse timber hauler'</li><li>'a diesel-powered mobile generating set mounted in intermodal containers'</li><li>'tow dollies and trailers designed to transport automobiles and other equipment'</li></ul>                                                                                                                                                                                                                                                                                                                                                             |
| 2902  | <ul><li>'M-Xylene (CAS 108-38-3) used as a pharmaceutical intermediate'</li><li>'refined naphthalene with a crystallization point of 80.1 degrees Celsius'</li><li>'benzene (99% minimum purity) from Turkey'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                           |
| 6113  | <ul><li>"men's and boys' knit wearing apparel including polo shirts, T-shirts, pullovers, and sweatshirts made from cotton and polyester blends"</li><li>'a unisex immersion suit made of neoprene sheeting laminated with knit fabric, designed for use in emergency situations, covering the head, body, hands, and feet, and including features like an inflatable head support and reflective strips'</li><li>"a woman's hip-length jacket made of 100% cotton fabric with a visible polyurethane lamination"</li></ul>                                                                                                       |
| 2932  | <ul><li>'R-Mecamylamine salt and S-Mecamylamine salt from Italy and Phthaladine acetic acid from France'</li><li>'2,3-Benzofuran (Chemical Name - Coumarone)'</li><li>'Heliogan, Amberonne, and P-Anisaldehyde'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                         |
| 8476  | <ul><li>'a golf ball dispenser used at driving ranges'</li><li>'a rear chuck sleeve for a power drill'</li><li>'an automatic vending machine that mixes and dispenses hot beverages such as coffee, cappuccino, and hot chocolate'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                      |
| 9004  | <ul><li>'folding reading glasses with a hinged case'</li><li>'a Camera & Foam Goggles Combo consisting of a 35mm camera and foam goggles'</li><li>'swim goggles made of polycarbonate and silicone materials'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                           |
| 8507  | <ul><li>'a SENCO PowerPlus (6-in-1 rechargeable jump start system)'</li><li>'a rechargeable lead-acid battery cell designed for use in industrial storage battery systems'</li><li>'a rechargeable sealed lead acid battery used in a toy motorcycle'</li></ul>                                                                                                                                                                                                                                                                                                                                                                   |
| 8473  | <ul><li>'a tablet personal computer enclosure, docking station, a Radio-Frequency Identification (RFID) Fob, and a kiosk'</li><li>'a sapphire window assembly used in a supermarket point of sale terminal'</li><li>'a hand-held bar code scanner model LS 2000II'</li></ul>                                                                                                                                                                                                                                                                                                                                                      |
| 2910  | <ul><li>'S-epichlorohydrin (CAS # 67843-74-7)'</li><li>'(S)-(+)-Epichlorohydrin and (R)-(-)-Epichlorohydrin'</li><li>'Epichlorohydrin, CAS # 106-89-8, in bulk form, from Russia'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 6109  | <ul><li>"men's and women's knit T-shirts made of 100% polyester"</li><li>"men's knit T-shirts made of 100% cotton"</li><li>"a men's training tee made from 100% polyester, finely knit jersey fabric, featuring a crew neckline, short hemmed sleeves, and a straight hemmed bottom"</li></ul>                                                                                                                                                                                                                                                                                                                                    |
| 8447  | <ul><li>'a circular knitting machine designed primarily for the automotive industry, specifically the Albi APL-2 GT model, which produces high-quality plush fabrics'</li><li>'circular knitting machines for knitting hosiery with a cylinder diameter not exceeding 165 mm'</li><li>'a YARDMAX 26" two-stage, self-propelled gas snowblower, model number YB6770'</li></ul>                                                                                                                                                                                                                                                     |
| 2836  | <ul><li>'a Bath and Shower Bomb Kit'</li><li>'Barium carbonate'</li><li>'a disposable polyamide/polyethylene bag filled with sodium bicarbonate powder, used in hemodialysis'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2841  | <ul><li>'Potassium Permanganate'</li><li>'Potassium Permanganate'</li><li>'Ammonium Metavanadate (AMV), Vanadium Pentoxide, Vanadium(III) Oxide, and Vanadium Electrolyte'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 7302  | <ul><li>'sandwich tie plates used in light rail systems'</li><li>'used alloy steel railway rails for rerolling'</li><li>'sandwich tie plates used in light rail systems'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 8411  | <ul><li>'a Rolls Royce A250/C20 Engine'</li><li>'control rods and control rod assemblies used in aircraft engines'</li><li>'Rolls Royce A250/C20 Engine, Rolls Royce B17 Engine, and Rolls Royce KS4 Engine'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2904  | <ul><li>'nitromethane (98.5 percent minimum purity) from China'</li><li>'sodium xylene sulfonate (CAS#1300-72-7) from Turkey'</li><li>'1-Napthalenesulfonic Acid Sodium Salt'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 9010  | <ul><li>'a photographic enlarging machine that scans, corrects, enlarges, and prints photographs from developed negatives'</li><li>'Fresnel Screen and Lenticular Screen used in rear projection televisions'</li><li>'a JOBO CPP-3 photographic film processing unit'</li></ul>                                                                                                                                                                                                                                                                                                                                                  |
| 9031  | <ul><li>'Nidek Flatness Tester Models FT-11, FT-12, FT-3D, FT-900 and Himec Wafer Cassette Inspection Machine Model CA-008A'</li><li>'precision force transducers used in materials testing machines'</li><li>'a device designed for asset tracking that uses GNSS for location, includes a three-axis accelerometer, and communicates via LoRaWAN connectivity'</li></ul>                                                                                                                                                                                                                                                        |
| 8415  | <ul><li>'Heat Pump and Air Handler units from China'</li><li>'remanufactured automotive air-conditioning compressors'</li><li>'refrigerant hose assemblies used in automotive air conditioning systems'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 8471  | <ul><li>'an All-In-One PC with accessories'</li><li>'solid state storage drive (SSD) models: SF 2405, SF 4805, SF 9010, and SF 9605, with 64 GB, 128 GB, 256 GB, and 256 GB of system memory, used for data storage and recovery in a storage cluster'</li><li>'a fully functional automatic data processing machine designed to be used with an exercise machine, equipped with a processor, memory, storage, wireless connectivity, touchscreen display, and capable of controlling exercise machine functions'</li></ul>                                                                                                       |
| 7415  | <ul><li>'a brass stud or tie rod, with silver plating, used as the main support post for an anti-collision light assembly in a twin-engine commuter plane'</li><li>'a Well-Nut threaded insert'</li><li>'a fastening set used to hold down bathroom toilets, including copper T-head closet bolts, steel zinc plated washers, steel zinc plated acorn nuts, and plastic lock washers'</li></ul>                                                                                                                                                                                                                                   |
| 8212  | <ul><li>'diskette manufacturing equipment including a shutter press, uncoiler, roll leveler, auto reel, and metal molds'</li><li>'a Survivor Pak containing a hunting knife, a multi-purpose tool, a flashlight, a monocular, and a compass in a fitted pouch'</li><li>'a styling razor set consisting of a styling razor, a package of 10 styling blade units, and a used blade disposal case'</li></ul>                                                                                                                                                                                                                         |
| 8413  | <ul><li>'a FireDos proportioning system used in fire trucks'</li><li>'micro-metering pump, magne pump, and electrohydraulic pump'</li><li>'firefighting pumps, valves, and nozzles'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 8467  | <ul><li>'a 90 Piece Home Project Tool Set'</li><li>'a 44 Piece Tool Set that includes a cordless screwdriver, various pliers, wrenches, a hammer, a tape measure, a level, and assorted screwdriver bits'</li><li>'an air nibbler and taper punch set'</li></ul>                                                                                                                                                                                                                                                                                                                                                                  |
| 7306  | <ul><li>'high-end steel mechanical tubing used for automobile parts'</li><li>'stainless steel welded pipe used in civil aircrafts'</li><li>'welded black (uncoated) and galvanized nonalloy steel pipe and pipe fittings made to ASTM A53'</li></ul>                                                                                                                                                                                                                                                                                                                                                                              |
| 7616  | <ul><li>'an aluminum flood tray used in indoor horticulture'</li><li>'an 8 inch jack stand made of cast aluminum and steel hardware'</li><li>'aluminum alloy sacrificial anodes designed for use in the pleasure craft industry'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                        |
| 9404  | <ul><li>'polyurethane pillows, mattress toppers, and mattresses'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 5903  | <ul><li>'upholstery decking material made of cellular polyurethane bonded to textile layers'</li><li>'a coated fabric for use in upholstery, composed of a 78% polyester/22% rayon blend, coated with cellular polyurethane, dyed deep purple, and embossed to simulate leather'</li><li>'an imitation leather fabric used in upholstery made from 100% polyester fibers and laminated with a compact polyurethane plastic'</li></ul>                                                                                                                                                                                             |
| 8465  | <ul><li>'a portable crosscut saw'</li><li>'multiple boring machines and their accessories used in woodworking'</li><li>'a woodcarving machine designed for creating complex carvings such as custom signs and detailed reliefs for mantles and cabinetry'</li></ul>                                                                                                                                                                                                                                                                                                                                                               |
| 8537  | <ul><li>'power distribution units (PDUs) with remote switching capabilities and electrical monitoring features'</li><li>'Holiday Helper - Holiday Assortment containing thumb tacks, brass cup hooks, medium suction cups, and mini Christmas light fuses'</li><li>'a PTZ/DVR System Controller Model SPC-2010'</li></ul>                                                                                                                                                                                                                                                                                                         |
| 7210  | <ul><li>'steel siding panels composed of two galvanized steel sheets with a polymer foam core, used for manufacturing enclosures for semi-trailer trucks'</li><li>'steel doctor blades intended for use as parts for printing presses'</li><li>'various steel sheeting imported in coil form, including cold-rolled alloy steel sheet and hot-dipped galvanized steel sheets'</li></ul>                                                                                                                                                                                                                                           |
| 3906  | <ul><li>'Noxtite PA-401 elastomeric acrylic copolymer from Japan'</li><li>'a gel-like material composed of an acrylic polymer and inert fillers used as a serum separating sealant in hematological examinations'</li><li>'Heparin HyperD 20(m, Heparin HyperD M, Blue Ceramic HyperD, Lysine Ceramic HyperD, and Methyl Ceramic HyperD chromatographic media, in bulk form, from France'</li></ul>                                                                                                                                                                                                                               |
| 3506  | <ul><li>'a Craft Projects kit containing various craft materials such as yarn, plastic needle, glue, PVC straws, wood craft sticks, pompons, pipe cleaners, foam shapes, beads, and sequins'</li><li>'a desk supply kit containing a ruler, retractable tape measure, stapler, staples, paper clips, pencil sharpener, self-adhesive clear plastic tape on a plastic dispenser, a rectangular plastic eraser, and a tube of glue, all packaged in a decorative paperboard box'</li><li>'a 151-piece Highway Emergency Kit'</li></ul>                                                                                              |
| 2930  | <ul><li>'4-Hydroxythiophenol (4-Mercaptophenol)'</li><li>'4-Chlorophenyl Isothiocyanate'</li><li>'4-(phenylthio)benzaldehyde and P-(phenylthio)benzyl alcohol'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2830  | <ul><li>'aluminum silicate hydroxide, calcium silicate, and zinc hydroxide'</li><li>'Hafnium Dioxide and Electrolytic Hafnium Powder from Ukraine'</li><li>'Titanium Oxide, Tantalum Oxide, Hafnium Oxide, and Zirconium Oxide from China'</li></ul>                                                                                                                                                                                                                                                                                                                                                                              |
| 3507  | <ul><li>'Natuphos 5000G Phytase Granular Formulation and Natuphos 10000G Phytase Granular Formulation'</li><li>'an enzyme preparation used in animal feed, specifically Hostazym X microgranulate (dry) and Hostazym X Liquid'</li><li>'Sani-Clean Batonnets, an enzymatic cleaner used to keep drain pipes clean and odor-free'</li></ul>                                                                                                                                                                                                                                                                                        |
| 8533  | <ul><li>'resistor networks'</li><li>'thick film chip resistors used in commercial, industrial, and automotive applications'</li><li>'an adjustable coaxial attenuator used to reduce the amplitude of a radio frequency signal'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                         |
| 8544  | <ul><li>'a portable charger bracelet, a necklace USB flash drive pendant, and a bracelet link toggle LED notifier'</li><li>'an interface cable used between a foot control and an arthroscopic fluid management device'</li><li>'junction box assemblies used to transfer electricity through solar panels'</li></ul>                                                                                                                                                                                                                                                                                                             |
| 3502  | <ul><li>'dehydrated egg albumen blends intended for use in bakery products'</li><li>'cycling kits that include various components used in cycling activities'</li><li>'bicycle related items including Power Meters, Power Controls, Chain Rings, Cranks, and Cables'</li></ul>                                                                                                                                                                                                                                                                                                                                                   |
| 3909  | <ul><li>'an iso-butylated melamine-formaldehyde resin solution'</li><li>'CYMEL 254 melamine formaldehyde polymer in organic solvent'</li><li>'thermoplastic polyurethane pellets'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 8527  | <ul><li>'network home theater receivers'</li><li>'an alarm clock radio receiver with a built-in iPod docking station and a separate bed shaker'</li><li>'a wireless Bluetooth speaker with built-in FM radio'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                           |
| 8539  | <ul><li>'a tungsten halogen 12-volt/10-watt light bulb used in fiber optic Christmas trees'</li><li>'a lamp-holder and self-ballasted lamp adapter'</li><li>'various electrical apparatus including wall switches, lamp holders, socket adapters, taps, and incandescent and fluorescent plug-in lights'</li></ul>                                                                                                                                                                                                                                                                                                                |
| 6112  | <ul><li>"women's bikini swimwear made of 100% crocheted cotton fabric"</li><li>"a woman's knit cotton swimsuit with an extra top"</li><li>'girls swimwear made from knitted fabric of 82% nylon and 18% spandex, characterized by short legs, short sleeves, a high collar with a vertical zipper, and a pieced-in ruffle around the waist'</li></ul>                                                                                                                                                                                                                                                                             |
| 2928  | <ul><li>'Deferoxamine Mesylate, an iron-chelating agent used for treating iron overload'</li><li>'Etelcalcetide Hydrochloride in bulk powder form'</li><li>'Etelcalcetide Hydrochloride in bulk form'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8204  | <ul><li>'a bicycle tool/repair kit'</li><li>'an oil filter wrench'</li><li>'a bicycle tool/repair kit'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2907  | <ul><li>'2-Ethylhexanol-1-OL'</li><li>'dinonyl phenol, dimethyl maleate, and diethyl maleate'</li><li>'methanol'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 8714  | <ul><li>'unassembled Aztec Mags bicycle brake pads made of magnesium, rubber, and steel'</li><li>'a replacement seat for the Golden Avenger mobility scooter'</li><li>'Sprocket Hub Assembly for a Honda motorcycle'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                    |
| 8436  | <ul><li>'complete escalator handrails'</li><li>'an automatic paper laying machine used in chick hatcheries'</li><li>'a woodchipper designed for agricultural use, specifically the Patu model DC65, which is powered by a tractor and features adjustable chip length and a 360-degree discharge chute'</li></ul>                                                                                                                                                                                                                                                                                                                 |
| 9008  | <ul><li>'a Toy Space and Planetarium Projector'</li><li>'a laser light projector that utilizes laser diodes and diffraction grating to project images of stars and nebulae for decorative purposes'</li><li>'a Moonlite Storybook Projector'</li></ul>                                                                                                                                                                                                                                                                                                                                                                            |
| 8480  | <ul><li>'steel forms used in the construction industry to pour and set concrete'</li><li>'molds for concrete pipe, including external molds, pallets, table plates, and masterheaders used in a two-position pipe molding machine'</li><li>'concrete formwork systems used in construction'</li></ul>                                                                                                                                                                                                                                                                                                                             |
| 8427  | <ul><li>'a compact self-propelled electric powered front-end skid steer loader designed for working in compact areas, featuring various attachments and remote control capabilities'</li><li>'an electric forklift, model number CPD10, which is a self-propelled, seated forklift truck powered by a 48V, 160 Ah battery, with a rated load capacity of 1000 kilograms and a maximum lifting height of three meters'</li><li>'a self-propelled shuttle that transports palletized loads within a pallet rack structure'</li></ul>                                                                                                |
| 3910  | <ul><li>'bulk polydimethylsiloxane'</li><li>'vulcanized silicone reinforced with glass fabric, unvulcanized silicone reinforced with glass fabric, and unvulcanized unreinforced silicone used in flexible silicone heater pads'</li><li>'RTV-801 Silicone Rubber, a silicone polymer used to make molds'</li></ul>                                                                                                                                                                                                                                                                                                               |
| 3911  | <ul><li>'Supragil MNS-88 resin powder'</li><li>'a high molecular weight polyethyleneimine and a heparin modified copolymer designed for medical applications such as stents and vascular grafts'</li><li>'polyethylene terephthalate bottle flake recovered from post-consumer PET drink bottles'</li></ul>                                                                                                                                                                                                                                                                                                                       |
| 4009  | <ul><li>'oil hose reels from China'</li><li>'a rubber bellows assembly used in washing machines'</li><li>'a rubber hose made of nitrile rubber reinforced with circular woven synthetic yarn, used in farm waste injection systems'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                     |
| 2905  | <ul><li>'(S)-2-Butanol, CAS # 4221-99-2, imported in bulk form from Germany'</li><li>'methanol'</li><li>'Methanol used in the production of dimethyl ether (DME) fuel'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 9403  | <ul><li>'a multi-function aluminum ladder/seat/table designed for aquatic environments'</li><li>'wooden furniture used in hotels and motels'</li><li>'dressers with mirrors having battens, and mirrors imported without dressers from Vietnam'</li></ul>                                                                                                                                                                                                                                                                                                                                                                         |
| 9020  | <ul><li>'an AvaLung breathing device that includes a mesh vest and a breathing tube for use in avalanche situations'</li><li>'ventilated casualty hoods designed for adults, children, and babies, which include features such as a transparent visor, PVC hood, filter canister, and battery-operated ventilation unit'</li><li>'an Emergency Escape Smoke Hood'</li></ul>                                                                                                                                                                                                                                                       |
| 7311  | <ul><li>'access fitting bodies of iron or steel from Canada'</li><li>'a Steel UN Portable Tank designed for the transport and storage of liquefied gases'</li><li>'a steel storage vessel in the form of a sphere with a supporting tower used for the storage of high pressure liquid hydrocarbons'</li></ul>                                                                                                                                                                                                                                                                                                                    |
| 3505  | <ul><li>'modified cornstarch used in food processing'</li><li>'adhesives based on a combination of native and modified wheat starches used for corrugated cardboard production'</li><li>'modified corn starch treated with octenyl succinic anhydride for use as an emulsifying food additive'</li></ul>                                                                                                                                                                                                                                                                                                                          |
| 2817  | <ul><li>'Zinc Oxide grades ZOCO 900, ZOCO 204, and ZOCO 604 imported from various countries and commingled with Canadian Zinc Oxide'</li><li>'zinc oxide (CAS #1314-13-2) used as a pharmaceutical intermediate'</li><li>'Zinc Oxide'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                   |
| 2831  | <ul><li>'sodium formaldehyde sulfoxylate (CAS 149-44-0)'</li><li>'Emulpharma 35 and Emulpharma 840'</li><li>'Sodium Hydrosulfite'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 7412  | <ul><li>'spool valve pneumatic brass fittings from Taiwan'</li><li>'downpipe outlets made of copper or aluminum used to connect round gutter downpipe to the gutter'</li><li>'pneumatic connectors made primarily of brass, used in vehicles with air suspensions'</li></ul>                                                                                                                                                                                                                                                                                                                                                      |
| 4011  | <ul><li>'new pneumatic tires designed for agricultural or forestry vehicles and machines, having a herring-bone or similar tread'</li><li>'off-the-road tires with herring-bone or similar tread patterns'</li><li>'light truck tires from China, specifically the Marcher Model QZ106 tires in sizes LT700-15 8PR TL and LT750-16 10PR TL'</li></ul>                                                                                                                                                                                                                                                                             |
| 2915  | <ul><li>'Bergacare EM-OP, CAS 29806-73-3, also known as Hexadecanoic acid, 2-ethylhexyl ester and Ethylhexyl palmitate'</li><li>'Decanoic acid (Capric acid)'</li><li>'Ethyl isobutyrate (CAS # 97-62-1)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                               |
| 8532  | <ul><li>'a Dry Metallized Film Dielectric Capacitor used in electric motors'</li><li>'a Radio Frequency Interference (RFI) Filter used in motor vehicle fuel pumps'</li><li>'noise suppression capacitors'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                              |
| 8432  | <ul><li>'parts of agricultural tow-behind rotary tillers'</li><li>'a lawn de-thatcher assembly designed for use with a Mantis brand rotary tiller'</li><li>'an electric cultivator used for breaking sod, preparing seed beds, and cultivating gardens and flower beds'</li></ul>                                                                                                                                                                                                                                                                                                                                                 |
| 4012  | <ul><li>'used truck tire casings imported from Canada for retreading'</li><li>'used truck tire casings from Turkey'</li><li>'retreaded Off the Road (OTR) or earthmoving tires from Canada'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2924  | <ul><li>'3-amino-4-methoxy acetanilide'</li><li>'MP-633 and Ioversol, organic chemical compounds used in medical radiographic diagnostics'</li><li>'Metolachlor Technical (CAS-51218-45-2), a selective herbicide imported in bulk form from China'</li></ul>                                                                                                                                                                                                                                                                                                                                                                     |
| 8412  | <ul><li>'a natural gas fueled engine converted from a diesel engine'</li><li>'a pneumatic rod cylinder slide used in industrial machinery'</li><li>'a self-contained hydraulic Emergency Shutdown Device (ESD) designed for use with hydraulic valve actuators'</li></ul>                                                                                                                                                                                                                                                                                                                                                         |
| 7013  | <ul><li>'lead crystal glass ornaments'</li><li>'DEOS headphone covers made of lead crystal glass'</li><li>'a lead crystal monogram letter used for decorative purposes'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 9503  | <ul><li>'a Tapeffiti Design Guide Book that includes a spiral bound design guide, twelve rolls of fashion tape, and a manual tape cutting device'</li><li>'activity sets for children, specifically the Creepy Crawlers and Dolly Maker sets, which include Goop FX detail pens, metal molds, and an oven for solidifying plastic goop'</li><li>'activity sets for children, including Goop FX detail pens, metal molds, and an oven for solidifying plastic items'</li></ul>                                                                                                                                                     |
| 8428  | <ul><li>'four-post vehicle lifts used in garages or commercial settings'</li><li>'a container conveyor system used to transport aluminum containers in a greenhouse'</li><li>'a mobile pneumatic conveyor used for grain transport'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                     |
| 8466  | <ul><li>'weldments made from cut-to-print steel plates that are manufactured in China and further processed in Canada before being exported to the United States'</li><li>'cast iron parts used in gear finishing and cutting machines'</li><li>'a miter saw stand'</li></ul>                                                                                                                                                                                                                                                                                                                                                     |
| 8433  | <ul><li>'mini excavators from China'</li><li>'a Garage in a Box containing various automotive repair tools'</li><li>'unassembled battery-operated lawn mowers from China'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2909  | <ul><li>'Hexafluoroisopropyl allyl ether'</li><li>'Ethoxy propanol, an ether alcohol used as an industrial solvent'</li><li>'Diethylene glycol dimethyl ether, CAS No. 111-96-6'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 4820  | <ul><li>'a padfolio used for note-taking'</li><li>'portfolios designed to hold writing pads and stationery articles'</li><li>'a scrapbook kit consisting of a small album and decorative accessories packed together in a retail cellophane package'</li></ul>                                                                                                                                                                                                                                                                                                                                                                    |
| 8538  | <ul><li>'fuel pump parts including O-rings, springs, ground contacts, and capacitors'</li><li>'hoods and housings for Han electrical connectors made of die cast aluminum'</li><li>'electrical connector parts including gold and silver housings, plastic isolators, contact pins, and springs'</li></ul>                                                                                                                                                                                                                                                                                                                        |
| 7315  | <ul><li>"nonalloy steel chains fitted with Shooks, used to hang boxers' heavy bags, with welded links ranging from 3.9 mm to 4.76 mm in diameter"</li><li>'buoy chain and buoy chain bridle used in securing navigational buoys'</li><li>'steel link chains with a diameter just over 10 mm'</li></ul>                                                                                                                                                                                                                                                                                                                            |
| 3914  | <ul><li>'Whatman DE52 Ion-Exchange Cellulose'</li><li>'chromatography sorbents used for the purification and preparation of protein substances in laboratory or industrial applications'</li><li>'Colesevelam hydrochloride ion-exchanger resins in bulk form'</li></ul>                                                                                                                                                                                                                                                                                                                                                          |
| 3919  | <ul><li>'a protective plastic sheet with self-adhesive masking tape used for surface protection during painting'</li><li>'printed self-adhesive labels used for identifying piping systems'</li><li>'shipping envelopes made of clear polyethylene film with a self-adhesive side'</li></ul>                                                                                                                                                                                                                                                                                                                                      |
| 8519  | <ul><li>'a Portable Tape-to-MP3 Player'</li><li>'a hand-held, motion-controlled music maker that records and reproduces sound from flash memory, comes preloaded with music tracks and sound effects, and includes a built-in speaker, microphone, USB-C port, and auxiliary audio input socket'</li><li>'heating fans, humidifiers, and moisture detectors'</li></ul>                                                                                                                                                                                                                                                            |
| 8430  | <ul><li>'Kahlbacher multi-purpose lateral snowplows, type "DS"'</li><li>'tractors designed for use on airport runways and roadways, specifically the SX 360 and SX 600 models, and snowblowers with model numbers 1150/2500 and 1150/2700'</li><li>'a Backhoe Attachment for a tractor'</li></ul>                                                                                                                                                                                                                                                                                                                                 |
| 8417  | <ul><li>'stainless steel castings used in industrial furnaces'</li><li>'lead wire manufacturing equipment'</li><li>'a pilot wafer plant used for the experimental production of ice cream sandwiches and wafers'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                        |
| 7326  | <ul><li>'steel fittings used in automotive steering columns'</li><li>'components for a steel wireway'</li><li>'fasteners and parts of automobiles from Japan'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 3915  | <ul><li>'perfluoroalkoxy (PFA) resin scrap-lathe turnings'</li><li>'urea formaldehyde waste'</li><li>'polyethylene terephthalate (PET) sheet trimmings'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 6106  | <ul><li>'a girls short sleeve shirt made from finely knit jersey fabric, consisting of 95% cotton and 5% spandex, featuring a two-button placket, a false placket with nonfunctional buttons, capped sleeves, and a shirt collar, sized for girls 7-16'</li><li>"a girl's shirt made from finely knitted fabric, featuring a full-front zippered opening, a hood, long sleeves with hemmed cuffs, and open pockets, composed of 95% cotton and 5% spandex"</li><li>"a children's knight costume consisting of a shirt, pants, hood, and sword"</li></ul>                                                                          |
| 8455  | <ul><li>'multifunctional machines that have monochrome copying, printing, faxing, and scanning functions, specifically the Sharp Andromeda II J-models (AR-M257J, AR-M317J)'</li><li>'laundry cleaning machinery from Italy'</li><li>'a spray bar designed for a hot rolling mill that dispenses coolant to cool metal during the rolling process'</li></ul>                                                                                                                                                                                                                                                                      |
| 9026  | <ul><li>'gas monitoring apparatus used to monitor and record pressure and other parameters in gas distribution and transmission networks'</li><li>'an oil pressure sensor assembly designed to measure engine oil pressure in a motor vehicle'</li><li>'pressure transducers, pressure indicators, modular speed controllers, and modular temperature controllers'</li></ul>                                                                                                                                                                                                                                                      |
| 9029  | <ul><li>'the Gaiam Advanced Outdoor Fit Walk System'</li><li>'navigational instruments including an altimeter, rate-of-climb indicator, airspeed indicator, and tachometer for civil aircraft'</li><li>'automotive dashboard gauges including a speedometer, tachometer, fuel gauge, temperature gauge, oil pressure gauge, voltage gauge, and a telltale module'</li></ul>                                                                                                                                                                                                                                                       |
| 9018  | <ul><li>'an electro-surgical instrument handle used in various surgical procedures'</li><li>'a CoolSculpting System, a skin cooling and heating device used by medical professionals for fat reduction and thermal therapy'</li><li>'infusion pumps that push the plunger of a syringe to dispense medication'</li></ul>                                                                                                                                                                                                                                                                                                          |
| 3504  | <ul><li>'Pea Protein Isolate'</li><li>'Fiber 90, a macromolecular protein derived from animal tissues used in sausage and meat emulsion products'</li><li>'hydrolyzed pea protein powders consisting of at least 80% and 85% protein by dry weight'</li></ul>                                                                                                                                                                                                                                                                                                                                                                     |
| 8209  | <ul><li>'solid carbide insert knives used in woodworking applications'</li><li>'saw tips made of tungsten carbide and cobalt used for band saw or circular saw blades'</li><li>'tungsten carbide tool blanks used for manufacturing drill bits and router bits'</li></ul>                                                                                                                                                                                                                                                                                                                                                         |
| 8526  | <ul><li>'a global positioning system designed for tracking in-fleet vehicles with communication capabilities via cellular phone'</li><li>'a Global Positioning Device that includes a Digital Video Disk player, a monitor, and an AM/FM radio for installation in automobiles'</li><li>'a GPS shell designed as a replacement cover for a cellular telephone that houses a fully functional GPS receiver'</li></ul>                                                                                                                                                                                                              |
| 5602  | <ul><li>'a needleloom felt used in the manufacture of footwear'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 9025  | <ul><li>'a Bluetooth Infrared Thermometer'</li><li>'shower boxes, bathtubs, shower cubicles, and shower panels'</li><li>'a temperature sensitive faucet light'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2903  | <ul><li>'Methylene Chloride (CAS 75-09-2) from Russia'</li><li>'isobutyl chloride'</li><li>'1,1,1,3,3,3-Hexafluoropropane (CAS # 690-39-1)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 3004  | <ul><li>'ASA tablets'</li><li>'Valcyte Tablets'</li><li>'Valcyte Tablets'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 8512  | <ul><li>'automobile headlight and tail light lenses'</li><li>'a non-adhesive label made of lexan material for use in machinery or vehicles'</li><li>'radar detector display units that combine radar detection with Bluetooth connectivity for smartphones'</li></ul>                                                                                                                                                                                                                                                                                                                                                             |
| 9003  | <ul><li>'eyeglass frames made of plastic and metal'</li><li>'sunglasses frames with embedded sensors'</li><li>'clip-on eyeglass frames and metal cases'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 9821  | <ul><li>"a child's polyester fleece cardigan"</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 8510  | <ul><li>'nylon attachment combs for hair clippers'</li><li>'a hand-held electric hair removal appliance that uses rotating, fine-grain, abrasive discs to exfoliate body hair'</li><li>'an assembly for a shaver made in China that includes a jack board, a battery, a pc board, a switch, and a motor'</li></ul>                                                                                                                                                                                                                                                                                                                |
| 8211  | <ul><li>'stainless steel steak knife sets with various handle materials'</li><li>'machine tool parts and accessories'</li><li>'a multi-tool that includes various tools such as wrenches, screwdrivers, a chain tool, and a knife, all housed in a composite body'</li></ul>                                                                                                                                                                                                                                                                                                                                                      |
| 2934  | <ul><li>'Accelerator NOBS, Accelerator ZDC, and Antioxidant RD used in rubber processing'</li><li>'Paroxetine, Flutamide, and Metoprolol Tartrate'</li><li>'(S)-N-[[5-[2-(2-Amino-4,6,7,8-Tetrahydro-4-Oxo-1H-Pyrimido[5,4-B][1,4]Thiazin-6-YL)Ethyl]-2-Thienyl]Carbonyl]-L-Glutamic Acid'</li></ul>                                                                                                                                                                                                                                                                                                                              |
| 2925  | <ul><li>'N-Diphenylmethylene glycine ethyl ester, CAS No. 69555-14-2'</li><li>'Sodium Saccharin, CAS # 128-44-9, from Israel'</li><li>'UV Absorber LS-101, chemically known as Benzoic acid, 4-[[(Methylphenylamino) methylene]amino]-, ethyl ester, used as a UV stabilizer for polyurethane'</li></ul>                                                                                                                                                                                                                                                                                                                          |
| 6815  | <ul><li>'a graphite liner used in semiconductor wafer manufacturing'</li><li>'multi-wall carbon nanotubes used in the manufacture of car fenders, cell phones, computer housings, anti-static packaging, and scratch-resistant coatings'</li><li>'a carbon graphite bushing designed for use in a rotary joint assembly connected to a dual flow stationary water or steam siphon'</li></ul>                                                                                                                                                                                                                                      |
| 8424  | <ul><li>'a small, one-time use fire extinguisher designed for household use'</li><li>'a potting/gardening miniature tool set'</li><li>'a horticultural sprayer designed to spray pesticides and fertilizers, mounted on a tractor, with a 600-liter tank capacity, diaphragm pump, and a spray range of 10 meters'</li></ul>                                                                                                                                                                                                                                                                                                      |
| 4008  | <ul><li>'EPDM profiles used as seals in automotive and other applications'</li><li>'protectors for slide rails made of cellular EPDM rubber'</li><li>'engraving rubber'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2820  | <ul><li>'manganese dioxide from China'</li><li>'Manganese Dioxide'</li><li>'manganese dioxide from China'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2827  | <ul><li>'Titanium (III) Chloride, Solution from Germany'</li><li>'copper iodine (CAS # 7681-65-4)'</li><li>'Copper Oxychloride technical 57%'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2906  | <ul><li>'Menthol Production E from Brazil'</li><li>'4-Nitrophenethyl alcohol, a cyclic alcohol derivative used as a pharmaceutical intermediate'</li><li>'Calcipotriene, Dronabinol, and Meprobamate'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 6101  | <ul><li>"a men's knit jacket made from 100% polyester with nylon overlays, featuring a convertible collar, zipper closure, and multiple pockets"</li><li>'a boys fully lined knit jacket made from polyester and nylon, featuring a zipper closure and detachable sleeves'</li><li>'a boys hooded sweat jacket made of 50% polyester and 50% cotton'</li></ul>                                                                                                                                                                                                                                                                    |
| 8479  | <ul><li>'welding positioner chucks and grippers'</li><li>'a humanoid robot capable of interacting with humans, analyzing emotions, and performing various programmable functions'</li><li>'piston accumulator parts used in an automobile'</li></ul>                                                                                                                                                                                                                                                                                                                                                                              |
| 2911  | <ul><li>'1,1-Dimethoxyphenyl methane (Dimethoxymethyl)benzene'</li><li>'Propionaldehyde diethyl acetal, CAS 4744-08-5'</li><li>'2,2-Dimethoxypropane'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8534  | <ul><li>'a bare printed circuit board (PCB) designed for use with the Respironics Trilogy Ventilator'</li><li>'thick film printed substrates with resistors'</li><li>'a microwave touch plate used in microwave ovens'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                  |
| 7615  | <ul><li>'an aluminum BBQ tray designed for single use, with perforations to prevent liquid fat from dripping into the fire during cooking on a BBQ grill'</li><li>'GrateLock aluminum barbeque sheets'</li><li>'an aluminum soap dish shaped like a fish'</li></ul>                                                                                                                                                                                                                                                                                                                                                               |
| 3917  | <ul><li>'double walled pipes, elbows, chimney cover, roof terminal, and vent pipe used in gas venting systems'</li><li>'polyethylene silage bags'</li><li>'metal fasteners and plastic tubing used in coffee makers'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                    |
| 8511  | <ul><li>'an Automotive Ignition Control Unit (Capacitative Discharge System)'</li><li>'a coil housing assembly used in automotive ignition systems'</li><li>'compact actuators, sidestick controllers, and system power supply used in flight simulators'</li></ul>                                                                                                                                                                                                                                                                                                                                                               |
| 8517  | <ul><li>'wireless digital telecommunication base stations used in classroom communication systems'</li><li>'a welding conduit liner from Mexico'</li><li>'Blackberry wireless handheld devices'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 8214  | <ul><li>'manicure sets containing various grooming tools'</li><li>'a nail clipper'</li><li>'steel cutting rule and rule die material'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 9002  | <ul><li>'optical couplers/adaptors used in medical endoscopy'</li><li>'micrographic lenses designed for use with the Canon NP Printer 680 micrographic reader-printer'</li><li>'a mounted sapphire window used in short arc Xenon lighting lamps'</li></ul>                                                                                                                                                                                                                                                                                                                                                                       |
| 9032  | <ul><li>'a locomotive excitation system designed to upgrade existing operating facilities on General Motors SD and GP locomotives'</li><li>'electronic temperature controllers designed to regulate temperature in multiple zones using thermal sensors'</li><li>'Honeywell T451A Light Duty Line Voltage Thermostats'</li></ul>                                                                                                                                                                                                                                                                                                  |
| 3913  | <ul><li>'Chitosan Powder'</li><li>'copolymers of acrylonitrile-butadiene-styrene (ABS) and blends of ABS with methylstyrene-acrylonitrile-styrene'</li><li>'100% biodegradable cornstarch-based resins in pellet form'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                  |
| 8504  | <ul><li>'a power supply adapter for use with automatic data processing machines, with a maximum output of 65 Watts and an output of 19 VDC, packaged with North American and European plugs'</li><li>'a PowerCap and a PowerCap with Crystal designed for battery backup power in non-volatile memory applications'</li><li>'rectifying power supplies'</li></ul>                                                                                                                                                                                                                                                                 |
| 5603  | <ul><li>'a nylon nonwoven substrate coated with polyurethane plastics used as imitation leather in footwear'</li><li>'Clarino man-made leather'</li><li>'dry nonwoven wipes packaged in plastic containers from China'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2912  | <ul><li>'Pivaldehyde, a nonaromatic acyclic aldehyde used as a pharmaceutical intermediate'</li><li>'1-Naphthaldehyde, CAS # 66-77-3, imported in bulk form from China'</li><li>'4-Biphenylcarboxaldehyde'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                              |
| 6116  | <ul><li>'a girls blouse and jumper set made of cotton and polyester, designed for babies and toddlers'</li><li>"a girls' pullover shirt and trousers set made from cotton, with detachable suspenders"</li><li>'work gloves produced in Canada that are made of knit fabric coated with PVC or nitrile'</li></ul>                                                                                                                                                                                                                                                                                                                 |
| 2804  | <ul><li>'nitrogen filled cartridges used in fire suppression systems'</li><li>'Krypton, Xenon, and Neon gases in steel cylinders'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 9024  | <ul><li>'a test bench used to test hoses and tubes under high pressure'</li><li>'scratch testers designed to measure the peeling load of hard film and evaluate the tribological and adhesion properties of very thin films'</li><li>'a portable instrument used to measure concrete compression strength'</li></ul>                                                                                                                                                                                                                                                                                                              |
| 7308  | <ul><li>'tower crane components including tower sections, foundation anchors, and tie-in frames'</li><li>'acrylic and copper coated stainless steel rain gutters and gutter down pipes'</li><li>'adjustable steel post shores and scaffolding frames with accessories'</li></ul>                                                                                                                                                                                                                                                                                                                                                  |
| 9022  | <ul><li>'small, transparent plastic covers for dental X-ray sensors'</li><li>'an X-Ray Fluorescence Analyzer'</li><li>'high voltage X-ray generators and their parts, including touch screen consoles and pedestal stands'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                              |
| 3824  | <ul><li>'a solar controlling additive used in PMMA sheets to absorb infrared light'</li><li>'polished and unpolished discs made of single magnesium oxide (MgO) crystals, each weighing no less than 2.5 grams, used as substrates for printed microcircuits'</li><li>'5-DMT-2-Deoxyuridine Glycolate CPG, MMT C6 Amidite, 5(6)-Carboxy Tamra, 5-Carboxy Tamra, and 6-Carboxy Tamra'</li></ul>                                                                                                                                                                                                                                    |
| 3907  | <ul><li>'an unsaturated, uncompounded Diallyldimethylammonium Chloride polymer in solid form used for industrial water cleaning and coal mining applications'</li><li>'an unsaturated acrylated polyether polyester copolymer derived from polyethylene glycol, imported in white powder form for use in the manufacture of a sterile prosthetic mesh designed for the reconstruction of soft tissue'</li><li>'epoxy resin (CAS-25068-38-6) with silicon dioxide filler and acid anhydride hardener (CAS-11070-44-3)'</li></ul>                                                                                                   |
| 7321  | <ul><li>'a camping stove and pot set designed for outdoor cooking'</li><li>'outdoor gas grills made of stainless steel, mounted on a cart with wheels, featuring multiple burners, cooking grates, and built-in temperature gauges'</li><li>'gas grills from China'</li></ul>                                                                                                                                                                                                                                                                                                                                                     |
| 7409  | <ul><li>'Military Survival Tin and Combat Survival Tin'</li><li>'electrodeposited refined copper foils from Luxembourg'</li><li>'refined copper foils that are electroplated with a copper/zinc layer, varying in thickness from .009 mm to .400 mm and in width from 305 mm to 1346 mm, imported from Luxembourg'</li></ul>                                                                                                                                                                                                                                                                                                      |
| 8472  | <ul><li>'a Top Flat Sorting Machine designed to sort magazines, newspapers, mail, and pamphlets'</li><li>'a gasoline operated lawn edger'</li><li>'a cash dispensing machine and a control panel'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 8206  | <ul><li>'a 104-piece tool set with a wood tool chest'</li><li>'a Flashlight Radio Tool Kit that includes a combination AM/FM radio, spotlight/flashlight, emergency blinking light, siren alarm, and a thirteen-piece toolkit'</li><li>'a 101-piece tool set that includes various hand tools such as sockets, wrenches, pliers, hammers, screwdrivers, and a blow mold case'</li></ul>                                                                                                                                                                                                                                           |
| 9405  | <ul><li>'an electric light fitter and light kit designed for ceiling fans'</li><li>'parts of track lighting systems, specifically lampholders made of metal and plastic'</li><li>'a metal oil torch lamp'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                               |
| 7317  | <ul><li>'steel wire U-type staples from Taiwan'</li><li>'film transport gripper chain from Germany'</li><li>'zinc plated drive pins used in construction'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 8485  | <ul><li>'grease fittings used as lubrication fittings on various machines and bearings'</li><li>'spark arresting industrial engine silencers'</li><li>'various types of grease fittings, pressure relief valves, and air bleeder valves made of steel'</li></ul>                                                                                                                                                                                                                                                                                                                                                                  |
| 9023  | <ul><li>'laparoscopic training equipment consisting of plastic and textile components used for educational purposes in surgical training'</li><li>'glass and stone tile concept boards used for demonstration purposes in a showroom'</li><li>'a demonstration model of a subsea pipe connector'</li></ul>                                                                                                                                                                                                                                                                                                                        |
| 8451  | <ul><li>'a plastic timer knob used to activate the timer on a home laundry dryer'</li><li>'Brother ScanNCut cutting machines and their accessories designed for cutting fabrics and paper'</li><li>'Brother ScanNCut cutting machines, Models #CM100DM, CM550DX, and CM250, designed for cutting fabrics and paper, including various accessories for quilting and scrapbooking'</li></ul>                                                                                                                                                                                                                                        |
| 8529  | <ul><li>'the base plate of a GPS antenna'</li><li>'a Radio Antenna (UHF Remote Control RX Module)'</li><li>'an ECA controller board designed for use within a rear projection television receiver'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2710  | <ul><li>'Dodecene (propylene tetramer), CAS Number 68526-58-9, a colorless liquid used as a chemical intermediate'</li><li>'used lubricating oil from Venezuela'</li><li>'used oil collected from networks in Canada for recycling, which undergoes extensive processing to convert it into base oils and fuel oils'</li></ul>                                                                                                                                                                                                                                                                                                    |
| 3916  | <ul><li>'stovetop guards made of PVC plastic'</li><li>'3D printing filaments made of ABS and PLA'</li><li>'a furniture fix set consisting of six interlocking panels made of PVC plastic, designed to provide support under seat cushions or mattresses'</li></ul>                                                                                                                                                                                                                                                                                                                                                                |
| 8208  | <ul><li>'slicer knives used in meat and cheese slicing machines'</li><li>'wheel scribers used for cutting glass'</li><li>'a plastic dispenser that holds disposable steel microtome blades'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 8509  | <ul><li>'a rechargeable coil hair remover and a coil tweezer'</li><li>'a 5-speed hand mixer, a 1.2-liter automatic drip coffee maker, and an electric can opener'</li><li>'an electric coffee grinder, an espresso/cappuccino coffee maker, and a frothing pitcher'</li></ul>                                                                                                                                                                                                                                                                                                                                                     |
| 8422  | <ul><li>'a hand-held tape dispenser that dispenses transparent tape with a push button and includes batteries for demonstration'</li><li>'a mobile tying machine used to tie bundled nursery stock such as fruit trees and grapevines'</li><li>'a tape and dispenser set that includes two rolls of heavy-duty tape and a metal tape dispenser with a plastic handle'</li></ul>                                                                                                                                                                                                                                                   |
| 8425  | <ul><li>'Submersible Pump Puller, Model P-5, an electric hoist used to install and remove submersible pumps in a well'</li><li>'telescopic drive jacks'</li><li>'a Swing Away Trailer Jack'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 8459  | <ul><li>'a non-CNC bed type milling machine'</li><li>'a modular milling machine used in the dentistry industry, specifically the Micro Parallelometer MP 3000'</li><li>'a modular milling machine used in the dentistry industry, specifically the Micro Parallelometer MP 3000'</li></ul>                                                                                                                                                                                                                                                                                                                                        |
| 4002  | <ul><li>'synthetic rubber products, specifically ethylene-propylene terpolymers like Dutral TER 2039 EP and Dutral TER 4046'</li><li>'unvulcanized synthetic chloroprene rubber in primary form'</li><li>'a copolymer of styrene and butadiene used in coatings, adhesives, and elastomers'</li></ul>                                                                                                                                                                                                                                                                                                                             |
| 8505  | <ul><li>'a solenoid valve housing made of steel, specifically part number H32655, which is part of a solenoid coil assembly used in valve systems'</li><li>'magnetic devices used in mannequins to hold various components of the mannequin torso in place'</li><li>'a Sea Turtle PVC magnet'</li></ul>                                                                                                                                                                                                                                                                                                                           |
| 8486  | <ul><li>'a molybdenum crucible used in a sapphire growing furnace'</li><li>'an Extreme Ultraviolet Light Source designed for semiconductor photolithography'</li><li>'a wafer polishing mounting jig from Japan'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                        |
| 8528  | <ul><li>'a Solar Powered Waterproof Outdoor LCD digital signage monitor'</li><li>'a non-screen reception apparatus for television that receives, demodulates, and transmits television signals over Wi-Fi to viewing devices'</li><li>'a non-screened satellite TV receiver designed to receive and demodulate satellite broadcast television signals for viewing on a color television set'</li></ul>                                                                                                                                                                                                                            |
| 8502  | <ul><li>'a small, 12-volt wind turbine generator'</li><li>'Combined Heat & Power (CHP) Units that use natural gas and propane gas for fuel, producing 6.0 kW of electricity'</li><li>'a diesel-powered mobile generating set mounted in an intermodal container'</li></ul>                                                                                                                                                                                                                                                                                                                                                        |
| 8525  | <ul><li>'certain transmitter modules used in fiber optic broadband transmission for data, TV, and VoIP services'</li><li>'a video inspection scope'</li><li>'television cameras and a controller designed for industrial and optical imaging applications'</li></ul>                                                                                                                                                                                                                                                                                                                                                              |
| 9006  | <ul><li>'an X-Ray I. I. Rapid Sequence Camera'</li><li>'FT-303 laser photoplotters'</li><li>'fabric grids, canvases painted with a design, and dyed muslin backdrops'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8410  | <ul><li>'turbine components used in hydroelectric projects, specifically including a nozzle tip, upper half housing, rear baffle, and a connecting pipe'</li><li>'turbine components used in hydroelectric projects'</li><li>'hydraulic turbine components including runner blades, oil head and control tubes, stop logs, and a model turbine for testing purposes'</li></ul>                                                                                                                                                                                                                                                    |
| 6505  | <ul><li>'baseball style hats'</li><li>'a jacket hood, pants pocket, and shirt collar made of knit 80% cotton and 20% polyester fabric'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 8458  | <ul><li>'non-numerically controlled engine lathes from Taiwan'</li><li>'automatic commutator turning machines and automatic armature testing systems used in the manufacture of armatures and stators for electric motors'</li><li>'automatic commutator turning machines and automatic armature testing systems used in the manufacture of armatures and stators for electric motors'</li></ul>                                                                                                                                                                                                                                  |
| 8302  | <ul><li>'a Bonded Rubber Mounting used in motor vehicles'</li><li>'gas spring, latch assembly, striker, and cable components of a door module used in motor vehicles'</li><li>'a bearing with an integral shaft used in automobile door roller assemblies'</li></ul>                                                                                                                                                                                                                                                                                                                                                              |
| 6205  | <ul><li>'a toddler boys shirt, pants, and sleeveless sweater vest set made from 60% cotton and 40% polyester'</li><li>"a boy's cotton shirt and a boy's fleece jacket"</li><li>"men's 100 percent woven cotton flannel shirt, unisex knitted pullover sweatshirt, and unisex knitted trousers"</li></ul>                                                                                                                                                                                                                                                                                                                          |
| 8418  | <ul><li>'a personal beverage dispenser designed for household use that maintains an adjustable cool temperature range and can store multiple cans or bottles'</li><li>'MicroFridge appliances that include a refrigerator and microwave oven combination'</li><li>'Pelletizer PE45, Recovery Unit RE45, and Dry Ice Blaster Triblast-2'</li></ul>                                                                                                                                                                                                                                                                                 |
| 8708  | <ul><li>'an aluminum adapter plate assembly used in electric vehicles'</li><li>'aluminum folded tubes used in vehicle radiators'</li><li>'various steel fittings used in the automotive industry'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 9014  | <ul><li>'a Portable Fish Finder'</li><li>'an LCD fish finder, a marine LCD radar, and a GPS receiver'</li><li>'a three needle recording G-meter used to register gravitational stress on an aircraft'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 3214  | <ul><li>'an epoxide resin based putty repair kit consisting of two putty sticks, a putty knife, sandpaper, disposable gloves, and instructions, designed to repair dents and cracks in fiberglass'</li><li>'rubber-based adhesive mastic sealant strips used in insulating glass and photovoltaic module assembly'</li><li>'silicone and acrylic sealants from Mexico'</li></ul>                                                                                                                                                                                                                                                  |
| 2703  | <ul><li>'a compost bulking material consisting of peat moss and hemp stalk chips for use in home composters'</li><li>'various Potting/Garden Soils'</li><li>'Lawn and Garden Soil, Potting Soil, and Professional Potting Soil'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                         |
| 8442  | <ul><li>'a large format imagesetter composing machine used to write digital information directly onto pre-sensitized aluminum and polyester printing plates, films, and paper'</li><li>'scanning equipment used in the preparation of color separations for printing plates, including devices like the Scantex, Studiowriter 1000, and Quickview'</li><li>'poultry hatchery equipment including a chick counting and boxing system, destackers and stackers, chick waste separators, and tray box washers'</li></ul>                                                                                                             |
| 3815  | <ul><li>'a contact lens soaking case with a catalytic disc'</li><li>'Toho THC-32A Catalyst'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 3924  | <ul><li>'TREASURE CHEST Organic Facial Lift Set'</li><li>"a set of two children's kneepads made of EVA foam plastic with a protective shell, a garden watering can made of polyethylene and polypropylene, and a garden bucket made of polypropylene"</li><li>"garment bags used for storing and maintaining the cleanliness of women's dresses"</li></ul>                                                                                                                                                                                                                                                                        |
| 8514  | <ul><li>'a convection/microwave oven used for high-speed cooking and regeneration of multi-portion dishes'</li><li>'Hot Isostatic Presses (HIP) and its components'</li><li>'electric motor stators assembled in Mexico'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                |
| 8523  | <ul><li>'DVD sets containing digital catalogs, brochures, and educational, documentary, and marketing videos'</li><li>'Autotig 250-4 welding unit and MU 111 orbital welding heads'</li><li>'a solid-state non-volatile storage device used in aircraft to store unique parameters'</li></ul>                                                                                                                                                                                                                                                                                                                                     |
| 0902  | <ul><li>'a gift assortment that includes a metal canister for tea, a stoneware mug, cocoa mix, marshmallows, hazelnut-flavored coffee, and related accessories'</li><li>'a gift assortment that includes tea, cocoa, and coffee with accompanying mugs, canisters, and various accessories'</li></ul>                                                                                                                                                                                                                                                                                                                             |
| 8438  | <ul><li>'a food portioning machine that forms perfectly portioned products at low pressure, retaining the texture and structure of raw materials including meat, fish, and potato products'</li><li>'high pressure vessels used in food processing to extract flavor from hops using supercritical carbon dioxide'</li><li>'starch trays used in the starch molding process for confectionery production'</li></ul>                                                                                                                                                                                                               |
| 9817  | <ul><li>'wheelchair securement systems and parts thereof'</li><li>'a plastic trigger sprayer designed for agricultural or horticultural applications'</li><li>'polyethylene irrigation pipe used for agricultural purposes'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                             |
| 7002  | <ul><li>'high-speed steel and tool steel bars imported from Austria and Sweden'</li><li>'glass cylinders used in semiconductor and solar cell manufacturing'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 6107  | <ul><li>"men's jam style sleep shorts made from cotton and spandex, and men's jam style sleep shorts made from 100% cotton"</li><li>"children's sleepwear consisting of various styles of pajama tops and bottoms made from knit polyester and flannel fabrics"</li><li>'boys briefs and girls panties packed in plastic toiletry bags from Egypt or Turkey'</li></ul>                                                                                                                                                                                                                                                            |
| 8408  | <ul><li>'a 7.5 liter turbocharged diesel engine for self-propelled bale wagons'</li><li>'marine diesel engines used in power generation and oil exploration applications'</li><li>'truck engine, manual and automatic transmissions, front axle, rear end, drive shaft, and wheel rim'</li></ul>                                                                                                                                                                                                                                                                                                                                  |
| 2941  | <ul><li>'Amikacin Sulfate, Butorphanol Tartrate, and Modafinil'</li><li>'an investigational new drug ML8054 intended for use in FDA-regulated Phase I clinical trials for cancer treatment, imported in bulk and capsule forms'</li><li>'Neomycin Sulfate'</li></ul>                                                                                                                                                                                                                                                                                                                                                              |
| 8404  | <ul><li>'barometric and surface condensers used in steam ejector lines'</li><li>'attemperators used in heat recovery systems for combined cycle power plants'</li><li>'titanium tubes for condenser units made from U.S. titanium strip and slab'</li></ul>                                                                                                                                                                                                                                                                                                                                                                       |
| 8454  | <ul><li>'a continuous casting plant used for aluminum slab production'</li><li>'cores and inserts for die casting dies'</li><li>'a centrifugal casting machine used in metallurgy'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 9401  | <ul><li>'cable assemblies used in automotive applications and surgical devices'</li><li>"children's step stool made of Medium-density fiberboard (MDF)"</li><li>"a child's bench with storage made of medium density fiberboard (MDF), featuring a safety hinged seat with a plastic cushion over foam, designed for children to sit while reading, resting, or playing"</li></ul>                                                                                                                                                                                                                                                |
| 2816  | <ul><li>'Magnesium Hydroxide from Japan'</li><li>'IXPER 35M Magnesium Peroxide (CAS 1335-26-8)'</li><li>'magnesium hydroxide, magnesium silicate, calcium polycarbophil, zinc oxide, and cellulose acetate phthalate'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8406  | <ul><li>'steam turbine parts including a rotor, stationary blade holders, and stationary blade rings'</li><li>'steam turbine parts including a rotor, stationary blade holders, and stationary blade rings'</li><li>'steam turbine parts including a rotor, stationary blade holders, and stationary blade rings'</li></ul>                                                                                                                                                                                                                                                                                                       |
| 2828  | <ul><li>'calcium hypochlorite'</li><li>'calcium hypochlorite (CAS#7778-54-3) Clean at Last 4-Month Bowl Cleaner from Canada'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 9902  | <ul><li>'an Extension Porcelain Socket - Edison Base'</li><li>'a nuclear reactor vessel closure head with control rod drive mechanisms'</li><li>'a lamp holder designed for a G4.0A low-wattage halogen lamp with a porcelain housing'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                  |
| 3901  | <ul><li>'High Density Polyethylene (HDPE) used in manufacturing applications'</li><li>'Decorative Artificial Snow made of polyethylene flakes'</li><li>'linear low density polyethylene pellets from India'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                             |
| 9011  | <ul><li>'a digital imaging capture system for anatomical pathology clinical and research markets, also referred to as a digital microscope DM01, designed to convert optical fields of view of specimens on glass slides into digital images'</li><li>'binocular and trinocular stereo microscope bodies'</li><li>'optical fiber light harnesses containing glass optical fibers used for lighting applications'</li></ul>                                                                                                                                                                                                        |
| 4014  | <ul><li>'condoms made of natural rubber latex, with reservoir ends, lubricated, and packaged 12 to a retail box'</li><li>'Safe Sex in a Bottle'</li><li>'Military Survival Tin and Combat Survival Tin'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 8543  | <ul><li>'a Hydrogen Generating Inhaler Machine'</li><li>'a dialysate warmer and associated tubing sets designed for hemodialysis treatments'</li><li>'a device that serves as a full keyboard and screen for select models of Windows Mobile Smart Phones, resembling a small laptop computer, and requires connection to a smartphone to function'</li></ul>                                                                                                                                                                                                                                                                     |
| 7009  | <ul><li>'framed glass mirrors from Indonesia'</li><li>'a lighted vanity mirror with two sides, one side being 1x magnification and the other 10x magnification, framed, circular, and measuring approximately 18 inches high by 10.25 inches wide, with a push-button on-off switch and electrical cord'</li><li>'a large oval glass wall mirror in a wooden frame designed for bathroom use, featuring a wooden shelf and two wooden drawers'</li></ul>                                                                                                                                                                          |
| 4010  | <ul><li>'traction belts for plastic extrusion machinery'</li><li>'two power drive belts used in hand power tools from Japan'</li><li>'a gear belt used for adjusting the steering column of an automobile'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                              |
| 9802  | <ul><li>'brass rods and tubes manufactured from scrap gathered in the United States and returned to the United States for further processing'</li><li>'brass rods and tubes manufactured from scrap gathered in the United States and returned to the United States for further processing'</li></ul>                                                                                                                                                                                                                                                                                                                             |
| 8513  | <ul><li>'RAID disk subsystem components including hard drive storage cabinets, hard drives in shuttles, empty hard drive shuttles, power supplies, and user manuals'</li><li>'high tech goods including automatic data processing machines, digital processing units, input/output units, and storage units'</li><li>'flashlight lenses and filters used in weapon lights and handheld flashlights'</li></ul>                                                                                                                                                                                                                     |
| 9012  | <ul><li>'ultrahigh vacuum scanning tunneling microscopes, software, and a metal table'</li><li>'an integrated silicon cantilever GMTC micromechanical tip for an atomic force microscope'</li><li>'a low-temperature scanning tunneling microscope used for research in physics and materials science'</li></ul>                                                                                                                                                                                                                                                                                                                  |
| 7322  | <ul><li>'wood, coal, and pellet burning stoves and fireplace/stove inserts'</li><li>'unit heaters, door heaters, and coils designed for heating in industrial buildings'</li><li>'warm air oil furnaces and hot water oil-fired boilers'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                |
| 8518  | <ul><li>'an art and craft kit that includes various tools such as pliers, scissors, a heat gun, and a handheld vacuum'</li><li>'a Mobile Phone Retrofit Kit for a Porsche automobile that enables hands-free cellphone use'</li><li>'lamp ballasts'</li></ul>                                                                                                                                                                                                                                                                                                                                                                     |
| 2832  | <ul><li>'a girls one-piece swimsuit and sarong set made from synthetic fibers'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 8484  | <ul><li>'a pillow block and radial ball bearings from China'</li><li>'mechanical seals and parts of mechanical seals'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8547  | <ul><li>'insulating sleeve, coupling ring, and base ring made of fused quartz for semiconductor manufacturing'</li><li>'a starter brush holder insulator and an alternator insulator'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2918  | <ul><li>'salicylic acid suitable for medicinal use'</li><li>'a molecular gastronomy kit containing xanthan gum, sodium alginate, calcium lactate, soy lecithin, agar-agar, and various utensils'</li><li>'dye image stabilizers used to manufacture color photographic paper'</li></ul>                                                                                                                                                                                                                                                                                                                                           |
| 4005  | <ul><li>'Kevlar elastomers composed of 23% Kevlar and 77% rubber, used in manufacturing automotive and industrial products'</li><li>'a black strip made of unvulcanized rubber mixed with carbon black, used as a raw material for extrusion and molding of rubber products'</li><li>'a black strip made of unvulcanized rubber mixed with carbon black, used as a raw material for extrusion and molding of rubber products'</li></ul>                                                                                                                                                                                           |
| 8407  | <ul><li>'an inboard marine propulsion engine, outboard drive, and transom plate assembly'</li><li>'Powerheads used in gardening tools'</li><li>'unfinished industrial mobile engines designed to run on natural gas or liquid propane'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                  |
| 8531  | <ul><li>'a singing floating egg timer that alerts users when eggs are cooked to their desired hardness'</li><li>'a multi-function printed circuit assembly that collects and processes water flow information and conveys it to the user on a light-emitting diode (LED) screen, without an incorporated screen'</li><li>'a battery operated LED Safety light designed for bicycles'</li></ul>                                                                                                                                                                                                                                    |
| 9017  | <ul><li>'a pocket scriber with magnetic pick-up'</li><li>'a printed flight computer used for aviation calculations'</li><li>'a lottery number selection kit'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 7607  | <ul><li>'coated aluminum foil products used in the manufacture of slats for venetian blinds'</li><li>'sandwich wrappers made of aluminum foil laminated with paper, used in the fast food industry'</li><li>'boxed aluminum foil from China used in baking and grilling'</li></ul>                                                                                                                                                                                                                                                                                                                                                |
| 8421  | <ul><li>'a Membralox filtering system for water and wastewater that includes a ceramic membrane, stainless steel housing, gaskets, a backpulse device, and a backpulse cabinet'</li><li>'Siftek filter membrane system and filter membrane material (monofilament) made of polyimide'</li><li>'an air dryer used in truck brake systems'</li></ul>                                                                                                                                                                                                                                                                                |
| 8535  | <ul><li>'an outdoor switchgear designed as an "SF 6 Rotating Arc, 36KV Outdoor Circuit Breaker"'</li><li>'Arc-Proof Metal-Clad Medium Voltage Switchgear'</li><li>'Wejtap PowerLug Terminal'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 8508  | <ul><li>'a robotic vacuum cleaner from China'</li><li>'a wet-dry vacuum cleaner power-head with a 500 watt self-contained motor, designed to fit on a standard five-gallon bucket, and sold with accessories including a hose, adaptor, and filter'</li><li>"a handheld, cordless, battery-operated suction device designed to clean the inside of a person's ears by removing wax, moisture, and dirt from the ear canal"</li></ul>                                                                                                                                                                                              |
| 8443  | <ul><li>'a Laser Printer Cartridge Component set intended for remanufacturers'</li><li>'laser printers that use electrophoto method printing with print speeds exceeding 20 pages per minute and are capable of connecting to a network'</li><li>'hot foil stamping machines from China'</li></ul>                                                                                                                                                                                                                                                                                                                                |
| 6105  | <ul><li>"boys' and girls' fine knit shirts, woven blouses, skirts, and jumpers made from polyester and cotton blends"</li><li>"three women's garments consisting of a cardigan, a pullover, and a pant made from 95% cotton and 5% spandex knit fabric"</li><li>"a women's knit cardigan and pants made from 92% cotton and 8% spandex"</li></ul>                                                                                                                                                                                                                                                                                 |
| 8450  | <ul><li>'a washing machine spider assembly'</li><li>'front load washing machines with a dry linen capacity exceeding 10 kg'</li><li>'front load washing machines and dryers with a dry linen capacity exceeding 10 kg'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                  |
| 4421  | <ul><li>'bulletin boards with aluminum frames and polycarbonate doors'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 7309  | <ul><li>'an 80m3 (500 BBL) steel storage tank used for storing shale cuttings in oilfield drilling applications'</li><li>'a relaxation chamber used to remove static electricity from petroleum products'</li><li>'tanks used to store oil, petroleum products, and other liquids'</li></ul>                                                                                                                                                                                                                                                                                                                                      |
| 7005  | <ul><li>'nonwired float glass coated with a metallic oxide for anti-reflective properties used in picture frames'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 7419  | <ul><li>'a nickel bronze shower grate used in shower areas to drain off wastewater'</li><li>'a floor cleanout access cover made of brass'</li><li>'brass cleanout plugs used to cover drain cleanout pipes'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                             |
| 4412  | <ul><li>'multilayer flooring panels made of wood veneer and PVC substrate'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 7324  | <ul><li>'a fireplace unit from South Africa'</li><li>'fuel pump parts including O-rings, springs, ground contacts, and capacitors'</li><li>'components of a heat exchanger sub-assembly from Canada'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2929  | <ul><li>'1-Isocyanato-3-(trifluoromethyl)benzene'</li><li>'Diphenylphosphoryl azide, CAS # 26386-88-9, imported in bulk form from China'</li><li>'Sodium Cyclamate and Calcium Cyclamate'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 4001  | <ul><li>'PMR rubber mixes used in the manufacture of pneumatic tires'</li><li>'latex concentrate used in manufacturing bell cuff rubber gloves and foam products'</li><li>'tire sealant containing ethylene glycol, natural rubber, phenol, and water'</li></ul>                                                                                                                                                                                                                                                                                                                                                                  |
| 6307  | <ul><li>'disposable fleece covers for the Danniflex (CPM 460) machine'</li><li>'a jute basket made from woven twisted jute cord, measuring approximately 9 x 6 x 4 inches, with jute handles, intended for sale separately or as part of gift sets'</li><li>'a bulk bag and its components made of woven polypropylene strips'</li></ul>                                                                                                                                                                                                                                                                                          |
| 2901  | <ul><li>'Chloroacetone (CAS 78-79-5) used as a pharmaceutical intermediate'</li><li>'Iso-Octane (Pentane, 2,2,4-Trimethyl-)'</li><li>'natural squalene (CAS 111-02-4) used as a health food supplement'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2707  | <ul><li>'pyrolysis gasoline (pygas) produced as a distillation by-product in the manufacture of ethylene and used in the recovery of benzene and styrene'</li><li>'mixed xylenes produced at the Sunoco Sarnia refinery in Canada'</li><li>'an intermediate stream of mixed xylene isomers'</li></ul>                                                                                                                                                                                                                                                                                                                             |
| 8524  | <ul><li>'defective flat panel display modules for televisions'</li><li>'a TFT-LCD module with mechanism for automobiles'</li><li>'a TFT-LCD module with housing for automobiles'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 6305  | <ul><li>'a polypropylene woven sleeve used to manufacture flexible intermediate bulk container (FIBC) bags'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 9005  | <ul><li>'smart binoculars from Austria'</li><li>'an electroplastic netting fence kit from Germany or Poland'</li><li>'a night vision monocular known as the Equinox ZX'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 8419  | <ul><li>'an auxiliary vehicle heater unit'</li><li>'Copper Pot Still used in an alcohol distilling system'</li><li>'a Pilot/Thermocouple/Igniter Assembly used in gas water heaters'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 1020  | <ul><li>"five women's knit garments made from various blends of acrylic, polyester, wool, and other fibers, featuring cardigans and pullovers with specific design elements such as zippers, pockets, and drawstrings"</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                  |
| 8470  | <ul><li>'a programmable calculator with accessories including a printing device and cartridges'</li><li>'numerically controlled lathes, universal lathes, radial drilling machines, and grinding machines'</li><li>'a telephone charge calculator designed to tally telephone calls and calculate charges'</li></ul>                                                                                                                                                                                                                                                                                                              |
| 2921  | <ul><li>'2,6-Difluoroaniline'</li><li>'Cyclobenzaprine, Diclofenac Potassium, Diclofenac Sodium, Diltiazem Hydrochloride, and Doxazosin Mesylate'</li><li>"Selegiline Hydrochloride, a drug used as an adjunct in the management of Parkinson's disease"</li></ul>                                                                                                                                                                                                                                                                                                                                                                |
| 4411  | <ul><li>'flooring underlay made of fiberboard and polyethylene film used as a moisture barrier'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 8102  | <ul><li>'molybdenum scrap from broken crucibles used in semiconductor manufacturing'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 7314  | <ul><li>'stainless steel tubes for use in semiconductor fabrication plants'</li><li>'nonalloy prestressed concrete (PC) Strand'</li><li>'welded electro galvanized steel wire mesh attached to woven silt fence fabric'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2815  | <ul><li>'Liquid Caustic Soda'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 3210  | <ul><li>'a protective coating used for the surface of compact discs'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 3503  | <ul><li>'edible gelatin made from calfskin and pigskin for human consumption'</li><li>'gelatin used to produce gelatin capsules'</li><li>'Edible Gelatin blended from USA-origin and French-origin gelatin'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                             |
| 7507  | <ul><li>'cold-drawn nickel alloy pipes from China'</li><li>'nickel alloy tubes sourced from Canada, coated with a Plasma Vapor Deposition process, and used in ethylene furnace coils'</li><li>'nickel alloy pipes made to ASTM B423 specifications'</li></ul>                                                                                                                                                                                                                                                                                                                                                                    |
| 6210  | <ul><li>"a man's pullover jacket made of woven nylon fabric with a partial front zipper, hood, and reflective strips, along with a plastic combination compass and thermometer"</li><li>'heavy duty aprons made from woven 100% cotton canvas/vinyl fabric, woven 100% polyester/vinyl fabric, or tarp plastic sheeting/vinyl'</li></ul>                                                                                                                                                                                                                                                                                          |
| 8463  | <ul><li>'a bead roller kit used for sheet metal fabrication'</li><li>'wire manufacturing machines, including wire drawing machines, annealers, spoolers, coilers, bunchers, pay-offs, rewinders, and continuous resistance annealers'</li><li>'a spring coiler used for the in-line production of compression springs and tension springs'</li></ul>                                                                                                                                                                                                                                                                              |
| 8468  | <ul><li>'a spin welder used in the production of thermoplastic pipe'</li><li>'a dental torch system used to melt and solder ceramic and conventional alloys in dental laboratories'</li><li>'a gas welding and cutting outfit including a torch handle, cutting attachment, nozzles, regulators, hoses, goggles, spark lighter, and case'</li></ul>                                                                                                                                                                                                                                                                               |
| 8453  | <ul><li>'an Automated Leather Cutting System consisting of a digitizing machine and two numerically controlled cutting machines'</li><li>'aprons and cots for textile making machinery'</li><li>'an Automated Leather Cutting System'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                   |
| 8445  | <ul><li>'a spinning wheel made predominantly of wood with some metal parts, designed for spinning yarn from raw fiber'</li><li>'a tying frame used with a Knotex tying machine for yarn preparation'</li><li>'wool carding machines designed for handling coarse wool fibers, mohair, and fine Merino wool'</li></ul>                                                                                                                                                                                                                                                                                                             |
| 7010  | <ul><li>'prepared mustard in glass and ceramic containers from France and Germany'</li><li>'clear glass jars and bottles used for cosmetic or foodstuff packaging'</li><li>'glass and plastic bottles, a plastic orifice, a plastic cap, a header card, and a header card blister used for packing stabilized chlorine dioxide'</li></ul>                                                                                                                                                                                                                                                                                         |
| 4418  | <ul><li>'a timber house frame kit made of coniferous woods, including Eastern White Pine, Douglas Fir, or Western Red Cedar, which is unassembled and designed for home building'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 3827  | <ul><li>'filled and non-filled steel containers for the storage and transport of compressed or liquefied gases'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 9007  | <ul><li>'modular building components from Canada'</li><li>'a miniature movie projector that projects 8 mm films and is battery operated'</li><li>'cinematographic projectors capable of projecting 35 mm and 70 mm films, including their spares'</li></ul>                                                                                                                                                                                                                                                                                                                                                                       |
| 8503  | <ul><li>'rotor and stator for a fan motor used in a household refrigerator'</li><li>'rotors and stators for electrical motors'</li><li>'an electric stator designed exclusively for the Respironics SimplyGo Portable Oxygen Concentrator'</li></ul>                                                                                                                                                                                                                                                                                                                                                                              |
| 7219  | <ul><li>'stainless steel sheets made to ASTM Specifications A 240 and A 480, ranging from 0.5 mm to 3 mm in thickness, with widths of either 48 inches or 60 inches, and having either a No. 2B or No. 3 finish'</li><li>'cold rolled stainless steel sheets originating in Taiwan, processed in China, with varying thicknesses and widths'</li><li>'cold rolled stainless steel sheets originating in Korea, processed in China, with a thickness of 3 mm or more but less than 4.75 mm and a width of 1370 mm or more'</li></ul>                                                                                               |
| 6212  | <ul><li>'a girdle constructed from 90% nylon and 10% spandex knit fabric that extends from below the bust to the thigh, featuring adjustable shoulder straps and designed to slim the tummy, buttocks, hips, waist, and thighs'</li><li>"an adult Little Bo Peep costume consisting of a corset, skirt, petticoat, hard plastic shepherd's staff, thigh highs, and a comb with hair ribbon"</li><li>"a girl's bralette, constructed of 95% cotton and 5% spandex knit fabric, featuring a v-front neckline, adjustable elastic shoulder straps, elasticized edging, and an adjustable hook and eye closure in the back"</li></ul> |
| 2825  | <ul><li>'tantalum oxide'</li><li>'vanadium pentoxide from the Czech Republic'</li><li>'Cadmium Oxide from Russia'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 4908  | <ul><li>'printed transfers used in sublimation printing on synthetic fabrics'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 7408  | <ul><li>'Military Survival Tin and Combat Survival Tin'</li><li>'copper silicon C65600 braze wire produced in Vietnam'</li><li>'copper silicon C65600 braze wire produced in Vietnam'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 9608  | <ul><li>'a composite ball point pen with opposing ball point and stylus tips'</li><li>'various parts of pens and mechanical clutch pencils imported in bulk from Taiwan'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 3206  | <ul><li>'a grey colored pigment preparation containing titanium dioxide intended for automotive paints and coatings'</li><li>'Pigment Red 104 and Pigment Red 20'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 8548  | <ul><li>'piezoelectric buzzer elements used in various electronic devices'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 7613  | <ul><li>'empty tanks and nitrogen-filled tanks used for detecting and suppressing explosions in pharmaceutical machinery'</li><li>'a Disney Tsum Tsum Design Mega Set'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 3822  | <ul><li>'microcuvettes used in blood diagnostic systems'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 9028  | <ul><li>'an Absolute Digital Encoder Register used in water metering systems'</li><li>'Automatic Meter Reading Devices'</li><li>'a meter reader, a battery system monitor, and a relay tester'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 3501  | <ul><li>'milk protein concentrate designed for processed or imitation cheese'</li><li>'acid casein products manufactured from reconstituted skim milk powder'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 8474  | <ul><li>'a sand mixing machine used in metal foundries that mixes sand with resin material for mold preparation'</li><li>'a stone crushing machine used in the manufacture of cement'</li><li>'mineral separating machines'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                             |
| 7117  | <ul><li>'a gold-plated base metal neck chain and heart-shaped locket imported in a plastic molded packaging tray'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 7614  | <ul><li>'unwrought aluminum alloy from Ukraine'</li><li>'Aluminum Conductor Steel Reinforced cables (ACSR)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 8460  | <ul><li>'CNC roll grinders and related machine tools'</li><li>'a machine used to sharpen periodontal instruments'</li><li>'an orbital grinding machine used for polishing metal pipes and tubes'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 9506  | <ul><li>'a Mask/Goggles/Snorkel/Fins Backpack'</li><li>'a swim set that includes swim goggles, a swim mask, a snorkel, a knitted fabric storage bag, a molded plastic swim box, and ear plugs'</li><li>'a package containing a mask and snorkel set, swimming goggles, a case for the goggles, and a carrying case for everything in the package'</li></ul>                                                                                                                                                                                                                                                                       |
| 5911  | <ul><li>'vacuum filter bags and a liquid filter assembly for use with various vacuum cleaning machines'</li><li>'a continuous screening belt for use on a "Delkor Linear Screen" machine used in the mining industry'</li><li>"printer's rubberized blankets for offset printing"</li></ul>                                                                                                                                                                                                                                                                                                                                       |
| 2811  | <ul><li>'Sulfamide (Sulfuryl Amide)'</li><li>'Nitrous Oxide (CAS # 10024-97-2)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 7016  | <ul><li>'glass tiles and porcelain tiles from Spain'</li><li>'hollow glass block'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 6209  | <ul><li>"infants' garments made of synthetic fibers"</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2833  | <ul><li>'Sodium Persulfate from China'</li><li>'Sodium Hydroxide (Caustic Soda), Phosphates, Sodium Silicate Solution, and Colloidal Graphite preparations'</li><li>'peat-based growing media'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 7410  | <ul><li>'cryogenic insulation in roll form comprised of fiberglass and either copper or aluminum foil'</li><li>'plain copper foil with a thickness of 35 microns (.035 mm)'</li><li>'copper clad laminates consisting of two layers of 99.8% pure copper foil with a prepreg, glass fabric, and plastic resin bonding sheet sandwiched in between, used as a base in the production of printed circuit boards'</li></ul>                                                                                                                                                                                                          |
| 7305  | <ul><li>'structural pipe used as insert piles in an offshore drilling and production platform'</li><li>'longitudinally welded carbon steel pipes produced from secondary steel plate or coil, used for structural purposes such as road boring and tunneling, bridge and building foundations, and drainage'</li><li>'black alloy steel pipes meeting ASTM A53, Type E, Grades A and B, Schedule 40, with outside diameters ranging from 21.3 mm to 457 mm and wall thicknesses from 2.77 mm to 14.27 mm'</li></ul>                                                                                                               |
| 8704  | <ul><li>'an automotive cab and chassis, steel load-carrying members, and a mountable crane'</li><li>'a rider-controlled electronically powered dumper, Model D151AEG, with a 17.6kw electric motor, 1.5 metric ton capacity, and a maximum speed of 14 kilometers per hour'</li></ul>                                                                                                                                                                                                                                                                                                                                             |
| 9305  | <ul><li>'a polyester elastic shotgun shell holder'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2908  | <ul><li>'4-(Trifluoromethyl)phenol'</li><li>'3-Fluoro-4-nitrophenol (solid), imported in bulk form, from China'</li><li>'4-(Trifluoromethyl)phenol'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2927  | <ul><li>'1,5-Naphthalenedisulfonic acid, 3-[(4-amino-5-methoxy-2-methylphenol)azo], disodium salt'</li><li>'p-Phenylaminobenzenediazonium sulfate, Condensation of the p-Phenylaminobenzenediazonium sulfate or 4-Diazonium diphenylamine sulfate and formaldehyde and/or PVA, isolated as the sulfate, and 3-Hydroxynaphthalene-2-carbonyl-(3-morpholinopropy)amine'</li><li>"Ethanol, 2,2'[[4'-[(4-aminophenyl)azo]phenyl]imino]bis, CAS 20721-50-0"</li></ul>                                                                                                                                                                  |
| 7406  | <ul><li>'copper nickel indium thermal spray powder'</li><li>'copper powder with a purity of 99.998% and an average particle diameter of 2.91 microns'</li><li>'bronze powder used in the graphic arts and printing ink industries'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                      |
| 4006  | <ul><li>'unvulcanized gutta-percha cord made in Korea'</li><li>'unvulcanized gutta-percha cord'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 8456  | <ul><li>'an Ultrasonic Cutting Tool designed to cut plastic parts using ultrasonic energy'</li><li>'components of a water-jet cutting machine, specifically a cutting head and pump'</li><li>'a wireless 3D laser printer designed for cutting and engraving various materials'</li></ul>                                                                                                                                                                                                                                                                                                                                         |
| 2822  | <ul><li>'Cobalt Hydroxide, CAS # 21041-93-0'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 4504  | <ul><li>'cork and rubber gasket materials and gaskets'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 9013  | <ul><li>'a handheld laser light source with optional LED light used primarily by first responders in environments where smoke and fire are present'</li><li>'air rifle and air pistol mounts used primarily for holding scopes and sights'</li><li>'parts for Gigaphoton Lasers used in microlithography systems'</li></ul>                                                                                                                                                                                                                                                                                                       |
| 2835  | <ul><li>'cobalt oxides and mixtures containing cobalt oxides'</li><li>'Tripotassium Phosphate (CAS # 7778-53-2)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2821  | <ul><li>'iron trihydroxide CAS # 1309-33-7'</li><li>'iron oxide'</li><li>'Synthetic Iron Oxide'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 6005  | <ul><li>'polyethylene warp knit bale net wrap'</li><li>'polyethylene warp knit bale net wrap'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 4823  | <ul><li>'scrapbook embellishments'</li><li>'Easter grass, polypropylene Easter wrap, and bamboo baskets'</li><li>'molded bamboo pulp bowls and condiment cups'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 9505  | <ul><li>'costume teeth, spectacles, and a costume hat'</li><li>'assorted festive articles including a Gold Tinsel Christmas Tree, Tinsel Leprechaun Hat, Tinsel Uncle Sam Hat, and Black 2015 Glasses'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2913  | <ul><li>'Geraniol, Geranyl acetate, Terpinyl acetate, and Geranyl nitrile'</li><li>'Chloral Trichloroacetaldehyde (CAS 75-87-6)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 7310  | <ul><li>'a stainless steel gravity tank designed to hold oil used in the lubrication system of a marine tunnel thruster'</li><li>'a French Cookie Collection Tin'</li><li>'a series of tin-plated steel sheet metal containers with hinged lids, intended for general container storage, with no internal compartments, not fitted with mechanical or thermal equipment, and of a capacity not exceeding 300 liters'</li></ul>                                                                                                                                                                                                    |
| 8309  | <ul><li>'twist ties and garden markers'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 5609  | <ul><li>'a polypropylene rope handle designed to aid in lifting batteries'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 4821  | <ul><li>'Christmas gift tags made of paper, die-cut, colored, and glitter-coated, with a string for attachment'</li><li>'paper or paperboard gift tags from China'</li><li>'paper gift tags'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 8439  | <ul><li>'Top Rock press rolls used in paper and paperboard making machines'</li><li>'refiner plates used in cellulosic pulp refining machines'</li><li>'de-inking machinery used in the process of making pulp from waste paper'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                        |
| 7222  | <ul><li>'stainless steel wire products used for orthodontic purposes, including wire in 10-inch straight lengths, wire coiled on spools, uprighting springs, and archwires'</li><li>'stainless steel wire products used for orthodontic purposes, including wire in 10-inch straight lengths, wire coiled on spools, uprighting springs, and archwires'</li></ul>                                                                                                                                                                                                                                                                 |
| 8444  | <ul><li>'a filament extrusion line dedicated to the production of polypropylene filaments/yarn'</li><li>'a heat-set quartz drawing machine designed for manufacturing high-purity quartz yarn for national defense applications'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                        |
| 9102  | <ul><li>"a child's wrist watch with a battery-operated quartz movement and fun stickers"</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 7612  | <ul><li>'empty aluminum cans from Germany'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 5806  | <ul><li>'plastic strip and woven fabric "belts" used in the agricultural industry'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 8607  | <ul><li>'Hitachi VVVF AC Inverter Drive Propulsion System used in railway rolling stock'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2853  | <ul><li>'Phosphine Gas, CAS # 7803-51-5, intended for use as a doping agent in semiconductor manufacturing'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 7325  | <ul><li>'a cast iron pedestal stand for candy and gumball vending machines'</li><li>'a Tile Command Center Value Pack containing magnets, dry erase boards, a bulletin board, dry erase markers, and push pins'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                         |
| 7418  | <ul><li>'a bar set consisting of a brass stand, a strainer, a corkscrew, a bottle opener, and a jigger, where each piece has handles made of iron and bone, and all pieces are polished and nickel electroplated'</li><li>'various gas stove parts made of brass and steel'</li><li>'copper rods produced from U.S. origin industrial scrap, processed in Turkey, and returned to the U.S. for further processing into wire'</li></ul>                                                                                                                                                                                            |
| 8462  | <ul><li>'a Nishimura Slitting Machine used in battery manufacturing'</li><li>'brass welding rules and bench-top machine tools'</li><li>'a manually operated rebar cutter designed for cutting solid rebar or metal rod, with an overall length of 52 inches, a net weight of 30 lbs, and a cutting capacity of 3/8 inches to 5/8 inches'</li></ul>                                                                                                                                                                                                                                                                                |
| 3814  | <ul><li>'resist thinner, antistatic screen & keyboard cleaner, heavy-duty cleaner degreaser, and conformal coating stripper'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 7228  | <ul><li>'electrogalvanized alloy steel coils with a titanium content greater than or equal to 0.05%'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 6117  | <ul><li>'pockets made of knit 80% cotton and 20% polyester fabric for blouses, sweatshirts, and pants'</li><li>"a women's knitted capelet accessory made in Hong Kong"</li><li>"a women's knitted capelet accessory made in Hong Kong"</li></ul>                                                                                                                                                                                                                                                                                                                                                                                  |
| 2931  | <ul><li>'Cyfluthrin Technical and Baythroid XL Insecticide'</li><li>'TVS TinLau, also known as Dibutyltin dilaurate, used in the production of paint'</li><li>'Ixazomib in bulk powder form'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 8452  | <ul><li>'industrial sewing machines used in garment factories for the manufacturing of clothing, specifically the Pegasus model numbers EX 5100, EXT 5100, M922/DDM, M932/DDM, and M952/DDM'</li><li>'a hand sewing machine, toy bowling set, and dartboard game'</li><li>'sprayers from China'</li></ul>                                                                                                                                                                                                                                                                                                                         |
| 6406  | <ul><li>'removable insoles and heel pads made of polyurethane elastomer and textile materials'</li><li>'removable footwear insoles with integrated sensors for monitoring physiological parameters'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 7303  | <ul><li>'cast iron cylinder sleeves (or cylinder liners)'</li><li>'cast iron cylinder sleeves'</li><li>'cast iron cylinder sleeves'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2843  | <ul><li>'Silver Sulfadiazine (CAS # 22199-08-2)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 8478  | <ul><li>'a hand-held cigarette maker used to fill cigarette papers with tobacco'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 6203  | <ul><li>'a boys Frankenstein costume consisting of a jacket, pants, T-shirt, and hood made of 100% polyester fabric'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 7907  | <ul><li>'paper punches used for scrapbooking that cut various shapes from paper'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 7211  | <ul><li>'rule die steel from Korea'</li><li>'doctor blade material used in paper manufacturing'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2106  | <ul><li>'a milk protein hydrolysate marketed as a sports science drink'</li><li>'kosher cheese culture media'</li><li>'Deotak P1, a powder mix containing green coffee beans extract and burdock root powder used in the production of chewing gum and tablets'</li></ul>                                                                                                                                                                                                                                                                                                                                                         |
| 8435  | <ul><li>'juice squeezing machines "Zummo" and "Zummito"'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 7019  | <ul><li>'a lead crystal decoration from the Czech Republic'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 3908  | <ul><li>'a range of solvent dyes including Bordeaux DNN, Red NB, Scarlet Y, Red DTXB, and Red KMA'</li><li>'Solvent Yellow 1601 from India'</li><li>'polyamide 6,6 in various forms including flakes, contaminated flakes, ground chunk waste, polymer fines, and fused tangled extrusion wastes'</li></ul>                                                                                                                                                                                                                                                                                                                       |
| 9601  | <ul><li>'various articles of seashell including planters, a vase, wall decoration, and a framed wall mirror'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 4811  | <ul><li>'Armaflex Melamine Edgebanding'</li><li>'printed paper laminated with plastics for packaging'</li><li>'printed and coated paper/foil laminates, plastic sheeting, and paper used in the production of pouches for the food packaging industry'</li></ul>                                                                                                                                                                                                                                                                                                                                                                  |
| 8457  | <ul><li>'an outsole roughing and sanding machine from Italy'</li><li>'vertical machining centers, CNC and manual milling machines, and manual combination drilling and milling machines'</li><li>'a used Makino 5 Axis Horizontal Machining Center Model MCC-2013'</li></ul>                                                                                                                                                                                                                                                                                                                                                      |
| 8416  | <ul><li>'furnace burners for liquid fuel'</li><li>'a pilot light for a gas burner'</li><li>'furnace burners for liquid fuel'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 9016  | <ul><li>'Mettler Toledo XP Professional Level Balances'</li><li>'Professional Level Balances from Mettler Toledo'</li><li>'Professional Level Balances'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 6204  | <ul><li>"children's and infants' costumes including a Toddler Dorothy dress, a Child's Vampire Cape, and Infant Monkey, Rabbit, and Skunk costumes"</li><li>"a women's lined skirt constructed from 62% rayon and 38% polyester woven fabric, featuring an elasticized rib knit waistband and a textile belt threaded through two side belt loops"</li><li>"a woman's sheer dress with a slip-like liner made of polyester"</li></ul>                                                                                                                                                                                             |
| 7215  | <ul><li>'cold-drawn copper-coated welding rods used for arc welding from Italy'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 9613  | <ul><li>'an electrode assembly used to light gas burners and ovens'</li><li>'an electrode assembly used to light gas burners and ovens'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 9603  | <ul><li>'a nine-piece paint roller kit that includes a paint roller handle, paint tray, microfiber roller covers, and corner roller covers'</li><li>"a 'Sterility and Aseptic Technique' training kit from China"</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                       |
| 8541  | <ul><li>'diodes and voltage regulators used in automotive applications'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 7301  | <ul><li>'cross member parts used in trailer landing gear assemblies'</li><li>'trailer landing gear parts'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 8449  | <ul><li>'an Automated Disposable Surgical Mask Production Line'</li><li>'cylinder fillets with needles used on felt making machines'</li><li>'an Electric Needle Felting Machine intended for home use'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 6909  | <ul><li>'a ceramic scintillator plate used in a CT machine'</li><li>'Campagnolo Bottom Bracket bearing and seal kits'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 3403  | <ul><li>'Molykote DX, a solid lubricating paste used on bearings, containing 63 percent petroleum oils'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 8464  | <ul><li>'a portable wet tile saw'</li><li>'a KBH Tumbling System used for the treatment of cured concrete wall and paving stones'</li><li>'a portable wet tile saw'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 6211  | <ul><li>"women's pullover-style blouses constructed of both knit and woven components, featuring a silk front panel and merino wool back panel"</li><li>'a unisex heated vest made in Sri Lanka with a rechargeable lithium-ion battery and power supply made in China'</li></ul>                                                                                                                                                                                                                                                                                                                                                 |
| 9620  | <ul><li>'carbon-fiber telescoping boom poles designed for microphone positioning'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 7225  | <ul><li>'galvannealed steel sheet'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 7319  | <ul><li>'threaded steel eye bolts'</li><li>'a set of interchangeable head crochet hooks with an aluminum handle and steel hooks'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 3207  | <ul><li>'polyvinylchloride (PVC) powder used in automotive applications'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 9105  | <ul><li>'an Ivy Trimmed Wall Clock with Mail and Key Holder'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 8307  | <ul><li>'insulated flexible stainless steel tubing designed for solar hot water systems'</li><li>'flexible stainless steel tubes used to line chimneys for high efficiency gas and oil furnaces'</li><li>'various components of the Ceraflex Flexible Insulated Direct Vent System for oil burning appliances, including a double-walled insulated flexible tube, oil vent terminal, terminal adapter, and burner air adapter'</li></ul>                                                                                                                                                                                          |
| 7004  | <ul><li>'drawn glass and float glass from China'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2914  | <ul><li>'Anthraquinone, also known as 9,10-Anthracenedione, used as a pharmaceutical intermediate'</li><li>'Butylmethoxydibenzoylmethane, Octocrylene, Octyl Methoxycinnamate, Benzophenone-3, and Benzophenone-4'</li><li>'Beta Ionone Natural (CAS 79-77-6)'</li></ul>                                                                                                                                                                                                                                                                                                                                                          |
| 7413  | <ul><li>'flexible copper braid jumpers'</li><li>'copper strands manufactured from scrap gathered in the United States and returned to the United States for further processing'</li><li>'a polyester rope with copper wire strands braided into it, used for electric fencing'</li></ul>                                                                                                                                                                                                                                                                                                                                          |
| 3215  | <ul><li>'Black CRSmax and NewV printing ink, and Color and White CRSmax and NewV printing ink from Germany and India'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8542  | <ul><li>'components of pacemakers used in implantable cardiac devices'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 3305  | <ul><li>'gel conditioning replacement cartridges for hairdryers and flatirons'</li><li>'gel conditioning replacement cartridges used with hairdryers and flatirons'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 8437  | <ul><li>'a Tangential Abrasive De-hulling Device used for research in cereal grain chemistry and snack food research'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 5910  | <ul><li>'semi-finished and finished conveyor belts made of textile and plastics, imported from South Africa'</li><li>'open link conveyor belting used in applications such as weighing belts at airports and treadmill machines'</li><li>'open link conveyor belting items used in applications such as weighing belts at airports and treadmill machines'</li></ul>                                                                                                                                                                                                                                                              |
| 4003  | <ul><li>'a rubber acoustic membrane used in the installation of ceramic tile floors'</li><li>'Speckled Reclaimed Rubber Mats'</li><li>'Load-Grip Anti-Skid Pads and Sheets I, II, III, and IV'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 8802  | <ul><li>'an unmanned aerial vehicle known as the Camcopter'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 4417  | <ul><li>'bamboo rakes from Taiwan'</li><li>'a wooden bracelet-making jig used to knot nylon parachute cord bracelets'</li><li>'bamboo rakes'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 6805  | <ul><li>'abrasive discs and backing pads used with power tools'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 8420  | <ul><li>'freezers from Austria'</li><li>'absorption type refrigerators, freezers, and combined refrigerator/freezers designed for RV use'</li><li>'propane refrigerators and freezers'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 8448  | <ul><li>'tufting machine parts including loopers, clips, and tufting knives'</li><li>'tufting needles used in fabric tufting machines'</li><li>'wax rolls designed for use with textile machines'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2208  | <ul><li>'a gift box containing a 750 ml bottle of Chivas Regal 18-year-old Scotch whiskey and a glass ice bucket'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 9619  | <ul><li>'a reusable babies cloth diaper set and a diaper starter kit'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 3823  | <ul><li>'Isomalt, a mixture of sorbitol and mannitol from West Germany'</li><li>'Micro-sil (Catalyst) Paste and Microsil (Base) Impression Material from Germany'</li><li>'Palmitic Acid 85%-DT80 (Beads)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                              |
| 3606  | <ul><li>'Securiflame Fire-Starter Packets'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 5407  | <ul><li>'woven fabric used as a silt barrier made of 100% polypropylene'</li><li>'various components for the manufacture of agricultural curtains for livestock shelters including cable, fasteners, and olefin woven fabric from China'</li><li>'woven fabric used as a silt barrier made of 100 percent polypropylene'</li></ul>                                                                                                                                                                                                                                                                                                |
| 8303  | <ul><li>'a steel metal safe and enclosure for an Automated Teller Machine (ATM)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 6810  | <ul><li>'tabletop fire pits made of painted cement with a stainless steel inner lining and an iron snuffer'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 8429  | <ul><li>'an oil spill containment system designed to contain oil spills during transfer operations between a ship and a shoreside facility'</li><li>'a John Deere 1200A Bunker & Field machine'</li><li>'a backhoe loader tractor model M59 from Japan'</li></ul>                                                                                                                                                                                                                                                                                                                                                                 |
| 4818  | <ul><li>'rectangular paper tray covers used in medical settings to help prevent cross-contamination and water seepage into equipment and tray surfaces'</li><li>'activity set placemats'</li><li>'hospital tray liners made of 100% cellulose creped paper used for sterilization of medical instruments'</li></ul>                                                                                                                                                                                                                                                                                                               |
| 3401  | <ul><li>'Holiday Duo Soap/Lotion Caddy'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 4420  | <ul><li>'a wooden jewelry chest'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 3404  | <ul><li>'activated polyethylene glycol PEG powder used in manufacturing active pharmaceutical ingredients'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 4414  | <ul><li>'hand carved wood picture frames, small hand carved wood decorative items, and stainless steel cooking ware'</li><li>'wooden photo frames and wooden framed mirrors from New Zealand'</li><li>'a wooden picture frame designed to hold and display a 4 x 6 photo with hinged shutters'</li></ul>                                                                                                                                                                                                                                                                                                                          |
| 8540  | <ul><li>'a monochrome cathode-ray tube, video control circuitry, and a motor used in a camcorder viewfinder assembly'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 9107  | <ul><li>'a modular controller, 6 zone sprinkler timer, 3-station module, and anti-siphon valves'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 3006  | <ul><li>'Boss Small Pet First Aid Kit and Boss Large Pet First Aid Kit'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 6208  | <ul><li>"women's woven pajama sets consisting of 100% polyester knit fleece tops and 100% polyester woven bottoms"</li><li>"women's nightgowns made from 100% polyester fabric and women's nightgowns composed of knit and woven components, both featuring adjustable shoulder straps and unique design elements"</li><li>"a girls' sleep set consisting of a sleeveless nightgown and a long-sleeved robe"</li></ul>                                                                                                                                                                                                            |
| 2818  | <ul><li>'brown aluminum oxide (artificial corundum) abrasive Grade #80 from China'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 7610  | <ul><li>'aluminum door thresholds made from composite materials, specifically styles 9900, 9820, and 8810, designed for installation with outside doors in homes and buildings'</li><li>'an aluminum inswing door sill'</li><li>'aluminum shower doors and ABS plastic shower kits'</li></ul>                                                                                                                                                                                                                                                                                                                                     |
| 8711  | <ul><li>'a competition sidecar with a modified Honda motorcycle engine and spare parts'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 8446  | <ul><li>'a handloom used to weave samples and artwork, featuring 24 harnesses, 2 warp beams, and 2 treadles, capable of weaving a width of 50 centimeters, and controlled by an electronic dobby box connected to a computer'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                           |
| 8440  | <ul><li>'a presentation binding machine'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 4602  | <ul><li>'roll-up window blinds made of plastic oval slats'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2935  | <ul><li>'Sodium Sulfamethazine'</li><li>'Mikrofine TSSC, Mikrofine ADC, Mikrofine TSH, Mikrofine OBSH, and Mikrofine ZBS, which are used as blowing agents in the production of plastics'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 7202  | <ul><li>'a ferroalloy composed of 70% vanadium, 17.4% aluminum, and 11.7% iron, presented in lump form and used as an additive in foundries'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 6303  | <ul><li>'a shower curtain and liner'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 3809  | <ul><li>'finishing agents and dye carriers used in the textile and paper industries, specifically Equifix 4702 and Equispray 3504'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 8506  | <ul><li>'a plastic battery housing for six "AA" alkaline batteries'</li><li>'an aluminum can used in the manufacture of lithium ion cells'</li><li>'a plastic battery housing for six "AA" alkaline batteries'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                          |
| 6206  | <ul><li>"a woman's blouse composed of knit and woven components, with a back panel, sleeves, and neck trim made of 55% ramie and 45% cotton knit fabric, and front panels made of 95% polyester and 5% spandex woven fabric, featuring long sleeves with turn back cuffs, a round neckline, and a full front zippered opening"</li></ul>                                                                                                                                                                                                                                                                                          |
| 8405  | <ul><li>'a biomass gasifier system that converts wood chips into producer gas'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 3821  | <ul><li>'a transport medium kit consisting of a flexible minitip flocked swab and 3 ml of viral transport medium in a round bottom tube, intended for the collection, transport, and preservation of clinical specimens containing viruses'</li></ul>                                                                                                                                                                                                                                                                                                                                                                             |
| 7601  | <ul><li>'high purity/high-density metals for use in the semiconductor and optical industries, specifically 99.999% pure aluminum pellets, 99.95% pure chromium pieces, 99.99% pure nickel pellets, 99.99% pure titanium pellets, and 99.99% pure copper pellets'</li></ul>                                                                                                                                                                                                                                                                                                                                                        |
| 6404  | <ul><li>'parts of roller blades (boot, wheel, and roller bearing)'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 8703  | <ul><li>'a snowmobile and its utility attachments'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 8434  | <ul><li>'a milking machine collection bucket made of stainless steel, designed for use with a dairy machine, featuring an airtight fit and handles for lifting and emptying'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 8521  | <ul><li>'a portable video cassette player set that includes a 4-inch LCD screen, a nylon carrying case, mounting straps, AC/DC power adapter, and power cables'</li><li>'a portable video cassette player set including a 4-inch LCD screen, nylon carrying case, mounting straps, AC/DC power adapter, and power cables'</li></ul>                                                                                                                                                                                                                                                                                               |
| 3812  | <ul><li>'Chimassorb 944 (CAS #70624-18-9), an ultraviolet-light stabilizer for plastics'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2846  | <ul><li>'Scandium Oxide, Silicon Dioxide, and Silicon Monoxide'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 9903  | <ul><li>'a 3-in-1 barbecue tool that includes a spatula and fork made of stainless steel with a plastic handle'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 7018  | <ul><li>'imitation pearl beads of glass and plastic'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 8401  | <ul><li>'a nuclear reactor vessel closure head with control rod drive mechanisms'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2839  | <ul><li>'sodium metasilicate'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 4015  | <ul><li>'a ladies waist cincher made of rubber with a cotton lining'</li><li>'latex examination gloves'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 4702  | <ul><li>'powdered wood pulp composed of partially ground chemical bleached sulfate pulp fibers, dissolving grade type'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 8530  | <ul><li>'LED Traffic Signals'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 8210  | <ul><li>'stainless steel hand-held mechanical ice cream and cookie dough scoops'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 7506  | <ul><li>'Monel (nickel and copper alloy) coils, bronze (copper, phosphorous, and tin alloy) coils, and stainless steel coils'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 3801  | <ul><li>'raw or powdered graphite in colloidal or semi-colloidal suspension for use in lithium ion batteries'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 7017  | <ul><li>'a glass tube principally used in laboratories to hold blood and other biological or scientific material'</li><li>'laboratory ware including microscope slides, plastic tissue/embedding cassettes, and coverslipping tape'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                     |
| 9504  | <ul><li>'Barware Sets in Game Boxes'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 7316  | <ul><li>'stainless steel flat or plow-shaped anchors used to prevent a pleasure yacht from drifting on the water'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 5808  | <ul><li>'Pintlepins used in the paper making industry'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 3205  | <ul><li>'Carmine Color #40'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2834  | <ul><li>'Ammonium Perchlorate Solution from Germany'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 8310  | <ul><li>'plastic and metal labels'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 4303  | <ul><li>'a ladies rabbit fur and textile jacket and a leather and textile jacket'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 8803  | <ul><li>'a Bolt Assembly used in aircraft flap mechanisms'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 8213  | <ul><li>'garden shears'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 7212  | <ul><li>'valley roll flashing material used in roofing applications made of nonalloy steel with a Galvalume coating'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 4816  | <ul><li>'a kit containing 12 paper rolls, 1 inked ribbon cartridge, and 1 swipe head-cleaning card'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 6202  | <ul><li>"a woman's hip-length jacket made of 100% cotton, featuring multiple pockets and compartments containing various functional items such as a comb, hair brush, toothbrush, and other beauty accessories"</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                         |
| 4203  | <ul><li>'a holster made of caiman or iguana leather with pig leather lining, featuring two attached pockets for fashion purposes'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2923  | <ul><li>'Egg Yoke Lecithin, pharmaceutical grade, (CAS #93685-90-6) from Japan'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 3807  | <ul><li>'Pyroligneous Acid (CAS# 8030-97-5), also known as wood vinegar or wood juice, which is produced through the destructive distillation of wood and intended for use as a plant growth stimulator'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                |
| 4901  | <ul><li>'a boxed kit containing a printed book about coffee, two porcelain espresso cups, two porcelain saucers, and a battery-operated frother'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 7403  | <ul><li>'brass billets'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 4810  | <ul><li>'various grades of release paper'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 1404  | <ul><li>'a plant growing medium consisting of a mixture of coco coir, vermiculite, polyurethane, and control-released fertilizer, intended for use in hydroponic systems'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2919  | <ul><li>'imported herbs and spices such as black pepper, cinnamon, and basil'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 3202  | <ul><li>'a tanning preparation consisting of a mixture of organic and inorganic tanning substances, primarily containing chromium hydroxide sulfate'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 5404  | <ul><li>'poly products solid colors decorative ribbon, made of polypropylene, with widths of 5 mm or less'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 4808  | <ul><li>'Top Sheet with PE Flap used for covering pallets of processed seafood'</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## Uses

### Direct Use for Inference

First install the SetFit library:

```bash
pip install setfit
```

Then you can load this model and run inference.

```python
from setfit import SetFitModel

# Download from the 🤗 Hub
model = SetFitModel.from_pretrained("setfit_model_id")
# Run inference
preds = model("3-Fluoroaniline, CAS # 372-19-0, imported in bulk form from China")
```

<!--
### Downstream Use

*List how someone could finetune this model on their own dataset.*
-->

<!--
### Out-of-Scope Use

*List how the model may foreseeably be misused and address what users ought not to do with the model.*
-->

<!--
## Bias, Risks and Limitations

*What are the known or foreseeable issues stemming from this model? You could also flag here known failure cases or weaknesses of the model.*
-->

<!--
### Recommendations

*What are recommendations with respect to the foreseeable issues? For example, filtering explicit content.*
-->

## Training Details

### Training Set Metrics
| Training set | Min | Median  | Max |
|:-------------|:----|:--------|:----|
| Word count   | 1   | 13.2157 | 64  |

| Label | Training Sample Count |
|:------|:----------------------|
| 3910  | 15                    |
| 8453  | 3                     |
| 2901  | 21                    |
| 8703  | 1                     |
| 8428  | 23                    |
| 4005  | 15                    |
| 4908  | 1                     |
| 7607  | 4                     |
| 7017  | 2                     |
| 8527  | 62                    |
| 4417  | 3                     |
| 0902  | 2                     |
| 8446  | 1                     |
| 2909  | 50                    |
| 9405  | 7                     |
| 8539  | 7                     |
| 9503  | 8                     |
| 7018  | 1                     |
| 7419  | 4                     |
| 6305  | 1                     |
| 2935  | 2                     |
| 9802  | 2                     |
| 8423  | 55                    |
| 6210  | 2                     |
| 6116  | 17                    |
| 8528  | 34                    |
| 8205  | 210                   |
| 2919  | 1                     |
| 2818  | 1                     |
| 6202  | 1                     |
| 2908  | 4                     |
| 8410  | 10                    |
| 2817  | 3                     |
| 9014  | 16                    |
| 8415  | 28                    |
| 9105  | 1                     |
| 2816  | 5                     |
| 6107  | 37                    |
| 7305  | 13                    |
| 8538  | 18                    |
| 2835  | 2                     |
| 8439  | 7                     |
| 8477  | 18                    |
| 8214  | 5                     |
| 7314  | 14                    |
| 2703  | 9                     |
| 9016  | 4                     |
| 3827  | 1                     |
| 7616  | 24                    |
| 5407  | 3                     |
| 2208  | 1                     |
| 3822  | 1                     |
| 9027  | 85                    |
| 2918  | 13                    |
| 9102  | 1                     |
| 8427  | 13                    |
| 4602  | 1                     |
| 6111  | 161                   |
| 4412  | 1                     |
| 8501  | 91                    |
| 9401  | 17                    |
| 8482  | 119                   |
| 4414  | 3                     |
| 6112  | 71                    |
| 3905  | 39                    |
| 2815  | 1                     |
| 3815  | 2                     |
| 7407  | 7                     |
| 3503  | 5                     |
| 8429  | 3                     |
| 9017  | 5                     |
| 3403  | 1                     |
| 8406  | 4                     |
| 7310  | 4                     |
| 3501  | 2                     |
| 3210  | 1                     |
| 7311  | 12                    |
| 3305  | 2                     |
| 3402  | 25                    |
| 4008  | 13                    |
| 9005  | 13                    |
| 3909  | 58                    |
| 5903  | 6                     |
| 2910  | 5                     |
| 9018  | 116                   |
| 9003  | 14                    |
| 9505  | 2                     |
| 8547  | 2                     |
| 9011  | 7                     |
| 4808  | 1                     |
| 8536  | 63                    |
| 8515  | 31                    |
| 9608  | 2                     |
| 2914  | 6                     |
| 8504  | 47                    |
| 8525  | 23                    |
| 7013  | 11                    |
| 2928  | 3                     |
| 5602  | 1                     |
| 9031  | 62                    |
| 8407  | 39                    |
| 8207  | 94                    |
| 8421  | 7                     |
| 8535  | 8                     |
| 8476  | 20                    |
| 3404  | 1                     |
| 6105  | 17                    |
| 9028  | 3                     |
| 9803  | 1                     |
| 3918  | 42                    |
| 8510  | 4                     |
| 8537  | 21                    |
| 9613  | 2                     |
| 6815  | 4                     |
| 3903  | 23                    |
| 7306  | 102                   |
| 7016  | 2                     |
| 7215  | 1                     |
| 2932  | 12                    |
| 7325  | 2                     |
| 8530  | 1                     |
| 3921  | 349                   |
| 7415  | 13                    |
| 2904  | 35                    |
| 8443  | 34                    |
| 8402  | 7                     |
| 9025  | 45                    |
| 6109  | 80                    |
| 7301  | 2                     |
| 8502  | 17                    |
| 8420  | 3                     |
| 8458  | 9                     |
| 8503  | 11                    |
| 7019  | 1                     |
| 3004  | 3                     |
| 3807  | 1                     |
| 8470  | 10                    |
| 8401  | 1                     |
| 9026  | 38                    |
| 8412  | 97                    |
| 8714  | 5                     |
| 4821  | 8                     |
| 2836  | 4                     |
| 4820  | 5                     |
| 9504  | 1                     |
| 3902  | 16                    |
| 6909  | 2                     |
| 7406  | 3                     |
| 2905  | 65                    |
| 8505  | 48                    |
| 2926  | 17                    |
| 6810  | 1                     |
| 4816  | 1                     |
| 6404  | 1                     |
| 8548  | 1                     |
| 6106  | 38                    |
| 9030  | 31                    |
| 3206  | 2                     |
| 8437  | 1                     |
| 4012  | 3                     |
| 2825  | 11                    |
| 8435  | 1                     |
| 8442  | 7                     |
| 8206  | 20                    |
| 2826  | 6                     |
| 9002  | 44                    |
| 3507  | 20                    |
| 2853  | 1                     |
| 8208  | 17                    |
| 2846  | 1                     |
| 6113  | 34                    |
| 3907  | 35                    |
| 7413  | 3                     |
| 8521  | 2                     |
| 7202  | 1                     |
| 3204  | 15                    |
| 4014  | 5                     |
| 8461  | 23                    |
| 8532  | 18                    |
| 3912  | 26                    |
| 2804  | 2                     |
| 8542  | 1                     |
| 6005  | 2                     |
| 8431  | 49                    |
| 2941  | 4                     |
| 4823  | 3                     |
| 2839  | 1                     |
| 8484  | 2                     |
| 4911  | 12                    |
| 4702  | 1                     |
| 2921  | 21                    |
| 8444  | 2                     |
| 8438  | 23                    |
| 8451  | 12                    |
| 4818  | 4                     |
| 2929  | 9                     |
| 2710  | 4                     |
| 3911  | 17                    |
| 8422  | 4                     |
| 3809  | 1                     |
| 3506  | 57                    |
| 6110  | 758                   |
| 7318  | 194                   |
| 3906  | 61                    |
| 4002  | 32                    |
| 7212  | 1                     |
| 3814  | 1                     |
| 2830  | 5                     |
| 9024  | 6                     |
| 2902  | 21                    |
| 8430  | 21                    |
| 8414  | 72                    |
| 3812  | 1                     |
| 7606  | 14                    |
| 8531  | 14                    |
| 7216  | 2                     |
| 2707  | 5                     |
| 2811  | 2                     |
| 8465  | 29                    |
| 9817  | 8                     |
| 9007  | 3                     |
| 4009  | 16                    |
| 7225  | 1                     |
| 8464  | 3                     |
| 6101  | 140                   |
| 8457  | 7                     |
| 7610  | 3                     |
| 8472  | 14                    |
| 7222  | 2                     |
| 4810  | 1                     |
| 3915  | 26                    |
| 3606  | 1                     |
| 8543  | 33                    |
| 5911  | 4                     |
| 9008  | 14                    |
| 7317  | 28                    |
| 7303  | 5                     |
| 6103  | 121                   |
| 4015  | 2                     |
| 3801  | 1                     |
| 6108  | 120                   |
| 7228  | 1                     |
| 8486  | 16                    |
| 8708  | 32                    |
| 4001  | 5                     |
| 4418  | 1                     |
| 8403  | 13                    |
| 9001  | 31                    |
| 7210  | 3                     |
| 8473  | 27                    |
| 2933  | 82                    |
| 8210  | 1                     |
| 9013  | 21                    |
| 8487  | 26                    |
| 8456  | 8                     |
| 8102  | 1                     |
| 2831  | 4                     |
| 3504  | 36                    |
| 8450  | 16                    |
| 7409  | 12                    |
| 8533  | 6                     |
| 8307  | 3                     |
| 8507  | 13                    |
| 8802  | 1                     |
| 7211  | 2                     |
| 4420  | 1                     |
| 6805  | 1                     |
| 8213  | 1                     |
| 6104  | 168                   |
| 1020  | 1                     |
| 3925  | 50                    |
| 8466  | 70                    |
| 3502  | 4                     |
| 4011  | 49                    |
| 9023  | 36                    |
| 8432  | 10                    |
| 6208  | 3                     |
| 3916  | 44                    |
| 2820  | 3                     |
| 7316  | 1                     |
| 2916  | 44                    |
| 8209  | 10                    |
| 5806  | 1                     |
| 4203  | 1                     |
| 8459  | 8                     |
| 8512  | 31                    |
| 8452  | 3                     |
| 9006  | 9                     |
| 7410  | 5                     |
| 8524  | 4                     |
| 8419  | 21                    |
| 3919  | 93                    |
| 8433  | 14                    |
| 9619  | 1                     |
| 5808  | 1                     |
| 8716  | 27                    |
| 8202  | 32                    |
| 8215  | 82                    |
| 5404  | 1                     |
| 3215  | 1                     |
| 2924  | 17                    |
| 4504  | 1                     |
| 7907  | 1                     |
| 8204  | 63                    |
| 7117  | 1                     |
| 2917  | 29                    |
| 9506  | 6                     |
| 9404  | 1                     |
| 4006  | 2                     |
| 7004  | 1                     |
| 9305  | 1                     |
| 3205  | 1                     |
| 8544  | 10                    |
| 7601  | 1                     |
| 3926  | 240                   |
| 8704  | 2                     |
| 3401  | 1                     |
| 9032  | 41                    |
| 2913  | 2                     |
| 8508  | 13                    |
| 7323  | 97                    |
| 2843  | 1                     |
| 8408  | 13                    |
| 3920  | 207                   |
| 4016  | 21                    |
| 1404  | 1                     |
| 9021  | 29                    |
| 6102  | 313                   |
| 8481  | 468                   |
| 8526  | 19                    |
| 4010  | 9                     |
| 8540  | 1                     |
| 8417  | 4                     |
| 5910  | 3                     |
| 8425  | 38                    |
| 8471  | 58                    |
| 2906  | 36                    |
| 9019  | 47                    |
| 2834  | 1                     |
| 8411  | 38                    |
| 7322  | 20                    |
| 8529  | 52                    |
| 8514  | 14                    |
| 3202  | 1                     |
| 8509  | 18                    |
| 6114  | 35                    |
| 3901  | 23                    |
| 2833  | 4                     |
| 6204  | 7                     |
| 8518  | 16                    |
| 7009  | 31                    |
| 8478  | 1                     |
| 2923  | 1                     |
| 2907  | 33                    |
| 8506  | 4                     |
| 9015  | 37                    |
| 8462  | 7                     |
| 8445  | 12                    |
| 9010  | 6                     |
| 2911  | 9                     |
| 3207  | 1                     |
| 2827  | 11                    |
| 2828  | 2                     |
| 7229  | 8                     |
| 8448  | 5                     |
| 8463  | 9                     |
| 7612  | 1                     |
| 8516  | 113                   |
| 6307  | 9                     |
| 3823  | 3                     |
| 8517  | 19                    |
| 7010  | 6                     |
| 4411  | 1                     |
| 7412  | 18                    |
| 8534  | 19                    |
| 7615  | 15                    |
| 8803  | 1                     |
| 9903  | 1                     |
| 9020  | 15                    |
| 7219  | 3                     |
| 7308  | 42                    |
| 9022  | 46                    |
| 4202  | 173                   |
| 4421  | 1                     |
| 7507  | 3                     |
| 8302  | 10                    |
| 6205  | 3                     |
| 7321  | 76                    |
| 7403  | 1                     |
| 3924  | 56                    |
| 3913  | 28                    |
| 7302  | 9                     |
| 7506  | 1                     |
| 8434  | 1                     |
| 4901  | 1                     |
| 8409  | 62                    |
| 2106  | 3                     |
| 8483  | 59                    |
| 3914  | 11                    |
| 7326  | 53                    |
| 7614  | 2                     |
| 4003  | 6                     |
| 6216  | 1                     |
| 3821  | 1                     |
| 2931  | 5                     |
| 8511  | 36                    |
| 8455  | 11                    |
| 7319  | 2                     |
| 8203  | 112                   |
| 9821  | 1                     |
| 9601  | 1                     |
| 3923  | 200                   |
| 8449  | 5                     |
| 8519  | 19                    |
| 8418  | 14                    |
| 5609  | 1                     |
| 8523  | 20                    |
| 8201  | 137                   |
| 3505  | 12                    |
| 9902  | 3                     |
| 7408  | 5                     |
| 3917  | 48                    |
| 7002  | 2                     |
| 8310  | 1                     |
| 9012  | 4                     |
| 2832  | 1                     |
| 6211  | 2                     |
| 7307  | 150                   |
| 8211  | 80                    |
| 7320  | 22                    |
| 8424  | 72                    |
| 8485  | 5                     |
| 2915  | 47                    |
| 2930  | 68                    |
| 2934  | 7                     |
| 6212  | 7                     |
| 6206  | 1                     |
| 3904  | 53                    |
| 8711  | 1                     |
| 8447  | 3                     |
| 8404  | 6                     |
| 8436  | 9                     |
| 6303  | 1                     |
| 6117  | 3                     |
| 9107  | 1                     |
| 8426  | 25                    |
| 6406  | 2                     |
| 8513  | 7                     |
| 8607  | 1                     |
| 8212  | 3                     |
| 3006  | 1                     |
| 7411  | 12                    |
| 7418  | 3                     |
| 2822  | 1                     |
| 8440  | 1                     |
| 9403  | 15                    |
| 8405  | 1                     |
| 8480  | 33                    |
| 8416  | 5                     |
| 8413  | 74                    |
| 4303  | 1                     |
| 2841  | 4                     |
| 8441  | 17                    |
| 7312  | 20                    |
| 3922  | 42                    |
| 9029  | 41                    |
| 2925  | 9                     |
| 8467  | 75                    |
| 7309  | 7                     |
| 3824  | 14                    |
| 7324  | 4                     |
| 2912  | 32                    |
| 8474  | 6                     |
| 7315  | 32                    |
| 6505  | 2                     |
| 8479  | 79                    |
| 5603  | 8                     |
| 9603  | 2                     |
| 8541  | 1                     |
| 2903  | 27                    |
| 8303  | 1                     |
| 2927  | 3                     |
| 7005  | 1                     |
| 7304  | 155                   |
| 6203  | 1                     |
| 3214  | 8                     |
| 8454  | 14                    |
| 3908  | 5                     |
| 9620  | 1                     |
| 8460  | 7                     |
| 4811  | 7                     |
| 8309  | 1                     |
| 2821  | 4                     |
| 2922  | 12                    |
| 9004  | 35                    |
| 7613  | 2                     |
| 8468  | 4                     |
| 6209  | 1                     |

### Training Hyperparameters
- batch_size: (8, 8)
- num_epochs: (3, 3)
- max_steps: -1
- sampling_strategy: oversampling
- num_iterations: 10
- body_learning_rate: (2e-05, 1e-05)
- head_learning_rate: 0.01
- loss: CosineSimilarityLoss
- distance_metric: cosine_distance
- margin: 0.25
- end_to_end: False
- use_amp: False
- warmup_proportion: 0.1
- l2_weight: 0.01
- seed: 42
- evaluation_strategy: no
- eval_max_steps: -1
- load_best_model_at_end: False

### Training Results
| Epoch  | Step  | Training Loss | Validation Loss |
|:------:|:-----:|:-------------:|:---------------:|
| 0.0000 | 1     | 0.2115        | -               |
| 0.0017 | 50    | 0.1796        | -               |
| 0.0033 | 100   | 0.2108        | -               |
| 0.005  | 150   | 0.1922        | -               |
| 0.0067 | 200   | 0.1887        | -               |
| 0.0083 | 250   | 0.1725        | -               |
| 0.01   | 300   | 0.1631        | -               |
| 0.0117 | 350   | 0.1487        | -               |
| 0.0133 | 400   | 0.1645        | -               |
| 0.015  | 450   | 0.1507        | -               |
| 0.0167 | 500   | 0.1479        | -               |
| 0.0183 | 550   | 0.1397        | -               |
| 0.02   | 600   | 0.1518        | -               |
| 0.0217 | 650   | 0.1338        | -               |
| 0.0233 | 700   | 0.1348        | -               |
| 0.025  | 750   | 0.1309        | -               |
| 0.0267 | 800   | 0.135         | -               |
| 0.0283 | 850   | 0.1254        | -               |
| 0.03   | 900   | 0.1317        | -               |
| 0.0317 | 950   | 0.1366        | -               |
| 0.0333 | 1000  | 0.115         | -               |
| 0.035  | 1050  | 0.1238        | -               |
| 0.0367 | 1100  | 0.1283        | -               |
| 0.0383 | 1150  | 0.1151        | -               |
| 0.04   | 1200  | 0.107         | -               |
| 0.0417 | 1250  | 0.1176        | -               |
| 0.0433 | 1300  | 0.1234        | -               |
| 0.045  | 1350  | 0.1105        | -               |
| 0.0467 | 1400  | 0.1128        | -               |
| 0.0483 | 1450  | 0.1193        | -               |
| 0.05   | 1500  | 0.1058        | -               |
| 0.0517 | 1550  | 0.1003        | -               |
| 0.0533 | 1600  | 0.1075        | -               |
| 0.055  | 1650  | 0.1006        | -               |
| 0.0567 | 1700  | 0.1043        | -               |
| 0.0583 | 1750  | 0.1088        | -               |
| 0.06   | 1800  | 0.0993        | -               |
| 0.0617 | 1850  | 0.1054        | -               |
| 0.0633 | 1900  | 0.1018        | -               |
| 0.065  | 1950  | 0.1126        | -               |
| 0.0667 | 2000  | 0.1005        | -               |
| 0.0683 | 2050  | 0.0967        | -               |
| 0.07   | 2100  | 0.1106        | -               |
| 0.0717 | 2150  | 0.1077        | -               |
| 0.0733 | 2200  | 0.1005        | -               |
| 0.075  | 2250  | 0.0914        | -               |
| 0.0767 | 2300  | 0.0989        | -               |
| 0.0783 | 2350  | 0.1043        | -               |
| 0.08   | 2400  | 0.0948        | -               |
| 0.0817 | 2450  | 0.0959        | -               |
| 0.0833 | 2500  | 0.1056        | -               |
| 0.085  | 2550  | 0.091         | -               |
| 0.0867 | 2600  | 0.091         | -               |
| 0.0883 | 2650  | 0.0919        | -               |
| 0.09   | 2700  | 0.0907        | -               |
| 0.0917 | 2750  | 0.0961        | -               |
| 0.0933 | 2800  | 0.0784        | -               |
| 0.095  | 2850  | 0.0965        | -               |
| 0.0967 | 2900  | 0.077         | -               |
| 0.0983 | 2950  | 0.0945        | -               |
| 0.1    | 3000  | 0.1099        | -               |
| 0.1017 | 3050  | 0.0884        | -               |
| 0.1033 | 3100  | 0.0907        | -               |
| 0.105  | 3150  | 0.089         | -               |
| 0.1067 | 3200  | 0.0943        | -               |
| 0.1083 | 3250  | 0.0967        | -               |
| 0.11   | 3300  | 0.0935        | -               |
| 0.1117 | 3350  | 0.0935        | -               |
| 0.1133 | 3400  | 0.0822        | -               |
| 0.115  | 3450  | 0.0876        | -               |
| 0.1167 | 3500  | 0.0915        | -               |
| 0.1183 | 3550  | 0.0799        | -               |
| 0.12   | 3600  | 0.1064        | -               |
| 0.1217 | 3650  | 0.0956        | -               |
| 0.1233 | 3700  | 0.0883        | -               |
| 0.125  | 3750  | 0.0687        | -               |
| 0.1267 | 3800  | 0.079         | -               |
| 0.1283 | 3850  | 0.0855        | -               |
| 0.13   | 3900  | 0.0821        | -               |
| 0.1317 | 3950  | 0.0797        | -               |
| 0.1333 | 4000  | 0.077         | -               |
| 0.135  | 4050  | 0.0901        | -               |
| 0.1367 | 4100  | 0.0701        | -               |
| 0.1383 | 4150  | 0.0902        | -               |
| 0.14   | 4200  | 0.0669        | -               |
| 0.1417 | 4250  | 0.0702        | -               |
| 0.1433 | 4300  | 0.089         | -               |
| 0.145  | 4350  | 0.0872        | -               |
| 0.1467 | 4400  | 0.0864        | -               |
| 0.1483 | 4450  | 0.0662        | -               |
| 0.15   | 4500  | 0.0751        | -               |
| 0.1517 | 4550  | 0.0823        | -               |
| 0.1533 | 4600  | 0.0823        | -               |
| 0.155  | 4650  | 0.0942        | -               |
| 0.1567 | 4700  | 0.0781        | -               |
| 0.1583 | 4750  | 0.0884        | -               |
| 0.16   | 4800  | 0.0665        | -               |
| 0.1617 | 4850  | 0.0752        | -               |
| 0.1633 | 4900  | 0.0595        | -               |
| 0.165  | 4950  | 0.0955        | -               |
| 0.1667 | 5000  | 0.0766        | -               |
| 0.1683 | 5050  | 0.0715        | -               |
| 0.17   | 5100  | 0.0827        | -               |
| 0.1717 | 5150  | 0.0777        | -               |
| 0.1733 | 5200  | 0.084         | -               |
| 0.175  | 5250  | 0.0627        | -               |
| 0.1767 | 5300  | 0.0667        | -               |
| 0.1783 | 5350  | 0.0771        | -               |
| 0.18   | 5400  | 0.09          | -               |
| 0.1817 | 5450  | 0.0746        | -               |
| 0.1833 | 5500  | 0.0697        | -               |
| 0.185  | 5550  | 0.0666        | -               |
| 0.1867 | 5600  | 0.0589        | -               |
| 0.1883 | 5650  | 0.0787        | -               |
| 0.19   | 5700  | 0.0774        | -               |
| 0.1917 | 5750  | 0.0638        | -               |
| 0.1933 | 5800  | 0.0737        | -               |
| 0.195  | 5850  | 0.0655        | -               |
| 0.1967 | 5900  | 0.0729        | -               |
| 0.1983 | 5950  | 0.0704        | -               |
| 0.2    | 6000  | 0.085         | -               |
| 0.2017 | 6050  | 0.0755        | -               |
| 0.2033 | 6100  | 0.0808        | -               |
| 0.205  | 6150  | 0.095         | -               |
| 0.2067 | 6200  | 0.0782        | -               |
| 0.2083 | 6250  | 0.0802        | -               |
| 0.21   | 6300  | 0.0715        | -               |
| 0.2117 | 6350  | 0.0708        | -               |
| 0.2133 | 6400  | 0.0649        | -               |
| 0.215  | 6450  | 0.0746        | -               |
| 0.2167 | 6500  | 0.063         | -               |
| 0.2183 | 6550  | 0.0665        | -               |
| 0.22   | 6600  | 0.0653        | -               |
| 0.2217 | 6650  | 0.0714        | -               |
| 0.2233 | 6700  | 0.0598        | -               |
| 0.225  | 6750  | 0.0695        | -               |
| 0.2267 | 6800  | 0.0633        | -               |
| 0.2283 | 6850  | 0.0687        | -               |
| 0.23   | 6900  | 0.0628        | -               |
| 0.2317 | 6950  | 0.0712        | -               |
| 0.2333 | 7000  | 0.0633        | -               |
| 0.235  | 7050  | 0.0717        | -               |
| 0.2367 | 7100  | 0.0816        | -               |
| 0.2383 | 7150  | 0.08          | -               |
| 0.24   | 7200  | 0.0565        | -               |
| 0.2417 | 7250  | 0.0625        | -               |
| 0.2433 | 7300  | 0.0765        | -               |
| 0.245  | 7350  | 0.0697        | -               |
| 0.2467 | 7400  | 0.0654        | -               |
| 0.2483 | 7450  | 0.0635        | -               |
| 0.25   | 7500  | 0.0746        | -               |
| 0.2517 | 7550  | 0.056         | -               |
| 0.2533 | 7600  | 0.0623        | -               |
| 0.255  | 7650  | 0.0738        | -               |
| 0.2567 | 7700  | 0.0808        | -               |
| 0.2583 | 7750  | 0.063         | -               |
| 0.26   | 7800  | 0.063         | -               |
| 0.2617 | 7850  | 0.0733        | -               |
| 0.2633 | 7900  | 0.0719        | -               |
| 0.265  | 7950  | 0.0654        | -               |
| 0.2667 | 8000  | 0.0568        | -               |
| 0.2683 | 8050  | 0.0594        | -               |
| 0.27   | 8100  | 0.0513        | -               |
| 0.2717 | 8150  | 0.0519        | -               |
| 0.2733 | 8200  | 0.0803        | -               |
| 0.275  | 8250  | 0.0508        | -               |
| 0.2767 | 8300  | 0.0659        | -               |
| 0.2783 | 8350  | 0.0604        | -               |
| 0.28   | 8400  | 0.0775        | -               |
| 0.2817 | 8450  | 0.0581        | -               |
| 0.2833 | 8500  | 0.0617        | -               |
| 0.285  | 8550  | 0.0621        | -               |
| 0.2867 | 8600  | 0.0698        | -               |
| 0.2883 | 8650  | 0.0698        | -               |
| 0.29   | 8700  | 0.0541        | -               |
| 0.2917 | 8750  | 0.0635        | -               |
| 0.2933 | 8800  | 0.0565        | -               |
| 0.295  | 8850  | 0.0621        | -               |
| 0.2967 | 8900  | 0.0637        | -               |
| 0.2983 | 8950  | 0.0588        | -               |
| 0.3    | 9000  | 0.0535        | -               |
| 0.3017 | 9050  | 0.0639        | -               |
| 0.3033 | 9100  | 0.0635        | -               |
| 0.305  | 9150  | 0.0522        | -               |
| 0.3067 | 9200  | 0.0534        | -               |
| 0.3083 | 9250  | 0.0651        | -               |
| 0.31   | 9300  | 0.0659        | -               |
| 0.3117 | 9350  | 0.068         | -               |
| 0.3133 | 9400  | 0.0501        | -               |
| 0.315  | 9450  | 0.0669        | -               |
| 0.3167 | 9500  | 0.0632        | -               |
| 0.3183 | 9550  | 0.0744        | -               |
| 0.32   | 9600  | 0.0573        | -               |
| 0.3217 | 9650  | 0.058         | -               |
| 0.3233 | 9700  | 0.0607        | -               |
| 0.325  | 9750  | 0.0578        | -               |
| 0.3267 | 9800  | 0.0557        | -               |
| 0.3283 | 9850  | 0.0616        | -               |
| 0.33   | 9900  | 0.0502        | -               |
| 0.3317 | 9950  | 0.0593        | -               |
| 0.3333 | 10000 | 0.0542        | -               |
| 0.335  | 10050 | 0.0727        | -               |
| 0.3367 | 10100 | 0.0475        | -               |
| 0.3383 | 10150 | 0.0593        | -               |
| 0.34   | 10200 | 0.0627        | -               |
| 0.3417 | 10250 | 0.0522        | -               |
| 0.3433 | 10300 | 0.0646        | -               |
| 0.345  | 10350 | 0.0652        | -               |
| 0.3467 | 10400 | 0.0536        | -               |
| 0.3483 | 10450 | 0.0594        | -               |
| 0.35   | 10500 | 0.0686        | -               |
| 0.3517 | 10550 | 0.0492        | -               |
| 0.3533 | 10600 | 0.0503        | -               |
| 0.355  | 10650 | 0.0575        | -               |
| 0.3567 | 10700 | 0.0567        | -               |
| 0.3583 | 10750 | 0.0681        | -               |
| 0.36   | 10800 | 0.0597        | -               |
| 0.3617 | 10850 | 0.0509        | -               |
| 0.3633 | 10900 | 0.0512        | -               |
| 0.365  | 10950 | 0.0623        | -               |
| 0.3667 | 11000 | 0.0736        | -               |
| 0.3683 | 11050 | 0.0525        | -               |
| 0.37   | 11100 | 0.0579        | -               |
| 0.3717 | 11150 | 0.0636        | -               |
| 0.3733 | 11200 | 0.0481        | -               |
| 0.375  | 11250 | 0.0521        | -               |
| 0.3767 | 11300 | 0.0389        | -               |
| 0.3783 | 11350 | 0.0417        | -               |
| 0.38   | 11400 | 0.0477        | -               |
| 0.3817 | 11450 | 0.0473        | -               |
| 0.3833 | 11500 | 0.047         | -               |
| 0.385  | 11550 | 0.036         | -               |
| 0.3867 | 11600 | 0.0593        | -               |
| 0.3883 | 11650 | 0.0584        | -               |
| 0.39   | 11700 | 0.0668        | -               |
| 0.3917 | 11750 | 0.0497        | -               |
| 0.3933 | 11800 | 0.0609        | -               |
| 0.395  | 11850 | 0.0556        | -               |
| 0.3967 | 11900 | 0.0557        | -               |
| 0.3983 | 11950 | 0.0463        | -               |
| 0.4    | 12000 | 0.0526        | -               |
| 0.4017 | 12050 | 0.0447        | -               |
| 0.4033 | 12100 | 0.0634        | -               |
| 0.405  | 12150 | 0.0459        | -               |
| 0.4067 | 12200 | 0.0418        | -               |
| 0.4083 | 12250 | 0.054         | -               |
| 0.41   | 12300 | 0.0563        | -               |
| 0.4117 | 12350 | 0.0496        | -               |
| 0.4133 | 12400 | 0.0503        | -               |
| 0.415  | 12450 | 0.0497        | -               |
| 0.4167 | 12500 | 0.0532        | -               |
| 0.4183 | 12550 | 0.0552        | -               |
| 0.42   | 12600 | 0.0496        | -               |
| 0.4217 | 12650 | 0.0513        | -               |
| 0.4233 | 12700 | 0.0581        | -               |
| 0.425  | 12750 | 0.0524        | -               |
| 0.4267 | 12800 | 0.052         | -               |
| 0.4283 | 12850 | 0.0333        | -               |
| 0.43   | 12900 | 0.0492        | -               |
| 0.4317 | 12950 | 0.0666        | -               |
| 0.4333 | 13000 | 0.0463        | -               |
| 0.435  | 13050 | 0.0568        | -               |
| 0.4367 | 13100 | 0.051         | -               |
| 0.4383 | 13150 | 0.054         | -               |
| 0.44   | 13200 | 0.0607        | -               |
| 0.4417 | 13250 | 0.0405        | -               |
| 0.4433 | 13300 | 0.0492        | -               |
| 0.445  | 13350 | 0.0437        | -               |
| 0.4467 | 13400 | 0.0424        | -               |
| 0.4483 | 13450 | 0.0412        | -               |
| 0.45   | 13500 | 0.0575        | -               |
| 0.4517 | 13550 | 0.0617        | -               |
| 0.4533 | 13600 | 0.0399        | -               |
| 0.455  | 13650 | 0.0445        | -               |
| 0.4567 | 13700 | 0.0403        | -               |
| 0.4583 | 13750 | 0.0456        | -               |
| 0.46   | 13800 | 0.0432        | -               |
| 0.4617 | 13850 | 0.0525        | -               |
| 0.4633 | 13900 | 0.0475        | -               |
| 0.465  | 13950 | 0.062         | -               |
| 0.4667 | 14000 | 0.0403        | -               |
| 0.4683 | 14050 | 0.0437        | -               |
| 0.47   | 14100 | 0.0371        | -               |
| 0.4717 | 14150 | 0.0445        | -               |
| 0.4733 | 14200 | 0.038         | -               |
| 0.475  | 14250 | 0.0449        | -               |
| 0.4767 | 14300 | 0.0429        | -               |
| 0.4783 | 14350 | 0.0557        | -               |
| 0.48   | 14400 | 0.0486        | -               |
| 0.4817 | 14450 | 0.0546        | -               |
| 0.4833 | 14500 | 0.0504        | -               |
| 0.485  | 14550 | 0.0396        | -               |
| 0.4867 | 14600 | 0.0493        | -               |
| 0.4883 | 14650 | 0.0542        | -               |
| 0.49   | 14700 | 0.0514        | -               |
| 0.4917 | 14750 | 0.0577        | -               |
| 0.4933 | 14800 | 0.0329        | -               |
| 0.495  | 14850 | 0.0421        | -               |
| 0.4967 | 14900 | 0.0495        | -               |
| 0.4983 | 14950 | 0.0597        | -               |
| 0.5    | 15000 | 0.0439        | -               |
| 0.5017 | 15050 | 0.0558        | -               |
| 0.5033 | 15100 | 0.0371        | -               |
| 0.505  | 15150 | 0.0501        | -               |
| 0.5067 | 15200 | 0.0493        | -               |
| 0.5083 | 15250 | 0.0377        | -               |
| 0.51   | 15300 | 0.0496        | -               |
| 0.5117 | 15350 | 0.0459        | -               |
| 0.5133 | 15400 | 0.0398        | -               |
| 0.515  | 15450 | 0.0409        | -               |
| 0.5167 | 15500 | 0.0367        | -               |
| 0.5183 | 15550 | 0.054         | -               |
| 0.52   | 15600 | 0.0446        | -               |
| 0.5217 | 15650 | 0.0469        | -               |
| 0.5233 | 15700 | 0.0468        | -               |
| 0.525  | 15750 | 0.0383        | -               |
| 0.5267 | 15800 | 0.0548        | -               |
| 0.5283 | 15850 | 0.0565        | -               |
| 0.53   | 15900 | 0.045         | -               |
| 0.5317 | 15950 | 0.0418        | -               |
| 0.5333 | 16000 | 0.0589        | -               |
| 0.535  | 16050 | 0.0351        | -               |
| 0.5367 | 16100 | 0.0407        | -               |
| 0.5383 | 16150 | 0.0477        | -               |
| 0.54   | 16200 | 0.0407        | -               |
| 0.5417 | 16250 | 0.0469        | -               |
| 0.5433 | 16300 | 0.0371        | -               |
| 0.545  | 16350 | 0.0384        | -               |
| 0.5467 | 16400 | 0.0445        | -               |
| 0.5483 | 16450 | 0.0358        | -               |
| 0.55   | 16500 | 0.0572        | -               |
| 0.5517 | 16550 | 0.0423        | -               |
| 0.5533 | 16600 | 0.0384        | -               |
| 0.555  | 16650 | 0.0405        | -               |
| 0.5567 | 16700 | 0.0522        | -               |
| 0.5583 | 16750 | 0.0352        | -               |
| 0.56   | 16800 | 0.0416        | -               |
| 0.5617 | 16850 | 0.0336        | -               |
| 0.5633 | 16900 | 0.0429        | -               |
| 0.565  | 16950 | 0.0397        | -               |
| 0.5667 | 17000 | 0.044         | -               |
| 0.5683 | 17050 | 0.0399        | -               |
| 0.57   | 17100 | 0.0307        | -               |
| 0.5717 | 17150 | 0.0392        | -               |
| 0.5733 | 17200 | 0.0331        | -               |
| 0.575  | 17250 | 0.0401        | -               |
| 0.5767 | 17300 | 0.0472        | -               |
| 0.5783 | 17350 | 0.0516        | -               |
| 0.58   | 17400 | 0.0426        | -               |
| 0.5817 | 17450 | 0.0421        | -               |
| 0.5833 | 17500 | 0.0463        | -               |
| 0.585  | 17550 | 0.0454        | -               |
| 0.5867 | 17600 | 0.039         | -               |
| 0.5883 | 17650 | 0.0499        | -               |
| 0.59   | 17700 | 0.0396        | -               |
| 0.5917 | 17750 | 0.0506        | -               |
| 0.5933 | 17800 | 0.0401        | -               |
| 0.595  | 17850 | 0.0415        | -               |
| 0.5967 | 17900 | 0.0435        | -               |
| 0.5983 | 17950 | 0.0359        | -               |
| 0.6    | 18000 | 0.0404        | -               |
| 0.6017 | 18050 | 0.0475        | -               |
| 0.6033 | 18100 | 0.0263        | -               |
| 0.605  | 18150 | 0.0425        | -               |
| 0.6067 | 18200 | 0.0268        | -               |
| 0.6083 | 18250 | 0.0411        | -               |
| 0.61   | 18300 | 0.0474        | -               |
| 0.6117 | 18350 | 0.0495        | -               |
| 0.6133 | 18400 | 0.0477        | -               |
| 0.615  | 18450 | 0.0402        | -               |
| 0.6167 | 18500 | 0.0356        | -               |
| 0.6183 | 18550 | 0.0306        | -               |
| 0.62   | 18600 | 0.045         | -               |
| 0.6217 | 18650 | 0.0451        | -               |
| 0.6233 | 18700 | 0.0407        | -               |
| 0.625  | 18750 | 0.0421        | -               |
| 0.6267 | 18800 | 0.0521        | -               |
| 0.6283 | 18850 | 0.0548        | -               |
| 0.63   | 18900 | 0.0377        | -               |
| 0.6317 | 18950 | 0.0482        | -               |
| 0.6333 | 19000 | 0.0558        | -               |
| 0.635  | 19050 | 0.0359        | -               |
| 0.6367 | 19100 | 0.0367        | -               |
| 0.6383 | 19150 | 0.0452        | -               |
| 0.64   | 19200 | 0.0213        | -               |
| 0.6417 | 19250 | 0.0476        | -               |
| 0.6433 | 19300 | 0.0462        | -               |
| 0.645  | 19350 | 0.0525        | -               |
| 0.6467 | 19400 | 0.0509        | -               |
| 0.6483 | 19450 | 0.0451        | -               |
| 0.65   | 19500 | 0.0358        | -               |
| 0.6517 | 19550 | 0.0412        | -               |
| 0.6533 | 19600 | 0.042         | -               |
| 0.655  | 19650 | 0.0484        | -               |
| 0.6567 | 19700 | 0.0402        | -               |
| 0.6583 | 19750 | 0.0464        | -               |
| 0.66   | 19800 | 0.0349        | -               |
| 0.6617 | 19850 | 0.0421        | -               |
| 0.6633 | 19900 | 0.0358        | -               |
| 0.665  | 19950 | 0.0382        | -               |
| 0.6667 | 20000 | 0.0368        | -               |
| 0.6683 | 20050 | 0.0387        | -               |
| 0.67   | 20100 | 0.0426        | -               |
| 0.6717 | 20150 | 0.0257        | -               |
| 0.6733 | 20200 | 0.0562        | -               |
| 0.675  | 20250 | 0.0427        | -               |
| 0.6767 | 20300 | 0.0424        | -               |
| 0.6783 | 20350 | 0.0366        | -               |
| 0.68   | 20400 | 0.0331        | -               |
| 0.6817 | 20450 | 0.0372        | -               |
| 0.6833 | 20500 | 0.0488        | -               |
| 0.685  | 20550 | 0.0397        | -               |
| 0.6867 | 20600 | 0.0383        | -               |
| 0.6883 | 20650 | 0.0337        | -               |
| 0.69   | 20700 | 0.0315        | -               |
| 0.6917 | 20750 | 0.039         | -               |
| 0.6933 | 20800 | 0.0341        | -               |
| 0.695  | 20850 | 0.0462        | -               |
| 0.6967 | 20900 | 0.0338        | -               |
| 0.6983 | 20950 | 0.0246        | -               |
| 0.7    | 21000 | 0.0313        | -               |
| 0.7017 | 21050 | 0.0332        | -               |
| 0.7033 | 21100 | 0.0412        | -               |
| 0.705  | 21150 | 0.0291        | -               |
| 0.7067 | 21200 | 0.0397        | -               |
| 0.7083 | 21250 | 0.0396        | -               |
| 0.71   | 21300 | 0.0365        | -               |
| 0.7117 | 21350 | 0.0376        | -               |
| 0.7133 | 21400 | 0.041         | -               |
| 0.715  | 21450 | 0.0415        | -               |
| 0.7167 | 21500 | 0.0377        | -               |
| 0.7183 | 21550 | 0.0346        | -               |
| 0.72   | 21600 | 0.0441        | -               |
| 0.7217 | 21650 | 0.0383        | -               |
| 0.7233 | 21700 | 0.0478        | -               |
| 0.725  | 21750 | 0.0301        | -               |
| 0.7267 | 21800 | 0.0382        | -               |
| 0.7283 | 21850 | 0.0334        | -               |
| 0.73   | 21900 | 0.0331        | -               |
| 0.7317 | 21950 | 0.0526        | -               |
| 0.7333 | 22000 | 0.0246        | -               |
| 0.735  | 22050 | 0.0199        | -               |
| 0.7367 | 22100 | 0.0347        | -               |
| 0.7383 | 22150 | 0.0373        | -               |
| 0.74   | 22200 | 0.0561        | -               |
| 0.7417 | 22250 | 0.0387        | -               |
| 0.7433 | 22300 | 0.0387        | -               |
| 0.745  | 22350 | 0.0438        | -               |
| 0.7467 | 22400 | 0.0373        | -               |
| 0.7483 | 22450 | 0.0305        | -               |
| 0.75   | 22500 | 0.0453        | -               |
| 0.7517 | 22550 | 0.0385        | -               |
| 0.7533 | 22600 | 0.0404        | -               |
| 0.755  | 22650 | 0.046         | -               |
| 0.7567 | 22700 | 0.0431        | -               |
| 0.7583 | 22750 | 0.0458        | -               |
| 0.76   | 22800 | 0.0332        | -               |
| 0.7617 | 22850 | 0.0503        | -               |
| 0.7633 | 22900 | 0.0419        | -               |
| 0.765  | 22950 | 0.036         | -               |
| 0.7667 | 23000 | 0.0371        | -               |
| 0.7683 | 23050 | 0.0423        | -               |
| 0.77   | 23100 | 0.0406        | -               |
| 0.7717 | 23150 | 0.0476        | -               |
| 0.7733 | 23200 | 0.0353        | -               |
| 0.775  | 23250 | 0.0404        | -               |
| 0.7767 | 23300 | 0.0553        | -               |
| 0.7783 | 23350 | 0.0355        | -               |
| 0.78   | 23400 | 0.0349        | -               |
| 0.7817 | 23450 | 0.0493        | -               |
| 0.7833 | 23500 | 0.0335        | -               |
| 0.785  | 23550 | 0.0374        | -               |
| 0.7867 | 23600 | 0.0463        | -               |
| 0.7883 | 23650 | 0.044         | -               |
| 0.79   | 23700 | 0.0214        | -               |
| 0.7917 | 23750 | 0.0374        | -               |
| 0.7933 | 23800 | 0.0399        | -               |
| 0.795  | 23850 | 0.0372        | -               |
| 0.7967 | 23900 | 0.0297        | -               |
| 0.7983 | 23950 | 0.0238        | -               |
| 0.8    | 24000 | 0.047         | -               |
| 0.8017 | 24050 | 0.0315        | -               |
| 0.8033 | 24100 | 0.037         | -               |
| 0.805  | 24150 | 0.055         | -               |
| 0.8067 | 24200 | 0.0433        | -               |
| 0.8083 | 24250 | 0.0337        | -               |
| 0.81   | 24300 | 0.0368        | -               |
| 0.8117 | 24350 | 0.0321        | -               |
| 0.8133 | 24400 | 0.036         | -               |
| 0.815  | 24450 | 0.0376        | -               |
| 0.8167 | 24500 | 0.0323        | -               |
| 0.8183 | 24550 | 0.0323        | -               |
| 0.82   | 24600 | 0.0295        | -               |
| 0.8217 | 24650 | 0.0186        | -               |
| 0.8233 | 24700 | 0.0427        | -               |
| 0.825  | 24750 | 0.0305        | -               |
| 0.8267 | 24800 | 0.0381        | -               |
| 0.8283 | 24850 | 0.0322        | -               |
| 0.83   | 24900 | 0.0361        | -               |
| 0.8317 | 24950 | 0.0418        | -               |
| 0.8333 | 25000 | 0.0321        | -               |
| 0.835  | 25050 | 0.036         | -               |
| 0.8367 | 25100 | 0.0413        | -               |
| 0.8383 | 25150 | 0.037         | -               |
| 0.84   | 25200 | 0.0329        | -               |
| 0.8417 | 25250 | 0.0368        | -               |
| 0.8433 | 25300 | 0.0302        | -               |
| 0.845  | 25350 | 0.0418        | -               |
| 0.8467 | 25400 | 0.0338        | -               |
| 0.8483 | 25450 | 0.0464        | -               |
| 0.85   | 25500 | 0.0265        | -               |
| 0.8517 | 25550 | 0.027         | -               |
| 0.8533 | 25600 | 0.0256        | -               |
| 0.855  | 25650 | 0.0325        | -               |
| 0.8567 | 25700 | 0.0395        | -               |
| 0.8583 | 25750 | 0.0363        | -               |
| 0.86   | 25800 | 0.0393        | -               |
| 0.8617 | 25850 | 0.0407        | -               |
| 0.8633 | 25900 | 0.0382        | -               |
| 0.865  | 25950 | 0.0299        | -               |
| 0.8667 | 26000 | 0.038         | -               |
| 0.8683 | 26050 | 0.0457        | -               |
| 0.87   | 26100 | 0.0292        | -               |
| 0.8717 | 26150 | 0.0352        | -               |
| 0.8733 | 26200 | 0.0313        | -               |
| 0.875  | 26250 | 0.0258        | -               |
| 0.8767 | 26300 | 0.0273        | -               |
| 0.8783 | 26350 | 0.0328        | -               |
| 0.88   | 26400 | 0.026         | -               |
| 0.8817 | 26450 | 0.0408        | -               |
| 0.8833 | 26500 | 0.0438        | -               |
| 0.885  | 26550 | 0.0287        | -               |
| 0.8867 | 26600 | 0.0285        | -               |
| 0.8883 | 26650 | 0.0244        | -               |
| 0.89   | 26700 | 0.0255        | -               |
| 0.8917 | 26750 | 0.0397        | -               |
| 0.8933 | 26800 | 0.0332        | -               |
| 0.895  | 26850 | 0.0373        | -               |
| 0.8967 | 26900 | 0.0352        | -               |
| 0.8983 | 26950 | 0.0313        | -               |
| 0.9    | 27000 | 0.0284        | -               |
| 0.9017 | 27050 | 0.0286        | -               |
| 0.9033 | 27100 | 0.028         | -               |
| 0.905  | 27150 | 0.0267        | -               |
| 0.9067 | 27200 | 0.0304        | -               |
| 0.9083 | 27250 | 0.0377        | -               |
| 0.91   | 27300 | 0.0341        | -               |
| 0.9117 | 27350 | 0.0188        | -               |
| 0.9133 | 27400 | 0.0357        | -               |
| 0.915  | 27450 | 0.027         | -               |
| 0.9167 | 27500 | 0.0271        | -               |
| 0.9183 | 27550 | 0.0354        | -               |
| 0.92   | 27600 | 0.0316        | -               |
| 0.9217 | 27650 | 0.0381        | -               |
| 0.9233 | 27700 | 0.0374        | -               |
| 0.925  | 27750 | 0.0265        | -               |
| 0.9267 | 27800 | 0.0257        | -               |
| 0.9283 | 27850 | 0.0319        | -               |
| 0.93   | 27900 | 0.0422        | -               |
| 0.9317 | 27950 | 0.0338        | -               |
| 0.9333 | 28000 | 0.0196        | -               |
| 0.935  | 28050 | 0.0516        | -               |
| 0.9367 | 28100 | 0.0281        | -               |
| 0.9383 | 28150 | 0.0286        | -               |
| 0.94   | 28200 | 0.0282        | -               |
| 0.9417 | 28250 | 0.0357        | -               |
| 0.9433 | 28300 | 0.0333        | -               |
| 0.945  | 28350 | 0.0275        | -               |
| 0.9467 | 28400 | 0.0439        | -               |
| 0.9483 | 28450 | 0.03          | -               |
| 0.95   | 28500 | 0.0453        | -               |
| 0.9517 | 28550 | 0.0233        | -               |
| 0.9533 | 28600 | 0.027         | -               |
| 0.955  | 28650 | 0.0353        | -               |
| 0.9567 | 28700 | 0.0318        | -               |
| 0.9583 | 28750 | 0.0399        | -               |
| 0.96   | 28800 | 0.038         | -               |
| 0.9617 | 28850 | 0.0195        | -               |
| 0.9633 | 28900 | 0.0305        | -               |
| 0.965  | 28950 | 0.0359        | -               |
| 0.9667 | 29000 | 0.0253        | -               |
| 0.9683 | 29050 | 0.0211        | -               |
| 0.97   | 29100 | 0.0384        | -               |
| 0.9717 | 29150 | 0.0264        | -               |
| 0.9733 | 29200 | 0.0408        | -               |
| 0.975  | 29250 | 0.0351        | -               |
| 0.9767 | 29300 | 0.0335        | -               |
| 0.9783 | 29350 | 0.0394        | -               |
| 0.98   | 29400 | 0.0385        | -               |
| 0.9817 | 29450 | 0.0296        | -               |
| 0.9833 | 29500 | 0.0501        | -               |
| 0.985  | 29550 | 0.0276        | -               |
| 0.9867 | 29600 | 0.0314        | -               |
| 0.9883 | 29650 | 0.0308        | -               |
| 0.99   | 29700 | 0.0261        | -               |
| 0.9917 | 29750 | 0.0359        | -               |
| 0.9933 | 29800 | 0.0311        | -               |
| 0.995  | 29850 | 0.0434        | -               |
| 0.9967 | 29900 | 0.0381        | -               |
| 0.9983 | 29950 | 0.0297        | -               |
| 1.0    | 30000 | 0.024         | -               |
| 1.0017 | 30050 | 0.0338        | -               |
| 1.0033 | 30100 | 0.0266        | -               |
| 1.005  | 30150 | 0.0273        | -               |
| 1.0067 | 30200 | 0.038         | -               |
| 1.0083 | 30250 | 0.0312        | -               |
| 1.01   | 30300 | 0.0328        | -               |
| 1.0117 | 30350 | 0.0293        | -               |
| 1.0133 | 30400 | 0.0235        | -               |
| 1.015  | 30450 | 0.0287        | -               |
| 1.0167 | 30500 | 0.0298        | -               |
| 1.0183 | 30550 | 0.0248        | -               |
| 1.02   | 30600 | 0.029         | -               |
| 1.0217 | 30650 | 0.0331        | -               |
| 1.0233 | 30700 | 0.0214        | -               |
| 1.025  | 30750 | 0.0259        | -               |
| 1.0267 | 30800 | 0.0323        | -               |
| 1.0283 | 30850 | 0.0343        | -               |
| 1.03   | 30900 | 0.0256        | -               |
| 1.0317 | 30950 | 0.031         | -               |
| 1.0333 | 31000 | 0.0349        | -               |
| 1.035  | 31050 | 0.0325        | -               |
| 1.0367 | 31100 | 0.0327        | -               |
| 1.0383 | 31150 | 0.0429        | -               |
| 1.04   | 31200 | 0.0356        | -               |
| 1.0417 | 31250 | 0.0396        | -               |
| 1.0433 | 31300 | 0.0235        | -               |
| 1.045  | 31350 | 0.0369        | -               |
| 1.0467 | 31400 | 0.0224        | -               |
| 1.0483 | 31450 | 0.0347        | -               |
| 1.05   | 31500 | 0.0373        | -               |
| 1.0517 | 31550 | 0.0179        | -               |
| 1.0533 | 31600 | 0.0176        | -               |
| 1.055  | 31650 | 0.0257        | -               |
| 1.0567 | 31700 | 0.04          | -               |
| 1.0583 | 31750 | 0.0301        | -               |
| 1.06   | 31800 | 0.0266        | -               |
| 1.0617 | 31850 | 0.0233        | -               |
| 1.0633 | 31900 | 0.0308        | -               |
| 1.065  | 31950 | 0.0389        | -               |
| 1.0667 | 32000 | 0.0268        | -               |
| 1.0683 | 32050 | 0.0256        | -               |
| 1.07   | 32100 | 0.0198        | -               |
| 1.0717 | 32150 | 0.0361        | -               |
| 1.0733 | 32200 | 0.0235        | -               |
| 1.075  | 32250 | 0.033         | -               |
| 1.0767 | 32300 | 0.031         | -               |
| 1.0783 | 32350 | 0.0258        | -               |
| 1.08   | 32400 | 0.0289        | -               |
| 1.0817 | 32450 | 0.0314        | -               |
| 1.0833 | 32500 | 0.0259        | -               |
| 1.085  | 32550 | 0.0217        | -               |
| 1.0867 | 32600 | 0.0428        | -               |
| 1.0883 | 32650 | 0.0406        | -               |
| 1.09   | 32700 | 0.0253        | -               |
| 1.0917 | 32750 | 0.0302        | -               |
| 1.0933 | 32800 | 0.0283        | -               |
| 1.095  | 32850 | 0.025         | -               |
| 1.0967 | 32900 | 0.0297        | -               |
| 1.0983 | 32950 | 0.0234        | -               |
| 1.1    | 33000 | 0.032         | -               |
| 1.1017 | 33050 | 0.0327        | -               |
| 1.1033 | 33100 | 0.031         | -               |
| 1.105  | 33150 | 0.0339        | -               |
| 1.1067 | 33200 | 0.0233        | -               |
| 1.1083 | 33250 | 0.0354        | -               |
| 1.11   | 33300 | 0.0284        | -               |
| 1.1117 | 33350 | 0.0278        | -               |
| 1.1133 | 33400 | 0.0275        | -               |
| 1.115  | 33450 | 0.0274        | -               |
| 1.1167 | 33500 | 0.0387        | -               |
| 1.1183 | 33550 | 0.029         | -               |
| 1.12   | 33600 | 0.035         | -               |
| 1.1217 | 33650 | 0.0272        | -               |
| 1.1233 | 33700 | 0.033         | -               |
| 1.125  | 33750 | 0.0307        | -               |
| 1.1267 | 33800 | 0.0264        | -               |
| 1.1283 | 33850 | 0.0281        | -               |
| 1.13   | 33900 | 0.0171        | -               |
| 1.1317 | 33950 | 0.0248        | -               |
| 1.1333 | 34000 | 0.0289        | -               |
| 1.135  | 34050 | 0.025         | -               |
| 1.1367 | 34100 | 0.0246        | -               |
| 1.1383 | 34150 | 0.0245        | -               |
| 1.1400 | 34200 | 0.0414        | -               |
| 1.1417 | 34250 | 0.0234        | -               |
| 1.1433 | 34300 | 0.0393        | -               |
| 1.145  | 34350 | 0.0306        | -               |
| 1.1467 | 34400 | 0.0187        | -               |
| 1.1483 | 34450 | 0.023         | -               |
| 1.15   | 34500 | 0.0295        | -               |
| 1.1517 | 34550 | 0.029         | -               |
| 1.1533 | 34600 | 0.0231        | -               |
| 1.155  | 34650 | 0.0271        | -               |
| 1.1567 | 34700 | 0.0259        | -               |
| 1.1583 | 34750 | 0.0261        | -               |
| 1.16   | 34800 | 0.0274        | -               |
| 1.1617 | 34850 | 0.0358        | -               |
| 1.1633 | 34900 | 0.0232        | -               |
| 1.165  | 34950 | 0.0185        | -               |
| 1.1667 | 35000 | 0.0231        | -               |
| 1.1683 | 35050 | 0.0289        | -               |
| 1.17   | 35100 | 0.0357        | -               |
| 1.1717 | 35150 | 0.0298        | -               |
| 1.1733 | 35200 | 0.0195        | -               |
| 1.175  | 35250 | 0.023         | -               |
| 1.1767 | 35300 | 0.0278        | -               |
| 1.1783 | 35350 | 0.0267        | -               |
| 1.18   | 35400 | 0.0206        | -               |
| 1.1817 | 35450 | 0.0196        | -               |
| 1.1833 | 35500 | 0.0268        | -               |
| 1.185  | 35550 | 0.0235        | -               |
| 1.1867 | 35600 | 0.032         | -               |
| 1.1883 | 35650 | 0.0142        | -               |
| 1.19   | 35700 | 0.0211        | -               |
| 1.1917 | 35750 | 0.0365        | -               |
| 1.1933 | 35800 | 0.0267        | -               |
| 1.195  | 35850 | 0.0296        | -               |
| 1.1967 | 35900 | 0.0292        | -               |
| 1.1983 | 35950 | 0.0315        | -               |
| 1.2    | 36000 | 0.0378        | -               |
| 1.2017 | 36050 | 0.0239        | -               |
| 1.2033 | 36100 | 0.0267        | -               |
| 1.205  | 36150 | 0.026         | -               |
| 1.2067 | 36200 | 0.0287        | -               |
| 1.2083 | 36250 | 0.036         | -               |
| 1.21   | 36300 | 0.0278        | -               |
| 1.2117 | 36350 | 0.0187        | -               |
| 1.2133 | 36400 | 0.0313        | -               |
| 1.215  | 36450 | 0.0217        | -               |
| 1.2167 | 36500 | 0.0276        | -               |
| 1.2183 | 36550 | 0.0297        | -               |
| 1.22   | 36600 | 0.0306        | -               |
| 1.2217 | 36650 | 0.0249        | -               |
| 1.2233 | 36700 | 0.029         | -               |
| 1.225  | 36750 | 0.0163        | -               |
| 1.2267 | 36800 | 0.0255        | -               |
| 1.2283 | 36850 | 0.0278        | -               |
| 1.23   | 36900 | 0.0275        | -               |
| 1.2317 | 36950 | 0.0291        | -               |
| 1.2333 | 37000 | 0.0236        | -               |
| 1.2350 | 37050 | 0.0239        | -               |
| 1.2367 | 37100 | 0.0268        | -               |
| 1.2383 | 37150 | 0.028         | -               |
| 1.24   | 37200 | 0.0201        | -               |
| 1.2417 | 37250 | 0.038         | -               |
| 1.2433 | 37300 | 0.0211        | -               |
| 1.245  | 37350 | 0.0281        | -               |
| 1.2467 | 37400 | 0.0263        | -               |
| 1.2483 | 37450 | 0.0297        | -               |
| 1.25   | 37500 | 0.0276        | -               |
| 1.2517 | 37550 | 0.027         | -               |
| 1.2533 | 37600 | 0.0152        | -               |
| 1.255  | 37650 | 0.0269        | -               |
| 1.2567 | 37700 | 0.0248        | -               |
| 1.2583 | 37750 | 0.0246        | -               |
| 1.26   | 37800 | 0.0325        | -               |
| 1.2617 | 37850 | 0.0306        | -               |
| 1.2633 | 37900 | 0.0227        | -               |
| 1.2650 | 37950 | 0.037         | -               |
| 1.2667 | 38000 | 0.017         | -               |
| 1.2683 | 38050 | 0.0269        | -               |
| 1.27   | 38100 | 0.0297        | -               |
| 1.2717 | 38150 | 0.0216        | -               |
| 1.2733 | 38200 | 0.0179        | -               |
| 1.275  | 38250 | 0.0196        | -               |
| 1.2767 | 38300 | 0.0268        | -               |
| 1.2783 | 38350 | 0.0209        | -               |
| 1.28   | 38400 | 0.03          | -               |
| 1.2817 | 38450 | 0.0199        | -               |
| 1.2833 | 38500 | 0.0377        | -               |
| 1.285  | 38550 | 0.0279        | -               |
| 1.2867 | 38600 | 0.032         | -               |
| 1.2883 | 38650 | 0.0313        | -               |
| 1.29   | 38700 | 0.0219        | -               |
| 1.2917 | 38750 | 0.0243        | -               |
| 1.2933 | 38800 | 0.0229        | -               |
| 1.295  | 38850 | 0.019         | -               |
| 1.2967 | 38900 | 0.0223        | -               |
| 1.2983 | 38950 | 0.0205        | -               |
| 1.3    | 39000 | 0.0285        | -               |
| 1.3017 | 39050 | 0.0227        | -               |
| 1.3033 | 39100 | 0.0326        | -               |
| 1.305  | 39150 | 0.0337        | -               |
| 1.3067 | 39200 | 0.0315        | -               |
| 1.3083 | 39250 | 0.0226        | -               |
| 1.31   | 39300 | 0.0318        | -               |
| 1.3117 | 39350 | 0.0298        | -               |
| 1.3133 | 39400 | 0.0236        | -               |
| 1.315  | 39450 | 0.0272        | -               |
| 1.3167 | 39500 | 0.0247        | -               |
| 1.3183 | 39550 | 0.0292        | -               |
| 1.32   | 39600 | 0.0188        | -               |
| 1.3217 | 39650 | 0.029         | -               |
| 1.3233 | 39700 | 0.0275        | -               |
| 1.325  | 39750 | 0.0255        | -               |
| 1.3267 | 39800 | 0.028         | -               |
| 1.3283 | 39850 | 0.0355        | -               |
| 1.33   | 39900 | 0.0155        | -               |
| 1.3317 | 39950 | 0.0346        | -               |
| 1.3333 | 40000 | 0.0277        | -               |
| 1.335  | 40050 | 0.0297        | -               |
| 1.3367 | 40100 | 0.0273        | -               |
| 1.3383 | 40150 | 0.0239        | -               |
| 1.34   | 40200 | 0.031         | -               |
| 1.3417 | 40250 | 0.0329        | -               |
| 1.3433 | 40300 | 0.0296        | -               |
| 1.345  | 40350 | 0.027         | -               |
| 1.3467 | 40400 | 0.0385        | -               |
| 1.3483 | 40450 | 0.0246        | -               |
| 1.35   | 40500 | 0.0253        | -               |
| 1.3517 | 40550 | 0.0188        | -               |
| 1.3533 | 40600 | 0.0271        | -               |
| 1.355  | 40650 | 0.0175        | -               |
| 1.3567 | 40700 | 0.0247        | -               |
| 1.3583 | 40750 | 0.0364        | -               |
| 1.3600 | 40800 | 0.0195        | -               |
| 1.3617 | 40850 | 0.0315        | -               |
| 1.3633 | 40900 | 0.0184        | -               |
| 1.365  | 40950 | 0.024         | -               |
| 1.3667 | 41000 | 0.0232        | -               |
| 1.3683 | 41050 | 0.025         | -               |
| 1.37   | 41100 | 0.0303        | -               |
| 1.3717 | 41150 | 0.0231        | -               |
| 1.3733 | 41200 | 0.0314        | -               |
| 1.375  | 41250 | 0.0231        | -               |
| 1.3767 | 41300 | 0.0212        | -               |
| 1.3783 | 41350 | 0.0258        | -               |
| 1.38   | 41400 | 0.0196        | -               |
| 1.3817 | 41450 | 0.0262        | -               |
| 1.3833 | 41500 | 0.0238        | -               |
| 1.385  | 41550 | 0.0176        | -               |
| 1.3867 | 41600 | 0.0382        | -               |
| 1.3883 | 41650 | 0.0227        | -               |
| 1.3900 | 41700 | 0.026         | -               |
| 1.3917 | 41750 | 0.0231        | -               |
| 1.3933 | 41800 | 0.0255        | -               |
| 1.395  | 41850 | 0.0401        | -               |
| 1.3967 | 41900 | 0.0261        | -               |
| 1.3983 | 41950 | 0.0298        | -               |
| 1.4    | 42000 | 0.0268        | -               |
| 1.4017 | 42050 | 0.031         | -               |
| 1.4033 | 42100 | 0.0269        | -               |
| 1.405  | 42150 | 0.0214        | -               |
| 1.4067 | 42200 | 0.0273        | -               |
| 1.4083 | 42250 | 0.0214        | -               |
| 1.41   | 42300 | 0.0264        | -               |
| 1.4117 | 42350 | 0.0242        | -               |
| 1.4133 | 42400 | 0.0168        | -               |
| 1.415  | 42450 | 0.0303        | -               |
| 1.4167 | 42500 | 0.0382        | -               |
| 1.4183 | 42550 | 0.0288        | -               |
| 1.42   | 42600 | 0.0241        | -               |
| 1.4217 | 42650 | 0.0236        | -               |
| 1.4233 | 42700 | 0.0229        | -               |
| 1.425  | 42750 | 0.0341        | -               |
| 1.4267 | 42800 | 0.0158        | -               |
| 1.4283 | 42850 | 0.0215        | -               |
| 1.43   | 42900 | 0.0267        | -               |
| 1.4317 | 42950 | 0.0356        | -               |
| 1.4333 | 43000 | 0.0228        | -               |
| 1.435  | 43050 | 0.0191        | -               |
| 1.4367 | 43100 | 0.0242        | -               |
| 1.4383 | 43150 | 0.0155        | -               |
| 1.44   | 43200 | 0.0327        | -               |
| 1.4417 | 43250 | 0.0216        | -               |
| 1.4433 | 43300 | 0.0313        | -               |
| 1.445  | 43350 | 0.0231        | -               |
| 1.4467 | 43400 | 0.0242        | -               |
| 1.4483 | 43450 | 0.0189        | -               |
| 1.45   | 43500 | 0.0255        | -               |
| 1.4517 | 43550 | 0.0238        | -               |
| 1.4533 | 43600 | 0.0351        | -               |
| 1.455  | 43650 | 0.027         | -               |
| 1.4567 | 43700 | 0.0257        | -               |
| 1.4583 | 43750 | 0.0188        | -               |
| 1.46   | 43800 | 0.0242        | -               |
| 1.4617 | 43850 | 0.0316        | -               |
| 1.4633 | 43900 | 0.0256        | -               |
| 1.465  | 43950 | 0.0238        | -               |
| 1.4667 | 44000 | 0.0352        | -               |
| 1.4683 | 44050 | 0.0228        | -               |
| 1.47   | 44100 | 0.0229        | -               |
| 1.4717 | 44150 | 0.0278        | -               |
| 1.4733 | 44200 | 0.0221        | -               |
| 1.475  | 44250 | 0.027         | -               |
| 1.4767 | 44300 | 0.0187        | -               |
| 1.4783 | 44350 | 0.0318        | -               |
| 1.48   | 44400 | 0.0279        | -               |
| 1.4817 | 44450 | 0.0161        | -               |
| 1.4833 | 44500 | 0.0215        | -               |
| 1.4850 | 44550 | 0.0294        | -               |
| 1.4867 | 44600 | 0.0206        | -               |
| 1.4883 | 44650 | 0.0169        | -               |
| 1.49   | 44700 | 0.0254        | -               |
| 1.4917 | 44750 | 0.0169        | -               |
| 1.4933 | 44800 | 0.0262        | -               |
| 1.495  | 44850 | 0.0299        | -               |
| 1.4967 | 44900 | 0.0252        | -               |
| 1.4983 | 44950 | 0.0302        | -               |
| 1.5    | 45000 | 0.0184        | -               |
| 1.5017 | 45050 | 0.0279        | -               |
| 1.5033 | 45100 | 0.0208        | -               |
| 1.505  | 45150 | 0.0183        | -               |
| 1.5067 | 45200 | 0.0297        | -               |
| 1.5083 | 45250 | 0.028         | -               |
| 1.51   | 45300 | 0.0252        | -               |
| 1.5117 | 45350 | 0.0206        | -               |
| 1.5133 | 45400 | 0.0178        | -               |
| 1.5150 | 45450 | 0.0309        | -               |
| 1.5167 | 45500 | 0.0212        | -               |
| 1.5183 | 45550 | 0.021         | -               |
| 1.52   | 45600 | 0.0194        | -               |
| 1.5217 | 45650 | 0.0214        | -               |
| 1.5233 | 45700 | 0.0259        | -               |
| 1.525  | 45750 | 0.0176        | -               |
| 1.5267 | 45800 | 0.0226        | -               |
| 1.5283 | 45850 | 0.0222        | -               |
| 1.53   | 45900 | 0.0255        | -               |
| 1.5317 | 45950 | 0.0213        | -               |
| 1.5333 | 46000 | 0.023         | -               |
| 1.5350 | 46050 | 0.0261        | -               |
| 1.5367 | 46100 | 0.0277        | -               |
| 1.5383 | 46150 | 0.0275        | -               |
| 1.54   | 46200 | 0.0185        | -               |
| 1.5417 | 46250 | 0.0404        | -               |
| 1.5433 | 46300 | 0.0221        | -               |
| 1.545  | 46350 | 0.0162        | -               |
| 1.5467 | 46400 | 0.0229        | -               |
| 1.5483 | 46450 | 0.0227        | -               |
| 1.55   | 46500 | 0.0274        | -               |
| 1.5517 | 46550 | 0.0244        | -               |
| 1.5533 | 46600 | 0.0277        | -               |
| 1.5550 | 46650 | 0.0216        | -               |
| 1.5567 | 46700 | 0.0214        | -               |
| 1.5583 | 46750 | 0.0329        | -               |
| 1.56   | 46800 | 0.0187        | -               |
| 1.5617 | 46850 | 0.0276        | -               |
| 1.5633 | 46900 | 0.0203        | -               |
| 1.565  | 46950 | 0.03          | -               |
| 1.5667 | 47000 | 0.0222        | -               |
| 1.5683 | 47050 | 0.0253        | -               |
| 1.5700 | 47100 | 0.0228        | -               |
| 1.5717 | 47150 | 0.026         | -               |
| 1.5733 | 47200 | 0.0213        | -               |
| 1.575  | 47250 | 0.0167        | -               |
| 1.5767 | 47300 | 0.0143        | -               |
| 1.5783 | 47350 | 0.0191        | -               |
| 1.58   | 47400 | 0.0214        | -               |
| 1.5817 | 47450 | 0.0182        | -               |
| 1.5833 | 47500 | 0.0226        | -               |
| 1.585  | 47550 | 0.0178        | -               |
| 1.5867 | 47600 | 0.024         | -               |
| 1.5883 | 47650 | 0.0173        | -               |
| 1.5900 | 47700 | 0.0243        | -               |
| 1.5917 | 47750 | 0.0237        | -               |
| 1.5933 | 47800 | 0.0212        | -               |
| 1.595  | 47850 | 0.0243        | -               |
| 1.5967 | 47900 | 0.0356        | -               |
| 1.5983 | 47950 | 0.0226        | -               |
| 1.6    | 48000 | 0.0232        | -               |
| 1.6017 | 48050 | 0.0282        | -               |
| 1.6033 | 48100 | 0.0201        | -               |
| 1.605  | 48150 | 0.0157        | -               |
| 1.6067 | 48200 | 0.024         | -               |
| 1.6083 | 48250 | 0.0185        | -               |
| 1.6100 | 48300 | 0.0241        | -               |
| 1.6117 | 48350 | 0.026         | -               |
| 1.6133 | 48400 | 0.0338        | -               |
| 1.615  | 48450 | 0.0227        | -               |
| 1.6167 | 48500 | 0.0267        | -               |
| 1.6183 | 48550 | 0.0221        | -               |
| 1.62   | 48600 | 0.024         | -               |
| 1.6217 | 48650 | 0.0237        | -               |
| 1.6233 | 48700 | 0.0255        | -               |
| 1.625  | 48750 | 0.0182        | -               |
| 1.6267 | 48800 | 0.0225        | -               |
| 1.6283 | 48850 | 0.0112        | -               |
| 1.63   | 48900 | 0.0362        | -               |
| 1.6317 | 48950 | 0.0378        | -               |
| 1.6333 | 49000 | 0.0274        | -               |
| 1.635  | 49050 | 0.0141        | -               |
| 1.6367 | 49100 | 0.0223        | -               |
| 1.6383 | 49150 | 0.0271        | -               |
| 1.6400 | 49200 | 0.0285        | -               |
| 1.6417 | 49250 | 0.0254        | -               |
| 1.6433 | 49300 | 0.0157        | -               |
| 1.645  | 49350 | 0.0198        | -               |
| 1.6467 | 49400 | 0.0293        | -               |
| 1.6483 | 49450 | 0.0161        | -               |
| 1.65   | 49500 | 0.0223        | -               |
| 1.6517 | 49550 | 0.024         | -               |
| 1.6533 | 49600 | 0.0133        | -               |
| 1.655  | 49650 | 0.0234        | -               |
| 1.6567 | 49700 | 0.0179        | -               |
| 1.6583 | 49750 | 0.0141        | -               |
| 1.6600 | 49800 | 0.0294        | -               |
| 1.6617 | 49850 | 0.02          | -               |
| 1.6633 | 49900 | 0.019         | -               |
| 1.665  | 49950 | 0.0183        | -               |
| 1.6667 | 50000 | 0.0296        | -               |
| 1.6683 | 50050 | 0.025         | -               |
| 1.67   | 50100 | 0.0319        | -               |
| 1.6717 | 50150 | 0.033         | -               |
| 1.6733 | 50200 | 0.0161        | -               |
| 1.675  | 50250 | 0.0144        | -               |
| 1.6767 | 50300 | 0.0122        | -               |
| 1.6783 | 50350 | 0.024         | -               |
| 1.6800 | 50400 | 0.0187        | -               |
| 1.6817 | 50450 | 0.0306        | -               |
| 1.6833 | 50500 | 0.0239        | -               |
| 1.685  | 50550 | 0.0223        | -               |
| 1.6867 | 50600 | 0.0224        | -               |
| 1.6883 | 50650 | 0.0249        | -               |
| 1.69   | 50700 | 0.021         | -               |
| 1.6917 | 50750 | 0.0236        | -               |
| 1.6933 | 50800 | 0.0194        | -               |
| 1.6950 | 50850 | 0.0209        | -               |
| 1.6967 | 50900 | 0.0245        | -               |
| 1.6983 | 50950 | 0.0258        | -               |
| 1.7    | 51000 | 0.0225        | -               |
| 1.7017 | 51050 | 0.0293        | -               |
| 1.7033 | 51100 | 0.0225        | -               |
| 1.705  | 51150 | 0.0167        | -               |
| 1.7067 | 51200 | 0.0209        | -               |
| 1.7083 | 51250 | 0.0113        | -               |
| 1.71   | 51300 | 0.021         | -               |
| 1.7117 | 51350 | 0.0243        | -               |
| 1.7133 | 51400 | 0.0234        | -               |
| 1.7150 | 51450 | 0.0304        | -               |
| 1.7167 | 51500 | 0.0244        | -               |
| 1.7183 | 51550 | 0.0294        | -               |
| 1.72   | 51600 | 0.0167        | -               |
| 1.7217 | 51650 | 0.0301        | -               |
| 1.7233 | 51700 | 0.0243        | -               |
| 1.725  | 51750 | 0.0283        | -               |
| 1.7267 | 51800 | 0.0143        | -               |
| 1.7283 | 51850 | 0.0301        | -               |
| 1.73   | 51900 | 0.032         | -               |
| 1.7317 | 51950 | 0.0275        | -               |
| 1.7333 | 52000 | 0.0172        | -               |
| 1.7350 | 52050 | 0.0284        | -               |
| 1.7367 | 52100 | 0.0292        | -               |
| 1.7383 | 52150 | 0.0219        | -               |
| 1.74   | 52200 | 0.015         | -               |
| 1.7417 | 52250 | 0.0206        | -               |
| 1.7433 | 52300 | 0.0192        | -               |
| 1.745  | 52350 | 0.02          | -               |
| 1.7467 | 52400 | 0.0274        | -               |
| 1.7483 | 52450 | 0.021         | -               |
| 1.75   | 52500 | 0.0211        | -               |
| 1.7517 | 52550 | 0.0167        | -               |
| 1.7533 | 52600 | 0.03          | -               |
| 1.755  | 52650 | 0.0192        | -               |
| 1.7567 | 52700 | 0.0239        | -               |
| 1.7583 | 52750 | 0.017         | -               |
| 1.76   | 52800 | 0.0176        | -               |
| 1.7617 | 52850 | 0.0252        | -               |
| 1.7633 | 52900 | 0.0205        | -               |
| 1.7650 | 52950 | 0.0227        | -               |
| 1.7667 | 53000 | 0.0234        | -               |
| 1.7683 | 53050 | 0.0225        | -               |
| 1.77   | 53100 | 0.0139        | -               |
| 1.7717 | 53150 | 0.0196        | -               |
| 1.7733 | 53200 | 0.0374        | -               |
| 1.775  | 53250 | 0.0198        | -               |
| 1.7767 | 53300 | 0.0254        | -               |
| 1.7783 | 53350 | 0.0328        | -               |
| 1.78   | 53400 | 0.0264        | -               |
| 1.7817 | 53450 | 0.0189        | -               |
| 1.7833 | 53500 | 0.0317        | -               |
| 1.7850 | 53550 | 0.0214        | -               |
| 1.7867 | 53600 | 0.0232        | -               |
| 1.7883 | 53650 | 0.02          | -               |
| 1.79   | 53700 | 0.022         | -               |
| 1.7917 | 53750 | 0.016         | -               |
| 1.7933 | 53800 | 0.0161        | -               |
| 1.795  | 53850 | 0.0205        | -               |
| 1.7967 | 53900 | 0.0219        | -               |
| 1.7983 | 53950 | 0.0183        | -               |
| 1.8    | 54000 | 0.0219        | -               |
| 1.8017 | 54050 | 0.0212        | -               |
| 1.8033 | 54100 | 0.0269        | -               |
| 1.8050 | 54150 | 0.0278        | -               |
| 1.8067 | 54200 | 0.0175        | -               |
| 1.8083 | 54250 | 0.0172        | -               |
| 1.81   | 54300 | 0.0291        | -               |
| 1.8117 | 54350 | 0.0173        | -               |
| 1.8133 | 54400 | 0.0202        | -               |
| 1.815  | 54450 | 0.0279        | -               |
| 1.8167 | 54500 | 0.0243        | -               |
| 1.8183 | 54550 | 0.0277        | -               |
| 1.8200 | 54600 | 0.0264        | -               |
| 1.8217 | 54650 | 0.0187        | -               |
| 1.8233 | 54700 | 0.019         | -               |
| 1.825  | 54750 | 0.0131        | -               |
| 1.8267 | 54800 | 0.0175        | -               |
| 1.8283 | 54850 | 0.0146        | -               |
| 1.83   | 54900 | 0.0281        | -               |
| 1.8317 | 54950 | 0.0135        | -               |
| 1.8333 | 55000 | 0.0281        | -               |
| 1.835  | 55050 | 0.028         | -               |
| 1.8367 | 55100 | 0.0313        | -               |
| 1.8383 | 55150 | 0.0221        | -               |
| 1.8400 | 55200 | 0.0229        | -               |
| 1.8417 | 55250 | 0.0249        | -               |
| 1.8433 | 55300 | 0.0279        | -               |
| 1.845  | 55350 | 0.0178        | -               |
| 1.8467 | 55400 | 0.0276        | -               |
| 1.8483 | 55450 | 0.0302        | -               |
| 1.85   | 55500 | 0.0204        | -               |
| 1.8517 | 55550 | 0.0266        | -               |
| 1.8533 | 55600 | 0.0149        | -               |
| 1.855  | 55650 | 0.0093        | -               |
| 1.8567 | 55700 | 0.0194        | -               |
| 1.8583 | 55750 | 0.0147        | -               |
| 1.8600 | 55800 | 0.0161        | -               |
| 1.8617 | 55850 | 0.0188        | -               |
| 1.8633 | 55900 | 0.0235        | -               |
| 1.865  | 55950 | 0.0111        | -               |
| 1.8667 | 56000 | 0.0288        | -               |
| 1.8683 | 56050 | 0.0261        | -               |
| 1.87   | 56100 | 0.0195        | -               |
| 1.8717 | 56150 | 0.0204        | -               |
| 1.8733 | 56200 | 0.0357        | -               |
| 1.875  | 56250 | 0.0181        | -               |
| 1.8767 | 56300 | 0.02          | -               |
| 1.8783 | 56350 | 0.025         | -               |
| 1.88   | 56400 | 0.0324        | -               |
| 1.8817 | 56450 | 0.0241        | -               |
| 1.8833 | 56500 | 0.0205        | -               |
| 1.885  | 56550 | 0.0177        | -               |
| 1.8867 | 56600 | 0.0161        | -               |
| 1.8883 | 56650 | 0.0132        | -               |
| 1.8900 | 56700 | 0.0183        | -               |
| 1.8917 | 56750 | 0.0221        | -               |
| 1.8933 | 56800 | 0.0183        | -               |
| 1.895  | 56850 | 0.013         | -               |
| 1.8967 | 56900 | 0.03          | -               |
| 1.8983 | 56950 | 0.019         | -               |
| 1.9    | 57000 | 0.0167        | -               |
| 1.9017 | 57050 | 0.0198        | -               |
| 1.9033 | 57100 | 0.0244        | -               |
| 1.905  | 57150 | 0.0158        | -               |
| 1.9067 | 57200 | 0.0266        | -               |
| 1.9083 | 57250 | 0.015         | -               |
| 1.9100 | 57300 | 0.0094        | -               |
| 1.9117 | 57350 | 0.0178        | -               |
| 1.9133 | 57400 | 0.0271        | -               |
| 1.915  | 57450 | 0.0179        | -               |
| 1.9167 | 57500 | 0.0182        | -               |
| 1.9183 | 57550 | 0.0257        | -               |
| 1.92   | 57600 | 0.0216        | -               |
| 1.9217 | 57650 | 0.0299        | -               |
| 1.9233 | 57700 | 0.0323        | -               |
| 1.925  | 57750 | 0.0225        | -               |
| 1.9267 | 57800 | 0.0267        | -               |
| 1.9283 | 57850 | 0.0315        | -               |
| 1.9300 | 57900 | 0.0302        | -               |
| 1.9317 | 57950 | 0.024         | -               |
| 1.9333 | 58000 | 0.0238        | -               |
| 1.935  | 58050 | 0.0185        | -               |
| 1.9367 | 58100 | 0.0151        | -               |
| 1.9383 | 58150 | 0.0191        | -               |
| 1.94   | 58200 | 0.0192        | -               |
| 1.9417 | 58250 | 0.0201        | -               |
| 1.9433 | 58300 | 0.0236        | -               |
| 1.9450 | 58350 | 0.0204        | -               |
| 1.9467 | 58400 | 0.0238        | -               |
| 1.9483 | 58450 | 0.0236        | -               |
| 1.95   | 58500 | 0.0218        | -               |
| 1.9517 | 58550 | 0.0212        | -               |
| 1.9533 | 58600 | 0.0242        | -               |
| 1.955  | 58650 | 0.024         | -               |
| 1.9567 | 58700 | 0.0196        | -               |
| 1.9583 | 58750 | 0.0194        | -               |
| 1.96   | 58800 | 0.0216        | -               |
| 1.9617 | 58850 | 0.0293        | -               |
| 1.9633 | 58900 | 0.0247        | -               |
| 1.9650 | 58950 | 0.0189        | -               |
| 1.9667 | 59000 | 0.0218        | -               |
| 1.9683 | 59050 | 0.0259        | -               |
| 1.97   | 59100 | 0.0173        | -               |
| 1.9717 | 59150 | 0.0218        | -               |
| 1.9733 | 59200 | 0.0218        | -               |
| 1.975  | 59250 | 0.0181        | -               |
| 1.9767 | 59300 | 0.0167        | -               |
| 1.9783 | 59350 | 0.0215        | -               |
| 1.98   | 59400 | 0.0206        | -               |
| 1.9817 | 59450 | 0.0117        | -               |
| 1.9833 | 59500 | 0.0249        | -               |
| 1.9850 | 59550 | 0.0183        | -               |
| 1.9867 | 59600 | 0.0148        | -               |
| 1.9883 | 59650 | 0.0284        | -               |
| 1.99   | 59700 | 0.015         | -               |
| 1.9917 | 59750 | 0.0165        | -               |
| 1.9933 | 59800 | 0.0163        | -               |
| 1.995  | 59850 | 0.0124        | -               |
| 1.9967 | 59900 | 0.0204        | -               |
| 1.9983 | 59950 | 0.0132        | -               |
| 2.0    | 60000 | 0.0193        | -               |
| 2.0017 | 60050 | 0.0171        | -               |
| 2.0033 | 60100 | 0.0108        | -               |
| 2.005  | 60150 | 0.0255        | -               |
| 2.0067 | 60200 | 0.0169        | -               |
| 2.0083 | 60250 | 0.0166        | -               |
| 2.01   | 60300 | 0.0214        | -               |
| 2.0117 | 60350 | 0.023         | -               |
| 2.0133 | 60400 | 0.0156        | -               |
| 2.015  | 60450 | 0.0193        | -               |
| 2.0167 | 60500 | 0.021         | -               |
| 2.0183 | 60550 | 0.0173        | -               |
| 2.02   | 60600 | 0.0152        | -               |
| 2.0217 | 60650 | 0.0126        | -               |
| 2.0233 | 60700 | 0.0209        | -               |
| 2.025  | 60750 | 0.0264        | -               |
| 2.0267 | 60800 | 0.0136        | -               |
| 2.0283 | 60850 | 0.0181        | -               |
| 2.03   | 60900 | 0.0185        | -               |
| 2.0317 | 60950 | 0.0244        | -               |
| 2.0333 | 61000 | 0.027         | -               |
| 2.035  | 61050 | 0.0215        | -               |
| 2.0367 | 61100 | 0.0184        | -               |
| 2.0383 | 61150 | 0.0176        | -               |
| 2.04   | 61200 | 0.0188        | -               |
| 2.0417 | 61250 | 0.0137        | -               |
| 2.0433 | 61300 | 0.0168        | -               |
| 2.045  | 61350 | 0.0202        | -               |
| 2.0467 | 61400 | 0.0174        | -               |
| 2.0483 | 61450 | 0.0185        | -               |
| 2.05   | 61500 | 0.0175        | -               |
| 2.0517 | 61550 | 0.0232        | -               |
| 2.0533 | 61600 | 0.0141        | -               |
| 2.055  | 61650 | 0.0196        | -               |
| 2.0567 | 61700 | 0.0205        | -               |
| 2.0583 | 61750 | 0.0109        | -               |
| 2.06   | 61800 | 0.0213        | -               |
| 2.0617 | 61850 | 0.0199        | -               |
| 2.0633 | 61900 | 0.0272        | -               |
| 2.065  | 61950 | 0.0237        | -               |
| 2.0667 | 62000 | 0.0138        | -               |
| 2.0683 | 62050 | 0.0206        | -               |
| 2.07   | 62100 | 0.014         | -               |
| 2.0717 | 62150 | 0.0168        | -               |
| 2.0733 | 62200 | 0.0123        | -               |
| 2.075  | 62250 | 0.0184        | -               |
| 2.0767 | 62300 | 0.0235        | -               |
| 2.0783 | 62350 | 0.0158        | -               |
| 2.08   | 62400 | 0.0224        | -               |
| 2.0817 | 62450 | 0.0267        | -               |
| 2.0833 | 62500 | 0.0142        | -               |
| 2.085  | 62550 | 0.0135        | -               |
| 2.0867 | 62600 | 0.0203        | -               |
| 2.0883 | 62650 | 0.0288        | -               |
| 2.09   | 62700 | 0.0152        | -               |
| 2.0917 | 62750 | 0.0187        | -               |
| 2.0933 | 62800 | 0.022         | -               |
| 2.095  | 62850 | 0.0166        | -               |
| 2.0967 | 62900 | 0.0135        | -               |
| 2.0983 | 62950 | 0.0096        | -               |
| 2.1    | 63000 | 0.0168        | -               |
| 2.1017 | 63050 | 0.0133        | -               |
| 2.1033 | 63100 | 0.0126        | -               |
| 2.105  | 63150 | 0.0179        | -               |
| 2.1067 | 63200 | 0.0231        | -               |
| 2.1083 | 63250 | 0.0128        | -               |
| 2.11   | 63300 | 0.0235        | -               |
| 2.1117 | 63350 | 0.0088        | -               |
| 2.1133 | 63400 | 0.0191        | -               |
| 2.115  | 63450 | 0.0266        | -               |
| 2.1167 | 63500 | 0.0139        | -               |
| 2.1183 | 63550 | 0.02          | -               |
| 2.12   | 63600 | 0.0175        | -               |
| 2.1217 | 63650 | 0.0193        | -               |
| 2.1233 | 63700 | 0.0141        | -               |
| 2.125  | 63750 | 0.0148        | -               |
| 2.1267 | 63800 | 0.0122        | -               |
| 2.1283 | 63850 | 0.0232        | -               |
| 2.13   | 63900 | 0.0175        | -               |
| 2.1317 | 63950 | 0.0169        | -               |
| 2.1333 | 64000 | 0.0213        | -               |
| 2.135  | 64050 | 0.0181        | -               |
| 2.1367 | 64100 | 0.0223        | -               |
| 2.1383 | 64150 | 0.0277        | -               |
| 2.14   | 64200 | 0.0101        | -               |
| 2.1417 | 64250 | 0.0188        | -               |
| 2.1433 | 64300 | 0.0102        | -               |
| 2.145  | 64350 | 0.0212        | -               |
| 2.1467 | 64400 | 0.0109        | -               |
| 2.1483 | 64450 | 0.027         | -               |
| 2.15   | 64500 | 0.0279        | -               |
| 2.1517 | 64550 | 0.0215        | -               |
| 2.1533 | 64600 | 0.021         | -               |
| 2.155  | 64650 | 0.0208        | -               |
| 2.1567 | 64700 | 0.0153        | -               |
| 2.1583 | 64750 | 0.0174        | -               |
| 2.16   | 64800 | 0.0181        | -               |
| 2.1617 | 64850 | 0.0136        | -               |
| 2.1633 | 64900 | 0.013         | -               |
| 2.165  | 64950 | 0.0234        | -               |
| 2.1667 | 65000 | 0.0158        | -               |
| 2.1683 | 65050 | 0.0175        | -               |
| 2.17   | 65100 | 0.0184        | -               |
| 2.1717 | 65150 | 0.0182        | -               |
| 2.1733 | 65200 | 0.0193        | -               |
| 2.175  | 65250 | 0.0243        | -               |
| 2.1767 | 65300 | 0.0231        | -               |
| 2.1783 | 65350 | 0.023         | -               |
| 2.18   | 65400 | 0.0135        | -               |
| 2.1817 | 65450 | 0.0218        | -               |
| 2.1833 | 65500 | 0.0129        | -               |
| 2.185  | 65550 | 0.0228        | -               |
| 2.1867 | 65600 | 0.0231        | -               |
| 2.1883 | 65650 | 0.0224        | -               |
| 2.19   | 65700 | 0.014         | -               |
| 2.1917 | 65750 | 0.0126        | -               |
| 2.1933 | 65800 | 0.0204        | -               |
| 2.195  | 65850 | 0.0179        | -               |
| 2.1967 | 65900 | 0.0187        | -               |
| 2.1983 | 65950 | 0.0257        | -               |
| 2.2    | 66000 | 0.0127        | -               |
| 2.2017 | 66050 | 0.0201        | -               |
| 2.2033 | 66100 | 0.0154        | -               |
| 2.205  | 66150 | 0.0155        | -               |
| 2.2067 | 66200 | 0.0125        | -               |
| 2.2083 | 66250 | 0.0107        | -               |
| 2.21   | 66300 | 0.0236        | -               |
| 2.2117 | 66350 | 0.0183        | -               |
| 2.2133 | 66400 | 0.0222        | -               |
| 2.215  | 66450 | 0.023         | -               |
| 2.2167 | 66500 | 0.0127        | -               |
| 2.2183 | 66550 | 0.0305        | -               |
| 2.22   | 66600 | 0.0209        | -               |
| 2.2217 | 66650 | 0.0125        | -               |
| 2.2233 | 66700 | 0.0199        | -               |
| 2.225  | 66750 | 0.0179        | -               |
| 2.2267 | 66800 | 0.0134        | -               |
| 2.2283 | 66850 | 0.0107        | -               |
| 2.23   | 66900 | 0.017         | -               |
| 2.2317 | 66950 | 0.0208        | -               |
| 2.2333 | 67000 | 0.0146        | -               |
| 2.235  | 67050 | 0.0162        | -               |
| 2.2367 | 67100 | 0.0152        | -               |
| 2.2383 | 67150 | 0.0205        | -               |
| 2.24   | 67200 | 0.0203        | -               |
| 2.2417 | 67250 | 0.0202        | -               |
| 2.2433 | 67300 | 0.0165        | -               |
| 2.245  | 67350 | 0.0164        | -               |
| 2.2467 | 67400 | 0.0137        | -               |
| 2.2483 | 67450 | 0.0132        | -               |
| 2.25   | 67500 | 0.0191        | -               |
| 2.2517 | 67550 | 0.0143        | -               |
| 2.2533 | 67600 | 0.0188        | -               |
| 2.255  | 67650 | 0.0123        | -               |
| 2.2567 | 67700 | 0.0217        | -               |
| 2.2583 | 67750 | 0.0203        | -               |
| 2.26   | 67800 | 0.0182        | -               |
| 2.2617 | 67850 | 0.018         | -               |
| 2.2633 | 67900 | 0.0253        | -               |
| 2.265  | 67950 | 0.0174        | -               |
| 2.2667 | 68000 | 0.0226        | -               |
| 2.2683 | 68050 | 0.0139        | -               |
| 2.27   | 68100 | 0.0152        | -               |
| 2.2717 | 68150 | 0.0134        | -               |
| 2.2733 | 68200 | 0.0211        | -               |
| 2.275  | 68250 | 0.0147        | -               |
| 2.2767 | 68300 | 0.02          | -               |
| 2.2783 | 68350 | 0.0155        | -               |
| 2.2800 | 68400 | 0.0166        | -               |
| 2.2817 | 68450 | 0.0127        | -               |
| 2.2833 | 68500 | 0.011         | -               |
| 2.285  | 68550 | 0.0158        | -               |
| 2.2867 | 68600 | 0.0235        | -               |
| 2.2883 | 68650 | 0.019         | -               |
| 2.29   | 68700 | 0.014         | -               |
| 2.2917 | 68750 | 0.0177        | -               |
| 2.2933 | 68800 | 0.0154        | -               |
| 2.295  | 68850 | 0.0232        | -               |
| 2.2967 | 68900 | 0.0136        | -               |
| 2.2983 | 68950 | 0.0273        | -               |
| 2.3    | 69000 | 0.0233        | -               |
| 2.3017 | 69050 | 0.0141        | -               |
| 2.3033 | 69100 | 0.0129        | -               |
| 2.305  | 69150 | 0.0191        | -               |
| 2.3067 | 69200 | 0.0234        | -               |
| 2.3083 | 69250 | 0.023         | -               |
| 2.31   | 69300 | 0.0192        | -               |
| 2.3117 | 69350 | 0.0171        | -               |
| 2.3133 | 69400 | 0.0105        | -               |
| 2.315  | 69450 | 0.0216        | -               |
| 2.3167 | 69500 | 0.0173        | -               |
| 2.3183 | 69550 | 0.0214        | -               |
| 2.32   | 69600 | 0.0203        | -               |
| 2.3217 | 69650 | 0.0132        | -               |
| 2.3233 | 69700 | 0.0106        | -               |
| 2.325  | 69750 | 0.0207        | -               |
| 2.3267 | 69800 | 0.024         | -               |
| 2.3283 | 69850 | 0.0202        | -               |
| 2.33   | 69900 | 0.017         | -               |
| 2.3317 | 69950 | 0.0164        | -               |
| 2.3333 | 70000 | 0.0198        | -               |
| 2.335  | 70050 | 0.0162        | -               |
| 2.3367 | 70100 | 0.0161        | -               |
| 2.3383 | 70150 | 0.0214        | -               |
| 2.34   | 70200 | 0.0097        | -               |
| 2.3417 | 70250 | 0.0246        | -               |
| 2.3433 | 70300 | 0.0177        | -               |
| 2.3450 | 70350 | 0.0167        | -               |
| 2.3467 | 70400 | 0.0096        | -               |
| 2.3483 | 70450 | 0.0181        | -               |
| 2.35   | 70500 | 0.0187        | -               |
| 2.3517 | 70550 | 0.0259        | -               |
| 2.3533 | 70600 | 0.0237        | -               |
| 2.355  | 70650 | 0.0149        | -               |
| 2.3567 | 70700 | 0.0193        | -               |
| 2.3583 | 70750 | 0.0168        | -               |
| 2.36   | 70800 | 0.0211        | -               |
| 2.3617 | 70850 | 0.0149        | -               |
| 2.3633 | 70900 | 0.0178        | -               |
| 2.365  | 70950 | 0.0184        | -               |
| 2.3667 | 71000 | 0.023         | -               |
| 2.3683 | 71050 | 0.0172        | -               |
| 2.37   | 71100 | 0.0246        | -               |
| 2.3717 | 71150 | 0.0201        | -               |
| 2.3733 | 71200 | 0.0144        | -               |
| 2.375  | 71250 | 0.0159        | -               |
| 2.3767 | 71300 | 0.0214        | -               |
| 2.3783 | 71350 | 0.0143        | -               |
| 2.38   | 71400 | 0.0147        | -               |
| 2.3817 | 71450 | 0.018         | -               |
| 2.3833 | 71500 | 0.0127        | -               |
| 2.385  | 71550 | 0.025         | -               |
| 2.3867 | 71600 | 0.0178        | -               |
| 2.3883 | 71650 | 0.0167        | -               |
| 2.39   | 71700 | 0.0149        | -               |
| 2.3917 | 71750 | 0.02          | -               |
| 2.3933 | 71800 | 0.0184        | -               |
| 2.395  | 71850 | 0.0118        | -               |
| 2.3967 | 71900 | 0.0211        | -               |
| 2.3983 | 71950 | 0.0172        | -               |
| 2.4    | 72000 | 0.016         | -               |
| 2.4017 | 72050 | 0.0103        | -               |
| 2.4033 | 72100 | 0.0186        | -               |
| 2.4050 | 72150 | 0.02          | -               |
| 2.4067 | 72200 | 0.0199        | -               |
| 2.4083 | 72250 | 0.0117        | -               |
| 2.41   | 72300 | 0.0175        | -               |
| 2.4117 | 72350 | 0.0122        | -               |
| 2.4133 | 72400 | 0.0211        | -               |
| 2.415  | 72450 | 0.0144        | -               |
| 2.4167 | 72500 | 0.0236        | -               |
| 2.4183 | 72550 | 0.0162        | -               |
| 2.42   | 72600 | 0.0204        | -               |
| 2.4217 | 72650 | 0.0222        | -               |
| 2.4233 | 72700 | 0.0173        | -               |
| 2.425  | 72750 | 0.0161        | -               |
| 2.4267 | 72800 | 0.0152        | -               |
| 2.4283 | 72850 | 0.0192        | -               |
| 2.43   | 72900 | 0.0239        | -               |
| 2.4317 | 72950 | 0.0233        | -               |
| 2.4333 | 73000 | 0.0302        | -               |
| 2.435  | 73050 | 0.014         | -               |
| 2.4367 | 73100 | 0.0248        | -               |
| 2.4383 | 73150 | 0.0142        | -               |
| 2.44   | 73200 | 0.0133        | -               |
| 2.4417 | 73250 | 0.0101        | -               |
| 2.4433 | 73300 | 0.0216        | -               |
| 2.445  | 73350 | 0.0175        | -               |
| 2.4467 | 73400 | 0.0182        | -               |
| 2.4483 | 73450 | 0.0152        | -               |
| 2.45   | 73500 | 0.0253        | -               |
| 2.4517 | 73550 | 0.0136        | -               |
| 2.4533 | 73600 | 0.0182        | -               |
| 2.455  | 73650 | 0.0195        | -               |
| 2.4567 | 73700 | 0.0102        | -               |
| 2.4583 | 73750 | 0.0157        | -               |
| 2.46   | 73800 | 0.0161        | -               |
| 2.4617 | 73850 | 0.0158        | -               |
| 2.4633 | 73900 | 0.027         | -               |
| 2.465  | 73950 | 0.0226        | -               |
| 2.4667 | 74000 | 0.0147        | -               |
| 2.4683 | 74050 | 0.0201        | -               |
| 2.4700 | 74100 | 0.0132        | -               |
| 2.4717 | 74150 | 0.0222        | -               |
| 2.4733 | 74200 | 0.0155        | -               |
| 2.475  | 74250 | 0.0165        | -               |
| 2.4767 | 74300 | 0.0239        | -               |
| 2.4783 | 74350 | 0.0174        | -               |
| 2.48   | 74400 | 0.0146        | -               |
| 2.4817 | 74450 | 0.0112        | -               |
| 2.4833 | 74500 | 0.0156        | -               |
| 2.485  | 74550 | 0.0182        | -               |
| 2.4867 | 74600 | 0.0157        | -               |
| 2.4883 | 74650 | 0.0149        | -               |
| 2.49   | 74700 | 0.0207        | -               |
| 2.4917 | 74750 | 0.022         | -               |
| 2.4933 | 74800 | 0.0207        | -               |
| 2.495  | 74850 | 0.0158        | -               |
| 2.4967 | 74900 | 0.0165        | -               |
| 2.4983 | 74950 | 0.0176        | -               |
| 2.5    | 75000 | 0.0242        | -               |
| 2.5017 | 75050 | 0.0149        | -               |
| 2.5033 | 75100 | 0.0181        | -               |
| 2.505  | 75150 | 0.025         | -               |
| 2.5067 | 75200 | 0.0123        | -               |
| 2.5083 | 75250 | 0.0162        | -               |
| 2.51   | 75300 | 0.0141        | -               |
| 2.5117 | 75350 | 0.0202        | -               |
| 2.5133 | 75400 | 0.0104        | -               |
| 2.515  | 75450 | 0.02          | -               |
| 2.5167 | 75500 | 0.0102        | -               |
| 2.5183 | 75550 | 0.0155        | -               |
| 2.52   | 75600 | 0.0177        | -               |
| 2.5217 | 75650 | 0.0097        | -               |
| 2.5233 | 75700 | 0.0191        | -               |
| 2.525  | 75750 | 0.0253        | -               |
| 2.5267 | 75800 | 0.0149        | -               |
| 2.5283 | 75850 | 0.0147        | -               |
| 2.5300 | 75900 | 0.0151        | -               |
| 2.5317 | 75950 | 0.0233        | -               |
| 2.5333 | 76000 | 0.0283        | -               |
| 2.535  | 76050 | 0.0119        | -               |
| 2.5367 | 76100 | 0.0115        | -               |
| 2.5383 | 76150 | 0.0161        | -               |
| 2.54   | 76200 | 0.0098        | -               |
| 2.5417 | 76250 | 0.0278        | -               |
| 2.5433 | 76300 | 0.0119        | -               |
| 2.545  | 76350 | 0.0088        | -               |
| 2.5467 | 76400 | 0.0147        | -               |
| 2.5483 | 76450 | 0.0146        | -               |
| 2.55   | 76500 | 0.0255        | -               |
| 2.5517 | 76550 | 0.0135        | -               |
| 2.5533 | 76600 | 0.0172        | -               |
| 2.555  | 76650 | 0.0186        | -               |
| 2.5567 | 76700 | 0.0193        | -               |
| 2.5583 | 76750 | 0.0182        | -               |
| 2.56   | 76800 | 0.0173        | -               |
| 2.5617 | 76850 | 0.0194        | -               |
| 2.5633 | 76900 | 0.0162        | -               |
| 2.565  | 76950 | 0.017         | -               |
| 2.5667 | 77000 | 0.0151        | -               |
| 2.5683 | 77050 | 0.0169        | -               |
| 2.57   | 77100 | 0.0177        | -               |
| 2.5717 | 77150 | 0.0122        | -               |
| 2.5733 | 77200 | 0.0118        | -               |
| 2.575  | 77250 | 0.0108        | -               |
| 2.5767 | 77300 | 0.0179        | -               |
| 2.5783 | 77350 | 0.0214        | -               |
| 2.58   | 77400 | 0.0081        | -               |
| 2.5817 | 77450 | 0.01          | -               |
| 2.5833 | 77500 | 0.0189        | -               |
| 2.585  | 77550 | 0.0207        | -               |
| 2.5867 | 77600 | 0.0215        | -               |
| 2.5883 | 77650 | 0.0216        | -               |
| 2.59   | 77700 | 0.0208        | -               |
| 2.5917 | 77750 | 0.012         | -               |
| 2.5933 | 77800 | 0.0143        | -               |
| 2.5950 | 77850 | 0.0203        | -               |
| 2.5967 | 77900 | 0.0264        | -               |
| 2.5983 | 77950 | 0.0131        | -               |
| 2.6    | 78000 | 0.0131        | -               |
| 2.6017 | 78050 | 0.0133        | -               |
| 2.6033 | 78100 | 0.0176        | -               |
| 2.605  | 78150 | 0.0126        | -               |
| 2.6067 | 78200 | 0.0214        | -               |
| 2.6083 | 78250 | 0.0096        | -               |
| 2.61   | 78300 | 0.0176        | -               |
| 2.6117 | 78350 | 0.0164        | -               |
| 2.6133 | 78400 | 0.0158        | -               |
| 2.615  | 78450 | 0.0165        | -               |
| 2.6167 | 78500 | 0.0178        | -               |
| 2.6183 | 78550 | 0.0094        | -               |
| 2.62   | 78600 | 0.0226        | -               |
| 2.6217 | 78650 | 0.0142        | -               |
| 2.6233 | 78700 | 0.0117        | -               |
| 2.625  | 78750 | 0.0142        | -               |
| 2.6267 | 78800 | 0.0155        | -               |
| 2.6283 | 78850 | 0.0161        | -               |
| 2.63   | 78900 | 0.0171        | -               |
| 2.6317 | 78950 | 0.0127        | -               |
| 2.6333 | 79000 | 0.0167        | -               |
| 2.635  | 79050 | 0.0156        | -               |
| 2.6367 | 79100 | 0.0136        | -               |
| 2.6383 | 79150 | 0.0176        | -               |
| 2.64   | 79200 | 0.0131        | -               |
| 2.6417 | 79250 | 0.0105        | -               |
| 2.6433 | 79300 | 0.0162        | -               |
| 2.645  | 79350 | 0.0175        | -               |
| 2.6467 | 79400 | 0.0175        | -               |
| 2.6483 | 79450 | 0.0199        | -               |
| 2.65   | 79500 | 0.0211        | -               |
| 2.6517 | 79550 | 0.0165        | -               |
| 2.6533 | 79600 | 0.0242        | -               |
| 2.6550 | 79650 | 0.0268        | -               |
| 2.6567 | 79700 | 0.0146        | -               |
| 2.6583 | 79750 | 0.0191        | -               |
| 2.66   | 79800 | 0.0117        | -               |
| 2.6617 | 79850 | 0.0164        | -               |
| 2.6633 | 79900 | 0.0182        | -               |
| 2.665  | 79950 | 0.0214        | -               |
| 2.6667 | 80000 | 0.0246        | -               |
| 2.6683 | 80050 | 0.0289        | -               |
| 2.67   | 80100 | 0.018         | -               |
| 2.6717 | 80150 | 0.0152        | -               |
| 2.6733 | 80200 | 0.0225        | -               |
| 2.675  | 80250 | 0.0229        | -               |
| 2.6767 | 80300 | 0.0178        | -               |
| 2.6783 | 80350 | 0.009         | -               |
| 2.68   | 80400 | 0.0156        | -               |
| 2.6817 | 80450 | 0.0202        | -               |
| 2.6833 | 80500 | 0.0095        | -               |
| 2.685  | 80550 | 0.0139        | -               |
| 2.6867 | 80600 | 0.0135        | -               |
| 2.6883 | 80650 | 0.019         | -               |
| 2.69   | 80700 | 0.0163        | -               |
| 2.6917 | 80750 | 0.0219        | -               |
| 2.6933 | 80800 | 0.0241        | -               |
| 2.695  | 80850 | 0.0082        | -               |
| 2.6967 | 80900 | 0.0106        | -               |
| 2.6983 | 80950 | 0.0083        | -               |
| 2.7    | 81000 | 0.0218        | -               |
| 2.7017 | 81050 | 0.0255        | -               |
| 2.7033 | 81100 | 0.0204        | -               |
| 2.705  | 81150 | 0.0196        | -               |
| 2.7067 | 81200 | 0.0159        | -               |
| 2.7083 | 81250 | 0.0118        | -               |
| 2.71   | 81300 | 0.0132        | -               |
| 2.7117 | 81350 | 0.0144        | -               |
| 2.7133 | 81400 | 0.0134        | -               |
| 2.715  | 81450 | 0.0149        | -               |
| 2.7167 | 81500 | 0.0173        | -               |
| 2.7183 | 81550 | 0.0226        | -               |
| 2.7200 | 81600 | 0.0152        | -               |
| 2.7217 | 81650 | 0.0121        | -               |
| 2.7233 | 81700 | 0.0143        | -               |
| 2.725  | 81750 | 0.024         | -               |
| 2.7267 | 81800 | 0.0173        | -               |
| 2.7283 | 81850 | 0.0186        | -               |
| 2.73   | 81900 | 0.0228        | -               |
| 2.7317 | 81950 | 0.0114        | -               |
| 2.7333 | 82000 | 0.0133        | -               |
| 2.735  | 82050 | 0.0155        | -               |
| 2.7367 | 82100 | 0.0161        | -               |
| 2.7383 | 82150 | 0.0153        | -               |
| 2.74   | 82200 | 0.011         | -               |
| 2.7417 | 82250 | 0.0167        | -               |
| 2.7433 | 82300 | 0.0278        | -               |
| 2.745  | 82350 | 0.0169        | -               |
| 2.7467 | 82400 | 0.0176        | -               |
| 2.7483 | 82450 | 0.0263        | -               |
| 2.75   | 82500 | 0.02          | -               |
| 2.7517 | 82550 | 0.0202        | -               |
| 2.7533 | 82600 | 0.0146        | -               |
| 2.755  | 82650 | 0.015         | -               |
| 2.7567 | 82700 | 0.0106        | -               |
| 2.7583 | 82750 | 0.0085        | -               |
| 2.76   | 82800 | 0.0183        | -               |
| 2.7617 | 82850 | 0.0176        | -               |
| 2.7633 | 82900 | 0.0086        | -               |
| 2.765  | 82950 | 0.016         | -               |
| 2.7667 | 83000 | 0.014         | -               |
| 2.7683 | 83050 | 0.0143        | -               |
| 2.77   | 83100 | 0.0152        | -               |
| 2.7717 | 83150 | 0.0105        | -               |
| 2.7733 | 83200 | 0.0153        | -               |
| 2.775  | 83250 | 0.0228        | -               |
| 2.7767 | 83300 | 0.0113        | -               |
| 2.7783 | 83350 | 0.0262        | -               |
| 2.7800 | 83400 | 0.0127        | -               |
| 2.7817 | 83450 | 0.0139        | -               |
| 2.7833 | 83500 | 0.0134        | -               |
| 2.785  | 83550 | 0.0186        | -               |
| 2.7867 | 83600 | 0.0244        | -               |
| 2.7883 | 83650 | 0.0089        | -               |
| 2.79   | 83700 | 0.018         | -               |
| 2.7917 | 83750 | 0.0166        | -               |
| 2.7933 | 83800 | 0.0077        | -               |
| 2.795  | 83850 | 0.0202        | -               |
| 2.7967 | 83900 | 0.0097        | -               |
| 2.7983 | 83950 | 0.0182        | -               |
| 2.8    | 84000 | 0.0132        | -               |
| 2.8017 | 84050 | 0.0145        | -               |
| 2.8033 | 84100 | 0.0121        | -               |
| 2.805  | 84150 | 0.0261        | -               |
| 2.8067 | 84200 | 0.0164        | -               |
| 2.8083 | 84250 | 0.0219        | -               |
| 2.81   | 84300 | 0.0162        | -               |
| 2.8117 | 84350 | 0.0209        | -               |
| 2.8133 | 84400 | 0.0112        | -               |
| 2.815  | 84450 | 0.0104        | -               |
| 2.8167 | 84500 | 0.0156        | -               |
| 2.8183 | 84550 | 0.0143        | -               |
| 2.82   | 84600 | 0.0101        | -               |
| 2.8217 | 84650 | 0.0207        | -               |
| 2.8233 | 84700 | 0.0155        | -               |
| 2.825  | 84750 | 0.0188        | -               |
| 2.8267 | 84800 | 0.0239        | -               |
| 2.8283 | 84850 | 0.0069        | -               |
| 2.83   | 84900 | 0.0136        | -               |
| 2.8317 | 84950 | 0.0202        | -               |
| 2.8333 | 85000 | 0.0198        | -               |
| 2.835  | 85050 | 0.0076        | -               |
| 2.8367 | 85100 | 0.0134        | -               |
| 2.8383 | 85150 | 0.0151        | -               |
| 2.84   | 85200 | 0.0194        | -               |
| 2.8417 | 85250 | 0.0208        | -               |
| 2.8433 | 85300 | 0.0157        | -               |
| 2.8450 | 85350 | 0.0262        | -               |
| 2.8467 | 85400 | 0.0122        | -               |
| 2.8483 | 85450 | 0.0189        | -               |
| 2.85   | 85500 | 0.0161        | -               |
| 2.8517 | 85550 | 0.0213        | -               |
| 2.8533 | 85600 | 0.0136        | -               |
| 2.855  | 85650 | 0.0164        | -               |
| 2.8567 | 85700 | 0.0092        | -               |
| 2.8583 | 85750 | 0.0195        | -               |
| 2.86   | 85800 | 0.0142        | -               |
| 2.8617 | 85850 | 0.0206        | -               |
| 2.8633 | 85900 | 0.014         | -               |
| 2.865  | 85950 | 0.015         | -               |
| 2.8667 | 86000 | 0.0179        | -               |
| 2.8683 | 86050 | 0.0187        | -               |
| 2.87   | 86100 | 0.0206        | -               |
| 2.8717 | 86150 | 0.0122        | -               |
| 2.8733 | 86200 | 0.0295        | -               |
| 2.875  | 86250 | 0.0136        | -               |
| 2.8767 | 86300 | 0.0183        | -               |
| 2.8783 | 86350 | 0.0101        | -               |
| 2.88   | 86400 | 0.0244        | -               |
| 2.8817 | 86450 | 0.0051        | -               |
| 2.8833 | 86500 | 0.0193        | -               |
| 2.885  | 86550 | 0.0171        | -               |
| 2.8867 | 86600 | 0.0193        | -               |
| 2.8883 | 86650 | 0.0134        | -               |
| 2.89   | 86700 | 0.0192        | -               |
| 2.8917 | 86750 | 0.0118        | -               |
| 2.8933 | 86800 | 0.0186        | -               |
| 2.895  | 86850 | 0.0133        | -               |
| 2.8967 | 86900 | 0.0159        | -               |
| 2.8983 | 86950 | 0.0192        | -               |
| 2.9    | 87000 | 0.0192        | -               |
| 2.9017 | 87050 | 0.0167        | -               |
| 2.9033 | 87100 | 0.0117        | -               |
| 2.9050 | 87150 | 0.0229        | -               |
| 2.9067 | 87200 | 0.0186        | -               |
| 2.9083 | 87250 | 0.0203        | -               |
| 2.91   | 87300 | 0.022         | -               |
| 2.9117 | 87350 | 0.0142        | -               |
| 2.9133 | 87400 | 0.0178        | -               |
| 2.915  | 87450 | 0.0136        | -               |
| 2.9167 | 87500 | 0.0145        | -               |
| 2.9183 | 87550 | 0.0202        | -               |
| 2.92   | 87600 | 0.0119        | -               |
| 2.9217 | 87650 | 0.0155        | -               |
| 2.9233 | 87700 | 0.0177        | -               |
| 2.925  | 87750 | 0.0141        | -               |
| 2.9267 | 87800 | 0.0074        | -               |
| 2.9283 | 87850 | 0.021         | -               |
| 2.93   | 87900 | 0.0225        | -               |
| 2.9317 | 87950 | 0.0124        | -               |
| 2.9333 | 88000 | 0.0126        | -               |
| 2.935  | 88050 | 0.0195        | -               |
| 2.9367 | 88100 | 0.0187        | -               |
| 2.9383 | 88150 | 0.0162        | -               |
| 2.94   | 88200 | 0.0069        | -               |
| 2.9417 | 88250 | 0.0199        | -               |
| 2.9433 | 88300 | 0.0198        | -               |
| 2.945  | 88350 | 0.0147        | -               |
| 2.9467 | 88400 | 0.0132        | -               |
| 2.9483 | 88450 | 0.0132        | -               |
| 2.95   | 88500 | 0.0166        | -               |
| 2.9517 | 88550 | 0.0185        | -               |
| 2.9533 | 88600 | 0.0138        | -               |
| 2.955  | 88650 | 0.014         | -               |
| 2.9567 | 88700 | 0.0086        | -               |
| 2.9583 | 88750 | 0.017         | -               |
| 2.96   | 88800 | 0.0232        | -               |
| 2.9617 | 88850 | 0.0175        | -               |
| 2.9633 | 88900 | 0.0132        | -               |
| 2.965  | 88950 | 0.0276        | -               |
| 2.9667 | 89000 | 0.0225        | -               |
| 2.9683 | 89050 | 0.0285        | -               |
| 2.9700 | 89100 | 0.0201        | -               |
| 2.9717 | 89150 | 0.0198        | -               |
| 2.9733 | 89200 | 0.0145        | -               |
| 2.975  | 89250 | 0.0095        | -               |
| 2.9767 | 89300 | 0.0245        | -               |
| 2.9783 | 89350 | 0.0142        | -               |
| 2.98   | 89400 | 0.0305        | -               |
| 2.9817 | 89450 | 0.0169        | -               |
| 2.9833 | 89500 | 0.0216        | -               |
| 2.985  | 89550 | 0.0141        | -               |
| 2.9867 | 89600 | 0.0315        | -               |
| 2.9883 | 89650 | 0.0086        | -               |
| 2.99   | 89700 | 0.0165        | -               |
| 2.9917 | 89750 | 0.0196        | -               |
| 2.9933 | 89800 | 0.0161        | -               |
| 2.995  | 89850 | 0.0134        | -               |
| 2.9967 | 89900 | 0.02          | -               |
| 2.9983 | 89950 | 0.0191        | -               |
| 3.0    | 90000 | 0.0183        | -               |

### Framework Versions
- Python: 3.12.12
- SetFit: 1.1.3
- Sentence Transformers: 3.4.1
- Transformers: 4.57.6
- PyTorch: 2.9.0+cu126
- Datasets: 4.0.0
- Tokenizers: 0.22.2

## Citation

### BibTeX
```bibtex
@article{https://doi.org/10.48550/arxiv.2209.11055,
    doi = {10.48550/ARXIV.2209.11055},
    url = {https://arxiv.org/abs/2209.11055},
    author = {Tunstall, Lewis and Reimers, Nils and Jo, Unso Eun Seo and Bates, Luke and Korat, Daniel and Wasserblat, Moshe and Pereg, Oren},
    keywords = {Computation and Language (cs.CL), FOS: Computer and information sciences, FOS: Computer and information sciences},
    title = {Efficient Few-Shot Learning Without Prompts},
    publisher = {arXiv},
    year = {2022},
    copyright = {Creative Commons Attribution 4.0 International}
}
```

<!--
## Glossary

*Clearly define terms in order to be accessible across audiences.*
-->

<!--
## Model Card Authors

*Lists the people who create the model card, providing recognition and accountability for the detailed work that goes into its construction.*
-->

<!--
## Model Card Contact

*Provides a way for people who have updates to the Model Card, suggestions, or questions, to contact the Model Card authors.*
-->