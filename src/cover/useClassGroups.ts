import { useEffect, useState } from 'react';
import { useDataProvider } from 'react-admin';

import type { BenthicClass, ClassGroup } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

export type ClassRegistry = {
    /** Group name to `#rrggbb` at one level, as the registry publishes it. */
    colours: Map<string, string>;
    /** Label id to the group it falls into at one level. */
    groupOf: (classId: number) => string | undefined;
    /** Label id to the class the segmentation model named. */
    classOf: (classId: number) => BenthicClass | undefined;
    ready: boolean;
};

type Registry = { groups: ClassGroup[]; classes: BenthicClass[] };

// The taxonomy is one static table per deployment, so it is fetched once and
// shared: a cover table, its donut and the class ortho then draw one colour set.
let pending: Promise<Registry> | undefined;

const load = (dataProvider: DrmDataProvider): Promise<Registry> => {
    pending ??= Promise.all([dataProvider.classGroups(), dataProvider.benthicClasses()])
        .then(([groups, classes]) => ({ groups, classes }))
        .catch(() => {
            pending = undefined;
            return { groups: [], classes: [] };
        });
    return pending;
};

/** The published taxonomy at one level: group colours, and what a label id means. */
export const useClassRegistry = (level: string): ClassRegistry => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [registry, setRegistry] = useState<Registry>();

    useEffect(() => {
        let current = true;
        load(dataProvider).then(result => {
            if (current) setRegistry(result);
        });
        return () => {
            current = false;
        };
    }, [dataProvider]);

    const colours = new Map(
        (registry?.groups ?? [])
            .filter(group => group.level === level)
            .map(group => [group.name, group.colour]),
    );
    const classes = new Map((registry?.classes ?? []).map(entry => [entry.id, entry]));
    const groupOf = (classId: number) => {
        const entry = classes.get(classId);
        if (!entry) return undefined;
        if (level === 'intermediate') return entry.intermediate;
        if (level === 'coarse') return entry.coarse;
        return entry.name;
    };
    return {
        colours,
        groupOf,
        classOf: (classId: number) => classes.get(classId),
        ready: Boolean(registry && registry.groups.length > 0),
    };
};

/** Group name to `#rrggbb` at one level. */
export const useClassColours = (level: string) => useClassRegistry(level).colours;
