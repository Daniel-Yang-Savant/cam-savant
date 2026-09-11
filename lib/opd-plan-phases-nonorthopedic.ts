import 'server-only'

import type { PostopPlanPhase } from './opd-plan-phase-types'

/**
 * Phase structure checked against the original private OPD pages on 2026-09-09.
 * All seven fetched pages report native verification.state = unverified; their
 * complete returned content was read (no truncation/unknown-block warning).
 * This records provenance, not independent clinical validation or a UI badge.
 *
 * Oral: https://app.notion.com/p/2e7451a33b66809f810fff7b81e9d0df
 *   Last edited 2026-01-13; weeks 1–4, 4–8, 8–12.
 * Neck: https://app.notion.com/p/2e7451a33b6680e7879af3ad133a8163
 *   Last edited 2026-01-13; weeks 1–4, 4–8, 8–12.
 * Breast: https://app.notion.com/p/2e7451a33b66801dab79d12d76a71fb9
 *   Last edited 2026-03-15; weeks 1–2, 2–6, 6–12.
 * Esophageal: https://app.notion.com/p/2e7451a33b668019a312ebf8c076d130
 *   Last edited 2026-03-15; pre-op, days 1–7, weeks 2–6, months 2–6.
 * Lung: https://app.notion.com/p/2e7451a33b66806b89dbd3b3d4f331af
 *   Last edited 2026-03-27; pre-op, days 1–7, weeks 2–6, months 2–3.
 * AMI: https://app.notion.com/p/2e7451a33b668075904fc353333d16bf
 *   Last edited 2026-03-15; days 1–7, weeks 2–6, 6–12.
 * CABG: https://app.notion.com/p/2e7451a33b66802e87b4d540ccbb4fbe
 *   Last edited 2026-03-15; days 1–7, weeks 2–6, 6–12, months 3+.
 *
 * Reconciliation with the currently published lib/opd-prescriptions.ts:
 * - Keep its day/week-zero early phases, only after team clearance.
 * - Do not restore routine hourly incentive spirometry, fixed SpO2 targets,
 *   blanket ipsilateral BP/needle bans, or fixed CABG shoulder/lifting limits.
 * - Swallowing maneuvers, jaw devices, MLD and diet progression remain assessed
 *   individually rather than automatically prescribed from the original notes.
 * - Breast ROM/lifting follows the published surgeon/reconstruction-specific
 *   prescription, without restoring fixed limits from the original notes.
 * - Head/neck integrated and VATS phases only reorganize their published plans;
 *   no additional calendar dates or exercise doses have been introduced.
 *   Their existing external references remain in lib/opd-prescriptions.ts.
 *
 * The integration layer adds the procedure title, phase label, shared safety
 * and follow-up fields to each copy-ready plan. Bodies below are phase-specific.
 */
