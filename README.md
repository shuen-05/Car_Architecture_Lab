# 3D 2025 Lexus IS 300 Architecture Lab

An English-first, high-fidelity interactive 3D engineering laboratory that explains how the **2025 Lexus IS 300** luxury sports sedan converts chemical fuel energy into rear-wheel drive (RWD) vehicle motion.

Built using **React 19, TypeScript, Three.js, and procedural 3D automotive geometry**, this project provides a granular disassembly from the complete unibody exterior down to microscopic internal engine, transmission, and differential components.

---

## 🚗 Core Automotive Subsystems Modeled

### 1. Exterior & Monocoque Chassis
- **Aerodynamics**: Prototypical Lexus IS 300 sports sedan proportions (Cd 0.28) with vortex-shedding mirrors and rocker panels.
- **Spindle Grille**: Authentic 3D diamond mesh hourglass grille with chrome perimeter trim and integrated cooling air ducts.
- **Lighting**: Triple-Beam LED projector headlamps with signature L-shaped daytime running lights (DRL) and full-width rear LED light blade.
- **Chassis & Subframes**: Laser screw welded unibody floorpan, longitudinal transmission tunnel, front engine cradle subframe, strut tower cross-brace, and rear multi-link subframe.
- **Front Double-Wishbone Suspension**: Forged aluminum upper A-arms, lower L-arms, coilover springs with monotube dampers, 26.5 mm anti-roll sway bar, and working rack-and-pinion tie rods.
- **Rear Multi-Link Suspension**: 5-link independent rear geometry with upper camber links, lower control arms, trailing links, coil springs, and 17.0 mm stabilizer bar.

### 2. Engine Assembly (2.0L Turbocharged 8AR-FTS Inline-4)
- **Architecture**: 1,998 cc displacement, square 86.0 mm bore × 86.0 mm stroke, 10.0:1 compression ratio, 241 hp @ 5,800 RPM, 258 lb-ft (350 Nm) @ 1,650–4,400 RPM.
- **Twin-Scroll Turbocharger**: Dual-entry exhaust scroll (pairing cylinders 1–4 and 2–3) to eliminate exhaust blow-back interference, radial Inconel turbine wheel (up to 180,000 RPM), CNC billet compressor impeller, center bearing cartridge (CHRA) with oil/coolant passages, and pneumatic wastegate actuator limiting peak boost to 1.15 bar (16.7 PSI).
- **Intake & Intercooler**: High-flow airbox, water-to-air charge cooler, electronic drive-by-wire throttle body with rotating butterfly plate, and tuned intake runners.
- **Long Block & Valvetrain**: Crossflow aluminum cylinder head, DOHC with intake VVT-iW phaser (expanded crank timing for Otto/Atkinson cycle switching) and exhaust VVT-i gear, 16 poppet valves with dual springs, D-4ST direct injection (20 MPa) and low-pressure port injection (0.4 MPa), spark plugs, and individual pencil ignition coils.
- **Rotating Assembly & Block**: Die-cast aluminum cylinder block with spiny cast-iron cylinder liners, cross-drilled forged steel crankshaft with 8 counterweights, harmonic damper pulley, fracture-split connecting rods, forged aluminum pistons with cooling galleries, and baffled oil pan.

### 3. Lexus 8-Speed Sport Direct-Shift Transmission (AA81E)
- **Torque Converter**: Impeller pump driven by engine flexplate, curved stator with one-way sprag clutch (1.95:1 launch multiplication), turbine runner driving input shaft, and electronic multi-plate lockup clutch (active in gears 2–8).
- **Epicyclic Planetary Geartrain**: Lepelletier compound planetary gearsets (sun gears, planet carriers with pinions, outer ring/annulus gears) achieving 8 close-ratio forward gears:
  - 1st: 4.596:1 | 2nd: 2.724:1 | 3rd: 1.864:1 | 4th: 1.464:1
  - 5th: 1.231:1 | 6th: 1.000:1 (Direct) | 7th: 0.824:1 | 8th: 0.685:1 | R: 2.176:1
- **Hydraulic Valve Body**: Ribbed cast casing with 8 high-speed linear electro-hydraulic solenoids and multi-disc wet clutch packs.

