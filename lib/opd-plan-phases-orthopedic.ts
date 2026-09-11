import 'server-only'
import type { PostopPlanPhase } from './opd-plan-phase-types'

// Restructured from the owner's Notion OPD / 術後 pages, fetched 2026-09-09.
// Source IDs correspond to the sources retained in opd-prescriptions.ts:
// ACL 2e7451a33b66808490a8d2bddcef8498; ACL + meniscus 2e7451a33b6680da82b0d26de3168923
// PCL 324451a33b66803aa5f1ea779d02b80d; cuff + SLAP 2e7451a33b6680f092aec9a8e501d353
// TKR 2e7451a33b66804f9249e01cc97f8cd8; THR 2e7451a33b6680fc9f46d066bd12fba6
// Keep the source phase boundaries. Do not turn a calendar milestone into
// automatic clearance or omit graft/repair/approach-specific restrictions.
// ACL progression cross-check: Aspetar CPG (2023), accessed 2026-09-09:
// https://www.aspetar.com/en/professionals/aspetar-clinical-guidelines/recommendations-on-rehabilitation-after-aclr
export const orthopedicPlanPhases: Record<string, PostopPlanPhase[]> = {
  'acl-reconstruction': [
    {
      id: 'week-1',
      label: 'Week 1 | Protection and Muscle Activation',
      plan: `Weight Bearing / Brace: WBAT per surgical orders, using bilateral crutches and a brace locked in extension; level-ground gait training.
ROM: Prioritize full extension; gradually progress flexion toward 0–90° with patellar mobilization.
Therapeutic Exercise: Ankle pumps; quadriceps and gluteal isometric sets; hamstring isometrics per graft-specific restrictions and surgical orders. NMES as needed. Perform SLR in brace only if there is no extension lag.
Precautions: Adjust according to pain, effusion, wound status, and quadriceps control. Apply the stricter restrictions for concomitant meniscal, cartilage, or other ligament procedures.`,
    },
    {
      id: 'weeks-2-4',
      label: 'Weeks 2–4 | Gait and Early Strengthening',
      plan: `Weight Bearing / Brace: Wean from bilateral to single crutch, then no assistive device, according to quadriceps control and gait. Assess for FWB at approximately week 4; gradually unlock the brace.
ROM: Progress flexion from approximately 90° to 120°. Continue patellar mobilization; begin scar mobilization only after wound healing. Low-resistance stationary cycling for ROM.
Therapeutic Exercise: Add mini-squats 0–30°, leg press 0–60°, and calf raises as permitted by weight-bearing status and tolerance.
Functional / Balance Training: Single-leg stance with brace, balance board, and forward/backward walking according to motor control.
Precautions: No running, jumping, or squatting beyond 60°. Begin OKC knee extension only after week 4 per protocol. Additional hamstring loading with a hamstring graft must follow surgical orders.`,
    },
    {
      id: 'weeks-4-8',
      label: 'Weeks 4–8 | Graft Protection and Progressive Strengthening',
      plan: `Weight Bearing / Gait: Wean crutches once gait is normal and quadriceps control is adequate; FWB per surgical orders.
ROM: Progress toward full AROM, emphasizing terminal knee extension.
Therapeutic Exercise: CKC squats and leg press within 0–60° with progressive resistance; lunges, calf raises, low-impact cycling, and balance training.
OKC Exercise: After week 4 and with clearance, begin knee extension within the protected 90–45° range; adjust according to anterior knee pain and effusion.
Precautions: If a hamstring graft was used, defer additional hamstring loading per surgical orders. No independent running, jumping, or pivoting before functional criteria are met.`,
    },
    {
      id: 'weeks-8-12',
      label: 'Weeks 8–12 | Intermediate Strengthening and Balance',
      plan: `Brace: Wean during weeks 8–12 according to stability, gait, and surgical orders.
Therapeutic Exercise: Progress CKC resistance and core stability. Hamstring strengthening requires clearance and adherence to graft-specific restrictions.
Functional / Balance Training: Progress multidirectional balance board and single-leg stance; target controlled single-leg stance for more than 60 seconds.
Conditioning: Progress stationary cycling resistance and treadmill walking.
Precautions: Monitor pain, effusion, full extension, and movement quality. Elapsed postoperative time or brace discontinuation does not constitute clearance for running or jumping.`,
    },
    {
      id: 'month-3',
      label: 'Month 3 | Advanced Strengthening',
      plan: `Therapeutic Exercise: Continue CKC strengthening, core stability, and single-leg control to address side-to-side differences in muscle mass and strength.
Conditioning: After wound healing and team approval, swimming without breaststroke and outdoor cycling may begin per protocol; consider mounting/dismounting and fall risk.
Progression Criteria: Good control during single-leg squat to 60° and no post-exercise joint effusion. Monitor strength and movement quality.
Precautions: No running, jumping, or pivoting at this stage per protocol. Running progression requires individual functional assessment and medical team clearance.`,
    },
    {
      id: 'months-4-6',
      label: 'Months 4–6 | Running and Dynamic Training',
      plan: `Progression Criteria: Full ROM, no significant pain or effusion, and strength and single-leg control meeting team requirements.
Therapeutic Exercise: After clearance, progress from light straight-line jogging. Add agility drills and plyometrics according to movement quality, increasing load in stages.
Assessment: Monitor limb symmetry on strength and hop tests; protocol target >90%. Integrate absolute strength, landing control, and sport demands.
Precautions: A single LSI value or postoperative month alone cannot determine return to sport. Cutting, contact, and high-demand sports require separate team clearance.
Follow-up: Continue supervised or home-based rehabilitation until approximately 9–12 months postoperatively, adjusted to function and sport demands.`,
    },
  ],
  'acl-meniscus-repair': [
    {
      id: 'weeks-0-4',
      label: 'Weeks 0–4 | Meniscal Protection',
      plan: `Weight Bearing / Brace: Toe-touch WB with bilateral crutches and brace locked in extension, per repair-specific surgical orders.
ROM: Limit flexion to 0–90°, subject to surgeon-specified restrictions for the repair location.
Therapeutic Exercise: Quadriceps sets, ankle pumps, and SLR with brace locked in extension.
Precautions: No loaded knee flexion, squatting, or twisting. Avoid active hamstring exercise after posterior horn repair per surgical orders. Do not directly apply this progression to root, radial, or complex tears.`,
    },
    {
      id: 'weeks-4-8',
      label: 'Weeks 4–8 | Weight-Bearing Progression',
      plan: `Weight Bearing: Progress from PWB to FWB after clearance; wean crutches at approximately weeks 6–8 according to pain-free gait.
ROM: Only after week 4, progress beyond 90° per surgical orders, aiming toward full ROM around week 8. Do not force ROM to meet a timeline.
Therapeutic Exercise: Begin mini-squats 0–45° and CKC exercise only after achieving pain-free FWB. Continue quadriceps control and gait training.
Precautions: Avoid squatting beyond 60°, pivoting, and twisting. Reduce load and reassess if joint-line pain or effusion increases.`,
    },
    {
      id: 'months-2-3',
      label: 'Months 2–3 | Strengthening and Proprioception',
      plan: `Brace: Wean routine brace use after adequate quadriceps control, normal gait, and surgical clearance.
Therapeutic Exercise: CKC squats and leg press within 0–60°; add proprioception and balance drills. Low-resistance stationary cycling once ROM is adequate.
Precautions: Avoid repetitive impact, jumping, loading at end-range deep knee flexion, and pivoting. Continue meniscal and graft-specific restrictions per the operative record.`,
    },
    {
      id: 'months-4-6',
      label: 'From Months 4–6 | Dynamic Training and Return-to-Sport Assessment',
      plan: `Therapeutic Exercise: Progress dynamic strengthening, lunge patterns, and functional agility according to function.
Running: Straight-line jogging requires repair-specific and team clearance; may be delayed until months 5–6 per protocol.
Progression Criteria: No joint-line tenderness or effusion; increase load only after strength and motor control meet requirements.
Precautions: Return to sport often requires 9–12 months postoperatively and passing functional tests. Do not clear deep squatting, jumping, or cutting sports based on elapsed time alone.`,
    },
  ],
  'pcl-reconstruction': [
    {
      id: 'weeks-0-6',
      label: 'Weeks 0–6 | PCL Protection',
      plan: `Weight Bearing / Brace: NWB to PWB per surgical orders. Brace locked in extension for approximately 6–8 weeks or per individual restrictions.
ROM: Passive ROM with tibial support; prone passive flexion or supine bolster-supported flexion, progressing toward 90° around weeks 4–6.
Therapeutic Exercise: Quadriceps sets, patellar mobilization, and SLR with brace locked in extension.
Precautions: Avoid posterior tibial translation or sag. No active hamstring exercise; defer for 6–24 weeks per individual protocol, as determined by the surgeon.
Progression Criteria: Healed wound, controlled pain and effusion, and ROM reaching approximately 90°.`,
    },
    {
      id: 'weeks-6-12',
      label: 'Weeks 6–12 | Weight Bearing and ROM',
      plan: `Weight Bearing / Brace: Progress toward FWB per surgical orders. Assess brace weaning when clinically stable with minimal effusion.
ROM: Continue protecting tibial position; progress toward 120° flexion around week 12.
Therapeutic Exercise: Quadriceps-dominant CKC exercise, mini-squats 0–45°, and gait training.
Precautions: Avoid isolated resisted hamstring curls. Entering this phase does not remove posterior-shear restrictions.
Progression Criteria: ROM reaching approximately 120°, normal gait, and knee stability.`,
    },
    {
      id: 'months-3-6',
      label: 'Months 3–6 | Functional Strength and Endurance',
      plan: `Therapeutic Exercise: Progress CKC squats and leg press. Co-contraction exercises must comply with surgical clearance for hamstring activation.
Functional / Balance Training: Proprioception, balance, and motor-control drills.
Assessment: Monitor strength LSI (protocol target ≥90%), functional movement quality, and pain during weight bearing.
Precautions: Adjust according to posterior stability, effusion, and pain. Hamstring exercise, running, and impact training require individual clearance.`,
    },
    {
      id: 'months-6-12',
      label: 'Months 6–12 | Running, Jumping, and Return to Sport',
      plan: `Therapeutic Exercise: Progress plyometrics, agility, and sport-specific training after medical team clearance.
Return-to-Sport Assessment: Full ROM, no effusion, and strength and single-leg hop LSI >90%; integrate IKDC, Lysholm, knee stability, and sport demands.
Precautions: Return-to-sport assessment is generally performed around months 9–12 per protocol. Elapsed time or a single symmetry measure does not provide automatic clearance.`,
    },
  ],
  'rotator-cuff-slap': [
    {
      id: 'weeks-0-6',
      label: 'Weeks 0–6 | Repair Protection',
      plan: `Brace: Abduction sling for approximately 6 weeks; wear and removal schedule per surgical orders.
ROM: Shoulder PROM only. Initial ER approximately 0–30° and elevation approximately 90°, adjusted to tear size, repair tension, and surgical technique.
Therapeutic Exercise: Pendulums, wrist and hand AROM, and scapular setting/retraction.
Precautions: After SLAP repair, avoid active elbow flexion, forearm supination, and traction on the biceps anchor. No active shoulder elevation or lifting.`,
    },
    {
      id: 'weeks-6-10',
      label: 'Weeks 6–10 | Assisted to Active Motion',
      plan: `Brace: Wean sling per surgical orders.
ROM: Progress wand/pulley AAROM to AROM; work toward full PROM within repair-specific restrictions.
Therapeutic Exercise: Submaximal deltoid and rotator-cuff isometrics in neutral after clearance.
Precautions: Avoid rapid overhead motion, lifting, and heavy pulling. No resisted biceps exercise yet. Prioritize movement quality without compensation.`,
    },
    {
      id: 'weeks-10-16',
      label: 'Weeks 10–16 | Early Resistance Training',
      plan: `Therapeutic Exercise: Begin light-resistance Theraband ER/IR and scapular stabilizer exercises; AROM in all planes and eccentric control.
ROM: Stretch according to repair extent and team instructions; avoid forceful stretching of repaired tissue.
SLAP Restrictions: Progress light resisted biceps exercise and overhead reaching only after surgical clearance.
Precautions: Gradually resume light daily activities only. Avoid heavy lifting or sudden jerking. Regress if pain or compensatory movement increases.`,
    },
    {
      id: 'months-4-6',
      label: 'From Months 4–6 | Advanced Strengthening, Work, and Sport',
      plan: `Therapeutic Exercise: Progress dumbbell resistance, PNF patterns, and scapular and rotator-cuff endurance.
Functional Training: After team clearance, begin light toss/catch, light plyometrics, and work- or sport-specific activities according to pain, functional ROM, strength, and motor control.
Precautions: Repetitive high-load overhead activity is generally deferred until at least month 6 and requires surgical clearance. Continue monitoring pain and dynamic stability.`,
    },
  ],
  'total-knee-replacement': [
    {
      id: 'week-1',
      label: 'Week 1 | Swelling Control and Early Mobility',
      plan: `Weight Bearing / Gait: WBAT per surgical orders; safe ambulation with walker or crutches.
ROM: Prioritize extension; gradually progress active-assisted flexion toward approximately 0–90°.
Therapeutic Exercise: Ankle pumps, quadriceps and gluteal sets, heel slides, and seated knee flexion/extension. SLR according to muscle control.
Precautions: Ice, elevation, and wound care. Adjust daily loading according to pain, swelling, and gait; do not force ROM.`,
    },
    {
      id: 'weeks-2-4',
      label: 'Weeks 2–4 | ROM and Functional Gait',
      plan: `Gait: Progress from walker to cane or no assistive device as balance and gait improve.
ROM: Progress toward approximately 0–110° or greater according to individual status. Stationary cycling from half to full revolutions.
Therapeutic Exercise: SLR, sit-to-stand, mini-squats 0–45°, and step-ups with handrail support.
Precautions: Continue patellar mobilization. Begin scar and soft tissue mobilization only after wound healing. Adjust according to pain and effusion response.`,
    },
    {
      id: 'weeks-4-8',
      label: 'Weeks 4–8 | Strength and Endurance',
      plan: `Therapeutic Exercise: Resisted CKC leg press, wall slides, and sit-to-stand with progressive resistance.
Functional / Balance Training: Single-leg stance, tandem gait, and reaching tasks; provide support according to fall risk.
Conditioning: Increase stationary cycling resistance; treadmill or level-ground walking as tolerated.
Progression Criteria: Improved gait symmetry and stair ascent/descent with less assistance.
Precautions: Continue monitoring swelling, extension, and function. Regress if symptoms increase after loading.`,
    },
    {
      id: 'month-3',
      label: 'Month 3 | Community Mobility and Advanced Function',
      plan: `Therapeutic Exercise: Lunges, side-steps, higher-resistance bands, and functional CKC exercises according to ability. HEP to maintain quadriceps and hip strength.
Functional Training: Gradually increase community walking, daily activities, and stair tolerance.
ROM / Goals: Progress toward approximately 0–120° functional ROM and independent mobility, considering the preoperative baseline.
Precautions: Adjust distance and load according to pain, swelling, and balance. Select activities per surgical orders, emphasizing low-impact exercise.`,
    },
    {
      id: 'months-4-6',
      label: 'From Months 4–6 | Long-Term Maintenance',
      plan: `Therapeutic Exercise: Continue quadriceps and hip strengthening, balance training, and home exercise program.
Conditioning: Low-impact activities such as walking and cycling as cleared; swimming only after complete wound healing and clearance.
Precautions: Avoid running, jumping, or high-impact loading without medical clearance. Monitor late-onset pain, instability, and functional decline. Continue joint protection and weight management.`,
    },
  ],
  'total-hip-replacement': [
    {
      id: 'week-1',
      label: 'Week 1 | Approach-Specific Protection and Transfers',
      plan: `Surgical Approach: Confirm anterior or posterior approach and surgeon-specific hip precautions.
Weight Bearing: WBAT with walker or crutches per surgical orders.
Therapeutic Exercise: Ankle pumps, quadriceps and gluteal sets, and supine heel slides within ROM restrictions.
Functional Training: Bed, chair, and toilet transfers; safe gait and positioning. Abduction pillow per surgical orders.
Precautions: Posterior approaches commonly restrict excessive flexion, adduction, and IR; anterior approaches commonly restrict excessive extension and ER. Exact combinations and duration per individual surgical orders.`,
    },
    {
      id: 'weeks-2-4',
      label: 'Weeks 2–4 | Gait and Daily Function',
      plan: `Gait: Progress from walker to cane according to balance; address Trendelenburg gait and gait symmetry.
ROM: Progress active and passive ROM within approach-specific restrictions.
Therapeutic Exercise: Unresisted standing hip abduction/extension within permitted ROM, mini-squats, terminal knee extension, and sit-to-stand.
Precautions: Continue approach-specific restrictions. Monitor wound status, pain, and swelling. Do not prescribe hip extension training after an anterior approach until cleared.`,
    },
    {
      id: 'weeks-4-8',
      label: 'Weeks 4–8 | Hip Strength and Balance',
      plan: `Gait: Progress toward independent ambulation once balance and strength are adequate.
Therapeutic Exercise: Light-resistance hip abductor and extensor exercises with Theraband; step-ups/downs, sit-to-stand, and side-steps.
Functional / Balance Training: Single-leg stance and weight shifting with safe support.
Precautions: All movement directions must remain within approach-specific and surgical restrictions; do not lift restrictions based on postoperative week alone. Monitor instability and limping.`,
    },
    {
      id: 'month-3',
      label: 'Month 3 | Conditioning and Work Function',
      plan: `Conditioning: Gradually increase walking duration and intensity; low-impact stationary cycling.
Therapeutic Exercise: CKC lunges and leg press; core and pelvic stability to improve bilateral strength and function.
Work: Gradually resume light- to moderate-duty work according to job demands, strength, and medical orders.
Precautions: Avoid heavy lifting or repetitive impact until cleared. Continue monitoring gait, pain, and instability.`,
    },
    {
      id: 'months-4-6',
      label: 'From Months 4–6 | Long-Term Maintenance',
      plan: `Therapeutic Exercise: Continue gluteal and hip strengthening and HEP to maintain pelvic stability.
Conditioning: Low-impact activities such as walking and cycling per medical orders; swimming after wound healing and per medical orders.
Assessment: Leg-length concerns, gait symmetry, strength, and daily function.
Precautions: Avoid running, contact sports, or high-impact activities without medical clearance. Reassess late-onset pain, limping, or instability.`,
    },
  ],
}
