import { useGetList } from 'react-admin';

import type { Site, Transect } from '../contract';

// One request per resource rather than one per page of a list, so cap what a map
// will draw. Pagination and sort are fixed so every map shares one react-query
// cache entry instead of refetching the same 500 rows.
export const MAX_DRAWN = 500;

const PARAMS = {
    pagination: { page: 1, perPage: MAX_DRAWN },
    sort: { field: 'name', order: 'ASC' as const },
};

export const useSiteGeometry = () => useGetList<Site>('sites', PARAMS);

// An empty filter normalises to no filter, so a filterless list shares the
// overview map's cache entry.
export const useTransectGeometry = (filter?: Record<string, unknown>) =>
    useGetList<Transect>(
        'transects',
        filter && Object.keys(filter).length ? { ...PARAMS, filter } : PARAMS,
    );
