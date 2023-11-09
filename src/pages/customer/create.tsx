import {
  IResourceComponentsProps,
  useTranslate,
  useCustom,
  useCreate,
} from "@refinedev/core";
import { Create, getValueFromEvent, useForm } from "@refinedev/antd";
import {
  Form,
  Select,
  Upload,
  Input,
  Typography,
  Space,
  Avatar,
  Row,
  Col,
  message,
  DatePicker,
  Divider,
  InputProps,
  Button,
  Modal,
} from "antd";
import InputMask from "react-input-mask";

import { ICustomer, IProvince, IDistrict, IWard } from "../../interfaces";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import type { UploadChangeParam } from "antd/es/upload";
import { useEffect, useState } from "react";
import QRScanner from "../../components/qrScanner/QRScanner";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const token = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

export const CustomerCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const [loadingImage, setLoadingImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const { mutate } = useCreate();

  const { onFinish, formProps, saveButtonProps, queryResult } =
    useForm<ICustomer>({
      onMutationSuccess: (data, variables, context, isAutoSave) => {
        handleAddressCreate(data.data.id);
      },
    });
  const imageUrl = Form.useWatch("image", formProps.form);

  const [phoneInputValue, setPhoneInputValue] = useState("");

  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);

  const provinceId = Form.useWatch("provinceId", formProps.form);
  const districtId = Form.useWatch("districtId", formProps.form);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const [isScanOpen, setScanOpen] = useState(false);

  const handleScanOpen = () => {
    setScanOpen(!isScanOpen);
    console.log(isScanOpen);
  };

  const handleScanClose = () => {
    setScanOpen(false);
  };

  const qrScanner = isScanOpen ? <QRScanner /> : null;

  const handleOnFinish = (values: any) => {
    onFinish({
      fullName: `${values.fullName}`,
      email: `${values.email}`,
      dateOfBirth: `${values.dateOfBirth.valueOf()}`,
      status: "ACTIVE",
      gender: `${values.gender}`,
      image: `${values.image}`,
    });
  };

  const handleAddressCreate = async (id: string) => {
    try {
      mutate({
        resource: "addresses",
        values: {
          customer: id,
          phoneNumber: formProps.form?.getFieldValue("phoneNumber"),
          districtId: formProps.form?.getFieldValue("districtId"),
          districtName: districtName,
          provinceId: formProps.form?.getFieldValue("provinceId"),
          provinceName: provinceName,
          wardCode: formProps.form?.getFieldValue("wardCode"),
          wardName: wardName,
          more: formProps.form?.getFieldValue("more"),
        },
      });
    } catch (error) {
      console.error("Creation failed", error);
    }
  };

  const { isLoading: isLoadingProvince, refetch: refetchProvince } = useCustom<
    IProvince[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/province`,
    method: "get",
    config: {
      headers: {
        token: token,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        setProvinces(data.data);
      },
    },
  });

  const { isLoading: isLoadingDistrict, refetch: refetchDistrict } = useCustom<
    IDistrict[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/district`,
    method: "get",
    config: {
      headers: {
        token: token,
      },
      query: {
        province_id: provinceId,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        setDistricts(data.data);
      },
    },
  });

  const { isLoading: isLoadingWard, refetch: refetchWard } = useCustom<IWard[]>(
    {
      url: `${GHN_API_BASE_URL}/master-data/ward`,
      method: "get",
      config: {
        headers: {
          token: token,
        },
        query: {
          district_id: districtId,
        },
      },
      queryOptions: {
        enabled: false,
        onSuccess: (data) => {
          setWards(data.data);
        },
      },
    }
  );

  useEffect(() => {
    setProvinces([]);
    refetchProvince();
  }, []);

  useEffect(() => {
    if (provinceId) {
      setDistricts([]);
      refetchDistrict();
    }
  }, [provinceId]);

  useEffect(() => {
    if (districtId) {
      setWards([]);
      refetchWard();
    }
  }, [districtId]);

  const handleProvinceChange = (value: number, option: any) => {
    setProvinceName(option.label);
  };

  const handleDistrictChange = (value: number, option: any) => {
    setDistrictName(option.label);
  };

  const handleWardChange = (value: number, option: any) => {
    setWardName(option.label);
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
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoadingImage(false);
        formProps.form?.setFieldValue("image", url);
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Create
        isLoading={queryResult?.isFetching}
        saveButtonProps={saveButtonProps}
        headerButtons={() => (
          <>
            <Button
              type="primary"
              onClick={() => {
                handleScanOpen();
              }}
            >
              Scan QR Code
            </Button>
          </>
        )}
      >
        <Form
          {...formProps}
          style={{ marginTop: 30 }}
          layout="vertical"
          initialValues={{
            isActive: true,
          }}
          onFinish={handleOnFinish}
        >
          <Row gutter={20}>
            <Col xs={24} lg={8}>
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
                  style={{
                    border: "none",
                    width: "100%",
                    background: "none",
                  }}
                >
                  <Space direction="vertical" size={2}>
                    {imageUrl ? (
                      <Avatar
                        style={{
                          width: "100%",
                          height: "100%",
                          maxWidth: "200px",
                        }}
                        src={imageUrl}
                        alt="User avatar"
                      />
                    ) : (
                      <Avatar
                        style={{
                          width: "100%",
                          height: "100%",
                          maxWidth: "200px",
                        }}
                        src="/images/user-default-img.png"
                        alt="Default avatar"
                      />
                    )}
                    <Text
                      style={{
                        fontWeight: 800,
                        fontSize: "16px",
                        marginTop: "8px",
                      }}
                    >
                      {t("customers.fields.images.description")}
                    </Text>
                    <Text style={{ fontSize: "12px" }}>
                      {t("customers.fields.images.validation")}
                    </Text>
                  </Space>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col xs={24} lg={16}>
              <Row gutter={10}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={t("customers.fields.fullName")}
                    name="fullName"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label={t("customers.fields.email")}
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={t("customers.fields.dateOfBirth")}
                    name="dateOfBirth"
                    rules={[
                      {
                        required: true,
                        type: "date",
                      },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    label={t("customers.fields.gender.label")}
                    name="gender"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      placeholder={t("customers.fields.gender.placeholder")}
                      options={[
                        {
                          label: t("customers.fields.gender.options.male"),
                          value: "Male",
                        },
                        {
                          label: t("customers.fields.gender.options.female"),
                          value: "Female",
                        },
                        {
                          label: t("customers.fields.gender.options.other"),
                          value: "Other",
                        },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Divider orientation="left" style={{ color: "#000000" }}>
                Address
              </Divider>
              <Row gutter={10}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={t("customers.fields.phoneNumber")}
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <InputMask
                      mask="(+84) 999 999 999"
                      value={phoneInputValue}
                      onChange={(e) => setPhoneInputValue(e.target.value)}
                    >
                      {/* 
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore */}
                      {(props: InputProps) => <Input {...props} />}
                    </InputMask>
                  </Form.Item>
                  <Form.Item
                    label={t("customers.fields.province.label")}
                    name="provinceId"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      style={{ width: "100%" }}
                      placeholder={t("customers.fields.province.placeholder")}
                      loading={isLoadingProvince}
                      onChange={handleProvinceChange}
                      filterOption={filterOption}
                      options={provinces.map((province) => ({
                        label: province.ProvinceName,
                        value: province.ProvinceID,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={t("customers.fields.district.label")}
                    name="districtId"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      style={{ width: "100%" }}
                      placeholder={t("customers.fields.district.placeholder")}
                      loading={isLoadingDistrict}
                      onChange={handleDistrictChange}
                      filterOption={filterOption}
                      options={districts.map((district) => ({
                        label: district.DistrictName,
                        value: district.DistrictID,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t("customers.fields.ward.label")}
                    name="wardCode"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      style={{ width: "100%" }}
                      placeholder={t("customers.fields.ward.placeholder")}
                      loading={isLoadingWard}
                      onChange={handleWardChange}
                      filterOption={filterOption}
                      options={wards.map((ward) => ({
                        label: ward.WardName,
                        value: ward.WardCode,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t("customers.fields.more")}
                    name="more"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <TextArea rows={5} placeholder="..." />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
        <Modal
          title="Scan QR Code"
          open={isScanOpen}
          onOk={handleScanClose}
          onCancel={handleScanClose}
        >
          <div>{qrScanner}</div>
        </Modal>
      </Create>
    </>
  );
};
