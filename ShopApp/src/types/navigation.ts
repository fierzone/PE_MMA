import { Product } from './index';

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

// Customer tab navigation
export type CustomerTabParamList = {
    Store: undefined;
    Cart: undefined;
    Orders: undefined;
    Account: undefined;
};

// Admin tab navigation
export type AdminTabParamList = {
    Dashboard: undefined;
    Products: undefined;
    Customers: undefined;
    Analytics: undefined;
};

export type RootStackParamList = {
    Auth: undefined;
    Landing: undefined;
    CustomerTabs: undefined;
    AdminTabs: undefined;
    ProductDetail: { product: Product };
    ProductForm: { product?: Product };
    AdminProductList: undefined;
    AdminUserList: undefined;
    AdminOrderList: undefined;
    OrderHistory: undefined;
};
