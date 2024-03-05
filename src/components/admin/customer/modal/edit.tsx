import { getValueFromEvent, useForm } from "@refinedev/antd";
import {
  useCreate,
  useCustom,
  useOne,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import {
  Avatar,
  Col,
  DatePicker,
  Divider,
  Form,
  Grid,
  Input,
  Modal,
  ModalProps,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import Upload, {
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import {
  getUserGenderOptions,
  getUserStatusOptions,
} from "../../../../constants";
import {
  ICustomer,
  IDistrict,
  IProvince,
  IWard,
} from "../../../../pages/interfaces";
import { getBase64Image, showWarningConfirmDialog } from "../../../../utils";
import {
  validateCommon,
  validateEmail,
  validateFullName,
  validatePhoneNumber,
} from "../../../../helpers/validate";

const { Text } = Typography;
const { TextArea } = Input;

type EditCustomerModalProps = {
  modalProps: ModalProps;
  id: string;
  close: () => void;
  callBack: any;
};

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const token = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  modalProps,
  callBack,
  close,
  id,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { mutate: mutateUpdate } = useUpdate();
  const { mutate: mutateCreate } = useCreate();

  const { onFinish, formProps, saveButtonProps, queryResult } =
    useForm<ICustomer>({
      resource: "customers",
      action: "edit",
      id: id,
      redirect: false,
      onMutationSuccess: (data: any) => {
        handleAddress(data.data.content.id);
        close();
        callBack();
      },
    });

  const [loadingImage, setLoadingImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const imageUrl = Form.useWatch("image", formProps.form);

  const [phoneInputValue, setPhoneInputValue] = useState("");

  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);

  const [addressId, setAddressId] = useState<string>("");
  const provinceId = Form.useWatch("provinceId", formProps.form);
  const districtId = Form.useWatch("districtId", formProps.form);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const { data } = useOne<ICustomer>({
    resource: "customers",
    id: id,
  });

  useEffect(() => {
    try {
      if (data) {
        formProps.form?.setFieldValue(
          "dob",
          dayjs(new Date(data.data.dateOfBirth))
        );
        formProps.form?.setFieldValue("fullName", data.data.fullName);
        formProps.form?.setFieldValue("email", data.data.email);
        formProps.form?.setFieldValue("gender", data.data.gender);
        formProps.form?.setFieldValue("status", data.data.status);
        formProps.form?.setFieldValue("image", data.data.image);
        const defaultAddress = data.data.addressList.find(
          (address) => address.isDefault === true
        );

        if (defaultAddress) {
          setAddressId(defaultAddress.id);
          formProps.form?.setFieldsValue({
            phoneNumber: defaultAddress.phoneNumber,
            provinceId: Number(defaultAddress.provinceId),
            districtId: Number(defaultAddress.districtId),
            wardCode: defaultAddress.wardCode,
            more: defaultAddress.more,
          });
          setProvinceName(defaultAddress.provinceName);
          setDistrictName(defaultAddress.districtName);
          setWardName(defaultAddress.wardName);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [data]);

  const handleOnFinish = (values: any) => {
    const submitData = {
      fullName: `${values.fullName}`,
      email: `${values.email}`,
      dateOfBirth: `${values.dob.valueOf()}`,
      status: values.status,
      gender: `${values.gender}`,
      image: `${values.image}`,
    };
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(submitData);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  const handleAddress = async (id: string) => {
    try {
      if (addressId) {
        console.log(districtName);
        console.log(provinceName);
        console.log(wardName);
        mutateUpdate({
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
          id: addressId,
        });
      } else {
        mutateCreate({
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
      }
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
      onSuccess: (data: any) => {
        setProvinces(data.response.data);
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
      onSuccess: (data: any) => {
        setDistricts(data.response.data);
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
        onSuccess: (data: any) => {
          setWards(data.response.data);
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
      getBase64Image(info.file.originFileObj as RcFile, (url) => {
        setLoadingImage(false);
        formProps.form?.setFieldValue("image", url);
      });
    }
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
      okButtonProps={saveButtonProps}
      confirmLoading={queryResult?.isFetching}
    >
      {contextHolder}
      <Form
        {...formProps}
        style={{ marginTop: 30 }}
        layout="vertical"
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
                      validator: validateFullName,
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
                      validator: validateEmail,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={t("customers.fields.dateOfBirth")}
                  name="dob"
                  rules={[
                    {
                      validator: (_, value) =>
                        validateCommon(_, value, t, "dateOfBirth"),
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Row gutter={10}>
                  <Col span={12}>
                    <Form.Item
                      label={t("customers.fields.gender.label")}
                      name="gender"
                      rules={[
                        {
                          validator: (_, value) =>
                            validateCommon(_, value, t, "gender"),
                        },
                      ]}
                    >
                      <Select
                        placeholder={t("customers.fields.gender.placeholder")}
                        options={getUserGenderOptions(t)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t("customers.fields.status")}
                      name="status"
                      rules={[
                        {
                          validator: (_, value) =>
                            validateCommon(_, value, t, "status"),
                        },
                      ]}
                    >
                      <Select
                        placeholder={t("customers.fields.status.placeholder")}
                        options={getUserStatusOptions(t)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Divider orientation="left" style={{ color: "#000000" }}>
              {t("customers.fields.address")}
            </Divider>
            <Row gutter={10}>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={t("customers.fields.phoneNumber")}
                  name="phoneNumber"
                  rules={[
                    {
                      validator: validatePhoneNumber,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={t("customers.fields.province.label")}
                  name="provinceId"
                  rules={[
                    {
                      validator: (_, value) =>
                        validateCommon(_, value, t, "provinceId"),
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
                      validator: (_, value) =>
                        validateCommon(_, value, t, "districtId"),
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
                      validator: (_, value) =>
                        validateCommon(_, value, t, "wardCode"),
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
                      validator: (_, value) =>
                        validateCommon(_, value, t, "more"),
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
    </Modal>
  );
};
