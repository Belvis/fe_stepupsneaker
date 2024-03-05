import { EditOutlined } from "@ant-design/icons";
import { CreateButton, useModal, useModalForm } from "@refinedev/antd";
import {
  useApiUrl,
  useCustom,
  useCustomMutation,
  useTranslate,
} from "@refinedev/core";
import {
  List as AntdList,
  Button,
  Col,
  Grid,
  Input,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { IAddress, ICustomer, IOrder } from "../../../../pages/interfaces";
import { showWarningConfirmDialog } from "../../../../utils";
import { CreateAddress } from "./create";
import { EditAddress } from "./edit";
import _ from "lodash";

type AddressModalProps = {
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  customer: ICustomer | undefined;
  setAddresses?: (order: IOrder) => void;
  order?: IOrder;
};

export const AddressModal: React.FC<AddressModalProps> = ({
  open,
  handleOk,
  handleCancel,
  customer,
  order,
  setAddresses: setViewAddress,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const api = useApiUrl();
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [value, setValue] = useState<string>();

  const { mutate } = useCustomMutation<IAddress>();

  function handleAddressSetDefault(id: string) {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          mutate(
            {
              url: `${api}/addresses/set-default-address?address=${id}`,
              method: "put",
              values: {
                address: id,
              },
              successNotification: (data, values) => {
                return {
                  message: `Successfully set default.`,
                  description: "Success with no errors",
                  type: "success",
                };
              },
              errorNotification: (data, values) => {
                return {
                  message: `Something went wrong when setting default address`,
                  description: "Error",
                  type: "error",
                };
              },
            },
            {
              onSuccess: (data, variables, context) => {
                refetchAddress();
              },
            }
          );
        },
        reject: () => {},
      },
      t: t,
    });
  }

  function renderItem(item: IAddress) {
    const {
      id,
      provinceName,
      districtName,
      wardName,
      more,
      customerResponse,
      phoneNumber,
      isDefault,
      provinceId,
      districtId,
      wardCode,
    } = item;
    const defaultTag = isDefault ? <Tag color="green">Default</Tag> : null;

    return (
      <AntdList.Item
        actions={[
          <Space size="small" key={id}>
            <Tooltip title={t("actions.edit")}>
              <Button
                style={{ color: "#52c41a", borderColor: "#52c41a" }}
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedAddressId(item.id);
                  showEdit();
                }}
              />
            </Tooltip>
            <Button
              disabled={isDefault}
              size="small"
              onClick={() => {
                handleAddressSetDefault(id);
              }}
            >
              {t("actions.setDefault")}
            </Button>

            {setViewAddress && order && (
              <Button
                size="small"
                onClick={() => {
                  const newOrder = _.cloneDeep({
                    ...order,
                    phoneNumber: phoneNumber,
                    address: {
                      ...order.address,
                      phoneNumber: phoneNumber,
                      provinceName: provinceName,
                      districtName: districtName,
                      wardName: wardName,
                      provinceId: provinceId,
                      districtId: districtId,
                      wardCode: wardCode,
                      more: more,
                    },
                  });
                  setViewAddress(newOrder);
                  handleCancel();
                }}
              >
                Chọn
              </Button>
            )}
          </Space>,
        ]}
      >
        <AntdList.Item.Meta
          title={
            <>
              {customer?.fullName} | {phoneNumber} {defaultTag}
            </>
          }
          description={`${more}, ${wardName}, ${districtName}, ${provinceName}`}
        />
      </AntdList.Item>
    );
  }

  const { refetch: refetchAddress, isLoading } = useCustom<IAddress[]>({
    url: `${api}/addresses`,
    method: "get",
    config: {
      filters: [
        {
          field: "customer",
          operator: "eq",
          value: customer?.id,
        },
        {
          field: "q",
          operator: "eq",
          value: value,
        },
      ],
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        const response = data.response.content.data;
        setAddresses(response);
      },
    },
  });

  useEffect(() => {
    refetchAddress();
  }, [value]);

  useEffect(() => {
    if (open) {
      setAddresses([]);
      refetchAddress();
    }
  }, [open]);

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<IAddress>({
    resource: "addresses",
    onMutationSuccess: () => {
      createFormProps.form?.resetFields();
      refetchAddress();
    },
    action: "create",
    redirect: false,
    warnWhenUnsavedChanges: true,
  });

  const {
    show: showEdit,
    close: closeEdit,
    modalProps: editModalProps,
  } = useModal();

  return (
    <Modal
      title={t("customers.fields.address")}
      width={breakpoint.sm ? "700px" : "100%"}
      zIndex={1001}
      onOk={handleOk}
      onCancel={handleCancel}
      open={open}
      footer={(_, { OkBtn }) => <></>}
    >
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Row gutter={[16, 24]}>
            <Col span={18}>
              <Input
                placeholder="Search by keyword"
                onChange={debounce((event) => {
                  setValue(event.target.value);
                }, 300)}
              />
            </Col>
            <Col span={6}>
              <CreateButton
                style={{ width: "100%" }}
                onClick={() => {
                  createFormProps.form?.resetFields();
                  createModalShow();
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <AntdList
            bordered
            itemLayout="horizontal"
            dataSource={addresses}
            renderItem={renderItem}
            loading={isLoading}
          />
        </Col>
      </Row>
      <CreateAddress
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
        customer={customer}
      />
      <EditAddress
        addressId={selectedAddressId}
        modalProps={editModalProps}
        callBack={refetchAddress}
      />
    </Modal>
  );
};
