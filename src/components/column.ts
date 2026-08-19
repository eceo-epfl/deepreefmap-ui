import { ComponentType } from 'react';

type ColumnProps = { label?: string; sortable?: boolean };

/** Datagrid reads a column header from `label`, which the shared fields do not declare. */
const asColumn = <P extends object>(Field: ComponentType<P>): ComponentType<P & ColumnProps> =>
    Field as ComponentType<P & ColumnProps>;

export default asColumn;
