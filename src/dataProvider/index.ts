import {
    fetchUtils,
    DataProvider,
    GetListParams,
    GetManyReferenceParams,
    HttpError,
    PaginationPayload,
    SortPayload,
} from 'react-admin';

import type {
    ArchiveComplete,
    ArchiveDownload,
    ArchiveInitiate,
    ArchiveInitiateRequest,
    ArchiveProbe,
    ClassGroup,
    CompletedPart,
    ConnectCode,
    CoverSeries,
    DeviceRename,
    DeviceRevocation,
    PooledCover,
    RunRecord,
} from '../contract';

type HttpClient = typeof fetchUtils.fetchJson;

/** The vendored simple-rest verbs plus the registry's non-CRUD calls. */
export interface DrmDataProvider extends DataProvider {
    transectCover: (
        transectId: string,
        level: string,
        campaignId?: string,
    ) => Promise<PooledCover>;
    transectCoverSeries: (transectId: string, level: string) => Promise<CoverSeries>;
    videoRuns: (videoId: string) => Promise<RunRecord[]>;
    classGroups: () => Promise<ClassGroup[]>;
    mintConnectCode: (codeLabel: string) => Promise<ConnectCode>;
    revokeDevice: (deviceId: string) => Promise<DeviceRevocation>;
    renameDevice: (deviceId: string, name: string) => Promise<DeviceRename>;
    archiveInitiate: (body: ArchiveInitiateRequest) => Promise<ArchiveInitiate>;
    archiveComplete: (objectId: string, parts: CompletedPart[]) => Promise<ArchiveComplete>;
    archiveByHash: (contentHash: string) => Promise<ArchiveProbe | null>;
    archiveDownload: (objectId: string) => Promise<ArchiveDownload>;
}

const DEFAULT_PAGINATION: PaginationPayload = { page: 1, perPage: 25 };
const DEFAULT_SORT: SortPayload = { field: 'id', order: 'ASC' };

// The registry hides tombstones from its list routes already. Sent anyway so a console
// pointed at an older server does not start showing deleted rows.
const withoutTombstones = (filter: Record<string, unknown> | undefined) => ({
    deleted_at: null,
    ...filter,
});

// react-admin round-trips whole records into save, but the registry owns these
// columns and refuses payloads that carry them.
const SERVER_OWNED_KEYS = [
    'id',
    'created_at',
    'updated_at',
    'deleted_at',
    'device_id',
    'server_seq',
];

const stripServerOwned = (data: Record<string, unknown>) =>
    Object.fromEntries(
        Object.entries(data).filter(([key]) => !SERVER_OWNED_KEYS.includes(key)),
    );

const listQuery = (
    params: GetListParams | GetManyReferenceParams,
    filter: Record<string, unknown>,
) => {
    const { page, perPage } = params.pagination ?? DEFAULT_PAGINATION;
    const { field, order } = params.sort ?? DEFAULT_SORT;
    const rangeStart = (page - 1) * perPage;
    const rangeEnd = page * perPage - 1;
    return {
        rangeStart,
        rangeEnd,
        query: {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([rangeStart, rangeEnd]),
            filter: JSON.stringify(filter),
        },
    };
};

const parseTotal = (headers: Headers, countHeader: string): number => {
    const raw = headers.get(countHeader);
    if (raw === null) {
        throw new Error(
            `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`,
        );
    }
    const value = countHeader === 'Content-Range' ? raw.split('/').pop() : raw;
    return parseInt(value ?? '', 10);
};