### 4. Longitudinal Rear-Wheel Drivetrain
- **Propeller Shaft**: Two-piece tubular steel driveshaft with rubber-isolated center steady bearing, rubber flex guibo coupling, and cross-spider cardan universal joints (U-joints).
- **Rear Differential & Torsen LSD**: Hypoid spiral bevel ring and pinion (3.133:1 final drive ratio), differential carrier case with spider pinions, and Torsen Type B involute helical limited-slip elements providing up to 2.5:1 torque biasing to the gripping outside wheel.
- **Axles, Brakes & Wheels**: Constant-velocity (CV) half-shafts with 6-ball joints and rubber boots, 334 mm ventilated front brake discs with 4-piston calipers, 310 mm rear ventilated discs, and 18-inch 5-split-spoke alloy wheels with performance summer tires.

---

## 🎮 Interactive Controls & Kinematics

| Control | Action | Keyboard Shortcut |
| :--- | :--- | :--- |
| **Engine Start/Stop** | Toggles 8AR-FTS ignition and 750 RPM idle governor | Click Push-Button |
| **Throttle Pedal** | Regulates fuel injection, manifold boost, and engine RPM | `W` or `Up Arrow` |
| **Brake Pedal** | Clamps calipers and decelerates road wheels | `S`, `Down Arrow`, or `Space` |
| **Steering Angle** | Turns front knuckles, moves rack, and differentiates rear wheel speeds | `A` (Left) / `D` (Right) |
| **Gear Selector** | Shifts between Park (`P`), Reverse (`R`), Neutral (`N`), Drive (`D`), and Manual (`M`) | UI Click |
| **Paddle Shifters** | Sequential upshifting and downshifting through 8 speeds | `E` (Upshift) / `Q` (Downshift) |
| **Exploded View** | Continuous 0% to 100% disassembly along physical expansion vectors | Slider |
| **Cutaway Mode** | Longitudinal clipping plane exposing internal cylinders, valves, and gears | Header Button |
| **X-Ray Mode** | Semi-transparent iridescent holographic chassis with glowing active mechanics | Header Button |
| **Audio Synthesizer** | Web Audio API synthesizing 4-cylinder engine pitch, exhaust roar, and turbo spool | Header Button |
| **Inspect Part** | Click any 3D macro-assembly to focus the camera and view technical specs | Left Click on 3D Mesh |

---

## 📊 Live Powertrain Diagrams & Telemetry

1. **8AR-FTS Dyno Power & Torque Curves**:
   $$\text{Horsepower} = \frac{\text{Torque (Nm)} \times \text{RPM}}{7127}$$
   Displays the authentic 350 Nm torque plateau and 241 HP peak with a live operating point tracking your throttle and engine RPM in real time.
2. **Twin-Scroll Turbo Boost Pressure Map**:
   $$\Pi_c = \frac{P_{boost} + P_{atm}}{P_{atm}}$$
   Live radial gauge indicating vacuum (-0.6 bar) to peak boost (+1.15 bar / 16.7 PSI) and wastegate bypass duty cycle.
3. **8-Speed Stepped Gear Ratio Reduction Chart**:
   $$T_{wheel} = T_{engine} \times R_{tc} \times R_{gear} \times R_{diff}$$
   Visualizes transmission gear reduction stages and dynamic wheel torque multiplication.
4. **Differential Planetary Bevel Speed Split**:
   $$N_{ring} = \frac{N_{left} + N_{right}}{2}$$
   Live speed distribution bar demonstrating how the differential allows the outer wheel to spin faster through turns while the Torsen LSD limits wheel slip.
5. **Guided Educational Chapters**:
   5 interactive chapters explaining 4-stroke combustion, D-4ST dual injection, Atkinson/Otto cycle switching, twin-scroll scavenging, and epicyclic planetary transmissions.

---

## 🛠️ Technology Stack & Development

- **Framework**: React 19, TypeScript
- **3D Graphics**: Three.js (Procedural Parametric Geometries, PBR Standard & Physical Materials, Local Clipping Planes, ACES Filmic Tone Mapping, Soft Shadows)
- **Audio Engine**: Web Audio API (Multi-oscillator harmonic synthesis, biquad resonant filters, noise bursts for turbo blow-off valve)
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Build Tool**: Vite 8

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
