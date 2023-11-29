import { useTranslate } from "@refinedev/core";
import { Button, Flex, Space, Table, Typography } from "antd";
import { ColumnsType, TableProps } from "antd/es/table";
import { Dispatch, Key, SetStateAction, useState } from "react";
import { ICustomer } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";
import { tablePaginationSettings } from "../../../../constants";

const { Title } = Typography;

type CustomerVoucherTableProps = {
  columns: ColumnsType<ICustomer>;
  title: string;
  handleCustomerVoucher(
    selectedKeys: Key[],
    setSelectedIds: Dispatch<SetStateAction<Key[]>>
  ): void;
  tableProps: TableProps<ICustomer>;
};

export const CustomerVoucherTable: React.FC<CustomerVoucherTableProps> = ({
  columns,
  title,
  handleCustomerVoucher,
  tableProps,
}) => {
  const t = useTranslate();

  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedIds(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  const hasSelected = selectedIds.length > 0;

  return (
    <Table
      rowSelection={rowSelection}
      bordered
      {...tableProps}
      title={() => {
        return (
          <Flex justify={"space-between"} align={"center"}>
            <Title level={5}>
              {t(`vouchers.table.title.${title}`)} (
              {tableProps.dataSource?.length})
            </Title>
            {hasSelected && (
              <Space>
                <Button
                  type="primary"
                  loading={tableProps.loading}
                  onClick={() =>
                    showWarningConfirmDialog({
                      options: {
                        accept: () =>
                          handleCustomerVoucher(selectedIds, setSelectedIds),
                        reject: () => {},
                      },
                      t: t,
                    })
                  }
                >
                  {t(`actions.${title === "eligible" ? "remove" : "apply"}`)}
                </Button>
                <span style={{ marginLeft: 8 }}>
                  Selected {selectedIds.length} items
                </span>
              </Space>
            )}
          </Flex>
        );
      }}
      pagination={{
        ...tableProps.pagination,
        ...tablePaginationSettings,
      }}
      rowKey="id"
      columns={columns}
      //   onChange={(pagination) => setPagination(pagination)}
    />
  );
};
