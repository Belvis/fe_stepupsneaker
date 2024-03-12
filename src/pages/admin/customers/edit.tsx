import { Edit, getValueFromEvent, useForm } from "@refinedev/antd";
import {
  IResourceComponentsProps,
  useCreate,
  useCustom,
  useOne,
  useParsed,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import {
  Avatar,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputProps,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import InputMask from "react-input-mask";

import {
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ICustomer, IDistrict, IProvince, IWard } from "../../../interfaces";
import { getUserGenderOptions, getUserStatusOptions } from "../../../constants";
import { getBase64Image, showWarningConfirmDialog } from "../../../utils";
import {
  validateCommon,
  validateEmail,
  validateFullName,
  validatePhoneNumber,
} from "../../../helpers/validate";

const { Text } = Typography;
const { TextArea } = Input;

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const token = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

export const CustomerEdit: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const [messageApi, contextHolder] = message.useMessage();
  const [loadingImage, setLoadingImage] = useState(false);

  const { mutate: mutateUpdate } = useUpdate();
  const { mutate: mutateCreate } = useCreate();

  const { onFinish, formProps, saveButtonProps, queryResult } =
    useForm<ICustomer>({
      onMutationSuccess: (data: any) => {
        handleAddress(data.data.content.id);
      },
    });
  const imageUrl = Form.useWatch("image", formProps.form);
  const provinceId = Form.useWatch("provinceId", formProps.form);
  const districtId = Form.useWatch("districtId", formProps.form);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const [addressId, setAddressId] = useState<string>("");
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);

  const { id } = useParsed();

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

  const handleAddress = async (id: string) => {
    try {
      if (addressId) {
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
    <>
      {contextHolder}
      <Edit
        isLoading={queryResult?.isFetching}
        saveButtonProps={saveButtonProps}
      >
        <Form
          {...formProps}
          layout="vertical"
          initialValues={{
            isActive: true,
            ...formProps.initialValues,
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
                    label={
                      <div>
                        <span>{t("customers.fields.fullName")}</span>
                        <span className="sub-label">(Tối đa 255 ký tự)</span>
                      </div>
                    }
                    required
                    name="fullName"
                    rules={[
                      {
                        validator: validateFullName,
                      },
                    ]}
                  >
                    <Input maxLength={255} showCount />
                  </Form.Item>
                  <Form.Item
                    label={
                      <div>
                        <span>{t("customers.fields.email")}</span>
                        <span className="sub-label">(Tối đa 255 ký tự)</span>
                      </div>
                    }
                    required
                    name="email"
                    rules={[
                      {
                        validator: validateEmail,
                      },
                    ]}
                  >
                    <Input maxLength={50} showCount />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={t("customers.fields.dateOfBirth")}
                    required
                    name="dob"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "dateOfBirth"),
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      disabledDate={(current) => {
                        const tenYearsAgo = dayjs().subtract(10, "year");
                        const hundredYearsAgo = dayjs().subtract(100, "year");

                        return (
                          current &&
                          (current > tenYearsAgo || current < hundredYearsAgo)
                        );
                      }}
                    />
                  </Form.Item>
                  <Row gutter={10}>
                    <Col span={12}>
                      <Form.Item
                        label={t("customers.fields.gender.label")}
                        name="gender"
                        required
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
                        required
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
                    label={
                      <div>
                        <span>{t("customers.fields.phoneNumber")}</span>
                        <span className="sub-label">(Tối đa 10 ký tự)</span>
                      </div>
                    }
                    required
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
                    required
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
                    required
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
                    required
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
                    label={
                      <div>
                        <span>{t("customers.fields.more")}</span>
                        <span className="sub-label">(Tối đa 500 ký tự)</span>
                      </div>
                    }
                    required
                    name="more"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "provinceId"),
                      },
                    ]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="..."
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Edit>
    </>
  );
};
