import { Action, IResourceItem, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  ThemedTitleV2,
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
  AppIcon,
  ColorIcon,
  MaterialIcon,
  ProductIcon,
  SizeIcon,
  SoleIcon,
  StyleIcon,
  TradeMarkIcon,
} from "./components";
import { ColorModeContextProvider } from "./contexts/color-mode";

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
  CustomerCreate,
  CustomerEdit,
  CustomerList,
  CustomerShow,
} from "./pages/customers";
import { EmployeeCreate, EmployeeEdit, EmployeeList } from "./pages/employees";
import { OrderList, OrderShow } from "./pages/orders";
import { PaymentMethodList } from "./pages/paymentMethods";
import { PaymentList } from "./pages/payments";
import { PointOfSales } from "./pages/pos";
import { BrandList } from "./pages/product/brands";
import { ColorList } from "./pages/product/colors";
import { MaterialList } from "./pages/product/material";
import {
  ProductCreate,
  ProductList,
  ProductShow,
} from "./pages/product/products";
import { SizeList } from "./pages/product/sizes";
import { SoleList } from "./pages/product/soles";
import { StyleList } from "./pages/product/styles";
import { TradeMarkList } from "./pages/product/tradeMark";
import { RoleList } from "./pages/roles";
import { VoucherCreate, VoucherEdit, VoucherList } from "./pages/vouchers";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
// const API_BASE_URL = import.meta.env.VITE_BACKEND_API_LOCAL_BASE_URL;

const capitalizeFirstLetter = (inputString: string): string => {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
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
    const resourceName = capitalizeFirstLetter(resource.name).slice(0, -1);
    switch (action) {
      case "list":
        return `${resourceName} | SUNS`;
      case "edit":
        return `Edit ${resourceName} | SUNS`;
      case "show":
        return `Show ${resourceName} | SUNS`;
      case "create":
        return `Create new ${resourceName} | SUNS`;
      case "clone":
        return `Clone ${resourceName} | SUNS`;
      default:
        return "SUNS";
    }
  } else {
    return "SUNS";
  }
};

function App() {
  const { t, i18n } = useTranslation();

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
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
                  name: "dashboards",
                  list: "/",
                  meta: {
                    label: t("dashboard.title"),
                    icon: <DashboardOutlined />,
                  },
                },
                {
                  name: "Point Of Sales",
                  list: "/point-of-sales",
                  meta: {
                    label: t("pos.title"),
                    icon: <PointOfSaleIcon />,
                  },
                },
                {
                  name: "orders",
                  list: "/orders",
                  show: "/orders/show/:id",
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
                  list: "/shop/products",
                  create: "/shop/products/create",
                  edit: "/shop/products/edit/:id",
                  show: "/shop/products/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <ProductIcon />,
                  },
                },
                {
                  name: "colors",
                  list: "/shop/colors",
                  create: "/shop/colors/create",
                  edit: "/shop/colors/edit/:id",
                  show: "/shop/colors/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <ColorIcon />,
                  },
                },
                {
                  name: "brands",
                  list: "/shop/brands",
                  create: "/shop/brands/create",
                  edit: "/shop/brands/edit/:id",
                  show: "/shop/brands/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <TagsOutlined />,
                  },
                },
                {
                  name: "styles",
                  list: "/shop/styles",
                  create: "/shop/styles/create",
                  edit: "/shop/styles/edit/:id",
                  show: "/shop/styles/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <StyleIcon />,
                  },
                },
                {
                  name: "materials",
                  list: "/shop/materials",
                  create: "/shop/materials/create",
                  edit: "/shop/materials/edit/:id",
                  show: "/shop/materials/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <MaterialIcon />,
                  },
                },
                {
                  name: "sizes",
                  list: "/shop/sizes",
                  create: "/shop/sizes/create",
                  edit: "/shop/sizes/edit/:id",
                  show: "/shop/sizes/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <SizeIcon />,
                  },
                },
                {
                  name: "trade-marks",
                  list: "/shop/trade-marks",
                  create: "/shop/trade-marks/create",
                  edit: "/shop/trade-marks/edit/:id",
                  show: "/shop/trade-marks/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <TradeMarkIcon />,
                  },
                },
                {
                  name: "soles",
                  list: "/shop/soles",
                  create: "/shop/soles/create",
                  edit: "/shop/soles/edit/:id",
                  show: "/shop/soles/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <SoleIcon />,
                  },
                },
                {
                  name: "vouchers",
                  list: "/vouchers",
                  create: "/vouchers/create",
                  edit: "/vouchers/edit/:id",
                  show: "/vouchers/show/:id",
                  meta: {
                    icon: <DollarOutlined />,
                  },
                },
                {
                  name: "customers",
                  list: "/customers",
                  create: "/customers/create",
                  edit: "/customers/edit/:id",
                  show: "/customers/show/:id",
                  meta: {
                    icon: <TeamOutlined />,
                  },
                },
                {
                  name: "employees",
                  list: "/employees",
                  create: "/employees/create",
                  edit: "/employees/edit/:id",
                  show: "/employees/show/:id",
                  meta: {
                    icon: <ApartmentOutlined />,
                  },
                },
                {
                  name: "roles",
                  list: "/roles",
                  create: "/roles/create",
                  edit: "/roles/edit/:id",
                  show: "/roles/show/:id",
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
                  list: "/transaction/payments",
                  create: "/transaction/payments/create",
                  edit: "/transaction/payments/edit/:id",
                  show: "/transaction/payments/show/:id",
                  meta: {
                    parent: "Transactions",
                    icon: <ReadOutlined />,
                  },
                },
                {
                  name: "payment-methods",
                  list: "/transaction/payment-methods",
                  create: "/transaction/payment-methods/create",
                  edit: "/transaction/payment-methods/edit/:id",
                  show: "/transaction/payment-methods/show/:id",
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
                  element={
                    <ThemedLayoutV2
                      Header={() => <AdminHeader sticky />}
                      // Warning: [antd: Menu] `children` is deprecated. Please use `items` instead.
                      // To do: customized sider
                      Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                      Title={({ collapsed }) => (
                        <ThemedTitleV2
                          collapsed={collapsed}
                          text="SUNSneaker"
                          icon={<AppIcon />}
                        />
                      )}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  }
                >
                  <Route path="/orders">
                    <Route index element={<OrderList />} />
                    <Route path="show/:id" element={<OrderShow />} />
                  </Route>

                  <Route path="/shop">
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
                  <Route path="customers">
                    <Route index element={<CustomerList />} />
                    <Route path="create" element={<CustomerCreate />} />
                    <Route path="edit/:id" element={<CustomerEdit />} />
                    <Route path="show/:id" element={<CustomerShow />} />
                  </Route>
                  <Route path="vouchers">
                    <Route index element={<VoucherList />} />
                    <Route path="create" element={<VoucherCreate />} />
                    <Route path="edit/:id" element={<VoucherEdit />} />
                  </Route>
                  <Route path="employees">
                    <Route index element={<EmployeeList />} />
                    <Route path="create" element={<EmployeeCreate />} />
                    <Route path="edit/:id" element={<EmployeeEdit />} />
                  </Route>
                  <Route path="roles">
                    <Route index element={<RoleList />} />
                  </Route>
                  <Route path="/transaction">
                    <Route path="payments">
                      <Route index element={<PaymentList />} />
                    </Route>
                    <Route path="payment-methods">
                      <Route index element={<PaymentMethodList />} />
                    </Route>
                  </Route>

                  <Route path="/point-of-sales">
                    <Route index element={<PointOfSales />} />
                  </Route>

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
