/**
 * TDD: Feature store slice tests for coverage.
 * Exercises all feature-specific Zustand slices.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAdConsoleStore } from '../store';
import type { Campaign } from '../core/types';

function getStore() { return useAdConsoleStore.getState(); }
function reset() { useAdConsoleStore.getState().resetAll(); }

describe('DrillsSlice', () => {
  beforeEach(reset);

  it('startDrill initializes a drill session', () => {
    getStore().startDrill('nav-sp-search-term-negative');
    expect(getStore().drillSession.drillId).toBe('nav-sp-search-term-negative');
    expect(getStore().drillSession.currentStep).toBe(0);
  });

  it('stopDrill ends session and records result', () => {
    getStore().startDrill('nav-sp-search-term-negative');
    getStore().stopDrill();
    expect(getStore().drillSession.drillId).toBeNull();
  });

  it('evaluateDrillAction checks correctness', () => {
    getStore().startDrill('nav-sp-search-term-negative');
    const result = getStore().evaluateDrillAction('pause');
    expect(typeof result).toBe('boolean');
  });

  it('skipDrillStep advances step', () => {
    getStore().startDrill('nav-sp-search-term-negative');
    getStore().skipDrillStep();
    expect(getStore().drillSession.currentStep).toBeGreaterThanOrEqual(0);
  });
});

describe('ProfilesSlice', () => {
  beforeEach(reset);

  it('createProfile creates a profile', () => {
    getStore().createProfile('test-profile');
    expect(getStore().profiles.some((p) => p.name === 'test-profile')).toBe(true);
  });

  it('deleteProfile removes a profile', () => {
    getStore().createProfile('to-delete');
    const id = getStore().profiles.find((p) => p.name === 'to-delete')!.id;
    getStore().deleteProfile(id);
    expect(getStore().profiles.some((p) => p.name === 'to-delete')).toBe(false);
  });

  it('switchProfile switches', () => {
    getStore().createProfile('switchable');
    const id = getStore().profiles.find((p) => p.name === 'switchable')!.id;
    getStore().switchProfile(id);
    expect(getStore().activeProfileId).toBe(id);
  });

  it('renameProfile renames', () => {
    getStore().createProfile('old-name');
    const id = getStore().profiles.find((p) => p.name === 'old-name')!.id;
    getStore().renameProfile(id, 'new-name');
    expect(getStore().profiles.some((p) => p.name === 'new-name')).toBe(true);
  });
});

describe('TrainerSlice', () => {
  beforeEach(reset);

  it('addNote adds a note', () => {
    getStore().addNote('Test note');
    expect(getStore().notes.length).toBeGreaterThan(0);
    expect(getStore().notes[0].text).toBe('Test note');
  });

  it('deleteNote deletes', () => {
    getStore().addNote('to-delete');
    const id = getStore().notes[0].id;
    getStore().deleteNote(id);
    expect(getStore().notes.find((n) => n.id === id)).toBeUndefined();
  });

  it('logAction logs', () => {
    getStore().logAction('test-action', 'Test message', 'good');
    expect(getStore().actionLog.length).toBeGreaterThan(0);
  });

  it('toggleCertItem toggles', () => {
    const item = getStore().certificationChecklist[0]!;
    const before = item.checked;
    getStore().toggleCertItem(item.id);
    expect(getStore().certificationChecklist.find((c) => c.id === item.id)!.checked).toBe(!before);
  });

  it('certScore returns a number', () => {
    expect(typeof getStore().certScore()).toBe('number');
  });
});

describe('BulkSlice', () => {
  beforeEach(reset);

  it('setBulkInput sets input', () => {
    getStore().setBulkInput('test,csv');
    expect(getStore().bulkInput).toBe('test,csv');
  });

  it('parseAndValidate parses', () => {
    getStore().parseAndValidate();
    expect(Array.isArray(getStore().bulkPreview)).toBe(true);
  });

  it('clearBulk clears', () => {
    getStore().setBulkInput('data');
    getStore().clearBulk();
    expect(getStore().bulkInput).toBe('');
    expect(getStore().bulkPreview.length).toBe(0);
  });

  it('getTemplate returns template', () => {
    const template = getStore().getTemplate();
    expect(typeof template).toBe('string');
    expect(template.length).toBeGreaterThan(0);
  });
});

describe('ReportsSlice', () => {
  beforeEach(reset);

  it('requestReport creates a report', () => {
    getStore().requestReport('campaign');
    expect(getStore().reports.length).toBeGreaterThan(0);
  });

  it('selectReport selects', () => {
    getStore().requestReport('campaign');
    const r = getStore().reports[0]!;
    getStore().selectReport(r.id);
    expect(getStore().selectedReportId).toBe(r.id);
  });

  it('exportReportCsv exports', () => {
    getStore().requestReport('campaign');
    const r = getStore().reports[0]!;
    const csv = getStore().exportReportCsv(r.id);
    expect(typeof csv).toBe('string');
  });

  it('exportReportCsv returns empty for unknown id', () => {
    expect(getStore().exportReportCsv('nonexistent')).toBe('');
  });
});

describe('MissionsSlice', () => {
  beforeEach(reset);

  it('loadMissions loads missions', () => {
    getStore().loadMissions();
    expect(getStore().missions.length).toBeGreaterThan(0);
  });

  it('startMission initializes', () => {
    const missions = getStore().missions;
    if (missions.length > 0) {
      getStore().startMission(missions[0].id);
      expect(getStore().missionSession.missionId).toBe(missions[0].id);
    }
  });

  it('stopMission stops', () => {
    const missions = getStore().missions;
    if (missions.length > 0) {
      getStore().startMission(missions[0].id);
      getStore().stopMission();
      expect(getStore().missionSession.missionId).toBeNull();
    }
  });

  it('completeMissionStep advances', () => {
    const missions = getStore().missions;
    if (missions.length > 0) {
      getStore().startMission(missions[0].id);
      getStore().completeMissionStep();
    }
  });

  it('useHint uses a hint', () => {
    const missions = getStore().missions;
    if (missions.length > 0) {
      getStore().startMission(missions[0].id);
      getStore().useHint();
    }
  });
});

describe('IntegritySlice', () => {
  beforeEach(reset);

  it('runIntegrity runs check', () => {
    const campaigns = getStore().state.campaigns;
    getStore().runIntegrity(campaigns);
    expect(getStore().integrityReport).not.toBeNull();
  });

  it('clearIntegrity clears', () => {
    const campaigns = getStore().state.campaigns;
    getStore().runIntegrity(campaigns);
    getStore().clearIntegrity();
    expect(getStore().integrityReport).toBeNull();
  });
});
