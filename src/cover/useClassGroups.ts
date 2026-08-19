import { useEffect, useState } from 'react';
import { useDataProvider } from 'react-admin';

import type { ClassGroup } from '../contract';
import type { DrmDataProvider } from '../dataProvider';

/** `class group` to `#rrggbb` at one level, as the registry publishes it. */
export const useClassColours = (level: string) => {
    const dataProvider = useDataProvider<DrmDataProvider>();
    const [groups, setGroups] = useState<ClassGroup[]>();

    useEffect(() => {
        let current = true;
        dataProvider
            .classGroups()
            .then(result => {
                if (current) setGroups(result);
            })
            .catch(() => {
                if (current) setGroups([]);
            });
        return () => {
            current = false;
        };
    }, [dataProvider]);

    return new Map(
        (groups ?? [])
            .filter(group => group.level === level)
            .map(group => [group.name, group.colour]),
    );
};
