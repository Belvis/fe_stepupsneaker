import {
  DeleteOutlined,
  IdcardOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { EditButton, List, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  getDefaultFilter,
  useDelete,
  useNavigation,
  useTranslate,
} from "@refinedev/core";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";

import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { useState } from "react";
import { UserStatus, AddressModal } from "../../../components";
import {
  getUserStatusOptions,
  tablePaginationSettings,
} from "../../../constants";
import { ICustomer, ICustomerFilterVariables } from "../../../interfaces";
import { showDangerConfirmDialog } from "../../../utils";

const { Text } = Typography;

export const CustomerList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { show } = useNavigation();
  const { mutate: mutateDelete } = useDelete();
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

  function handleDelete(id: string): void {
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "customers",
            id: id,
          });
        },
        reject: () => {},
      },
      t: t,
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
        const formattedDate = dob.format("YYYY-MM-DD");
        return <>{formattedDate}</>;
      },
    },
    {
      title: t("customers.fields.address"),
      dataIndex: "address",
      key: "address",
      width: "20%",
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

  const handleClearFilters = () => {
    searchFormProps.form?.setFieldValue("q", null);
    searchFormProps.form?.setFieldValue("status", null);
    searchFormProps.form?.submit();
  };

  return (
    <List>
      <Row gutter={[8, 12]}>
        <Col span={24}>
          <Card>
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
              <Space wrap>
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
                <Form.Item
                  noStyle
                  label={t("customers.fields.status")}
                  name="status"
                >
                  <Select
                    placeholder={t("customers.filters.status.placeholder")}
                    style={{
                      width: "200px",
                    }}
                    options={getUserStatusOptions(t)}
                  />
                </Form.Item>
                <Button icon={<UndoOutlined />} onClick={handleClearFilters}>
                  {t("actions.clear")}
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>
        <Col span={24}>
          <Table
            {...tableProps}
            pagination={{
              ...tableProps.pagination,
              ...tablePaginationSettings,
            }}
            rowKey="id"
            columns={columns}
            onRow={(record) => {
              return {
                onDoubleClick: () => {
                  show("customers", record.id);
                },
              };
            }}
          />
        </Col>
      </Row>
      <AddressModal
        customer={selectedCustomer}
        open={openAddressModal}
        handleCancel={handleCancel}
        handleOk={handleOk}
      />
    </List>
  );
};
