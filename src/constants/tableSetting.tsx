import { TablePaginationConfig } from "antd";

export const tablePaginationSettings: TablePaginationConfig = {
  pageSizeOptions: [5, 10, 20, 50, 100],
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal(total: number, range: [number, number]): React.ReactNode {
    return (
      <div>
        {range[0]} - {range[1]} of {total} items
      </div>
    );
  },
};
