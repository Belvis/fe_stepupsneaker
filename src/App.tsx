import { Action, IResourceItem, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
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
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { dataProvider } from "./api/dataProvider";
import { App as AntdApp, Layout, message } from "antd";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AppIcon } from "./components/app-icon";
import { AdminHeader } from "./components/admin/header";
import { PosHeader } from "./components/pos/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { ConfirmDialog } from "primereact/confirmdialog";

// Icons

import {
  ShoppingOutlined,
  DashboardOutlined,
  LineOutlined,
  TeamOutlined,
  ContactsOutlined,
  ShopOutlined,
  DollarOutlined,
  TagsOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  SafetyOutlined,
  WalletOutlined,
  ReadOutlined,
  ForkOutlined,
} from "@ant-design/icons";

// Pages

import { ColorList } from "./pages/colors";
import { BrandList } from "./pages/brands";
import { StyleList } from "./pages/styles";
import { MaterialList } from "./pages/material";
import { SizeList } from "./pages/sizes";
import { SoleList } from "./pages/soles";
import { TradeMarkList } from "./pages/tradeMark";
import { ProductList, ProductCreate, ProductShow } from "./pages/products";
import { CustomerList, CustomerCreate, CustomerEdit } from "./pages/customer";
import { VoucherEdit, VoucherList, VoucherCreate } from "./pages/vouchers";
import { PointOfSales } from "./pages/pos";
import { OrderList, OrderShow } from "./pages/orders";
import { EmployeeCreate, EmployeeEdit, EmployeeList } from "./pages/employees";
import { RoleList } from "./pages/roles";
import { PaymentMethodList } from "./pages/paymentMethods";
import { PaymentList } from "./pages/payments";

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
        return `#${params.id} Edit ${resourceName} | SUNS`;
      case "show":
        return `#${params.id} Show ${resourceName} | SUNS`;
      case "create":
        return `Create new ${resourceName} | SUNS`;
      case "clone":
        return `#${params.id} Clone ${resourceName} | SUNS`;
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
            <DevtoolsProvider>
              <ConfirmDialog />
              <Refine
                dataProvider={dataProvider(API_BASE_URL)}
                notificationProvider={useNotificationProvider}
                i18nProvider={i18nProvider}
                routerProvider={routerBindings}
                resources={[
                  {
                    name: "dashboard",
                    list: "/",
                    meta: {
                      label: "Dashboard",
                      icon: <DashboardOutlined />,
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
                      icon: <TagsOutlined />,
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
                      icon: <LineOutlined />,
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
                      icon: <LineOutlined />,
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
                      icon: <LineOutlined />,
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
                      icon: <LineOutlined />,
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
                      icon: <LineOutlined />,
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
                      icon: <LineOutlined />,
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
                      icon: <LineOutlined />,
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

                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <ThemedLayoutV2
                        Header={() => <PosHeader sticky />}
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
                    <Route path="/point-of-sales">
                      <Route index element={<PointOfSales />} />
                      <Route path="tabs/:id"></Route>
                    </Route>
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler handler={titleHandler} />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
