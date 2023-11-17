import { Edit, getValueFromEvent, useForm } from "@refinedev/antd";
import {
  IResourceComponentsProps,
  useApiUrl,
  useCreate,
  useCustom,
  useDelete,
  useParsed,
  useTranslate,
} from "@refinedev/core";
import {
  Avatar,
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
  Tag,
  Typography,
  Upload,
  message,
} from "antd";

import { ColumnsType } from "antd/es/table";
import { RcFile, UploadChangeParam, UploadFile, UploadProps } from "antd/es/upload";
import dayjs from "dayjs";
import { Dispatch, Key, SetStateAction, useEffect, useState } from "react";
import { CustomerVoucherTable, ProductStatus } from "../../../components";
import { getPromotionStatusOptions } from "../../../constants";
import { ICustomer, IProductDetail, IVoucher } from "../../../interfaces";
import { formatTimestamp, getBase64Image, showWarningConfirmDialog } from "../../../utils";
import { PromotionProductDetailTable } from "../../../components/admin/promotion/promotionProductDetail";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

export const PromotionCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const API_URL = useApiUrl();
  const { id } = useParsed();
  const [successFlag, setSuccessFlag] = useState(true);
  const [loadingImage, setLoadingImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [eligibleProductDetails, setEligibleProductDetails] = useState<IProductDetail[]>([]);
  const [inEligibleProductDetails, setInEligibleProductDetails] = useState<IProductDetail[]>([]);

  const { mutate: mutateCreate } = useCreate();

  const { mutate: mutateDelete } = useDelete();

  const { formProps, saveButtonProps, queryResult, onFinish } = useForm<IVoucher>({});

  const handleOnFinish = (values: any) => {
    const data = {
      code: `${values.code}`,
      name: `${values.name}`,
      status: `${values.status}`,
      value: `${values.value}`,
      startDate: `${values.promotionRange[0].valueOf()}`,
      endDate: `${values.promotionRange[1].valueOf()}`,
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
      const promotionRange = [dayjs(startDate), dayjs(endDate)];
      formProps.form?.setFieldsValue({ promotionRange });
    }
  }, [formProps.form?.getFieldValue("startDate"), formProps.form?.getFieldValue("endDate")]);

  useEffect(() => {
    if (successFlag) {
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

  function handleInEligibleCustomerVoucher(selectedIds: Key[], setSelectedIds: Dispatch<SetStateAction<Key[]>>) {
    setLoadingInEligible(true);
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
            setSuccessFlag(true);
            setLoadingInEligible(false);
            setSelectedIds([]);
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
      setLoadingInEligible(false);
    }
  }

  function handleEligibleCustomerVoucher(selectedIds: Key[], setSelectedIds: Dispatch<SetStateAction<Key[]>>) {
    setLoadingEligible(true);
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
            setSuccessFlag(true);
            setLoadingEligible(false);
            setSelectedIds([]);
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
      setLoadingEligible(false);
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

  const { isLoading: isLoadingEligibleCustomer, refetch: refetchEligibleCustomer } = useCustom<ICustomer[]>({
    url: `${API_URL}/product-details`,
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
        setEligibleProductDetails(data.response.content.data);
      },
    },
  });

  const { isLoading: isLoadingInEligibleCustomer, refetch: refetchInEligibleCustomer } = useCustom<ICustomer[]>({
    url: `${API_URL}/product-details`,
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
        setInEligibleProductDetails(data.response.content.data);
      },
    },
  });

  const columns: ColumnsType<IProductDetail> = [
    {
      title: "#",
      key: "index",
      width: "1px",
      render: (text, record, index) => index + 1,
    },
    {
      title: t("productDetails.fields.image"),
      dataIndex: "image",
      key: "image",
      render: (_, { image }) => <Avatar shape="square" size={74} src={image} />,
    },
    {
      title: t("productDetails.fields.name"),
      dataIndex: "name",
      key: "name",
      render: (_, { product, size, color }) => (
        <Text style={{ wordBreak: "inherit" }}>
          {product.name} [{size.name} - {color.name}]
        </Text>
      ),
    },
    {
      title: t("productDetails.fields.size"),
      key: "size",
      dataIndex: "size",
      align: "center",
      render: (_, record) => <Text style={{ width: "100%" }}>{record.size.name}</Text>,
    },
    {
      title: t("productDetails.fields.color"),
      key: "color",
      dataIndex: "color",
      align: "center",
      render: (_, record) => (
        <Tag style={{ width: "100%" }} color={`#${record.color.code}`}>{`#${record.color.code}`}</Tag>
      ),
    },
    {
      title: t("products.fields.status"),
      key: "status",
      dataIndex: "status",
      width: "10%",
      align: "center",
      render: (_, { status }) => <ProductStatus status={status} />,
    },
  ];

  const [loadingEligible, setLoadingEligible] = useState(false);
  const [loadingInEligible, setLoadingInEligible] = useState(false);

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
                          {t("promotions.fields.images.description")}
                        </Text>
                        <Text style={{ fontSize: "12px" }}>{t("promotions.fields.images.validation")}</Text>
                      </Space>
                    </Upload.Dragger>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t("promotions.fields.name")}
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
                    label={t("promotions.fields.code")}
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
                    label={t("promotions.fields.value")}
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
                    label={t("promotions.fields.promotionRange")}
                    name="promotionRange"
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
                  <Form.Item
                    label={t("promotions.fields.status")}
                    name="status"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select options={getPromotionStatusOptions(t)} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Edit>
        </Col>
        <Col span={16}>
          <Card style={{ height: "100%" }}>
            <Space direction="vertical" size="middle" style={{ display: "flex" }}>
              <PromotionProductDetailTable
                columns={columns}
                productDetails={eligibleProductDetails}
                isLoading={isLoadingEligibleCustomer || loadingEligible}
                handlePromotionProductDetail={handleEligibleCustomerVoucher}
                title={t("promotionProductDetail.table.title.eligible")}
              />
              <PromotionProductDetailTable
                columns={columns}
                productDetails={inEligibleProductDetails}
                isLoading={isLoadingInEligibleCustomer || loadingInEligible}
                handlePromotionProductDetail={handleInEligibleCustomerVoucher}
                title={t("promotionProductDetail.table.title.ineligible")}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
};
