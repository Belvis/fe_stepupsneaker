import { useTranslate } from "@refinedev/core";
import { Button, Flex, Space, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { Dispatch, Key, SetStateAction, useState } from "react";
import { ICustomer } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";

const { Title } = Typography;

type CustomerVoucherTableProps = {
  columns: ColumnsType<ICustomer>;
  isLoading: boolean;
  customers: ICustomer[];
  title: string;
  handleCustomerVoucher(selectedKeys: Key[], setSelectedIds: Dispatch<SetStateAction<Key[]>>): void;
};

export const CustomerVoucherTable: React.FC<CustomerVoucherTableProps> = ({
  columns,
  isLoading,
  customers,
  title,
  handleCustomerVoucher,
}) => {
  const t = useTranslate();

  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedIds(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: onSelectChange,
  };

  const hasSelected = selectedIds.length > 0;

  return (
    <Table
      loading={isLoading}
      rowSelection={rowSelection}
      bordered
      title={() => {
        return (
          <Flex justify={"space-between"} align={"center"}>
            <Title level={5}>
              List of customers {title} for voucher ({customers.length})
            </Title>
            {hasSelected && (
              <Space>
                <Button
                  type="primary"
                  loading={isLoading}
                  onClick={() =>
                    showWarningConfirmDialog({
                      options: {
                        accept: () => handleCustomerVoucher(selectedIds, setSelectedIds),
                        reject: () => {},
                      },
                      t: t,
                    })
                  }
                >
                  {t(`actions.${title === "eligible" ? "remove" : "apply"}`)}
                </Button>
                <span style={{ marginLeft: 8 }}>Selected {selectedIds.length} items</span>
              </Space>
            )}
          </Flex>
        );
      }}
      pagination={{
        // ...pagination,
        showTotal: (total: number, range: [number, number]) => (
          <div>
            {range[0]} - {range[1]} of {total} items
          </div>
        ),
      }}
      dataSource={customers}
      rowKey="id"
      columns={columns}
      //   onChange={(pagination) => setPagination(pagination)}
    />
  );
};
