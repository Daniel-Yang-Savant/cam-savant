import assert from 'node:assert/strict'
import test from 'node:test'
import { TEAM } from '../lib/authors'
import { DOCTOR_CLINICS, getClinicDoctors, getDoctorClinics } from '../lib/doctor-clinics'
import { CLINIC_LOCATIONS } from '../lib/locations'

test('doctor clinic records reference real physicians and locations without duplicate pairs', () => {
  const pairs = new Set<string>()
  for (const record of DOCTOR_CLINICS) {
    assert.ok(TEAM.some((doctor) => doctor.slug === record.doctorSlug), record.doctorSlug)
    assert.ok(CLINIC_LOCATIONS.some((clinic) => clinic.slug === record.clinicSlug), record.clinicSlug)
    const pair = `${record.doctorSlug}:${record.clinicSlug}`
    assert.ok(!pairs.has(pair), `Duplicate clinic record: ${pair}`)
    pairs.add(pair)
    assert.equal(record.schedule.length, record.scheduleEn.length, `Missing schedule translation: ${pair}`)
    assert.ok(record.sourceLabel && record.sourceLabelEn, `Missing source label: ${pair}`)
    for (const link of [record.bookingUrl, record.sourceUrl]) {
      const url = new URL(link)
      assert.equal(url.protocol, 'https:')
      assert.ok(url.hostname.endsWith('.cch.org.tw'), `Non-official clinic link: ${link}`)
      assert.equal(url.searchParams.has('regdate'), false, `Appointment link will expire: ${link}`)
    }
    if (record.verificationStatus === 'verified') {
      assert.match(record.checkedAt ?? '', /^\d{4}-\d{2}-\d{2}$/)
      assert.ok(record.schedule.length > 0, `Verified schedule is empty: ${pair}`)
    } else {
      assert.ok(record.note && record.noteEn, `Pending schedule needs an explanation: ${pair}`)
    }
  }
})

test('doctor and clinic lookups cannot confuse two physicians sharing Changhua hospital', () => {
  assert.deepEqual(getDoctorClinics('yu-kai-yang').map((record) => record.clinicSlug), ['changhua', 'nantou', 'erlin'])
  assert.deepEqual(getDoctorClinics('wen-wei-lai').map((record) => record.clinicSlug), ['changhua', 'hanming', 'yuanlin'])
  const changhua = getClinicDoctors('changhua')
  assert.deepEqual(changhua.map((record) => record.doctorSlug), ['yu-kai-yang', 'wen-wei-lai'])
  assert.notDeepEqual(changhua[0].schedule, changhua[1].schedule)
  assert.deepEqual(getDoctorClinics('unknown'), [])
  assert.deepEqual(getClinicDoctors('unknown'), [])
  for (const clinic of CLINIC_LOCATIONS) {
    assert.equal('schedule' in clinic, false, 'Clinic-only records must not own a physician schedule')
    assert.equal('doctorSlugs' in clinic, false, 'Doctor membership must use the appointment records')
  }
})
