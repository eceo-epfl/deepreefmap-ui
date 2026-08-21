import schema from '../contract/preset-schema.json';

// The field table and model catalogue published by the registry as
// contract/preset-schema.json, mirrored from the desktop application. The form is
// generated from it, so the console offers exactly what a laptop accepts.

export type PresetFieldKind = 'int' | 'float' | 'bool' | 'enum';

export type PresetFieldDef = {
    key: string;
    label: string;
    kind: PresetFieldKind;
    minimum: number | null;
    maximum: number | null;
    step: number | null;
    decimals: number | null;
    unit: string;
    choices: string;
    applies_when: string[];
    nullable: boolean;
    default: unknown;
};

export type ModelChoice = {
    name: string;
    description: string;
    hf_repos: string[];
    gated: boolean;
    gpu_only: boolean;
    approx_size_mb: number | null;
};

export const PRESET_SCHEMA_VERSION: number = schema.preset_schema_version;
export const PRESET_FIELDS = schema.fields as PresetFieldDef[];
export const UNPUBLISHABLE_KEYS: string[] = schema.unpublishable_keys;

const MODEL_CHOICES: Record<string, ModelChoice[]> = {
    segmentation: schema.choices.segmentation as ModelChoice[],
    mapping: schema.choices.mapping as ModelChoice[],
};

const PLAIN_CHOICES: Record<string, string[]> = {
    camera: schema.choices.camera,
    resolution: schema.choices.resolution,
};

const sizeLabel = (mb: number | null): string => {
    if (mb === null) return '';
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
};

/** react-admin choices for one enumeration, described well enough to pick from. */
export const choicesFor = (name: string): { id: string; name: string }[] => {
    const models = MODEL_CHOICES[name];
    if (models) {
        return models.map(model => {
            const notes = [
                sizeLabel(model.approx_size_mb),
                model.gated ? 'gated' : '',
                model.gpu_only ? 'GPU only' : '',
            ]
                .filter(Boolean)
                .join(', ');
            return {
                id: model.name,
                name: notes ? `${model.name} (${notes})` : model.name,
            };
        });
    }
    return (PLAIN_CHOICES[name] ?? []).map(value => ({ id: value, name: value }));
};

/** The bundled defaults, for a fresh create form. */
export const defaultSettings = (): Record<string, unknown> =>
    Object.fromEntries(PRESET_FIELDS.map(field => [field.key, field.default]));

/** Keys of a stored document the schema does not describe, shown but not edited. */
export const unknownKeys = (settings: unknown): string[] => {
    if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
        return [];
    }
    const known = new Set(PRESET_FIELDS.map(field => field.key));
    return Object.keys(settings).filter(key => !known.has(key));
};
