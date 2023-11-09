import {
  useTranslate,
  IResourceComponentsProps,
  useDelete,
  HttpError,
  CrudFilters,
  getDefaultFilter,
  useNavigation,
} from "@refinedev/core";
import { List, useModalForm, useTable } from "@refinedev/antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import {
  Table,
  Space,
  Typography,
  Form,
  Input,
  Select,
  Tooltip,
  Avatar,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { confirmDialog } from "primereact/confirmdialog";
import { Button } from "antd";

import { IProduct, IProductFilterVariables } from "../../interfaces";
import { debounce } from "lodash";
import { ProductStatus } from "../../components";
import { EditProduct } from "./modalEdit";

const { Text } = Typography;

export const ProductList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { show } = useNavigation();

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    id: editId,
    onFinish: editOnFinish,
  } = useModalForm<IProduct>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IProduct,
    HttpError,
    IProductFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const productFilters: CrudFilters = [];

      productFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      productFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return productFilters;
    },
  });

  const columns: ColumnsType<IProduct> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      align: "center",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("products.fields.name"),
      dataIndex: "name",
      key: "name",
      render: (_, { image, name }) => (
        <Space>
          <Avatar shape="square" size={74} src={image} />
          <Text style={{ wordBreak: "inherit" }}>{name}</Text>
        </Space>
      ),
    },
    {
      title: t("products.fields.quantity"),
      key: "quantity",
      dataIndex: "quantity",
      width: "10%",
      align: "center",
      render: (text, record) => {
        const totalQuantity = record.productDetails.reduce(
          (total, productDetail) => {
            return total + productDetail.quantity;
          },
          0
        );
        return <Text>{totalQuantity}</Text>;
      },
    },
    {
      title: t("products.fields.code"),
      key: "code",
      dataIndex: "code",
      width: "10%",
      align: "center",
    },
    {
      title: t("products.fields.status"),
      key: "status",
      dataIndex: "status",
      width: "10%",
      align: "center",
      render: (_, { status }) => <ProductStatus status={status} />,
    },
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("actions.edit")}>
            <Button
              style={{ color: "#52c41a", borderColor: "#52c41a" }}
              size="small"
              icon={<EditOutlined />}
              onClick={() => editModalShow(record.id)}
            />
          </Tooltip>
          <Tooltip title={t("actions.delete")}>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const { mutate: mutateDelete } = useDelete();

  function handleDelete(id: string): void {
    confirmDialog({
      message: t("confirmDialog.delete.message"),
      header: t("confirmDialog.delete.header"),
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => {
        mutateDelete({
          resource: "products",
          id: id,
        });
      },
      acceptLabel: t("confirmDialog.delete.acceptLabel"),
      rejectLabel: t("confirmDialog.delete.rejectLabel"),
      reject: () => {},
    });
  }

  const handleClearFilters = () => {
    searchFormProps.form?.setFieldValue("q", "");
    searchFormProps.form?.setFieldValue("status", "");
    searchFormProps.form?.submit();
  };

  return (
    <List>
      <Form
        {...searchFormProps}
        onValuesChange={debounce(() => {
          searchFormProps.form?.submit();
        }, 500)}
        initialValues={{
          q: getDefaultFilter("q", filters, "eq"),
          status: getDefaultFilter("status", filters, "eq"),
        }}
      >
        <Space wrap style={{ marginBottom: "16px" }}>
          <Text style={{ fontSize: "18px" }} strong>
            {t("products.filters.title")}
          </Text>
          <Form.Item name="q" noStyle>
            <Input
              style={{
                width: "400px",
              }}
              placeholder={t("products.filters.search.placeholder")}
              suffix={<SearchOutlined />}
            />
          </Form.Item>
          <Form.Item noStyle label={t("products.fields.status")} name="status">
            <Select
              placeholder={t("products.filters.status.placeholder")}
              style={{
                width: "200px",
              }}
              options={[
                {
                  label: t("enum.productStatuses.ACTIVE"),
                  value: "ACTIVE",
                },
                {
                  label: t("enum.productStatuses.IN_ACTIVE"),
                  value: "IN_ACTIVE",
                },
              ]}
            />
          </Form.Item>
          <Button icon={<UndoOutlined />} onClick={() => handleClearFilters()}>
            {t("actions.clear")}
          </Button>
        </Space>
      </Form>
      <Table
        {...tableProps}
        pagination={{
          ...tableProps.pagination,
          pageSizeOptions: [5, 10, 20, 50, 100],
          showTotal(total: number, range: [number, number]): React.ReactNode {
            return (
              <div>
                {range[0]} - {range[1]} of {total} items
              </div>
            );
          },
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        rowKey="id"
        columns={columns}
        onRow={(record) => {
          return {
            onDoubleClick: () => {
              show("products", record.id);
            },
          };
        }}
      />
      <EditProduct
        onFinish={editOnFinish}
        id={editId}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
