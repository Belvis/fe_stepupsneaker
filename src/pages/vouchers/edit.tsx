import {
  IResourceComponentsProps,
  useApiUrl,
  useCreate,
  useCustom,
  useDelete,
  useParsed,
  useTranslate,
} from "@refinedev/core";
import { Edit, getValueFromEvent, useForm } from "@refinedev/antd";
import {
  Form,
  Input,
  Avatar,
  Row,
  Col,
  Typography,
  Space,
  Radio,
  InputProps,
  Select,
  InputNumber,
  Upload,
  message,
  DatePicker,
  Card,
  Flex,
  Button,
} from "antd";
import InputMask from "react-input-mask";

import { ICustomer, IVoucher } from "../../interfaces";
import {
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Table, { ColumnsType } from "antd/es/table";
import { confirmDialog } from "primereact/confirmdialog";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

export const VoucherEdit: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const API_URL = useApiUrl();
  const { id } = useParsed();
  const [successFlag, setSuccessFlag] = useState(true);
  const [loadingImage, setLoadingImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedEligibleCustomerIds, setselectedEligibleCustomerIds] =
    useState<React.Key[]>([]);
  const [selectedInEligibleCustomerIds, setselectedInEligibleCustomerIds] =
    useState<React.Key[]>([]);

  const [eligibleCustomers, setEligibleCustomers] = useState<ICustomer[]>([]);
  const [inEligibleCustomers, setInEligibleCustomers] = useState<ICustomer[]>(
    []
  );

  const { mutate: mutateCreate } = useCreate();

  const { mutate: mutateDelete } = useDelete();

  const { formProps, saveButtonProps, queryResult, onFinish } =
    useForm<IVoucher>({});

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
    onFinish(data);
  };

  const imageUrl = Form.useWatch("image", formProps.form);

  useEffect(() => {
    const startDate = formProps.form?.getFieldValue("startDate");
    const endDate = formProps.form?.getFieldValue("endDate");

    if (startDate && endDate) {
      const voucherRange = [dayjs(startDate), dayjs(endDate)];
      formProps.form?.setFieldsValue({ voucherRange });
    }
  }, [
    formProps.form?.getFieldValue("startDate"),
    formProps.form?.getFieldValue("endDate"),
  ]);

  useEffect(() => {
    if (successFlag) {
      setEligibleCustomers([]);
      setInEligibleCustomers([]);
      refetchEligibleCustomer();
      refetchInEligibleCustomer();
      setSuccessFlag(false);
    }
  }, [id, successFlag]);

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

  function handleInEligibleCustomerVoucher() {
    setLoadingInEligible(true);
    try {
      mutateCreate(
        {
          resource: "customerVoucher",
          values: {
            voucher: [id],
            customer: selectedInEligibleCustomerIds,
          },
        },
        {
          onSuccess: () => {
            setSuccessFlag(true);
            setLoadingInEligible(false);
            setselectedInEligibleCustomerIds([]);
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
      setLoadingInEligible(false);
    }
  }

  function handleEligibleCustomerVoucher() {
    setLoadingEligible(true);
    try {
      mutateDelete(
        {
          resource: "customerVoucher",
          values: {
            customer: selectedEligibleCustomerIds,
          },
          id: id as any,
        },
        {
          onSuccess: () => {
            setSuccessFlag(true);
            setLoadingEligible(false);
            setselectedEligibleCustomerIds([]);
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
      setLoadingEligible(false);
    }
  }

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === "uploading") {
      setLoadingImage(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoadingImage(false);
        formProps.form?.setFieldValue("image", url);
      });
    }
  };

  const {
    isLoading: isLoadingEligibleCustomer,
    refetch: refetchEligibleCustomer,
  } = useCustom<ICustomer[]>({
    url: `${API_URL}/customers`,
    method: "get",
    config: {
      filters: [
        {
          field: "voucher",
          operator: "eq",
          value: id,
        },
      ],
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setEligibleCustomers(data.response.content.data);
      },
    },
  });

  const {
    isLoading: isLoadingInEligibleCustomer,
    refetch: refetchInEligibleCustomer,
  } = useCustom<ICustomer[]>({
    url: `${API_URL}/customers`,
    method: "get",
    config: {
      filters: [
        {
          field: "noVoucher",
          operator: "eq",
          value: id,
        },
      ],
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setInEligibleCustomers(data.response.content.data);
      },
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
      title: t("customers.fields.status"),
      key: "status",
      dataIndex: "status",
      width: "1px",
      align: "center",
      render: (_, { status }) => <></>,
    },
  ];

  const [loadingEligible, setLoadingEligible] = useState(false);
  const [loadingInEligible, setLoadingInEligible] = useState(false);

  const onEligibleSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setselectedEligibleCustomerIds(newSelectedRowKeys);
  };

  const onInEligibleSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setselectedInEligibleCustomerIds(newSelectedRowKeys);
  };

  const eligibleRowSelection = {
    selectedEligibleCustomerIds,
    onChange: onEligibleSelectChange,
  };

  const inEligibleRowSelection = {
    selectedInEligibleCustomerIds,
    onChange: onInEligibleSelectChange,
  };

  const hasEligibleSelected = selectedEligibleCustomerIds.length > 0;
  const hasInEligibleSelected = selectedInEligibleCustomerIds.length > 0;

  return (
    <>
      <Row gutter={[16, 24]}>
        <Col span={8}>
          <Edit
            isLoading={queryResult?.isFetching}
            saveButtonProps={saveButtonProps}
          >
            <Form {...formProps} layout="vertical" onFinish={handleOnFinish}>
              <Row gutter={20}>
                <Col span={24}>
                  <Form.Item
                    name="image"
                    valuePropName="file"
                    getValueFromEvent={getValueFromEvent}
                    noStyle
                  >
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
                        <Text style={{ fontSize: "12px" }}>
                          {t("vouchers.fields.images.validation")}
                        </Text>
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
                      <Radio value={"PERCENTAGE"}>
                        {t("vouchers.type.PERCENTAGE")}
                      </Radio>
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
                    <Select
                      options={[
                        {
                          label: t("enum.vouchersStatuses.ACTIVE"),
                          value: "ACTIVE",
                        },
                        {
                          label: t("enum.vouchersStatuses.IN_ACTIVE"),
                          value: "IN_ACTIVE",
                        },
                        {
                          label: t("enum.vouchersStatuses.EXPIRED"),
                          value: "EXPIRED",
                        },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Edit>
        </Col>
        <Col span={16}>
          <Card style={{ height: "100%" }}>
            <Space
              direction="vertical"
              size="middle"
              style={{ display: "flex" }}
            >
              <Table
                loading={isLoadingEligibleCustomer}
                rowSelection={eligibleRowSelection}
                bordered
                title={() => {
                  return (
                    <Flex justify={"space-between"} align={"center"}>
                      <Title level={5}>
                        List of customers eligible for voucher (
                        {eligibleCustomers.length})
                      </Title>
                      {hasEligibleSelected && (
                        <Space>
                          <Button
                            type="primary"
                            loading={loadingEligible}
                            onClick={() =>
                              confirmDialog({
                                message: t("confirmDialog.edit.message"),
                                header: t("confirmDialog.edit.header"),
                                icon: "pi pi-exclamation-triangle",
                                acceptLabel: t(
                                  "confirmDialog.edit.acceptLabel"
                                ),
                                rejectLabel: t(
                                  "confirmDialog.edit.rejectLabel"
                                ),
                                acceptClassName: "p-button-warning",
                                accept: () => {
                                  handleEligibleCustomerVoucher();
                                },
                                reject: () => {},
                              })
                            }
                          >
                            {t("actions.remove")}
                          </Button>
                          <span style={{ marginLeft: 8 }}>
                            Selected {selectedEligibleCustomerIds.length} items
                          </span>
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
                dataSource={eligibleCustomers}
                rowKey="id"
                columns={columns}
                //   onChange={(pagination) => setPagination(pagination)}
              />
              <Table
                loading={isLoadingInEligibleCustomer}
                rowSelection={inEligibleRowSelection}
                bordered
                title={() => {
                  return (
                    <Flex justify={"space-between"} align={"center"}>
                      <Title level={5}>
                        List of customers ineligible for voucher (
                        {inEligibleCustomers.length})
                      </Title>
                      {hasInEligibleSelected && (
                        <Space>
                          <Button
                            type="primary"
                            loading={loadingInEligible}
                            onClick={() =>
                              confirmDialog({
                                message: t("confirmDialog.edit.message"),
                                header: t("confirmDialog.edit.header"),
                                icon: "pi pi-exclamation-triangle",
                                acceptLabel: t(
                                  "confirmDialog.edit.acceptLabel"
                                ),
                                rejectLabel: t(
                                  "confirmDialog.edit.rejectLabel"
                                ),
                                acceptClassName: "p-button-warning",
                                accept: () => {
                                  handleInEligibleCustomerVoucher();
                                },
                                reject: () => {},
                              })
                            }
                          >
                            {t("actions.apply")}
                          </Button>
                          <span style={{ marginLeft: 8 }}>
                            Selected {selectedInEligibleCustomerIds.length}{" "}
                            items
                          </span>
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
                dataSource={inEligibleCustomers}
                rowKey="id"
                columns={columns}
                //   onChange={(pagination) => setPagination(pagination)}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
};