export const nonOrthopedicPlanPhases: Record<string, PostopPlanPhase[]> = {
  'oral-cancer-postop': [
    {
      id: 'weeks-0-4',
      label: 'Post-op Weeks 0–4 | Flap Protection and Early Oral Mobility',
      plan: `Therapeutic Exercise: Appropriate positioning, sitting, standing, and walking after surgical team clearance. Begin gentle tongue / lip AROM when permitted.
Swallowing / Communication: Refer to SLP for swallowing screening, communication assessment, and positioning education. Maintain NPO / prescribed diet texture per the surgical team and SLP.
Precautions: Prioritize monitoring of the flap, wound, airway, and secretions. Avoid tension on the incision or reconstruction. Follow reconstruction team restrictions for donor-site mobility / weight bearing. No unsupervised oral trials before swallowing safety is confirmed.
Progression Criteria: Adjust to surgical-site healing, flap stability, and planned radiotherapy. Advance oral / jaw mobility and soft tissue treatment only with team approval.`,
    },
    {
      id: 'weeks-4-8',
      label: 'Post-op Weeks 4–8 | Scar Mobility and Individualized Swallowing Therapy',
      plan: `Therapeutic Exercise: Scar / soft tissue mobility after wound stability and surgical clearance. Continue cleared tongue / lip AROM and daily activities.
Swallowing / Communication: SLP to select swallowing maneuvers and diet texture progression based on individual assessment. Use maneuvers such as the Mendelsohn maneuver only after suitability assessment and instruction.
Precautions: Avoid forceful stretching of unhealed wounds, the flap, or radiation-damaged tissue. Oral intake remains subject to swallowing safety assessment; do not discontinue NPO solely because this phase has been reached.
Progression Criteria: Stable wound and flap. Plan the next phase according to oral / jaw mobility, swallowing, and articulation assessment.`,
    },
    {
      id: 'weeks-8-12-plus',
      label: 'Post-op Weeks 8–12 and Beyond | Jaw Opening, Articulation, and Swallowing',
      plan: `Therapeutic Exercise: Continue jaw ROM / trismus prevention, tongue mobility, articulation / speech resonance drills, and individualized swallowing therapy.
Jaw Opening: Adjust stretching to the resection, reconstruction, and radiotherapy status. Use passive jaw-opening devices, such as TheraBite or tongue depressors, only after team assessment and instruction.
Integrated Assessment: Monitor neck / shoulder mobility, head-and-neck lymphedema, and radiotherapy-related tightness. Refer to SLP, dental, nutrition, or lymphedema services as indicated.
Precautions: Do not gain ROM at the expense of progressively increasing pain or wound tension. Continue individualized diet and swallowing assessment; monitor the flap and radiotherapy effects.`,
    },
  ],
  'neck-cancer-postop': [
    {
      id: 'weeks-0-4',
      label: 'Post-op Weeks 0–4 | Neck / Shoulder Protection and Postural Mobility',
      plan: `Therapeutic Exercise: Gentle cervical AROM, scapular setting, posture, and positioning exercises according to wound, flap, and drain status.
Edema Care: Appropriate positioning with coordinated team care. Monitor head-and-neck swelling, shoulder droop, scapular winging, and neurologic symptoms.
Precautions: Avoid overstretching or tension on the incision / flap. Adjust cervical movement direction and ROM to reconstruction restrictions. Assess CN XI function if significant shoulder weakness is present.
Progression Criteria: Stable wound and drainage status with team approval before advancing shoulder AAROM / AROM and soft tissue treatment.`,
    },
    {
      id: 'weeks-4-8',
      label: 'Post-op Weeks 4–8 | Shoulder Mobility and Soft Tissue Recovery',
      plan: `Therapeutic Exercise: Progress shoulder AAROM / AROM after wound stability and team approval. Continue gentle cervical AROM, scapular setting, and postural training.
Soft Tissue: Scar / soft tissue mobility over healed areas. Trained clinicians to assess the need for manual lymphatic drainage / lymphedema therapy.
Precautions: Exclude infection, thrombosis, and other contraindications before lymphedema treatment. Avoid excessive tension on the incision / flap. Monitor shoulder droop, winging, and accessory nerve-related weakness.
Progression Criteria: Progress according to wound status, pain, neck / shoulder control, and radiotherapy response; do not determine loading by postoperative week alone.`,
    },
    {
      id: 'weeks-8-12-plus',
      label: 'Post-op Weeks 8–12 and Beyond | Scapular Strength and Daily Function',
      plan: `Therapeutic Exercise: Progressive scapular stabilizer, upper trapezius, rotator cuff, and upper-quarter endurance training. Continue neck / shoulder mobility, posture, and breathing exercises.
Functional Training: Adapt movement and loading to neck-dissection shoulder syndrome, post-radiotherapy neck tightness, and daily activity / work demands.
Precautions: Progress stretching and resistance according to pain, skin, and tissue tolerance. Avoid forceful stretching of irradiated or surgical sites. Continue monitoring accessory nerve function and significant lymphedema.
Referrals: PT / OT according to functional deficits. Refer to SLP / a trained lymphedema therapist for swallowing, voice, or lymphedema concerns.`,
    },
  ],
  'breast-cancer-postop': [
    {
      id: 'weeks-0-2',
      label: 'Post-op Weeks 0–2 | Drain Protection and Early Shoulder / Arm Mobility',
      plan: `Therapeutic Exercise: Elbow / wrist / hand AROM, soft-ball squeezes, breathing exercises, walking, and gentle shoulder AAROM. Maintain a comfortable upright posture.
ROM / Lifting: Follow surgical / plastic surgery orders for shoulder ROM, lifting, and repetitive overhead activity according to reconstruction and drain status. Do not substitute fixed angles or weights for individual restrictions.
Precautions: Avoid traction on drains and wounds. Monitor swelling, heaviness, and tightness. Individualize blood pressure measurement, venipuncture, and injections according to institutional risk assessment and feasibility.
Progression Criteria: Advance shoulder ROM and function only when wound / drain status permits and the team agrees.`,
    },
    {
      id: 'weeks-2-6',
      label: 'Post-op Weeks 2–6 | Shoulder Mobility, Scar Care, and Functional Recovery',
      plan: `Therapeutic Exercise: Progress toward full shoulder AROM when wound and drain restrictions permit. Wall slides / wall climbing, pendulums, scapular retraction / stabilization, and light aerobic walking.
Soft Tissue: Gentle scar mobility after wound healing. Assess axillary web syndrome (cording), pain, and swelling; provide individualized soft tissue treatment as indicated.
Lymphedema Care: Educate on skin care and early swelling symptoms. Refer to trained clinicians for persistent swelling, heaviness, or tightness. Prescribe a compression sleeve only after assessment.
Precautions: Shoulder ROM and lifting must remain within reconstruction, tissue expander, and wound orders. Continue early restrictions until formally lifted.`,
    },
    {
      id: 'weeks-6-12-plus',
      label: 'Post-op Weeks 6–12 and Beyond | Progressive Strength and Conditioning',
      plan: `Therapeutic Exercise: Begin progressive resistance with low loads and high repetitions. Gradually advance shoulder girdle / core, daily function, and aerobic training. Progress overhead activity within reconstruction restrictions and tolerance.
During Radiotherapy: Continue chest / shoulder stretching and postural mobility; adjust to skin, chest-wall, and axillary tightness responses.
Monitoring: Track affected-limb swelling / circumference as indicated, pain, and shoulder function. Assess delayed-onset lymphedema or shoulder symptoms.
Precautions: Do not automatically increase resistance or lifting by postoperative week alone. Adjust loading and arrange lymphedema assessment for persistent or worsening swelling, heaviness, or tightness.`,
    },
  ],
  'esophageal-cancer-postop': [
    {
      id: 'prehabilitation',
      label: 'Pre-op | Cardiopulmonary Prehabilitation and Nutritional Preparation',
      plan: `Therapeutic Exercise: If time and clinical status permit, aerobic exercise (walking / cycling) for approximately 30 minutes, 3–5 days/week, with low-to-moderate-intensity whole-body resistance training.
Respiratory Care: Deep breathing and effective huff / cough practice. Assess high-risk patients for inspiratory muscle training; individualize resistance and dosage with the team.
Integrated Care: Smoking cessation education and nutritional assessment. Adjust training for sarcopenia, weight loss, and the surgical schedule.
Precautions: Adapt to existing cardiopulmonary disease, fatigue, swallowing, and nutritional status. Incentive spirometry is not equivalent to resistance-based inspiratory muscle training.`,
    },
    {
      id: 'days-0-7',
      label: 'Post-op Days 0–7 | Early Mobilization and Respiratory Care',
      plan: `Therapeutic Exercise: Begin sitting, standing, and walking within 24 hours with team approval after vital signs and pain control are stable. Monitor symptoms, HR, and SpO₂ / oxygen settings during activity.
Respiratory Care: Deep breathing / thoracic expansion and supported huff / cough. Use incentive spirometry only per the institutional pathway or individual indications.
ROM / Positioning: Shoulder / neck AAROM / ROM within incision and anastomotic restrictions. Follow surgical, swallowing, and nutrition team instructions for head-of-bed elevation and feeding posture.
Precautions: Confirm adequate analgesia and wound, drain, and oxygen therapy safety. Follow surgical orders for swallowing, diet / tube feeding, and activity limits. Monitor for aspiration, respiratory, infection, and rhythm concerns.`,
    },
    {
      id: 'weeks-2-6',
      label: 'Post-op Weeks 2–6 | Interval Walking and Home Activity',
      plan: `Therapeutic Exercise: Gradually increase walking duration in short bouts; use interval activity for significant fatigue. Include postural, shoulder girdle, and daily activity training.
Activity Planning: Pacing / energy conservation with alternating activity and rest. Adjust to fatigue and respiratory response.
Nutrition Coordination: Follow surgical and nutrition team instructions for diet, tube feeding, and post-meal positioning. Schedule activity around early satiety, post-meal discomfort, and the individual feeding plan.
Precautions: Monitor swallowing / aspiration concerns, weight and nutritional changes, wound status, and cardiopulmonary symptoms. Discharge home does not automatically remove surgical restrictions.`,
    },
    {
      id: 'months-2-6',
      label: 'Post-op Months 2–6 | Conditioning and Return to Daily / Work Activities',
      plan: `Therapeutic Exercise: Progressive aerobic, whole-body resistance, and flexibility training. Include trunk / shoulder girdle mobility and task training for daily / work demands.
Soft Tissue: After wound healing and team approval, provide gentle mobility and stretching tailored to thoracoabdominal scars and trunk rotation restrictions.
Monitoring: Track radiotherapy / chemotherapy adverse effects, nutrition, weight, and exercise tolerance. Report worsening swallowing or limited intake to the surgical and nutrition teams.
Precautions: Adjust loading to fitness and treatment status. Evaluate respiratory, anastomotic, or other surgical concerns before further exercise progression.`,
    },
  ],
  'lung-cancer-postop': [
    {
      id: 'prehabilitation',
      label: 'Pre-op | Pulmonary Prehabilitation and Breathing Exercises',
      plan: `Therapeutic Exercise: Aerobic exercise (walking / cycling) and resistance training according to clinical status. Assess high-risk patients for inspiratory muscle training; individualize equipment, resistance, and dosage.
Respiratory Care: Diaphragmatic breathing / thoracic expansion, huff cough, and secretion clearance education.
Integrated Care: Coordinate smoking cessation and nutritional assessment. Document exercise tolerance and respiratory symptoms.
Precautions: Adjust training to preoperative fitness, cardiopulmonary comorbidities, and the surgical schedule. Do not apply one IMT dosage or oxygen saturation target to all patients.`,
    },
    {
      id: 'days-0-7',
      label: 'Post-op Days 0–7 | Early Mobilization and Airway Clearance',
      plan: `Therapeutic Exercise: Mobilize out of bed within 24 hours after vital signs are stable and the team approves. Upright positioning, sitting, standing, and walking in short bouts.
Respiratory Care: Deep breathing / thoracic expansion and supported huff / cough. Incentive spirometry is not mandatory routine care; use only per the institutional pathway or individual indications.
ROM: Affected-side shoulder AAROM and trunk mobility without tension on the incision or chest tube.
Precautions: Confirm analgesia and chest tube, oxygen therapy, and air-leak restrictions. Monitor breathing, HR, SpO₂, and symptoms during activity. Individualize oxygen saturation targets with the thoracic team.`,
    },
    {
      id: 'weeks-2-6',
      label: 'Post-op Weeks 2–6 | Walking Endurance and Chest / Shoulder Mobility',
      plan: `Therapeutic Exercise: Begin with approximately 15–20 minutes of walking in short bouts. Progress distance and duration according to breathing, fatigue, and pain responses.
Chest / Shoulder Mobility: Chest-wall expansion, side-bending, posture correction, and shoulder ROM to reduce protective kyphosis or shoulder elevation.
Wound Care: Gentle scar mobility after complete wound healing and team approval.
Precautions: Continue thoracic team limits for oxygen therapy, chest tubes, and lifting. Evaluate worsening symptoms or exercise tolerance before increasing loading.`,
    },
    {
      id: 'months-2-3-plus',
      label: 'Post-op Months 2–3 and Beyond | Whole-Body Strength and Endurance',
      plan: `Therapeutic Exercise: Progressive aerobic interval and whole-body resistance training using light weights / resistance bands. Resume ADL, work, and light leisure activity as tolerated.
Progression: Adjust intensity to respiratory symptoms, fatigue, and functional performance. Start with short bouts for exertional dyspnea.
Monitoring: Track respiratory symptoms, exercise tolerance, subsequent radiotherapy / chemotherapy response, and daily function. Refer to pulmonary rehabilitation as needed.
Precautions: Do not attribute new respiratory symptoms or declining tolerance solely to deconditioning. Arrange assessment with the thoracic / oncology team first.`,
    },
  ],
  'ami-rehabilitation': [
    {
      id: 'days-1-7',
      label: 'Post-event Days 1–7 | Early Inpatient Mobilization',
      plan: `Therapeutic Exercise: Sitting, standing, and bedside / short-distance walking after 24 hours of hemodynamic stability and medical team clearance. The cardiac team determines the actual start according to clinical status.
Intensity: Common starting targets are RPE <11 or HR increase <20 bpm above resting HR; individualize to risk and medication response.
Monitoring: Monitor symptoms and ECG / HR / BP / SpO₂ according to care setting and risk. Watch for ischemia, rhythm abnormalities, and heart failure signs.
Precautions: Protect the PCI access site and any concurrent surgical wounds. Educate on warning signs, including angina and dyspnea. Stop activity and manage unstable symptoms promptly.`,
    },
    {
      id: 'weeks-2-6',
      label: 'Post-event Weeks 2–6 | Outpatient Cardiac Rehabilitation',
      plan: `Therapeutic Exercise: Walking / stationary cycling for 15–30 minutes, 3–5 days/week, within a formal cardiac rehabilitation program. Use interval training if tolerance is limited.
Intensity: Commonly begin at 40–60% HRR or RPE 11–13; adjust to risk, medications, and exercise response.
Strengthening: Low-load, rhythmic whole-body resistance training. Avoid heavy loads, breath-holding, and Valsalva.
Precautions: Arrange supervision and ECG monitoring according to risk. Assess exercise-induced ischemia, arrhythmia, and BP response. Continue medication adherence, symptom recognition, and lifestyle education.`,
    },
    {
      id: 'weeks-6-12-plus',
      label: 'Post-event Weeks 6–12 and Beyond | Endurance and Risk Factor Management',
      plan: `Therapeutic Exercise: Progress to 30–60 minutes of aerobic exercise according to exercise testing and risk stratification. Advance to 60–80% HRR when needed and appropriate.
Strengthening / Recovery: Progressive whole-body resistance, flexibility, and cool-down, adjusted to cardiopulmonary and musculoskeletal tolerance.
Education: Medication adherence, smoking cessation, sleep, stress, nutrition, BP, and lipid management. Return to work / sexual activity according to individual cardiac assessment.
Precautions: Base loading progression on exercise testing, ischemia, rhythm, heart failure, and BP response. Do not increase intensity solely by elapsed time or target HR.`,
    },
  ],
  'cabg-rehabilitation': [
    {
      id: 'days-0-7',
      label: 'Post-op Days 0–7 | Respiratory Care and Sternal Protection',
      plan: `Therapeutic Exercise: Early sitting, standing, and supervised walking after medical stabilization. Gradually increase short-distance activity.
Respiratory Care: Deep breathing and supported cough using a chest pillow or other appropriate support. Use incentive spirometry per the institutional pathway.
Sternal Protection: Use move-in-the-tube principles, keeping upper arms close to the trunk during daily activities. Avoid painful forceful pushing / pulling. Base mobility and transfers on sternal stability and surgical instructions.
Precautions: Monitor AF / other rhythm abnormalities, sternal instability, and wounds. Stop the provoking movement and assess any clicking or sternal pain.`,
    },
    {
      id: 'weeks-2-6',
      label: 'Post-op Weeks 2–6 | Outpatient Aerobic Training and Daily Function',
      plan: `Therapeutic Exercise: Walking / stationary cycling for approximately 20–30 minutes. Commonly start at RPE 11–13 or HR increase <20 bpm above resting HR, individualized by the cardiac rehabilitation team.
ROM / Function: Gentle shoulder / neck / thoracic AROM, gait, and ADL within acceptable pain limits. Continue move-in-the-tube principles for transfers and upper-limb activity.
Precautions: Avoid excessive chest stretching and painful heavy pushing / pulling. Follow sternal stability and surgical orders for upper-limb loading, lifting, and transfer technique.
Monitoring: Assess the sternum, chest and graft donor-site wounds, graft-harvest limb swelling, rhythm, and exercise symptoms.`,
    },
    {
      id: 'weeks-6-12',
      label: 'Post-op Weeks 6–12 | Strength Progression After Sternal Healing',
      plan: `Therapeutic Exercise: After sternal stability and surgical clearance, begin low-load upper-limb / whole-body resistance training and progressively increase resistance and lifting.
Aerobic Training: Increase duration and intensity according to postoperative exercise testing and risk stratification, incorporating functional and work demands.
Precautions: Avoid movements that provoke sternal clicking or pain. Do not substitute fixed weights, shoulder angles, or a single postoperative week for individual sternal restrictions.
Education: Continue move-in-the-tube principles, wound care, medication adherence, symptom recognition, and cardiovascular risk factor management.`,
    },
    {
      id: 'months-3-plus',
      label: 'Post-op Month 3 and Beyond | Home and Community Maintenance',
      plan: `Therapeutic Exercise: Transition to home / community aerobic and progressive resistance training after sternal stability and medical team clearance. Continue training according to individual fitness and function.
Return to Activity: Progress leisure exercise, work, and lifting according to cardiac function, sternal stability, and medical orders. Continue tracking post-activity response.
Long-Term Care: Medication adherence, diet, smoking cessation, stress, and cardiovascular risk factor management.
Precautions: Stop the related activity and assess sternal pain / clicking, wound abnormalities, or new cardiopulmonary symptoms. Continue surgical restrictions until lifted.`,
    },
  ],
  'head-neck-cancer-integrated': [
    {
      id: 'acute-protection',
      label: 'Acute Phase | Airway / Flap Protection and Early Mobilization',
      plan: `Therapeutic Exercise: Early sitting, standing, and walking after vital signs, airway, wound, and flap are stable and the surgical team clears activity. Coordinate pain control and delirium, VTE, and pressure injury prevention.
Swallowing / Communication: NPO / diet texture per the surgical team and SLP. Refer to SLP for swallowing, articulation, voice, and alternative communication assessment.
Precautions: Follow reconstruction restrictions for all activity involving the flap pedicle, neck, donor site, and weight bearing. Do not compress the pedicle. No unsupervised oral trials before swallowing safety is confirmed.
Progression Criteria: Base progression on surgical assessment of airway, flap, and wound stability. No universal fixed postoperative week applies.`,
    },
    {
      id: 'wound-stable-mobility',
      label: 'Stable-Wound Phase | Neck / Shoulder and Oral / Jaw Mobility',
      plan: `Therapeutic Exercise: When the wound permits, progress from gentle cervical ROM, scapular setting, and shoulder AAROM / AROM. Provide tongue / lip / jaw ROM according to the extent of resection and reconstruction.
Jaw Opening: Establish regular jaw-opening exercises for patients at risk of trismus. The team assesses intensity and device selection.
Functional Assessment: Document shoulder droop, scapular winging, pain, and CN XI-related weakness. Continue individualized swallowing and communication training.
Precautions: Neck / shoulder, oral / jaw, and donor-site activity must remain within flap / incision restrictions. Do not compress the pedicle. Maintain prescribed diet restrictions until swallowing safety is confirmed.`,
    },
    {
      id: 'functional-recovery',
      label: 'Functional Recovery | Scapular Endurance and Long-Term Integrated Care',
      plan: `Therapeutic Exercise: Gradually add scapular stabilizer and rotator cuff endurance training according to wound status, pain, and motor control. Continue cleared neck / shoulder and tongue / lip / jaw ROM and jaw-opening exercises.
Swallowing / Communication: Continue swallowing, articulation, and communication training per SLP assessment. Diet texture and progression remain directed by the surgical team / SLP.
Lymphedema / Scar Care: Assess head-and-neck lymphedema, fibrosis, and scars after wound stability. Refer to trained therapists when indicated.
Precautions: Adjust to the extent of reconstruction and subsequent treatment. Do not lift flap or donor-site restrictions according to a single timeline. Coordinate PT / OT / SLP, nutrition, and dental follow-up.`,
    },
  ],
  'vats-lung-resection-integrated': [
    {
      id: 'days-0-1',
      label: 'Post-op Days 0–1 | Initial Mobilization and Respiratory Care',
      plan: `Therapeutic Exercise: Begin sitting, standing, and short-distance walking within 24 hours after vital signs and pain control are stable and the thoracic team approves.
Monitoring: Document symptoms, HR, BP, and SpO₂ / oxygen settings before and after each activity. Ensure chest tube safety and fall precautions.
Respiratory Care: Upright positioning, deep breathing / thoracic expansion, and supported huff / cough. Individualized therapist management for secretions, reduced lung volumes, or high-risk status.
Precautions: Ensure adequate analgesia and follow chest tube, oxygen therapy, and wound restrictions. Use incentive spirometry only per the institutional pathway or individual indications.`,
    },
    {
      id: 'inpatient-recovery',
      label: 'Inpatient Recovery | Frequent Walking and Shoulder / Thoracic Mobility',
      plan: `Therapeutic Exercise: Short, frequent walking bouts with gradual increases in distance and ADL. Ensure adequate analgesia, chest tube safety, and fall precautions.
Shoulder / Trunk: Daily affected-side shoulder flexion / abduction AAROM-to-AROM, scapular movement, thoracic extension, and side-bending.
Respiratory Care: Continue upright positioning, deep breathing / thoracic expansion, and supported huff / cough. Adjust to secretions, lung volumes, and risk.
Precautions: Avoid traction on the wound / chest tube and maintain acceptable pain levels. Monitor symptoms, HR, BP, and SpO₂ / oxygen settings before and after activity. Incentive spirometry is not mandatory routine care for all patients.`,
    },
    {
      id: 'discharge-weeks-1-6',
      label: 'Approximately Weeks 1–6 After Discharge | Walking and Whole-Body Function',
      plan: `Therapeutic Exercise: Progress interval walking daily at moderate intensity using the talk test / RPE approximately 3–4/10. Add sit-to-stand, heel raises, and light whole-body resistance training after symptoms stabilize.
Shoulder / Thoracic Mobility: Continue affected-side shoulder AAROM-to-AROM, scapular movement, thoracic extension, and side-bending without wound tension and within acceptable pain limits.
Precautions: Follow surgical wound / chest tube instructions for lifting, driving, water immersion, work, and flying. Adjust loading to breathing, fatigue, pain, and post-activity recovery.
Progression Criteria: Increase aerobic and resistance training after symptoms stabilize and function / fitness permit. Continue thoracic team follow-up as needed.`,
    },
    {
      id: 'weeks-6-plus',
      label: 'Post-op Week 6 and Beyond | Aerobic / Strength Training and Pulmonary Rehabilitation',
      plan: `Therapeutic Exercise: Progress aerobic and resistance training according to respiratory symptoms, fitness, and subsequent cancer treatment. Restore daily and work function.
Referrals: Arrange pulmonary rehabilitation assessment for persistent functional limitations or high-risk status.
Precautions: Continue adjusting to activity tolerance and recovery response. Reaching postoperative week 6 does not automatically remove wound, chest tube, or daily activity restrictions. Follow surgical instructions for lifting, driving, work, and flying.`,
    },
  ],
}
