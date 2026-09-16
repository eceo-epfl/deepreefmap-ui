import { usePermissions } from 'react-admin';

/**
 * True for a member or an administrator.
 *
 * Members set up the work the field team will do, so they create and edit sites,
 * campaigns, transects, passes and pass videos.
 */
export const useCanAuthor = (): boolean => {
    const { permissions } = usePermissions();
    return permissions === 'admin' || permissions === 'user';
};

/**
 * True only for `deepreefmap-admin`.
 *
 * The registry needs the role for deleting anything, since a tombstone reaches every
 * laptop that already pulled the row. Runs and cover rows are device-reported and
 * nobody writes them here; a clip's review is the one thing a person edits on it.
 */
export const useIsAdmin = (): boolean => {
    const { permissions } = usePermissions();
    return permissions === 'admin';
};
