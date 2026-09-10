# 🏎️ 3D 2025 BMW M3 Competition Touring (G81) Architecture Lab

An interactive, high-fidelity 3D engineering laboratory that breaks down the mechanical architecture and powertrain kinematics of the **2025 BMW M3 Competition Touring with M xDrive (G81)**.

Built using **React 19, TypeScript, Three.js, and authentic PBR 3D models**, this project provides a granular disassembly from the sculpted long-roof wagon unibody down to microscopic internal engine, transmission, turbocharger, and active all-wheel-drive components.

🌐 **Live Interactive Web App**: [https://shuen-05.github.io/Car_Architecture_Lab/](https://shuen-05.github.io/Car_Architecture_Lab/)

---

## 🚗 Core Automotive Subsystems Modeled

### 1. Exterior & Monocoque Chassis
- **Sculpted Wagon Silhouette**: Authentic 2025 BMW M3 Competition Touring proportions finished in Isle of Man Green Metallic with high-gloss M Shadowline exterior package.
- **Cooling Architecture**: Frameless vertical BMW kidney grilles feeding airflow directly into the primary radiator, charge-air cooler, engine oil cooler, and transmission heat exchanger.
- **Chassis Rigidity**: High-torsion unibody reinforced with front M Carbon Precision engine bay strut cross-brace, aluminum shear panels, underfloor cross-struts, and rigid subframes.
- **Lighting**: BMW Laserlight / Adaptive LED headlights with signature hexagonal daytime running lights (DRL) and slim smoked L-shaped 3D LED taillights.
- **Aerodynamics**: Front bumper air curtains, functional M side gills, sculpted carbon mirror caps, roof spoiler with integrated Gurney flap, and four 100 mm quad exhaust tips flanked by a gloss black rear diffuser.

### 2. S58B30T0 3.0L Twin-Turbo Inline-6 Engine
- **Architecture**: 2,993 cc displacement, 84.0 mm bore × 90.0 mm stroke, 9.3:1 compression ratio, producing **503 hp (510 PS) @ 6,250 RPM** and **650 Nm (479 lb-ft) @ 2,750–5,500 RPM**.
- **Cylinder Block**: Motorsport-derived closed-deck die-cast aluminum block with wire-arc sprayed iron cylinder liners for friction reduction and high torsional rigidity under cylinder pressures exceeding 140 bar.
- **Rotating Assembly**: Forged chrome-moly steel crankshaft with 12 counterweights, fractured-split connecting rods, and forged aluminum pistons with integrated crown cooling galleries.
- **Twin Mono-Scroll Turbochargers**: Two compact single-scroll turbochargers (Turbo 1 feeding cylinders 1–3, Turbo 2 feeding cylinders 4–6) operating up to 2.1 bar (30.5 PSI) boost with electric wastegate actuators and indirect water-to-air intercooling.
- **Valvetrain & Injection**: 3D-printed core cylinder head, double overhead camshafts (DOHC) with Double-VANOS variable valve timing and VALVETRONIC variable valve lift, 24 valves with sodium-filled exhaust stems, and 350-bar high-pressure direct injection.

### 3. ZF 8HP76 M Steptronic Transmission with Drivelogic
- **Torque Converter**: Multi-plate lockup clutch locking immediately after drive-off to provide instantaneous mechanical response without slip.
- **Gearbox Mechanics**: Four epicyclic planetary gearsets and five shift elements achieving 8 closely stacked forward gear ratios:
  - **1st**: 5.000:1 | **2nd**: 3.200:1 | **3rd**: 2.143:1 | **4th**: 1.720:1
  - **5th**: 1.314:1 | **6th**: 1.000:1 (Direct) | **7th**: 0.822:1 | **8th**: 0.640:1 | **R**: 3.456:1 | **Final Drive**: 3.154:1
- **Drivelogic Modes**: Three selectable shift profiles (Mode 1: Comfort, Mode 2: Sport, Mode 3: Track sequential shift speed with aggressive throttle blips).

### 4. M xDrive AWD & Active M Differential
- **Transfer Case**: Electronically controlled multi-plate wet clutch pack with continuous, infinitely variable front-to-rear torque distribution.
- **Propeller Shaft**: Single-piece Carbon Fiber Reinforced Plastic (CFRP) driveshaft delivering high torsional stiffness with zero rotational flex.
- **Active M Differential**: Electro-mechanical multi-plate limited-slip rear differential providing 0% to 100% active locking between rear wheels in milliseconds.
- **M xDrive Drive Modes**:
  - **4WD**: Maximum traction and stability in all road conditions.
  - **4WD Sport**: Rear-biased torque distribution for dynamic throttle-steer agility.
  - **2WD**: Pure rear-wheel drive with DSC disengaged for authentic track drifting.

### 5. Suspension, Steering & Brakes
- **Front Suspension**: Double-joint spring strut axle with lightweight aluminum wishbones, hydro-mounts, and dynamic camber/caster kinematics.
- **Rear Suspension**: Five-link independent rear axle with Adaptive M electronically controlled dampers.
- **M Servotronic Steering**: Variable-ratio electric rack-and-pinion steering with dynamic Ackermann geometry.
- **M Carbon Ceramic Brakes**: 400 mm front cross-drilled ceramic discs with gold 6-piston fixed calipers; 380 mm rear ventilated discs with single-piston floating calipers.
- **Wheels & Tires**: Staggered M forged double-spoke Style 826M wheels (19" front, 20" rear) wrapped in Michelin Pilot Sport 4S tires.

---

## 🎮 Interactive Controls & Kinematics

| Control | Action | Shortcut |
| :--- | :--- | :--- |
| **Engine Start/Stop** | Toggles S58 Twin-Turbo ignition and idle governor (750 RPM) | UI Push-Button |
| **Throttle Pedal** | Regulates fuel injection, boost pressure, and engine revs up to 7,200 RPM redline | `W` or `Up Arrow` |
| **Brake Pedal** | Clamps 6-piston M calipers and decelerates road wheels | `S`, `Down Arrow`, or `Space` |
| **Steering Angle** | Turns front knuckles with dynamic camber tilt and Ackermann geometry | `A` (Left) / `D` (Right) |
| **Gear Selector** | Shifts between Park (`P`), Reverse (`R`), Neutral (`N`), and Drive/Manual (`D/M`) | UI Click |
| **Paddle Shifters** | Sequential upshifting and downshifting through 8 speeds | `E` (Upshift) / `Q` (Downshift) |
| **M xDrive Modes** | Cycles between 4WD (AWD), 4WD Sport (Rear-Biased), and 2WD (Pure RWD) | Header Selector |
| **Exploded View** | Disassembles vehicle exterior, chassis, and assemblies along physical axes | Slider (0–100%) |
| **Cutaway Mode** | Longitudinal cross-section revealing internal cylinders, valvetrain, and gears | Header Button |
| **X-Ray Mode** | Semi-transparent iridescent holographic chassis highlighting active mechanics | Header Button |
| **Acoustics Synth** | Web Audio API synthesizing authentic straight-six acoustics, turbo spool & blow-off | Header Toggle |
| **Interactive Inspect** | Click any 3D macro-assembly to focus the camera and view technical engineering data | Left Click on 3D Mesh |

---

## 📊 Live Powertrain Diagrams & Telemetry

1. **S58 Dyno Power & Torque Curves**:
   $$P_{\text{metric}} = \frac{T \times \text{RPM}}{7127}$$
   Displays the authentic 650 Nm torque plateau (2,750–5,500 RPM) and 503 HP peak (6,250 RPM) with real-time operating point tracking.
2. **Twin-Turbo Boost Pressure Gauge**:
   $$\Pi_c = \frac{P_{\text{boost}} + P_{\text{atm}}}{P_{\text{atm}}}$$
   Monitors manifold pressure from vacuum (-0.6 bar) to peak twin-turbo boost (+2.1 bar / 30.5 PSI) and wastegate bypass duty cycle.
3. **M xDrive Front/Rear Torque Split Map**:
   Visualizes real-time power vectoring between front and rear axles based on throttle input, steering angle, and selected drive mode (4WD / 4WD Sport / 2WD).
4. **8-Speed Stepped Gear Ratio Reduction**:
   $$T_{\text{wheel}} = T_{\text{engine}} \times R_{\text{gear}} \times R_{\text{final}}$$
   Visualizes transmission reduction ratios and dynamic wheel torque multiplication.
5. **Active M Differential Lock Percentage**:
   Displays electro-mechanical locking percentage (0–100%) and wheel speed differentiation through tight corners.

---

## 🛠️ Technology Stack

- **Framework**: React 19, TypeScript
- **3D Graphics**: Three.js (FBX PBR loader, procedural parametric meshes, clipping planes, ACES Filmic tone mapping, shadow mapping)
- **Audio Synthesizer**: Web Audio API (multi-oscillator inline-6 harmonic modeling, resonant biquad filters, white-noise turbo blow-off valve)
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Build & CI/CD**: Vite 8, Git LFS (Large File Storage), GitHub Actions workflow for automated GitHub Pages deployment

---

## 🚀 Running Locally

```bash
# Clone repository with Git LFS
git clone https://github.com/shuen-05/Car_Architecture_Lab.git
cd Car_Architecture_Lab

# Ensure Git LFS pulls binary assets
git lfs pull

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📄 License

MIT License. Designed for educational and automotive engineering exploration.
