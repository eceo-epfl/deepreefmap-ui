/** One line per resource: what a row is. The sidebar and the empty states share it. */
export const GLOSSARY: Record<string, string> = {
    sites: 'A named place on a reef, with country and a map point. Transects belong to a site.',
    campaigns: 'One trip. A repeat visit is a new campaign.',
    transects: 'A tape line at a site: end points, tape length, depth.',
    passes: 'One traversal of a transect: a time window over ordered clips, with a direction.',
    videos: 'A file off the camera; identity is its content hash. Carries which camera and rig position it came from.',
    runs: 'One reconstruction of one pass.',
    devices: 'An enrolled field laptop.',
    presets: 'Named run settings the registry defines and laptops download.',
    changes: 'The ledger of every write, and the proposals from laptops awaiting a decision.',
    stored_objects: 'An archived clip or run output, keyed by content hash.',
};

export const GLOSSARY_TERMS: Record<string, string> = {
    'survey event': 'All passes of one transect in one campaign. Derived; nothing to create.',
    validated:
        "Checked in the console. From then on a laptop's change to it is a proposal the console accepts or dismisses. Until then, only the laptop that made a row can change it.",
    proposal:
        "A laptop's change the console has not accepted: the row was validated, deleted, or edited in the console meanwhile. Nothing a laptop sends is ever lost.",
};
