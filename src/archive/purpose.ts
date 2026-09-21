export const RESULTS = 'Results';
export const RECORD = 'Record';

/** Which groups open with the page: the ones a reader came for. */
export const expandedByDefault = (name: string) => name === RESULTS || name === RECORD;
