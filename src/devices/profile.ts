// The system profile is stored as sent, so every read here survives a device that
// reported a different shape.

export const asObject = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;

export const textOf = (profile: Record<string, unknown>, key: string): string | null => {
    const value = profile[key];
    return typeof value === 'string' && value ? value : null;
};

export const numberOf = (profile: Record<string, unknown>, key: string): number | null => {
    const value = profile[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

export type ProfileTotals = {
    ram: number | null;
    swap: number | null;
    vram: number | null;
};

/** Memory ceilings from a device's `system_profile`, for scaling observed peaks. */
export const profileTotals = (systemProfile: unknown): ProfileTotals => {
    const profile = asObject(systemProfile);
    if (!profile) return { ram: null, swap: null, vram: null };
    const gpu = asObject(profile.gpu);
    return {
        ram: numberOf(profile, 'total_ram_bytes'),
        swap: numberOf(profile, 'total_swap_bytes'),
        vram: gpu && numberOf(gpu, 'total_vram_bytes'),
    };
};
