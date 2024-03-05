import { useTranslate } from "@refinedev/core";
import {
  Modal,
  ModalProps,
  Form,
  FormProps,
  Input,
  Select,
  Grid,
  Upload,
  Space,
  Avatar,
  Typography,
  message,
  Row,
  Col,
} from "antd";
import { useState } from "react";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import type { UploadChangeParam } from "antd/es/upload";
import { getValueFromEvent } from "@refinedev/antd";
import { IProduct } from "../../../../pages/interfaces";
import { getBase64Image } from "../../../../utils";
import { validateCommon } from "../../../../helpers/validate";
const { TextArea } = Input;
const { Text } = Typography;

type CreateProductProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const CreateProduct: React.FC<CreateProductProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const [loadingImage, setLoadingImage] = useState(false);
  const imageUrl = Form.useWatch("image", formProps.form);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinishHandler = (values: IProduct) => {
    const submitData = {
      ...values,
      status: "ACTIVE",
    };
    onFinish(submitData);
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
    <>
      {contextHolder}
      <Modal
        {...modalProps}
        width={breakpoint.sm ? "1000px" : "100%"}
        zIndex={1001}
      >
        <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={8}>
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
                      {t("products.fields.images.description")}
                    </Text>
                    <Text style={{ fontSize: "12px" }}>
                      {t("products.fields.images.validation")}
                    </Text>
                  </Space>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label={t("products.fields.code")}
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
                name="name"
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "name"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t("products.fields.description")}
                name="description"
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "description"),
                  },
                ]}
              >
                <TextArea rows={5} placeholder="..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
