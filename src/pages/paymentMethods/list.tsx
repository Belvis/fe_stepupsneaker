import {
  useTranslate,
  IResourceComponentsProps,
  useDelete,
  HttpError,
  CrudFilters,
  getDefaultFilter,
} from "@refinedev/core";
import { List, useTable, useModalForm } from "@refinedev/antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Table, Space, Typography, Form, Input, Select, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { confirmDialog } from "primereact/confirmdialog";
import { CreatePaymentMethod } from "./create";
import { EditPaymentMethod } from "./edit";
import { Button } from "antd";

import {
  IPaymentMethod,
  IPaymentMethodFilterVariables,
} from "../../interfaces";
import { debounce } from "lodash";

const { Text } = Typography;

export const PaymentMethodList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    IPaymentMethod,
    HttpError,
    IPaymentMethodFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q }) => {
      const paymentMethodFilters: CrudFilters = [];

      paymentMethodFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return paymentMethodFilters;
    },
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<IPaymentMethod>({
    onMutationSuccess: () => {
      createFormProps.form?.resetFields();
    },
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    id: editId,
    onFinish: editOnFinish,
    close: editClose,
  } = useModalForm<IPaymentMethod>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const columns: ColumnsType<IPaymentMethod> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      align: "center",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("paymentMethods.fields.name"),
      dataIndex: "name",
      key: "name",
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
          resource: "payment-methods",
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
    searchFormProps.form?.submit();
  };

  return (
    <List
      createButtonProps={{
        onClick: () => {
          createModalShow();
        },
      }}
    >
      <Form
        {...searchFormProps}
        onValuesChange={debounce(() => {
          searchFormProps.form?.submit();
        }, 500)}
        initialValues={{
          q: getDefaultFilter("q", filters, "eq"),
        }}
      >
        <Space wrap style={{ marginBottom: "16px" }}>
          <Text style={{ fontSize: "18px" }} strong>
            {t("paymentMethods.filters.title")}
          </Text>
          <Form.Item name="q" noStyle>
            <Input
              style={{
                width: "400px",
              }}
              placeholder={t("paymentMethods.filters.search.placeholder")}
              suffix={<SearchOutlined />}
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
      />
      <CreatePaymentMethod
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
      />
      <EditPaymentMethod
        id={editId}
        onFinish={editOnFinish}
        close={editClose}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
