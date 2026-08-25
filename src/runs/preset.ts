/** The preset a run names, as `name vN`. Runs carry the label, never the preset row. */
export const presetLabel = (run: {
    preset_name?: string | null;
    preset_version?: number | null;
}): string =>
    run.preset_name
        ? `${run.preset_name}${run.preset_version == null ? '' : ` v${run.preset_version}`}`
        : '—';
