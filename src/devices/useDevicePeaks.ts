import { useEffect, useState } from 'react';
import { useDataProvider, useGetList } from 'react-admin';

import type { RunRecord } from '../contract';
import type { DrmDataProvider } from '../dataProvider';
import { parseStagePeaks } from '../runs/StageBreakdown';

const RECENT_RUNS = 5;

// `stage_peaks` is detail-view only, so each run costs one getOne. It is also
// immutable once a run succeeded, so the fetches cache for the session.
const runCache = new Map<string, RunRecord>();

export type ComboPeaks = {
    combo: string;
    runs: number;
    ram: number | null;
    swap: number | null;
    vram: number | null;
};

const maxima = (values: (number | null)[]): number | null =>
    values.reduce<number | null>(
        (peak, value) => (value == null ? peak : Math.max(peak ?? 0, value)),
        null,
    );

const combosOf = (runs: RunRecord[]): ComboPeaks[] => {
    const groups = new Map<string, RunRecord[]>();
    for (const run of runs) {
        const combo = `${run.segmentation_model ?? 'no segmentation'} · ${
            run.mapping_backend ?? 'no mapping'
        }`;
        groups.set(combo, [...(groups.get(combo) ?? []), run]);
    }
    return Array.from(groups.entries(), ([combo, members]) => {
        const stages = members.flatMap(run => parseStagePeaks(run.stage_peaks));
        return {
            combo,
            runs: members.length,
            ram: maxima(stages.map(([, peak]) => peak.ram_bytes)),
            swap: maxima(stages.map(([, peak]) => peak.swap_bytes)),
            vram: maxima(stages.map(([, peak]) => peak.vram_bytes)),
        };
    }).filter(group => group.ram != null || group.vram != null);
};

/** Peak memory per model combination, from the device's recent succeeded runs. */
export const useDevicePeaks = (deviceId: string | undefined): ComboPeaks[] => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [combos, setCombos] = useState<ComboPeaks[]>([]);

    const { data: recent } = useGetList<RunRecord>(
        'runs',
        {
            pagination: { page: 1, perPage: RECENT_RUNS },
            sort: { field: 'started_at', order: 'DESC' },
            filter: { device_id: deviceId, status: 'succeeded' },
        },
        { enabled: Boolean(deviceId) },
    );

    const runIds = (recent ?? []).map(run => run.id).join(',');

    useEffect(() => {
        if (!runIds) {
            setCombos([]);
            return;
        }
        let current = true;
        Promise.all(
            runIds.split(',').map(async id => {
                const cached = runCache.get(id);
                if (cached) return cached;
                const { data } = await dataProvider.getOne<RunRecord>('runs', { id });
                runCache.set(id, data);
                return data;
            }),
        )
            .then(runs => {
                if (current) setCombos(combosOf(runs));
            })
            .catch(() => {
                // Peaks are a hint, not data the page depends on.
                if (current) setCombos([]);
            });
        return () => {
            current = false;
        };
    }, [dataProvider, runIds]);

    return combos;
};
