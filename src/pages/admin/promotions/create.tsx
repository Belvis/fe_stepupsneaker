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
  useUpdate,
} from "@refinedev/core";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
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

import Table, { ColumnsType } from "antd/es/table";
import {
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload";
import { useState } from "react";
import { ProductStatus } from "../../../components";
import {
  getProductStatusOptions,
  getPromotionStatusOptions,
  tablePaginationSettings,
} from "../../../constants";
import {
  IProductDetail,
  IProductDetailFilterVariables,
  IPromotion,
} from "../../../interfaces";
import { getBase64Image, showWarningConfirmDialog } from "../../../utils";
import { debounce } from "lodash";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { validateCommon } from "../../../helpers/validate";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

export const PromotionCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { id } = useParsed();
  const [loadingImage, setLoadingImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedIds(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  const { formProps, saveButtonProps, queryResult, onFinish } =
    useForm<IPromotion>({});

  const handleOnFinish = (values: any) => {
    const data = {
      code: `${values.code}`,
      name: `${values.name}`,
      status: `ACTIVE`,
      value: `${values.value}`,
      startDate: `${values.promotionRange[0].valueOf()}`,
      endDate: `${values.promotionRange[1].valueOf()}`,
      image: `${values.image}`,
      productDetailIds: selectedIds,
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

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
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
    tableProps,
    searchFormProps,
    filters,
    current,
    pageSize,
    tableQueryResult: { refetch: refetchEligible },
  } = useTable<IProductDetail, HttpError, IProductDetailFilterVariables>({
    resource: `product-details`,
    filters: {
      initial: [
        {
          field: "promotion",
          operator: "eq",
          value: id,
        },
      ],
    },
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

  type ColumnPagination = { current: number; pageSize: number };
  const generateColumns = (
    props: ColumnPagination
  ): ColumnsType<IProductDetail> => {
    const columns: ColumnsType<IProductDetail> = [
      {
        title: "#",
        key: "index",
        width: "1px",
        render: (text, record, index) =>
          (props.current - 1) * props.pageSize + index + 1,
      },
      {
        title: t("productDetails.fields.image"),
        dataIndex: "image",
        key: "image",
        render: (_, { image }) => (
          <Avatar shape="square" size={74} src={image} />
        ),
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
        render: (_, record) => (
          <Text style={{ width: "100%" }}>{record.size.name}</Text>
        ),
      },
      {
        title: t("productDetails.fields.color"),
        key: "color",
        dataIndex: "color",
        align: "center",
        render: (_, record) => (
          <Tag
            style={{ width: "100%" }}
            color={`#${record.color.code}`}
          >{`#${record.color.code}`}</Tag>
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
    return columns;
  };

  const handleClearFilters = () => {
    searchFormProps.form?.setFieldValue("q", null);
    searchFormProps.form?.setFieldValue("status", null);
    searchFormProps.form?.submit();
  };

  return (
    <>
      {contextHolder}
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
                          {t("promotions.fields.images.description")}
                        </Text>
                        <Text style={{ fontSize: "12px" }}>
                          {t("promotions.fields.images.validation")}
                        </Text>
                      </Space>
                    </Upload.Dragger>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={
                      <div>
                        <span>{t("promotions.fields.name")}</span>
                        <span className="sub-label">(Tối đa 255 ký tự)</span>
                      </div>
                    }
                    required
                    name="name"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "name"),
                      },
                    ]}
                  >
                    <Input maxLength={255} showCount />
                  </Form.Item>
                  <Form.Item
                    label={
                      <div>
                        <span>{t("promotions.fields.code")}</span>
                        <span className="sub-label">(Tối đa 10 ký tự)</span>
                      </div>
                    }
                    required
                    name="code"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "code"),
                      },
                    ]}
                  >
                    <Input maxLength={10} showCount />
                  </Form.Item>
                  <Form.Item
                    label={t("promotions.fields.value")}
                    name="value"
                    required
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "value"),
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      width={100}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t("promotions.fields.promotionRange")}
                    name="promotionRange"
                    required
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
                      disabledDate={(current) =>
                        dayjs(current).isBefore(dayjs().startOf("day"))
                      }
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
                    {t("products.filters.title")}
                  </Text>
                  <Form.Item name="q" noStyle>
                    <Input
                      style={{
                        width: "360px",
                      }}
                      placeholder={t("products.filters.search.placeholder")}
                      suffix={<SearchOutlined />}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    label={t("products.fields.status")}
                    name="status"
                  >
                    <Select
                      placeholder={t("products.filters.status.placeholder")}
                      style={{
                        width: "160px",
                      }}
                      options={getProductStatusOptions(t)}
                    />
                  </Form.Item>
                  <Button icon={<UndoOutlined />} onClick={handleClearFilters}>
                    {t("actions.clear")}
                  </Button>
                </Space>
              </Form>
              <Table
                {...tableProps}
                rowSelection={rowSelection}
                bordered
                title={() => {
                  return (
                    <Flex justify={"space-between"} align={"center"}>
                      <Title level={5}>
                        {t(`promotionProductDetail.table.title.ineligible`)}
                      </Title>
                      {rowSelection.selectedRowKeys.length > 0 && (
                        <Space>
                          <span style={{ marginLeft: 8 }}>
                            Selected {rowSelection.selectedRowKeys.length} items
                          </span>
                          <Button
                            type="primary"
                            loading={tableProps.loading}
                            onClick={() => setSelectedIds([])}
                          >
                            {t(`buttons.clear`)}
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
                columns={generateColumns({ current, pageSize })}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
};
