/** One line per resource: what a row is. The sidebar and the empty states share it. */
export const GLOSSARY: Record<string, string> = {
    sites: 'A named reef location with country and map point. Transects belong to a site.',
    campaigns: 'One trip. A repeat visit is a new campaign.',
    transects: 'A tape line at a site: end points, tape length, depth.',
    passes: 'One traversal of a transect: a time window over ordered clips, with a direction.',
    videos: 'A camera file identified by content hash, with camera and rig position.',
    runs: 'One reconstruction of one pass.',
    devices: 'An enrolled field laptop.',
    presets: 'Named run settings the registry defines and laptops download.',
    changes: 'The ledger of every write, and the proposals from laptops awaiting a decision.',
    stored_objects: 'An archived clip or run output, keyed by content hash.',
};

export const GLOSSARY_TERMS: Record<string, string> = {
    'survey event': 'All passes of one transect in one campaign. Derived; nothing to create.',
    validated:
        'Checked in the console. Laptop changes to it become proposals. Until then only the authoring laptop can change it.',
    proposal:
        "A laptop's change awaiting a decision: the row was validated, deleted or edited in the console meanwhile.",
};
