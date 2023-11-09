import { CreateButton, useModalForm } from "@refinedev/antd";
import {
  useApiUrl,
  useCustom,
  useCustomMutation,
  useTranslate,
} from "@refinedev/core";
import {
  Modal,
  Grid,
  List as AntdList,
  Input,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Space,
  Tooltip,
} from "antd";
import { IAddress, ICustomer } from "../../interfaces";
import { useEffect, useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import { CreateAddress } from "./addressModalCreate";
import { EditAddress } from "./addressModalEdit";
import { confirmDialog } from "primereact/confirmdialog";

type AddressModalProps = {
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  customer: ICustomer | undefined;
};

export const AddressModal: React.FC<AddressModalProps> = ({
  open,
  handleOk,
  handleCancel,
  customer,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const api = useApiUrl();
  const [addresses, setAddresses] = useState<IAddress[]>([]);

  const { mutate } = useCustomMutation<IAddress>();

  function handleAddressSetDefault(id: string) {
    confirmDialog({
      message: t("confirmDialog.edit.message"),
      header: t("confirmDialog.edit.header"),
      icon: "pi pi-exclamation-triangle",
      acceptLabel: t("confirmDialog.edit.acceptLabel"),
      rejectLabel: t("confirmDialog.edit.rejectLabel"),
      acceptClassName: "p-button-warning",
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
                  editFormProps.form?.resetFields();
                  editModalShow(id);
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

  const { refetch: refetchAddress } = useCustom<IAddress[]>({
    url: `${api}/addresses`,
    method: "get",
    config: {
      filters: [
        {
          field: "customer",
          operator: "eq",
          value: customer?.id,
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
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    id: editId,
    onFinish: editOnFinish,
    close: editClose,
  } = useModalForm<IAddress>({
    resource: "addresses",
    redirect: false,
    action: "edit",
    onMutationSuccess: () => {
      refetchAddress();
    },
    warnWhenUnsavedChanges: true,
  });

  return (
    <>
      <Modal
        title={t("customers.fields.address")}
        width={breakpoint.sm ? "700px" : "100%"}
        zIndex={1001}
        onOk={handleOk}
        onCancel={handleCancel}
        open={open}
        footer={(_, { OkBtn }) => (
          <>
            <OkBtn />
          </>
        )}
      >
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Row gutter={[16, 24]}>
              <Col span={18}>
                <Input placeholder="Search by keyword" />
              </Col>
              <Col span={6}>
                <CreateButton
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
            />
          </Col>
        </Row>
      </Modal>

      <CreateAddress
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
        customer={customer}
      />
      <EditAddress
        id={editId}
        onFinish={editOnFinish}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </>
  );
};
