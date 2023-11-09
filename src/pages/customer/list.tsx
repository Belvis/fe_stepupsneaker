import {
  useTranslate,
  IResourceComponentsProps,
  useDelete,
  useNavigation,
  HttpError,
  CrudFilters,
  getDefaultFilter,
  useCustom,
} from "@refinedev/core";
import { EditButton, List, useTable } from "@refinedev/antd";
import {
  EditOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  DeleteOutlined,
  SearchOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import {
  Table,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Tooltip,
  Button,
  Form,
  Input,
  Select,
} from "antd";

import {
  ICustomer,
  ICustomerFilterVariables,
  IDistrict,
  IProvince,
  IWard,
} from "../../interfaces";
import { ColumnsType } from "antd/es/table";
import { UserStatus } from "../../components/admin/userStatus";
import { confirmDialog } from "primereact/confirmdialog";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { AddressModal } from "./addressModal";

const { Text } = Typography;
import dayjs from "dayjs";

export const CustomerList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer>();

  const showAddressModal = (customer: ICustomer) => {
    setSelectedCustomer(customer);
    setOpenAddressModal(true);
  };

  const handleOk = () => {
    setOpenAddressModal(false);
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpenAddressModal(false);
  };

  const { tableProps, searchFormProps, filters, current, pageSize } = useTable<
    ICustomer,
    HttpError,
    ICustomerFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const customerFilters: CrudFilters = [];

      customerFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      customerFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return customerFilters;
    },
  });

  const { mutate: mutateDelete } = useDelete();

  function handleDelete(id: string): void {
    confirmDialog({
      message: t("confirmDialog.delete.message"),
      header: t("confirmDialog.delete.header"),
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => {
        mutateDelete({
          resource: "customers",
          id: id,
        });
      },
      acceptLabel: t("confirmDialog.delete.acceptLabel"),
      rejectLabel: t("confirmDialog.delete.rejectLabel"),
      reject: () => {},
    });
  }

  const columns: ColumnsType<ICustomer> = [
    {
      title: "#",
      key: "index",
      width: "1rem",
      render: (text, record, index) => (current - 1) * pageSize + index + 1,
    },
    {
      title: t("customers.fields.fullName"),
      dataIndex: "fullName",
      key: "fullName",
      width: 300,
      render: (_, { image, fullName }) => (
        <Space>
          <Avatar size={74} src={image} />
          <Text style={{ wordBreak: "inherit" }}>{fullName}</Text>
        </Space>
      ),
    },
    {
      title: t("customers.fields.phone"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (_, record) => {
        const defaultAddress = record.addressList.find(
          (address) => address.isDefault
        );
        const phoneNumber = defaultAddress ? defaultAddress.phoneNumber : "N/A";
        return <>{phoneNumber}</>;
      },
    },
    {
      title: t("customers.fields.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("customers.fields.dateOfBirth"),
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (_, record) => {
        const dob = dayjs(new Date(record.dateOfBirth));
        const formattedDate = dob.format("YYYY-MM-DD"); // Định dạng ngày tháng ở đây
        return <>{formattedDate}</>;
      },
    },
    {
      title: t("customers.fields.address"),
      dataIndex: "address",
      key: "address",
      width: "10%",
      render: (_, record) => {
        const defaultAddress = record.addressList.find(
          (address) => address.isDefault
        );
        const fullAddress = defaultAddress
          ? `${defaultAddress.more}, ${defaultAddress.wardName}, ${defaultAddress.districtName}, ${defaultAddress.provinceName}`
          : "N/A";
        return <>{fullAddress}</>;
      },
    },
    {
      title: t("customers.fields.status"),
      key: "status",
      dataIndex: "status",
      width: "0.5rem",
      align: "center",
      render: (_, { status }) => <UserStatus status={status} />,
    },
    {
      title: t("table.actions"),
      dataIndex: "actions",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("actions.showAddress")}>
            <Button
              style={{ color: "#000000", borderColor: "#000000" }}
              size="small"
              icon={<IdcardOutlined />}
              onClick={() => {
                showAddressModal(record);
              }}
            />
          </Tooltip>
          <Tooltip title={t("actions.edit")}>
            <EditButton
              style={{ color: "#52c41a", borderColor: "#52c41a" }}
              hideText
              size="small"
              recordItemId={record.id}
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

  return (
    <List>
      <Form
        {...searchFormProps}
        onValuesChange={debounce(() => {
          searchFormProps.form?.submit();
        }, 500)}
        initialValues={{
          name: getDefaultFilter("q", filters, "eq"),
          status: getDefaultFilter("status", filters, "eq"),
        }}
      >
        <Space wrap style={{ marginBottom: "16px" }}>
          <Text style={{ fontSize: "18px" }} strong>
            {t("customers.filters.title")}
          </Text>
          <Form.Item name="q" noStyle>
            <Input
              style={{
                width: "400px",
              }}
              placeholder={t("customers.filters.search.placeholder")}
              suffix={<SearchOutlined />}
            />
          </Form.Item>
          <Form.Item noStyle label={t("customers.fields.status")} name="status">
            <Select
              placeholder={t("customers.filters.status.placeholder")}
              style={{
                width: "200px",
              }}
              options={[
                {
                  label: t("enum.userStatuses.ACTIVE"),
                  value: "ACTIVE",
                },
                {
                  label: t("enum.userStatuses.IN_ACTIVE"),
                  value: "IN_ACTIVE",
                },
                {
                  label: t("enum.userStatuses.BLOCKED"),
                  value: "BLOCKED",
                },
              ]}
            />
          </Form.Item>
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
      <AddressModal
        customer={selectedCustomer}
        open={openAddressModal}
        handleCancel={handleCancel}
        handleOk={handleOk}
      />
    </List>
  );
};
