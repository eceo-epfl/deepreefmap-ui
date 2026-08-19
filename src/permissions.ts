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
 * The registry needs the role for two things: deleting anything, since a tombstone
 * reaches every laptop that already pulled the row, and writing the rows devices
 * report rather than humans author (videos, runs, cover rows).
 */
export const useIsAdmin = (): boolean => {
    const { permissions } = usePermissions();
    return permissions === 'admin';
};
