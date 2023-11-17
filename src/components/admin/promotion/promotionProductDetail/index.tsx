import { useTranslate } from "@refinedev/core";
import { Button, Flex, Space, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { Dispatch, Key, SetStateAction, useState } from "react";
import { ICustomer, IProductDetail } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";

const { Title } = Typography;

type PromotionProductDetailTableProps = {
  columns: ColumnsType<IProductDetail>;
  isLoading: boolean;
  productDetails: IProductDetail[];
  title: string;
  handlePromotionProductDetail(selectedKeys: Key[], setSelectedIds: Dispatch<SetStateAction<Key[]>>): void;
};

export const PromotionProductDetailTable: React.FC<PromotionProductDetailTableProps> = ({
  columns,
  isLoading,
  productDetails,
  title,
  handlePromotionProductDetail,
}) => {
  const t = useTranslate();

  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedIds(newSelectedRowKeys);
  };

  const rowSelection = {
    setSelectedIds,
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
              {title} ({productDetails.length})
            </Title>
            {hasSelected && (
              <Space>
                <Button
                  type="primary"
                  loading={isLoading}
                  onClick={() =>
                    showWarningConfirmDialog({
                      options: {
                        accept: () => handlePromotionProductDetail(selectedIds, setSelectedIds),
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
      dataSource={productDetails}
      rowKey="id"
      columns={columns}
      //   onChange={(pagination) => setPagination(pagination)}
    />
  );
};
