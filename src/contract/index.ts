import type { components } from './api';

type Schemas = components['schemas'];

// crudcrate stores these vocabularies as plain text columns, so the generated schemas
// say `string`. Narrowing them here is what turns a typo into a compile error.
export const QUALITY_VALUES = [
    'excellent',
    'very_good',
    'good',
    'meh',
    'bad',
    'very_bad',
] as const;
export const DIRECTION_VALUES = ['forward', 'reverse'] as const;
export const TRI_STATE_VALUES = ['yes', 'no', 'unknown'] as const;
export const RUN_STATUS_VALUES = [
    'pending',
    'running',
    'succeeded',
    'failed',
    'cancelled',
    'interrupted',
] as const;
export const COVER_LEVEL_VALUES = ['fine', 'intermediate', 'coarse'] as const;
export const COVER_ESTIMATOR_VALUES = ['per_pass', 'pooled'] as const;
export const METRIC_SOURCE_VALUES = ['unprojected', 'tsdf'] as const;
export const STORED_OBJECT_STATUS_VALUES = ['pending', 'complete', 'failed'] as const;

export type Quality = (typeof QUALITY_VALUES)[number];
export type Direction = (typeof DIRECTION_VALUES)[number];
export type TriState = (typeof TRI_STATE_VALUES)[number];
export type RunStatus = (typeof RUN_STATUS_VALUES)[number];
export type CoverLevel = (typeof COVER_LEVEL_VALUES)[number];
export type CoverEstimator = (typeof COVER_ESTIMATOR_VALUES)[number];
export type MetricSource = (typeof METRIC_SOURCE_VALUES)[number];
export type StoredObjectStatus = (typeof STORED_OBJECT_STATUS_VALUES)[number];

export type Site = Schemas['SiteResponse'];
export type Campaign = Schemas['CampaignResponse'];
export type Transect = Schemas['TransectResponse'];
export type Device = Schemas['DeviceResponse'];

export type VideoAsset = Omit<Schemas['VideoResponse'], 'gravity' | 'gps'> & {
    gravity: TriState;
    gps: TriState;
};

export type TransectPass = Omit<Schemas['PassResponse'], 'direction' | 'quality'> & {
    direction?: Direction | null;
    quality?: Quality | null;
};

export type RunRecord = Omit<Schemas['RunResponse'], 'status'> & {
    status: RunStatus;
};

export type CoverRow = Omit<
    Schemas['CoverRowResponse'],
    'level' | 'estimator' | 'metric_source'
> & {
    level: CoverLevel;
    estimator: CoverEstimator;
    metric_source?: MetricSource | null;
};

export type PassGroup = Schemas['PassGroupResponse'];
export type Preset = Schemas['PresetResponse'];

export type PooledCover = Schemas['PooledCover'];
export type ClassGroup = Schemas['ClassGroup'];
export type GroupCover = Schemas['GroupCover'];
export type CoverSeries = Schemas['CoverSeries'];
export type CoverSeriesEntry = Schemas['CoverSeriesEntry'];
export type SeriesGroupCover = Schemas['SeriesGroupCover'];

export type ConnectCode = Schemas['MintConnectCodeResponse'];
export type DeviceRevocation = Schemas['RevokeResponse'];
export type DeviceRename = Schemas['RenameDeviceResponse'];
export type PresetAssignment = Schemas['AssignPresetResponse'];

export type StoredObject = Omit<Schemas['StoredObjectResponse'], 'status'> & {
    status: StoredObjectStatus;
};
export type RunArtifact = Schemas['RunArtifactResponse'];

export type ArchiveInitiateRequest = Schemas['InitiateRequest'];
export type ArchiveInitiate = Omit<Schemas['InitiateResponse'], 'status'> & {
    status: StoredObjectStatus;
};
export type ArchivePartUrl = Schemas['PartUrl'];
export type CompletedPart = Schemas['CompletedPartBody'];
export type ArchiveComplete = Schemas['CompleteResponse'];
export type ArchiveProbe = Omit<Schemas['ByHashResponse'], 'status'> & {
    status: StoredObjectStatus;
};
export type ArchiveDownload = Schemas['DownloadResponse'];
