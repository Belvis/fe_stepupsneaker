import { getValueFromEvent, useSelect } from "@refinedev/antd";
import { HttpError, useOne, useParsed, useTranslate } from "@refinedev/core";
import {
  Avatar,
  Col,
  Form,
  FormProps,
  Grid,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { useState } from "react";
import { PRODUCT_STATUS_OPTIONS } from "../../../../constants";
import { getBase64Image, showWarningConfirmDialog } from "../../../../utils";
import {
  IBrand,
  IColor,
  IMaterial,
  IProductDetailConvertedPayload,
  IProductDetailFilterVariables,
  ISize,
  ISole,
  IStyle,
  ITradeMark,
  IProductDetail,
} from "../../../../interfaces";
import { validateCommon } from "../../../../helpers/validate";

const { TextArea } = Input;
const { Text } = Typography;

type EditProductProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
};

function convertToPayload(
  productDetails: IProductDetail[],
  productId: string
): IProductDetailConvertedPayload[] {
  return productDetails.map((detail) => ({
    product: productId,
    tradeMark: detail.tradeMark.id,
    style: detail.style.id,
    size: detail.size.id,
    material: detail.material.id,
    color: detail.color.id,
    brand: detail.brand.id,
    sole: detail.sole.id,
    image: detail.image,
    price: detail.price,
    quantity: detail.quantity,
    status: detail.status,
  }));
}

export const EditProductDetail: React.FC<EditProductProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const { id: productId } = useParsed();

  const renderColor = (value: string, label: string) => ({
    value: value,
    label: (
      <Tag style={{ width: "96%" }} color={`#${label}`}>{`#${label}`}</Tag>
    ),
  });

  const { selectProps: brandSelectProps } = useSelect<IBrand>({
    resource: "brands?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { selectProps: styleSelectProps } = useSelect<IStyle>({
    resource: "styles?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { selectProps: materialSelectProps } = useSelect<IMaterial>({
    resource: "materials?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { selectProps: tradeMarkSelectProps } = useSelect<ITradeMark>({
    resource: "trade-marks?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { selectProps: soleSelectProps } = useSelect<ISole>({
    resource: "soles?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
  });

  const { selectProps: colorSelectProps } = useSelect<IColor>({
    resource: "colors?pageSize=1000&",
    optionLabel: "code",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
    pagination: {
      pageSize: 1000,
    },
  });

  const { selectProps: sizeSelectProps } = useSelect<ISize>({
    resource: "sizes?pageSize=1000&",
    optionLabel: "name",
    optionValue: "id",
    debounce: 500,
    onSearch: (value) => [
      {
        field: "q",
        operator: "eq",
        value,
      },
    ],
    pagination: {
      pageSize: 1000,
    },
  });

  const { data, isLoading } = useOne<IProductDetail, HttpError>({
    resource: "product-details",
    id,
  });

  const [loadingImage, setLoadingImage] = useState(false);
  const imageUrl = Form.useWatch("image", formProps.form);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinishHandler = (values: IProductDetail) => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          const convertedPayload: IProductDetailConvertedPayload[] =
            convertToPayload([values], productId as string);
          onFinish(convertedPayload[0]);
        },
        reject: () => {},
      },
      t: t,
    });
  };

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

  return (
    <Modal
      confirmLoading={isLoading}
      {...modalProps}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
    >
      {contextHolder}
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col span={8}>
            <Form.Item>
              <Form.Item
                name="image"
                initialValue={data?.data.image}
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
                      <Spin spinning={isLoading}>
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
                      </Spin>
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
                      {t("products.fields.images.description")}
                    </Text>
                    <Text style={{ fontSize: "12px" }}>
                      {t("products.fields.images.validation")}
                    </Text>
                  </Space>
                </Upload.Dragger>
              </Form.Item>
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              label={t("productDetails.fields.brand")}
              name={["brand", "id"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select {...brandSelectProps} />
            </Form.Item>

            <Form.Item
              label={t("productDetails.fields.style")}
              name={["style", "id"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select {...styleSelectProps} />
            </Form.Item>

            <Form.Item
              label={t("productDetails.fields.material")}
              name={["material", "id"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select {...materialSelectProps} />
            </Form.Item>

            <Form.Item
              label={t("productDetails.fields.tradeMark")}
              name={["tradeMark", "id"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select {...tradeMarkSelectProps} />
            </Form.Item>

            <Form.Item
              label={t("productDetails.fields.sole")}
              name={["sole", "id"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select {...soleSelectProps} />
            </Form.Item>

            <Form.Item
              label={t("productDetails.fields.color")}
              name={["color", "id"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                {...colorSelectProps}
                options={colorSelectProps.options?.map((item) =>
                  renderColor(item.value as string, item.label as string)
                )}
              />
            </Form.Item>

            <Form.Item
              label={t("productDetails.fields.size")}
              name={["size", "id"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select {...sizeSelectProps} />
            </Form.Item>

            <Form.Item
              label={t("productDetails.fields.price")}
              name="price"
              rules={[
                {
                  validator: (_, value) => validateCommon(_, value, t, "price"),
                },
              ]}
            >
              <InputNumber
                min={1}
                formatter={(value) =>
                  `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: string | undefined) => {
                  const parsedValue = parseInt(
                    value!.replace(/₫\s?|(,*)/g, ""),
                    10
                  );
                  return isNaN(parsedValue) ? 0 : parsedValue;
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label={t("productDetails.fields.quantity")}
              name="quantity"
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "quantity"),
                },
              ]}
            >
              <InputNumber min={1} width={100} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label={t("products.fields.status")}
              initialValue={data?.data.status}
              name="status"
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "status"),
                },
              ]}
            >
              <Select options={PRODUCT_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
