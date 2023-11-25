import { Edit, getValueFromEvent, useForm, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  getDefaultFilter,
  useApiUrl,
  useCreate,
  useCustom,
  useDelete,
  useParsed,
  useTranslate,
} from "@refinedev/core";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";

import { ColumnsType } from "antd/es/table";
import { RcFile, UploadChangeParam, UploadFile, UploadProps } from "antd/es/upload";
import dayjs from "dayjs";
import { Dispatch, Key, SetStateAction, useEffect, useState } from "react";
import { CustomerVoucherTable } from "../../../components";
import { getUserStatusOptions, getVouccherStatusOptions } from "../../../constants";
import { ICustomer, ICustomerFilterVariables, IVoucher } from "../../../interfaces";
import { formatTimestamp, getBase64Image, showWarningConfirmDialog } from "../../../utils";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { debounce } from "lodash";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

export const VoucherEdit: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const API_URL = useApiUrl();
  const { id } = useParsed();
  const [successFlag, setSuccessFlag] = useState(true);
  const [loadingImage, setLoadingImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [eligibleCustomers, setEligibleCustomers] = useState<ICustomer[]>([]);
  const [inEligibleCustomers, setInEligibleCustomers] = useState<ICustomer[]>([]);

  const { mutate: mutateCreate } = useCreate();

  const { mutate: mutateDelete } = useDelete();

  const { formProps, saveButtonProps, queryResult, onFinish } = useForm<IVoucher>({});

  const handleOnFinish = (values: any) => {
    const data = {
      code: `${values.code}`,
      name: `${values.name}`,
      status: `${values.status}`,
      type: `${values.type}`,
      value: `${values.value}`,
      constraint: `${values.constraint}`,
      quantity: `${values.quantity}`,
      startDate: `${values.voucherRange[0].valueOf()}`,
      endDate: `${values.voucherRange[1].valueOf()}`,
      image: `${values.image}`,
    };
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(data);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  const imageUrl = Form.useWatch("image", formProps.form);

  useEffect(() => {
    const startDate = formProps.form?.getFieldValue("startDate");
    const endDate = formProps.form?.getFieldValue("endDate");

    if (startDate && endDate) {
      const voucherRange = [dayjs(startDate), dayjs(endDate)];
      formProps.form?.setFieldsValue({ voucherRange });
    }
  }, [formProps.form?.getFieldValue("startDate"), formProps.form?.getFieldValue("endDate")]);

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      messageApi.open({
        type: "error",
        content: "You can only upload JPG/PNG file!",
      });
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.open({
        type: "error",
        content: "Image must smaller than 2MB!",
      });
    }
    return isJpgOrPng && isLt2M;
  };

  function handleInEligibleCustomerVoucher(selectedIds: Key[], setSelectedIds: Dispatch<SetStateAction<Key[]>>) {
    try {
      mutateCreate(
        {
          resource: "customerVoucher",
          values: {
            voucher: [id],
            customer: selectedIds,
          },
        },
        {
          onSuccess: () => {
            refetchInEligibleCustomer();
            refetchEligibleCustomer();
            setSelectedIds([]);
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
    }
  }

  function handleEligibleCustomerVoucher(selectedIds: Key[], setSelectedIds: Dispatch<SetStateAction<Key[]>>) {
    try {
      mutateDelete(
        {
          resource: "customerVoucher",
          values: {
            customer: selectedIds,
          },
          id: id as any,
        },
        {
          onSuccess: () => {
            refetchEligibleCustomer();
            refetchInEligibleCustomer();
            setSelectedIds([]);
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
    }
  }

  const handleChange: UploadProps["onChange"] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === "uploading") {
      setLoadingImage(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64Image(info.file.originFileObj as RcFile, (url) => {
        setLoadingImage(false);
        formProps.form?.setFieldValue("image", url);
      });
    }
  };

  const {
    tableProps: tablePropsEligibleCustomer,
    searchFormProps: searchFormPropsEligibleCustomer,
    filters: filtersEligibleCustomer,
    current: currentEligibleCustomer,
    pageSize: pageSizeEligibleCustomer,
    tableQueryResult: { refetch: refetchEligibleCustomer },
  } = useTable<ICustomer, HttpError, ICustomerFilterVariables>({
    resource: "customers",
    pagination: {
      pageSize: 5,
    },
    filters: {
      initial: [
        {
          field: "voucher",
          operator: "eq",
          value: id,
        },
      ],
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

  const {
    tableProps: tablePropsInEligibleCustomer,
    searchFormProps: searchFormPropsInEligibleCustomer,
    filters: filtersInEligibleCustomer,
    current: currentInEligibleCustomer,
    pageSize: pageSizeInEligibleCustomer,
    tableQueryResult: { refetch: refetchInEligibleCustomer },
  } = useTable<ICustomer, HttpError, ICustomerFilterVariables>({
    resource: "customers",
    pagination: {
      pageSize: 5,
    },
    filters: {
      initial: [
        {
          field: "noVoucher",
          operator: "eq",
          value: id,
        },
      ],
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

  const columns: ColumnsType<ICustomer> = [
    {
      title: "#",
      key: "index",
      width: "1px",
      render: (text, record, index) => index + 1,
    },
    {
      title: t("customers.fields.fullName"),
      dataIndex: "fullName",
      key: "fullName",
      render: (_, { image, fullName }) => (
        <Space>
          <Avatar size={48} src={image} />
          <Text style={{ wordBreak: "inherit" }}>{fullName}</Text>
        </Space>
      ),
    },
    {
      title: t("customers.fields.phone"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (_, record) => {
        const defaultAddress = record.addressList.find((address) => address.isDefault);
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
        return <>{formatTimestamp(record.dateOfBirth).dateFormat}</>;
      },
    },
  ];

  const [loadingEligible, setLoadingEligible] = useState(false);
  const [loadingInEligible, setLoadingInEligible] = useState(false);
  const handleClearFiltersEligibleCustomer = () => {
    searchFormPropsEligibleCustomer.form?.setFieldValue("q", null);
    searchFormPropsEligibleCustomer.form?.setFieldValue("status", null);
    searchFormPropsEligibleCustomer.form?.submit();
  };
  const handleClearFiltersInEligibleCustomer = () => {
    searchFormPropsInEligibleCustomer.form?.setFieldValue("q", null);
    searchFormPropsInEligibleCustomer.form?.setFieldValue("status", null);
    searchFormPropsInEligibleCustomer.form?.submit();
  };

  return (
    <>
      {contextHolder}
      <Row gutter={[16, 24]}>
        <Col span={8}>
          <Edit isLoading={queryResult?.isFetching} saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical" onFinish={handleOnFinish}>
              <Row gutter={20}>
                <Col span={24}>
                  <Form.Item name="image" valuePropName="file" getValueFromEvent={getValueFromEvent} noStyle>
                    <Upload.Dragger
                      name="file"
                      beforeUpload={beforeUpload}
                      onChange={handleChange}
                      showUploadList={false}
                      customRequest={({ onSuccess, onError, file }) => {
                        if (onSuccess) {
                          try {
                            onSuccess("ok");
                          } catch (error) {}
                        }
                      }}
                      maxCount={1}
                      multiple
                      style={{
                        border: "none",
                        width: "100%",
                        background: "none",
                      }}
                    >
                      <Space direction="vertical" size={2}>
                        {imageUrl ? (
                          <Avatar
                            shape="square"
                            style={{
                              width: "100%",
                              height: "100%",
                              maxWidth: "200px",
                            }}
                            src={imageUrl}
                            alt="Product cover"
                          />
                        ) : (
                          <Avatar
                            shape="square"
                            style={{
                              width: "100%",
                              height: "100%",
                              maxWidth: "200px",
                            }}
                            src="/images/product-default-img.jpg"
                            alt="Default product image"
                          />
                        )}
                        <Text
                          style={{
                            fontWeight: 800,
                            fontSize: "16px",
                            marginTop: "8px",
                          }}
                        >
                          {t("vouchers.fields.images.description")}
                        </Text>
                        <Text style={{ fontSize: "12px" }}>{t("vouchers.fields.images.validation")}</Text>
                      </Space>
                    </Upload.Dragger>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t("vouchers.fields.name")}
                    name="name"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.code")}
                    name="code"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.value")}
                    name="value"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <InputNumber width={100} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.constraint")}
                    name="constraint"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <InputNumber width={100} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.quantity")}
                    name="quantity"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <InputNumber width={100} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.voucherRange")}
                    name="voucherRange"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <RangePicker
                      showTime={{ format: "HH:mm:ss" }}
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item label={t("vouchers.fields.type")} name="type">
                    <Radio.Group>
                      <Radio value={"PERCENTAGE"}>{t("vouchers.type.PERCENTAGE")}</Radio>
                      <Radio value={"CASH"}>{t("vouchers.type.CASH")}</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.status")}
                    name="status"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select options={getVouccherStatusOptions(t)} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Edit>
        </Col>
        <Col span={16}>
          <Card style={{ height: "100%" }}>
            <Space direction="vertical" size="middle" style={{ display: "flex" }}>
              <Form
                {...searchFormPropsEligibleCustomer}
                onValuesChange={debounce(() => {
                  searchFormPropsEligibleCustomer.form?.submit();
                }, 500)}
                initialValues={{
                  name: getDefaultFilter("q", filtersEligibleCustomer, "eq"),
                  status: getDefaultFilter("status", filtersEligibleCustomer, "eq"),
                }}
              >
                <Space wrap>
                  <Text style={{ fontSize: "18px" }} strong>
                    {t("customers.filters.title")}
                  </Text>
                  <Form.Item name="q" noStyle>
                    <Input
                      style={{
                        width: "360px",
                      }}
                      placeholder={t("customers.filters.search.placeholder")}
                      suffix={<SearchOutlined />}
                    />
                  </Form.Item>
                  <Form.Item noStyle label={t("customers.fields.status")} name="status">
                    <Select
                      placeholder={t("customers.filters.status.placeholder")}
                      style={{
                        width: "160px",
                      }}
                      options={getUserStatusOptions(t)}
                    />
                  </Form.Item>
                  <Button icon={<UndoOutlined />} onClick={handleClearFiltersEligibleCustomer}>
                    {t("actions.clear")}
                  </Button>
                </Space>
              </Form>
              <CustomerVoucherTable
                columns={columns}
                handleCustomerVoucher={handleEligibleCustomerVoucher}
                tableProps={tablePropsEligibleCustomer}
                title="eligible"
              />

              <Form
                {...searchFormPropsInEligibleCustomer}
                onValuesChange={debounce(() => {
                  searchFormPropsInEligibleCustomer.form?.submit();
                }, 500)}
                initialValues={{
                  name: getDefaultFilter("q", filtersInEligibleCustomer, "eq"),
                  status: getDefaultFilter("status", filtersInEligibleCustomer, "eq"),
                }}
              >
                <Space wrap>
                  <Text style={{ fontSize: "18px" }} strong>
                    {t("customers.filters.title")}
                  </Text>
                  <Form.Item name="q" noStyle>
                    <Input
                      style={{
                        width: "360px",
                      }}
                      placeholder={t("customers.filters.search.placeholder")}
                      suffix={<SearchOutlined />}
                    />
                  </Form.Item>
                  <Form.Item noStyle label={t("customers.fields.status")} name="status">
                    <Select
                      placeholder={t("customers.filters.status.placeholder")}
                      style={{
                        width: "160px",
                      }}
                      options={getUserStatusOptions(t)}
                    />
                  </Form.Item>
                  <Button icon={<UndoOutlined />} onClick={handleClearFiltersInEligibleCustomer}>
                    {t("actions.clear")}
                  </Button>
                </Space>
              </Form>
              <CustomerVoucherTable
                tableProps={tablePropsInEligibleCustomer}
                columns={columns}
                handleCustomerVoucher={handleInEligibleCustomerVoucher}
                title="ineligible"
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
};