const dataProvider = (
    apiUrl: string,
    httpClient: HttpClient = fetchUtils.fetchJson,
    countHeader = 'Content-Range',
): DrmDataProvider => {
    const rangeOptions = (resource: string, rangeStart: number, rangeEnd: number) =>
        // Chrome omits `Content-Range` on a response unless the request carried a `Range`.
        countHeader === 'Content-Range'
            ? { headers: new Headers({ Range: `${resource}=${rangeStart}-${rangeEnd}` }) }
            : {};

    return {
        getList: (resource, params) => {
            const { rangeStart, rangeEnd, query } = listQuery(
                params,
                withoutTombstones(params.filter),
            );
            const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
            return httpClient(url, rangeOptions(resource, rangeStart, rangeEnd)).then(
                ({ headers, json }) => ({
                    data: json,
                    total: parseTotal(headers, countHeader),
                }),
            );
        },

        getOne: (resource, params) =>
            httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
                data: json,
            })),

        // Every ReferenceField on a page batches into one getMany. Without a range the
        // registry answers with its default page of ten, and references past the tenth
        // distinct record silently render empty.
        getMany: (resource, params) => {
            const last = Math.max(params.ids.length - 1, 0);
            const query = {
                filter: JSON.stringify({ id: params.ids }),
                range: JSON.stringify([0, last]),
            };
            const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
            return httpClient(url, rangeOptions(resource, 0, last)).then(({ json }) => ({
                data: json,
            }));
        },

        getManyReference: (resource, params) => {
            const { rangeStart, rangeEnd, query } = listQuery(params, {
                ...withoutTombstones(params.filter),
                [params.target]: params.id,
            });
            const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
            return httpClient(url, rangeOptions(resource, rangeStart, rangeEnd)).then(
                ({ headers, json }) => ({
                    data: json,
                    total: parseTotal(headers, countHeader),
                }),
            );
        },

        update: (resource, params) =>
            httpClient(`${apiUrl}/${resource}/${params.id}`, {
                method: 'PUT',
                body: JSON.stringify(stripServerOwned(params.data)),
            }).then(({ json }) => ({ data: json })),

        // simple-rest has no updateMany route, so fall back to n updates.
        updateMany: (resource, params) =>
            Promise.all(
                params.ids.map(id =>
                    httpClient(`${apiUrl}/${resource}/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify(stripServerOwned(params.data)),
                    }),
                ),
            ).then(responses => ({ data: responses.map(({ json }) => json.id) })),

        create: (resource, params) =>
            httpClient(`${apiUrl}/${resource}`, {
                method: 'POST',
                body: JSON.stringify(stripServerOwned(params.data)),
            }).then(({ json }) => ({ data: json })),

        // The registry tombstones rather than removes, so the row keeps coming back
        // through sync with `deleted_at` set until every laptop has seen it.
        delete: (resource, params) =>
            httpClient(`${apiUrl}/${resource}/${params.id}`, {
                method: 'DELETE',
                headers: new Headers({ 'Content-Type': 'text/plain' }),
            }).then(({ json }) => ({ data: json })),

        // simple-rest has no filtered DELETE route, so fall back to n deletes.
        deleteMany: (resource, params) =>
            Promise.all(
                params.ids.map(id =>
                    httpClient(`${apiUrl}/${resource}/${id}`, {
                        method: 'DELETE',
                        headers: new Headers({ 'Content-Type': 'text/plain' }),
                    }),
                ),
            ).then(responses => ({ data: responses.map(({ json }) => json.id) })),

        // The registry pools the figure, so the console and the desktop application cannot
        // report different numbers from the same rows.
        transectCover: (transectId, level, campaignId) => {
            const query = new URLSearchParams({ level });
            if (campaignId) query.set('campaign_id', campaignId);
            return httpClient(`${apiUrl}/transects/${transectId}/cover?${query}`).then(
                ({ json }) => json as PooledCover,
            );
        },

        // One response carries every survey event's figure, so the statistics tab does
        // not fan out a request per campaign.
        transectCoverSeries: (transectId, level) => {
            const query = new URLSearchParams({ level });
            return httpClient(`${apiUrl}/transects/${transectId}/cover-series?${query}`).then(
                ({ json }) => json as CoverSeries,
            );
        },

        // Runs hang off a pass, not a clip, so the join lives in the registry rather
        // than a filter the console would have to reconstruct.
        videoRuns: videoId =>
            httpClient(`${apiUrl}/videos/${videoId}/runs`).then(
                ({ json }) => json as RunRecord[],
            ),

        // Colours come from the registry, so a class reads the same here as in the
        // desktop viewer.
        classGroups: () =>
            httpClient(`${apiUrl}/config/class-groups`).then(
                ({ json }) => json as ClassGroup[],
            ),

        // The registry still calls the code's label `note`.
        mintConnectCode: codeLabel =>
            httpClient(`${apiUrl}/devices/connect-codes`, {
                method: 'POST',
                body: JSON.stringify({ note: codeLabel }),
            }).then(({ json }) => json as ConnectCode),

        revokeDevice: deviceId =>
            httpClient(`${apiUrl}/devices/${deviceId}/revoke`, {
                method: 'POST',
            }).then(({ json }) => json as DeviceRevocation),

        // Devices carry no CRUD update route, so the name is changed through its own call.
        renameDevice: (deviceId, name) =>
            httpClient(`${apiUrl}/devices/${deviceId}/rename`, {
                method: 'POST',
                body: JSON.stringify({ name }),
            }).then(({ json }) => json as DeviceRename),

        archiveInitiate: body =>
            httpClient(`${apiUrl}/archive/initiate`, {
                method: 'POST',
                body: JSON.stringify(body),
            }).then(({ json }) => json as ArchiveInitiate),

        archiveComplete: (objectId, parts) =>
            httpClient(`${apiUrl}/archive/${objectId}/complete`, {
                method: 'POST',
                body: JSON.stringify({ parts }),
            }).then(({ json }) => json as ArchiveComplete),

        // Null rather than a thrown 404: nothing archived is an answer, not an error.
        archiveByHash: contentHash =>
            httpClient(`${apiUrl}/archive/by-hash/${contentHash}`).then(
                ({ json }) => json as ArchiveProbe,
                (error: unknown) => {
                    if (error instanceof HttpError && error.status === 404) return null;
                    throw error;
                },
            ),

        archiveDownload: objectId =>
            httpClient(`${apiUrl}/archive/${objectId}/download`).then(
                ({ json }) => json as ArchiveDownload,
            ),
    };
};

export default dataProvider;
