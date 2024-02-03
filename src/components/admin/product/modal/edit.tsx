import { getValueFromEvent } from "@refinedev/antd";
import { HttpError, useOne, useTranslate } from "@refinedev/core";
import {
  Avatar,
  Col,
  Form,
  FormProps,
  Grid,
  Input,
  Modal,
  ModalProps,
  Row,
  Select,
  Space,
  Spin,
  Typography,
  Upload,
  message,
} from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { useState } from "react";
import { PRODUCT_STATUS_OPTIONS } from "../../../../constants";
import { IProduct } from "../../../../interfaces";
import { getBase64Image, showWarningConfirmDialog } from "../../../../utils";
const { TextArea } = Input;
const { Text } = Typography;

type EditProductProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
};

export const EditProduct: React.FC<EditProductProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { data, isLoading } = useOne<IProduct, HttpError>({
    resource: "products",
    id,
  });

  const [loadingImage, setLoadingImage] = useState(false);
  const imageUrl = Form.useWatch("image", formProps.form);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinishHandler = (values: any) => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(values);
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
              label={t("products.fields.code")}
              initialValue={data?.data.code}
              name="code"
              rules={[
                {
                  whitespace: true,
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={t("products.fields.name")}
              initialValue={data?.data.name}
              name="name"
              rules={[
                {
                  whitespace: true,
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={t("products.fields.description")}
              initialValue={data?.data.description}
              name="description"
              rules={[
                {
                  whitespace: true,
                  required: true,
                },
              ]}
            >
              <TextArea rows={5} placeholder="..." />
            </Form.Item>
            <Form.Item
              label={t("products.fields.status")}
              initialValue={data?.data.status}
              name="status"
              rules={[
                {
                  required: true,
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
