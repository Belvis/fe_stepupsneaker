import { Action, IResourceItem, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { App as AntdApp } from "antd";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { dataProvider } from "./api/dataProvider";
import {
  AdminHeader,
  ColorIcon,
  DiscountOrderIcon,
  DiscountProductIcon,
  MaterialIcon,
  ProductIcon,
  SizeIcon,
  SoleIcon,
  StyleIcon,
  ThemedTitleV2,
  TradeMarkIcon,
} from "./components";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { DashboardContextProvider } from "./contexts/admin/dashboard";

// Icons

import {
  ApartmentOutlined,
  DashboardOutlined,
  DollarOutlined,
  ForkOutlined,
  ReadOutlined,
  SafetyOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TagsOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";

// Pages

import { PointOfSaleIcon } from "./components/icons/icon-pos";
import {
  BrandList,
  ColorList,
  CustomerCreate,
  CustomerEdit,
  CustomerList,
  CustomerShow,
  EmployeeCreate,
  EmployeeEdit,
  EmployeeList,
  MaterialList,
  OrderList,
  OrderShow,
  PaymentList,
  PaymentMethodList,
  PointOfSales,
  ProductCreate,
  ProductList,
  ProductShow,
  RoleList,
  SizeList,
  SoleList,
  StyleList,
  TradeMarkList,
  VoucherCreate,
  VoucherEdit,
  VoucherList,
  DashboardPage,
} from "./pages/admin";

// const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_LOCAL_BASE_URL;

function App() {
  const { t, i18n } = useTranslation();

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  const titleHandler = ({
    resource,
    action,
    params,
  }: {
    resource?: IResourceItem;
    action?: Action;
    params?: Record<string, string | undefined>;
  }): string => {
    if (resource && action && params) {
      const resourceName = resource.name;
      switch (action) {
        case "list":
          return `${t(`${resourceName}.${resourceName}`)} | SUNS`;
        case "edit":
          return `${t(`actions.edit`)} ${t(
            `${resourceName}.${resourceName}`
          )} | SUNS`;
        case "show":
          return `${t(`actions.show`)} ${t(
            `${resourceName}.${resourceName}`
          )} | SUNS`;
        case "create":
          return `${t(`actions.create`)} ${t(
            `${resourceName}.${resourceName}`
          )} | SUNS`;
        case "clone":
          return `${t(`actions.clone`)} ${t(
            `${resourceName}.${resourceName}`
          )} | SUNS`;
        default:
          return "SUNS";
      }
    } else {
      return "SUNS";
    }
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <ConfirmDialog />
            <Refine
              dataProvider={dataProvider(API_BASE_URL)}
              notificationProvider={useNotificationProvider}
              i18nProvider={i18nProvider}
              routerProvider={routerBindings}
              resources={[
                {
                  name: "dashboard",
                  list: "/admin",
                  meta: {
                    label: t("dashboard.title"),
                    icon: <DashboardOutlined />,
                  },
                },
                {
                  name: "pos",
                  list: "admin/point-of-sales",
                  meta: {
                    label: t("pos.title"),
                    icon: <PointOfSaleIcon />,
                  },
                },
                {
                  name: "orders",
                  list: "admin/orders",
                  show: "admin/orders/show/:id",
                  meta: {
                    icon: <ShoppingOutlined />,
                  },
                },
                {
                  name: "Shop entities",
                  meta: {
                    label: t("shop.title"),
                    icon: <ShopOutlined />,
                  },
                },
                {
                  name: "products",
                  list: "admin/shop/products",
                  create: "admin/shop/products/create",
                  edit: "admin/shop/products/edit/:id",
                  show: "admin/shop/products/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <ProductIcon />,
                  },
                },
                {
                  name: "colors",
                  list: "admin/shop/colors",
                  create: "admin/shop/colors/create",
                  edit: "admin/shop/colors/edit/:id",
                  show: "admin/shop/colors/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <ColorIcon />,
                  },
                },
                {
                  name: "brands",
                  list: "admin/shop/brands",
                  create: "admin/shop/brands/create",
                  edit: "admin/shop/brands/edit/:id",
                  show: "admin/shop/brands/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <TagsOutlined />,
                  },
                },
                {
                  name: "styles",
                  list: "admin/shop/styles",
                  create: "admin/shop/styles/create",
                  edit: "admin/shop/styles/edit/:id",
                  show: "admin/shop/styles/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <StyleIcon />,
                  },
                },
                {
                  name: "materials",
                  list: "admin/shop/materials",
                  create: "admin/shop/materials/create",
                  edit: "admin/shop/materials/edit/:id",
                  show: "admin/shop/materials/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <MaterialIcon />,
                  },
                },
                {
                  name: "sizes",
                  list: "admin/shop/sizes",
                  create: "admin/shop/sizes/create",
                  edit: "admin/shop/sizes/edit/:id",
                  show: "admin/shop/sizes/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <SizeIcon />,
                  },
                },
                {
                  name: "trade-marks",
                  list: "admin/shop/trade-marks",
                  create: "admin/shop/trade-marks/create",
                  edit: "admin/shop/trade-marks/edit/:id",
                  show: "admin/shop/trade-marks/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <TradeMarkIcon />,
                  },
                },
                {
                  name: "soles",
                  list: "admin/shop/soles",
                  create: "admin/shop/soles/create",
                  edit: "admin/shop/soles/edit/:id",
                  show: "admin/shop/soles/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <SoleIcon />,
                  },
                },
                {
                  name: "discount",
                  meta: {
                    label: t("discount.title"),
                    icon: <DollarOutlined />,
                  },
                },
                {
                  name: "vouchers",
                  list: "admin/vouchers",
                  create: "admin/vouchers/create",
                  edit: "admin/vouchers/edit/:id",
                  show: "admin/vouchers/show/:id",
                  meta: {
                    parent: "discount",
                    icon: <DiscountOrderIcon />,
                  },
                },
                {
                  name: "unknown",
                  list: "/unknown",
                  create: "/unknown/create",
                  edit: "/unknown/edit/:id",
                  show: "/unknown/show/:id",
                  meta: {
                    parent: "discount",
                    icon: <DiscountProductIcon />,
                  },
                },
                {
                  name: "customers",
                  list: "admin/customers",
                  create: "admin/customers/create",
                  edit: "admin/customers/edit/:id",
                  show: "admin/customers/show/:id",
                  meta: {
                    icon: <TeamOutlined />,
                  },
                },
                {
                  name: "employees",
                  list: "admin/employees",
                  create: "admin/employees/create",
                  edit: "admin/employees/edit/:id",
                  show: "admin/employees/show/:id",
                  meta: {
                    icon: <ApartmentOutlined />,
                  },
                },
                {
                  name: "roles",
                  list: "admin/roles",
                  create: "admin/roles/create",
                  edit: "admin/roles/edit/:id",
                  show: "admin/roles/show/:id",
                  meta: {
                    icon: <SafetyOutlined />,
                  },
                },
                {
                  name: "Transactions",
                  meta: {
                    label: t("transactions.title"),
                    icon: <WalletOutlined />,
                  },
                },
                {
                  name: "payments",
                  list: "admin/transaction/payments",
                  create: "admin/transaction/payments/create",
                  edit: "admin/transaction/payments/edit/:id",
                  show: "admin/transaction/payments/show/:id",
                  meta: {
                    parent: "Transactions",
                    icon: <ReadOutlined />,
                  },
                },
                {
                  name: "payment-methods",
                  list: "admin/transaction/payment-methods",
                  create: "admin/transaction/payment-methods/create",
                  edit: "admin/transaction/payment-methods/edit/:id",
                  show: "admin/transaction/payment-methods/show/:id",
                  meta: {
                    parent: "Transactions",
                    icon: <ForkOutlined />,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "w0HqFF-uDUAxj-x2TmsR",
              }}
            >
              <Routes>
                <Route
                  path="/admin"
                  element={
                    <ThemedLayoutV2
                      Header={() => <AdminHeader sticky />}
                      // Warning: [antd: Menu] `children` is deprecated. Please use `items` instead.
                      // To do: customized sider
                      Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                      Title={({ collapsed }) => (
                        <ThemedTitleV2 collapsed={collapsed} />
                      )}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  }
                >
                  <Route
                    index
                    element={
                      <DashboardContextProvider>
                        <DashboardPage />
                      </DashboardContextProvider>
                    }
                  />

                  <Route path="/admin/orders">
                    <Route index element={<OrderList />} />
                    <Route path="show/:id" element={<OrderShow />} />
                  </Route>

                  <Route path="/admin/shop">
                    <Route path="products">
                      <Route index element={<ProductList />} />
                      <Route path="create" element={<ProductCreate />} />
                      <Route path="show/:id" element={<ProductShow />} />
                    </Route>
                    <Route path="colors">
                      <Route index element={<ColorList />} />
                    </Route>
                    <Route path="brands">
                      <Route index element={<BrandList />} />
                    </Route>
                    <Route path="styles">
                      <Route index element={<StyleList />} />
                    </Route>
                    <Route path="materials">
                      <Route index element={<MaterialList />} />
                    </Route>
                    <Route path="sizes">
                      <Route index element={<SizeList />} />
                    </Route>
                    <Route path="soles">
                      <Route index element={<SoleList />} />
                    </Route>
                    <Route path="trade-marks">
                      <Route index element={<TradeMarkList />} />
                    </Route>
                  </Route>
                  <Route path="/admin/customers">
                    <Route index element={<CustomerList />} />
                    <Route path="create" element={<CustomerCreate />} />
                    <Route path="edit/:id" element={<CustomerEdit />} />
                    <Route path="show/:id" element={<CustomerShow />} />
                  </Route>
                  <Route path="/admin/vouchers">
                    <Route index element={<VoucherList />} />
                    <Route path="create" element={<VoucherCreate />} />
                    <Route path="edit/:id" element={<VoucherEdit />} />
                  </Route>
                  <Route path="/admin/employees">
                    <Route index element={<EmployeeList />} />
                    <Route path="create" element={<EmployeeCreate />} />
                    <Route path="edit/:id" element={<EmployeeEdit />} />
                  </Route>
                  <Route path="/admin/roles">
                    <Route index element={<RoleList />} />
                  </Route>
                  <Route path="/admin/transaction">
                    <Route path="payments">
                      <Route index element={<PaymentList />} />
                    </Route>
                    <Route path="payment-methods">
                      <Route index element={<PaymentMethodList />} />
                    </Route>
                  </Route>

                  <Route path="/admin/point-of-sales">
                    <Route index element={<PointOfSales />} />
                  </Route>

                  <Route path="*" element={<ErrorComponent />} />
                </Route>
                <Route>
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler handler={titleHandler} />
            </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
