import { CrudFilters, HttpError, useTranslate } from "@refinedev/core";
import { Button, Flex, Space, Table, Typography } from "antd";
import { ColumnsType, TableProps } from "antd/es/table";
import { Dispatch, Key, SetStateAction, useEffect, useState } from "react";
import { IProductDetail } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";
import { log } from "console";
import { tablePaginationSettings } from "../../../../constants";

const { Title } = Typography;

type PromotionProductDetailTableProps = {
  columns: ColumnsType<IProductDetail>;
  title: string;
  tableProps: TableProps<IProductDetail>;
  handlePromotionProductDetail(selectedKeys: Key[], setSelectedIds: Dispatch<SetStateAction<Key[]>>): void;
};

export const PromotionProductDetailTable: React.FC<PromotionProductDetailTableProps> = ({
  columns,
  title,
  tableProps,
  handlePromotionProductDetail,
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

  return (
    <Table
      {...tableProps}
      rowSelection={rowSelection}
      bordered
      title={() => {
        return (
          <Flex justify={"space-between"} align={"center"}>
            <Title level={5}>{t(`promotionProductDetail.table.title.${title}`)}</Title>
            {rowSelection.selectedRowKeys.length > 0 && (
              <Space>
                <span style={{ marginLeft: 8 }}>Selected {rowSelection.selectedRowKeys.length} items</span>
                <Button type="primary" loading={tableProps.loading} onClick={() => setSelectedIds([])}>
                  {t(`buttons.clear`)}
                </Button>
                <Button
                  type="primary"
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
    />
  );
};
