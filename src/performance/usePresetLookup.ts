import { useQueries } from '@tanstack/react-query';
import { useDataProvider, useGetList } from 'react-admin';

import type { PerformanceGroup, Preset } from '../contract';
import { configNote, processingSettings } from './statistics';
import type { ProcessingConfig, ProcessingSettings } from './statistics';

/** The preset a row names. `settings` stays undefined until the detail fetch answers. */
export type PresetMatch = {
    id: string;
    settings: ProcessingSettings | undefined;
};

type Named = { preset_name?: string | null; preset_version?: number | null };

export type PresetLookup = (row: Named) => PresetMatch | null;

/** The config note for a row: the whole config with no preset, nothing while it loads. */
export const matchNote = (
    match: PresetMatch | null,
    config: ProcessingConfig,
): string | null => {
    if (match == null) return configNote(config, null);
    return match.settings ? configNote(config, match.settings) : null;
};

const matchKey = (
    name: string | null | undefined,
    version: number | null | undefined,
): string => `${name ?? ''}|${version ?? ''}`;

/** Resolves the preset behind each group by name and version. */
// The list route omits the settings document; each named preset is fetched on its own
// under the query key react-admin's `useGetOne` uses.
export const usePresetLookup = (groups: PerformanceGroup[] | undefined): PresetLookup => {
    const dataProvider = useDataProvider();
    // Same parameters as the assignment panel, so the whole console shares one fetch.
    const { data: presets } = useGetList<Preset>('presets', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
    });
    const byLabel = new Map<string, Preset>();
    for (const preset of presets ?? [])
        byLabel.set(matchKey(preset.name, preset.version), preset);
    const wanted = Array.from(
        new Set(
            (groups ?? []).flatMap(group => {
                const preset = byLabel.get(matchKey(group.preset_name, group.preset_version));
                return preset ? [preset.id] : [];
            }),
        ),
    );
    const details = useQueries({
        queries: wanted.map(id => ({
            queryKey: ['presets', 'getOne', { id }],
            queryFn: () =>
                dataProvider.getOne<Preset>('presets', { id }).then(({ data }) => data),
        })),
    });
    const settingsById = new Map<string, ProcessingSettings>();
    details.forEach((result, index) => {
        if (result.data)
            settingsById.set(wanted[index], processingSettings(result.data.settings));
    });
    return row => {
        const preset = byLabel.get(matchKey(row.preset_name, row.preset_version));
        if (!preset) return null;
        return { id: preset.id, settings: settingsById.get(preset.id) };
    };
};
